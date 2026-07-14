import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { Product } from '@/lib/db/models/Product';
import { getAllProducts, createProduct } from '@/lib/services/productService';
import { requireAuth } from '@/lib/auth/middleware';
import { productSchema } from '@/lib/validations/productSchema';
import type { IProduct } from '@/lib/db/models/Product';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if ('error' in auth) return auth.error;

  try {
    await connectDB();
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || undefined;
    const category = url.searchParams.get('category') || undefined;
    const lowStock = url.searchParams.get('lowStock') === 'true';

    const products = await getAllProducts({ search, category, lowStock });
    return NextResponse.json({ data: products });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, ['admin']);
  if ('error' in auth) return auth.error;

  try {
    await connectDB();
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message || 'Invalid input' }, { status: 400 });
    }

    const data: Record<string, unknown> = { ...parsed.data };
    if (data.expiryDate) {
      data.expiryDate = new Date(data.expiryDate as string);
    }

    if (data.barcode) {
      const existing = await Product.findOne({ barcode: data.barcode });
      if (existing) {
        return NextResponse.json({ error: 'Barcode already exists' }, { status: 409 });
      }
    }

    const product = await createProduct(data as Partial<IProduct>);
    return NextResponse.json({ data: product, message: 'Product created' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
