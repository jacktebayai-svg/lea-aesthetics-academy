import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TemplatesModule } from './templates/templates.module';
import { TenantsModule } from './tenants/tenants.module';

@Module({
  imports: [PrismaModule, TemplatesModule, TenantsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
