import { Purchase } from '@/lib/db/models/Purchase';
import { Product } from '@/lib/db/models/Product';
import { ActivityLog } from '@/lib/db/models/ActivityLog';
import type { JWTPayload } from '@/types';

async function generatePurchaseInvoiceNumber(prefix = 'PUR'): Promise<string> {
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  const count = await Purchase.countDocuments({
    createdAt: {
      $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
    },
  });
  return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
}

export interface CreatePurchaseInput {
  supplierName: string;
  supplierMobile?: string;
  items: Array<{
    productId: string;
    name: string;
    barcode: string;
    purchasePrice: number;
    quantity: number;
    total: number;
  }>;
  totalAmount: number;
  paymentMethod: string;
  note?: string;
}

export async function createPurchase(input: CreatePurchaseInput, user: JWTPayload) {
  const invoiceNumber = await generatePurchaseInvoiceNumber();

  const purchase = await Purchase.create({
    invoiceNumber,
    supplierName: input.supplierName,
    supplierMobile: input.supplierMobile || '',
    items: input.items,
    totalAmount: input.totalAmount,
    paymentMethod: input.paymentMethod,
    note: input.note || '',
    purchasedBy: user.userId,
    purchasedByName: user.name,
  });

  for (const item of input.items) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: item.quantity },
      $set: { purchasePrice: item.purchasePrice },
    });
  }

  await ActivityLog.create({
    action: 'purchase_created',
    module: 'purchases',
    description: `Purchase ${invoiceNumber} created from ${input.supplierName}`,
    performedBy: user.userId,
    performedByName: user.name,
    metadata: { purchaseId: purchase._id.toString(), total: input.totalAmount },
  });

  return purchase;
}

export async function getPurchases() {
  return Purchase.find().sort({ createdAt: -1 }).lean();
}

export async function getPurchaseById(id: string) {
  return Purchase.findById(id).lean();
}
