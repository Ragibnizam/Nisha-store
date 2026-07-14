import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { getPurchases, createPurchase } from '@/lib/services/purchaseService';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if ('error' in auth) return auth.error;

  try {
    await connectDB();
    const purchases = await getPurchases();
    return NextResponse.json({ data: purchases });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch purchases' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, ['admin']);
  if ('error' in auth) return auth.error;

  try {
    await connectDB();
    const body = await req.json();
    const purchase = await createPurchase(body, auth.user);
    return NextResponse.json({ data: purchase, message: 'Purchase recorded' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create purchase' }, { status: 500 });
  }
}
