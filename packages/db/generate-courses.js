const mammoth = require('mammoth');
const fs = require('fs').promises;
const path = require('path');

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function determineCourseLevel(fileName) {
  if (fileName.includes('Level 2')) return 'Level 2';
  if (fileName.includes('Level 3')) return 'Level 3';
  if (fileName.includes('Level 4')) return 'Level 4';
  return 'Foundation';
}

function determineCourseCategory(fileName) {
  const fileNameLower = fileName.toLowerCase();
  
  if (fileNameLower.includes('a&p') || fileNameLower.includes('anatomy')) {
    return 'Anatomy & Physiology';
  }
  if (fileNameLower.includes('cpr') || fileNameLower.includes('anaphylaxis')) {
    return 'Emergency Medicine';
  }
  if (fileNameLower.includes('safety')) {
    return 'Safety & Compliance';
  }
  if (fileNameLower.includes('dermal') || fileNameLower.includes('botulinum') || fileNameLower.includes('toxin')) {
    return 'Advanced Treatments';
  }
  
  return 'Foundation Studies';
}

function extractTags(fileName) {
  const tags = [];
  
  // Add level tags
  if (fileName.includes('Level 2')) tags.push('level-2', 'foundation');
  if (fileName.includes('Level 3')) tags.push('level-3', 'intermediate');
  if (fileName.includes('Level 4')) tags.push('level-4', 'advanced');
  
  // Add subject tags
  if (fileName.toLowerCase().includes('anatomy')) tags.push('anatomy', 'physiology');
  if (fileName.toLowerCase().includes('cpr')) tags.push('cpr', 'emergency', 'first-aid');
  if (fileName.toLowerCase().includes('safety')) tags.push('safety', 'compliance', 'regulations');
  if (fileName.toLowerCase().includes('dermal')) tags.push('dermal-fillers', 'injectables');
  if (fileName.toLowerCase().includes('botulinum')) tags.push('botox', 'botulinum-toxin', 'injectables');
  
  return [...new Set(tags)]; // Remove duplicates
}

function determinePrerequisites(level, category) {
  const prerequisites = [];
  
  if (level === 'Level 3') {
    prerequisites.push('anatomy-physiology-level-2');
  }
  if (level === 'Level 4') {
    prerequisites.push('anatomy-physiology-level-3');
  }
  
  if (category === 'Advanced Treatments') {
    prerequisites.push('safety-in-medicine', 'cpr-and-anaphylaxis');
  }
  
  return prerequisites;
}

function calculateCredits(level, duration) {
  let baseCredits = Math.ceil(duration / 10) * 5; // 5 credits per 10 hours
  
  // Adjust based on level
  if (level === 'Level 3') baseCredits *= 1.2;
  if (level === 'Level 4') baseCredits *= 1.5;
  
  return Math.round(baseCredits);
}

function extractDescription(text) {
  // Extract first 300 characters as description
  const cleanText = text.replace(/\s+/g, ' ').trim();
  return cleanText.substring(0, 300) + (cleanText.length > 300 ? '...' : '');
}

function createModule(title, content, order) {
  return {
    title: title,
    slug: slugify(title),
    description: extractDescription(content),
    content: {
      text: content.substring(0, 5000), // Limit content size
      format: 'text'
    },
    order: order,
    duration: Math.max(30, Math.ceil(content.split(/\s+/).length / 200)), // Reading time in minutes
    isRequired: true,
    lessons: [
      {
        title: `${title} - Introduction`,
        slug: slugify(`${title}-introduction`),
        content: {
          text: content.substring(0, 2000),
          format: 'text'
        },
        type: 'text',
        order: 0,
        duration: 15,
        isRequired: true
      }
    ],
    assessments: [
      {
        title: `${title} Quiz`,
        description: `Assessment for ${title}`,
        type: 'quiz',
        questions: {
          questions: [
            {
              id: '1',
              type: 'multiple-choice',
              question: `What is a key concept from ${title}?`,
              options: ['Option A', 'Option B', 'Option C', 'Option D'],
              correctAnswer: 0,
              points: 10
            }
          ]
        },
        passingScore: 70,
        timeLimit: 30,
        maxAttempts: 3,
        isRequired: true,
        order: 0
      }
    ]
  };
}

