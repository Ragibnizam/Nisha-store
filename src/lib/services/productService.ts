import { Product } from '@/lib/db/models/Product';
import { generateBarcode } from '@/lib/utils/barcode';
import type { IProduct } from '@/lib/db/models/Product';

export async function getAllProducts(filters?: { search?: string; category?: string; lowStock?: boolean }) {
  const query: Record<string, unknown> = { active: true };

  if (filters?.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { barcode: { $regex: filters.search, $options: 'i' } },
    ];
  }
  if (filters?.category && filters.category !== 'all') {
    query.category = filters.category;
  }
  if (filters?.lowStock) {
    query.$expr = { $lte: ['$stock', '$minStock'] };
  }

  return Product.find(query).sort({ name: 1 }).lean();
}

export async function getProductById(id: string) {
  return Product.findById(id).lean();
}

export async function getProductByBarcode(barcode: string) {
  return Product.findOne({ barcode, active: true }).lean();
}

export async function createProduct(data: Partial<IProduct>) {
  if (!data.barcode) {
    data.barcode = generateBarcode();
  }
  return Product.create(data);
}

export async function updateProduct(id: string, data: Partial<IProduct>) {
  return Product.findByIdAndUpdate(id, data, { new: true }).lean();
}

export async function deleteProduct(id: string) {
  return Product.findByIdAndUpdate(id, { active: false }, { new: true }).lean();
}

export async function getCategories() {
  return Product.distinct('category');
}

export async function decrementStock(productId: string, quantity: number) {
  return Product.findByIdAndUpdate(
    productId,
    { $inc: { stock: -quantity } },
    { new: true }
  ).lean();
}

export async function incrementStock(productId: string, quantity: number) {
  return Product.findByIdAndUpdate(
    productId,
    { $inc: { stock: quantity } },
    { new: true }
  ).lean();
}
