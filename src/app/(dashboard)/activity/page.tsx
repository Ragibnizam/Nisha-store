'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils/date';
import { Activity } from 'lucide-react';

interface ActivityData {
  logs: Array<{ _id: string; action: string; module: string; description: string; performedByName: string; createdAt: string }>;
  total: number;
  page: number;
  totalPages: number;
}

export default function ActivityPage() {
  const { data, isLoading } = useQuery<ActivityData>({
    queryKey: ['activity'],
    queryFn: () => apiClient.get('/activity'),
  });

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-bold">Activity Log</h1>
        <p className="text-sm text-muted-foreground">System activity history</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <LoadingSpinner text="Loading activity..." />
          ) : !data || data.logs.length === 0 ? (
            <EmptyState icon={Activity} title="No activity recorded" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Performed By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.logs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell className="text-sm">{formatDate(log.createdAt, 'datetime')}</TableCell>
                    <TableCell><Badge variant="secondary" className="text-xs">{log.module}</Badge></TableCell>
                    <TableCell className="text-sm font-medium">{log.action}</TableCell>
                    <TableCell className="text-sm">{log.description}</TableCell>
                    <TableCell className="text-sm">{log.performedByName}</TableCell>
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
