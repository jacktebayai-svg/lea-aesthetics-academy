# ADR 0002: Authentication Provider

Date: 2025-08-14
Status: Proposed

## Context
The codebase uses local JWT for demo. Production needs secure, scalable auth with MFA, org/tenant support, and compliance.

## Options
- Auth0
- Clerk
- DIY (Passport + OAuth providers)

## Decision
Use Auth0 for production; keep local JWT for dev-only.

## Rationale
- Enterprise features (MFA, Organizations, SSO) and mature ecosystem
- Lower maintenance vs DIY
- Supports Role/Permission claims for RBAC

## Implementation Plan
- Add Auth0 to web/admin (Next.js middleware + SDK)
- Add NestJS Auth0 JWT validation and JWKS
- Map Auth0 org to tenant; on first login, provision tenant or link existing
- Migrate local users or create admin invite flow

