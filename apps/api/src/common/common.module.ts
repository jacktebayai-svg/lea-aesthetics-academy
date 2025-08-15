import { Global, Module } from '@nestjs/common';
import { TenantScopingMiddleware } from './middleware/tenant-scoping.middleware';
import { TenantGuard } from './tenant/tenant.guard';
import { PermissionsGuard } from './auth/permissions.guard';

@Global()
@Module({
  providers: [
    TenantScopingMiddleware,
    TenantGuard,
    PermissionsGuard,
  ],
  exports: [
    TenantScopingMiddleware,
    TenantGuard,
    PermissionsGuard,
  ],
})
export class CommonModule {}
