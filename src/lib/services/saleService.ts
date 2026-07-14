import { Sale } from '@/lib/db/models/Sale';
import { Product } from '@/lib/db/models/Product';
import { Customer } from '@/lib/db/models/Customer';
import { ActivityLog } from '@/lib/db/models/ActivityLog';
import type { ISale, ISaleItem } from '@/lib/db/models/Sale';
import { decrementStock } from './productService';
import type { JWTPayload } from '@/types';

async function generateInvoiceNumber(prefix = 'INV'): Promise<string> {
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  const count = await Sale.countDocuments({
    createdAt: {
      $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
    },
  });
  return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
}

export interface CreateSaleInput {
  type: 'normal' | 'quick' | 'credit';
  items: ISaleItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  creditAmount: number;
  paymentMethod: 'cash' | 'upi' | 'card' | 'mixed' | 'credit';
  customerId?: string;
  customerName?: string;
  customerMobile?: string;
}

export async function createSale(input: CreateSaleInput, user: JWTPayload) {
  const invoiceNumber = await generateInvoiceNumber();

  const creditAmount = input.type === 'credit' || input.paymentMethod === 'credit'
    ? Math.max(0, input.totalAmount - input.paidAmount)
    : 0;

  const paymentStatus =
    creditAmount === 0 ? 'paid' :
    input.paidAmount > 0 ? 'partial' : 'credit';

  const sale = await Sale.create({
    invoiceNumber,
    type: input.type,
    items: input.items,
    subtotal: input.subtotal,
    taxAmount: input.taxAmount,
    discountAmount: input.discountAmount,
    totalAmount: input.totalAmount,
    paidAmount: input.paidAmount,
    creditAmount,
    paymentMethod: input.paymentMethod,
    paymentStatus,
    customerId: input.customerId || '',
    customerName: input.customerName || '',
    customerMobile: input.customerMobile || '',
    soldBy: user.userId,
    soldByName: user.name,
  });

  for (const item of input.items) {
    await decrementStock(item.productId, item.quantity);
  }

  if (input.customerId && input.type === 'credit') {
    await Customer.findByIdAndUpdate(input.customerId, {
      $inc: {
        totalPurchases: input.totalAmount,
        totalCredit: creditAmount,
        totalPaid: input.paidAmount,
        remainingBalance: creditAmount,
        creditBills: 1,
      },
      $set: {
        lastPurchaseDate: new Date(),
        creditStatus: creditAmount > 0 ? 'active' : 'settled',
      },
    });
  } else if (input.customerId) {
    await Customer.findByIdAndUpdate(input.customerId, {
      $inc: { totalPurchases: input.totalAmount },
      $set: { lastPurchaseDate: new Date() },
    });
  }

  await ActivityLog.create({
    action: 'sale_created',
    module: 'sales',
    description: `Sale ${invoiceNumber} created for ${input.totalAmount}`,
    performedBy: user.userId,
    performedByName: user.name,
    metadata: { saleId: sale._id.toString(), total: input.totalAmount },
  });

  return sale;
}

export async function getSales(filters?: { startDate?: Date; endDate?: Date; type?: string; customerId?: string }) {
  const query: Record<string, unknown> = {};
  if (filters?.startDate || filters?.endDate) {
    query.createdAt = {};
    if (filters.startDate) (query.createdAt as Record<string, unknown>).$gte = filters.startDate;
    if (filters.endDate) (query.createdAt as Record<string, unknown>).$lte = filters.endDate;
  }
  if (filters?.type && filters.type !== 'all') query.type = filters.type;
  if (filters?.customerId) query.customerId = filters.customerId;

  return Sale.find(query).sort({ createdAt: -1 }).lean();
}

export async function getSaleById(id: string) {
  return Sale.findById(id).lean();
}

export async function refundSale(saleId: string, reason: string, user: JWTPayload) {
  const sale = await Sale.findById(saleId);
  if (!sale) throw new Error('Sale not found');
  if (sale.paymentStatus === 'refunded') throw new Error('Sale already refunded');

  for (const item of sale.items) {
    await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
  }

  sale.paymentStatus = 'refunded';
  sale.refundAmount = sale.totalAmount;
  sale.refundReason = reason;
  sale.refundedBy = user.userId;
  sale.refundedAt = new Date();
  await sale.save();

  if (sale.customerId && sale.type === 'credit') {
    await Customer.findByIdAndUpdate(sale.customerId, {
      $inc: {
        remainingBalance: -sale.creditAmount,
        totalCredit: -sale.creditAmount,
        creditBills: -1,
      },
    });
  }

  await ActivityLog.create({
    action: 'sale_refunded',
    module: 'sales',
    description: `Sale ${sale.invoiceNumber} refunded: ${reason}`,
    performedBy: user.userId,
    performedByName: user.name,
    metadata: { saleId, refundAmount: sale.refundAmount },
  });

  return sale;
}
