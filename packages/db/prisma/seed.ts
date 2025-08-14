import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
// import { generateCourseSeedData } from "../../../apps/api/src/utils/course-parser";
// import type { SeedData } from "../../../apps/api/src/types/course-seeding.types";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed process...");

  // Tenant
  const tenant = await prisma.tenant.upsert({
    where: { id: "tn_demo" },
    update: {},
    create: { 
      id: "tn_demo", 
      name: "Lea's Aesthetics Clinical Academy", 
      plan: "professional" 
    },
  });
  console.log("✅ Tenant created");

  // Location
  const locationId = "loc_demo";
  await prisma.location.upsert({
    where: { id: locationId },
    update: {},
    create: {
      id: locationId,
      tenantId: tenant.id,
      timezone: "Europe/London",
      address: {
        line1: "123 Harley Street",
        line2: "Medical District",
        city: "London",
        postalCode: "W1G 6BA",
        country: "United Kingdom"
      },
      settings: {
        openingHours: {
          monday: { open: "09:00", close: "18:00" },
          tuesday: { open: "09:00", close: "18:00" },
          wednesday: { open: "09:00", close: "18:00" },
          thursday: { open: "09:00", close: "18:00" },
          friday: { open: "09:00", close: "17:00" },
          saturday: { open: "10:00", close: "16:00" },
          sunday: { closed: true }
        }
      },
    },
  });
  console.log("✅ Location created");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@leas-academy.com" },
    update: {},
    create: {
      id: "user_admin",
      email: "admin@leas-academy.com",
      password: hashedPassword,
      firstName: "Lea",
      lastName: "Administrator",
      phone: "+44 20 1234 5678",
      isActive: true,
      emailVerified: true,
    },
  });

  // Assign OWNER role to admin user
  await prisma.userRole.upsert({
    where: { id: "role_admin_owner" },
    update: {},
    create: {
      id: "role_admin_owner",
      userId: adminUser.id,
      tenantId: tenant.id,
      role: "OWNER",
    },
  });

  // Create practitioner user
  const practitionerUser = await prisma.user.upsert({
    where: { email: "practitioner@leas-academy.com" },
    update: {},
    create: {
      id: "user_practitioner",
      email: "practitioner@leas-academy.com",
      password: hashedPassword,
      firstName: "Dr. Sarah",
      lastName: "Johnson",
      phone: "+44 20 1234 5679",
      isActive: true,
      emailVerified: true,
    },
  });

  await prisma.userRole.upsert({
    where: { id: "role_practitioner" },
    update: {},
    create: {
      id: "role_practitioner",
      userId: practitionerUser.id,
      tenantId: tenant.id,
      role: "PRACTITIONER",
      locationId: locationId,
    },
  });

  // Create practitioner profile
  await prisma.practitioner.upsert({
    where: { id: "prac_demo" },
    update: {},
    create: {
      id: "prac_demo",
      tenantId: tenant.id,
      userId: practitionerUser.id,
      specialties: ["Botox", "Dermal Fillers", "Chemical Peels", "Microneedling"],
      availability: {
        weekly: {
          monday: [{ start: "09:00", end: "17:00" }],
          tuesday: [{ start: "09:00", end: "17:00" }],
          wednesday: [{ start: "09:00", end: "17:00" }],
          thursday: [{ start: "09:00", end: "17:00" }],
          friday: [{ start: "09:00", end: "16:00" }],
          saturday: [{ start: "10:00", end: "15:00" }],
        },
        exceptions: []
      },
      profile: {
        qualifications: ["GMC Registered", "Aesthetic Medicine Diploma"],
        experience: "8 years in aesthetic medicine",
        bio: "Dr. Sarah Johnson is a highly experienced aesthetic practitioner specializing in non-surgical facial rejuvenation."
      },
    },
  });
  console.log("✅ Users and roles created");

  // Services
  const services = [
    {
      id: "svc_botox",
      name: "Botox Treatment",
      slug: "botox",
      basePrice: 25000, // £250
      durationMin: 30,
      category: "injectables",
      description: "Anti-wrinkle injections to reduce fine lines and wrinkles",
      buffers: { beforeMin: 10, afterMin: 15 },
    },
    {
      id: "svc_fillers",
      name: "Dermal Fillers",
      slug: "dermal-fillers",
      basePrice: 45000, // £450
      durationMin: 45,
      category: "injectables",
      description: "Hyaluronic acid fillers to restore volume and smooth lines",
      buffers: { beforeMin: 15, afterMin: 20 },
    },
    {
      id: "svc_chemical_peel",
      name: "Chemical Peel",
      slug: "chemical-peel",
      basePrice: 15000, // £150
      durationMin: 60,
      category: "skin-treatments",
      description: "Professional chemical peel for skin rejuvenation",
      buffers: { beforeMin: 10, afterMin: 30 },
    },
    {
      id: "svc_microneedling",
      name: "Microneedling",
      slug: "microneedling",
      basePrice: 20000, // £200
      durationMin: 75,
      category: "skin-treatments",
      description: "Collagen induction therapy for improved skin texture",
      buffers: { beforeMin: 15, afterMin: 30 },
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.id },
      update: {},
      create: {
        ...service,
        tenantId: tenant.id,
      },
    });
  }
  console.log("✅ Services created");

  // Sample clients
  const clients = [
    {
      id: "client_demo_1",
      personal: {
        email: "sarah.wilson@email.com",
        firstName: "Sarah",
        lastName: "Wilson",
        phone: "+44 7700 900123",
        dateOfBirth: "1985-06-15",
        address: {
          line1: "45 Baker Street",
          city: "London",
          postalCode: "W1U 7DT",
          country: "United Kingdom"
        }
      },
      preferences: {
        communicationPreferences: ["email", "sms"],
        appointmentReminders: true,
        marketingConsent: true
      },
      tags: ["vip", "regular-client"]
    },
    {
      id: "client_demo_2",
      personal: {
        email: "james.brown@email.com",
        firstName: "James",
        lastName: "Brown",
        phone: "+44 7700 900124",
        dateOfBirth: "1978-03-22"
      },
      preferences: {
        communicationPreferences: ["email"],
        appointmentReminders: true,
        marketingConsent: false
      },
      tags: ["new-client"]
    }
  ];

  for (const client of clients) {
    await prisma.client.upsert({
      where: { id: client.id },
      update: {},
      create: {
        ...client,
        tenantId: tenant.id,
      },
    });
  }
  console.log("✅ Sample clients created");

  // Document templates
  await prisma.template.upsert({
    where: { id: "tmpl_consent_botox" },
    update: {},
    create: {
      id: "tmpl_consent_botox",
      tenantId: tenant.id,
      type: "consent",
      jurisdiction: "UK",
      version: "2024.01",
      content: {
        title: "Botox Treatment Consent Form",
        sections: [
          {
            id: "patient-info",
            title: "Patient Information",
            required: true,
            fields: [
              "CLIENT_NAME",
              "DATE_OF_BIRTH",
              "TREATMENT_DATE"
            ]
          },
          {
            id: "consent",
            title: "Treatment Consent",
            required: true,
            text: "I consent to the Botox treatment as discussed with my practitioner."
          }
        ]
      },
      mandatoryBlocks: ["patient-info", "consent"],
      effectiveFrom: new Date(),
    },
  });
  console.log("✅ Document templates created");

  // Generate and seed course data from FondationAesthetics folder
  console.log("📚 Learning management system seeding (will be implemented later)...");
  console.log("✅ LMS setup deferred to separate implementation");

  console.log("🎉 Seed process completed successfully!");
  console.log("");
  console.log("📋 Demo Account Details:");
  console.log("   Admin: admin@leas-academy.com / admin123");
  console.log("   Practitioner: practitioner@leas-academy.com / admin123");
  console.log("");
  console.log("🔗 Access:");
  console.log("   API: http://localhost:3333");
  console.log("   Docs: http://localhost:3333/api/docs");
  console.log("   Web: http://localhost:3000");
  console.log("   Admin: http://localhost:3001");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    (globalThis as any)?.process?.exit?.(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
