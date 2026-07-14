import { ActivityLog } from '@/lib/db/models/ActivityLog';
import type { JWTPayload } from '@/types';

export async function logActivity(
  action: string,
  module: string,
  description: string,
  user: JWTPayload,
  metadata?: Record<string, unknown>
) {
  return ActivityLog.create({
    action,
    module,
    description,
    performedBy: user.userId,
    performedByName: user.name,
    metadata: metadata || {},
  });
}

export async function getActivityLogs(filters?: { module?: string; limit?: number; page?: number }) {
  const query: Record<string, unknown> = {};
  if (filters?.module && filters.module !== 'all') query.module = filters.module;

  const limit = filters?.limit || 50;
  const page = filters?.page || 1;
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    ActivityLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ActivityLog.countDocuments(query),
  ]);

  return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
}
