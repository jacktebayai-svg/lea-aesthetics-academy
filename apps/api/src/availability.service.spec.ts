import { AvailabilityService } from './availability.service';

describe('AvailabilityService', () => {
  it('computes slots for 2 hours window with 30min service', async () => {
    const svc = new AvailabilityService({} as any);
    // monkey patch prisma call result
    (svc as any).prisma = {
      service: {
        findUnique: async () => ({
          durationMin: 30,
          buffers: { beforeMin: 0, afterMin: 0 },
        }),
      },
    };

    // pick a window during 09:00-11:00 UTC
    const base = new Date('2025-08-14T09:00:00.000Z');
    const from = base;
    const to = new Date(base.getTime() + 2 * 60 * 60 * 1000);
    const slots = await svc.getSlots({
      tenantId: 't',
      locationId: 'l',
      serviceId: 's',
      from,
      to,
    });
    expect(slots.length).toBeGreaterThan(0);
  });
});
