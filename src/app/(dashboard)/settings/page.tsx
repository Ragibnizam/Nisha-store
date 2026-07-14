'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface Settings {
  _id: string;
  storeName: string;
  storeAddress: string;
  storeMobile: string;
  storeEmail: string;
  gstNumber: string;
  currency: string;
  taxRate: number;
  lowStockThreshold: number;
  barcodePrefix: string;
  invoicePrefix: string;
  footerNote: string;
  printPaperSize: 'thermal' | 'a4';
  enableGst: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem('nisha_token');
        const res = await fetch('/api/settings', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok) setSettings(data.data);
      } catch {
        toast({ description: 'Failed to load settings', variant: 'destructive' });
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('nisha_token');
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ description: 'Settings updated', variant: 'success' });
        setSettings(data.data);
      } else {
        toast({ description: data.error || 'Failed to update', variant: 'destructive' });
      }
    } catch {
      toast({ description: 'Network error', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <LoadingSpinner text="Loading settings..." />;

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure your store</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Store Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Store Name</Label>
              <Input value={settings.storeName} onChange={(e) => setSettings({ ...settings, storeName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={settings.storeAddress} onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mobile</Label>
                <Input value={settings.storeMobile} onChange={(e) => setSettings({ ...settings, storeMobile: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={settings.storeEmail} onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>GST Number</Label>
              <Input value={settings.gstNumber} onChange={(e) => setSettings({ ...settings, gstNumber: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>System Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Currency Symbol</Label>
              <Input value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tax Rate (%)</Label>
                <Input type="number" step="0.01" value={settings.taxRate} onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Low Stock Threshold</Label>
                <Input type="number" value={settings.lowStockThreshold} onChange={(e) => setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Barcode Prefix</Label>
                <Input value={settings.barcodePrefix} onChange={(e) => setSettings({ ...settings, barcodePrefix: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Invoice Prefix</Label>
                <Input value={settings.invoicePrefix} onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Print Paper Size</Label>
              <Select value={settings.printPaperSize} onValueChange={(v: 'thermal' | 'a4') => setSettings({ ...settings, printPaperSize: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="thermal">Thermal (80mm)</SelectItem>
                  <SelectItem value="a4">A4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Enable GST</Label>
              <Switch checked={settings.enableGst} onCheckedChange={(v) => setSettings({ ...settings, enableGst: v })} />
            </div>
            <div className="space-y-2">
              <Label>Invoice Footer Note</Label>
              <Input value={settings.footerNote} onChange={(e) => setSettings({ ...settings, footerNote: e.target.value })} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Button onClick={handleSave} disabled={saving} size="lg">
        {saving ? 'Saving...' : 'Save Settings'}
      </Button>
    </div>
  );
}
