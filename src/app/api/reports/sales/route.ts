import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { Sale } from '@/lib/db/models/Sale';
import { Product } from '@/lib/db/models/Product';
import { requireAuth } from '@/lib/auth/middleware';
import { getStartOfDay, getEndOfDay, getStartOfMonth, getEndOfMonth } from '@/lib/utils/date';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if ('error' in auth) return auth.error;

  try {
    await connectDB();
    const url = new URL(req.url);
    const startDateStr = url.searchParams.get('startDate');
    const endDateStr = url.searchParams.get('endDate');

    let startDate: Date, endDate: Date;
    if (startDateStr && endDateStr) {
      startDate = getStartOfDay(new Date(startDateStr));
      endDate = getEndOfDay(new Date(endDateStr));
    } else {
      startDate = getStartOfMonth();
      endDate = getEndOfMonth();
    }

    const sales = await Sale.find({
      createdAt: { $gte: startDate, $lte: endDate },
      paymentStatus: { $ne: 'refunded' },
    }).lean();

    const totalSales = sales.reduce((s, sale) => s + sale.totalAmount, 0);
    const totalTax = sales.reduce((s, sale) => s + sale.taxAmount, 0);
    const totalDiscount = sales.reduce((s, sale) => s + sale.discountAmount, 0);
    const totalCredit = sales.filter(s => s.type === 'credit').reduce((s, sale) => s + sale.creditAmount, 0);
    const totalPaid = sales.reduce((s, sale) => s + sale.paidAmount, 0);

    const productSales = new Map<string, { name: string; quantity: number; total: number }>();
    for (const sale of sales) {
      for (const item of sale.items) {
        const existing = productSales.get(item.productId) || { name: item.name, quantity: 0, total: 0 };
        existing.quantity += item.quantity;
        existing.total += item.total;
        productSales.set(item.productId, existing);
      }
    }

    const topProducts = Array.from(productSales.entries())
      .map(([id, data]) => ({ productId: id, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 20);

    return NextResponse.json({
      data: {
        totalSales,
        totalTax,
        totalDiscount,
        totalCredit,
        totalPaid,
        transactionCount: sales.length,
        topProducts,
        sales,
        startDate,
        endDate,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
