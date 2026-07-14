import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  mobile: z.string().min(10, 'Valid mobile number required').max(15),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
