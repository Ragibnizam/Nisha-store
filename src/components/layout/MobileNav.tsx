'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, Package, CreditCard, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { navItems } from '@/config/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils/cn';

const mobileNav = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'POS', href: '/pos', icon: ShoppingCart },
  { label: 'Products', href: '/products', icon: Package },
  { label: 'Credit', href: '/credit', icon: CreditCard },
];

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const filtered = navItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role || 'staff')
  );

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t bg-background py-2 lg:hidden">
        {mobileNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 text-xs',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="More">
          <Menu className="h-5 w-5" />
        </Button>
      </nav>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-64 bg-card p-4 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-bold">Menu</span>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="space-y-1">
              {filtered.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
