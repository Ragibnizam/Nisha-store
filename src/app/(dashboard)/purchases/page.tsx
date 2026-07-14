'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/date';
import { Truck } from 'lucide-react';
import type { IPurchase } from '@/lib/db/models/Purchase';

export default function PurchasesPage() {
  const { data: purchases, isLoading } = useQuery<(IPurchase & { _id: string })[]>({
    queryKey: ['purchases'],
    queryFn: () => apiClient.get('/purchases'),
  });

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-bold">Purchase History</h1>
        <p className="text-sm text-muted-foreground">Stock purchases from suppliers</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <LoadingSpinner text="Loading purchases..." />
          ) : !purchases || purchases.length === 0 ? (
            <EmptyState icon={Truck} title="No purchases recorded" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-center">Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell className="font-mono text-sm">{p.invoiceNumber}</TableCell>
                    <TableCell className="font-medium">{p.supplierName}</TableCell>
                    <TableCell className="text-sm">{formatDate(p.createdAt, 'datetime')}</TableCell>
                    <TableCell className="text-center">{p.items.length}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(p.totalAmount)}</TableCell>
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
