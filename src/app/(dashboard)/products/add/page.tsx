'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { productSchema, type ProductFormValues } from '@/lib/validations/productSchema';
import { generateBarcode } from '@/lib/utils/barcode';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AddProductPage() {
  const router = useRouter();
  const [barcode, setBarcode] = useState(generateBarcode());

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      barcode,
      category: 'General',
      unit: 'pcs',
      mrp: 0,
      stock: 0,
      minStock: 5,
      gstRate: 0,
      active: true,
    },
  });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        toast({ description: result.error || 'Failed to create product', variant: 'destructive' });
        return;
      }
      toast({ description: 'Product created successfully', variant: 'success' });
      router.push('/products');
    } catch {
      toast({ description: 'Network error', variant: 'destructive' });
    }
  };

  const units = ['pcs', 'kg', 'g', 'L', 'mL', 'pack', 'box', 'dozen'];

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex items-center gap-4">
        <Link href="/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Add Product</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input id="name" {...register('name')} placeholder="Enter product name" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <div className="flex gap-2">
                <Input id="barcode" value={barcode} onChange={(e) => { setBarcode(e.target.value); setValue('barcode', e.target.value); }} className="font-mono" />
                <Button type="button" variant="outline" size="icon" onClick={() => { const newBc = generateBarcode(); setBarcode(newBc); setValue('barcode', newBc); }}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" {...register('category')} placeholder="General" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
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
                <Input id="purchasePrice" type="number" step="0.01" {...register('purchasePrice')} placeholder="0.00" />
                {errors.purchasePrice && <p className="text-xs text-destructive">{errors.purchasePrice.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="salePrice">Sale Price *</Label>
                <Input id="salePrice" type="number" step="0.01" {...register('salePrice')} placeholder="0.00" />
                {errors.salePrice && <p className="text-xs text-destructive">{errors.salePrice.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mrp">MRP</Label>
                <Input id="mrp" type="number" step="0.01" {...register('mrp')} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" type="number" {...register('stock')} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minStock">Min Stock</Label>
                <Input id="minStock" type="number" {...register('minStock')} placeholder="5" />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Product'}
              </Button>
              <Link href="/products">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
