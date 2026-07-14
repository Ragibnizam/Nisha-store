'use client';

import * as React from 'react';
import type { ToastProps, ToastActionElement } from './toast';

const TOAST_LIMIT = 3;
const TOAST_TIMEOUT = 3000;

type ToasterToast = ToastProps & {
  id: string;
  title?: string;
  description?: string;
  action?: ToastActionElement;
};

let count = 0;
function genId(): string {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

const toastQueue: ToasterToast[] = [];
const listeners: Array<(toasts: ToasterToast[]) => void> = [];

function notify() {
  listeners.forEach((l) => l([...toastQueue]));
}

export function toast(props: Omit<ToasterToast, 'id'>) {
  const id = genId();
  const newToast: ToasterToast = { ...props, id };
  toastQueue.push(newToast);
  notify();

  setTimeout(() => {
    const idx = toastQueue.findIndex((t) => t.id === id);
    if (idx > -1) {
      toastQueue.splice(idx, 1);
      notify();
    }
  }, TOAST_TIMEOUT);
}

export function useToast() {
  const [toasts, setToasts] = React.useState<ToasterToast[]>(toastQueue);

  React.useEffect(() => {
    listeners.push(setToasts);
    return () => {
      const idx = listeners.indexOf(setToasts);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  return { toasts, toast };
}
