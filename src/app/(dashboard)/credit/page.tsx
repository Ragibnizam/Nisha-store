'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { toast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/date';
import { CreditCard, Eye, IndianRupee } from 'lucide-react';
import type { CreditSummary, LedgerEntry } from '@/types';
import type { ISale } from '@/lib/db/models/Sale';

export default function CreditPage() {
  const queryClient = useQueryClient();
  const [selectedCustomer, setSelectedCustomer] = useState<CreditSummary | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [selectedSaleId, setSelectedSaleId] = useState('');

  const { data: summaries, isLoading } = useQuery<CreditSummary[]>({
    queryKey: ['credit-summaries'],
    queryFn: () => apiClient.get('/credit'),
  });

  const { data: ledger } = useQuery<LedgerEntry[]>({
    queryKey: ['ledger', selectedCustomer?.customerId],
    queryFn: () => apiClient.get(`/credit?customerId=${selectedCustomer?.customerId}`),
    enabled: !!selectedCustomer,
  });

  const { data: customerSales } = useQuery<(ISale & { _id: string })[]>({
    queryKey: ['customer-sales', selectedCustomer?.customerId],
    queryFn: () => apiClient.get(`/sales?customerId=${selectedCustomer?.customerId}`),
    enabled: !!selectedCustomer,
  });

  const paymentMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('nisha_token');
      const res = await fetch('/api/credit/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          customerId: selectedCustomer?.customerId,
          saleId: selectedSaleId,
          paymentAmount: parseFloat(paymentAmount),
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast({ description: 'Payment recorded successfully', variant: 'success' });
      setPaymentOpen(false);
      setPaymentAmount('');
      queryClient.invalidateQueries({ queryKey: ['credit-summaries'] });
      queryClient.invalidateQueries({ queryKey: ['ledger'] });
      queryClient.invalidateQueries({ queryKey: ['customer-sales'] });
    },
    onError: (error: Error) => {
      toast({ description: error.message, variant: 'destructive' });
    },
  });

  const creditSales = customerSales?.filter(s => s.type === 'credit' && s.creditAmount > 0) || [];

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-bold">Credit (Udhar) Management</h1>
        <p className="text-sm text-muted-foreground">Customer credit summaries and ledger</p>
      </div>

      {/* Summary Cards */}
      {summaries && summaries.length > 0 && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total Outstanding</p>
              <p className="mt-1 text-lg font-bold text-destructive">
                {formatCurrency(summaries.reduce((s, c) => s + c.remainingBalance, 0))}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Active Credit Customers</p>
              <p className="mt-1 text-lg font-bold">{summaries.filter(c => c.creditStatus === 'active').length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total Credit Bills</p>
              <p className="mt-1 text-lg font-bold">{summaries.reduce((s, c) => s + c.creditBills, 0)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total Paid</p>
              <p className="mt-1 text-lg font-bold text-success">{formatCurrency(summaries.reduce((s, c) => s + c.totalPaid, 0))}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Customer Summary Table */}
      <Card>
        <CardHeader><CardTitle>Credit Customers</CardTitle></CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <LoadingSpinner text="Loading credit data..." />
          ) : !summaries || summaries.length === 0 ? (
            <EmptyState icon={CreditCard} title="No credit customers" description="Credit sales will appear here" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead className="text-right">Total Purchases</TableHead>
                  <TableHead className="text-right">Total Credit</TableHead>
                  <TableHead className="text-right">Total Paid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Last Payment</TableHead>
                  <TableHead>Last Purchase</TableHead>
                  <TableHead className="text-center">Bills</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summaries.map((c) => (
                  <TableRow key={c.customerId}>
                    <TableCell className="font-medium">{c.customerName}</TableCell>
                    <TableCell>{c.customerMobile}</TableCell>
                    <TableCell className="text-right">{formatCurrency(c.totalPurchases)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(c.totalCredit)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(c.totalPaid)}</TableCell>
                    <TableCell className="text-right font-bold text-destructive">{formatCurrency(c.remainingBalance)}</TableCell>
                    <TableCell className="text-sm">{c.lastPaymentDate ? formatDate(c.lastPaymentDate) : '-'}</TableCell>
                    <TableCell className="text-sm">{c.lastPurchaseDate ? formatDate(c.lastPurchaseDate) : '-'}</TableCell>
                    <TableCell className="text-center">{c.creditBills}</TableCell>
                    <TableCell>
                      <Badge variant={c.creditStatus === 'active' ? 'warning' : c.creditStatus === 'settled' ? 'success' : 'secondary'}>
                        {c.creditStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedCustomer(c)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Customer Ledger Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ledger - {selectedCustomer?.customerName}</DialogTitle>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-4">
              {/* Customer Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-md bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Total Credit</p>
                  <p className="font-bold">{formatCurrency(selectedCustomer.totalCredit)}</p>
                </div>
                <div className="rounded-md bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Total Paid</p>
                  <p className="font-bold text-success">{formatCurrency(selectedCustomer.totalPaid)}</p>
                </div>
                <div className="rounded-md bg-destructive/10 p-3">
                  <p className="text-xs text-muted-foreground">Outstanding</p>
                  <p className="font-bold text-destructive">{formatCurrency(selectedCustomer.remainingBalance)}</p>
                </div>
              </div>

              {/* Outstanding Credit Sales */}
              {creditSales.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Outstanding Credit Bills</p>
                  <div className="space-y-1">
                    {creditSales.map((sale) => (
                      <div key={sale._id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                        <div>
                          <span className="font-medium">{sale.invoiceNumber}</span>
                          <span className="ml-2 text-muted-foreground">{formatDate(sale.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-destructive">{formatCurrency(sale.creditAmount)}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedSaleId(sale._id);
                              setPaymentAmount(sale.creditAmount.toString());
                              setPaymentOpen(true);
                            }}
                          >
                            <IndianRupee className="mr-1 h-3 w-3" />Pay
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ledger Table */}
              <div>
                <p className="mb-2 text-sm font-medium">Transaction History</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Credit</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledger?.map((entry, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-sm">{formatDate(entry.date, 'datetime')}</TableCell>
                        <TableCell>
                          <Badge variant={entry.type === 'sale' ? 'warning' : 'success'} className="text-xs">
                            {entry.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{entry.invoiceNumber}</TableCell>
                        <TableCell className="text-right text-destructive">{entry.debit > 0 ? formatCurrency(entry.debit) : '-'}</TableCell>
                        <TableCell className="text-right text-success">{entry.credit > 0 ? formatCurrency(entry.credit) : '-'}</TableCell>
                        <TableCell className="text-right font-bold">{formatCurrency(entry.balance)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Customer</Label>
              <Input value={selectedCustomer?.customerName || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentAmount">Payment Amount</Label>
              <Input id="paymentAmount" type="number" step="0.01" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentOpen(false)}>Cancel</Button>
            <Button onClick={() => paymentMutation.mutate()} disabled={paymentMutation.isPending || !paymentAmount}>
              {paymentMutation.isPending ? 'Recording...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
