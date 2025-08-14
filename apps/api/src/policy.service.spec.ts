import { PolicyService, PolicyConfig } from './policy.service';

describe('PolicyService', () => {
  it('applies cancellation fee inside window', () => {
    const s = new PolicyService();
    const cfg: PolicyConfig = {
      deposit: { type: 'percent', value: 25 },
      cancellation: { windowHours: 24, feePercent: 50 },
      noShow: { feePercent: 100 },
    };
    const now = new Date('2025-08-14T12:00:00Z');
    const apptStart = new Date('2025-08-14T20:00:00Z'); // 8h away
    const res = s.evaluate({ now, apptStart, servicePriceCents: 20000, action: 'cancel' }, cfg);
    expect(res.feeCents).toBe(10000);
  });
});
