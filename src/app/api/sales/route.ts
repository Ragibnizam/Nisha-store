import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { createSale, getSales } from '@/lib/services/saleService';
import { requireAuth } from '@/lib/auth/middleware';
import { saleSchema } from '@/lib/validations/saleSchema';
import { getStartOfDay, getEndOfDay } from '@/lib/utils/date';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if ('error' in auth) return auth.error;

  try {
    await connectDB();
    const url = new URL(req.url);
    const type = url.searchParams.get('type') || undefined;
    const customerId = url.searchParams.get('customerId') || undefined;
    const startDateStr = url.searchParams.get('startDate');
    const endDateStr = url.searchParams.get('endDate');

    const startDate = startDateStr ? getStartOfDay(new Date(startDateStr)) : undefined;
    const endDate = endDateStr ? getEndOfDay(new Date(endDateStr)) : undefined;

    const sales = await getSales({ type, customerId, startDate, endDate });
    return NextResponse.json({ data: sales });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if ('error' in auth) return auth.error;

  try {
    await connectDB();
    const body = await req.json();
    const parsed = saleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message || 'Invalid input' }, { status: 400 });
    }

    const sale = await createSale(parsed.data, auth.user);
    return NextResponse.json({ data: sale, message: 'Sale completed' }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create sale';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
