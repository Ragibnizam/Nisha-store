import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { getPurchaseById } from '@/lib/services/purchaseService';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if ('error' in auth) return auth.error;

  try {
    await connectDB();
    const { id } = await ctx.params;
    const purchase = await getPurchaseById(id);
    if (!purchase) return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    return NextResponse.json({ data: purchase });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch purchase' }, { status: 500 });
  }
}
