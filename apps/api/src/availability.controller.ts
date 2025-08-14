import { Controller, Get, Query } from '@nestjs/common';
import { AvailabilityService } from './availability.service';

@Controller('v1/availability')
export class AvailabilityController {
  constructor(private availability: AvailabilityService) {}

  @Get()
  async get(@Query('tenant_id') tenantId: string,
            @Query('location_id') locationId: string,
            @Query('service_id') serviceId: string,
            @Query('from') from: string,
            @Query('to') to: string) {
    const slots = await this.availability.getSlots({
      tenantId,
      locationId,
      serviceId,
      from: new Date(from),
      to: new Date(to)
    });
    return { tenantId, locationId, serviceId, slots: slots.map(s => ({ start: s.start.toISOString(), end: s.end.toISOString() })) };
  }
}

