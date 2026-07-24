# SeedCoop

Digital cooperative society platform for savings, deposits, loans, and member management.

**Live demo (GitHub Pages):** https://temidayoxyz.github.io/seedcoopdemo/

This repository is a full-stack **prototype**. Locally it runs Express + SQLite. On GitHub Pages it runs as a **static SPA** with an in-browser mock API (localStorage), so you can explore member and admin portals without a backend.

## Features

- Public site (home, about, membership, loans, bylaws)
- Member portal: contributions, loans, deposits/withdrawals, statements, notifications
- Admin portal: applications, members, contributions, loans, funds, reports, email outbox
- Roles: Member, Super Admin, Treasurer, Loan Officer, Auditor
- Money amounts in Nigerian Naira (stored as kobo)

## Demo logins

| Portal | Email | Password |
|--------|--------|----------|
| Member | `john@seedcoop.demo` | `demo123` |
| Member | `chidi@seedcoop.demo` | `demo123` |
| Admin | `admin@seedcoop.demo` | `demo123` |
| Treasurer | `treasurer@seedcoop.demo` | `demo123` |
| Loan Officer | `loans@seedcoop.demo` | `demo123` |

## Local development (full stack)

Requires Node.js 20+.

```bash
npm install
npm run dev
```

App: http://localhost:3010 (or set `PORT`)

Optional DB helpers:

```bash
npm run db:seed
npm run db:reset
```

## GitHub Pages build

GitHub Pages only serves static files. The Pages build enables **static demo mode**:

```bash
npm run build:pages
npm run preview:pages
```

- Base path: `/seedcoopdemo/`
- API calls are handled in the browser (see `src/static-demo/`)
- Demo data persists in `localStorage` for that browser

CI deploys automatically on every push to `main` via `.github/workflows/deploy-pages.yml`.

## Tech stack

- React 19 + Vite + TypeScript + Tailwind CSS 4
- React Router 7
- Express + Drizzle ORM + SQLite (local / full stack only)
- Cookie sessions (local); localStorage session (static demo)

## Project layout

```
src/
  pages/public|member|admin   UI surfaces
  server/api.ts               Express API (local)
  db/                         Schema, seed, SQLite
  static-demo/                In-browser mock API for Pages
server.ts                     Dev/prod Node entry
```

## License

Private demo / prototype. Adjust as needed for your org.
