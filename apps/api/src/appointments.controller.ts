import { Body, Controller, Post } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { PolicyService } from './policy.service';

@Controller('v1/appointments')
export class AppointmentsController {
  constructor(
    private prisma: PrismaService,
    private policy: PolicyService,
  ) {}

  @Post()
  async create(@Body() body: any) {
    const {
      tenantId,
      clientId,
      practitionerId,
      serviceId,
      locationId,
      startTs,
      endTs,
    } = body;

    const svc = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });
    const price = svc?.basePrice ?? 0;
    // record current policy version = 1, future: load tenant policy
    const appt = await this.prisma.appointment.create({
      data: {
        tenantId,
        clientId,
        practitionerId,
        serviceId,
        locationId,
        startTs: new Date(startTs),
        endTs: new Date(endTs),
        status: 'PENDING_DEPOSIT',
        policyVersion: 1,
      },
    });

    // enqueue notification stub via DB event (future: BullMQ)
    await this.prisma.event.create({
      data: {
        tenantId,
        actorId: clientId,
        type: 'BookingCreated',
        payload: { appointmentId: appt.id, serviceId, price },
        occurredAt: new Date(),
      },
    });

    return appt;
  }
}
