# LACA Gap Matrix (Phase 1)

Updated: 2025-08-14

## Legend
- ✅ Implemented
- 🔄 Partial
- ❌ Missing

## Overview

| Area | Status | Notes |
|------|--------|-------|
| Monorepo Tooling | ✅ | PNPM + Turborepo in place |
| Database Schema | ✅ | Comprehensive aesthetics + LMS models; added Payment.stripePiId unique + timestamps |
| Migrations/Seeding | ✅ | Dev DB provisioned, seed data created (tenant, users, services, clients, template) |
| Multi-tenant Isolation | ❌ | No RLS; no tenant guard/middleware; tenantId present on most models |
| AuthN/AuthZ | 🔄 | Local JWT exists; external IdP missing; RBAC roles in schema; guards basic |
| Booking Engine | 🔄 | Availability service scaffolded; algorithm and policy engine not production-ready |
| Payments | 🔄 | Stripe service scaffolded; API version mismatch; flows incomplete; webhooks stubs |
| Documents/eSign | 🔄 | Templates + PDF deps; generation/stamping/esign integration missing |
| Notifications | ❌ | No SendGrid/Twilio providers wired; queues not configured |
| Search | ❌ | Meili running but unhealthy; no indexer |
| Files/CDN | ❌ | S3 config placeholders; upload endpoints not present |
| Admin App | 🔄 | Scaffold only; dashboards and modules not implemented |
| Web App | 🔄 | Demo booking routes; tenant routing present; booking wizard not complete |
| AI Features | ❌ | Packages stubbed; no orchestration/guards wired to flows |
| Observability | ❌ | No Sentry or OTel wiring; basic health endpoint exists |
| CI/CD | 🔄 | CI skeleton; no deploy jobs; no security scans |
| Infrastructure (AWS) | ❌ | No Terraform modules committed |
| Testing | 🔄 | Jest config; many services lack unit tests; no E2E/Playwright |

## Immediate Fixes (P1)
- Add TenantGuard + Prisma tenant middleware
- Decide Auth0 vs Clerk and wire FE/BE
- Fix Stripe API version + types; adjust Payment lookups by id or add composite unique keys
- Address TS errors (decorator imports, env typing, Prisma query fixes)

## Dependencies/Risks
- RLS vs middleware requires ADR; impacts query patterns and migrations
- IdP selection affects signup/login, session management, and admin provisioning
- Stripe object shapes must match SDK version; ensure correct API version

