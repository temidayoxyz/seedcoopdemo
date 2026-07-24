import { Router } from "express";
import { db } from "../db/db";
import * as schema from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { getUnixTime } from "date-fns";

export const apiRouter = Router();

// Demo auth middleware
apiRouter.use(async (req, res, next) => {
  const memberToken = req.cookies['seedcoop-member-demo-session'];
  const adminToken = req.cookies['seedcoop-admin-demo-session'];
  
  if (memberToken) {
    const user = await db.query.users.findFirst({ where: eq(schema.users.id, memberToken) });
    if (user && user.role === 'MEMBER') {
      const member = await db.query.members.findFirst({ where: eq(schema.members.userId, user.id) });
      (req as any).user = user;
      (req as any).member = member;
    }
  } 
  
  if (!((req as any).user) && adminToken) {
    const user = await db.query.users.findFirst({ where: eq(schema.users.id, adminToken) });
    if (user && user.role !== 'MEMBER') {
      (req as any).user = user;
    }
  }
  next();
});

apiRouter.post('/auth/login', async (req, res) => {
  const { email, password, portal } = req.body; // portal: 'MEMBER' | 'ADMIN'
  const user = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
  
  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ error: 'Invalid demo credentials' });
  }

  if (portal === 'MEMBER' && user.role !== 'MEMBER') {
    return res.status(403).json({ error: 'Not a member account' });
  }
  
  if (portal === 'ADMIN' && user.role === 'MEMBER') {
    return res.status(403).json({ error: 'Not an admin account' });
  }

  if (portal === 'MEMBER') {
    res.cookie('seedcoop-member-demo-session', user.id, { httpOnly: true });
    res.clearCookie('seedcoop-admin-demo-session', { httpOnly: true });
  } else {
    res.cookie('seedcoop-admin-demo-session', user.id, { httpOnly: true });
    res.clearCookie('seedcoop-member-demo-session', { httpOnly: true });
  }
  res.json({ success: true, user });
});

apiRouter.post('/auth/logout', (req, res) => {
  const { portal } = req.body;
  const cookieName = portal === 'MEMBER' ? 'seedcoop-member-demo-session' : 'seedcoop-admin-demo-session';
  res.clearCookie(cookieName, { httpOnly: true, secure: true, sameSite: 'none' });
  res.json({ success: true });
});

apiRouter.get('/auth/me', (req, res) => {
  if ((req as any).user) {
    res.json({ user: (req as any).user, member: (req as any).member });
  } else {
    res.json({ user: null });
  }
});

// Member Routes
apiRouter.get('/members/dashboard', async (req, res) => {
  const member = (req as any).member;
  if (!member) return res.status(401).json({ error: 'Unauthorized' });

  // Get active loan, next repayment, recent transactions
  const loans = await db.query.loans.findMany({
    where: eq(schema.loans.memberId, member.id),
    orderBy: [desc(schema.loans.appliedAt)]
  });

  const enrichedLoans = await Promise.all(loans.map(async (loan) => {
    const guarantorsReqs = await db.select({
      id: schema.guarantorRequests.id,
      status: schema.guarantorRequests.status,
      member: {
        id: schema.members.id,
        firstName: schema.members.firstName,
        lastName: schema.members.lastName,
        membershipNumber: schema.members.membershipNumber,
      }
    }).from(schema.guarantorRequests)
      .leftJoin(schema.members, eq(schema.guarantorRequests.guarantorMemberId, schema.members.id))
      .where(eq(schema.guarantorRequests.loanId, loan.id));
      
    return { ...loan, guarantors: guarantorsReqs };
  }));

  const obligations = await db.query.contributionObligations.findMany({
    where: eq(schema.contributionObligations.memberId, member.id),
    orderBy: [desc(schema.contributionObligations.dueDate)]
  });

  res.json({
    member,
    loans: enrichedLoans,
    obligations
  });
});

