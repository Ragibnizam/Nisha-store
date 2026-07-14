import { Schema, model, Document } from 'mongoose';

export interface ISaleItem {
  productId: string;
  name: string;
  barcode: string;
  price: number;
  quantity: number;
  total: number;
  gstRate: number;
}

export type SaleType = 'normal' | 'quick' | 'credit';
export type PaymentMethod = 'cash' | 'upi' | 'card' | 'mixed' | 'credit';
export type PaymentStatus = 'paid' | 'partial' | 'credit' | 'refunded';

export interface ISale extends Document {
  invoiceNumber: string;
  type: SaleType;
  items: ISaleItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  creditAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  customerId?: string;
  customerName?: string;
  customerMobile?: string;
  refundAmount: number;
  refundReason?: string;
  refundedBy?: string;
  refundedAt?: Date;
  soldBy: string;
  soldByName: string;
  createdAt: Date;
  updatedAt: Date;
}

const saleItemSchema = new Schema<ISaleItem>({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  barcode: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  total: { type: Number, required: true, min: 0 },
  gstRate: { type: Number, default: 0, min: 0 },
});

const saleSchema = new Schema<ISale>(
  {
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: ['normal', 'quick', 'credit'], default: 'normal' },
    items: [saleItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    creditAmount: { type: Number, default: 0, min: 0 },
    paymentMethod: { type: String, enum: ['cash', 'upi', 'card', 'mixed', 'credit'], default: 'cash' },
    paymentStatus: { type: String, enum: ['paid', 'partial', 'credit', 'refunded'], default: 'paid' },
    customerId: { type: String, default: '' },
    customerName: { type: String, default: '' },
    customerMobile: { type: String, default: '' },
    refundAmount: { type: Number, default: 0, min: 0 },
    refundReason: { type: String, default: '' },
    refundedBy: { type: String, default: '' },
    refundedAt: { type: Date },
    soldBy: { type: String, required: true },
    soldByName: { type: String, required: true },
  },
  { timestamps: true }
);

saleSchema.index({ createdAt: -1 });
saleSchema.index({ customerId: 1 });
saleSchema.index({ type: 1 });

export const Sale = model<ISale>('Sale', saleSchema);
