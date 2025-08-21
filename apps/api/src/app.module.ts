import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PaymentsModule } from './payments/payments.module';
import { TemplatesModule } from './templates/templates.module';
import { HealthController } from './health.controller';
import { AvailabilityController } from './availability.controller';
import { AppointmentsController } from './appointments.controller';
import { AvailabilityService } from './availability.service';
import { PolicyService } from './policy.service';
import { ServicesController } from './services.controller';
import { DocumentsController } from './documents.controller';
import { FilesController } from './files.controller';
import { AdminController } from './admin/admin.controller';
import { StorageModule } from './storage/storage.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

@Module({
  imports: [
    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: Number(process.env.RATE_LIMIT_TTL ?? 60000), // ms
      limit: Number(process.env.RATE_LIMIT_LIMIT ?? 100),
    }]),
    
    // Core modules
    CommonModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    PaymentsModule,
    TemplatesModule,
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
    AdminController,
  ],
  providers: [
    AppService,
    AvailabilityService,
    PolicyService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // JWT Authentication guard
    {
      provide: APP_GUARD,
      useClass: (require('./auth/jwt-auth.guard').JwtAuthGuard),
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
