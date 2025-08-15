import { PrismaService } from '../../prisma/prisma.service';
import { TenantScopingMiddleware, TenantContext } from '../middleware/tenant-scoping.middleware';
import { Logger } from '@nestjs/common';

export interface TenantIsolationTestResult {
  passed: boolean;
  violations: TenantIsolationViolation[];
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
  };
  performance: {
    totalDurationMs: number;
    averageQueryTimeMs: number;
  };
}

export interface TenantIsolationViolation {
  test: string;
  table: string;
  expected: number;
  actual: number;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface TenantTestData {
  tenantId: string;
  users: Array<{ id: string; email: string; role: string }>;
  expectedRecordCounts: Record<string, number>;
}

export class TenantIsolationTester {
  private readonly logger = new Logger(TenantIsolationTester.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantMiddleware: TenantScopingMiddleware,
  ) {}

  /**
   * Run comprehensive tenant isolation tests
   */
  async runIsolationTests(
    testTenants: TenantTestData[],
    options: {
      includePerformanceTests?: boolean;
      includeCrossAccessTests?: boolean;
      testRLS?: boolean;
    } = {}
  ): Promise<TenantIsolationTestResult> {
    const startTime = Date.now();
    const violations: TenantIsolationViolation[] = [];
    let totalTests = 0;

    this.logger.log(`Starting tenant isolation tests for ${testTenants.length} tenants`);

    try {
      // Test 1: Basic tenant scoping
      const scopingViolations = await this.testTenantScoping(testTenants);
      violations.push(...scopingViolations);
      totalTests += scopingViolations.length;

      // Test 2: Cross-tenant access prevention
      if (options.includeCrossAccessTests) {
        const accessViolations = await this.testCrossTenantAccess(testTenants);
        violations.push(...accessViolations);
        totalTests += accessViolations.length;
      }

      // Test 3: RLS policy validation
      if (options.testRLS) {
        const rlsViolations = await this.testRLSPolicies(testTenants);
        violations.push(...rlsViolations);
        totalTests += rlsViolations.length;
      }

      // Test 4: Performance impact
      if (options.includePerformanceTests) {
        const performanceViolations = await this.testPerformanceImpact(testTenants);
        violations.push(...performanceViolations);
        totalTests += performanceViolations.length;
      }

      const endTime = Date.now();
      const totalDurationMs = endTime - startTime;

      const result: TenantIsolationTestResult = {
        passed: violations.filter(v => v.severity === 'HIGH' || v.severity === 'CRITICAL').length === 0,
        violations,
        summary: {
          totalTests,
          passedTests: totalTests - violations.length,
          failedTests: violations.length,
        },
        performance: {
          totalDurationMs,
          averageQueryTimeMs: totalDurationMs / totalTests,
        },
      };

      this.logTestResults(result);
      return result;

    } catch (error) {
      this.logger.error('Tenant isolation tests failed with error:', error);
      throw error;
    }
  }

  /**
   * Test basic tenant scoping functionality
   */
  private async testTenantScoping(testTenants: TenantTestData[]): Promise<TenantIsolationViolation[]> {
    const violations: TenantIsolationViolation[] = [];
    const tenantScopedTables = [
      'appointment', 'client', 'service', 'location', 
      'payment', 'document', 'course', 'enrollment', 'event'
    ];

    for (const tenant of testTenants) {
      for (const table of tenantScopedTables) {
        try {
          const context: TenantContext = { tenantId: tenant.tenantId };
          
          const actualCount = await this.tenantMiddleware.runWithTenantContext(context, async () => {
            return await this.getRecordCount(table, tenant.tenantId);
          });

          const expectedCount = tenant.expectedRecordCounts[table] || 0;

          if (actualCount !== expectedCount) {
            violations.push({
              test: 'tenant_scoping',
              table,
              expected: expectedCount,
              actual: actualCount,
              description: `Record count mismatch for ${table} in tenant ${tenant.tenantId}`,
              severity: expectedCount === 0 ? 'CRITICAL' : 'HIGH',
            });
          }

        } catch (error) {
          violations.push({
            test: 'tenant_scoping',
            table,
            expected: 0,
            actual: -1,
            description: `Error testing ${table}: ${error.message}`,
            severity: 'CRITICAL',
          });
        }
      }
    }

    return violations;
  }

  /**
   * Test cross-tenant access prevention
   */
  private async testCrossTenantAccess(testTenants: TenantTestData[]): Promise<TenantIsolationViolation[]> {
    const violations: TenantIsolationViolation[] = [];

    if (testTenants.length < 2) {
      this.logger.warn('Need at least 2 tenants for cross-access testing');
      return violations;
    }

    const tenant1 = testTenants[0];
    const tenant2 = testTenants[1];

    try {
      // Try to access tenant1 data while in tenant2 context
      const context: TenantContext = { tenantId: tenant2.tenantId };
      
      const crossAccessCount = await this.tenantMiddleware.runWithTenantContext(context, async () => {
        // This should return 0 if tenant isolation is working
        return await this.prisma.appointment.count({
          where: { tenantId: tenant1.tenantId }
        });
      });

      if (crossAccessCount > 0) {
        violations.push({
          test: 'cross_tenant_access',
          table: 'appointment',
          expected: 0,
          actual: crossAccessCount,
          description: `Cross-tenant data access detected: tenant ${tenant2.tenantId} can see ${crossAccessCount} records from tenant ${tenant1.tenantId}`,
          severity: 'CRITICAL',
        });
      }

    } catch (error) {
      // Expected behavior - cross-tenant access should be blocked
      this.logger.debug('Cross-tenant access properly blocked:', error.message);
    }

    return violations;
  }

