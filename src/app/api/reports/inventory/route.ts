import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { Product } from '@/lib/db/models/Product';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if ('error' in auth) return auth.error;

  try {
    await connectDB();
    const products = await Product.find({ active: true }).lean();

    const totalStockValue = products.reduce((s, p) => s + p.stock * p.purchasePrice, 0);
    const totalRetailValue = products.reduce((s, p) => s + p.stock * p.salePrice, 0);
    const lowStock = products.filter(p => p.stock <= p.minStock);
    const outOfStock = products.filter(p => p.stock === 0);

    return NextResponse.json({
      data: {
        totalProducts: products.length,
        totalStockValue,
        totalRetailValue,
        potentialProfit: totalRetailValue - totalStockValue,
        lowStock,
        outOfStock,
        products,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to generate inventory report' }, { status: 500 });
  }
}
