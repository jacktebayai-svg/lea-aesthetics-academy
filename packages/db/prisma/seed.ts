import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
// import { generateCourseSeedData } from "../../../apps/api/src/utils/course-parser";
// import type { SeedData } from "../../../apps/api/src/types/course-seeding.types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed process...");

  // Business Profile (replaces tenant/location in single-tenant architecture)
  const businessProfile = await prisma.businessProfile.upsert({
    where: { slug: "leas-aesthetics-academy" },
    update: {},
    create: {
      name: "Lea's Aesthetics Clinical Academy",
      slug: "leas-aesthetics-academy",
      type: "clinic",
      timezone: "Europe/London",
      address: {
        line1: "123 Harley Street",
        line2: "Medical District",
        city: "London",
        postalCode: "W1G 6BA",
        country: "United Kingdom"
      },
      phone: "+44 20 1234 5678",
      email: "info@leas-academy.com",
      website: "https://leas-academy.com",
      businessHours: {
        monday: { open: "09:00", close: "18:00" },
        tuesday: { open: "09:00", close: "18:00" },
        wednesday: { open: "09:00", close: "18:00" },
        thursday: { open: "09:00", close: "18:00" },
        friday: { open: "09:00", close: "17:00" },
        saturday: { open: "10:00", close: "16:00" },
        sunday: { closed: true }
      },
      settings: {},
      amenities: ["parking", "wheelchair-access", "wifi"]
    },
  });
  console.log("✅ Business profile created");

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
      role: "ADMIN",
      isActive: true,
      emailVerified: true,
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
      role: "ADMIN", // Can be both admin and practitioner
      isActive: true,
      emailVerified: true,
    },
  });

  // Create practitioner profile
  await prisma.practitioner.upsert({
    where: { userId: practitionerUser.id },
    update: {},
    create: {
      userId: practitionerUser.id,
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
        role: "CLIENT",
        isActive: true,
        emailVerified: true,
      },
    });
    
    // Then create client profile
    await prisma.client.upsert({
      where: { userId: clientUser.id },
      update: {},
      create: {
        userId: clientUser.id,
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

  // Import and seed course data from generated courses.json
  console.log("📚 Learning management system seeding...");
  try {
    const coursesFilePath = path.join(__dirname, 'seed-data/courses.json');
    const courseData = JSON.parse(fs.readFileSync(coursesFilePath, 'utf-8'));
    
    console.log(`Found ${courseData.length} courses to seed.`);
    
    for (const course of courseData) {
      // Create the course
      const createdCourse = await prisma.course.upsert({
        where: { slug: course.slug },
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
      
      // Course tags and prerequisites are now handled directly in the course creation
      
      // Create modules for the course
      if (course.modules && course.modules.length > 0) {
        for (const moduleData of course.modules) {
          const createdModule = await prisma.module.create({
            data: {
              title: moduleData.title,
              slug: moduleData.slug,
              description: moduleData.description,
              content: moduleData.content,
              order: moduleData.order,
              duration: moduleData.duration,
              isRequired: moduleData.isRequired,
              course: {
                connect: { id: createdCourse.id }
              }
            }
          });
          
          // Create lessons for this module
          if (moduleData.lessons && moduleData.lessons.length > 0) {
            for (const lessonData of moduleData.lessons) {
              await prisma.lesson.create({
                data: {
                  title: lessonData.title,
                  slug: lessonData.slug,
                  content: lessonData.content,
                  type: lessonData.type,
                  order: lessonData.order,
                  duration: lessonData.duration,
                  isRequired: lessonData.isRequired,
                  module: {
                    connect: { id: createdModule.id }
                  }
                }
              });
            }
          }
          
          // Create assessments for this module
          if (moduleData.assessments && moduleData.assessments.length > 0) {
            for (const assessmentData of moduleData.assessments) {
              await prisma.assessment.create({
                data: {
                  title: assessmentData.title,
                  description: assessmentData.description,
                  type: assessmentData.type,
                  questions: assessmentData.questions,
                  passingScore: assessmentData.passingScore,
                  timeLimit: assessmentData.timeLimit,
                  maxAttempts: assessmentData.maxAttempts,
                  isRequired: assessmentData.isRequired,
                  order: assessmentData.order,
                  module: {
                    connect: { id: createdModule.id }
                  }
                }
              });
            }
          }
        }
      }
      
      console.log(`✅ Seeded course: ${course.title}`);
    }
    
    console.log("✅ All courses successfully seeded");
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