// Admin Routes
apiRouter.get('/admin/dashboard', async (req, res) => {
  const user = (req as any).user;
  if (!user || user.role === 'MEMBER') return res.status(403).json({ error: 'Unauthorized' });

  const activeMembers = await db.query.members.findMany({ where: eq(schema.members.status, 'ACTIVE') });
  const pendingApplications = await db.query.membershipApplications.findMany({ where: eq(schema.membershipApplications.status, 'PENDING') });
  const allContributions = await db.query.members.findMany();
  const totalContributions = allContributions.reduce((acc: number, curr: any) => acc + curr.totalContributionsKobo, 0);
  
  const activeLoans = await db.query.loans.findMany({ where: eq(schema.loans.status, 'ACTIVE') });
  const activeLoanPortfolio = activeLoans.reduce((acc: number, curr: any) => acc + (curr.totalDueKobo - curr.paidKobo), 0);

  const recentApplications = await db.query.membershipApplications.findMany({
    orderBy: [desc(schema.membershipApplications.submittedAt)],
    limit: 5
  });

  const recentTransactions = await db.query.ledgerTransactions.findMany({
    orderBy: [desc(schema.ledgerTransactions.date)],
    limit: 5
  });

  res.json({
    activeMembers: activeMembers.length,
    pendingApplications: pendingApplications.length,
    totalContributions,
    activeLoanPortfolio,
    recentApplications,
    recentTransactions
  });
});

apiRouter.post('/members/contributions/simulate-payment', async (req, res) => {
  const member = (req as any).member;
  if (!member) return res.status(401).json({ error: 'Unauthorized' });

  const { obligationId, result } = req.body;
  const obligation = await db.query.contributionObligations.findFirst({
    where: eq(schema.contributionObligations.id, obligationId)
  });

  if (!obligation || obligation.memberId !== member.id) {
    return res.status(404).json({ error: 'Obligation not found' });
  }

  if (result === 'FAILED') {
    return res.json({ success: true, message: 'Simulated payment failed' });
  }

  const amountToPay = obligation.expectedAmountKobo - obligation.paidAmountKobo;
  if (amountToPay <= 0) {
    return res.status(400).json({ error: 'Obligation already paid' });
  }

  const now = getUnixTime(new Date());
  const ref = `DEMO-PAY-${Math.floor(10000 + Math.random() * 90000)}`;

  // Run as a faux-transaction using Promise.all since Better-Sqlite3 driver supports proper transactions but drizzle simplifies it.
  await db.update(schema.contributionObligations)
    .set({ 
      paidAmountKobo: obligation.paidAmountKobo + amountToPay,
      status: 'PAID'
    })
    .where(eq(schema.contributionObligations.id, obligationId));

  await db.update(schema.members)
    .set({
      totalContributionsKobo: member.totalContributionsKobo + amountToPay
    })
    .where(eq(schema.members.id, member.id));

  await db.insert(schema.ledgerTransactions).values({
    id: uuidv4(),
    reference: ref,
    type: 'CONTRIBUTION_PAYMENT',
    status: 'COMPLETED',
    description: `Demo payment for ${obligation.monthPeriod}`,
    amountKobo: amountToPay,
    date: now
  });

  await db.insert(schema.auditLogs).values({
    id: uuidv4(),
    actorId: member.userId,
    actorRole: 'MEMBER',
    action: 'SIMULATE_PAYMENT',
    entityType: 'CONTRIBUTION_OBLIGATION',
    entityReference: obligationId,
    timestamp: now,
    summary: `Simulated payment of ₦${amountToPay / 100} for obligation ${obligationId}`
  });

  await db.insert(schema.demoEmailOutbox).values({
    id: uuidv4(),
    recipient: (req as any).user.email,
    template: 'CONTRIBUTION_RECEIPT',
    subject: 'Contribution Receipt',
    payload: JSON.stringify({ amount: amountToPay, reference: ref }),
    sentAt: now
  });

  res.json({ success: true, reference: ref });
});

apiRouter.get('/members/loans/metadata', async (req, res) => {
  const member = (req as any).member;
  if (!member) return res.status(401).json({ error: 'Unauthorized' });

  const products = await db.query.loanProducts.findMany();
  const eligibleGuarantors = await db.query.members.findMany({
    where: eq(schema.members.status, 'ACTIVE') // In reality, more complex check
  });

  res.json({ products, eligibleGuarantors });
});

