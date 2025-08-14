import { PrismaClient } from '@prisma/client';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  // Seed Templates
  const template1 = await prisma.template.upsert({
    where: { name: 'Client Consultation Form' },
    update: {},
    create: {
      name: 'Client Consultation Form',
      description: 'Form for client consultations for Botox and Dermal Filler treatments.',
      type: 'Consultation Form',
      filePath: path.join(__dirname, '../36e49c4d-5236-45a0-ba04-9e0c1aedd38c.pdf'),
    },
  });

  const template2 = await prisma.template.upsert({
    where: { name: 'Certificate of Completion' },
    update: {},
    create: {
      name: 'Certificate of Completion',
      description: 'Certificate for Advanced Level 6 Diploma in Botox, Dermal Fillers, and Complication Management.',
      type: 'Certificate',
      filePath: path.join(__dirname, '../ee503724-8cca-4acd-b8b1-d754c380f179.pdf'),
    },
  });

  console.log({ template1, template2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
