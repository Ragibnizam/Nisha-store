import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  barcode: z.string().min(1, 'Barcode is required'),
  category: z.string().default('General'),
  unit: z.string().default('pcs'),
  purchasePrice: z.coerce.number().min(0, 'Purchase price must be >= 0'),
  salePrice: z.coerce.number().min(0, 'Sale price must be >= 0'),
  mrp: z.coerce.number().min(0).default(0),
  stock: z.coerce.number().min(0).default(0),
  minStock: z.coerce.number().min(0).default(5),
  gstRate: z.coerce.number().min(0).max(100).default(0),
  image: z.string().default(''),
  imagePublicId: z.string().default(''),
  expiryDate: z.string().optional().or(z.literal('')),
  batchNumber: z.string().default(''),
  description: z.string().default(''),
  active: z.boolean().default(true),
});

export type ProductFormValues = z.infer<typeof productSchema>;
