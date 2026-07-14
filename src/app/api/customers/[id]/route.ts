import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { getCustomerById, updateCustomer } from '@/lib/services/customerService';
import { requireAuth } from '@/lib/auth/middleware';
import { customerSchema } from '@/lib/validations/customerSchema';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if ('error' in auth) return auth.error;

  try {
    await connectDB();
    const { id } = await ctx.params;
    const customer = await getCustomerById(id);
    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    return NextResponse.json({ data: customer });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if ('error' in auth) return auth.error;

  try {
    await connectDB();
    const { id } = await ctx.params;
    const body = await req.json();
    const parsed = customerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message || 'Invalid input' }, { status: 400 });
    }

    const customer = await updateCustomer(id, parsed.data);
    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    return NextResponse.json({ data: customer, message: 'Customer updated' });
  } catch {
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}
