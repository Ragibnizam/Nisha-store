import { Schema, model, Document } from 'mongoose';

export interface ISettings extends Document {
  storeName: string;
  storeAddress: string;
  storeMobile: string;
  storeEmail: string;
  gstNumber: string;
  currency: string;
  taxRate: number;
  lowStockThreshold: number;
  barcodePrefix: string;
  invoicePrefix: string;
  footerNote: string;
  printPaperSize: 'thermal' | 'a4';
  enableGst: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    storeName: { type: String, default: 'Nisha Store' },
    storeAddress: { type: String, default: '' },
    storeMobile: { type: String, default: '' },
    storeEmail: { type: String, default: '' },
    gstNumber: { type: String, default: '' },
    currency: { type: String, default: '₹' },
    taxRate: { type: Number, default: 0, min: 0, max: 100 },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
    barcodePrefix: { type: String, default: 'NS' },
    invoicePrefix: { type: String, default: 'INV' },
    footerNote: { type: String, default: 'Thank you for shopping with us!' },
    printPaperSize: { type: String, enum: ['thermal', 'a4'], default: 'thermal' },
    enableGst: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Settings = model<ISettings>('Settings', settingsSchema);
