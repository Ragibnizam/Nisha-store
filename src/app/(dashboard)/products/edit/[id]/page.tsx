'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { toast } from '@/components/ui/use-toast';
import { productSchema, type ProductFormValues } from '@/lib/validations/productSchema';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { IProduct } from '@/lib/db/models/Product';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [loadingProduct, setLoadingProduct] = useState(true);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    async function loadProduct() {
      try {
        const token = localStorage.getItem('nisha_token');
        const res = await fetch(`/api/products/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.data) {
          const p: IProduct = data.data;
          setValue('name', p.name);
          setValue('barcode', p.barcode);
          setValue('category', p.category);
          setValue('unit', p.unit);
          setValue('purchasePrice', p.purchasePrice);
          setValue('salePrice', p.salePrice);
          setValue('mrp', p.mrp);
          setValue('stock', p.stock);
          setValue('minStock', p.minStock);
          setValue('gstRate', p.gstRate);
          setValue('active', p.active);
        }
      } catch {
        toast({ description: 'Failed to load product', variant: 'destructive' });
      } finally {
        setLoadingProduct(false);
      }
    }
    loadProduct();
  }, [params.id, setValue]);

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const token = localStorage.getItem('nisha_token');
      const res = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        toast({ description: result.error || 'Failed to update product', variant: 'destructive' });
        return;
      }
      toast({ description: 'Product updated successfully', variant: 'success' });
      router.push('/products');
    } catch {
      toast({ description: 'Network error', variant: 'destructive' });
    }
  };

  if (loadingProduct) return <LoadingSpinner text="Loading product..." />;

  const units = ['pcs', 'kg', 'g', 'L', 'mL', 'pack', 'box', 'dozen'];

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex items-center gap-4">
        <Link href="/products">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <h1 className="text-2xl font-bold">Edit Product</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader><CardTitle>Product Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input id="barcode" {...register('barcode')} className="font-mono" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" {...register('category')} />
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select defaultValue="pcs" onValueChange={(v) => setValue('unit', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {units.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Purchase Price *</Label>
                <Input id="purchasePrice" type="number" step="0.01" {...register('purchasePrice')} />
                {errors.purchasePrice && <p className="text-xs text-destructive">{errors.purchasePrice.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="salePrice">Sale Price *</Label>
                <Input id="salePrice" type="number" step="0.01" {...register('salePrice')} />
                {errors.salePrice && <p className="text-xs text-destructive">{errors.salePrice.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mrp">MRP</Label>
                <Input id="mrp" type="number" step="0.01" {...register('mrp')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" type="number" {...register('stock')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minStock">Min Stock</Label>
                <Input id="minStock" type="number" {...register('minStock')} />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Product'}
              </Button>
              <Link href="/products"><Button type="button" variant="outline">Cancel</Button></Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
