import { AsyncLocalStorage } from 'node:async_hooks';

export type TenantContext = { tenantId?: string };

export const tenantAls = new AsyncLocalStorage<TenantContext>();

export function getTenantId(): string | undefined {
  return tenantAls.getStore()?.tenantId;
}
