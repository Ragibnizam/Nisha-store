"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface StoreSettings {
  storeName: string;
  storeAddress: string;
  storeMobile: string;
  storeGSTIN: string;
  currencySymbol: string;
  taxEnabled: boolean;
  defaultTaxRate: number;
  lowStockThreshold: number;
  barcodePrefix: string;
  thermalPrinterWidth: number;
  printFooter: string;
}

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "Nisha Store",
  storeAddress: "",
  storeMobile: "",
  storeGSTIN: "",
  currencySymbol: "₹",
  taxEnabled: false,
  defaultTaxRate: 0,
  lowStockThreshold: 10,
  barcodePrefix: "NS",
  thermalPrinterWidth: 58,
  printFooter: "Thank you for shopping with us!",
};

interface SettingsContextValue {
  settings: StoreSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  updateSettings: (s: StoreSettings) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
      }
    } catch {
      // use defaults
    }
    setLoading(false);
  };

  const updateSettings = async (s: StoreSettings) => {
    setSettings(s);
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
