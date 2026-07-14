import { Sale } from '@/lib/db/models/Sale';
import { CreditPayment } from '@/lib/db/models/CreditPayment';
import { Customer } from '@/lib/db/models/Customer';
import { ActivityLog } from '@/lib/db/models/ActivityLog';
import type { JWTPayload, CreditSummary, LedgerEntry } from '@/types';

export async function getCreditSummaries(): Promise<CreditSummary[]> {
  const customers = await Customer.find({ creditStatus: { $ne: 'none' } })
    .sort({ remainingBalance: -1 })
    .lean();

  return customers.map((c) => ({
    customerId: c._id.toString(),
    customerName: c.name,
    customerMobile: c.mobile,
    totalPurchases: c.totalPurchases,
    totalCredit: c.totalCredit,
    totalPaid: c.totalPaid,
    remainingBalance: c.remainingBalance,
    lastPaymentDate: c.lastPaymentDate || null,
    lastPurchaseDate: c.lastPurchaseDate || null,
    creditBills: c.creditBills,
    creditStatus: c.creditStatus as 'none' | 'active' | 'settled',
  }));
}

export async function getCustomerLedger(customerId: string): Promise<LedgerEntry[]> {
  const customer = await Customer.findById(customerId).lean();
  if (!customer) throw new Error('Customer not found');

  const sales = await Sale.find({ customerId, type: 'credit' }).sort({ createdAt: 1 }).lean();
  const payments = await CreditPayment.find({ customerId }).sort({ createdAt: 1 }).lean();

  const entries: Array<{ date: Date; type: 'sale' | 'payment'; invoiceNumber: string; description: string; debit: number; credit: number }> = [];

  for (const s of sales) {
    entries.push({
      date: s.createdAt,
      type: 'sale',
      invoiceNumber: s.invoiceNumber,
      description: `Credit Sale - ${s.items.length} items`,
      debit: s.creditAmount,
      credit: s.paidAmount,
    });
  }

  for (const p of payments) {
    entries.push({
      date: p.createdAt,
      type: 'payment',
      invoiceNumber: p.invoiceNumber,
      description: `Payment received (${p.paymentMethod})`,
      debit: 0,
      credit: p.paymentAmount,
    });
  }

  entries.sort((a, b) => a.date.getTime() - b.date.getTime());

  let balance = 0;
  return entries.map((e) => {
    balance += e.debit - e.credit;
    return {
      ...e,
      balance: Math.max(0, balance),
    };
  });
}

export async function recordPayment(
  customerId: string,
  saleId: string,
  paymentAmount: number,
  paymentMethod: string,
  note: string,
  user: JWTPayload
) {
  const sale = await Sale.findById(saleId);
  if (!sale) throw new Error('Sale not found');

  const customer = await Customer.findById(customerId);
  if (!customer) throw new Error('Customer not found');

  const newRemaining = Math.max(0, customer.remainingBalance - paymentAmount);

  const payment = await CreditPayment.create({
    customerId,
    customerName: customer.name,
    customerMobile: customer.mobile,
    saleId,
    invoiceNumber: sale.invoiceNumber,
    paymentAmount,
    paymentMethod,
    remainingAfterPayment: newRemaining,
    paidBy: user.userId,
    paidByName: user.name,
    note,
  });

  sale.paidAmount += paymentAmount;
  sale.creditAmount = Math.max(0, sale.creditAmount - paymentAmount);
  sale.paymentStatus = sale.creditAmount === 0 ? 'paid' : 'partial';
  await sale.save();

  customer.totalPaid += paymentAmount;
  customer.remainingBalance = newRemaining;
  customer.lastPaymentDate = new Date();
  customer.creditStatus = newRemaining === 0 ? 'settled' : 'active';
  await customer.save();

  await ActivityLog.create({
    action: 'credit_payment',
    module: 'credit',
    description: `Payment of ${paymentAmount} received from ${customer.name}`,
    performedBy: user.userId,
    performedByName: user.name,
    metadata: { paymentId: payment._id.toString(), customerId, amount: paymentAmount },
  });

  return payment;
}
