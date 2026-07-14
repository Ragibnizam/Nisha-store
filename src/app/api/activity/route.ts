import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { getActivityLogs } from '@/lib/services/activityService';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, ['admin']);
  if ('error' in auth) return auth.error;

  try {
    await connectDB();
    const url = new URL(req.url);
    const moduleFilter = url.searchParams.get('module') || undefined;
    const page = parseInt(url.searchParams.get('page') || '1');

    const result = await getActivityLogs({ module: moduleFilter, page });
    return NextResponse.json({ data: result });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch activity logs' }, { status: 500 });
  }
}
