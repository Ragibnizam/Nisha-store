import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { getDashboardStats, getRecentSales, getSalesChartData, getLowStockProducts, getRecentActivity } from '@/lib/services/reportService';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if ('error' in auth) return auth.error;

  try {
    await connectDB();
    const [stats, recentSales, chartData, lowStock, recentActivity] = await Promise.all([
      getDashboardStats(),
      getRecentSales(5),
      getSalesChartData(7),
      getLowStockProducts(),
      getRecentActivity(10),
    ]);

    return NextResponse.json({
      data: { stats, recentSales, chartData, lowStock, recentActivity },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
