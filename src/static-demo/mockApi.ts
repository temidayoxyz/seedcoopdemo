import { createDefaultState } from '../data/defaultState';
import { can, isStaff } from '../lib/roles';
import { makeReference, sideForType } from '../lib/money';
import { getAuth, getSession, loadState, resetState, saveState, setSession, type CoopState } from './store';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function pathOf(url: string): string {
  try {
    const u = new URL(url, window.location.origin);
    return u.pathname.replace(/\/+$/, '') || '/';
  } catch {
    return url.split('?')[0];
  }
}

function now() {
  return Math.floor(Date.now() / 1000);
}

function uid() {
  return crypto.randomUUID();
}

async function readBody(init?: RequestInit): Promise<any> {
  if (!init?.body) return {};
  if (typeof init.body === 'string') {
    try {
      return JSON.parse(init.body);
    } catch {
      return {};
    }
  }
  return {};
}

function requireMember(state: CoopState) {
  const { user, member, portal } = getAuth(state);
  // Member portal only — staff dual-identity uses portal switch, not role demotion
  if (!user || !member || portal !== 'MEMBER') return null;
  return { user, member };
}

function requireStaff(state: CoopState) {
  const { user, portal } = getAuth(state);
  if (!user || !isStaff(user.role) || portal !== 'ADMIN') return null;
  return user;
}

function pushLedger(
  state: CoopState,
  opts: {
    reference: string;
    type: string;
    amountKobo: number;
    description: string;
    memberId: string | null;
  },
) {
  state.ledger.unshift({
    id: uid(),
    reference: opts.reference,
    type: opts.type,
    status: 'COMPLETED',
    description: opts.description,
    amountKobo: opts.amountKobo,
    date: now(),
    memberId: opts.memberId,
    side: sideForType(opts.type),
  });
}

function pushMail(
  state: CoopState,
  recipient: string,
  template: string,
  subject: string,
  payload: object,
  body: string,
) {
  state.outbox.unshift({
    id: uid(),
    recipient,
    template,
    subject,
    payload: JSON.stringify(payload),
    body,
    sentAt: now(),
  });
}

function enrichGuarantors(state: CoopState, loanId: string) {
  return state.guarantorRequests
    .filter((g) => g.loanId === loanId)
    .map((g) => {
      const m = state.members.find((x) => x.id === g.guarantorMemberId);
      return {
        id: g.id,
        status: g.status,
        member: m
          ? {
              id: m.id,
              firstName: m.firstName,
              lastName: m.lastName,
              membershipNumber: m.membershipNumber,
            }
          : null,
      };
    });
}

function memberStatements(state: CoopState, memberId: string) {
  const rows = state.ledger
    .filter((l) => l.memberId === memberId)
    .sort((a, b) => a.date - b.date);

  let balance = 0;
  const lines = rows.map((r) => {
    // Member thrift balance view: contributions/deposits/dividends increase; withdrawals decrease
    if (['CONTRIBUTION_PAYMENT', 'DEPOSIT', 'DIVIDEND_PAYOUT'].includes(r.type) && r.memberId === memberId) {
      // Dividend was co-op debit but credit to member savings
      if (r.type === 'DIVIDEND_PAYOUT') balance += r.amountKobo;
      else balance += r.amountKobo;
    } else if (r.type === 'WITHDRAWAL' || r.type === 'WITHDRAWAL_PAYMENT') {
      balance -= r.amountKobo;
    }
    // Loan disbursement/repayment tracked separately for statement display
    return {
      ...r,
      runningBalanceKobo: balance,
    };
  });

  // Align opening so final balance matches member.totalContributionsKobo
  const member = state.members.find((m) => m.id === memberId)!;
  const last = lines[lines.length - 1]?.runningBalanceKobo ?? 0;
  const delta = member.totalContributionsKobo - last;
  if (delta !== 0 && lines.length) {
    for (const line of lines) line.runningBalanceKobo += delta;
  }

  return lines.reverse();
}

function coOpPoolTotals(state: CoopState) {
  let credits = 0;
  let debits = 0;
  for (const l of state.ledger) {
    if (l.side === 'CREDIT') credits += l.amountKobo;
    else debits += l.amountKobo;
  }
  return { credits, debits, net: credits - debits };
}

