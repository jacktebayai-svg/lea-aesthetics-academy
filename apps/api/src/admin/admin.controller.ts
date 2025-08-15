import {
  Controller,
  Get,
  Post,
  Body,
  HttpStatus,
  HttpException,
  Logger,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { TenantScopingMiddleware } from '../common/middleware/tenant-scoping.middleware';
import { TenantIsolationTester, TenantTestData } from '../common/testing/tenant-isolation.util';
import { TenantId } from '../common/tenant/tenant.decorator';

interface TenantIsolationTestRequest {
  tenants: Array<{
    tenantId: string;
    expectedCounts: Record<string, number>;
  }>;
  options?: {
    includePerformanceTests?: boolean;
    includeCrossAccessTests?: boolean;
    testRLS?: boolean;
  };
}

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('v1/admin')
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantScopingMiddleware: TenantScopingMiddleware,
  ) {}

  @Get('tenant-stats')
  @ApiOperation({ summary: 'Get tenant statistics and context information' })
  @ApiResponse({ status: 200, description: 'Tenant statistics retrieved' })
  async getTenantStats(@TenantId() tenantId: string) {
    const stats = this.tenantScopingMiddleware.getTenantStats();
    
    // Get tenant-specific record counts
    const recordCounts = await this.getTenantRecordCounts(tenantId);
    
    return {
      tenantContext: stats,
      currentTenant: tenantId,
      recordCounts,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('tenant-isolation/status')
  @ApiOperation({ summary: 'Check tenant isolation configuration status' })
  @ApiResponse({ status: 200, description: 'Tenant isolation status retrieved' })
  async getTenantIsolationStatus() {
    try {
      // Check if RLS is enabled on critical tables
      const rlsStatus = await this.prisma.$queryRaw`
        SELECT 
          tablename,
          rowsecurity as rls_enabled
        FROM pg_tables t
        WHERE schemaname = 'public'
          AND tablename IN (
            'Client', 'Appointment', 'Service', 'Payment', 
            'Document', 'Course', 'Enrollment'
          )
        ORDER BY tablename;
      `;

      // Check tenant scoping middleware status
      const middlewareStats = this.tenantScopingMiddleware.getTenantStats();

      // Check index usage for performance
      const indexStats = await this.prisma.$queryRaw`
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_scan as index_scans,
          idx_tup_read as index_tuples_read,
          idx_tup_fetch as index_tuples_fetched
        FROM pg_stat_user_indexes 
        WHERE schemaname = 'public'
          AND indexname LIKE '%tenant%'
        ORDER BY idx_scan DESC
        LIMIT 10;
      `;

      return {
        rlsEnabled: rlsStatus,
        middlewareActive: !!middlewareStats,
        middlewareStats,
        indexUsage: indexStats,
        status: 'operational',
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      this.logger.error('Failed to get tenant isolation status:', error);
      throw new HttpException(
        'Failed to retrieve tenant isolation status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('tenant-isolation/test')
  @ApiOperation({ 
    summary: 'Run comprehensive tenant isolation tests',
    description: 'Test tenant isolation across multiple tenants and scenarios'
  })
  @ApiResponse({ status: 200, description: 'Tenant isolation tests completed' })
  @ApiResponse({ status: 400, description: 'Invalid test configuration' })
  async runTenantIsolationTests(@Body() request: TenantIsolationTestRequest) {
    if (!request.tenants || request.tenants.length === 0) {
      throw new HttpException(
        'At least one tenant must be specified for testing',
        HttpStatus.BAD_REQUEST,
      );
    }

    this.logger.log(`Running tenant isolation tests for ${request.tenants.length} tenants`);

    try {
      const tester = new TenantIsolationTester(
        this.prisma,
        this.tenantScopingMiddleware,
      );

      const testData: TenantTestData[] = request.tenants.map(tenant =>
        TenantIsolationTester.generateTestData(tenant.tenantId, tenant.expectedCounts)
      );

      const results = await tester.runIsolationTests(testData, {
        includePerformanceTests: request.options?.includePerformanceTests ?? true,
        includeCrossAccessTests: request.options?.includeCrossAccessTests ?? true,
        testRLS: request.options?.testRLS ?? false, // Disabled by default as it requires RLS setup
      });

      return {
        ...results,
        recommendation: this.generateRecommendations(results),
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      this.logger.error('Tenant isolation tests failed:', error);
      throw new HttpException(
        `Test execution failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('database/health')
  @ApiOperation({ summary: 'Check database health and connectivity' })
  @ApiResponse({ status: 200, description: 'Database health check completed' })
  async checkDatabaseHealth() {
    try {
      const startTime = Date.now();

      // Test basic connectivity
      await this.prisma.$queryRaw`SELECT 1 as health_check`;

      // Test tenant context functionality
      const tenantContext = this.tenantScopingMiddleware.getTenantContext();

      // Check connection pool status
      const connectionInfo = await this.prisma.$queryRaw`
        SELECT 
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections
        FROM pg_stat_activity 
        WHERE datname = current_database();
      `;

      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        responseTimeMs: responseTime,
        tenantContext: tenantContext ? {
          tenantId: tenantContext.tenantId,
          userId: tenantContext.userId,
        } : null,
        connectionInfo: (connectionInfo as any[])[0],
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      this.logger.error('Database health check failed:', error);
      throw new HttpException(
        'Database health check failed',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Get('performance/query-stats')
  @ApiOperation({ summary: 'Get database query performance statistics' })
  @ApiResponse({ status: 200, description: 'Query statistics retrieved' })
  async getQueryPerformanceStats(
    @Query('limit') limit: number = 10,
    @TenantId() tenantId: string,
  ) {
    try {
      // Get slow queries (requires pg_stat_statements extension)
      const slowQueries = await this.prisma.$queryRaw`
        SELECT 
          query,
          calls,
          total_time / 1000 as total_time_seconds,
          mean_time / 1000 as mean_time_seconds,
          rows,
          100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
        FROM pg_stat_statements
        WHERE query ILIKE '%tenantId%' OR query ILIKE '%tenant_id%'
        ORDER BY total_time DESC
        LIMIT ${limit};
      `;

      // Get table sizes for tenant-scoped tables
      const tableSizes = await this.prisma.$queryRaw`
        SELECT 
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
          pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
        FROM pg_tables 
        WHERE schemaname = 'public'
          AND tablename IN (
            'Client', 'Appointment', 'Service', 'Payment', 
            'Document', 'Course', 'Enrollment'
          )
        ORDER BY size_bytes DESC;
      `;

      return {
        currentTenant: tenantId,
        slowQueries,
        tableSizes,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      // pg_stat_statements might not be available, return basic info
      this.logger.warn('Could not retrieve detailed query stats (pg_stat_statements not available)');
      
      const basicStats = await this.getTenantRecordCounts(tenantId);
      
      return {
        currentTenant: tenantId,
        recordCounts: basicStats,
        note: 'Detailed query statistics require pg_stat_statements extension',
        timestamp: new Date().toISOString(),
      };
    }
  }

  private async getTenantRecordCounts(tenantId: string): Promise<Record<string, number>> {
    const counts = {};
    
    const models = [
      'appointment', 'client', 'service', 'location',
      'payment', 'document', 'course', 'enrollment', 'event'
    ];

    for (const model of models) {
      try {
        if ((this.prisma as any)[model]) {
          counts[model] = await (this.prisma as any)[model].count({
            where: { tenantId }
          });
        }
      } catch (error) {
        this.logger.warn(`Could not get count for ${model}:`, error.message);
        counts[model] = -1;
      }
    }

    return counts;
  }

  private generateRecommendations(results: any): string[] {
    const recommendations: string[] = [];

    if (results.violations.length > 0) {
      const criticalViolations = results.violations.filter(v => v.severity === 'CRITICAL');
      const highViolations = results.violations.filter(v => v.severity === 'HIGH');

      if (criticalViolations.length > 0) {
        recommendations.push('🚨 URGENT: Fix critical tenant isolation violations immediately');
        recommendations.push('Consider implementing Row-Level Security (RLS) policies');
        recommendations.push('Review Prisma middleware configuration');
      }

      if (highViolations.length > 0) {
        recommendations.push('⚠️ Address high-severity tenant isolation issues');
        recommendations.push('Verify tenant scoping in all database queries');
      }
    }

    if (results.performance.averageQueryTimeMs > 50) {
      recommendations.push('📈 Consider adding database indexes for tenant-scoped queries');
      recommendations.push('Review query performance and optimize slow operations');
    }

    if (results.violations.length === 0) {
      recommendations.push('✅ Tenant isolation is working correctly');
      recommendations.push('Consider implementing automated testing in CI/CD pipeline');
    }

    return recommendations;
  }
}
