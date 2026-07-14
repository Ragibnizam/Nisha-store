import { Schema, model, Document } from 'mongoose';

export interface ICreditPayment extends Document {
  customerId: string;
  customerName: string;
  customerMobile: string;
  saleId: string;
  invoiceNumber: string;
  paymentAmount: number;
  paymentMethod: string;
  remainingAfterPayment: number;
  paidBy: string;
  paidByName: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const creditPaymentSchema = new Schema<ICreditPayment>(
  {
    customerId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    customerMobile: { type: String, required: true },
    saleId: { type: String, required: true },
    invoiceNumber: { type: String, required: true },
    paymentAmount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, default: 'cash' },
    remainingAfterPayment: { type: Number, default: 0, min: 0 },
    paidBy: { type: String, required: true },
    paidByName: { type: String, required: true },
    note: { type: String, default: '' },
  },
  { timestamps: true }
);

creditPaymentSchema.index({ customerId: 1, createdAt: -1 });

export const CreditPayment = model<ICreditPayment>('CreditPayment', creditPaymentSchema);