export async function handleMockApi(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const method = (init?.method || 'GET').toUpperCase();
  const path = pathOf(url);
  const apiPath = path.includes('/api/') ? path.slice(path.indexOf('/api/')) : path;
  let state = loadState();
  const body = method !== 'GET' && method !== 'HEAD' ? await readBody(init) : {};

  // —— Public / auth ——
  if (apiPath === '/api/health') return json({ status: 'ok' });

  if (apiPath === '/api/auth/personas' && method === 'GET') {
    return json({ personas: state.personas, passwordHint: state.password });
  }

  if (apiPath === '/api/auth/login' && method === 'POST') {
    const user = state.users.find((u) => u.email === body.email);
    if (!user || user.passwordHash !== body.password) {
      return json({ error: 'Invalid credentials' }, 401);
    }
    const member = state.members.find((m) => m.userId === user.id) || null;
    const portal = body.portal as 'MEMBER' | 'ADMIN';

    if (portal === 'MEMBER') {
      // Pure members, or staff with a linked member profile (dual identity)
      if (!member) {
        return json({ error: 'No member profile linked to this account' }, 403);
      }
    } else if (portal === 'ADMIN') {
      if (!isStaff(user.role)) {
        return json({ error: 'Not a staff account' }, 403);
      }
    } else {
      return json({ error: 'Invalid portal' }, 400);
    }

    setSession({ userId: user.id, portal });
    const auth = getAuth(state);
    return json({ success: true, ...auth });
  }

  if (apiPath === '/api/auth/switch-portal' && method === 'POST') {
    const session = getSession();
    if (!session) return json({ error: 'Not signed in' }, 401);
    const user = state.users.find((u) => u.id === session.userId);
    if (!user) return json({ error: 'Not signed in' }, 401);
    const member = state.members.find((m) => m.userId === user.id) || null;
    const portal = body.portal as 'MEMBER' | 'ADMIN';

    if (portal === 'MEMBER') {
      if (!isStaff(user.role) || !member) {
        return json({ error: 'Cannot switch to member view' }, 403);
      }
    } else if (portal === 'ADMIN') {
      if (!isStaff(user.role)) {
        return json({ error: 'Cannot switch to staff view' }, 403);
      }
    } else {
      return json({ error: 'Invalid portal' }, 400);
    }

    setSession({ userId: user.id, portal });
    return json({ success: true, ...getAuth(state) });
  }

  if (apiPath === '/api/auth/logout' && method === 'POST') {
    setSession(null);
    return json({ success: true });
  }

  if (apiPath === '/api/auth/me' && method === 'GET') {
    return json(getAuth(state));
  }

  if (apiPath === '/api/system/reset' && method === 'POST') {
    // Available from sign-in and staff settings so walkthroughs can restore a clean state
    state = resetState();
    return json({ success: true, message: 'Cooperative data restored to default state' });
  }

  // —— Member ——
  if (apiPath === '/api/members/dashboard' && method === 'GET') {
    const auth = requireMember(state);
    if (!auth) return json({ error: 'Unauthorized' }, 401);
    const member = state.members.find((m) => m.id === auth.member.id)!;
    const loans = state.loans
      .filter((l) => l.memberId === member.id)
      .sort((a, b) => b.appliedAt - a.appliedAt)
      .map((loan) => ({ ...loan, guarantors: enrichGuarantors(state, loan.id) }));
    const obligations = state.obligations
      .filter((o) => o.memberId === member.id)
      .sort((a, b) => b.dueDate - a.dueDate);
    const dividends = state.dividendAllocations
      .filter((d) => d.memberId === member.id)
      .map((d) => ({
        ...d,
        period: state.dividendPeriods.find((p) => p.id === d.periodId),
      }));
    const pool = coOpPoolTotals(state);
    return json({
      member,
      loans,
      obligations,
      dividends,
      investmentsSummary: {
        activeCount: state.investments.filter((i) => i.status === 'ACTIVE').length,
        totalValueKobo: state.investments.reduce((s, i) => s + i.currentValueKobo, 0),
      },
      coOpNetKobo: pool.net,
    });
  }

  if (apiPath === '/api/members/contributions/pay' && method === 'POST') {
    const auth = requireMember(state);
    if (!auth) return json({ error: 'Unauthorized' }, 401);
    const obligation = state.obligations.find((o) => o.id === body.obligationId);
    if (!obligation || obligation.memberId !== auth.member.id) {
      return json({ error: 'Obligation not found' }, 404);
    }
    const amountToPay = obligation.expectedAmountKobo - obligation.paidAmountKobo;
    if (amountToPay <= 0) return json({ error: 'Obligation already paid' }, 400);
    obligation.paidAmountKobo += amountToPay;
    obligation.status = 'PAID';
    const member = state.members.find((m) => m.id === auth.member.id)!;
    member.totalContributionsKobo += amountToPay;
    const ref = makeReference('PAY');
    pushLedger(state, {
      reference: ref,
      type: 'CONTRIBUTION_PAYMENT',
      amountKobo: amountToPay,
      description: `Monthly contribution ${obligation.monthPeriod} — ${member.membershipNumber}`,
      memberId: member.id,
    });
    pushMail(
      state,
      auth.user.email,
      'CONTRIBUTION_RECEIPT',
      `Contribution receipt ${ref}`,
      { amountKobo: amountToPay, reference: ref, period: obligation.monthPeriod },
      `Payment of ₦${(amountToPay / 100).toFixed(2)} recorded for ${obligation.monthPeriod}. Ref: ${ref}`,
    );
    saveState(state);
    return json({
      success: true,
      reference: ref,
      amountKobo: amountToPay,
      receipt: {
        title: 'Contribution Receipt',
        reference: ref,
        amountKobo: amountToPay,
        memberName: `${member.firstName} ${member.lastName}`,
        membershipNumber: member.membershipNumber,
        description: `Thrift contribution for ${obligation.monthPeriod}`,
        typeLabel: 'Contribution payment',
        date: now(),
      },
    });
  }

  // Back-compat alias
  if (apiPath === '/api/members/contributions/simulate-payment' && method === 'POST') {
    return handleMockApi('/api/members/contributions/pay', {
      method: 'POST',
      body: JSON.stringify({ obligationId: body.obligationId }),
    });
  }

  if (apiPath === '/api/members/loans/metadata' && method === 'GET') {
    const auth = requireMember(state);
    if (!auth) return json({ error: 'Unauthorized' }, 401);
    const member = state.members.find((m) => m.id === auth.member.id)!;
    const unpaid = state.obligations.some(
      (o) => o.memberId === member.id && (o.status === 'UNPAID' || o.status === 'OVERDUE' || o.status === 'PARTIAL'),
    );
    const activeLoan = state.loans.some((l) => l.memberId === member.id && ['ACTIVE', 'PENDING_APPROVAL', 'APPROVED'].includes(l.status));
    const maxEligible = unpaid ? 0 : member.totalContributionsKobo * 2;
    return json({
      products: state.loanProducts,
      eligibleGuarantors: state.members.filter((m) => m.status === 'ACTIVE' && m.id !== member.id),
      eligibility: {
        eligible: !unpaid && !activeLoan && member.totalContributionsKobo >= 5000000,
        maxAmountKobo: maxEligible,
        reasons: [
          unpaid ? 'Settle outstanding contributions first' : null,
          activeLoan ? 'You already have an open loan application or active loan' : null,
          member.totalContributionsKobo < 5000000 ? 'Minimum thrift balance of ₦50,000 required' : null,
        ].filter(Boolean),
      },
    });
  }

  if (apiPath === '/api/members/loans/apply' && method === 'POST') {
    const auth = requireMember(state);
    if (!auth) return json({ error: 'Unauthorized' }, 401);
    const product = state.loanProducts.find((p) => p.id === body.productId);
    if (!product) return json({ error: 'Invalid product' }, 400);
    const loanId = uid();
    const reference = makeReference('LN');
    const interestKobo = Math.round(body.amountKobo * product.interestRate);
    state.loans.unshift({
      id: loanId,
      memberId: auth.member.id,
      loanProductId: body.productId,
      reference,
      principalKobo: body.amountKobo,
      interestKobo,
      totalDueKobo: body.amountKobo + interestKobo,
      paidKobo: 0,
      termMonths: body.termMonths,
      status: 'PENDING_APPROVAL',
      appliedAt: now(),
      disbursedAt: null,
    });
    for (const gid of body.guarantors || []) {
      state.guarantorRequests.push({
        id: uid(),
        loanId,
        guarantorMemberId: gid,
        status: 'ACCEPTED',
        comment: null,
        requestedAt: now(),
      });
    }
    pushMail(
      state,
      auth.user.email,
      'LOAN_RECEIVED',
      `Loan application ${reference} received`,
      { reference, amountKobo: body.amountKobo },
      `Your loan application ${reference} is pending board approval.`,
    );
    saveState(state);
    return json({ success: true, reference });
  }

  const memberLoanCancel = apiPath.match(/^\/api\/members\/loans\/([^/]+)\/cancel$/);
  if (memberLoanCancel && method === 'POST') {
    const auth = requireMember(state);
    if (!auth) return json({ error: 'Unauthorized' }, 401);
    const loan = state.loans.find((l) => l.id === memberLoanCancel[1]);
    if (!loan || loan.memberId !== auth.member.id) return json({ error: 'Not found' }, 404);
    if (loan.status !== 'PENDING_APPROVAL') return json({ error: 'Only pending applications can be cancelled' }, 400);
    loan.status = 'CANCELLED';
    saveState(state);
    return json({ success: true });
  }

  if (apiPath === '/api/members/funds' && method === 'GET') {
    const auth = requireMember(state);
    if (!auth) return json({ error: 'Unauthorized' }, 401);
    return json({
      requests: state.fundRequests
        .filter((r) => r.memberId === auth.member.id)
        .sort((a, b) => b.requestedAt - a.requestedAt),
    });
  }

  if (apiPath === '/api/members/funds/request' && method === 'POST') {
    const auth = requireMember(state);
    if (!auth) return json({ error: 'Unauthorized' }, 401);
    const { type, amountKobo, notes } = body;
    if (!['DEPOSIT', 'WITHDRAWAL'].includes(type) || amountKobo <= 0) {
      return json({ error: 'Invalid request' }, 400);
    }
    const member = state.members.find((m) => m.id === auth.member.id)!;
    if (type === 'WITHDRAWAL' && amountKobo > member.totalContributionsKobo) {
      return json({ error: 'Insufficient thrift balance' }, 400);
    }
    const reference = makeReference(type === 'DEPOSIT' ? 'DEP' : 'WDL');
    const id = uid();
    const t = now();
    if (type === 'DEPOSIT') {
      state.fundRequests.unshift({
        id, memberId: member.id, reference, type, amountKobo,
        status: 'APPROVED', requestedAt: t, processedAt: t, processedBy: null, notes,
      });
      member.totalContributionsKobo += amountKobo;
      pushLedger(state, {
        reference,
        type: 'DEPOSIT',
        amountKobo,
        description: `Member deposit — ${member.membershipNumber}`,
        memberId: member.id,
      });
      pushMail(state, auth.user.email, 'DEPOSIT_RECEIPT', `Deposit receipt ${reference}`, { amountKobo, reference }, `Deposit of ₦${(amountKobo / 100).toFixed(2)} credited. Ref: ${reference}`);
      saveState(state);
      return json({
        success: true,
        reference,
        receipt: {
          title: 'Deposit Receipt',
          reference,
          amountKobo,
          memberName: `${member.firstName} ${member.lastName}`,
          membershipNumber: member.membershipNumber,
          description: notes || 'Voluntary deposit',
          typeLabel: 'Deposit',
          date: t,
        },
      });
    }
    state.fundRequests.unshift({
      id, memberId: member.id, reference, type, amountKobo,
      status: 'PENDING', requestedAt: t, processedAt: null, processedBy: null, notes,
    });
    pushMail(state, auth.user.email, 'WITHDRAWAL_RECEIVED', `Withdrawal request ${reference} received`, { amountKobo, reference }, `Your withdrawal request is pending treasurer approval.`);
    saveState(state);
    return json({ success: true, reference });
  }

  const fundCancel = apiPath.match(/^\/api\/members\/funds\/([^/]+)\/cancel$/);
  if (fundCancel && method === 'POST') {
    const auth = requireMember(state);
    if (!auth) return json({ error: 'Unauthorized' }, 401);
    const request = state.fundRequests.find((r) => r.id === fundCancel[1]);
    if (!request || request.memberId !== auth.member.id) return json({ error: 'Not found' }, 404);
    if (request.status !== 'PENDING') return json({ error: 'Only pending requests can be cancelled' }, 400);
    request.status = 'CANCELLED';
    request.processedAt = now();
    saveState(state);
    return json({ success: true });
  }

  if (apiPath === '/api/members/statements' && method === 'GET') {
    const auth = requireMember(state);
    if (!auth) return json({ error: 'Unauthorized' }, 401);
    const member = state.members.find((m) => m.id === auth.member.id)!;
    return json({
      member,
      lines: memberStatements(state, member.id),
      balanceKobo: member.totalContributionsKobo,
    });
  }

  if (apiPath === '/api/members/notifications' && method === 'GET') {
    const auth = requireMember(state);
    if (!auth) return json({ error: 'Unauthorized' }, 401);
    return json({
      announcements: state.announcements
        .filter((a) => a.audience === 'MEMBER' || a.audience === 'PUBLIC')
        .sort((a, b) => b.publishedAt - a.publishedAt),
      emails: state.outbox
        .filter((m) => m.recipient === auth.user.email)
        .sort((a, b) => b.sentAt - a.sentAt),
    });
  }

  if (apiPath === '/api/members/dividends' && method === 'GET') {
    const auth = requireMember(state);
    if (!auth) return json({ error: 'Unauthorized' }, 401);
    return json({
      allocations: state.dividendAllocations
        .filter((d) => d.memberId === auth.member.id)
        .map((d) => ({
          ...d,
          period: state.dividendPeriods.find((p) => p.id === d.periodId),
        })),
      periods: state.dividendPeriods,
    });
  }

  if (apiPath === '/api/members/investments' && method === 'GET') {
    const auth = requireMember(state);
    if (!auth) return json({ error: 'Unauthorized' }, 401);
    return json({
      investments: state.investments,
      totalValueKobo: state.investments.reduce((s, i) => s + i.currentValueKobo, 0),
    });
  }

  if (apiPath === '/api/members/profile/update' && method === 'POST') {
    const auth = requireMember(state);
    if (!auth) return json({ error: 'Unauthorized' }, 401);
    const member = state.members.find((m) => m.id === auth.member.id)!;
    member.phoneNumber = body.phoneNumber || member.phoneNumber;
    member.firstName = body.firstName || member.firstName;
    member.lastName = body.lastName || member.lastName;
    saveState(state);
    return json({ success: true });
  }

  // —— Admin ——
  if (apiPath === '/api/admin/dashboard' && method === 'GET') {
    const user = requireStaff(state);
    if (!user) return json({ error: 'Unauthorized' }, 403);
    const activeMembers = state.members.filter((m) => m.status === 'ACTIVE');
    const pendingApplications = state.applications.filter((a) => a.status === 'PENDING');
    const totalContributions = state.members.reduce((s, m) => s + m.totalContributionsKobo, 0);
    const activeLoans = state.loans.filter((l) => l.status === 'ACTIVE');
    const activeLoanPortfolio = activeLoans.reduce((s, l) => s + (l.totalDueKobo - l.paidKobo), 0);
    const pendingWithdrawals = state.fundRequests.filter((r) => r.type === 'WITHDRAWAL' && r.status === 'PENDING');
    const pendingLoans = state.loans.filter((l) => l.status === 'PENDING_APPROVAL');
    const pool = coOpPoolTotals(state);
    // current period compliance
    const periods = [...new Set(state.obligations.map((o) => o.monthPeriod))].sort().reverse();
    const currentPeriod = periods[0];
    const currentObs = state.obligations.filter((o) => o.monthPeriod === currentPeriod);
    const paidCount = currentObs.filter((o) => o.status === 'PAID').length;

    return json({
      activeMembers: activeMembers.length,
      pendingApplications: pendingApplications.length,
      totalContributions,
      activeLoanPortfolio,
      pendingWithdrawals: pendingWithdrawals.length,
      pendingLoans: pendingLoans.length,
      investmentValueKobo: state.investments.reduce((s, i) => s + i.currentValueKobo, 0),
      pool,
      contributionCompliance: currentObs.length ? Math.round((paidCount / currentObs.length) * 100) : 100,
      recentApplications: [...state.applications].sort((a, b) => b.submittedAt - a.submittedAt).slice(0, 5),
      recentTransactions: [...state.ledger].sort((a, b) => b.date - a.date).slice(0, 8),
      role: user.role,
    });
  }

  if (apiPath === '/api/admin/applications' && method === 'GET') {
    if (!requireStaff(state)) return json({ error: 'Unauthorized' }, 403);
    return json({ applications: [...state.applications].sort((a, b) => b.submittedAt - a.submittedAt) });
  }

  const appApprove = apiPath.match(/^\/api\/admin\/applications\/([^/]+)\/approve$/);
  if (appApprove && method === 'POST') {
    const user = requireStaff(state);
    if (!user || !can(user.role, 'applications:write')) return json({ error: 'Only Super Admin or Admin can approve memberships' }, 403);
    const application = state.applications.find((a) => a.id === appApprove[1]);
    if (!application) return json({ error: 'Not found' }, 404);
    const membershipNumber = `SC-${String(state.members.length + 1).padStart(3, '0')}`;
    const userId = uid();
    const memberId = uid();
    const t = now();
    state.users.push({
      id: userId,
      email: application.email,
      passwordHash: state.password,
      role: 'MEMBER',
      displayName: `${application.firstName} ${application.lastName}`,
      createdAt: t,
      updatedAt: t,
    });
    state.members.push({
      id: memberId,
      userId,
      membershipNumber,
      firstName: application.firstName,
      lastName: application.lastName,
      phoneNumber: application.phoneNumber,
      status: 'ACTIVE',
      totalContributionsKobo: 0,
      joinedAt: t,
    });
    application.status = 'APPROVED';
    pushMail(
      state,
      application.email,
      'MEMBERSHIP_APPROVED',
      'Welcome to SeedCoop — membership approved',
      { membershipNumber },
      `Your membership number is ${membershipNumber}.`,
    );
    saveState(state);
    return json({ success: true, member: { membershipNumber } });
  }

  if (apiPath === '/api/admin/loans' && method === 'GET') {
    if (!requireStaff(state)) return json({ error: 'Unauthorized' }, 403);
    const loans = [...state.loans]
      .sort((a, b) => b.appliedAt - a.appliedAt)
      .map((loan) => ({
        ...loan,
        member: state.members.find((m) => m.id === loan.memberId) || null,
        guarantors: enrichGuarantors(state, loan.id),
      }));
    return json({ loans });
  }

  const loanApprove = apiPath.match(/^\/api\/admin\/loans\/([^/]+)\/approve$/);
  if (loanApprove && method === 'POST') {
    const user = requireStaff(state);
    if (!user || !can(user.role, 'loans:approve')) return json({ error: 'Only Super Admin or Admin can approve loans' }, 403);
    const loan = state.loans.find((l) => l.id === loanApprove[1]);
    if (!loan) return json({ error: 'Not found' }, 404);
    loan.status = 'APPROVED';
    const member = state.members.find((m) => m.id === loan.memberId);
    const u = state.users.find((x) => x.id === member?.userId);
    if (u) {
      pushMail(state, u.email, 'LOAN_APPROVED', `Loan ${loan.reference} approved`, { reference: loan.reference }, 'Your loan was approved and awaits disbursement by the Treasurer.');
    }
    saveState(state);
    return json({ success: true });
  }

  const loanDisburse = apiPath.match(/^\/api\/admin\/loans\/([^/]+)\/disburse$/);
  if (loanDisburse && method === 'POST') {
    const user = requireStaff(state);
    if (!user || !can(user.role, 'loans:disburse')) return json({ error: 'Treasurer or Super Admin can disburse' }, 403);
    const loan = state.loans.find((l) => l.id === loanDisburse[1]);
    if (!loan) return json({ error: 'Not found' }, 404);
    if (!['APPROVED', 'PENDING_APPROVAL'].includes(loan.status) && loan.status !== 'APPROVED') {
      // Allow disburse from APPROVED; if still pending and super admin, allow path via approve first
    }
    if (loan.status === 'PENDING_APPROVAL' && !can(user.role, 'loans:approve')) {
      return json({ error: 'Loan must be approved before disbursement' }, 400);
    }
    if (loan.status === 'PENDING_APPROVAL') loan.status = 'APPROVED';
    loan.status = 'ACTIVE';
    loan.disbursedAt = now();
    const ref = makeReference('DISB');
    const member = state.members.find((m) => m.id === loan.memberId)!;
    pushLedger(state, {
      reference: ref,
      type: 'LOAN_DISBURSEMENT',
      amountKobo: loan.principalKobo,
      description: `Loan disbursement ${loan.reference} — ${member.membershipNumber}`,
      memberId: member.id,
    });
    const u = state.users.find((x) => x.id === member.userId);
    if (u) {
      pushMail(state, u.email, 'LOAN_DISBURSED', `Loan ${loan.reference} disbursed`, { reference: loan.reference, amountKobo: loan.principalKobo }, `₦${(loan.principalKobo / 100).toFixed(2)} disbursed.`);
    }
    saveState(state);
    return json({
      success: true,
      receipt: {
        title: 'Loan Disbursement Receipt',
        reference: ref,
        amountKobo: loan.principalKobo,
        memberName: `${member.firstName} ${member.lastName}`,
        membershipNumber: member.membershipNumber,
        description: `Disbursement of ${loan.reference}`,
        typeLabel: 'Loan disbursement',
        date: now(),
      },
    });
  }

  if (apiPath === '/api/admin/members' && method === 'GET') {
    if (!requireStaff(state)) return json({ error: 'Unauthorized' }, 403);
    const usersMap = Object.fromEntries(state.users.map((u) => [u.id, u]));
    return json({
      members: [...state.members]
        .sort((a, b) => a.membershipNumber.localeCompare(b.membershipNumber))
        .map((m) => ({
          ...m,
          email: m.userId ? usersMap[m.userId]?.email : 'N/A',
        })),
    });
  }

  const memberStatus = apiPath.match(/^\/api\/admin\/members\/([^/]+)\/status$/);
  if (memberStatus && method === 'POST') {
    const user = requireStaff(state);
    if (!user || !can(user.role, 'members:write')) return json({ error: 'Only Super Admin or Admin can change member status' }, 403);
    const member = state.members.find((m) => m.id === memberStatus[1]);
    if (!member) return json({ error: 'Not found' }, 404);
    member.status = body.status;
    saveState(state);
    return json({ success: true });
  }

  if (apiPath === '/api/admin/contributions' && method === 'GET') {
    if (!requireStaff(state)) return json({ error: 'Unauthorized' }, 403);
    const membersMap = Object.fromEntries(state.members.map((m) => [m.id, m]));
    return json({
      obligations: [...state.obligations]
        .sort((a, b) => b.dueDate - a.dueDate)
        .map((o) => ({ ...o, member: membersMap[o.memberId] })),
      ledger: [...state.ledger].sort((a, b) => b.date - a.date),
      members: state.members,
    });
  }

  if (apiPath === '/api/admin/contributions/record' && method === 'POST') {
    const user = requireStaff(state);
    if (!user || !can(user.role, 'contributions:write')) return json({ error: 'Forbidden' }, 403);
    const member = state.members.find((m) => m.id === body.memberId);
    if (!member) return json({ error: 'Member not found' }, 404);
    const ref = makeReference('CONT');
    member.totalContributionsKobo += body.amountKobo;
    // Update obligation if matching period
    if (body.monthPeriod) {
      const ob = state.obligations.find((o) => o.memberId === member.id && o.monthPeriod === body.monthPeriod);
      if (ob) {
        ob.paidAmountKobo = Math.min(ob.expectedAmountKobo, ob.paidAmountKobo + body.amountKobo);
        ob.status = ob.paidAmountKobo >= ob.expectedAmountKobo ? 'PAID' : 'PARTIAL';
      }
    }
    pushLedger(state, {
      reference: ref,
      type: 'CONTRIBUTION_PAYMENT',
      amountKobo: body.amountKobo,
      description: body.description || `Contribution recorded — ${member.membershipNumber}`,
      memberId: member.id,
    });
    saveState(state);
    return json({
      success: true,
      reference: ref,
      receipt: {
        title: 'Contribution Receipt',
        reference: ref,
        amountKobo: body.amountKobo,
        memberName: `${member.firstName} ${member.lastName}`,
        membershipNumber: member.membershipNumber,
        description: body.description || body.monthPeriod,
        typeLabel: 'Contribution (staff recorded)',
        date: now(),
      },
    });
  }

  if (apiPath === '/api/admin/ledger' && method === 'GET') {
    if (!requireStaff(state)) return json({ error: 'Unauthorized' }, 403);
    const sorted = [...state.ledger].sort((a, b) => a.date - b.date);
    let running = 0;
    const lines = sorted.map((row) => {
      if (row.side === 'CREDIT') running += row.amountKobo;
      else running -= row.amountKobo;
      const member = row.memberId ? state.members.find((m) => m.id === row.memberId) : null;
      return {
        ...row,
        member,
        creditKobo: row.side === 'CREDIT' ? row.amountKobo : 0,
        debitKobo: row.side === 'DEBIT' ? row.amountKobo : 0,
        runningBalanceKobo: running,
      };
    });
    const pool = coOpPoolTotals(state);
    return json({ lines: lines.reverse(), pool });
  }

  if (apiPath === '/api/admin/outbox' && method === 'GET') {
    if (!requireStaff(state)) return json({ error: 'Unauthorized' }, 403);
    return json({ messages: [...state.outbox].sort((a, b) => b.sentAt - a.sentAt) });
  }

  if (apiPath === '/api/admin/funds' && method === 'GET') {
    if (!requireStaff(state)) return json({ error: 'Unauthorized' }, 401);
    const membersMap = Object.fromEntries(state.members.map((m) => [m.id, m]));
    return json({
      requests: [...state.fundRequests]
        .sort((a, b) => b.requestedAt - a.requestedAt)
        .map((r) => ({ ...r, member: membersMap[r.memberId] })),
    });
  }

  const fundAction = apiPath.match(/^\/api\/admin\/funds\/([^/]+)\/(approve|reject)$/);
  if (fundAction && method === 'POST') {
    const user = requireStaff(state);
    if (!user || !can(user.role, 'funds:write')) return json({ error: 'Treasurer or Super Admin required' }, 403);
    const request = state.fundRequests.find((r) => r.id === fundAction[1]);
    if (!request) return json({ error: 'Not found' }, 404);
    if (request.status !== 'PENDING') return json({ error: 'Already processed' }, 400);
    const action = fundAction[2];
    const member = state.members.find((m) => m.id === request.memberId)!;
    const u = state.users.find((x) => x.id === member.userId);
    if (action === 'approve') {
      if (request.type === 'WITHDRAWAL') {
        if (request.amountKobo > member.totalContributionsKobo) {
          return json({ error: 'Member has insufficient thrift balance' }, 400);
        }
        member.totalContributionsKobo -= request.amountKobo;
        pushLedger(state, {
          reference: request.reference,
          type: 'WITHDRAWAL',
          amountKobo: request.amountKobo,
          description: `Withdrawal — ${member.membershipNumber}`,
          memberId: member.id,
        });
        if (u) {
          pushMail(state, u.email, 'WITHDRAWAL_APPROVED', `Withdrawal ${request.reference} approved`, { amountKobo: request.amountKobo, reference: request.reference }, 'Your withdrawal has been approved and processed.');
        }
      } else {
        member.totalContributionsKobo += request.amountKobo;
        pushLedger(state, {
          reference: request.reference,
          type: 'DEPOSIT',
          amountKobo: request.amountKobo,
          description: `Deposit — ${member.membershipNumber}`,
          memberId: member.id,
        });
      }
    } else if (u) {
      pushMail(state, u.email, 'WITHDRAWAL_REJECTED', `Withdrawal ${request.reference} declined`, { reference: request.reference }, 'Your withdrawal request was declined. Contact the treasurer for details.');
    }
    request.status = action === 'approve' ? 'APPROVED' : 'REJECTED';
    request.processedAt = now();
    request.processedBy = user.id;
    saveState(state);
    return json({ success: true });
  }

  // Investments
  if (apiPath === '/api/admin/investments' && method === 'GET') {
    if (!requireStaff(state)) return json({ error: 'Unauthorized' }, 403);
    return json({
      investments: state.investments,
      totalValueKobo: state.investments.reduce((s, i) => s + i.currentValueKobo, 0),
    });
  }

  if (apiPath === '/api/admin/investments' && method === 'POST') {
    const user = requireStaff(state);
    if (!user || !can(user.role, 'investments:write')) return json({ error: 'Forbidden' }, 403);
    const inv = {
      id: uid(),
      name: body.name,
      category: body.category || 'General',
      principalKobo: body.principalKobo,
      currentValueKobo: body.currentValueKobo ?? body.principalKobo,
      expectedReturnRate: body.expectedReturnRate || 0,
      status: 'ACTIVE',
      acquiredAt: now(),
      notes: body.notes || '',
    };
    state.investments.unshift(inv);
    const ref = makeReference('INV');
    pushLedger(state, {
      reference: ref,
      type: 'INVESTMENT_PURCHASE',
      amountKobo: inv.principalKobo,
      description: `Investment purchase — ${inv.name}`,
      memberId: null,
    });
    saveState(state);
    return json({ success: true, investment: inv, reference: ref });
  }

  // Dividends
  if (apiPath === '/api/admin/dividends' && method === 'GET') {
    if (!requireStaff(state)) return json({ error: 'Unauthorized' }, 403);
    return json({
      periods: state.dividendPeriods,
      allocations: state.dividendAllocations.map((a) => ({
        ...a,
        member: state.members.find((m) => m.id === a.memberId),
        period: state.dividendPeriods.find((p) => p.id === a.periodId),
      })),
    });
  }

  if (apiPath === '/api/admin/dividends/distribute' && method === 'POST') {
    const user = requireStaff(state);
    if (!user || !can(user.role, 'dividends:write')) return json({ error: 'Forbidden' }, 403);
    const period = state.dividendPeriods.find((p) => p.id === body.periodId);
    if (!period) return json({ error: 'Period not found' }, 404);
    if (period.status === 'DISTRIBUTED') return json({ error: 'Already distributed' }, 400);

    const active = state.members.filter((m) => m.status === 'ACTIVE');
    const totalSavings = active.reduce((s, m) => s + m.totalContributionsKobo, 0) || 1;
    let allocated = 0;
    for (let i = 0; i < active.length; i++) {
      const m = active[i];
      const share =
        i === active.length - 1
          ? period.surplusKobo - allocated
          : Math.floor((m.totalContributionsKobo / totalSavings) * period.surplusKobo);
      allocated += share;
      m.totalContributionsKobo += share;
      state.dividendAllocations.push({
        id: uid(),
        periodId: period.id,
        memberId: m.id,
        amountKobo: share,
        status: 'PAID',
        paidAt: now(),
      });
      const u = state.users.find((x) => x.id === m.userId);
      if (u) {
        pushMail(
          state,
          u.email,
          'DIVIDEND_PAID',
          `Dividend credited — ${period.label}`,
          { amountKobo: share, period: period.label },
          `₦${(share / 100).toFixed(2)} dividend credited to your thrift balance.`,
        );
      }
    }
    const ref = makeReference('DIV');
    pushLedger(state, {
      reference: ref,
      type: 'DIVIDEND_PAYOUT',
      amountKobo: period.surplusKobo,
      description: `Dividend distribution — ${period.label}`,
      memberId: null,
    });
    period.status = 'DISTRIBUTED';
    period.distributedAt = now();
    saveState(state);
    return json({ success: true, reference: ref });
  }

  if (apiPath === '/api/admin/profile/update' && method === 'POST') {
    const user = requireStaff(state);
    if (!user) return json({ error: 'Unauthorized' }, 403);
    if (body.newPassword) {
      const u = state.users.find((x) => x.id === user.id)!;
      u.passwordHash = body.newPassword;
      saveState(state);
    }
    return json({ success: true });
  }

  if (apiPath === '/api/admin/announcements' && method === 'GET') {
    if (!requireStaff(state)) return json({ error: 'Unauthorized' }, 403);
    return json({ announcements: state.announcements });
  }

  console.warn('[api] unhandled', method, apiPath, getSession());
  return json({ error: `Unhandled ${method} ${apiPath}` }, 404);
}

// ensure createDefaultState is tree-shaken friendly
void createDefaultState;
