# Center Deployment Blueprint (Single-Tenant, Isolated)

This blueprint standardizes per-center deployments so each institution is independently deployable, operable, and transferable.

## 1) Isolation Model

Each center must run as a separate single-tenant stack:

- 1 dedicated app container
- 1 dedicated PostgreSQL database + volume
- 1 dedicated domain/subdomain
- 1 dedicated `.env.center` secrets set
- 1 dedicated integration configuration (Clerk, Cloudinary, Sentry)

No center should share database, secrets, or external integration credentials with another center.

---

## 2) Provisioning Template

Use:

- `deploy/center-template/docker-compose.center.yml`
- `deploy/center-template/.env.center.example`

Per center:

1. Change into template directory and copy `.env.center.example` to `.env.center`.
2. Fill all center-specific values and rotate generated passwords/keys.
3. Start deployment:
   ```bash
   cd deploy/center-template
   cp .env.center.example .env.center
   # edit .env.center
   docker compose -f docker-compose.center.yml up -d --build
   ```
4. Register deployment details in the deployment registry template.

---

## 3) External Integrations (Per Center)

Create and store separately per center:

- Clerk app credentials (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`)
- Cloudinary cloud/project credentials
- Sentry DSN(s)

Do not reuse integration credentials across centers.

---

## 4) Deployment Registry

Track each center in:

- `deploy/registry/deployment-registry.template.csv`

Minimum required registry data:

- center slug/name/domain
- host/environment
- app version/image tag
- DB name
- backup destination/schedule
- last restore drill date
- credentials owner
- handover contact
- status

---

## 5) Backup and Restore Standard

Required per center:

- automated DB backup schedule
- isolated backup target
- retention policy
- periodic restore drill

Reference: `deploy/runbooks/BACKUP_RESTORE_RUNBOOK.md`

Go-live gate:

- no center can be marked production-ready without one successful restore drill recorded in the registry.

---

## 6) Upgrade Policy

Upgrade centers independently to contain risk:

- canary center first
- staged batch rollout
- rollback per center if needed

Never block all centers on one global deployment.

---

## 7) Handover Artifacts (Transfer Pack)

For each center, prepare:

- source snapshot (tag/commit + image tag)
- sanitized `.env.center` checklist (keys list, not raw secrets in shared docs)
- latest DB dump and restore verification result
- migration history (`prisma/migrations`)
- runbook for start/stop/backup/restore/upgrade
- operational ownership contacts

Reference: `deploy/runbooks/HANDOVER_CHECKLIST.md`

---

## 8) Offboarding SOP

When a center requests handover:

1. Freeze change window.
2. Deliver transfer pack.
3. Share credential reset/rotation checklist.
4. Verify restore on recipient-owned environment.
5. Confirm acceptance and responsibility transfer.

Reference: `deploy/runbooks/OFFBOARDING_SOP.md`

---

## 9) Security Baseline

Mandatory per center:

- HTTPS termination via reverse proxy
- least-privilege DB user unique to center
- secret rotation procedure
- access separation for operators by center
- per-center incident response owner

Reference:

- `deploy/runbooks/UPGRADE_POLICY.md`
- `deploy/runbooks/SECURITY_BASELINE.md`
