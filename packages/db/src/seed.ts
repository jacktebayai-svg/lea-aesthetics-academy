import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Tenant
  const tenant = await prisma.tenant.upsert({
    where: { id: 'tn_demo' },
    update: {},
    create: { id: 'tn_demo', name: 'Demo Clinic', plan: 'starter' }
  });

  // Location
  const locationId = 'loc_demo';
  await prisma.location.upsert({
    where: { id: locationId },
    update: {},
    create: { id: locationId, tenantId: tenant.id, timezone: 'Europe/London', address: { line1: '1 Demo St' }, settings: {} }
  });

  // Service
  const serviceId = 'svc_botox';
  await prisma.service.upsert({
    where: { id: serviceId },
    update: {},
    create: { id: serviceId, tenantId: tenant.id, name: 'Botox', slug: 'botox', basePrice: 12000, durationMin: 30, category: 'injectables', buffers: { beforeMin: 5, afterMin: 10 } }
  });

  console.log('Seed complete');
}

main()
  .catch((e) => { console.error(e); (globalThis as any)?.process?.exit?.(1); })
  .finally(async () => { await prisma.$disconnect(); });

