import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { recordPayment } from '@/lib/services/creditService';
import { requireAuth } from '@/lib/auth/middleware';
import { creditPaymentSchema } from '@/lib/validations/creditPaymentSchema';

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if ('error' in auth) return auth.error;

  try {
    await connectDB();
    const body = await req.json();
    const parsed = creditPaymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message || 'Invalid input' }, { status: 400 });
    }

    const payment = await recordPayment(
      parsed.data.customerId,
      parsed.data.saleId,
      parsed.data.paymentAmount,
      parsed.data.paymentMethod,
      parsed.data.note || '',
      auth.user
    );
    return NextResponse.json({ data: payment, message: 'Payment recorded' }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to record payment';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
