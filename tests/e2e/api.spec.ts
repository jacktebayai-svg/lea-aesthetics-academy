import { test, expect, request } from '@playwright/test';

const TENANT = process.env.TEST_TENANT_ID || 'tn_demo';

test.describe('API smoke', () => {
  test('list services', async ({ request }) => {
    const res = await request.get('/v1/services');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('create appointment (pending_deposit)', async ({ request }) => {
    const payload = {
      clientId: 'client_demo_1',
      practitionerId: 'prac_demo',
      serviceId: 'svc_botox',
      locationId: 'loc_demo',
      startTs: new Date(Date.now() + 86400000).toISOString(),
      endTs: new Date(Date.now() + 86400000 + 30 * 60000).toISOString(),
    };
    const res = await request.post('/v1/appointments', { data: payload });
    expect(res.ok()).toBeTruthy();
    const appt = await res.json();
    expect(appt.status).toBe('PENDING_DEPOSIT');
  });
});
