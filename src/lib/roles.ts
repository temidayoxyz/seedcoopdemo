export type StaffRole = 'SUPER_ADMIN' | 'ADMIN' | 'TREASURER';
export type AppRole = StaffRole | 'MEMBER';

export const ROLE_LABELS: Record<AppRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  TREASURER: 'Treasurer',
  MEMBER: 'Member',
};

export const ROLE_DUTIES: Record<StaffRole, string> = {
  SUPER_ADMIN: 'Full control — membership, loans, funds, investments, settings, and system reset',
  ADMIN: 'Governance ops — membership applications, member status, and loan approvals (no money movement)',
  TREASURER: 'Money movement — contributions, deposits/withdrawals, loan disbursement, investments & dividends',
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

/**
 * Three distinct staff roles (not a renamed auditor):
 * - Super Admin: everything including settings/reset and both approve + disburse
 * - Admin: governance (applications, members, loan approve) — read money surfaces, no treasury writes
 * - Treasurer: treasury writes (contributions, funds, disburse, investments, dividends) — no governance writes
 */
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
  ADMIN: [
    'applications:write',
    'members:write',
    'loans:approve',
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
};

export function can(role: string | undefined, permission: Permission): boolean {
  if (!role || role === 'MEMBER') return false;
  const list = MATRIX[role as StaffRole];
  return !!list?.includes(permission);
}

export function isStaff(role: string | undefined): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'TREASURER';
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
  if (role === 'ADMIN') {
    // Governance focus: applications + members + loan approval; money surfaces are read-only
    return [
      'dashboard', 'applications', 'members', 'contributions', 'deposits', 'withdrawals',
      'loans', 'investments', 'dividends', 'ledger', 'reports', 'outbox', 'profile',
    ];
  }
  // Treasurer — money ops, no applications / settings
  return [
    'dashboard', 'members', 'contributions', 'deposits', 'withdrawals',
    'loans', 'investments', 'dividends', 'ledger', 'reports', 'outbox', 'profile',
  ];
}
