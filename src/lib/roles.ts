export type StaffRole = 'SUPER_ADMIN' | 'TREASURER' | 'AUDITOR';
export type AppRole = StaffRole | 'MEMBER';

export const ROLE_LABELS: Record<AppRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  TREASURER: 'Treasurer',
  AUDITOR: 'Auditor',
  MEMBER: 'Member',
};

export const ROLE_DUTIES: Record<StaffRole, string> = {
  SUPER_ADMIN: 'Full control — membership, loans, funds, investments, and settings',
  TREASURER: 'Contributions, deposits, withdrawals, loan disbursement, investments & dividends',
  AUDITOR: 'Read-only access to ledger, reports, members, and message outbox',
};

type Permission =
  | 'applications:write'
  | 'members:write'
  | 'contributions:write'
  | 'funds:write'
  | 'loans:approve'
  | 'loans:disburse'
  | 'investments:write'
  | 'dividends:write'
  | 'settings:write'
  | 'reset:write'
  | 'ledger:read'
  | 'reports:read'
  | 'outbox:read';

const MATRIX: Record<StaffRole, Permission[]> = {
  SUPER_ADMIN: [
    'applications:write',
    'members:write',
    'contributions:write',
    'funds:write',
    'loans:approve',
    'loans:disburse',
    'investments:write',
    'dividends:write',
    'settings:write',
    'reset:write',
    'ledger:read',
    'reports:read',
    'outbox:read',
  ],
  TREASURER: [
    'contributions:write',
    'funds:write',
    'loans:disburse',
    'investments:write',
    'dividends:write',
    'ledger:read',
    'reports:read',
    'outbox:read',
  ],
  AUDITOR: ['ledger:read', 'reports:read', 'outbox:read'],
};

export function can(role: string | undefined, permission: Permission): boolean {
  if (!role || role === 'MEMBER') return false;
  const list = MATRIX[role as StaffRole];
  return !!list?.includes(permission);
}

export function isStaff(role: string | undefined): boolean {
  return role === 'SUPER_ADMIN' || role === 'TREASURER' || role === 'AUDITOR';
}

export type NavKey =
  | 'dashboard'
  | 'applications'
  | 'members'
  | 'contributions'
  | 'deposits'
  | 'withdrawals'
  | 'loans'
  | 'investments'
  | 'dividends'
  | 'ledger'
  | 'reports'
  | 'outbox'
  | 'profile'
  | 'settings';

export function adminNavForRole(role: string): NavKey[] {
  if (role === 'SUPER_ADMIN') {
    return [
      'dashboard', 'applications', 'members', 'contributions', 'deposits', 'withdrawals',
      'loans', 'investments', 'dividends', 'ledger', 'reports', 'outbox', 'profile', 'settings',
    ];
  }
  if (role === 'TREASURER') {
    return [
      'dashboard', 'members', 'contributions', 'deposits', 'withdrawals',
      'loans', 'investments', 'dividends', 'ledger', 'reports', 'outbox', 'profile',
    ];
  }
  // Auditor
  return [
    'dashboard', 'members', 'contributions', 'deposits', 'withdrawals',
    'loans', 'investments', 'dividends', 'ledger', 'reports', 'outbox', 'profile',
  ];
}
