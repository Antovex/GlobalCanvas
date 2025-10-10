<div align="center">
    <h1>🌐 GlobalCanvas</h1>
    <p><strong>Role-Based School Management & Academic Operations Platform</strong></p>
    <p align="center">
        <a href="https://nodejs.org" title="Node.js Runtime"><img alt="Node" src="https://img.shields.io/badge/Node-18%2B-339933?logo=node.js&logoColor=white" /></a>
        <a href="https://nextjs.org" title="Next.js Framework"><img alt="Next.js" src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" /></a>
        <a href="https://www.typescriptlang.org/" title="TypeScript"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" /></a>
        <a href="https://www.prisma.io/" title="Prisma ORM"><img alt="Prisma" src="https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma" /></a>
        <a href="https://www.postgresql.org/" title="PostgreSQL Database"><img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-DB-4169E1?logo=postgresql&logoColor=white" /></a>
        <a href="https://clerk.com" title="Clerk Authentication"><img alt="Clerk" src="https://img.shields.io/badge/Auth-Clerk-5A3FC0" /></a>
        <a href="https://www.docker.com/" title="Docker Ready"><img alt="Docker" src="https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white" /></a>
        <img alt="Release" src="https://img.shields.io/badge/Release-0.1.0-informational" />
    </p>
    <p><em>Modern, extensible platform for managing academic data, attendance, assessments, finance & communication—with strict role-based access.</em></p>
</div>

---

### 📌 Overview
GlobalCanvas is a full‑stack, role‑aware School Management System built with Next.js (App Router) & Prisma (PostgreSQL). It centralizes:

> Users • Academic Structure • Attendance • Assessments • Results • Fees • Announcements • Events • Inventory • Analytics

