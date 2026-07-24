import {
  loadState,
  saveState,
  getAuth,
  getSession,
  setSession,
  type DemoState,
} from './store';

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

function uid() {
  return crypto.randomUUID();
}

function now() {
  return Math.floor(Date.now() / 1000);
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

function requireMember(state: DemoState) {
  const { user, member } = getAuth(state);
  if (!user || !member) return null;
  return { user, member };
}

function requireAdmin(state: DemoState) {
  const { user } = getAuth(state);
  if (!user || user.role === 'MEMBER') return null;
  return user;
}

export async function handleMockApi(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const method = (init?.method || 'GET').toUpperCase();
  const path = pathOf(url);
  // Normalize: strip possible repo base prefix if present in absolute path
  const apiPath = path.includes('/api/') ? path.slice(path.indexOf('/api/')) : path;

  let state = loadState();
  const body = method !== 'GET' ? await readBody(init) : {};

  // Auth
  if (apiPath === '/api/auth/login' && method === 'POST') {
    const user = state.users.find((u) => u.email === body.email);
    if (!user || user.passwordHash !== body.password) {
      return json({ error: 'Invalid demo credentials' }, 401);
    }
    if (body.portal === 'MEMBER' && user.role !== 'MEMBER') {
      return json({ error: 'Not a member account' }, 403);
    }
    if (body.portal === 'ADMIN' && user.role === 'MEMBER') {
      return json({ error: 'Not an admin account' }, 403);
    }
    setSession({ userId: user.id, portal: body.portal });
    return json({ success: true, user });
  }

  if (apiPath === '/api/auth/logout' && method === 'POST') {
    setSession(null);
    return json({ success: true });
  }

  if (apiPath === '/api/auth/me' && method === 'GET') {
    const auth = getAuth(state);
    return json(auth);
  }

  if (apiPath === '/api/health' && method === 'GET') {
    return json({ status: 'ok', mode: 'static-demo' });
  }

  // Member dashboard
  if (apiPath === '/api/members/dashboard' && method === 'GET') {
    const auth = requireMember(state);
    if (!auth) return json({ error: 'Unauthorized' }, 401);
    const loans = state.loans
      .filter((l) => l.memberId === auth.member.id)
      .sort((a, b) => b.appliedAt - a.appliedAt)
      .map((loan) => ({
        ...loan,
        guarantors: state.guarantorRequests
          .filter((g) => g.loanId === loan.id)
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
          }),
      }));
    const obligations = state.obligations
      .filter((o) => o.memberId === auth.member.id)
      .sort((a, b) => b.dueDate - a.dueDate);
    // Return fresh member from state
    const member = state.members.find((m) => m.id === auth.member.id);
    return json({ member, loans, obligations });
  }

  if (apiPath === '/api/members/contributions/simulate-payment' && method === 'POST') {
    const auth = requireMember(state);
    if (!auth) return json({ error: 'Unauthorized' }, 401);
    if (body.result === 'FAILED') return json({ success: true, message: 'Simulated payment failed' });
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
    const ref = `DEMO-PAY-${Math.floor(10000 + Math.random() * 90000)}`;
    state.ledger.unshift({
      id: uid(),
      reference: ref,
      type: 'CONTRIBUTION_PAYMENT',
      status: 'COMPLETED',
      description: `Demo payment for ${obligation.monthPeriod}`,
      amountKobo: amountToPay,
      date: now(),
    });
    state.outbox.unshift({
      id: uid(),
      recipient: auth.user.email,
      template: 'CONTRIBUTION_RECEIPT',
      subject: 'Contribution Receipt',
      payload: JSON.stringify({ amount: amountToPay, reference: ref }),
      sentAt: now(),
    });
    saveState(state);
    return json({ success: true, reference: ref });
  }

  if (apiPath === '/api/members/loans/metadata' && method === 'GET') {
    const auth = requireMember(state);
    if (!auth) return json({ error: 'Unauthorized' }, 401);
    return json({
      products: state.loanProducts,
      eligibleGuarantors: state.members.filter((m) => m.status === 'ACTIVE' && m.id !== auth.member.id),
    });
  }

  if (apiPath === '/api/members/loans/apply' && method === 'POST') {
    const auth = requireMember(state);
    if (!auth) return json({ error: 'Unauthorized' }, 401);
    const product = state.loanProducts.find((p) => p.id === body.productId);
    if (!product) return json({ error: 'Invalid product' }, 400);
    const loanId = uid();
    const reference = `LN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
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
    saveState(state);
    return json({ success: true, reference });
  }

  const memberLoanCancel = apiPath.match(/^\/api\/members\/loans\/([^/]+)\/cancel$/);
  if (memberLoanCancel && method === 'POST') {
    const auth = requireMember(state);
    if (!auth) return json({ error: 'Unauthorized' }, 401);
    const loan = state.loans.find((l) => l.id === memberLoanCancel[1]);
    if (!loan) return json({ error: 'Loan not found' }, 404);
    if (loan.memberId !== auth.member.id) return json({ error: 'Unauthorized' }, 403);
    if (loan.status !== 'PENDING_APPROVAL') return json({ error: 'Only pending applications can be cancelled' }, 400);
    loan.status = 'CANCELLED';
    saveState(state);
    return json({ success: true });
  }

  if (apiPath === '/api/members/funds' && method === 'GET') {
    const auth = requireMember(state);
    if (!auth) return json({ error: 'Unauthorized' }, 401);
    const requests = state.fundRequests
      .filter((r) => r.memberId === auth.member.id)
      .sort((a, b) => b.requestedAt - a.requestedAt);
    return json({ requests });
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
      return json({ error: 'Insufficient funds' }, 400);
    }
    const id = uid();
    const reference = `${type === 'DEPOSIT' ? 'DEP' : 'WDL'}-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`;
    const t = now();
    if (type === 'DEPOSIT') {
      state.fundRequests.unshift({
        id, memberId: member.id, reference, type, amountKobo,
        status: 'APPROVED', requestedAt: t, processedAt: t, processedBy: null, notes,
      });
      member.totalContributionsKobo += amountKobo;
      state.ledger.unshift({
        id: uid(),
        reference: `TXN-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
        type: 'CONTRIBUTION_PAYMENT',
        status: 'COMPLETED',
        description: `Member Deposit - ${reference}`,
        amountKobo,
        date: t,
      });
    } else {
      state.fundRequests.unshift({
        id, memberId: member.id, reference, type, amountKobo,
        status: 'PENDING', requestedAt: t, processedAt: null, processedBy: null, notes,
      });
    }
    saveState(state);
    return json({ success: true });
  }

  const fundCancel = apiPath.match(/^\/api\/members\/funds\/([^/]+)\/cancel$/);
  if (fundCancel && method === 'POST') {
    const auth = requireMember(state);
    if (!auth) return json({ error: 'Unauthorized' }, 401);
    const request = state.fundRequests.find((r) => r.id === fundCancel[1]);
    if (!request) return json({ error: 'Request not found' }, 404);
    if (request.memberId !== auth.member.id) return json({ error: 'Unauthorized' }, 403);
    if (request.status !== 'PENDING') return json({ error: 'Only pending requests can be cancelled' }, 400);
    request.status = 'CANCELLED';
    request.processedAt = now();
    saveState(state);
    return json({ success: true });
  }

  if (apiPath === '/api/members/notifications' && method === 'GET') {
    const auth = requireMember(state);
    if (!auth) return json({ error: 'Unauthorized' }, 401);
    return json({
      announcements: [...state.announcements].sort((a, b) => b.publishedAt - a.publishedAt),
      emails: state.outbox
        .filter((m) => m.recipient === auth.user.email)
        .sort((a, b) => b.sentAt - a.sentAt),
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

  // Admin
  if (apiPath === '/api/admin/dashboard' && method === 'GET') {
    if (!requireAdmin(state)) return json({ error: 'Unauthorized' }, 403);
    const activeMembers = state.members.filter((m) => m.status === 'ACTIVE');
    const pendingApplications = state.applications.filter((a) => a.status === 'PENDING');
    const totalContributions = state.members.reduce((s, m) => s + m.totalContributionsKobo, 0);
    const activeLoans = state.loans.filter((l) => l.status === 'ACTIVE');
    const activeLoanPortfolio = activeLoans.reduce((s, l) => s + (l.totalDueKobo - l.paidKobo), 0);
    return json({
      activeMembers: activeMembers.length,
      pendingApplications: pendingApplications.length,
      totalContributions,
      activeLoanPortfolio,
      recentApplications: [...state.applications].sort((a, b) => b.submittedAt - a.submittedAt).slice(0, 5),
      recentTransactions: [...state.ledger].sort((a, b) => b.date - a.date).slice(0, 5),
    });
  }

  if (apiPath === '/api/admin/applications' && method === 'GET') {
    if (!requireAdmin(state)) return json({ error: 'Unauthorized' }, 403);
    return json({
      applications: [...state.applications].sort((a, b) => b.submittedAt - a.submittedAt),
    });
  }

  const appApprove = apiPath.match(/^\/api\/admin\/applications\/([^/]+)\/approve$/);
  if (appApprove && method === 'POST') {
    if (!requireAdmin(state)) return json({ error: 'Unauthorized' }, 403);
    const application = state.applications.find((a) => a.id === appApprove[1]);
    if (!application) return json({ error: 'Application not found' }, 404);
    const membershipNumber = `SC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const userId = uid();
    const memberId = uid();
    const t = now();
    state.users.push({
      id: userId,
      email: application.email,
      passwordHash: 'demo123',
      role: 'MEMBER',
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
    state.outbox.unshift({
      id: uid(),
      recipient: application.email,
      template: 'MEMBERSHIP_APPROVED',
      subject: 'Welcome to SeedCoop',
      payload: JSON.stringify({ membershipNumber }),
      sentAt: t,
    });
    saveState(state);
    return json({ success: true, member: { membershipNumber } });
  }

  if (apiPath === '/api/admin/loans' && method === 'GET') {
    if (!requireAdmin(state)) return json({ error: 'Unauthorized' }, 403);
    const loans = [...state.loans]
      .sort((a, b) => b.appliedAt - a.appliedAt)
      .map((loan) => ({
        ...loan,
        member: state.members.find((m) => m.id === loan.memberId) || null,
        guarantors: state.guarantorRequests
          .filter((g) => g.loanId === loan.id)
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
          }),
      }));
    return json({ loans });
  }

  const loanApprove = apiPath.match(/^\/api\/admin\/loans\/([^/]+)\/approve$/);
  if (loanApprove && method === 'POST') {
    const user = requireAdmin(state);
    if (!user || !['SUPER_ADMIN', 'LOAN_OFFICER'].includes(user.role)) {
      return json({ error: 'Unauthorized' }, 403);
    }
    const loan = state.loans.find((l) => l.id === loanApprove[1]);
    if (!loan) return json({ error: 'Not found' }, 404);
    loan.status = 'APPROVED';
    saveState(state);
    return json({ success: true });
  }

  const loanDisburse = apiPath.match(/^\/api\/admin\/loans\/([^/]+)\/disburse$/);
  if (loanDisburse && method === 'POST') {
    const user = requireAdmin(state);
    if (!user || !['SUPER_ADMIN', 'TREASURER'].includes(user.role)) {
      return json({ error: 'Unauthorized' }, 403);
    }
    const loan = state.loans.find((l) => l.id === loanDisburse[1]);
    if (!loan) return json({ error: 'Loan not found' }, 404);
    loan.status = 'ACTIVE';
    loan.disbursedAt = now();
    state.ledger.unshift({
      id: uid(),
      reference: `DISB-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'LOAN_DISBURSEMENT',
      status: 'COMPLETED',
      description: `Disbursement for loan ${loan.reference}`,
      amountKobo: loan.principalKobo,
      date: now(),
    });
    saveState(state);
    return json({ success: true });
  }

  if (apiPath === '/api/admin/members' && method === 'GET') {
    if (!requireAdmin(state)) return json({ error: 'Unauthorized' }, 403);
    const usersMap = Object.fromEntries(state.users.map((u) => [u.id, u]));
    return json({
      members: [...state.members]
        .sort((a, b) => b.joinedAt - a.joinedAt)
        .map((m) => ({
          ...m,
          email: m.userId ? usersMap[m.userId]?.email : 'N/A',
        })),
    });
  }

  const memberStatus = apiPath.match(/^\/api\/admin\/members\/([^/]+)\/status$/);
  if (memberStatus && method === 'POST') {
    if (!requireAdmin(state)) return json({ error: 'Unauthorized' }, 403);
    if (!['ACTIVE', 'SUSPENDED'].includes(body.status)) {
      return json({ error: 'Invalid status' }, 400);
    }
    const member = state.members.find((m) => m.id === memberStatus[1]);
    if (!member) return json({ error: 'Not found' }, 404);
    member.status = body.status;
    saveState(state);
    return json({ success: true });
  }

  if (apiPath === '/api/admin/contributions' && method === 'GET') {
    if (!requireAdmin(state)) return json({ error: 'Unauthorized' }, 403);
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
    if (!requireAdmin(state)) return json({ error: 'Unauthorized' }, 403);
    const member = state.members.find((m) => m.id === body.memberId);
    if (!member) return json({ error: 'Member not found' }, 404);
    const ref = `CONT-ADM-${Math.floor(10000 + Math.random() * 90000)}`;
    member.totalContributionsKobo += body.amountKobo;
    state.ledger.unshift({
      id: uid(),
      reference: ref,
      type: 'CONTRIBUTION_PAYMENT',
      status: 'COMPLETED',
      description: body.description || `Manual admin record for ${body.monthPeriod}`,
      amountKobo: body.amountKobo,
      date: now(),
    });
    saveState(state);
    return json({ success: true, reference: ref });
  }

  if (apiPath === '/api/admin/outbox' && method === 'GET') {
    if (!requireAdmin(state)) return json({ error: 'Unauthorized' }, 403);
    return json({
      messages: [...state.outbox].sort((a, b) => b.sentAt - a.sentAt),
    });
  }

  if (apiPath === '/api/admin/profile/update' && method === 'POST') {
    const user = requireAdmin(state);
    if (!user) return json({ error: 'Unauthorized' }, 403);
    if (body.newPassword) {
      const u = state.users.find((x) => x.id === user.id)!;
      u.passwordHash = body.newPassword;
      saveState(state);
    }
    return json({ success: true });
  }

  if (apiPath === '/api/admin/funds' && method === 'GET') {
    if (!requireAdmin(state)) return json({ error: 'Unauthorized' }, 401);
    const membersMap = Object.fromEntries(state.members.map((m) => [m.id, m]));
    return json({
      requests: [...state.fundRequests]
        .sort((a, b) => b.requestedAt - a.requestedAt)
        .map((r) => ({ ...r, member: membersMap[r.memberId] })),
    });
  }

  const fundAction = apiPath.match(/^\/api\/admin\/funds\/([^/]+)\/(approve|reject)$/);
  if (fundAction && method === 'POST') {
    const user = requireAdmin(state);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    const request = state.fundRequests.find((r) => r.id === fundAction[1]);
    if (!request) return json({ error: 'Not found' }, 404);
    if (request.status !== 'PENDING') return json({ error: 'Already processed' }, 400);
    const action = fundAction[2];
    const member = state.members.find((m) => m.id === request.memberId);
    if (!member) return json({ error: 'Member not found' }, 404);
    if (action === 'approve') {
      if (request.type === 'WITHDRAWAL' && request.amountKobo > member.totalContributionsKobo) {
        return json({ error: 'Member has insufficient funds' }, 400);
      }
      member.totalContributionsKobo =
        request.type === 'DEPOSIT'
          ? member.totalContributionsKobo + request.amountKobo
          : member.totalContributionsKobo - request.amountKobo;
      state.ledger.unshift({
        id: uid(),
        reference: `TXN-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
        type: request.type === 'DEPOSIT' ? 'CONTRIBUTION_PAYMENT' : 'WITHDRAWAL_PAYMENT',
        status: 'COMPLETED',
        amountKobo: request.amountKobo,
        date: now(),
      });
    }
    request.status = action === 'approve' ? 'APPROVED' : 'REJECTED';
    request.processedAt = now();
    request.processedBy = user.id;
    saveState(state);
    return json({ success: true });
  }

  console.warn('[static-demo] Unhandled API', method, apiPath, 'session', getSession());
  return json({ error: `Static demo: unhandled ${method} ${apiPath}` }, 404);
}
