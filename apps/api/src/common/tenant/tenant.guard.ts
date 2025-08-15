import { 
  CanActivate, 
  ExecutionContext, 
  Injectable, 
  UnauthorizedException,
  Logger,
  ForbiddenException 
} from '@nestjs/common';
import { TENANT_HEADER, TENANT_PROP } from './tenant.constants';
import { TenantScopingMiddleware, TenantContext } from '../middleware/tenant-scoping.middleware';

@Injectable()
export class TenantGuard implements CanActivate {
  private readonly logger = new Logger(TenantGuard.name);

  constructor(private readonly tenantScopingMiddleware: TenantScopingMiddleware) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    // Extract tenant information with multiple fallbacks
    const tenantInfo = this.extractTenantInfo(req);
    
    if (!tenantInfo.tenantId) {
      this.logger.warn('Request without tenant context', {
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      });
      throw new UnauthorizedException('Missing tenant context');
    }

    // Validate tenant format
    if (!this.isValidTenantId(tenantInfo.tenantId)) {
      throw new ForbiddenException('Invalid tenant identifier format');
    }

    // Set tenant context in the request for controllers
    req[TENANT_PROP] = tenantInfo.tenantId;
    req.tenantContext = tenantInfo;

    // Set tenant context in AsyncLocalStorage for Prisma middleware
    this.tenantScopingMiddleware.setTenantContext({
      tenantId: tenantInfo.tenantId,
      userId: tenantInfo.userId,
      userRole: tenantInfo.userRole,
    });

    this.logger.debug('Tenant context established', {
      tenantId: tenantInfo.tenantId,
      userId: tenantInfo.userId,
      userRole: tenantInfo.userRole,
      source: tenantInfo.source,
      endpoint: `${req.method} ${req.url}`,
    });

    return true;
  }

  private extractTenantInfo(req: any): {
    tenantId: string | null;
    userId?: string;
    userRole?: string;
    source: 'jwt' | 'header' | 'domain' | 'none';
  } {
    // Priority 1: JWT claims (most secure)
    if (req.user?.tenantId || req.auth?.tenantId) {
      return {
        tenantId: (req.user?.tenantId || req.auth?.tenantId)?.trim(),
        userId: req.user?.sub || req.user?.id || req.auth?.sub,
        userRole: req.user?.role || req.auth?.role,
        source: 'jwt',
      };
    }

    // Priority 2: Header-based tenant (for development/testing)
    const headerTenant = req.headers[TENANT_HEADER] as string | undefined;
    if (headerTenant) {
      return {
        tenantId: headerTenant.trim(),
        source: 'header',
      };
    }

    // Priority 3: Domain-based tenant extraction (for custom domains)
    const host = req.headers.host;
    if (host && this.isCustomDomain(host)) {
      const tenantId = this.extractTenantFromDomain(host);
      if (tenantId) {
        return {
          tenantId,
          source: 'domain',
        };
      }
    }

    return {
      tenantId: null,
      source: 'none',
    };
  }

  private isValidTenantId(tenantId: string): boolean {
    // Validate tenant ID format (CUID pattern)
    const cuidPattern = /^c[a-z0-9]{24}$/;
    return cuidPattern.test(tenantId);
  }

  private isCustomDomain(host: string): boolean {
    // Check if it's not a development domain
    return !host.includes('localhost') && 
           !host.includes('127.0.0.1') && 
           !host.includes('.vercel.app') &&
           !host.includes('.railway.app');
  }

  private extractTenantFromDomain(host: string): string | null {
    // For custom domains, we could look up the tenant by domain
    // For now, this is a placeholder - would typically query the database
    // Example: clinic.example.com -> look up tenant by domain
    
    // This would be implemented with a service call:
    // return await this.tenantService.findByDomain(host);
    
    return null; // Placeholder
  }

  /**
   * Create a tenant context object for use in services
   */
  static createTenantContext(req: any): TenantContext {
    return {
      tenantId: req[TENANT_PROP],
      userId: req.user?.sub || req.user?.id,
      userRole: req.user?.role,
    };
  }
}