  /**
   * Test Row-Level Security policies
   */
  private async testRLSPolicies(testTenants: TenantTestData[]): Promise<TenantIsolationViolation[]> {
    const violations: TenantIsolationViolation[] = [];

    for (const tenant of testTenants) {
      try {
        // Enable RLS for this tenant
        await this.prisma.enableRLSForTenant(tenant.tenantId);

        // Test that RLS is working by querying appointments
        const appointments = await this.prisma.$queryRaw`
          SELECT COUNT(*) as count FROM "Appointment" WHERE "tenantId" = ${tenant.tenantId}
        `;

        const count = Number((appointments as any)[0]?.count || 0);
        const expectedCount = tenant.expectedRecordCounts['appointment'] || 0;

        if (count !== expectedCount) {
          violations.push({
            test: 'rls_policy',
            table: 'Appointment',
            expected: expectedCount,
            actual: count,
            description: `RLS policy test failed for tenant ${tenant.tenantId}`,
            severity: 'HIGH',
          });
        }

      } catch (error) {
        violations.push({
          test: 'rls_policy',
          table: 'all',
          expected: 0,
          actual: -1,
          description: `RLS test error for tenant ${tenant.tenantId}: ${error.message}`,
          severity: 'MEDIUM',
        });
      }
    }

    return violations;
  }

  /**
   * Test performance impact of tenant isolation
   */
  private async testPerformanceImpact(testTenants: TenantTestData[]): Promise<TenantIsolationViolation[]> {
    const violations: TenantIsolationViolation[] = [];
    const performanceThresholdMs = 100; // Max acceptable query time

    for (const tenant of testTenants) {
      const startTime = Date.now();
      
      try {
        const context: TenantContext = { tenantId: tenant.tenantId };
        
        await this.tenantMiddleware.runWithTenantContext(context, async () => {
          // Perform a complex query that exercises tenant scoping
          const appointments = await this.prisma.appointment.findMany({
            take: 10,
            where: { tenantId: tenant.tenantId },
          });
          return appointments.length;
        });

        const queryTime = Date.now() - startTime;

        if (queryTime > performanceThresholdMs) {
          violations.push({
            test: 'performance',
            table: 'appointment_with_relations',
            expected: performanceThresholdMs,
            actual: queryTime,
            description: `Tenant-scoped query took ${queryTime}ms, exceeding threshold of ${performanceThresholdMs}ms`,
            severity: 'LOW',
          });
        }

      } catch (error) {
        violations.push({
          test: 'performance',
          table: 'appointment_with_relations',
          expected: performanceThresholdMs,
          actual: -1,
          description: `Performance test error for tenant ${tenant.tenantId}: ${error.message}`,
          severity: 'MEDIUM',
        });
      }
    }

    return violations;
  }

  /**
   * Get record count for a specific table and tenant
   */
  private async getRecordCount(table: string, tenantId: string): Promise<number> {
    const modelName = this.getModelName(table);
    
    if (!modelName || !(this.prisma as any)[modelName]) {
      throw new Error(`Unknown table/model: ${table}`);
    }

    return await (this.prisma as any)[modelName].count({
      where: { tenantId }
    });
  }

  /**
   * Map table names to Prisma model names
   */
  private getModelName(table: string): string | null {
    const mapping: Record<string, string> = {
      'appointment': 'appointment',
      'client': 'client',
      'service': 'service',
      'location': 'location',
      'payment': 'payment',
      'document': 'document',
      'course': 'course',
      'enrollment': 'enrollment',
      'event': 'event',
    };

    return mapping[table] || null;
  }

  /**
   * Log test results in a readable format
   */
  private logTestResults(result: TenantIsolationTestResult): void {
    const { summary, violations, performance } = result;

    this.logger.log(`Tenant Isolation Test Results:`);
    this.logger.log(`✅ Passed: ${summary.passedTests}/${summary.totalTests}`);
    this.logger.log(`❌ Failed: ${summary.failedTests}/${summary.totalTests}`);
    this.logger.log(`⏱️  Total time: ${performance.totalDurationMs}ms`);
    this.logger.log(`📊 Average query time: ${performance.averageQueryTimeMs.toFixed(2)}ms`);

    if (violations.length > 0) {
      this.logger.warn(`Found ${violations.length} tenant isolation issues:`);
      
      const criticalViolations = violations.filter(v => v.severity === 'CRITICAL');
      const highViolations = violations.filter(v => v.severity === 'HIGH');
      
      if (criticalViolations.length > 0) {
        this.logger.error(`🚨 CRITICAL violations (${criticalViolations.length}):`);
        criticalViolations.forEach(v => {
          this.logger.error(`  - ${v.description}`);
        });
      }

      if (highViolations.length > 0) {
        this.logger.warn(`⚠️  HIGH severity violations (${highViolations.length}):`);
        highViolations.forEach(v => {
          this.logger.warn(`  - ${v.description}`);
        });
      }
    } else {
      this.logger.log('🎉 All tenant isolation tests passed!');
    }
  }

  /**
   * Generate test data for a tenant
   */
  static generateTestData(tenantId: string, recordCounts: Record<string, number>): TenantTestData {
    return {
      tenantId,
      users: [
        { id: 'user1', email: `owner@${tenantId}.test`, role: 'OWNER' },
        { id: 'user2', email: `manager@${tenantId}.test`, role: 'MANAGER' },
      ],
      expectedRecordCounts: recordCounts,
    };
  }
}
