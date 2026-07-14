import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { refundSale } from '@/lib/services/saleService';
import { requireAuth } from '@/lib/auth/middleware';

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, ['admin']);
  if ('error' in auth) return auth.error;

  try {
    await connectDB();
    const { saleId, reason } = await req.json();
    if (!saleId || !reason) {
      return NextResponse.json({ error: 'Sale ID and reason are required' }, { status: 400 });
    }

    const sale = await refundSale(saleId, reason, auth.user);
    return NextResponse.json({ data: sale, message: 'Sale refunded' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process refund';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
