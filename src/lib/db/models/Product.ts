import { Schema, model, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  barcode: string;
  category: string;
  unit: string;
  purchasePrice: number;
  salePrice: number;
  mrp: number;
  stock: number;
  minStock: number;
  gstRate: number;
  image: string;
  imagePublicId?: string;
  expiryDate?: Date;
  batchNumber?: string;
  description?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, index: 'text' },
    barcode: { type: String, required: true, unique: true, trim: true, index: true },
    category: { type: String, default: 'General', trim: true, index: true },
    unit: { type: String, default: 'pcs', trim: true },
    purchasePrice: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, required: true, min: 0 },
    mrp: { type: Number, min: 0, default: 0 },
    stock: { type: Number, default: 0, min: 0 },
    minStock: { type: Number, default: 5, min: 0 },
    gstRate: { type: Number, default: 0, min: 0, max: 100 },
    image: { type: String, default: '' },
    imagePublicId: { type: String, default: '' },
    expiryDate: { type: Date },
    batchNumber: { type: String, default: '' },
    description: { type: String, default: '' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ name: 1, barcode: 1 });
productSchema.index({ category: 1 });

export const Product = model<IProduct>('Product', productSchema);
