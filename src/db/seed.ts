import { db } from './db';
import * as schema from './schema';
import { sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { subMonths, addMonths, startOfMonth, endOfMonth, getUnixTime } from 'date-fns';

async function clearDb() {
  console.log('Clearing database...');
  await db.delete(schema.auditLogs);
  await db.delete(schema.announcements);
  await db.delete(schema.demoEmailOutbox);
  await db.delete(schema.repaymentSchedules);
  await db.delete(schema.guarantorRequests);
  await db.delete(schema.loans);
  await db.delete(schema.loanProducts);
  await db.delete(schema.ledgerTransactions);
  await db.delete(schema.contributionObligations);
  await db.delete(schema.membershipApplications);
  await db.delete(schema.members);
  await db.delete(schema.users);
}

async function seed() {
  try {
    await clearDb();

    console.log('Seeding users and members...');
    const now = getUnixTime(new Date());

    const adminId = uuidv4();
    await db.insert(schema.users).values([
      { id: adminId, email: 'admin@seedcoop.demo', passwordHash: 'demo123', role: 'SUPER_ADMIN', createdAt: now, updatedAt: now },
      { id: uuidv4(), email: 'treasurer@seedcoop.demo', passwordHash: 'demo123', role: 'TREASURER', createdAt: now, updatedAt: now },
      { id: uuidv4(), email: 'loans@seedcoop.demo', passwordHash: 'demo123', role: 'LOAN_OFFICER', createdAt: now, updatedAt: now },
      { id: uuidv4(), email: 'auditor@seedcoop.demo', passwordHash: 'demo123', role: 'AUDITOR', createdAt: now, updatedAt: now },
    ]);

    const adaUserId = uuidv4();
    const chidiUserId = uuidv4();
    const temidayoUserId = uuidv4();

    await db.insert(schema.users).values([
      { id: adaUserId, email: 'john@seedcoop.demo', passwordHash: 'demo123', role: 'MEMBER', createdAt: now, updatedAt: now },
      { id: chidiUserId, email: 'chidi@seedcoop.demo', passwordHash: 'demo123', role: 'MEMBER', createdAt: now, updatedAt: now },
      { id: temidayoUserId, email: 'temidayo@seedcoop.demo', passwordHash: 'demo123', role: 'MEMBER', createdAt: now, updatedAt: now },
    ]);

    const adaMemberId = uuidv4();
    const chidiMemberId = uuidv4();
    const temidayoMemberId = uuidv4();

    await db.insert(schema.members).values([
      {
        id: adaMemberId, userId: adaUserId, membershipNumber: 'SC-10042', firstName: 'John', lastName: 'Doe', phoneNumber: '+2348001234567',
        status: 'ACTIVE', totalContributionsKobo: 12000000, joinedAt: getUnixTime(subMonths(new Date(now * 1000), 6))
      },
      {
        id: chidiMemberId, userId: chidiUserId, membershipNumber: 'SC-2026-002', firstName: 'Chidi', lastName: 'Okafor', phoneNumber: '+2348023456789',
        status: 'ACTIVE', totalContributionsKobo: 24000000, joinedAt: getUnixTime(subMonths(new Date(now * 1000), 12))
      },
      {
        id: temidayoMemberId, userId: temidayoUserId, membershipNumber: 'SC-2026-003', firstName: 'Temidayo', lastName: 'Adebayo', phoneNumber: '+2348034567890',
        status: 'ACTIVE', totalContributionsKobo: 5000000, joinedAt: getUnixTime(subMonths(new Date(now * 1000), 2))
      }
    ]);

    console.log('Seeding loan products...');
    const emergencyLoanId = uuidv4();
    const developmentLoanId = uuidv4();
    const schoolFeesLoanId = uuidv4();

    await db.insert(schema.loanProducts).values([
      { id: emergencyLoanId, name: 'Emergency Loan', minAmountKobo: 5000000, maxAmountKobo: 50000000, interestRate: 0.05, maxTermMonths: 6, requiredGuarantors: 1 },
      { id: developmentLoanId, name: 'Development Loan', minAmountKobo: 100000000, maxAmountKobo: 1000000000, interestRate: 0.10, maxTermMonths: 24, requiredGuarantors: 2 },
      { id: schoolFeesLoanId, name: 'School Fees Loan', minAmountKobo: 20000000, maxAmountKobo: 200000000, interestRate: 0.07, maxTermMonths: 12, requiredGuarantors: 1 }
    ]);

    console.log('Seeding announcements...');
    await db.insert(schema.announcements).values([
      { id: uuidv4(), title: 'Annual General Meeting', content: 'Our upcoming AGM will hold on the 15th of next month. All active members are expected.', audience: 'MEMBER', publishedAt: getUnixTime(subMonths(new Date(now * 1000), 1)) },
      { id: uuidv4(), title: 'Welcome to SeedCoop', content: 'We are excited to launch our new digital cooperative platform.', audience: 'PUBLIC', publishedAt: getUnixTime(subMonths(new Date(now * 1000), 2)) }
    ]);

    console.log('Database seeded successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seed();
