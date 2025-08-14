import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

export type Slot = { start: Date; end: Date };

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  // Simple working hours 09:00-17:00 local (assume UTC for demo), 15-min step
  async getSlots(params: { tenantId: string; locationId: string; serviceId: string; from: Date; to: Date }): Promise<Slot[]> {
    const svc = await this.prisma.service.findUnique({ where: { id: params.serviceId } });
    if (!svc) return [];

    const duration = svc.durationMin; // minutes
    const buffers = (svc.buffers as any) || { beforeMin: 0, afterMin: 0 };
    const total = duration + (buffers.beforeMin || 0) + (buffers.afterMin || 0);
    const step = 15; // minutes

    const slots: Slot[] = [];
    // iterate days from -> to
    const cur = new Date(Date.UTC(params.from.getUTCFullYear(), params.from.getUTCMonth(), params.from.getUTCDate()));
    while (cur <= params.to) {
      // 09:00 -> 17:00 for demo
      const dayStart = new Date(Date.UTC(cur.getUTCFullYear(), cur.getUTCMonth(), cur.getUTCDate(), 9, 0, 0));
      const dayEnd = new Date(Date.UTC(cur.getUTCFullYear(), cur.getUTCMonth(), cur.getUTCDate(), 17, 0, 0));

      // start from max(dayStart, from)
      const start = new Date(Math.max(dayStart.getTime(), params.from.getTime()));
      const end = new Date(Math.min(dayEnd.getTime(), params.to.getTime()));

      // step through
      for (let t = start.getTime(); t + total * 60000 <= end.getTime(); t += step * 60000) {
        const s = new Date(t);
        const e = new Date(t + duration * 60000);
        slots.push({ start: s, end: e });
      }

      // next day
      cur.setUTCDate(cur.getUTCDate() + 1);
    }

    return slots;
  }
}
