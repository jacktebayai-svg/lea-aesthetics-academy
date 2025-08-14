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

@Module({
  imports: [PrismaModule, TemplatesModule, TenantsModule],
  controllers: [AppController, HealthController, AvailabilityController, AppointmentsController],
  providers: [AppService, AvailabilityService],
})
export class AppModule {}
