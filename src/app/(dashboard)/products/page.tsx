'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { useDebounce } from '@/hooks/useDebounce';
import { formatCurrency } from '@/lib/utils/currency';
import { Package, Plus, Search, Pencil } from 'lucide-react';
import type { IProduct } from '@/lib/db/models/Product';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data: products, isLoading } = useQuery<(IProduct & { _id: string })[]>({
    queryKey: ['products', debouncedSearch],
    queryFn: () => apiClient.get(`/products?search=${encodeURIComponent(debouncedSearch)}`),
  });

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">Manage your inventory</p>
        </div>
        <Link href="/products/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or barcode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <LoadingSpinner text="Loading products..." />
          ) : !products || products.length === 0 ? (
            <EmptyState icon={Package} title="No products found" description="Add your first product to get started" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Barcode</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <Link href={`/products/${product._id}`} className="font-medium hover:text-primary">
                        {product.name}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{product.barcode}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="text-right">{formatCurrency(product.salePrice)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={product.stock === 0 ? 'destructive' : product.stock <= product.minStock ? 'warning' : 'secondary'}>
                        {product.stock}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/products/edit/${product._id}`}>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
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
