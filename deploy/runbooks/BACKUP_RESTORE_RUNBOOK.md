# Backup & Restore Runbook (Per Center)

## Scope

Apply this runbook independently to each center deployment.

## Backup Standard

- Backup target must be unique per center.
- Backup schedule must be recorded in deployment registry.
- Backup retention window must be defined and audited.
- Backup encryption at rest must be enabled.

## Restore Drill Standard

- Perform a restore drill at least once before production go-live.
- Repeat restore drills on a regular cadence (for example monthly/quarterly per policy).
- Log drill date, operator, and result in deployment registry.

## Minimum Restore Verification

- App can connect using restored database.
- Migrations are consistent with current image.
- Critical workflows (auth, attendance, fees) open without DB errors.