apiRouter.post('/members/loans/apply', async (req, res) => {
  const member = (req as any).member;
  if (!member) return res.status(401).json({ error: 'Unauthorized' });

  const { productId, amountKobo, termMonths, guarantors } = req.body;
  const loanId = uuidv4();
  const reference = `LN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const product = await db.query.loanProducts.findFirst({ where: eq(schema.loanProducts.id, productId) });
  if (!product) return res.status(400).json({ error: 'Invalid product' });

  const interestKobo = Math.round(amountKobo * product.interestRate);

  const now = getUnixTime(new Date());

  await db.insert(schema.loans).values({
    id: loanId,
    memberId: member.id,
    loanProductId: productId,
    reference,
    principalKobo: amountKobo,
    interestKobo,
    totalDueKobo: amountKobo + interestKobo,
    termMonths,
    status: 'PENDING_APPROVAL',
    appliedAt: now
  });

  for (const gid of guarantors) {
    await db.insert(schema.guarantorRequests).values({
      id: uuidv4(),
      loanId,
      guarantorMemberId: gid,
      status: 'ACCEPTED', // Demo requirement: guarantors do not need manual approval
      requestedAt: now
    });
  }

  await db.insert(schema.auditLogs).values({
    id: uuidv4(),
    actorId: member.userId,
    actorRole: 'MEMBER',
    action: 'APPLY_LOAN',
    entityType: 'LOAN',
    entityReference: loanId,
    timestamp: now,
    summary: `Applied for loan ${reference}`
  });

  res.json({ success: true, reference });
});

apiRouter.get('/admin/loans', async (req, res) => {
  const user = (req as any).user;
  if (!user || user.role === 'MEMBER') return res.status(403).json({ error: 'Unauthorized' });

  const loans = await db.query.loans.findMany({
    orderBy: [desc(schema.loans.appliedAt)]
  });

  const enrichedLoans = await Promise.all(loans.map(async (loan) => {
    const member = await db.query.members.findFirst({ where: eq(schema.members.id, loan.memberId) });
    
    const guarantorsReqs = await db.select({
      id: schema.guarantorRequests.id,
      status: schema.guarantorRequests.status,
      member: {
        id: schema.members.id,
        firstName: schema.members.firstName,
        lastName: schema.members.lastName,
        membershipNumber: schema.members.membershipNumber,
      }
    }).from(schema.guarantorRequests)
      .leftJoin(schema.members, eq(schema.guarantorRequests.guarantorMemberId, schema.members.id))
      .where(eq(schema.guarantorRequests.loanId, loan.id));

    return { ...loan, member, guarantors: guarantorsReqs };
  }));

  res.json({ loans: enrichedLoans });
});

apiRouter.post('/admin/loans/:id/approve', async (req, res) => {
  const user = (req as any).user;
  if (!user || !['SUPER_ADMIN', 'LOAN_OFFICER'].includes(user.role)) return res.status(403).json({ error: 'Unauthorized' });

  const { id } = req.params;
  const now = getUnixTime(new Date());

  await db.update(schema.loans)
    .set({ status: 'APPROVED' })
    .where(eq(schema.loans.id, id));

  await db.insert(schema.auditLogs).values({
    id: uuidv4(),
    actorId: user.id,
    actorRole: user.role,
    action: 'APPROVE_LOAN',
    entityType: 'LOAN',
    entityReference: id,
    timestamp: now,
    summary: `Approved loan ${id}`
  });

  res.json({ success: true });
});

apiRouter.post('/admin/loans/:id/disburse', async (req, res) => {
  const user = (req as any).user;
  if (!user || !['SUPER_ADMIN', 'TREASURER'].includes(user.role)) return res.status(403).json({ error: 'Unauthorized' });

  const { id } = req.params;
  const now = getUnixTime(new Date());

  const loan = await db.query.loans.findFirst({ where: eq(schema.loans.id, id) });
  if (!loan) return res.status(404).json({ error: 'Loan not found' });

  await db.update(schema.loans)
    .set({ status: 'ACTIVE', disbursedAt: now })
    .where(eq(schema.loans.id, id));

  await db.insert(schema.ledgerTransactions).values({
    id: uuidv4(),
    reference: `DISB-${Math.floor(1000 + Math.random() * 9000)}`,
    type: 'LOAN_DISBURSEMENT',
    status: 'COMPLETED',
    description: `Disbursement for loan ${loan.reference}`,
    amountKobo: loan.principalKobo,
    date: now
  });

  await db.insert(schema.auditLogs).values({
    id: uuidv4(),
    actorId: user.id,
    actorRole: user.role,
    action: 'DISBURSE_LOAN',
    entityType: 'LOAN',
    entityReference: id,
    timestamp: now,
    summary: `Simulated disbursement for loan ${loan.reference}`
  });

  res.json({ success: true });
});

apiRouter.get('/admin/applications', async (req, res) => {
  const user = (req as any).user;
  if (!user || user.role === 'MEMBER') return res.status(403).json({ error: 'Unauthorized' });

  const applications = await db.query.membershipApplications.findMany({
    orderBy: [desc(schema.membershipApplications.submittedAt)]
  });

  res.json({ applications });
});

apiRouter.post('/admin/applications/:id/approve', async (req, res) => {
  const user = (req as any).user;
  if (!user || user.role === 'MEMBER') return res.status(403).json({ error: 'Unauthorized' });

  const { id } = req.params;
  const application = await db.query.membershipApplications.findFirst({
    where: eq(schema.membershipApplications.id, id)
  });

  if (!application) return res.status(404).json({ error: 'Application not found' });
  if (application.status !== 'PENDING') return res.status(400).json({ error: 'Application is not pending' });

  const now = getUnixTime(new Date());
  const membershipNumber = `SC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const userId = uuidv4();
  const memberId = uuidv4();

  // Create User
  await db.insert(schema.users).values({
    id: userId,
    email: application.email,
    passwordHash: 'demo123',
    role: 'MEMBER',
    createdAt: now,
    updatedAt: now
  });

  // Create Member
  await db.insert(schema.members).values({
    id: memberId,
    userId: userId,
    membershipNumber,
    firstName: application.firstName,
    lastName: application.lastName,
    phoneNumber: application.phoneNumber,
    status: 'ACTIVE',
    totalContributionsKobo: 0,
    joinedAt: now
  });

  // Update Application
  await db.update(schema.membershipApplications)
    .set({ status: 'APPROVED' })
    .where(eq(schema.membershipApplications.id, id));

  // Audit Log
  await db.insert(schema.auditLogs).values({
    id: uuidv4(),
    actorId: user.id,
    actorRole: user.role,
    action: 'APPROVE_MEMBERSHIP',
    entityType: 'MEMBER',
    entityReference: memberId,
    timestamp: now,
    summary: `Approved application ${application.reference} and created member ${membershipNumber}`
  });

  // Demo Email
  await db.insert(schema.demoEmailOutbox).values({
    id: uuidv4(),
    recipient: application.email,
    template: 'MEMBERSHIP_APPROVED',
    subject: 'Welcome to SeedCoop',
    payload: JSON.stringify({ membershipNumber }),
    sentAt: now
  });

  res.json({ success: true, member: { membershipNumber } });
});

