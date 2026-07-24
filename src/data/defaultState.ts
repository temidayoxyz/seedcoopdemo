/**
 * Canonical cooperative state for all surfaces (static site + server seed).
 * Money amounts are always integer kobo.
 */

import { sideForType } from '../lib/money';

const PASSWORD = 'seedcoop';

function uid(prefix: string, n: number) {
  return `${prefix}-${String(n).padStart(4, '0')}`;
}

function monthsAgo(n: number) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return Math.floor(d.getTime() / 1000);
}

function daysFromNow(n: number) {
  return Math.floor(Date.now() / 1000) + n * 86400;
}

function periodOffset(monthDelta: number) {
  const d = new Date();
  d.setMonth(d.getMonth() + monthDelta);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export type CoopState = ReturnType<typeof createDefaultState>;

export function createDefaultState() {
  const t = Math.floor(Date.now() / 1000);
  const period0 = periodOffset(0);
  const period1 = periodOffset(-1);
  const period2 = periodOffset(-2);

  // Stable IDs so links stay consistent after reset
  const adminUserId = uid('user', 1);
  const treasurerUserId = uid('user', 2);
  const auditorUserId = uid('user', 3);

  const m = [
    { userId: uid('user', 11), memberId: uid('mem', 1), num: 'SC-001', first: 'Ada', last: 'Okonkwo', email: 'ada.okonkwo@seedcoop.ng', phone: '+2348010000001', months: 18, savings: 36000000 },
    { userId: uid('user', 12), memberId: uid('mem', 2), num: 'SC-002', first: 'Chidi', last: 'Okafor', email: 'chidi.okafor@seedcoop.ng', phone: '+2348010000002', months: 24, savings: 48000000 },
    { userId: uid('user', 13), memberId: uid('mem', 3), num: 'SC-003', first: 'Temidayo', last: 'Adebayo', email: 'temidayo.adebayo@seedcoop.ng', phone: '+2348010000003', months: 8, savings: 8000000 },
    { userId: uid('user', 14), memberId: uid('mem', 4), num: 'SC-004', first: 'Fatima', last: 'Bello', email: 'fatima.bello@seedcoop.ng', phone: '+2348010000004', months: 14, savings: 28000000 },
    { userId: uid('user', 15), memberId: uid('mem', 5), num: 'SC-005', first: 'Emeka', last: 'Nwosu', email: 'emeka.nwosu@seedcoop.ng', phone: '+2348010000005', months: 10, savings: 20000000 },
    { userId: uid('user', 16), memberId: uid('mem', 6), num: 'SC-006', first: 'Ngozi', last: 'Eze', email: 'ngozi.eze@seedcoop.ng', phone: '+2348010000006', months: 12, savings: 24000000 },
    { userId: uid('user', 17), memberId: uid('mem', 7), num: 'SC-007', first: 'Ibrahim', last: 'Yusuf', email: 'ibrahim.yusuf@seedcoop.ng', phone: '+2348010000007', months: 2, savings: 4000000 },
  ];

  const users = [
    { id: adminUserId, email: 'admin@seedcoop.ng', passwordHash: PASSWORD, role: 'SUPER_ADMIN', displayName: 'Amaka Okoro', createdAt: monthsAgo(24), updatedAt: t },
    { id: treasurerUserId, email: 'treasurer@seedcoop.ng', passwordHash: PASSWORD, role: 'TREASURER', displayName: 'Aisha Nuhu', createdAt: monthsAgo(24), updatedAt: t },
    { id: auditorUserId, email: 'auditor@seedcoop.ng', passwordHash: PASSWORD, role: 'AUDITOR', displayName: 'Tunde Bakare', createdAt: monthsAgo(18), updatedAt: t },
    ...m.map((x) => ({
      id: x.userId,
      email: x.email,
      passwordHash: PASSWORD,
      role: 'MEMBER',
      displayName: `${x.first} ${x.last}`,
      createdAt: monthsAgo(x.months),
      updatedAt: t,
    })),
  ];

  const members = m.map((x) => ({
    id: x.memberId,
    userId: x.userId,
    membershipNumber: x.num,
    firstName: x.first,
    lastName: x.last,
    phoneNumber: x.phone,
    status: 'ACTIVE',
    totalContributionsKobo: x.savings,
    joinedAt: monthsAgo(x.months),
  }));

  const monthly = 2000000; // ₦20,000

  // Varied contribution states for current cycle
  const obligations = [
    // SC-001 fully paid this + prior months
    { id: uid('ob', 1), memberId: m[0].memberId, monthPeriod: period0, expectedAmountKobo: monthly, paidAmountKobo: monthly, status: 'PAID', dueDate: daysFromNow(5) },
    { id: uid('ob', 2), memberId: m[0].memberId, monthPeriod: period1, expectedAmountKobo: monthly, paidAmountKobo: monthly, status: 'PAID', dueDate: daysFromNow(-25) },
    // SC-002 partial current
    { id: uid('ob', 3), memberId: m[1].memberId, monthPeriod: period0, expectedAmountKobo: monthly, paidAmountKobo: 1000000, status: 'PARTIAL', dueDate: daysFromNow(5) },
    { id: uid('ob', 4), memberId: m[1].memberId, monthPeriod: period1, expectedAmountKobo: monthly, paidAmountKobo: monthly, status: 'PAID', dueDate: daysFromNow(-25) },
    // SC-003 unpaid / arrears
    { id: uid('ob', 5), memberId: m[2].memberId, monthPeriod: period0, expectedAmountKobo: monthly, paidAmountKobo: 0, status: 'UNPAID', dueDate: daysFromNow(5) },
    { id: uid('ob', 6), memberId: m[2].memberId, monthPeriod: period1, expectedAmountKobo: monthly, paidAmountKobo: 0, status: 'OVERDUE', dueDate: daysFromNow(-25) },
    // SC-004 paid
    { id: uid('ob', 7), memberId: m[3].memberId, monthPeriod: period0, expectedAmountKobo: monthly, paidAmountKobo: monthly, status: 'PAID', dueDate: daysFromNow(5) },
    // SC-005 paid
    { id: uid('ob', 8), memberId: m[4].memberId, monthPeriod: period0, expectedAmountKobo: monthly, paidAmountKobo: monthly, status: 'PAID', dueDate: daysFromNow(5) },
    // SC-006 paid
    { id: uid('ob', 9), memberId: m[5].memberId, monthPeriod: period0, expectedAmountKobo: monthly, paidAmountKobo: monthly, status: 'PAID', dueDate: daysFromNow(5) },
    // SC-007 new — first obligation unpaid
    { id: uid('ob', 10), memberId: m[6].memberId, monthPeriod: period0, expectedAmountKobo: monthly, paidAmountKobo: 0, status: 'UNPAID', dueDate: daysFromNow(5) },
    { id: uid('ob', 11), memberId: m[6].memberId, monthPeriod: period1, expectedAmountKobo: monthly, paidAmountKobo: monthly, status: 'PAID', dueDate: daysFromNow(-20) },
  ];

  const emergencyId = uid('prod', 1);
  const developmentId = uid('prod', 2);
  const schoolId = uid('prod', 3);

  const loanProducts = [
    { id: emergencyId, name: 'Emergency Loan', minAmountKobo: 5000000, maxAmountKobo: 50000000, interestRate: 0.05, maxTermMonths: 6, requiredGuarantors: 1 },
    { id: developmentId, name: 'Development Loan', minAmountKobo: 50000000, maxAmountKobo: 500000000, interestRate: 0.10, maxTermMonths: 24, requiredGuarantors: 2 },
    { id: schoolId, name: 'School Fees Loan', minAmountKobo: 10000000, maxAmountKobo: 150000000, interestRate: 0.07, maxTermMonths: 12, requiredGuarantors: 1 },
  ];

  // SC-002 active loan mid-repayment
  const loanChidiId = uid('loan', 1);
  // SC-004 active loan nearly complete
  const loanFatimaId = uid('loan', 2);
  // SC-005 pending approval
  const loanEmekaId = uid('loan', 3);

  const loans = [
    {
      id: loanChidiId,
      memberId: m[1].memberId,
      loanProductId: emergencyId,
      reference: 'LN-2026-2002',
      principalKobo: 20000000,
      interestKobo: 1000000,
      totalDueKobo: 21000000,
      paidKobo: 7000000,
      status: 'ACTIVE',
      termMonths: 6,
      appliedAt: monthsAgo(4),
      disbursedAt: monthsAgo(3),
    },
    {
      id: loanFatimaId,
      memberId: m[3].memberId,
      loanProductId: schoolId,
      reference: 'LN-2026-2004',
      principalKobo: 30000000,
      interestKobo: 2100000,
      totalDueKobo: 32100000,
      paidKobo: 28000000,
      status: 'ACTIVE',
      termMonths: 12,
      appliedAt: monthsAgo(10),
      disbursedAt: monthsAgo(9),
    },
    {
      id: loanEmekaId,
      memberId: m[4].memberId,
      loanProductId: emergencyId,
      reference: 'LN-2026-2005',
      principalKobo: 15000000,
      interestKobo: 750000,
      totalDueKobo: 15750000,
      paidKobo: 0,
      status: 'PENDING_APPROVAL',
      termMonths: 6,
      appliedAt: monthsAgo(0),
      disbursedAt: null as number | null,
    },
  ];

  const guarantorRequests = [
    { id: uid('g', 1), loanId: loanChidiId, guarantorMemberId: m[0].memberId, status: 'ACCEPTED', comment: null, requestedAt: monthsAgo(4) },
    { id: uid('g', 2), loanId: loanFatimaId, guarantorMemberId: m[1].memberId, status: 'ACCEPTED', comment: null, requestedAt: monthsAgo(10) },
    { id: uid('g', 3), loanId: loanEmekaId, guarantorMemberId: m[0].memberId, status: 'ACCEPTED', comment: null, requestedAt: monthsAgo(0) },
    { id: uid('g', 4), loanId: loanEmekaId, guarantorMemberId: m[5].memberId, status: 'PENDING', comment: null, requestedAt: monthsAgo(0) },
  ];

  // SC-006 pending withdrawal
  const fundRequests = [
    {
      id: uid('fund', 1),
      memberId: m[5].memberId,
      reference: 'WDL-2026-6001',
      type: 'WITHDRAWAL',
      amountKobo: 5000000,
      status: 'PENDING',
      requestedAt: daysFromNow(-2),
      processedAt: null as number | null,
      processedBy: null as string | null,
      notes: 'Medical support for family',
    },
    {
      id: uid('fund', 2),
      memberId: m[0].memberId,
      reference: 'DEP-2026-1001',
      type: 'DEPOSIT',
      amountKobo: 10000000,
      status: 'APPROVED',
      requestedAt: monthsAgo(2),
      processedAt: monthsAgo(2),
      processedBy: treasurerUserId,
      notes: 'Voluntary thrift top-up',
    },
  ];

  const applications = [
    {
      id: uid('app', 1),
      reference: 'APP-2026-3010',
      firstName: 'Blessing',
      lastName: 'Adeyemi',
      email: 'blessing.adeyemi@email.com',
      phoneNumber: '+2348099001122',
      employment: 'Civil servant',
      status: 'PENDING',
      reviewNotes: null as string | null,
      submittedAt: daysFromNow(-3),
    },
  ];

  function ledgerRow(
    id: string,
    reference: string,
    type: string,
    amountKobo: number,
    date: number,
    description: string,
    memberId: string | null,
  ) {
    return {
      id,
      reference,
      type,
      status: 'COMPLETED',
      description,
      amountKobo,
      date,
      memberId,
      side: sideForType(type),
    };
  }

  const ledger = [
    ledgerRow(uid('tx', 1), 'PAY-2026-1101', 'CONTRIBUTION_PAYMENT', monthly, monthsAgo(1), `Monthly contribution ${period1} — SC-001`, m[0].memberId),
    ledgerRow(uid('tx', 2), 'PAY-2026-1102', 'CONTRIBUTION_PAYMENT', monthly, monthsAgo(1), `Monthly contribution ${period1} — SC-002`, m[1].memberId),
    ledgerRow(uid('tx', 3), 'DEP-2026-1001', 'DEPOSIT', 10000000, monthsAgo(2), 'Voluntary thrift top-up — SC-001', m[0].memberId),
    ledgerRow(uid('tx', 4), 'DISB-2026-2002', 'LOAN_DISBURSEMENT', 20000000, monthsAgo(3), 'Emergency loan disbursement — SC-002', m[1].memberId),
    ledgerRow(uid('tx', 5), 'REP-2026-2201', 'LOAN_REPAYMENT', 3500000, monthsAgo(2), 'Loan repayment LN-2026-2002 — SC-002', m[1].memberId),
    ledgerRow(uid('tx', 6), 'REP-2026-2202', 'LOAN_REPAYMENT', 3500000, monthsAgo(1), 'Loan repayment LN-2026-2002 — SC-002', m[1].memberId),
    ledgerRow(uid('tx', 7), 'DISB-2026-2004', 'LOAN_DISBURSEMENT', 30000000, monthsAgo(9), 'School fees loan — SC-004', m[3].memberId),
    ledgerRow(uid('tx', 8), 'REP-2026-2401', 'LOAN_REPAYMENT', 28000000, monthsAgo(1), 'Loan repayments (cumulative) — SC-004', m[3].memberId),
    ledgerRow(uid('tx', 9), 'PAY-2026-1107', 'CONTRIBUTION_PAYMENT', monthly, monthsAgo(1), `Monthly contribution ${period1} — SC-007`, m[6].memberId),
    ledgerRow(uid('tx', 10), 'INV-2026-0101', 'INVESTMENT_PURCHASE', 50000000, monthsAgo(6), 'Treasury bill placement — FGN 91-day', null),
    ledgerRow(uid('tx', 11), 'INV-2026-0102', 'INVESTMENT_RETURN', 2500000, monthsAgo(3), 'Investment return — FGN 91-day', null),
    ledgerRow(uid('tx', 12), 'DIV-2025-0001', 'DIVIDEND_PAYOUT', 7000000, monthsAgo(4), '2025 surplus dividend allocation', null),
  ];

  const investments = [
    {
      id: uid('inv', 1),
      name: 'FGN Treasury Bill (91-day)',
      category: 'Fixed Income',
      principalKobo: 50000000,
      currentValueKobo: 52500000,
      expectedReturnRate: 0.05,
      status: 'ACTIVE',
      acquiredAt: monthsAgo(6),
      notes: 'Rolled once; coupon booked as investment return',
    },
    {
      id: uid('inv', 2),
      name: 'Co-op Agro Input Pool',
      category: 'Agriculture',
      principalKobo: 30000000,
      currentValueKobo: 31800000,
      expectedReturnRate: 0.12,
      status: 'ACTIVE',
      acquiredAt: monthsAgo(8),
      notes: 'Seasonal farm input financing with partner growers',
    },
    {
      id: uid('inv', 3),
      name: 'Commercial Paper — ABC Plc',
      category: 'Money Market',
      principalKobo: 20000000,
      currentValueKobo: 20000000,
      expectedReturnRate: 0.08,
      status: 'MATURED',
      acquiredAt: monthsAgo(14),
      notes: 'Matured and returned to co-op pool',
    },
  ];

  const dividendPeriods = [
    {
      id: uid('divp', 1),
      label: '2025 Financial Year Surplus',
      surplusKobo: 7000000,
      status: 'DISTRIBUTED',
      declaredAt: monthsAgo(4),
      distributedAt: monthsAgo(4),
      notes: 'Board-approved dividend from thrift surplus and investment income',
    },
    {
      id: uid('divp', 2),
      label: '2026 Mid-Year Provisional',
      surplusKobo: 4500000,
      status: 'DECLARED',
      declaredAt: monthsAgo(0),
      distributedAt: null as number | null,
      notes: 'Awaiting distribution after AGM ratification',
    },
  ];

  // 2025 dividend allocated pro-rata by savings at distribution time (simplified equal-ish weights)
  const dividendAllocations = [
    { id: uid('diva', 1), periodId: uid('divp', 1), memberId: m[0].memberId, amountKobo: 1500000, status: 'PAID', paidAt: monthsAgo(4) },
    { id: uid('diva', 2), periodId: uid('divp', 1), memberId: m[1].memberId, amountKobo: 1800000, status: 'PAID', paidAt: monthsAgo(4) },
    { id: uid('diva', 3), periodId: uid('divp', 1), memberId: m[2].memberId, amountKobo: 400000, status: 'PAID', paidAt: monthsAgo(4) },
    { id: uid('diva', 4), periodId: uid('divp', 1), memberId: m[3].memberId, amountKobo: 1200000, status: 'PAID', paidAt: monthsAgo(4) },
    { id: uid('diva', 5), periodId: uid('divp', 1), memberId: m[4].memberId, amountKobo: 900000, status: 'PAID', paidAt: monthsAgo(4) },
    { id: uid('diva', 6), periodId: uid('divp', 1), memberId: m[5].memberId, amountKobo: 1000000, status: 'PAID', paidAt: monthsAgo(4) },
    { id: uid('diva', 7), periodId: uid('divp', 1), memberId: m[6].memberId, amountKobo: 200000, status: 'PAID', paidAt: monthsAgo(4) },
  ];

  // Note: dividends already paid should be reflected in member savings for those who received them —
  // seed savings already include historical net positions; we don't double-add.

  const announcements = [
    {
      id: uid('ann', 1),
      title: 'Annual General Meeting',
      content: 'The AGM will hold on the 15th of next month at 10:00 AM. All active members are expected to attend. Dividend ratification is on the agenda.',
      audience: 'MEMBER',
      publishedAt: monthsAgo(1),
    },
    {
      id: uid('ann', 2),
      title: 'Contribution due date reminder',
      content: 'Monthly thrift contributions are due by the 25th of each month. Members with arrears should regularise to remain loan-eligible.',
      audience: 'MEMBER',
      publishedAt: daysFromNow(-5),
    },
    {
      id: uid('ann', 3),
      title: 'Welcome to SeedCoop',
      content: 'SeedCoop is a member-owned thrift and credit cooperative. Join to save, access fair credit, and share in collective growth.',
      audience: 'PUBLIC',
      publishedAt: monthsAgo(6),
    },
  ];

  const outbox = [
    {
      id: uid('mail', 1),
      recipient: m[0].email,
      template: 'WELCOME',
      subject: 'Welcome to SeedCoop — membership confirmed',
      payload: JSON.stringify({ name: 'Ada Okonkwo', membershipNumber: 'SC-001' }),
      body: 'Dear Ada, your membership SC-001 is active. Monthly thrift is ₦20,000.',
      sentAt: monthsAgo(18),
    },
    {
      id: uid('mail', 2),
      recipient: m[1].email,
      template: 'LOAN_DISBURSED',
      subject: 'Loan LN-2026-2002 disbursed',
      payload: JSON.stringify({ reference: 'LN-2026-2002', amountKobo: 20000000 }),
      body: 'Dear Chidi, ₦200,000.00 has been disbursed for Emergency Loan LN-2026-2002.',
      sentAt: monthsAgo(3),
    },
    {
      id: uid('mail', 3),
      recipient: m[2].email,
      template: 'CONTRIBUTION_REMINDER',
      subject: 'Contribution reminder — outstanding dues',
      payload: JSON.stringify({ amountKobo: 4000000, periods: [period0, period1] }),
      body: 'Dear Temidayo, you have outstanding thrift obligations. Please pay to restore full standing.',
      sentAt: daysFromNow(-2),
    },
    {
      id: uid('mail', 4),
      recipient: m[4].email,
      template: 'LOAN_RECEIVED',
      subject: 'Loan application LN-2026-2005 received',
      payload: JSON.stringify({ reference: 'LN-2026-2005', amountKobo: 15000000 }),
      body: 'Dear Emeka, your loan application is under review by the cooperative board.',
      sentAt: daysFromNow(-1),
    },
    {
      id: uid('mail', 5),
      recipient: m[5].email,
      template: 'WITHDRAWAL_RECEIVED',
      subject: 'Withdrawal request WDL-2026-6001 received',
      payload: JSON.stringify({ reference: 'WDL-2026-6001', amountKobo: 5000000 }),
      body: 'Dear Ngozi, your withdrawal request is pending treasurer approval.',
      sentAt: daysFromNow(-2),
    },
    {
      id: uid('mail', 6),
      recipient: m[0].email,
      template: 'DIVIDEND_PAID',
      subject: '2025 surplus dividend credited',
      payload: JSON.stringify({ amountKobo: 1500000, period: '2025 Financial Year Surplus' }),
      body: 'Dear Ada, your dividend of ₦15,000.00 has been credited to your thrift balance.',
      sentAt: monthsAgo(4),
    },
    {
      id: uid('mail', 7),
      recipient: 'blessing.adeyemi@email.com',
      template: 'APPLICATION_RECEIVED',
      subject: 'Membership application APP-2026-3010 received',
      payload: JSON.stringify({ reference: 'APP-2026-3010' }),
      body: 'Dear Blessing, we received your membership application. The board will review it shortly.',
      sentAt: daysFromNow(-3),
    },
  ];

  const auditLogs = [
    {
      id: uid('aud', 1),
      actorId: adminUserId,
      actorRole: 'SUPER_ADMIN',
      action: 'SYSTEM_INIT',
      entityType: 'COOPERATIVE',
      entityReference: 'SEEDCOOP',
      timestamp: monthsAgo(24),
      summary: 'Cooperative platform initialised',
    },
  ];

  return {
    password: PASSWORD,
    users,
    members,
    applications,
    obligations,
    ledger,
    loanProducts,
    loans,
    guarantorRequests,
    fundRequests,
    investments,
    dividendPeriods,
    dividendAllocations,
    announcements,
    outbox,
    auditLogs,
    /** Directory for login UI */
    personas: {
      staff: [
        { email: 'admin@seedcoop.ng', role: 'SUPER_ADMIN', label: 'Amaka Okoro', subtitle: 'Super Admin', portal: 'ADMIN' as const },
        { email: 'treasurer@seedcoop.ng', role: 'TREASURER', label: 'Aisha Nuhu', subtitle: 'Treasurer', portal: 'ADMIN' as const },
        { email: 'auditor@seedcoop.ng', role: 'AUDITOR', label: 'Tunde Bakare', subtitle: 'Auditor', portal: 'ADMIN' as const },
      ],
      members: m.map((x) => ({
        email: x.email,
        role: 'MEMBER',
        label: `${x.first} ${x.last}`,
        subtitle: x.num,
        portal: 'MEMBER' as const,
        membershipNumber: x.num,
        tagline: memberTagline(x.num),
      })),
    },
  };
}

function memberTagline(num: string): string {
  switch (num) {
    case 'SC-001': return 'Fully paid · Strong thrift · No active loan';
    case 'SC-002': return 'Partial dues · Active emergency loan';
    case 'SC-003': return 'Arrears · Loan restricted';
    case 'SC-004': return 'School loan nearly complete';
    case 'SC-005': return 'Loan pending board approval';
    case 'SC-006': return 'Withdrawal pending';
    case 'SC-007': return 'New member · Building thrift';
    default: return 'Active member';
  }
}

export const DEFAULT_PASSWORD = PASSWORD;
