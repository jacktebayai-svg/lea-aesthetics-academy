import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PaymentsModule } from './payments/payments.module';
import { TemplatesModule } from './templates/templates.module';
import { TenantsModule } from './tenants/tenants.module';
import { HealthController } from './health.controller';
import { AvailabilityController } from './availability.controller';
import { AppointmentsController } from './appointments.controller';
import { AvailabilityService } from './availability.service';
import { PolicyService } from './policy.service';
import { ServicesController } from './services.controller';
import { DocumentsController } from './documents.controller';
import { FilesController } from './files.controller';
import { StorageModule } from './storage/storage.module';
import { TenantInterceptor } from './common/tenant/tenant.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

@Module({
  imports: [
    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: Number(process.env.RATE_LIMIT_TTL ?? 60000), // ms
      limit: Number(process.env.RATE_LIMIT_LIMIT ?? 100),
    }]),
    
    // Core modules
    PrismaModule,
    AuthModule,
    UsersModule,
    PaymentsModule,
    TemplatesModule,
    TenantsModule,
    StorageModule,
  ],
  controllers: [
    AppController,
    HealthController,
    AvailabilityController,
    AppointmentsController,
    ServicesController,
    DocumentsController,
    FilesController,
  ],
  providers: [
    AppService,
    AvailabilityService,
    PolicyService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
