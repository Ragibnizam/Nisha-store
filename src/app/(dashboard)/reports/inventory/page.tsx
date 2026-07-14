'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrency } from '@/lib/utils/currency';
import { Package, AlertTriangle, TrendingUp } from 'lucide-react';

interface InventoryReport {
  totalProducts: number;
  totalStockValue: number;
  totalRetailValue: number;
  potentialProfit: number;
  lowStock: Array<{ _id: string; name: string; stock: number; minStock: number }>;
  outOfStock: Array<{ _id: string; name: string; stock: number; minStock: number }>;
  products: Array<{ _id: string; name: string; stock: number; purchasePrice: number; salePrice: number }>;
}

export default function InventoryReportPage() {
  const { data, isLoading } = useQuery<InventoryReport>({
    queryKey: ['report-inventory'],
    queryFn: () => apiClient.get('/reports/inventory'),
  });

  if (isLoading) return <LoadingSpinner text="Loading inventory report..." />;
  if (!data) return <EmptyState icon={Package} title="No inventory data" />;

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-bold">Inventory Report</h1>
        <p className="text-sm text-muted-foreground">Stock valuation and alerts</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Products</p><p className="mt-1 text-lg font-bold">{data.totalProducts}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Stock Value (Cost)</p><p className="mt-1 text-lg font-bold">{formatCurrency(data.totalStockValue)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Retail Value</p><p className="mt-1 text-lg font-bold">{formatCurrency(data.totalRetailValue)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Potential Profit</p><p className="mt-1 text-lg font-bold text-success">{formatCurrency(data.potentialProfit)}</p></CardContent></Card>
      </div>

      {data.lowStock.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><AlertTriangle className="h-5 w-5 text-warning" />Low Stock ({data.lowStock.length})</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Product</TableHead><TableHead className="text-right">Stock</TableHead><TableHead className="text-right">Min Stock</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.lowStock.map((p) => (
                  <TableRow key={p._id}><TableCell className="font-medium">{p.name}</TableCell><TableCell className="text-right">{p.stock}</TableCell><TableCell className="text-right">{p.minStock}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {data.outOfStock.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><AlertTriangle className="h-5 w-5 text-destructive" />Out of Stock ({data.outOfStock.length})</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Product</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.outOfStock.map((p) => (
                  <TableRow key={p._id}><TableCell className="font-medium">{p.name}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
