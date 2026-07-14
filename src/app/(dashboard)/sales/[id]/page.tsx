'use client';

import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { PrintTemplate } from '@/components/common/PrintTemplate';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { toast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/date';
import { SALE_TYPE_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/constants/saleTypes';
import { PAYMENT_METHOD_LABELS } from '@/lib/constants/paymentMethods';
import { ArrowLeft, Printer, Undo2 } from 'lucide-react';
import Link from 'next/link';
import type { ISale } from '@/lib/db/models/Sale';

export default function SaleDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const printRef = useRef<HTMLDivElement>(null);
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('');

  const { data: sale, isLoading } = useQuery<ISale & { _id: string }>({
    queryKey: ['sale', params.id],
    queryFn: () => apiClient.get(`/sales/${params.id}`),
  });

  const refundMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('nisha_token');
      const res = await fetch('/api/sales/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ saleId: params.id, reason: refundReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast({ description: 'Sale refunded successfully', variant: 'success' });
      setRefundOpen(false);
      queryClient.invalidateQueries({ queryKey: ['sale', params.id] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
    onError: (error: Error) => {
      toast({ description: error.message, variant: 'destructive' });
    },
  });

  const handlePrint = () => {
    if (printRef.current) {
      printRef.current.style.display = 'block';
      window.print();
      printRef.current.style.display = 'none';
    }
  };

  if (isLoading) return <LoadingSpinner text="Loading sale..." />;
  if (!sale) return <EmptyState title="Sale not found" />;

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/sales"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold">{sale.invoiceNumber}</h1>
            <p className="text-sm text-muted-foreground">{formatDate(sale.createdAt, 'datetime')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" />Print</Button>
          {sale.paymentStatus !== 'refunded' && (
            <Button variant="destructive" onClick={() => setRefundOpen(true)}><Undo2 className="mr-2 h-4 w-4" />Refund</Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Items</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sale.items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Type</span>
              <Badge variant="secondary">{SALE_TYPE_LABELS[sale.type]}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Method</span>
              <span>{PAYMENT_METHOD_LABELS[sale.paymentMethod]}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={sale.paymentStatus === 'paid' ? 'success' : sale.paymentStatus === 'refunded' ? 'destructive' : 'warning'}>
                {PAYMENT_STATUS_LABELS[sale.paymentStatus]}
              </Badge>
            </div>
            {sale.customerName && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Customer</span>
                <span>{sale.customerName}</span>
              </div>
            )}
            <div className="border-t pt-2 space-y-1">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(sale.subtotal)}</span></div>
              {sale.taxAmount > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax</span><span>{formatCurrency(sale.taxAmount)}</span></div>}
              {sale.discountAmount > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Discount</span><span>-{formatCurrency(sale.discountAmount)}</span></div>}
              <div className="flex justify-between font-bold"><span>Total Amount</span><span>{formatCurrency(sale.totalAmount)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Paid Amount</span><span>{formatCurrency(sale.paidAmount)}</span></div>
              {sale.creditAmount > 0 && (
                <div className="flex justify-between text-sm font-semibold text-warning"><span>Credit Remaining</span><span>{formatCurrency(sale.creditAmount)}</span></div>
              )}
            </div>
            {sale.refundReason && (
              <div className="rounded-md bg-destructive/10 p-2 text-sm">
                <p className="font-medium text-destructive">Refunded: {sale.refundReason}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <PrintTemplate ref={printRef} sale={sale} paperSize="thermal" />

      <ConfirmDialog
        open={refundOpen}
        onOpenChange={setRefundOpen}
        title="Refund Sale"
        description="This will reverse the sale and restock all items. This action cannot be undone."
        confirmText="Process Refund"
        onConfirm={() => refundMutation.mutate()}
      />
    </div>
  );
}