### 🧭 Table of Contents
1. [Key Features](#-key-features)
2. [Tech Stack](#-tech-stack)
3. [Getting Started](#-getting-started)
4. [Usage](#-usage)
5. [Project Structure](#-project-structure)
6. [API Endpoints](#-api-endpoints)
7. [Database Model Highlights](#-database-model-highlights)
8. [Seeding](#-seeding)
9. [Docker Notes](#-docker-deployment-notes)
10. [Security Recommendations](#-security--hardening-recommended-next-steps)
11. [Contributing](#-contributing)
<!--
[Troubleshooting](#-troubleshooting)
[Roadmap](#-roadmap-suggested)
[License](#-license)
-->
---

## 🔑 Key Features
| Category | Highlights |
|----------|------------|
| Access Control | Role-based gating (Admin, Teacher, Student, Parent) via Clerk & middleware |
| Academic Model | Classes, Subjects, Lessons (weekday + time scheduling) |
| Assessments | Exams, Assignments, Results per student |
| Attendance | Student (per lesson, status enum) & Teacher (daily with stats) |
| Finance | Monthly Student Fees (unique per student+month) |
| Communication | Announcements & Events (class/global) |
| Inventory | Supplies tracking (quantities) |
| Analytics | Recharts visualizations (counts, performance, finance, attendance) |
| Media | Cloudinary integration for assets / profile images |
| Forms & Validation | React Hook Form + Zod validation layer |
| Deployment | Docker + automated Prisma migration deploy |
| Data Integrity | Prisma enums, composite uniqueness, cascades |

<details>
<summary><strong>Extended Feature Notes</strong></summary>

* Idempotent attendance endpoints prevent duplicate daily records.
* Pagination + statistics for teacher attendance listing.
* Flexible event & announcement scoping (class or global).
* Clean separation of UI components, hooks, and lib utilities.
* Middleware-driven redirection ensures safe navigation.
* Seed script ready for demo / test bootstrapping.
</details>

## 🧱 Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | Next.js (App Router) + React 18 + TypeScript |
| Styling | Tailwind CSS |
| Forms & Validation | React Hook Form, Zod, @hookform/resolvers |
| Auth & RBAC | Clerk (Next.js integration, metadata roles) |
| Data Layer | PostgreSQL + Prisma ORM (@prisma/client) |
| Charts | Recharts |
| Calendars / Scheduling | react-big-calendar, react-calendar, moment |
| Media | next-cloudinary (Cloudinary) |
| Notifications | react-toastify |
| Containerization | Docker, docker-compose |

---

## 🚀 Getting Started

### 5.1 Prerequisites
* Node.js 18+ (Docker image uses node:18; Node 20 LTS also compatible)
* npm (bundled with Node) or compatible package manager
* PostgreSQL 14+ (local or via Docker)
* Cloudinary account (optional – for image features)
* Clerk account & application (for auth keys)

### 5.2 Environment Variables
Copy `.env.example` to `.env` and fill in values:
```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
```
If using seeding scripts that upload or transform images, you may also require a Cloudinary API secret (not currently referenced in example). Keep secrets out of version control.

#### 5.2.1 Sentry (Optional Monitoring & Tracing)
Add these if you want error + performance + (optional) session replay monitoring:
```
SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```
Notes:
- DSN is not a secret; it's safe to expose publicly.
- Keep both the same unless you intentionally separate client/server projects.
- If you only care about server errors, omit `NEXT_PUBLIC_SENTRY_DSN`.

Already configured files:
| File | Purpose |
|------|---------|
| `sentry.server.config.ts` | Server runtime (API routes / server components) |
| `sentry.edge.config.ts` | Middleware / edge handlers |
| `src/instrumentation-client.ts` | Browser (client) instrumentation + Replay |
| `next.config.mjs` | Wraps Next config so source maps upload in builds |

Adjust sampling for production (example recommendations):
```ts
// server / edge
tracesSampleRate: 0.2 // or use tracesSampler

// client instrumentation
tracesSampleRate: 0.1
replaysSessionSampleRate: 0.05
replaysOnErrorSampleRate: 1.0
```

Trigger a test event:
```ts
import * as Sentry from '@sentry/nextjs'
Sentry.captureException(new Error('Manual test error'))
```
Then visit your Sentry dashboard Issues view.

### 5.3 Quick Start (Local, No Docker)
```bash
# 1. Clone
git clone <repository-url>
cd GlobalCanvas

# 2. Install dependencies
npm install

# 3. Configure env
cp .env.example .env
# (Edit .env with database + Clerk credentials)

# 4. Run database migrations (creates & applies all migrations)
npx prisma migrate dev

# 5. (Optional) Seed data
npx prisma db seed

# 6. Start dev server
npm run dev
```
Visit: http://localhost:3000

### 5.4 Run with Docker (App + Postgres)
```bash
cd GlobalCanvas
docker compose up --build
```
The app container auto-generates Prisma client, applies migrations (or db push), then starts on port 3000. Postgres is exposed on 5432.

### 5.5 Regenerate Prisma Client
```bash
npx prisma generate
```

### 5.6 Apply Production Migrations
```bash
npx prisma migrate deploy
```

### 5.7 Maintenance
```bash
# Inspect schema / open interactive studio
npx prisma studio

# Format Prisma schema
npx prisma format
```

---

## 🛠 Usage

### 6.1 Scripts
| Script | Command | Purpose |
|--------|---------|---------|
| Dev | `npm run dev` | Start Next.js in development (hot reload). |
| Build | `npm run build` | Production build (Next.js + TypeScript). |
| Start | `npm start` | Start production server (assumes build). |
| Lint | `npm run lint` | Run ESLint with Next.js config. |

### 6.2 Development Flow
1. Create / update Prisma models in `prisma/schema.prisma`.
2. Run `npx prisma migrate dev --name <change>` to create & apply a migration.
3. Implement UI or API routes in `src/app/*`.
4. Use server components / server actions or API endpoints with `prisma` client for data access.
5. Protect routes via Clerk (middleware auto-redirects unauthorized roles).

### 6.3 Authentication & Roles
Roles are stored in Clerk user metadata and enforced in `middleware.ts` against `routeAccessMap`. Unauthorized users are redirected to `/unauthorized` or their allowed dashboard root.

---

## 🗂 Project Structure
```
GlobalCanvas/
    docker-compose.yml        # App + Postgres orchestration
    Dockerfile                # Production build image
    docker-entrypoint.sh      # Migration + startup automation
    prisma/                   # Prisma schema, migrations, seed script
    src/
        middleware.ts           # Clerk role-based route guarding
        app/                    # Next.js App Router structure (layouts, routes, API)
            api/                  # Route handlers (REST-like endpoints)
        components/             # Reusable React UI components & charts
        hooks/                  # Custom React hooks (state/data logic)
        lib/                    # Utilities (Prisma client, role helpers, settings)
    public/                   # Static assets & images
    tailwind.config.ts        # Tailwind CSS config
    tsconfig.json             # TypeScript configuration
    package.json              # Scripts & dependencies
```

---

## 🔗 API Endpoints
Current implemented (sample) endpoints discovered in `src/app/api`:

### 8.1 Student Attendance
```
POST /api/attendances
```
Body (JSON):
```json
{
    "studentId": "string",        // required
    "lessonId": 123,               // required (number or numeric string)
    "status": "PRESENT|ABSENT|COMPENSATION", // required
    "date": "2025-09-11"          // optional (ISO or YYYY-MM-DD); defaults now
}
```
Behavior: Idempotent per (studentId + lessonId + calendar day). If record exists, updates status/date; else creates new. Authorization: role must be `teacher` or `admin`.

Responses:
* 201 Created `{ ok: true, action: "created", data: {...} }`
* 200 Updated `{ ok: true, action: "updated", data: {...} }`
* 4xx / 5xx JSON error messages.

### 8.2 Teacher Attendance
```
POST /api/teacher-attendances
```
Body (JSON):
```json
{
    "teacherId": "string", // required
    "present": true,        // required boolean
    "date": "2025-09-11"   // optional; stored normalized to start of day
}
```
Authorization: `admin` only. Idempotent per (teacherId + date). Returns created or updated record (with teacher name + surname).

```
GET /api/teacher-attendances?teacherId=...&date=YYYY-MM-DD&from=YYYY-MM-DD&to=YYYY-MM-DD&page=1&limit=50
```
Query Parameters:
* `teacherId` (admin only override; teachers automatically restricted to self)
* `date` (exact day) OR `from` / `to` range
* `page`, `limit` for pagination

Response JSON:
```json
{
    "data": [ { "id":1, "date":"...", "present":true, "teacher": {"id":"...","name":"..."} } ],
    "pagination": { "page":1, "limit":50, "total":10, "totalPages":1 },
    "statistics": { "totalDays":10, "presentDays":9, "absentDays":1, "percentage":90.0 }
}
```
Authorization: `admin` or `teacher` (teacher sees only own records).

### 8.3 Additional Domain Operations
Other entities (Results, Exams, Assignments, Student Fees, Supplies, Announcements, Events, Lessons, Classes, Subjects) are currently handled through server components / actions (not all exposed as explicit `api` routes yet). To extend public API surface, implement additional REST handlers under `src/app/api/<resource>/route.ts` or adopt a GraphQL/trpc layer.

---

## 🧬 Database Model Highlights
* Composite uniqueness: `StudentFee` (`studentId`, `month`), `TeacherAttendance` (`teacherId`, `date`).
* Enums: `Day`, `AttendanceStatus`, `UserSex`.
* Cascades: StudentFee & TeacherAttendance reference Teachers/Students with `onDelete: Cascade` safeguarding referential integrity.
* Time-based scheduling via `Lesson` start/end DateTime plus enumerated weekday.

---

## 🌱 Seeding
The seed script (`prisma/seed.ts`) can be run after migrations:
```bash
npx prisma db seed
```
Adjust or expand it to populate demo users aligned with Clerk test accounts.

---

## 🐳 Docker Deployment Notes
* `docker-entrypoint.sh` auto-generates Prisma client & applies migrations (or pushes schema if no migrations found) with retry logic against Postgres health.
* To override database credentials, edit `docker-compose.yml` or supply env overrides.
* For production, replace hard-coded compose credentials and add secrets management.

---

## 🔒 Security & Hardening (Recommended Next Steps)
* Enforce HTTPS (reverse proxy: Nginx / Traefik) in production.
* Add input validation (Zod) to all new API routes (some endpoints already manual validate).
* Implement rate limiting (e.g., upstream proxy or middleware) for write endpoints.
* Add audit logging for sensitive changes (fees, attendance edits).
* Introduce tests (unit + integration) for attendance & fee logic.

---

## 🤝 Contributing
1. Fork & branch from `main`.
2. Create descriptive feature branch: `feat/<name>`.
3. Ensure schema + migrations committed when model changes.
4. Run lint before PR: `npm run lint`.
5. Provide concise PR description (scope, changes, testing notes).

<!--
---

## 🧪 Troubleshooting
| Issue | Possible Fix |
|-------|--------------|
| Prisma client not generated | Run `npx prisma generate` or reinstall deps. |
| Migrations fail on startup (Docker) | Ensure Postgres env vars match `DATABASE_URL`; remove volume to reset local data. |
| Auth redirects unexpectedly | Verify user role metadata in Clerk dashboard & `routeAccessMap`. |
| Timezone inconsistencies | Normalize all date inputs to start-of-day when comparing daily uniqueness. |
| Images not loading | Check Cloudinary env vars and allowed domains in Next config. |

---

## 📄 License
Specify a license (e.g., MIT) in a `LICENSE` file if open-sourcing. Currently unspecified.

---
> Keep this README updated as API surface & domain features evolve.
-->
---

### 🖼 Architecture & Data Model
<details>
<summary>View ER Diagram</summary>

![ER Diagram](./ER_Diagram.png)

</details>

<!--### 📷 (Optional) Screens / Dashboards
Add representative screenshots (e.g. `public/` assets) here to showcase dashboards, charts & calendars.
-->
---

<div align="center">
<sub>Crafted with precision. Extend, adapt, and build great academic tools on top of GlobalCanvas.</sub>
</div>

