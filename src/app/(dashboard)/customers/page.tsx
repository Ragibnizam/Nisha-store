'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/date';
import { Users, Plus, Search } from 'lucide-react';
import type { ICustomer } from '@/lib/db/models/Customer';

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data: customers, isLoading } = useQuery<(ICustomer & { _id: string })[]>({
    queryKey: ['customers', debouncedSearch],
    queryFn: () => apiClient.get(`/customers?search=${encodeURIComponent(debouncedSearch)}`),
  });

  const addMutation = useMutation({
    mutationFn: async (data: { name: string; mobile: string }) => {
      const token = localStorage.getItem('nisha_token');
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      toast({ description: 'Customer added', variant: 'success' });
      setAddOpen(false);
      setNewName('');
      setNewMobile('');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (error: Error) => toast({ description: error.message, variant: 'destructive' }),
  });

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-sm text-muted-foreground">Manage customer accounts</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />Add Customer
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by name or mobile..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <LoadingSpinner text="Loading customers..." />
          ) : !customers || customers.length === 0 ? (
            <EmptyState icon={Users} title="No customers found" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead className="text-right">Total Purchases</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead>Last Purchase</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.mobile}</TableCell>
                    <TableCell className="text-right">{formatCurrency(c.totalPurchases)}</TableCell>
                    <TableCell className="text-right font-bold text-destructive">{formatCurrency(c.remainingBalance)}</TableCell>
                    <TableCell className="text-sm">{c.lastPurchaseDate ? formatDate(c.lastPurchaseDate) : '-'}</TableCell>
                    <TableCell>
                      <Badge variant={c.creditStatus === 'active' ? 'warning' : c.creditStatus === 'settled' ? 'success' : 'secondary'}>
                        {c.creditStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Customer</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newName">Name *</Label>
              <Input id="newName" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Customer name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newMobile">Mobile *</Label>
              <Input id="newMobile" value={newMobile} onChange={(e) => setNewMobile(e.target.value)} placeholder="10-digit mobile" maxLength={15} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => addMutation.mutate({ name: newName, mobile: newMobile })} disabled={!newName || !newMobile || addMutation.isPending}>
              {addMutation.isPending ? 'Adding...' : 'Add Customer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
