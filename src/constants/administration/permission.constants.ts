export const STAFF_PERMISSION_CODES = [
  'procurerApplication.read',
  'procurerApplication.review',
  'admin.staff.read',
  'orders.read',
  'support.read',
  'uploads.moderate',
  'finance.read',
  'audit.read'
] as const;
export const APPLICATION_READ_PERMISSION = 'procurerApplication.read';
export const APPLICATION_REVIEW_PERMISSION = 'procurerApplication.review';

export const STAFF_PERMISSION_PROFILES = {
  SUPPORT_ADMIN: ['support.read'],
  APPLICATION_REVIEWER: ['procurerApplication.read', 'procurerApplication.review'],
  OPERATIONS_ADMIN: ['orders.read'],
  FINANCE_VIEWER: ['finance.read'],
  PLATFORM_ADMIN: [
    'procurerApplication.read',
    'procurerApplication.review',
    'admin.staff.read',
    'orders.read',
    'support.read',
    'uploads.moderate',
    'finance.read',
    'audit.read'
  ]
} as const;

export type StaffPermissionCode = (typeof STAFF_PERMISSION_CODES)[number];
