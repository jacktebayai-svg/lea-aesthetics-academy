import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TemplatesModule } from './templates/templates.module';
import { TenantsModule } from './tenants/tenants.module';
import { HealthController } from './health.controller';
import { AvailabilityController } from './availability.controller';
import { AppointmentsController } from './appointments.controller';
import { AvailabilityService } from './availability.service';
import { PolicyService } from './policy.service';
import { ServicesController } from './services.controller';

@Module({
  imports: [PrismaModule, TemplatesModule, TenantsModule],
  controllers: [AppController, HealthController, AvailabilityController, AppointmentsController, ServicesController],
  providers: [AppService, AvailabilityService, PolicyService],
})
export class AppModule {}
