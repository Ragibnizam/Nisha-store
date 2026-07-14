import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromAuthHeader } from './jwt';
import type { JWTPayload } from '@/types';

export function getUserFromRequest(req: NextRequest): JWTPayload | null {
  const authHeader = req.headers.get('authorization');
  const token = getTokenFromAuthHeader(authHeader);
  if (!token) return null;
  return verifyToken(token);
}

export function unauthorized(): NextResponse {
  return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
}

export function forbidden(): NextResponse {
  return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
}

export function requireAuth(req: NextRequest, allowedRoles?: ('admin' | 'staff')[]): { user: JWTPayload } | { error: NextResponse } {
  const user = getUserFromRequest(req);
  if (!user) return { error: unauthorized() };
  if (allowedRoles && !allowedRoles.includes(user.role)) return { error: forbidden() };
  return { user };
}
