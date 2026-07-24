# SeedCoop

Digital cooperative society platform for thrift, deposits, loans, investments, dividends, and staff governance.

**Live:** https://temidayoxyz.github.io/seedcoopdemo/

## Sign-in directory (10 profiles)

Password for every account: **`seedcoop`**

### Staff (3)

| Continue as | Email | Role | Powers |
|-------------|--------|------|--------|
| Amaka Okoro | `admin@seedcoop.ng` | Super Admin | Full control — membership, loan approval, funds, investments, dividends, settings |
| Aisha Nuhu | `treasurer@seedcoop.ng` | Treasurer | Contributions, deposits/withdrawals, loan disbursement, investments & dividends |
| Tunde Bakare | `auditor@seedcoop.ng` | Auditor | Read-only ledger, reports, members, outbox |

### Members (7)

| ID | Name | Opening position |
|----|------|------------------|
| SC-001 | Ada Okonkwo | Fully paid · strong thrift · no loan |
| SC-002 | Chidi Okafor | Partial dues · active emergency loan |
| SC-003 | Temidayo Adebayo | Arrears · loan restricted |
| SC-004 | Fatima Bello | School loan nearly complete |
| SC-005 | Emeka Nwosu | Loan pending board approval |
| SC-006 | Ngozi Eze | Withdrawal pending |
| SC-007 | Ibrahim Yusuf | New member · building thrift |

All activity shares **one cooperative ledger** on the device (member thrift, staff actions, investments, and dividends stay in sync). Use **Restore default cooperative data** on the sign-in page or Super Admin settings before a walkthrough.

## Features

- Money UX: ₦ formatting (kobo), receipts, copyable references, double-sided admin ledger
- Contributions, deposits, withdrawals end-to-end
- Loans: apply → approve (Super Admin) → disburse (Treasurer)
- Investments portfolio + surplus dividends
- Member statements from live ledger
- Announcements + message outbox
- Role-visible staff navigation

## Local development

```bash
npm install
npm run dev
```

App: http://localhost:3010

```bash
npm run build:pages   # GitHub Pages static build
```

## Stack

React 19 · Vite · TypeScript · Tailwind · Express (asset server) · client-side cooperative state
