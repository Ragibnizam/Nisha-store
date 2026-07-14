import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { getAllProducts } from '@/lib/services/productService';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if ('error' in auth) return auth.error;

  try {
    await connectDB();
    const url = new URL(req.url);
    const q = url.searchParams.get('q') || '';
    const products = await getAllProducts({ search: q });
    return NextResponse.json({ data: products });
  } catch {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
