'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function LoadingSpinner({ className, text }: { className?: string; text?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 py-8', className)}>
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}
