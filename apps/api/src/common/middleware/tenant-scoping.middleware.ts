import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContext {
  tenantId: string;
  userId?: string;
  userRole?: string;
}

// Models that should be automatically scoped by tenantId
const TENANT_SCOPED_MODELS = [
  'appointment',
  'client', 
  'service',
  'location',
  'payment',
  'document',
  'template',
  'course',
  'enrollment',
  'event',
  'brand',
  'subscription',
] as const;

// Models that use different tenant field names
const TENANT_FIELD_MAPPING: Record<string, string> = {
  userRole: 'tenantId',
  // Add other mappings if needed
};

@Injectable()
export class TenantScopingMiddleware {
  private readonly logger = new Logger(TenantScopingMiddleware.name);
  private readonly asyncLocalStorage = new AsyncLocalStorage<TenantContext>();

  constructor() {}

  /**
   * Set tenant context for the current request
   */
  setTenantContext(context: TenantContext): void {
    this.asyncLocalStorage.enterWith(context);
  }

  /**
   * Get current tenant context
   */
  getTenantContext(): TenantContext | undefined {
    return this.asyncLocalStorage.getStore();
  }

  /**
   * Run code within a tenant context
   */
  async runWithTenantContext<T>(
    context: TenantContext,
    fn: () => Promise<T>
  ): Promise<T> {
    return this.asyncLocalStorage.run(context, fn);
  }

  /**
   * Apply Prisma middleware for automatic tenant scoping
   * Note: Currently disabled due to TypeScript compatibility issues with Prisma v6
   * Tenant scoping is handled at the controller level instead
   */
  applyMiddleware(prisma: PrismaClient): void {
    // TODO: Re-enable when Prisma middleware TypeScript issues are resolved
    // For now, tenant scoping is enforced at the controller/service level
    this.logger.log('Prisma middleware application skipped - using controller-level tenant scoping');
  }

  private addTenantToCreate(params: any, tenantId: string, tenantField: string): any {
    if (params.args.data) {
      // Single create
      if (!params.args.data[tenantField]) {
        params.args.data[tenantField] = tenantId;
      } else if (params.args.data[tenantField] !== tenantId) {
        throw new Error(`Attempt to create record for different tenant: ${params.args.data[tenantField]} !== ${tenantId}`);
      }
    }

    // Handle upsert
    if (params.args.create && !params.args.create[tenantField]) {
      params.args.create[tenantField] = tenantId;
    }
    if (params.args.update && !params.args.update[tenantField]) {
      params.args.update[tenantField] = tenantId;
    }

    return params;
  }

  private addTenantToCreateMany(params: any, tenantId: string, tenantField: string): any {
    if (params.args.data && Array.isArray(params.args.data)) {
      params.args.data = params.args.data.map((item: any) => ({
        ...item,
        [tenantField]: item[tenantField] || tenantId,
      }));

      // Validate all records belong to the same tenant
      const invalidRecords = params.args.data.filter((item: any) => item[tenantField] !== tenantId);
      if (invalidRecords.length > 0) {
        throw new Error(`Attempt to create records for different tenant in createMany operation`);
      }
    }
    return params;
  }

  private addTenantToRead(params: any, tenantId: string, tenantField: string): any {
    params.args = params.args || {};
    params.args.where = params.args.where || {};

    // Don't override explicit tenant filtering
    if (!params.args.where[tenantField]) {
      params.args.where[tenantField] = tenantId;
    }

    return params;
  }

  private addTenantToModify(params: any, tenantId: string, tenantField: string): any {
    params.args = params.args || {};
    params.args.where = params.args.where || {};

    // Ensure modifications only affect records from the current tenant
    if (!params.args.where[tenantField]) {
      params.args.where[tenantField] = tenantId;
    } else if (params.args.where[tenantField] !== tenantId) {
      throw new Error(`Attempt to modify records for different tenant: ${params.args.where[tenantField]} !== ${tenantId}`);
    }

    return params;
  }

  /**
   * Validate tenant access for sensitive operations
   */
  validateTenantAccess(resourceTenantId: string, operation: string): void {
    const context = this.getTenantContext();
    
    if (!context) {
      throw new Error('No tenant context available for validation');
    }

    if (context.tenantId !== resourceTenantId) {
      this.logger.warn(`Tenant isolation violation attempt`, {
        contextTenantId: context.tenantId,
        resourceTenantId,
        operation,
        userId: context.userId,
      });
      throw new Error('Access denied: resource belongs to different tenant');
    }
  }

  /**
   * Get tenant statistics for monitoring
   */
  getTenantStats(): any {
    const context = this.getTenantContext();
    return {
      currentTenant: context?.tenantId,
      currentUser: context?.userId,
      scopedModels: TENANT_SCOPED_MODELS,
    };
  }
}