// --- Funds ---
apiRouter.get('/members/funds', async (req, res) => {
  const member = (req as any).member;
  if (!member) return res.status(401).json({ error: 'Unauthorized' });
  const requests = await db.query.fundRequests.findMany({
    where: eq(schema.fundRequests.memberId, member.id),
    orderBy: (reqs, { desc }) => [desc(reqs.requestedAt)]
  });
  res.json({ requests });
});

apiRouter.post('/members/funds/request', async (req, res) => {
  const member = (req as any).member;
  if (!member) return res.status(401).json({ error: 'Unauthorized' });
  const { type, amountKobo, notes } = req.body;
  if (!['DEPOSIT', 'WITHDRAWAL'].includes(type) || amountKobo <= 0) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  if (type === 'WITHDRAWAL' && amountKobo > member.totalContributionsKobo) {
    return res.status(400).json({ error: 'Insufficient funds' });
  }

  const id = uuidv4();
  const reference = `${type === 'DEPOSIT' ? 'DEP' : 'WDL'}-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`;
  const now = getUnixTime(new Date());

  if (type === 'DEPOSIT') {
    // Deposits do not need approval; auto-approve and credit balance directly
    await db.insert(schema.fundRequests).values({
      id,
      memberId: member.id,
      reference,
      type,
      amountKobo,
      status: 'APPROVED',
      requestedAt: now,
      processedAt: now,
      notes,
    });

    const newBalance = member.totalContributionsKobo + amountKobo;
    await db.update(schema.members).set({ totalContributionsKobo: newBalance }).where(eq(schema.members.id, member.id));

    await db.insert(schema.ledgerTransactions).values({
      id: uuidv4(),
      reference: `TXN-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
      type: 'CONTRIBUTION_PAYMENT',
      status: 'COMPLETED',
      description: `Member Deposit - ${reference}`,
      amountKobo,
      date: now,
    });
  } else {
    // Withdrawal stays pending approval
    await db.insert(schema.fundRequests).values({
      id,
      memberId: member.id,
      reference,
      type,
      amountKobo,
      status: 'PENDING',
      requestedAt: now,
      notes,
    });
  }

  res.json({ success: true });
});

// Member cancels withdrawal fund request
apiRouter.post('/members/funds/:id/cancel', async (req, res) => {
  const member = (req as any).member;
  if (!member) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;

  const request = await db.query.fundRequests.findFirst({ where: eq(schema.fundRequests.id, id) });
  if (!request) return res.status(404).json({ error: 'Request not found' });
  if (request.memberId !== member.id) return res.status(403).json({ error: 'Unauthorized' });
  if (request.status !== 'PENDING') return res.status(400).json({ error: 'Only pending requests can be cancelled' });

  await db.update(schema.fundRequests).set({
    status: 'CANCELLED',
    processedAt: getUnixTime(new Date())
  }).where(eq(schema.fundRequests.id, id));

  res.json({ success: true });
});

// Member cancels loan application
apiRouter.post('/members/loans/:id/cancel', async (req, res) => {
  const member = (req as any).member;
  if (!member) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;

  const loan = await db.query.loans.findFirst({ where: eq(schema.loans.id, id) });
  if (!loan) return res.status(404).json({ error: 'Loan not found' });
  if (loan.memberId !== member.id) return res.status(403).json({ error: 'Unauthorized' });
  if (loan.status !== 'PENDING_APPROVAL') return res.status(400).json({ error: 'Only pending applications can be cancelled' });

  await db.update(schema.loans).set({
    status: 'CANCELLED'
  }).where(eq(schema.loans.id, id));

  res.json({ success: true });
});

// Admin Members Directory Endpoints
apiRouter.get('/admin/members', async (req, res) => {
  const user = (req as any).user;
  if (!user || user.role === 'MEMBER') return res.status(403).json({ error: 'Unauthorized' });

  const membersList = await db.query.members.findMany({
    orderBy: [desc(schema.members.joinedAt)]
  });

  const usersList = await db.query.users.findMany();
  const usersMap = Object.fromEntries(usersList.map(u => [u.id, u]));

  const enrichedMembers = membersList.map(m => ({
    ...m,
    email: m.userId ? usersMap[m.userId]?.email : 'N/A'
  }));

  res.json({ members: enrichedMembers });
});

apiRouter.post('/admin/members/:id/status', async (req, res) => {
  const user = (req as any).user;
  if (!user || user.role === 'MEMBER') return res.status(403).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const { status } = req.body;

  if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  await db.update(schema.members).set({ status }).where(eq(schema.members.id, id));
  res.json({ success: true });
});

// Admin Contributions Endpoints
apiRouter.get('/admin/contributions', async (req, res) => {
  const user = (req as any).user;
  if (!user || user.role === 'MEMBER') return res.status(403).json({ error: 'Unauthorized' });

  const obligations = await db.query.contributionObligations.findMany({
    orderBy: [desc(schema.contributionObligations.dueDate)]
  });

  const membersList = await db.query.members.findMany();
  const membersMap = Object.fromEntries(membersList.map(m => [m.id, m]));

  const enrichedObligations = obligations.map(o => ({
    ...o,
    member: membersMap[o.memberId]
  }));

  const ledger = await db.query.ledgerTransactions.findMany({
    orderBy: [desc(schema.ledgerTransactions.date)]
  });

  res.json({ obligations: enrichedObligations, ledger, members: membersList });
});

apiRouter.post('/admin/contributions/record', async (req, res) => {
  const user = (req as any).user;
  if (!user || user.role === 'MEMBER') return res.status(403).json({ error: 'Unauthorized' });

  const { memberId, monthPeriod, amountKobo, description } = req.body;
  const member = await db.query.members.findFirst({ where: eq(schema.members.id, memberId) });
  if (!member) return res.status(404).json({ error: 'Member not found' });

  const now = getUnixTime(new Date());
  const ref = `CONT-ADM-${Math.floor(10000 + Math.random() * 90000)}`;

  // Update total contributions
  await db.update(schema.members)
    .set({ totalContributionsKobo: member.totalContributionsKobo + amountKobo })
    .where(eq(schema.members.id, memberId));

  // Add ledger transaction
  await db.insert(schema.ledgerTransactions).values({
    id: uuidv4(),
    reference: ref,
    type: 'CONTRIBUTION_PAYMENT',
    status: 'COMPLETED',
    description: description || `Manual admin record for ${monthPeriod}`,
    amountKobo,
    date: now
  });

  res.json({ success: true, reference: ref });
});

// Admin Email Outbox Endpoint
apiRouter.get('/admin/outbox', async (req, res) => {
  const user = (req as any).user;
  if (!user || user.role === 'MEMBER') return res.status(403).json({ error: 'Unauthorized' });

  const messages = await db.query.demoEmailOutbox.findMany({
    orderBy: [desc(schema.demoEmailOutbox.sentAt)]
  });

  res.json({ messages });
});

// Member Notifications Endpoint
apiRouter.get('/members/notifications', async (req, res) => {
  const user = (req as any).user;
  const member = (req as any).member;
  if (!user || !member) return res.status(401).json({ error: 'Unauthorized' });

  const announcementsList = await db.query.announcements.findMany({
    orderBy: [desc(schema.announcements.publishedAt)]
  });

  const outboxMessages = await db.query.demoEmailOutbox.findMany({
    where: eq(schema.demoEmailOutbox.recipient, user.email),
    orderBy: [desc(schema.demoEmailOutbox.sentAt)]
  });

  res.json({
    announcements: announcementsList,
    emails: outboxMessages
  });
});

// Profile update endpoints
apiRouter.post('/members/profile/update', async (req, res) => {
  const member = (req as any).member;
  if (!member) return res.status(401).json({ error: 'Unauthorized' });

  const { phoneNumber, firstName, lastName } = req.body;
  await db.update(schema.members).set({
    phoneNumber: phoneNumber || member.phoneNumber,
    firstName: firstName || member.firstName,
    lastName: lastName || member.lastName
  }).where(eq(schema.members.id, member.id));

  res.json({ success: true });
});

apiRouter.post('/admin/profile/update', async (req, res) => {
  const user = (req as any).user;
  if (!user || user.role === 'MEMBER') return res.status(403).json({ error: 'Unauthorized' });

  const { newPassword } = req.body;
  if (newPassword) {
    await db.update(schema.users).set({ passwordHash: newPassword }).where(eq(schema.users.id, user.id));
  }

  res.json({ success: true });
});

apiRouter.get('/admin/funds', async (req, res) => {
  const user = (req as any).user;
  if (!user || user.role === 'MEMBER') return res.status(401).json({ error: 'Unauthorized' });
  
  const requests = await db.query.fundRequests.findMany({
    orderBy: (reqs, { desc }) => [desc(reqs.requestedAt)]
  });

  // Since relation is not in schema.ts, let's fetch members manually
  const membersList = await db.query.members.findMany();
  const membersMap = Object.fromEntries(membersList.map(m => [m.id, m]));

  const enrichedRequests = requests.map(r => ({
    ...r,
    member: membersMap[r.memberId]
  }));

  res.json({ requests: enrichedRequests });
});

apiRouter.post('/admin/funds/:id/:action', async (req, res) => {
  const user = (req as any).user;
  if (!user || user.role === 'MEMBER') return res.status(401).json({ error: 'Unauthorized' });
  const { id, action } = req.params; // action = approve | reject
  
  const request = await db.query.fundRequests.findFirst({ where: eq(schema.fundRequests.id, id) });
  if (!request) return res.status(404).json({ error: 'Not found' });
  if (request.status !== 'PENDING') return res.status(400).json({ error: 'Already processed' });

  const member = await db.query.members.findFirst({ where: eq(schema.members.id, request.memberId) });
  if (!member) return res.status(404).json({ error: 'Member not found' });

  if (action === 'approve') {
    if (request.type === 'WITHDRAWAL' && request.amountKobo > member.totalContributionsKobo) {
      return res.status(400).json({ error: 'Member has insufficient funds' });
    }

    const newBalance = request.type === 'DEPOSIT' 
      ? member.totalContributionsKobo + request.amountKobo 
      : member.totalContributionsKobo - request.amountKobo;

    await db.update(schema.members).set({ totalContributionsKobo: newBalance }).where(eq(schema.members.id, member.id));
    
    await db.insert(schema.ledgerTransactions).values({
      id: uuidv4(),
      reference: `TXN-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
      type: request.type === 'DEPOSIT' ? 'CONTRIBUTION_PAYMENT' : 'WITHDRAWAL_PAYMENT',
      status: 'COMPLETED',
      amountKobo: request.amountKobo,
      date: getUnixTime(new Date()),
    });
  }

  await db.update(schema.fundRequests).set({
    status: action === 'approve' ? 'APPROVED' : 'REJECTED',
    processedAt: getUnixTime(new Date()),
    processedBy: user.id
  }).where(eq(schema.fundRequests.id, id));

  res.json({ success: true });
});
