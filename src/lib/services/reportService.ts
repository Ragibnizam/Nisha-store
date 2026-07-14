import { Sale } from '@/lib/db/models/Sale';
import { Product } from '@/lib/db/models/Product';
import { Customer } from '@/lib/db/models/Customer';
import { getStartOfDay, getEndOfDay, getStartOfMonth, getEndOfMonth } from '@/lib/utils/date';
import type { DashboardStats } from '@/types';

export async function getDashboardStats(): Promise<DashboardStats> {
  const todayStart = getStartOfDay();
  const todayEnd = getEndOfDay();
  const monthStart = getStartOfMonth();
  const monthEnd = getEndOfMonth();

  const [
    todaySalesAgg,
    todayCountAgg,
    monthSalesAgg,
    totalProducts,
    lowStockCount,
    totalCustomers,
    outstandingCreditAgg,
  ] = await Promise.all([
    Sale.aggregate([
      { $match: { createdAt: { $gte: todayStart, $lte: todayEnd }, paymentStatus: { $ne: 'refunded' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Sale.countDocuments({ createdAt: { $gte: todayStart, $lte: todayEnd }, paymentStatus: { $ne: 'refunded' } }),
    Sale.aggregate([
      { $match: { createdAt: { $gte: monthStart, $lte: monthEnd }, paymentStatus: { $ne: 'refunded' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Product.countDocuments({ active: true }),
    Product.countDocuments({ active: true, $expr: { $lte: ['$stock', '$minStock'] } }),
    Customer.countDocuments(),
    Customer.aggregate([
      { $match: { remainingBalance: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$remainingBalance' } } },
    ]),
  ]);

  const todayProfitAgg = await Sale.aggregate([
    {
      $match: { createdAt: { $gte: todayStart, $lte: todayEnd }, paymentStatus: { $ne: 'refunded' } },
    },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.productId',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: null,
        profit: {
          $sum: {
            $multiply: [
              { $subtract: ['$items.price', { $ifNull: ['$product.purchasePrice', 0] }] },
              '$items.quantity',
            ],
          },
        },
      },
    },
  ]);

  return {
    todaySales: todaySalesAgg[0]?.total || 0,
    todayTransactions: todayCountAgg,
    totalProducts,
    lowStockCount,
    totalCustomers,
    outstandingCredit: outstandingCreditAgg[0]?.total || 0,
    todayProfit: todayProfitAgg[0]?.profit || 0,
    monthSales: monthSalesAgg[0]?.total || 0,
  };
}

export async function getRecentSales(limit = 5) {
  return Sale.find({ paymentStatus: { $ne: 'refunded' } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

export async function getSalesChartData(days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (days - 1));
  startDate.setHours(0, 0, 0, 0);

  return Sale.aggregate([
    { $match: { createdAt: { $gte: startDate }, paymentStatus: { $ne: 'refunded' } } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        total: { $sum: '$totalAmount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
}

export async function getLowStockProducts() {
  return Product.find({ active: true, $expr: { $lte: ['$stock', '$minStock'] } })
    .sort({ stock: 1 })
    .lean();
}

export async function getRecentActivity(limit = 10) {
  const { ActivityLog } = await import('@/lib/db/models/ActivityLog');
  return ActivityLog.find().sort({ createdAt: -1 }).limit(limit).lean();
}
