export const SALE_TYPES = {
  NORMAL: 'normal' as const,
  QUICK: 'quick' as const,
  CREDIT: 'credit' as const,
};

export type SaleType = typeof SALE_TYPES[keyof typeof SALE_TYPES];

export const SALE_TYPE_LABELS: Record<string, string> = {
  normal: 'With Bill',
  quick: 'Quick Sale',
  credit: 'Credit Sale',
};

export const PAYMENT_STATUS = {
  PAID: 'paid' as const,
  PARTIAL: 'partial' as const,
  CREDIT: 'credit' as const,
  REFUNDED: 'refunded' as const,
};

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  paid: 'Paid',
  partial: 'Partial Payment',
  credit: 'Credit',
  refunded: 'Refunded',
};
