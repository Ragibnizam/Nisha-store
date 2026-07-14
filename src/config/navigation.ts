import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Receipt,
  Truck,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  Activity,
  AlertTriangle,
  Undo2,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  roles?: ('admin' | 'staff')[];
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'POS', href: '/pos', icon: ShoppingCart },
  { label: 'Products', href: '/products', icon: Package },
  { label: 'Sales', href: '/sales', icon: Receipt },
  { label: 'Purchases', href: '/purchases', icon: Truck },
  { label: 'Customers', href: '/customers', icon: Users },
  { label: 'Credit (Udhar)', href: '/credit', icon: CreditCard },
  { label: 'Refunds', href: '/refunds', icon: Undo2 },
  { label: 'Low Stock', href: '/inventory/low-stock', icon: AlertTriangle },
  { label: 'Reports', href: '/reports/daily', icon: BarChart3 },
  { label: 'Activity', href: '/activity', icon: Activity, roles: ['admin'] },
  { label: 'Settings', href: '/settings', icon: Settings, roles: ['admin'] },
];
