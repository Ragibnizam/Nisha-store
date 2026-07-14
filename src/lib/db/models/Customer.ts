import { Schema, model, Document } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  mobile: string;
  email?: string;
  address?: string;
  totalPurchases: number;
  totalCredit: number;
  totalPaid: number;
  remainingBalance: number;
  lastPurchaseDate?: Date;
  lastPaymentDate?: Date;
  creditBills: number;
  creditStatus: 'none' | 'active' | 'settled';
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true, trim: true, index: 'text' },
    mobile: { type: String, required: true, trim: true, index: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, default: '', trim: true },
    totalPurchases: { type: Number, default: 0, min: 0 },
    totalCredit: { type: Number, default: 0, min: 0 },
    totalPaid: { type: Number, default: 0, min: 0 },
    remainingBalance: { type: Number, default: 0, min: 0 },
    lastPurchaseDate: { type: Date },
    lastPaymentDate: { type: Date },
    creditBills: { type: Number, default: 0, min: 0 },
    creditStatus: { type: String, enum: ['none', 'active', 'settled'], default: 'none' },
  },
  { timestamps: true }
);

customerSchema.index({ mobile: 1, name: 1 });

export const Customer = model<ICustomer>('Customer', customerSchema);
