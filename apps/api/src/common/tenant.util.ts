export function getTenantId(): string {
  const fallback = process.env.DEFAULT_TENANT_ID || 'tenant_laca';
  return fallback;
}
