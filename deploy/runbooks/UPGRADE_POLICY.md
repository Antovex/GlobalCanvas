# Upgrade Policy (Independent Center Rollouts)

## Goal

Prevent one center deployment issue from impacting all centers.

## Policy

- Upgrade centers independently.
- Promote versions in stages: canary -> batch -> full rollout.
- Validate migrations and health checks per center before promotion.
- Support per-center rollback to previous known-good image.

## Release Tracking

For each center, record in deployment registry:

- target version
- rollout date/time
- validation result
- rollback decision (if any)

