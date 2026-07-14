import { Schema, model, Document } from 'mongoose';

export interface IPurchaseItem {
  productId: string;
  name: string;
  barcode: string;
  purchasePrice: number;
  quantity: number;
  total: number;
}

export interface IPurchase extends Document {
  invoiceNumber: string;
  supplierName: string;
  supplierMobile?: string;
  items: IPurchaseItem[];
  totalAmount: number;
  paymentMethod: string;
  note?: string;
  purchasedBy: string;
  purchasedByName: string;
  createdAt: Date;
  updatedAt: Date;
}

const purchaseItemSchema = new Schema<IPurchaseItem>({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  barcode: { type: String, required: true },
  purchasePrice: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  total: { type: Number, required: true, min: 0 },
});

const purchaseSchema = new Schema<IPurchase>(
  {
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    supplierName: { type: String, required: true, trim: true },
    supplierMobile: { type: String, default: '', trim: true },
    items: [purchaseItemSchema],
    totalAmount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, default: 'cash' },
    note: { type: String, default: '' },
    purchasedBy: { type: String, required: true },
    purchasedByName: { type: String, required: true },
  },
  { timestamps: true }
);

purchaseSchema.index({ createdAt: -1 });

export const Purchase = model<IPurchase>('Purchase', purchaseSchema);
