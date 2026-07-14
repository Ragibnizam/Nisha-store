'use client';

import { type LucideIcon, PackageX } from 'lucide-react';

export function EmptyState({
  icon: Icon = PackageX,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <Icon className="h-12 w-12 text-muted-foreground/50" />
      <div>
        <p className="font-medium text-foreground">{title}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
