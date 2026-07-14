'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate as formatDateString } from '@/lib/utils/date';
import { TrendingUp, ShoppingCart, Package, AlertTriangle, Users, CreditCard, IndianRupee, Receipt } from 'lucide-react';
import Link from 'next/link';
import type { DashboardStats } from '@/types';
import type { ISale } from '@/lib/db/models/Sale';

interface DashboardData {
  stats: DashboardStats;
  recentSales: (ISale & { _id: string })[];
  chartData: Array<{ _id: string; total: number; count: number }>;
  lowStock: Array<{ _id: string; name: string; stock: number; minStock: number }>;
  recentActivity: Array<{ _id: string; action: string; description: string; performedByName: string; createdAt: string }>;
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => apiClient.get('/dashboard'),
  });

  if (isLoading) return <LoadingSpinner text="Loading dashboard..." />;

  if (!data) return <EmptyState title="No data available" />;

  const { stats, recentSales, chartData, lowStock, recentActivity } = data;

  const statCards = [
    { label: "Today's Sales", value: formatCurrency(stats.todaySales), icon: IndianRupee, color: 'text-primary' },
    { label: "Today's Profit", value: formatCurrency(stats.todayProfit), icon: TrendingUp, color: 'text-success' },
    { label: 'Transactions', value: stats.todayTransactions.toString(), icon: ShoppingCart, color: 'text-primary' },
    { label: 'Month Sales', value: formatCurrency(stats.monthSales), icon: Receipt, color: 'text-primary' },
    { label: 'Products', value: stats.totalProducts.toString(), icon: Package, color: 'text-primary' },
    { label: 'Low Stock', value: stats.lowStockCount.toString(), icon: AlertTriangle, color: 'text-warning' },
    { label: 'Customers', value: stats.totalCustomers.toString(), icon: Users, color: 'text-primary' },
    { label: 'Outstanding Credit', value: formatCurrency(stats.outstandingCredit), icon: CreditCard, color: 'text-destructive' },
  ];

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">{formatDateString(new Date(), 'long')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 text-lg font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sales Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Last 7 Days Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-end justify-between gap-2">
            {chartData.map((entry) => {
              const max = Math.max(...chartData.map((e) => e.total), 1);
              const height = (entry.total / max) * 100;
              return (
                <div key={entry._id} className="flex flex-1 flex-col items-center gap-1">
                  <div className="text-xs font-medium">{formatCurrency(entry.total)}</div>
                  <div className="w-full rounded-t bg-primary transition-all" style={{ height: `${Math.max(height, 2)}%` }} />
                  <div className="text-xs text-muted-foreground">{entry._id.slice(5)}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            {recentSales.length === 0 ? (
              <EmptyState title="No recent sales" />
            ) : (
              <div className="space-y-2">
                {recentSales.map((sale) => (
                  <Link
                    key={sale._id}
                    href={`/sales/${sale._id}`}
                    className="flex items-center justify-between rounded-md p-2 hover:bg-accent"
                  >
                    <div>
                      <p className="text-sm font-medium">{sale.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">{sale.items.length} items</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatCurrency(sale.totalAmount)}</p>
                      <Badge variant={sale.paymentStatus === 'paid' ? 'success' : 'warning'} className="text-xs">
                        {sale.paymentStatus}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <EmptyState title="All products well stocked" icon={Package} />
            ) : (
              <div className="space-y-2">
                {lowStock.slice(0, 5).map((product) => (
                  <Link
                    key={product._id}
                    href={`/products/${product._id}`}
                    className="flex items-center justify-between rounded-md p-2 hover:bg-accent"
                  >
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">Min: {product.minStock}</p>
                    </div>
                    <Badge variant={product.stock === 0 ? 'destructive' : 'warning'}>
                      {product.stock} left
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentActivity.map((log) => (
                <div key={log._id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{log.description}</span>
                    <span className="ml-2 text-xs text-muted-foreground">by {log.performedByName}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDateString(log.createdAt, 'datetime')}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
