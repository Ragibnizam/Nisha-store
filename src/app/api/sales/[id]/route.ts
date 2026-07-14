import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { getSaleById } from '@/lib/services/saleService';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if ('error' in auth) return auth.error;

  try {
    await connectDB();
    const { id } = await ctx.params;
    const sale = await getSaleById(id);
    if (!sale) return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    return NextResponse.json({ data: sale });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch sale' }, { status: 500 });
  }
}
