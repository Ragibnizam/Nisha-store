'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface CartItem {
  productId: string;
  name: string;
  barcode: string;
  price: number;
  quantity: number;
  total: number;
  gstRate: number;
  stock: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity' | 'total'>, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((item: Omit<CartItem, 'quantity' | 'total'>, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, item.stock || 9999);
        return prev.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: newQty, total: i.price * newQty }
            : i
        );
      }
      return [...prev, { ...item, quantity, total: item.price * quantity }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.productId !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId
          ? { ...i, quantity, total: i.price * quantity }
          : i
      )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const subtotal = items.reduce((sum, i) => sum + i.total, 0);
  const taxAmount = items.reduce((sum, i) => sum + (i.total * i.gstRate) / 100, 0);
  const totalAmount = subtotal + taxAmount;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, subtotal, taxAmount, totalAmount, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
