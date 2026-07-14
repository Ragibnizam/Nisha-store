import { z } from 'zod';

export const saleItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  barcode: z.string().min(1),
  price: z.coerce.number().min(0),
  quantity: z.coerce.number().min(1),
  total: z.coerce.number().min(0),
  gstRate: z.coerce.number().min(0).default(0),
});

export const saleSchema = z.object({
  type: z.enum(['normal', 'quick', 'credit']),
  items: z.array(saleItemSchema).min(1, 'At least one item required'),
  subtotal: z.coerce.number().min(0),
  taxAmount: z.coerce.number().min(0).default(0),
  discountAmount: z.coerce.number().min(0).default(0),
  totalAmount: z.coerce.number().min(0),
  paidAmount: z.coerce.number().min(0),
  creditAmount: z.coerce.number().min(0).default(0),
  paymentMethod: z.enum(['cash', 'upi', 'card', 'mixed', 'credit']),
  customerId: z.string().optional().or(z.literal('')),
  customerName: z.string().optional().or(z.literal('')),
  customerMobile: z.string().optional().or(z.literal('')),
});

export type SaleFormValues = z.infer<typeof saleSchema>;
