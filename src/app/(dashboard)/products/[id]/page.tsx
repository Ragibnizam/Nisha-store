'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrency } from '@/lib/utils/currency';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { IProduct } from '@/lib/db/models/Product';

export default function ProductDetailsPage() {
  const params = useParams<{ id: string }>();

  const { data: product, isLoading } = useQuery<IProduct & { _id: string }>({
    queryKey: ['product', params.id],
    queryFn: () => apiClient.get(`/products/${params.id}`),
  });

  if (isLoading) return <LoadingSpinner text="Loading product..." />;
  if (!product) return <EmptyState title="Product not found" />;

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex items-center gap-4">
        <Link href="/products">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <h1 className="text-2xl font-bold">{product.name}</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Product Information</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Barcode</p>
                <p className="font-mono font-medium">{product.barcode}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Category</p>
                <p className="font-medium">{product.category}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Unit</p>
                <p className="font-medium">{product.unit}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">GST Rate</p>
                <p className="font-medium">{product.gstRate}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Purchase Price</p>
                <p className="font-medium">{formatCurrency(product.purchasePrice)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sale Price</p>
                <p className="font-medium">{formatCurrency(product.salePrice)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">MRP</p>
                <p className="font-medium">{formatCurrency(product.mrp)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Stock</p>
                <Badge variant={product.stock === 0 ? 'destructive' : product.stock <= product.minStock ? 'warning' : 'success'}>
                  {product.stock} {product.unit}
                </Badge>
              </div>
            </div>
            {product.description && (
              <div>
                <p className="text-xs text-muted-foreground">Description</p>
                <p className="text-sm">{product.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Link href={`/products/edit/${product._id}`}>
              <Button className="w-full">Edit Product</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
