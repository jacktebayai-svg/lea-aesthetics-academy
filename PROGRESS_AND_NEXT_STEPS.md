# Progress & Next Steps (Vercel-first Deployment)

Date: 2025-08-14
Author: Agent Mode (gpt-5)

## Progress Summary

Foundation and fixes completed today:
- Fixed critical DB configuration and re-provisioned local stack (Postgres/Redis/Meili)
- Ran migrations and seeded demo tenant data (tn_demo) and users
- Resolved TypeScript errors in API; API now compiles cleanly
- Implemented tenant enforcement in controllers (Services, Availability, Appointments)
- Added TenantGuard + decorator + global interceptor (ALS context) for future Prisma/RLS use
- Corrected Stripe service types and API version; fixed Prisma typing issues
- Added gap matrix and ADRs (multi-tenant strategy, auth provider, file storage)
- Added preliminary RLS SQL (not applied) to prepare for DB-level tenant isolation

## Platform Decision Update: Vercel-first

We will deploy frontend (web, admin) to Vercel and run API on a managed service compatible with Vercel networking. Options:
- Railway/Fly.io/Render for API (HTTP + Postgres + Redis)
- Neon/Supabase for Postgres
- Upstash for Redis
- MeiliSearch Cloud (optional) or disable until needed
- Storage: Vercel Blob or Cloudflare R2 (instead of S3)
- Email: Resend (instead of SendGrid) – easier on Vercel
- SMS: Twilio remains (or alternative)

Recommended stack for speed of execution:
- API: Railway (NestJS Docker) + Railway Postgres + Upstash Redis
- Frontend: Vercel (web and admin)
- Storage: Vercel Blob for docs; upgrade to R2 if needed
- Auth: Auth0 (works with Vercel), or Clerk

## Required Changes for Vercel-first

1) File Storage
- Replace S3 client with an abstraction; add Vercel Blob implementation
- Env: BLOB_READ_WRITE_TOKEN, BLOB_PUBLIC_BASE_URL

2) Email provider
- Option A: Resend (RESEND_API_KEY) for transactional + marketing basics
- Option B: Keep SendGrid; both work with Vercel

3) CI/CD
- Use Vercel Git integration for web/admin
- For API, set up deploy on Railway/Fly with GitHub Actions minimal workflow

4) Environment Variables
- Split envs by app; add Vercel Project envs for web/admin
- API service envs on chosen platform (Railway/Fly)

5) Prisma Migrate in deploy
- Use platform build hooks to run `prisma migrate deploy`
- Ensure DATABASE_URL set on platform

6) Web middleware/domain routing
- Keep current middleware; for custom domains, use Vercel domain settings

7) Payments
- Keep Stripe; set webhook to API host on Railway/Fly

## Immediate Next Steps (2-3 days)

Day 1
- Add storage abstraction with Vercel Blob provider
- Introduce email provider abstraction; default to Resend with fallback to SendGrid
- Create API Dockerfile (if not present) and Procfile/fly.toml or Railway config
- Create minimal GitHub Action for API deploy

Day 2
- Wire Auth (Auth0) into web + API (JWT validation via JWKS)
- Add tenant claim to JWT and map to ALS tenant context
- Add basic E2E smoke tests (booking flow with deposit stub)

Day 3
- Optional: Convert RLS SQL into migration and safely enable for Clients/Appointments
- Add health checks and uptime monitoring docs for chosen platform

## Tracking Items
- docs/GAP_MATRIX.md – updated
- docs/adr/0001-multi-tenant-strategy.md – hybrid (RLS + middleware)
- docs/adr/0002-auth-provider.md – Auth0 for prod
- docs/adr/0003-file-storage.md – update to Vercel Blob/R2

## Open Questions
- Choose API host (Railway vs Fly vs Render)
- Choose Email provider (Resend vs SendGrid)
- Choose Search (defer Meili until needed?)

## How to Run Locally
- pnpm stack:up
- pnpm db:migrate && pnpm db:seed
- JWT_SECRET=dev-secret STRIPE_SECRET_KEY=sk_test_placeholder STRIPE_WEBHOOK_SECRET=whsec_placeholder pnpm --filter api start:dev
- pnpm --filter web dev
- pnpm --filter admin dev


