'use client';

import { forwardRef } from 'react';
import type { ISale } from '@/lib/db/models/Sale';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate, formatTime } from '@/lib/utils/date';
import { PAYMENT_METHOD_LABELS } from '@/lib/constants/paymentMethods';
import { PAYMENT_STATUS_LABELS, SALE_TYPE_LABELS } from '@/lib/constants/saleTypes';

interface PrintTemplateProps {
  sale: ISale & { _id: string };
  storeName?: string;
  storeAddress?: string;
  storeMobile?: string;
  footerNote?: string;
  paperSize?: 'thermal' | 'a4';
}

export const PrintTemplate = forwardRef<HTMLDivElement, PrintTemplateProps>(function PrintTemplate(
  { sale, storeName = 'Nisha Store', storeAddress = '', storeMobile = '', footerNote = 'Thank you!', paperSize = 'thermal' },
  ref
) {
  const isThermal = paperSize === 'thermal';

  return (
    <div ref={ref} className="print-area bg-white text-black" style={{ display: 'none' }}>
      <div className={isThermal ? 'mx-auto p-4' : 'mx-auto max-w-2xl p-8'} style={{ width: isThermal ? '80mm' : 'auto' }}>
        {/* Header */}
        <div className="text-center">
          <h1 className="text-xl font-bold uppercase">{storeName}</h1>
          {storeAddress && <p className="text-xs">{storeAddress}</p>}
          {storeMobile && <p className="text-xs">Tel: {storeMobile}</p>}
        </div>

        {/* Invoice info */}
        <div className="mt-3 border-t border-b border-dashed border-black py-2 text-xs">
          <div className="flex justify-between">
            <span>Invoice: {sale.invoiceNumber}</span>
            <span>{formatDate(sale.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span>Time: {formatTime(sale.createdAt)}</span>
            <span>{SALE_TYPE_LABELS[sale.type]}</span>
          </div>
          {sale.customerName && (
            <div className="mt-1">
              <span>Customer: {sale.customerName}</span>
              {sale.customerMobile && <span className="ml-2">Mob: {sale.customerMobile}</span>}
            </div>
          )}
          <div className="mt-1">
            <span>Cashier: {sale.soldByName}</span>
          </div>
        </div>

        {/* Items */}
        <table className="mt-2 w-full text-xs">
          <thead>
            <tr className="border-b border-black">
              <th className="py-1 text-left">Item</th>
              <th className="py-1 text-center">Qty</th>
              <th className="py-1 text-right">Price</th>
              <th className="py-1 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item, idx) => (
              <tr key={idx} className="border-b border-dotted border-gray-400">
                <td className="py-1">{item.name}</td>
                <td className="py-1 text-center">{item.quantity}</td>
                <td className="py-1 text-right">{formatCurrency(item.price, '')}</td>
                <td className="py-1 text-right">{formatCurrency(item.total, '')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="mt-2 space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(sale.subtotal, '')}</span>
          </div>
          {sale.discountAmount > 0 && (
            <div className="flex justify-between">
              <span>Discount:</span>
              <span>-{formatCurrency(sale.discountAmount, '')}</span>
            </div>
          )}
          {sale.taxAmount > 0 && (
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>{formatCurrency(sale.taxAmount, '')}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-black pt-1 font-bold">
            <span>Total Amount:</span>
            <span>{formatCurrency(sale.totalAmount, '')}</span>
          </div>
          <div className="flex justify-between">
            <span>Paid Amount:</span>
            <span>{formatCurrency(sale.paidAmount, '')}</span>
          </div>
          {sale.creditAmount > 0 && (
            <>
              <div className="flex justify-between font-semibold">
                <span>Credit Remaining:</span>
                <span>{formatCurrency(sale.creditAmount, '')}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span>{PAYMENT_STATUS_LABELS[sale.paymentStatus]}</span>
              </div>
            </>
          )}
          <div className="flex justify-between">
            <span>Payment Method:</span>
            <span>{PAYMENT_METHOD_LABELS[sale.paymentMethod]}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 border-t border-dashed border-black pt-2 text-center text-xs">
          <p>{footerNote}</p>
          <p className="mt-1">*** {PAYMENT_STATUS_LABELS[sale.paymentStatus]} ***</p>
        </div>
      </div>
    </div>
  );
});
