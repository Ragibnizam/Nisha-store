import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { Sale } from '@/lib/db/models/Sale';
import { Product } from '@/lib/db/models/Product';
import { requireAuth } from '@/lib/auth/middleware';
import { getStartOfDay, getEndOfDay } from '@/lib/utils/date';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if ('error' in auth) return auth.error;

  try {
    await connectDB();
    const url = new URL(req.url);
    const dateStr = url.searchParams.get('date');
    const date = dateStr ? new Date(dateStr) : new Date();

    const sales = await Sale.find({
      createdAt: { $gte: getStartOfDay(date), $lte: getEndOfDay(date) },
      paymentStatus: { $ne: 'refunded' },
    }).lean();

    let revenue = 0;
    let cost = 0;
    const productIds = new Set<string>();
    for (const sale of sales) {
      revenue += sale.totalAmount;
      for (const item of sale.items) {
        productIds.add(item.productId);
      }
    }

    const products = await Product.find({ _id: { $in: Array.from(productIds) } }).lean();
    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    for (const sale of sales) {
      for (const item of sale.items) {
        const product = productMap.get(item.productId);
        if (product) {
          cost += product.purchasePrice * item.quantity;
        }
      }
    }

    return NextResponse.json({
      data: {
        date,
        revenue,
        cost,
        profit: revenue - cost,
        transactionCount: sales.length,
        sales,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to generate profit report' }, { status: 500 });
  }
}
