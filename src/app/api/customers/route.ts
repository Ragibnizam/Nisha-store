import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { getAllCustomers, createCustomer, getCustomerByMobile } from '@/lib/services/customerService';
import { requireAuth } from '@/lib/auth/middleware';
import { customerSchema } from '@/lib/validations/customerSchema';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if ('error' in auth) return auth.error;

  try {
    await connectDB();
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || undefined;
    const customers = await getAllCustomers(search);
    return NextResponse.json({ data: customers });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if ('error' in auth) return auth.error;

  try {
    await connectDB();
    const body = await req.json();
    const parsed = customerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message || 'Invalid input' }, { status: 400 });
    }

    const existing = await getCustomerByMobile(parsed.data.mobile);
    if (existing) {
      return NextResponse.json({ data: existing, message: 'Customer already exists' });
    }

    const customer = await createCustomer({
      ...parsed.data,
      totalPurchases: 0,
      totalCredit: 0,
      totalPaid: 0,
      remainingBalance: 0,
      creditBills: 0,
      creditStatus: 'none',
    });
    return NextResponse.json({ data: customer, message: 'Customer created' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
