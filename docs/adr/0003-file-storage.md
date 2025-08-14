# ADR 0003: File Storage and CDN

Date: 2025-08-14
Status: Proposed

## Context
Documents (PDF consent), images, and course media must be stored securely with auditability and efficient delivery.

## Decision
- Use Vercel Blob as primary storage for documents and media
- Public assets served via Blob public URLs; private uploads via server-side token
- Alternative (later/optional): Cloudflare R2 or S3 if needed for scale/cost

## Implications
- Manage BLOB_READ_WRITE_TOKEN securely on API host; never expose in FE
- Access controls enforced in API (tenant guard + DB checks)
- Image optimization handled in FE (Next Image) and/or a lightweight image proxy

## Implementation Steps
- Storage abstraction in API with Vercel Blob provider (done)
- Use POST /v1/files for uploads; GET /v1/files/:id for retrieval metadata
- Set envs: STORAGE_PROVIDER=vercel-blob, BLOB_READ_WRITE_TOKEN, BLOB_PUBLIC_BASE_URL

