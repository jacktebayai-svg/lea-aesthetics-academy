import { Body, Controller, Post } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller('v1/appointments')
export class AppointmentsController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async create(@Body() body: any) {
    const { tenantId, clientId, practitionerId, serviceId, locationId, startTs, endTs } = body;
    const appt = await this.prisma.appointment.create({
      data: {
        tenantId, clientId, practitionerId, serviceId, locationId,
        startTs: new Date(startTs), endTs: new Date(endTs), status: 'PENDING_DEPOSIT', policyVersion: 1
      }
    });
    return appt;
  }
}

