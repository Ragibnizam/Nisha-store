import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { Settings } from '@/lib/db/models/Settings';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if ('error' in auth) return auth.error;

  try {
    await connectDB();
    let settings: any = await Settings.findOne().lean();
    if (!settings) {
      const created = await Settings.create({});
      settings = created.toObject();
    }
    return NextResponse.json({ data: settings });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = requireAuth(req, ['admin']);
  if ('error' in auth) return auth.error;

  try {
    await connectDB();
    const body = await req.json();
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(body);
    } else {
      Object.assign(settings, body);
    }
    await settings.save();
    return NextResponse.json({ data: settings.toObject(), message: 'Settings updated' });
  } catch {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
