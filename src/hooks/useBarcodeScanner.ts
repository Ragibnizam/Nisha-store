'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook for handling barcode scanner input.
 * Barcode scanners typically send characters very quickly (under 50ms apart),
 * while manual typing is much slower (50-200ms between keystrokes).
 *
 * - Scanner input: auto-submits when rapid input stops (configurable timeout)
 * - Manual input: debounced auto-search after 300-500ms
 * - Input stays focused for continuous scanning
 */
export function useBarcodeScanner(options?: {
  onScan?: (barcode: string) => void;
  scanTimeout?: number;
  manualDebounce?: number;
}) {
  const { onScan, scanTimeout = 80, manualDebounce = 400 } = options || {};
  const [barcode, setBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastKeyTime = useRef<number>(0);
  const keyTimes = useRef<number[]>([]);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scanTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const detectAndTrigger = useCallback(
    (value: string) => {
      if (!value) return;

      const now = Date.now();
      keyTimes.current = keyTimes.current.filter((t) => now - t < 1000);
      const avgInterval =
        keyTimes.current.length > 1
          ? (keyTimes.current[keyTimes.current.length - 1] - keyTimes.current[0]) /
            (keyTimes.current.length - 1)
          : 999;

      if (avgInterval < 30) {
        setIsScanning(true);
        if (scanTimer.current) clearTimeout(scanTimer.current);
        scanTimer.current = setTimeout(() => {
          onScan?.(value);
          setBarcode('');
          setIsScanning(false);
          keyTimes.current = [];
        }, scanTimeout);
      } else {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
          onScan?.(value);
          setBarcode('');
          keyTimes.current = [];
        }, manualDebounce);
      }
    },
    [onScan, scanTimeout, manualDebounce]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const now = Date.now();
      keyTimes.current.push(now);

      if (e.key === 'Enter') {
        e.preventDefault();
        if (barcode) {
          if (scanTimer.current) clearTimeout(scanTimer.current);
          if (debounceTimer.current) clearTimeout(debounceTimer.current);
          onScan?.(barcode);
          setBarcode('');
          setIsScanning(false);
          keyTimes.current = [];
        }
      }
    },
    [barcode, onScan]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setBarcode(value);
      if (value) {
        detectAndTrigger(value);
      }
    },
    [detectAndTrigger]
  );

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    return () => {
      if (scanTimer.current) clearTimeout(scanTimer.current);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  return {
    barcode,
    isScanning,
    inputRef,
    handleKeyDown,
    handleChange,
    focusInput,
  };
}
