'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { useCart } from '@/contexts/CartContext';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { PrintTemplate } from '@/components/common/PrintTemplate';
import { toast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/utils/currency';
import { useDebounce } from '@/hooks/useDebounce';
import { ShoppingCart, ScanLine, Trash2, Plus, Minus, Search, X, CreditCard } from 'lucide-react';
import type { IProduct } from '@/lib/db/models/Product';
import type { ISale } from '@/lib/db/models/Sale';
import { QUICK_SALE_METHODS, BILL_SALE_METHODS, PAYMENT_METHOD_LABELS } from '@/lib/constants/paymentMethods';

export default function POSPage() {
  const queryClient = useQueryClient();
  const { items, addItem, removeItem, updateQuantity, clearCart, subtotal, taxAmount, totalAmount, itemCount } = useCart();
  const [manualSearch, setManualSearch] = useState('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [saleType, setSaleType] = useState<'normal' | 'quick'>('normal');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [paidAmount, setPaidAmount] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [lastSale, setLastSale] = useState<(ISale & { _id: string }) | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const keepFocusedRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useDebounce(manualSearch, 300);

  const { data: searchResults } = useQuery<(IProduct & { _id: string })[]>({
    queryKey: ['products-pos', debouncedSearch],
    queryFn: () => apiClient.get(`/products?search=${encodeURIComponent(debouncedSearch)}`),
    enabled: debouncedSearch.length > 0,
  });

  const { data: customers } = useQuery<(IProduct & { _id: string })[]>({
    queryKey: ['customers-pos'],
    queryFn: () => apiClient.get('/customers'),
  });

  const handleBarcodeScan = useCallback(
    async (barcode: string) => {
      try {
        const token = localStorage.getItem('nisha_token');
        const res = await fetch(`/api/products/barcode/${encodeURIComponent(barcode)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.data) {
          const product = data.data as IProduct & { _id: string };
          if (product.stock <= 0) {
            toast({ description: `${product.name} is out of stock`, variant: 'destructive' });
            return;
          }
          addItem({
            productId: product._id,
            name: product.name,
            barcode: product.barcode,
            price: product.salePrice,
            gstRate: product.gstRate,
            stock: product.stock,
          });
        } else {
          toast({ description: `No product found for barcode: ${barcode}`, variant: 'destructive' });
        }
      } catch {
        toast({ description: 'Failed to scan barcode', variant: 'destructive' });
      }
    },
    [addItem]
  );

  const { barcode, inputRef, handleKeyDown, handleChange } = useBarcodeScanner({
    onScan: handleBarcodeScan,
    scanTimeout: 80,
    manualDebounce: 400,
  });

  // Keep barcode input always focused for continuous scanning
  useEffect(() => {
    if (!checkoutOpen) {
      inputRef.current?.focus();
    }
  }, [checkoutOpen, inputRef, items.length]);

  const saleMutation = useMutation({
    mutationFn: async (saleData: Record<string, unknown>) => {
      const token = localStorage.getItem('nisha_token');
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(saleData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to complete sale');
      return data.data as ISale & { _id: string };
    },
    onSuccess: (sale) => {
      setLastSale(sale);
      clearCart();
      setCheckoutOpen(false);
      setPaidAmount('');
      setCustomerName('');
      setCustomerMobile('');
      setCustomerId('');
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ description: `Sale completed: ${sale.invoiceNumber}`, variant: 'success' });
      setTimeout(() => {
        if (printRef.current) {
          printRef.current.style.display = 'block';
          window.print();
          printRef.current.style.display = 'none';
        }
      }, 200);
    },
    onError: (error: Error) => {
      toast({ description: error.message, variant: 'destructive' });
    },
  });

  const handleCheckout = () => {
    if (items.length === 0) return;

    if (paymentMethod === 'credit') {
      if (!customerName && !customerId) {
        toast({ description: 'Customer required for credit sale', variant: 'destructive' });
        return;
      }
    }

    const paid = parseFloat(paidAmount) || (paymentMethod === 'credit' ? 0 : totalAmount);
    const creditAmount = paymentMethod === 'credit' ? Math.max(0, totalAmount - paid) : 0;

    saleMutation.mutate({
      type: saleType,
      items: items.map((i) => ({
        productId: i.productId,
        name: i.name,
        barcode: i.barcode,
        price: i.price,
        quantity: i.quantity,
        total: i.total,
        gstRate: i.gstRate,
      })),
      subtotal,
      taxAmount,
      discountAmount: 0,
      totalAmount,
      paidAmount: paid,
      creditAmount,
      paymentMethod,
      customerId,
      customerName,
      customerMobile,
    });
  };

  const availableMethods = saleType === 'quick' ? QUICK_SALE_METHODS : BILL_SALE_METHODS;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col lg:flex-row lg:overflow-hidden">
      {/* Left: Scanner & Product Search */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4 scrollbar-thin lg:p-6">
        <div>
          <h1 className="text-2xl font-bold">Point of Sale</h1>
        </div>

        {/* Barcode Scanner Input */}
        <Card className="border-2 border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ScanLine className="h-5 w-5 text-primary" />
              <Input
                ref={inputRef}
                value={barcode}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Scan barcode or type product name..."
                className="border-0 text-lg focus-visible:ring-0"
                autoComplete="off"
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Scanner auto-detects. Manual typing auto-searches after 400ms.
            </p>
          </CardContent>
        </Card>

        {/* Manual Product Search */}
        <div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={manualSearch}
              onChange={(e) => setManualSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {searchResults && searchResults.length > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {searchResults.slice(0, 12).map((product) => (
                <button
                  key={product._id}
                  onClick={() => {
                    if (product.stock <= 0) {
                      toast({ description: 'Out of stock', variant: 'destructive' });
                      return;
                    }
                    addItem({
                      productId: product._id,
                      name: product.name,
                      barcode: product.barcode,
                      price: product.salePrice,
                      gstRate: product.gstRate,
                      stock: product.stock,
                    });
                    setManualSearch('');
                  }}
                  className="flex flex-col items-start rounded-md border bg-card p-3 text-left transition-colors hover:border-primary hover:bg-accent"
                >
                  <span className="text-sm font-medium line-clamp-2">{product.name}</span>
                  <span className="text-xs text-muted-foreground">{product.barcode}</span>
                  <div className="mt-1 flex w-full items-center justify-between">
                    <span className="text-sm font-bold">{formatCurrency(product.salePrice)}</span>
                    <Badge variant={product.stock <= 0 ? 'destructive' : 'secondary'} className="text-xs">
                      {product.stock}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Cart */}
      <div className="flex w-full flex-col border-t bg-card lg:w-96 lg:border-l lg:border-t-0">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <span className="font-semibold">Cart ({itemCount})</span>
          </div>
          {items.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearCart}>
              <X className="mr-1 h-4 w-4" /> Clear
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {items.length === 0 ? (
            <EmptyState icon={ShoppingCart} title="Cart is empty" description="Scan or search products to add" />
          ) : (
            <div className="space-y-2 p-3">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-2 rounded-md border p-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(item.price)} x {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="w-20 text-right">
                    <p className="text-sm font-bold">{formatCurrency(item.total)}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeItem(item.productId)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Summary & Checkout */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-3">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {taxAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant={saleType === 'quick' ? 'default' : 'outline'} onClick={() => { setSaleType('quick'); setPaymentMethod('cash'); }}>
                Quick Sale
              </Button>
              <Button variant={saleType === 'normal' ? 'default' : 'outline'} onClick={() => { setSaleType('normal'); setPaymentMethod('cash'); }}>
                With Bill
              </Button>
            </div>

            <Button className="w-full" size="lg" onClick={() => setCheckoutOpen(true)}>
              Checkout
            </Button>
          </div>
        )}
      </div>

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Sale - {saleType === 'quick' ? 'Quick Sale' : 'With Bill'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-md bg-muted p-3">
              <div className="flex justify-between text-sm">
                <span>Total Amount</span>
                <span className="font-bold">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {availableMethods.map((m) => (
                    <SelectItem key={m} value={m}>{PAYMENT_METHOD_LABELS[m]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Credit option only for With Bill */}
            {saleType === 'normal' && paymentMethod === 'credit' && (
              <div className="space-y-3 rounded-md border border-warning/30 bg-warning/5 p-3">
                <p className="text-sm font-medium text-warning">Credit (Udhar) Sale</p>
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Enter customer name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerMobile">Mobile Number *</Label>
                  <Input id="customerMobile" value={customerMobile} onChange={(e) => setCustomerMobile(e.target.value)} placeholder="10-digit mobile" />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="paidAmount">Paid Amount</Label>
              <Input
                id="paidAmount"
                type="number"
                step="0.01"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                placeholder={paymentMethod === 'credit' ? '0.00' : totalAmount.toString()}
              />
              {paymentMethod === 'credit' && paidAmount && parseFloat(paidAmount) < totalAmount && (
                <p className="text-xs text-warning">
                  Credit Remaining: {formatCurrency(totalAmount - (parseFloat(paidAmount) || 0))}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckoutOpen(false)}>Cancel</Button>
            <Button onClick={handleCheckout} disabled={saleMutation.isPending}>
              {saleMutation.isPending ? 'Processing...' : 'Complete Sale'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print Template */}
      {lastSale && (
        <PrintTemplate ref={printRef} sale={lastSale} paperSize="thermal" />
      )}
    </div>
  );
}
