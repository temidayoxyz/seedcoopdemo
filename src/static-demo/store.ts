/**
 * In-browser demo store for GitHub Pages (no Express/SQLite).
 * Session is kept in localStorage so login survives refresh.
 */

const STORAGE_KEY = 'seedcoop-static-demo-v1';
const SESSION_KEY = 'seedcoop-static-session-v1';

function uid() {
  return crypto.randomUUID();
}

function now() {
  return Math.floor(Date.now() / 1000);
}

function monthsAgo(n: number) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return Math.floor(d.getTime() / 1000);
}

function currentPeriod() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export type DemoUser = {
  id: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: number;
  updatedAt: number;
};

export type DemoMember = {
  id: string;
  userId: string;
  membershipNumber: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  status: string;
  totalContributionsKobo: number;
  joinedAt: number;
};

export type DemoState = {
  users: DemoUser[];
  members: DemoMember[];
  applications: any[];
  obligations: any[];
  ledger: any[];
  loanProducts: any[];
  loans: any[];
  guarantorRequests: any[];
  fundRequests: any[];
  announcements: any[];
  outbox: any[];
};

function createSeed(): DemoState {
  const adminId = uid();
  const treasurerId = uid();
  const loansId = uid();
  const auditorId = uid();
  const johnUserId = uid();
  const chidiUserId = uid();
  const temiUserId = uid();

  const johnMemberId = uid();
  const chidiMemberId = uid();
  const temiMemberId = uid();

  const emergencyId = uid();
  const developmentId = uid();
  const schoolId = uid();

  const t = now();
  const period = currentPeriod();

  return {
    users: [
      { id: adminId, email: 'admin@seedcoop.demo', passwordHash: 'demo123', role: 'SUPER_ADMIN', createdAt: t, updatedAt: t },
      { id: treasurerId, email: 'treasurer@seedcoop.demo', passwordHash: 'demo123', role: 'TREASURER', createdAt: t, updatedAt: t },
      { id: loansId, email: 'loans@seedcoop.demo', passwordHash: 'demo123', role: 'LOAN_OFFICER', createdAt: t, updatedAt: t },
      { id: auditorId, email: 'auditor@seedcoop.demo', passwordHash: 'demo123', role: 'AUDITOR', createdAt: t, updatedAt: t },
      { id: johnUserId, email: 'john@seedcoop.demo', passwordHash: 'demo123', role: 'MEMBER', createdAt: t, updatedAt: t },
      { id: chidiUserId, email: 'chidi@seedcoop.demo', passwordHash: 'demo123', role: 'MEMBER', createdAt: t, updatedAt: t },
      { id: temiUserId, email: 'temidayo@seedcoop.demo', passwordHash: 'demo123', role: 'MEMBER', createdAt: t, updatedAt: t },
    ],
    members: [
      {
        id: johnMemberId, userId: johnUserId, membershipNumber: 'SC-10042',
        firstName: 'John', lastName: 'Doe', phoneNumber: '+2348001234567',
        status: 'ACTIVE', totalContributionsKobo: 12000000, joinedAt: monthsAgo(6),
      },
      {
        id: chidiMemberId, userId: chidiUserId, membershipNumber: 'SC-2026-002',
        firstName: 'Chidi', lastName: 'Okafor', phoneNumber: '+2348023456789',
        status: 'ACTIVE', totalContributionsKobo: 24000000, joinedAt: monthsAgo(12),
      },
      {
        id: temiMemberId, userId: temiUserId, membershipNumber: 'SC-2026-003',
        firstName: 'Temidayo', lastName: 'Adebayo', phoneNumber: '+2348034567890',
        status: 'ACTIVE', totalContributionsKobo: 5000000, joinedAt: monthsAgo(2),
      },
    ],
    applications: [
      {
        id: uid(),
        reference: 'APP-2026-1001',
        firstName: 'Ngozi',
        lastName: 'Eze',
        email: 'ngozi@example.com',
        phoneNumber: '+2348051112233',
        employment: 'Teacher',
        status: 'PENDING',
        reviewNotes: null,
        submittedAt: monthsAgo(0),
      },
    ],
    obligations: [
      {
        id: uid(),
        memberId: johnMemberId,
        monthPeriod: period,
        expectedAmountKobo: 2000000,
        paidAmountKobo: 0,
        status: 'UNPAID',
        dueDate: t + 86400 * 10,
      },
      {
        id: uid(),
        memberId: chidiMemberId,
        monthPeriod: period,
        expectedAmountKobo: 2000000,
        paidAmountKobo: 2000000,
        status: 'PAID',
        dueDate: t + 86400 * 10,
      },
      {
        id: uid(),
        memberId: temiMemberId,
        monthPeriod: period,
        expectedAmountKobo: 2000000,
        paidAmountKobo: 1000000,
        status: 'PARTIAL',
        dueDate: t + 86400 * 10,
      },
    ],
    ledger: [
      {
        id: uid(),
        reference: 'DEMO-PAY-4912',
        type: 'CONTRIBUTION_PAYMENT',
        status: 'COMPLETED',
        description: 'Monthly contribution',
        amountKobo: 2000000,
        date: monthsAgo(1),
      },
      {
        id: uid(),
        reference: 'LN-2026-8192',
        type: 'LOAN_DISBURSEMENT',
        status: 'COMPLETED',
        description: 'Emergency loan disbursement',
        amountKobo: 5000000,
        date: monthsAgo(2),
      },
    ],
    loanProducts: [
      {
        id: emergencyId, name: 'Emergency Loan',
        minAmountKobo: 5000000, maxAmountKobo: 50000000,
        interestRate: 0.05, maxTermMonths: 6, requiredGuarantors: 1,
      },
      {
        id: developmentId, name: 'Development Loan',
        minAmountKobo: 100000000, maxAmountKobo: 1000000000,
        interestRate: 0.10, maxTermMonths: 24, requiredGuarantors: 2,
      },
      {
        id: schoolId, name: 'School Fees Loan',
        minAmountKobo: 20000000, maxAmountKobo: 200000000,
        interestRate: 0.07, maxTermMonths: 12, requiredGuarantors: 1,
      },
    ],
    loans: [
      {
        id: uid(),
        memberId: chidiMemberId,
        loanProductId: emergencyId,
        reference: 'LN-2026-1001',
        principalKobo: 5000000,
        interestKobo: 250000,
        totalDueKobo: 5250000,
        paidKobo: 1000000,
        status: 'ACTIVE',
        termMonths: 6,
        appliedAt: monthsAgo(3),
        disbursedAt: monthsAgo(2),
      },
    ],
    guarantorRequests: [],
    fundRequests: [
      {
        id: uid(),
        memberId: johnMemberId,
        reference: 'WDL-2026-4401',
        type: 'WITHDRAWAL',
        amountKobo: 500000,
        status: 'PENDING',
        requestedAt: monthsAgo(0),
        processedAt: null,
        processedBy: null,
        notes: 'Personal use',
      },
    ],
    announcements: [
      {
        id: uid(),
        title: 'Annual General Meeting',
        content: 'Our upcoming AGM will hold on the 15th of next month. All active members are expected.',
        audience: 'MEMBER',
        publishedAt: monthsAgo(1),
      },
      {
        id: uid(),
        title: 'Welcome to SeedCoop',
        content: 'We are excited to launch our new digital cooperative platform.',
        audience: 'PUBLIC',
        publishedAt: monthsAgo(2),
      },
    ],
    outbox: [
      {
        id: uid(),
        recipient: 'john@seedcoop.demo',
        template: 'WELCOME',
        subject: 'Welcome to SeedCoop',
        payload: JSON.stringify({ name: 'John' }),
        sentAt: monthsAgo(6),
      },
    ],
  };
}

export function loadState(): DemoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as DemoState;
  } catch {
    /* ignore */
  }
  const seed = createSeed();
  saveState(seed);
  return seed;
}

export function saveState(state: DemoState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SESSION_KEY);
  return loadState();
}

export type Session = { userId: string; portal: 'MEMBER' | 'ADMIN' };

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function setSession(session: Session | null) {
  if (!session) localStorage.removeItem(SESSION_KEY);
  else localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getAuth(state: DemoState) {
  const session = getSession();
  if (!session) return { user: null as DemoUser | null, member: null as DemoMember | null };
  const user = state.users.find((u) => u.id === session.userId) || null;
  if (!user) return { user: null, member: null };
  const member =
    user.role === 'MEMBER'
      ? state.members.find((m) => m.userId === user.id) || null
      : null;
  return { user, member };
}
