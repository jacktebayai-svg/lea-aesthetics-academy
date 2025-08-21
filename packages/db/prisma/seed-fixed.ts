import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed process...");

  // Tenant creation (instead of businessProfile)
  const tenant = await prisma.tenant.upsert({
    where: { slug: "leas-aesthetics-academy" },
    update: {},
    create: {
      id: "tenant_leas_academy",
      name: "Lea's Aesthetics Clinical Academy",
      slug: "leas-aesthetics-academy",
      plan: "professional",
      status: "active",
      domain: "leas-academy.com",
      subdomain: "app",
      settings: {
        businessHours: {
          monday: { open: "09:00", close: "18:00" },
          tuesday: { open: "09:00", close: "18:00" },
          wednesday: { open: "09:00", close: "18:00" },
          thursday: { open: "09:00", close: "18:00" },
          friday: { open: "09:00", close: "17:00" },
          saturday: { open: "10:00", close: "16:00" },
          sunday: { closed: true }
        },
        theme: {
          primaryColor: "#C5A880",
          secondaryColor: "#1A1A1A",
          fontFamily: "Inter, sans-serif"
        },
        contactInfo: {
          phone: "+44 20 1234 5678",
          email: "info@leas-academy.com",
          website: "https://leas-academy.com"
        }
      }
    },
  });
  console.log("✅ Tenant created:", tenant.name);

  // Create location for tenant
  const location = await prisma.location.upsert({
    where: { id: "loc_main_clinic" },
    update: {},
    create: {
      id: "loc_main_clinic",
      tenantId: tenant.id,
      name: "Main Clinic",
      address: {
        line1: "123 Harley Street",
        line2: "Medical District",
        city: "London",
        postalCode: "W1G 6BA",
        country: "United Kingdom"
      },
      phone: "+44 20 1234 5678",
      email: "clinic@leas-academy.com",
      isActive: true,
      amenities: ["parking", "wheelchair-access", "wifi"]
    }
  });
  console.log("✅ Location created:", location.name);

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

  // Add user role for the tenant
  await prisma.userRole.upsert({
    where: { 
      userId_tenantId: {
        userId: adminUser.id,
        tenantId: tenant.id
      }
    },
    update: {
      role: "ADMIN"
    },
    create: {
      userId: adminUser.id,
      tenantId: tenant.id,
      role: "ADMIN"
    }
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

  // Add practitioner role for the tenant
  await prisma.userRole.upsert({
    where: { 
      userId_tenantId: {
        userId: practitionerUser.id,
        tenantId: tenant.id
      }
    },
    update: {
      role: "ADMIN"
    },
    create: {
      userId: practitionerUser.id,
      tenantId: tenant.id,
      role: "ADMIN"
    }
  });

  // Create practitioner profile
  await prisma.practitioner.upsert({
    where: { userId_tenantId: { userId: practitionerUser.id, tenantId: tenant.id } },
    update: {},
    create: {
      userId: practitionerUser.id,
      tenantId: tenant.id,
      title: "Dr.",
      bio: "Dr. Sarah Johnson is a highly experienced aesthetic practitioner specializing in non-surgical facial rejuvenation.",
      specialties: ["Botox", "Dermal Fillers", "Chemical Peels", "Microneedling"],
      qualifications: {
        degrees: ["MBBS", "MSc Aesthetic Medicine"],
        certifications: ["GMC Registered", "Aesthetic Medicine Diploma"]
      },
      registrationNum: "GMC123456",
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
        experience: "8 years in aesthetic medicine",
        specialInterests: ["Non-surgical facial rejuvenation", "Anti-aging treatments"]
      },
      locationId: location.id
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
        isActive: true,
        isBookable: true,
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

  // First create user accounts for clients
  for (const client of clients) {
    // Create user first
    const clientUser = await prisma.user.upsert({
      where: { email: client.personal.email },
      update: {},
      create: {
        email: client.personal.email,
        firstName: client.personal.firstName,
        lastName: client.personal.lastName,
        phone: client.personal.phone,
        password: await bcrypt.hash("client123", 10), // Sample password
        isActive: true,
        emailVerified: true,
      },
    });
    
    // Add client role for the tenant
    await prisma.userRole.upsert({
      where: { 
        userId_tenantId: {
          userId: clientUser.id,
          tenantId: tenant.id
        }
      },
      update: {
        role: "CLIENT"
      },
      create: {
        userId: clientUser.id,
        tenantId: tenant.id,
        role: "CLIENT"
      }
    });
    
    // Then create client profile
    await prisma.client.upsert({
      where: { userId_tenantId: { userId: clientUser.id, tenantId: tenant.id } },
      update: {},
      create: {
        userId: clientUser.id,
        tenantId: tenant.id,
        firstName: client.personal.firstName,
        lastName: client.personal.lastName,
        email: client.personal.email,
        phone: client.personal.phone,
        dateOfBirth: client.personal.dateOfBirth ? new Date(client.personal.dateOfBirth) : undefined,
        address: client.personal.address || null,
        preferences: client.preferences || null,
        tags: client.tags || [],
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
      name: "Botox Treatment Consent Form",
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
      placeholders: ["CLIENT_NAME", "DATE_OF_BIRTH", "TREATMENT_DATE"],
      effectiveFrom: new Date(),
    },
  });
  console.log("✅ Document templates created");

  // Try to load course data if it exists
  console.log("📚 Learning management system seeding...");
  try {
    const coursesFilePath = path.join(__dirname, 'seed-data/courses.json');
    if (fs.existsSync(coursesFilePath)) {
      const courseData = JSON.parse(fs.readFileSync(coursesFilePath, 'utf-8'));
      
      console.log(`Found ${courseData.length} courses to seed.`);
      
      for (const course of courseData) {
        // Create the course
        const createdCourse = await prisma.course.upsert({
          where: { slug_tenantId: { slug: course.slug, tenantId: tenant.id } },
          update: {
            title: course.title,
            description: course.description,
            level: course.level,
            category: course.category,
            subcategory: course.subcategory,
            duration: course.duration,
            credits: course.credits,
            price: course.price,
            content: course.content,
            tags: course.tags || [],
            prerequisites: course.prerequisites || [],
            isPublished: course.isPublished,
            isActive: course.isActive,
            passingScore: course.passingScore,
            accreditation: course.accreditation
          },
          create: {
            tenantId: tenant.id,
            title: course.title,
            slug: course.slug,
            description: course.description,
            level: course.level,
            category: course.category,
            subcategory: course.subcategory,
            duration: course.duration,
            credits: course.credits,
            price: course.price,
            content: course.content,
            tags: course.tags || [],
            prerequisites: course.prerequisites || [],
            isPublished: course.isPublished,
            isActive: course.isActive,
            passingScore: course.passingScore,
            accreditation: course.accreditation,
          }
        });
        
        // Course modules, lessons, and assessments would go here
        // Omitted for simplicity
        
        console.log(`✅ Seeded course: ${course.title}`);
      }
    } else {
      console.log("⚠️ Course data file not found. Skipping course seeding.");
    }
  } catch (error) {
    console.error("❌ Error seeding courses:", error);
    console.log("✅ Continuing with remaining seed operations...");
  }

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
