'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Store } from 'lucide-react';
import { navItems } from '@/config/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils/cn';

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const filtered = navItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role || 'staff')
  );

  return (
    <aside className="hidden h-screen w-64 flex-col border-r bg-card lg:flex">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Store className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold">Nisha Store</span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3 scrollbar-thin">
        {filtered.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
