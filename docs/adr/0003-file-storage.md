# ADR 0003: File Storage and CDN

Date: 2025-08-14
Status: Proposed

## Context
Documents (PDF consent), images, and course media must be stored securely with auditability and efficient delivery.

## Decision
- Use AWS S3 for storage; separate buckets for private (PHI) and public assets
- Use CloudFront as CDN for public assets and signed URLs for private access
- In local dev, use MinIO with compatible S3 APIs

## Implications
- Clear bucket policies and KMS encryption
- Signed URL lifetimes, audit logging, and access controls via RBAC/tenant
- Image optimization handled in FE (Next Image) and/or a lightweight image proxy

## Implementation Steps
- Add s3-client service in API with put/get signed URL endpoints
- Configure buckets, IAM roles via Terraform
- Migrate existing file references to use s3Key convention

