export const ROLES = {
  ADMIN: 'admin' as const,
  STAFF: 'staff' as const,
};

export type Role = typeof ROLES.ADMIN | typeof ROLES.STAFF;

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  staff: 'Staff',
};
