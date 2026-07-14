'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { toast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/date';
import { Undo2 } from 'lucide-react';
import { useState } from 'react';
import type { ISale } from '@/lib/db/models/Sale';

export default function RefundsPage() {
  const [refundOpen, setRefundOpen] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState('');
  const [refundReason, setRefundReason] = useState('');

  const { data: sales, isLoading } = useQuery<(ISale & { _id: string })[]>({
    queryKey: ['sales-refundable'],
    queryFn: () => apiClient.get('/sales'),
  });

  const refundableSales = sales?.filter(s => s.paymentStatus !== 'refunded') || [];

  const handleRefund = async () => {
    try {
      const token = localStorage.getItem('nisha_token');
      const res = await fetch('/api/sales/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ saleId: selectedSaleId, reason: refundReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ description: 'Refund processed', variant: 'success' });
      setRefundOpen(false);
      setRefundReason('');
    } catch (error) {
      toast({ description: error instanceof Error ? error.message : 'Refund failed', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-bold">Refunds</h1>
        <p className="text-sm text-muted-foreground">Process and track refunds</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <LoadingSpinner text="Loading sales..." />
          ) : refundableSales.length === 0 ? (
            <EmptyState icon={Undo2} title="No refundable sales" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refundableSales.map((sale) => (
                  <TableRow key={sale._id}>
                    <TableCell className="font-mono text-sm">{sale.invoiceNumber}</TableCell>
                    <TableCell className="text-sm">{formatDate(sale.createdAt)}</TableCell>
                    <TableCell>{sale.customerName || 'Walk-in'}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(sale.totalAmount)}</TableCell>
                    <TableCell><Badge variant={sale.paymentStatus === 'paid' ? 'success' : 'warning'}>{sale.paymentStatus}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="destructive" size="sm" onClick={() => { setSelectedSaleId(sale._id); setRefundOpen(true); }}>
                        <Undo2 className="mr-1 h-3 w-3" />Refund
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={refundOpen}
        onOpenChange={setRefundOpen}
        title="Process Refund"
        description="This will reverse the sale and restock all items."
        confirmText="Confirm Refund"
        onConfirm={handleRefund}
      />
    </div>
  );
}
