import { z } from 'zod';

export const creditPaymentSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  saleId: z.string().min(1, 'Sale is required'),
  paymentAmount: z.coerce.number().min(1, 'Payment amount must be > 0'),
  paymentMethod: z.enum(['cash', 'upi', 'card']),
  note: z.string().optional().or(z.literal('')),
});

export type CreditPaymentFormValues = z.infer<typeof creditPaymentSchema>;
