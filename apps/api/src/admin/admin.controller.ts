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
// Tenant isolation testing disabled for single-tenant architecture

// Tenant isolation testing disabled for single-tenant architecture

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('v1/admin')
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  @Get('business-stats')
  @ApiOperation({ summary: 'Get business statistics and context information' })
  @ApiResponse({ status: 200, description: 'Business statistics retrieved' })
  async getBusinessStats() {
    // Get business record counts
    const recordCounts = await this.getBusinessRecordCounts();
    
    return {
      recordCounts,
      timestamp: new Date().toISOString(),
    };
  }

  // Tenant isolation status removed for single-tenant architecture

  // Tenant isolation testing removed for single-tenant architecture

  @Get('database/health')
  @ApiOperation({ summary: 'Check database health and connectivity' })
  @ApiResponse({ status: 200, description: 'Database health check completed' })
  async checkDatabaseHealth() {
    try {
      const startTime = Date.now();

      // Test basic connectivity
      await this.prisma.$queryRaw`SELECT 1 as health_check`;

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
  ) {
    try {
      // Get table sizes for business tables
      const tableSizes = await this.prisma.$queryRaw`
        SELECT 
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
          pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
        FROM pg_tables 
        WHERE schemaname = 'public'
          AND tablename IN (
            'clients', 'appointments', 'services', 'payments', 
            'documents', 'courses', 'enrollments'
          )
        ORDER BY size_bytes DESC;
      `;

      return {
        tableSizes,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      this.logger.warn('Could not retrieve detailed query stats');
      
      const basicStats = await this.getBusinessRecordCounts();
      
      return {
        recordCounts: basicStats,
        note: 'Detailed query statistics require pg_stat_statements extension',
        timestamp: new Date().toISOString(),
      };
    }
  }

  private async getBusinessRecordCounts(): Promise<Record<string, number>> {
    const counts = {};
    
    const models = [
      'appointment', 'client', 'service',
      'payment', 'document', 'course', 'enrollment'
    ];

    for (const model of models) {
      try {
        if ((this.prisma as any)[model]) {
          counts[model] = await (this.prisma as any)[model].count();
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
