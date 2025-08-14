# ADR 0001: Multi-tenant Strategy

Date: 2025-08-14
Status: Proposed

## Context
The product serves multiple clinics (tenants) and an academy. Most tables include tenantId but there is no enforced isolation (no Postgres RLS, no API guard). We need strong isolation, good DX, and acceptable performance.

## Options Considered
1. API middleware only (inject tenantId in queries)
2. Postgres Row-Level Security (RLS) only
3. Hybrid: RLS for critical tables + middleware for convenience

## Decision
Adopt a hybrid approach:
- Enable Postgres RLS for critical PII/business tables (clients, appointments, documents, payments, events)
- Implement API-level TenantGuard to extract tenant from JWT/domain and set it in request context
- Add Prisma middleware to auto-scope reads/writes by tenantId and to assert presence

## Consequences
- Security-in-depth (DB enforces isolation even if code mistakes occur)
- Some migrations and policies to maintain
- Requires session-to-tenant binding and per-connection setting (e.g., set_config('app.tenant_id', ...))

## Implementation Notes
- Add RLS policies and a migration to set row security
- In NestJS, set `SET LOCAL app.tenant_id = $1` per request using Prisma `$executeRaw` in a request-scoped context
- Fallback checks in Prisma middleware for models without tenantId

