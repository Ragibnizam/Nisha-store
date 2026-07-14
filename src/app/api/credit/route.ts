import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { getCreditSummaries, getCustomerLedger } from '@/lib/services/creditService';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if ('error' in auth) return auth.error;

  try {
    await connectDB();
    const url = new URL(req.url);
    const customerId = url.searchParams.get('customerId');

    if (customerId) {
      const ledger = await getCustomerLedger(customerId);
      return NextResponse.json({ data: ledger });
    }

    const summaries = await getCreditSummaries();
    return NextResponse.json({ data: summaries });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch credit data';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
