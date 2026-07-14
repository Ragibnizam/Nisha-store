export const PAYMENT_METHODS = {
  CASH: 'cash' as const,
  UPI: 'upi' as const,
  CARD: 'card' as const,
  MIXED: 'mixed' as const,
  CREDIT: 'credit' as const,
};

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Cash',
  upi: 'UPI',
  card: 'Card',
  mixed: 'Mixed',
  credit: 'Credit (Udhar)',
};

export const QUICK_SALE_METHODS = ['cash', 'upi', 'card', 'mixed'] as const;
export const BILL_SALE_METHODS = ['cash', 'upi', 'card', 'mixed', 'credit'] as const;
