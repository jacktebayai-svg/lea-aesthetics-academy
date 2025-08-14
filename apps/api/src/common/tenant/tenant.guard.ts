import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { TENANT_HEADER, TENANT_PROP } from './tenant.constants';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    // Priority: tenant from auth (JWT claims), fallback to header
    const claimsTenant = req.user?.tenantId || req.auth?.tenantId;
    const headerTenant = req.headers[TENANT_HEADER] as string | undefined;
    const tenantId = (claimsTenant || headerTenant)?.trim();

    if (!tenantId) {
      throw new UnauthorizedException('Missing tenant context');
    }

    req[TENANT_PROP] = tenantId;
    return true;
  }
}

