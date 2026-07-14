import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { getProductByBarcode } from '@/lib/services/productService';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(req: NextRequest, ctx: { params: Promise<{ barcode: string }> }) {
  const auth = requireAuth(req);
  if ('error' in auth) return auth.error;

  try {
    await connectDB();
    const { barcode } = await ctx.params;
    const product = await getProductByBarcode(barcode);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json({ data: product });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
