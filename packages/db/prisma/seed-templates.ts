import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTemplatesAndCourses() {
  try {
    console.log('🌱 Seeding templates and courses...');

    // Create sample templates
    const templates = await Promise.all([
      prisma.template.create({
        data: {
          name: 'Comprehensive Patient Consultation',
          type: 'consultation',
          jurisdiction: 'UK',
          version: '1.0.0',
          content: {
            blocks: [
              { type: 'text', content: 'Patient consultation form' },
              { type: 'field', placeholder: 'patient_name' },
              { type: 'field', placeholder: 'date' },
              { type: 'field', placeholder: 'practitioner_name' }
            ]
          },
          mandatoryBlocks: ['patient_name', 'date'],
          placeholders: ['patient_name', 'date', 'practitioner_name'],
          effectiveFrom: new Date(),
          isActive: true,
        },
      }),
      prisma.template.create({
        data: {
          name: 'Botox Treatment Consent',
          type: 'consent',
          jurisdiction: 'UK',
          version: '1.0.0',
          content: {
            blocks: [
              { type: 'text', content: 'Botox treatment consent form' },
              { type: 'field', placeholder: 'patient_name' },
              { type: 'field', placeholder: 'treatment_date' },
              { type: 'field', placeholder: 'risks' }
            ]
          },
          mandatoryBlocks: ['patient_name', 'treatment_date'],
          placeholders: ['patient_name', 'treatment_date', 'risks'],
          effectiveFrom: new Date(),
          isActive: true,
        },
      }),
      prisma.template.create({
        data: {
          name: 'Course Syllabus Template',
          type: 'lesson_plan',
          jurisdiction: 'UK',
          version: '1.0.0',
          content: {
            blocks: [
              { type: 'text', content: 'Course syllabus template' },
              { type: 'field', placeholder: 'course_title' },
              { type: 'field', placeholder: 'level' },
              { type: 'field', placeholder: 'duration' }
            ]
          },
          mandatoryBlocks: ['course_title', 'level'],
          placeholders: ['course_title', 'level', 'duration'],
          effectiveFrom: new Date(),
          isActive: true,
        },
      }),
      prisma.template.create({
        data: {
          name: 'Portfolio Assessment Rubric',
          type: 'rubric',
          jurisdiction: 'UK',
          version: '1.0.0',
          content: {
            blocks: [
              { type: 'text', content: 'Portfolio assessment rubric' },
              { type: 'field', placeholder: 'student_name' },
              { type: 'field', placeholder: 'submission_date' },
              { type: 'field', placeholder: 'assessor' }
            ]
          },
          mandatoryBlocks: ['student_name', 'submission_date'],
          placeholders: ['student_name', 'submission_date', 'assessor'],
          effectiveFrom: new Date(),
          isActive: true,
        },
      }),
    ]);

    // Create sample courses
    const courses = await Promise.all([
      prisma.course.create({
        data: {
          title: 'Level 4 Aesthetics Foundation',
          slug: 'level-4-aesthetics-foundation',
          description: 'Comprehensive foundation course in aesthetic treatments',
          level: 'Level 4',
          category: 'Foundation',
          duration: 120, // hours
          credits: 15,
          price: 250000, // £2500 in cents
          passingScore: 70,
          isPublished: true,
          isActive: true,
          displayOrder: 1,
          modules: {
            create: [
              {
                title: 'Introduction to Aesthetics',
                slug: 'introduction-to-aesthetics',
                description: 'Basic principles and history of aesthetic treatments',
                order: 1,
                duration: 15,
                isRequired: true,
              },
              {
                title: 'Anatomy and Physiology',
                slug: 'anatomy-and-physiology',
                description: 'Understanding facial anatomy for aesthetic treatments',
                order: 2,
                duration: 20,
                isRequired: true,
              },
            ],
          },
        },
      }),
      prisma.course.create({
        data: {
          title: 'Advanced Injectable Techniques',
          slug: 'advanced-injectable-techniques',
          description: 'Advanced course covering complex injection techniques',
          level: 'Level 6',
          category: 'Advanced',
          duration: 180, // hours
          credits: 20,
          price: 450000, // £4500 in cents
          passingScore: 75,
          isPublished: true,
          isActive: true,
          displayOrder: 2,
          modules: {
            create: [
              {
                title: 'Advanced Injection Techniques',
                slug: 'advanced-injection-techniques',
                description: 'Complex injection patterns and techniques',
                order: 1,
                duration: 25,
                isRequired: true,
              },
              {
                title: 'Complication Management',
                slug: 'complication-management',
                description: 'Managing and preventing complications',
                order: 2,
                duration: 30,
                isRequired: true,
              },
            ],
          },
        },
      }),
      prisma.course.create({
        data: {
          title: 'Medical Aesthetics Masterclass',
          slug: 'medical-aesthetics-masterclass',
          description: 'Comprehensive masterclass for medical aesthetic practitioners',
          level: 'Level 7',
          category: 'Masterclass',
          duration: 240, // hours
          credits: 30,
          price: 750000, // £7500 in cents
          passingScore: 80,
          isPublished: false, // draft
          isActive: true,
          displayOrder: 3,
          modules: {
            create: [
              {
                title: 'Advanced Facial Assessment',
                slug: 'advanced-facial-assessment',
                description: 'Comprehensive facial analysis techniques',
                order: 1,
                duration: 35,
                isRequired: true,
              },
              {
                title: 'Business Development',
                slug: 'business-development',
                description: 'Building a successful aesthetic practice',
                order: 2,
                duration: 40,
                isRequired: true,
              },
            ],
          },
        },
      }),
    ]);

    console.log(`✅ Created ${templates.length} templates`);
    console.log(`✅ Created ${courses.length} courses`);
    console.log('🎉 Seed completed successfully!');

    return { templates, courses };
  } catch (error) {
    console.error('❌ Error seeding templates and courses:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedTemplatesAndCourses()
  .then(() => {
    console.log('Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });

export default seedTemplatesAndCourses;
