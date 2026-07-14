'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrency } from '@/lib/utils/currency';
import { getStartOfMonth, getEndOfMonth, formatDate } from '@/lib/utils/date';
import { BarChart3, Download } from 'lucide-react';

interface SalesReport {
  totalSales: number;
  totalTax: number;
  totalDiscount: number;
  totalCredit: number;
  totalPaid: number;
  transactionCount: number;
  topProducts: Array<{ productId: string; name: string; quantity: number; total: number }>;
  sales: Array<{ _id: string; invoiceNumber: string; totalAmount: number; createdAt: string }>;
  startDate: string;
  endDate: string;
}

export default function DailyReportPage() {
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const { data, isLoading } = useQuery<SalesReport>({
    queryKey: ['report-sales', startDate, endDate],
    queryFn: () => apiClient.get(`/reports/sales?startDate=${startDate}&endDate=${endDate}`),
  });

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-bold">Sales Report</h1>
        <p className="text-sm text-muted-foreground">View sales performance by date range</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <LoadingSpinner text="Generating report..." />
      ) : !data ? (
        <EmptyState icon={BarChart3} title="No data" />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Sales</p><p className="mt-1 text-lg font-bold">{formatCurrency(data.totalSales)}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Transactions</p><p className="mt-1 text-lg font-bold">{data.transactionCount}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Paid</p><p className="mt-1 text-lg font-bold text-success">{formatCurrency(data.totalPaid)}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Credit</p><p className="mt-1 text-lg font-bold text-warning">{formatCurrency(data.totalCredit)}</p></CardContent></Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Top Products</CardTitle></CardHeader>
            <CardContent className="p-0">
              {data.topProducts.length === 0 ? (
                <EmptyState title="No products sold in this period" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-center">Quantity Sold</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.topProducts.map((p) => (
                      <TableRow key={p.productId}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="text-center">{p.quantity}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(p.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
