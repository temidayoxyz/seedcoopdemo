# SeedCoop

Digital operating system for a thrift cooperative: contributions, deposits, withdrawals, loans, investments, dividends, and staff governance — on one shared ledger.

**Live demo:** https://temidayoxyz.github.io/seedcoopdemo/

---

## Quick start

```bash
npm install
npm run dev
```

App runs at **http://localhost:3010**

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local development server |
| `npm run build:pages` | Static build for GitHub Pages |
| `npm run preview:pages` | Preview the Pages build |

Password for every demo account: **`seedcoop`**

---

## Demo accounts

### Staff (also members)

Each officer has a **staff role** and a **personal thrift profile**. After sign-in, use **Switch to member view** / **Switch to staff view** in the sidebar to move between portals without signing out.

| Name | Email | Role | Member ID | Duties |
|------|-------|------|-----------|--------|
| Dan Segun | `admin@seedcoop.ng` | Super Admin | SC-008 | Full control — membership, loans, funds, investments, settings, data reset |
| Ola Dayo | `ops@seedcoop.ng` | Admin | SC-010 | Governance — applications, member status, loan **approval** (no money movement) |
| Tunde Bakare | `treasurer@seedcoop.ng` | Treasurer | SC-009 | Treasury — contributions, deposits/withdrawals, loan **disbursement**, investments, dividends |

Roles are intentionally different: Admin is **not** a read-only auditor, and Super Admin is not the same as Admin.

### Members

| ID | Name | Opening position |
|----|------|------------------|
| SC-001 | Ada Okonkwo | Fully paid · strong thrift · no loan |
| SC-002 | Chidi Okafor | Partial dues · active emergency loan |
| SC-003 | Temidayo Adebayo | Arrears · loan restricted |
| SC-004 | Fatima Bello | School loan nearly complete |
| SC-005 | Emeka Nwosu | Loan pending board approval |
| SC-006 | Ngozi Eze | Withdrawal pending |
| SC-007 | Ibrahim Yusuf | New member · building thrift |

All activity shares **one cooperative ledger** on the device. Use **Restore default cooperative data** on the sign-in page (or Super Admin settings) before a clean walkthrough.

---

## What you can demo

- **Money UX** — ₦ formatting (kobo), receipts, copyable references, double-sided admin ledger  
- **Funds** — contributions, deposits, and withdrawals end-to-end  
- **Loans** — apply → approve (Super Admin / Admin) → disburse (Treasurer / Super Admin)  
- **Dual identity** — staff open their own member dashboard, then switch back  
- **Investments & dividends** — portfolio plus surplus allocations  
- **Statements & outbox** — member statements from the live ledger; staff message outbox  
- **Role-based navigation** — each staff role sees only the tools it can use  

---

## Stack

React 19 · Vite · TypeScript · Tailwind CSS · Express (dev asset server) · client-side cooperative state (static / GitHub Pages)

---

## License

Private demo project.