async function parseDocxFile(filePath) {
  try {
    const buffer = await fs.readFile(filePath);
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;
    const fileName = path.basename(filePath, '.docx');
    
    // Extract course title from filename
    const title = fileName
      .replace(/^\d+\.\s*/, '') // Remove leading numbers
      .trim();
    
    const level = determineCourseLevel(fileName);
    const category = determineCourseCategory(fileName);
    const tags = extractTags(fileName);
    const prerequisites = determinePrerequisites(level, category);
    
    // Create basic module structure
    // Split content into chunks for modules (simple approach)
    const contentChunks = text.split(/\n\n+/);
    const modules = [];
    
    // Create modules from content chunks
    let chunkIndex = 0;
    let moduleCount = 0;
    while (chunkIndex < contentChunks.length && moduleCount < 5) {
      const moduleContent = contentChunks.slice(chunkIndex, chunkIndex + 3).join('\n\n');
      if (moduleContent.trim().length > 100) {
        modules.push(createModule(
          `Module ${moduleCount + 1}`,
          moduleContent,
          moduleCount
        ));
        moduleCount++;
      }
      chunkIndex += 3;
    }
    
    // If no modules created, create at least one
    if (modules.length === 0) {
      modules.push(createModule('Core Content', text, 0));
    }
    
    // Calculate total duration
    const totalDuration = modules.reduce((sum, mod) => sum + mod.duration, 0);
    const durationHours = Math.ceil(totalDuration / 60);
    
    const course = {
      title,
      slug: slugify(title),
      description: extractDescription(text),
      level,
      category,
      subcategory: null,
      prerequisites,
      duration: durationHours,
      credits: calculateCredits(level, durationHours),
      price: level === 'Foundation' ? 29900 : level === 'Level 2' ? 49900 : level === 'Level 3' ? 79900 : 99900, // Price in cents
      content: {
        overview: text.substring(0, 1000),
        objectives: [
          'Understand the fundamental concepts',
          'Apply theoretical knowledge to practice',
          'Demonstrate competency in key areas',
          'Meet professional standards',
          'Complete assessments successfully'
        ],
        outline: modules.map(m => m.title)
      },
      modules,
      tags,
      accreditation: {
        body: 'LACA',
        level: level,
        credits: calculateCredits(level, durationHours)
      },
      passingScore: 70,
      isPublished: true,
      isActive: true
    };
    
    return course;
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    throw error;
  }
}

async function parseAllCourses(directoryPath) {
  const courses = [];
  
  try {
    const files = await fs.readdir(directoryPath);
    const docxFiles = files.filter(file => file.endsWith('.docx'));
    
    for (const file of docxFiles) {
      const filePath = path.join(directoryPath, file);
      console.log(`Parsing ${file}...`);
      
      try {
        const course = await parseDocxFile(filePath);
        courses.push(course);
        console.log(`✅ Successfully parsed: ${course.title}`);
      } catch (error) {
        console.error(`❌ Failed to parse ${file}:`, error);
      }
    }
    
    return courses;
  } catch (error) {
    console.error('Error reading directory:', error);
    throw error;
  }
}

async function main() {
  const documentsPath = path.join(__dirname, '../../FondationAesthetics');
  const outputPath = path.join(__dirname, 'prisma/seed-data/courses.json');
  
  console.log('📂 Reading courses from:', documentsPath);
  console.log('📝 Output will be saved to:', outputPath);
  
  try {
    // Parse all course documents
    const courses = await parseAllCourses(documentsPath);
    
    if (courses.length === 0) {
      console.error('❌ No courses were parsed');
      return;
    }
    
    console.log(`\n✅ Successfully parsed ${courses.length} courses`);
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });
    
    // Save parsed courses to JSON file
    await fs.writeFile(
      outputPath,
      JSON.stringify(courses, null, 2),
      'utf-8'
    );
    
    console.log('💾 Course seed data saved to:', outputPath);
    
    // Print summary
    console.log('\n📊 Course Summary:');
    courses.forEach(course => {
      console.log(`\n  📚 ${course.title}`);
      console.log(`     Level: ${course.level}`);
      console.log(`     Category: ${course.category}`);
      console.log(`     Modules: ${course.modules.length}`);
      console.log(`     Duration: ${course.duration} hours`);
      console.log(`     Credits: ${course.credits}`);
      console.log(`     Price: £${(course.price / 100).toFixed(2)}`);
      console.log(`     Tags: ${course.tags.join(', ')}`);
    });
    
  } catch (error) {
    console.error('❌ Error generating course seed data:', error);
    process.exit(1);
  }
}

// Run the script
main();
