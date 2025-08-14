import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller('v1/availability')
export class AvailabilityController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async get(@Query('tenant_id') tenantId: string,
            @Query('location_id') locationId: string,
            @Query('service_id') serviceId: string,
            @Query('from') from: string,
            @Query('to') to: string) {
    // For now, return hourly slots between from and to as a stub
    const start = new Date(from);
    const end = new Date(to);
    const slots: { start: string; end: string }[] = [];
    const d = new Date(start);
    while (d < end) {
      const s = new Date(d);
      const e = new Date(d);
      e.setMinutes(e.getMinutes() + 60);
      slots.push({ start: s.toISOString(), end: e.toISOString() });
      d.setMinutes(d.getMinutes() + 60);
    }
    return { tenantId, locationId, serviceId, slots };
  }
}

