'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrency } from '@/lib/utils/currency';
import { TrendingUp } from 'lucide-react';

interface ProfitReport {
  date: string;
  revenue: number;
  cost: number;
  profit: number;
  transactionCount: number;
}

export default function ProfitReportPage() {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);

  const { data, isLoading } = useQuery<ProfitReport>({
    queryKey: ['report-profit', date],
    queryFn: () => apiClient.get(`/reports/profit?date=${date}`),
  });

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-bold">Profit Report</h1>
        <p className="text-sm text-muted-foreground">Daily profit analysis</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-2 max-w-xs">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <LoadingSpinner text="Calculating profit..." />
      ) : !data ? (
        <EmptyState icon={TrendingUp} title="No data" />
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Revenue</p><p className="mt-1 text-lg font-bold">{formatCurrency(data.revenue)}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Cost</p><p className="mt-1 text-lg font-bold">{formatCurrency(data.cost)}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Profit</p><p className="mt-1 text-lg font-bold text-success">{formatCurrency(data.profit)}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Transactions</p><p className="mt-1 text-lg font-bold">{data.transactionCount}</p></CardContent></Card>
        </div>
      )}
    </div>
  );
}
