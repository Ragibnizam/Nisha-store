'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/date';
import { SALE_TYPE_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/constants/saleTypes';
import { Receipt } from 'lucide-react';
import type { ISale } from '@/lib/db/models/Sale';

export default function SalesPage() {
  const { data: sales, isLoading } = useQuery<(ISale & { _id: string })[]>({
    queryKey: ['sales'],
    queryFn: () => apiClient.get('/sales'),
  });

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-bold">Sales History</h1>
        <p className="text-sm text-muted-foreground">All transactions</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <LoadingSpinner text="Loading sales..." />
          ) : !sales || sales.length === 0 ? (
            <EmptyState icon={Receipt} title="No sales yet" description="Make your first sale from POS" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale._id}>
                    <TableCell>
                      <Link href={`/sales/${sale._id}`} className="font-medium hover:text-primary">
                        {sale.invoiceNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(sale.createdAt, 'datetime')}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">{SALE_TYPE_LABELS[sale.type]}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{sale.customerName || 'Walk-in'}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(sale.totalAmount)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(sale.paidAmount)}</TableCell>
                    <TableCell>
                      <Badge variant={sale.paymentStatus === 'paid' ? 'success' : sale.paymentStatus === 'partial' ? 'warning' : sale.paymentStatus === 'refunded' ? 'destructive' : 'secondary'}>
                        {PAYMENT_STATUS_LABELS[sale.paymentStatus]}
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
