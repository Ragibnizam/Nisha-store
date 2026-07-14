'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrency } from '@/lib/utils/currency';
import { AlertTriangle } from 'lucide-react';
import type { IProduct } from '@/lib/db/models/Product';

export default function LowStockPage() {
  const { data: products, isLoading } = useQuery<(IProduct & { _id: string })[]>({
    queryKey: ['low-stock'],
    queryFn: () => apiClient.get('/products?lowStock=true'),
  });

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-bold">Low Stock</h1>
        <p className="text-sm text-muted-foreground">Products at or below minimum stock level</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <LoadingSpinner text="Loading low stock..." />
          ) : !products || products.length === 0 ? (
            <EmptyState icon={AlertTriangle} title="All products well stocked" description="No low stock alerts" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Barcode</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Min Stock</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="font-mono text-xs">{p.barcode}</TableCell>
                    <TableCell className="text-right">{p.stock}</TableCell>
                    <TableCell className="text-right">{p.minStock}</TableCell>
                    <TableCell>
                      <Badge variant={p.stock === 0 ? 'destructive' : 'warning'}>
                        {p.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
