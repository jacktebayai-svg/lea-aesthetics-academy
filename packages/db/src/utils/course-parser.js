import * as mammoth from 'mammoth';
import * as fs from 'fs/promises';
import * as path from 'path';

interface ParsedCourse {
  title: string;
  slug: string;
  description: string;
  level: string;
  category: string;
  subcategory?: string;
  prerequisites: string[];
  duration: number;
  credits: number;
  content: any;
  modules: ParsedModule[];
  tags: string[];
  accreditation?: any;
  passingScore: number;
}

interface ParsedModule {
  title: string;
  slug: string;
  description?: string;
  content: any;
  order: number;
  duration: number;
  isRequired: boolean;
  lessons: ParsedLesson[];
  assessments: ParsedAssessment[];
}

interface ParsedLesson {
  title: string;
  slug: string;
  content: any;
  type: 'text' | 'video' | 'interactive' | 'quiz';
  order: number;
  duration: number;
  isRequired: boolean;
  resources?: any;
}

interface ParsedAssessment {
  title: string;
  description?: string;
  type: 'quiz' | 'exam' | 'practical' | 'assignment';
  questions: any;
  passingScore: number;
  timeLimit?: number;
  maxAttempts: number;
  isRequired: boolean;
  order: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function determineCourseLevel(fileName: string): string {
  if (fileName.includes('Level 2')) return 'Level 2';
  if (fileName.includes('Level 3')) return 'Level 3';
  if (fileName.includes('Level 4')) return 'Level 4';
  return 'Foundation';
}

function determineCourseCategory(fileName: string, content: string): string {
  const fileNameLower = fileName.toLowerCase();
  const contentLower = content.toLowerCase();
  
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
  
  // Fallback category based on content analysis
  if (contentLower.includes('injection') || contentLower.includes('treatment')) {
    return 'Clinical Practice';
  }
  
  return 'Foundation Studies';
}

function extractModulesFromContent(content: string): ParsedModule[] {
  const modules: ParsedModule[] = [];
  
  // Split content by major headings (Module, Chapter, Section, Unit)
  const modulePatterns = [
    /(?:Module|Chapter|Section|Unit)\s+(\d+)[:\s]+([^\n]+)/gi,
    /^#{1,2}\s+(.+)$/gm, // Markdown-style headings
    /^([A-Z][^.!?]+)$/gm  // Lines that look like titles
  ];
  
  let moduleMatches: any[] = [];
  
  for (const pattern of modulePatterns) {
    const matches = Array.from(content.matchAll(pattern));
    if (matches.length > 0) {
      moduleMatches = matches;
      break;
    }
  }
  
  if (moduleMatches.length === 0) {
    // If no clear modules found, create a single module
    return [{
      title: 'Core Content',
      slug: 'core-content',
      description: 'Main course content',
      content: { text: content },
      order: 0,
      duration: 60,
      isRequired: true,
      lessons: extractLessonsFromContent(content),
      assessments: []
    }];
  }
  
  // Process each module
  moduleMatches.forEach((match, index) => {
    const moduleTitle = match[2] || match[1];
    const startIndex = match.index || 0;
    const endIndex = moduleMatches[index + 1]?.index || content.length;
    const moduleContent = content.substring(startIndex, endIndex);
    
    modules.push({
      title: moduleTitle.trim(),
      slug: slugify(moduleTitle),
      description: extractDescription(moduleContent),
      content: { text: moduleContent },
      order: index,
      duration: estimateDuration(moduleContent),
      isRequired: true,
      lessons: extractLessonsFromContent(moduleContent),
      assessments: extractAssessmentsFromContent(moduleContent, moduleTitle)
    });
  });
  
  return modules;
}

function extractLessonsFromContent(content: string): ParsedLesson[] {
  const lessons: ParsedLesson[] = [];
  
  // Look for lesson-like structures
  const lessonPatterns = [
    /(?:Lesson|Topic|Section)\s+(\d+)[:\s]+([^\n]+)/gi,
    /^\d+\.\s+([^\n]+)/gm, // Numbered items
    /^-\s+([^\n]+)/gm      // Bullet points as lessons
  ];
  
  let lessonMatches: any[] = [];
  
  for (const pattern of lessonPatterns) {
    const matches = Array.from(content.matchAll(pattern));
    if (matches.length > 0) {
      lessonMatches = matches;
      break;
    }
  }
  
  if (lessonMatches.length === 0) {
    // Create a default lesson if none found
    return [{
      title: 'Introduction',
      slug: 'introduction',
      content: { text: content.substring(0, Math.min(1000, content.length)) },
      type: 'text',
      order: 0,
      duration: 15,
      isRequired: true
    }];
  }
  
  lessonMatches.forEach((match, index) => {
    const lessonTitle = match[2] || match[1];
    const startIndex = match.index || 0;
    const endIndex = lessonMatches[index + 1]?.index || Math.min(startIndex + 2000, content.length);
    const lessonContent = content.substring(startIndex, endIndex);
    
    lessons.push({
      title: lessonTitle.trim(),
      slug: slugify(lessonTitle),
      content: { text: lessonContent },
      type: determineContentType(lessonContent),
      order: index,
      duration: estimateDuration(lessonContent),
      isRequired: true
    });
  });
  
  return lessons;
}

function extractAssessmentsFromContent(content: string, moduleTitle: string): ParsedAssessment[] {
  const assessments: ParsedAssessment[] = [];
  
  // Look for assessment indicators
  const hasQuiz = /(?:quiz|test|assessment|exam|questions)/i.test(content);
  const hasPractical = /(?:practical|hands-on|demonstration|practice)/i.test(content);
  
  if (hasQuiz) {
    assessments.push({
      title: `${moduleTitle} Assessment`,
      description: `Knowledge assessment for ${moduleTitle}`,
      type: 'quiz',
      questions: generateSampleQuestions(content),
      passingScore: 70,
      timeLimit: 30,
      maxAttempts: 3,
      isRequired: true,
      order: 0
    });
  }
  
  if (hasPractical) {
    assessments.push({
      title: `${moduleTitle} Practical`,
      description: `Practical assessment for ${moduleTitle}`,
      type: 'practical',
      questions: {
        instructions: 'Complete the practical demonstration as instructed',
        criteria: []
      },
      passingScore: 80,
      maxAttempts: 2,
      isRequired: true,
      order: 1
    });
  }
  
  return assessments;
}

function generateSampleQuestions(content: string): any {
  // Generate sample questions based on content
  return {
    questions: [
      {
        id: '1',
        type: 'multiple-choice',
        question: 'Sample question based on module content',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 0,
        points: 10
      }
    ]
  };
}

function extractDescription(content: string): string {
  // Extract first paragraph or first 200 characters as description
  const firstParagraph = content.split('\n\n')[0];
  return firstParagraph.substring(0, 200).trim() + (firstParagraph.length > 200 ? '...' : '');
}

function estimateDuration(content: string): number {
  // Estimate reading time: ~200 words per minute
  const words = content.split(/\s+/).length;
  return Math.max(5, Math.ceil(words / 200));
}

function determineContentType(content: string): 'text' | 'video' | 'interactive' | 'quiz' {
  const contentLower = content.toLowerCase();
  
  if (contentLower.includes('video') || contentLower.includes('watch')) {
    return 'video';
  }
  if (contentLower.includes('quiz') || contentLower.includes('question')) {
    return 'quiz';
  }
  if (contentLower.includes('interactive') || contentLower.includes('exercise')) {
    return 'interactive';
  }
  
  return 'text';
}

function extractTags(fileName: string, content: string): string[] {
  const tags: string[] = [];
  
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
  
  // Add content-based tags
  const contentLower = content.toLowerCase();
  if (contentLower.includes('facial')) tags.push('facial-aesthetics');
  if (contentLower.includes('skin')) tags.push('skin-care');
  if (contentLower.includes('injection')) tags.push('injection-techniques');
  if (contentLower.includes('complication')) tags.push('complications-management');
  
  return [...new Set(tags)]; // Remove duplicates
}

export async function parseDocxFile(filePath: string): Promise<ParsedCourse> {
  try {
    const buffer = await fs.readFile(filePath);
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;
    const fileName = path.basename(filePath, '.docx');
    
    // Extract course title from filename
    const title = fileName
      .replace(/^\d+\.\s*/, '') // Remove leading numbers
      .replace(/\.docx$/i, '')   // Remove extension
      .trim();
    
    const level = determineCourseLevel(fileName);
    const category = determineCourseCategory(fileName, text);
    const modules = extractModulesFromContent(text);
    
    // Calculate total duration from modules
    const totalDuration = modules.reduce((sum, module) => sum + module.duration, 0);
    
    const course: ParsedCourse = {
      title,
      slug: slugify(title),
      description: extractDescription(text),
      level,
      category,
      subcategory: undefined,
      prerequisites: determinePrerequisites(level, category),
      duration: Math.ceil(totalDuration / 60), // Convert to hours
      credits: calculateCredits(level, totalDuration),
      content: {
        overview: text.substring(0, 1000),
        objectives: extractObjectives(text),
        outline: modules.map(m => m.title)
      },
      modules,
      tags: extractTags(fileName, text),
      accreditation: {
        body: 'LACA',
        level: level,
        credits: calculateCredits(level, totalDuration)
      },
      passingScore: 70
    };
    
    return course;
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    throw error;
  }
}

function determinePrerequisites(level: string, category: string): string[] {
  const prerequisites: string[] = [];
  
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

function calculateCredits(level: string, durationMinutes: number): number {
  const hours = durationMinutes / 60;
  let baseCredits = Math.ceil(hours / 10) * 5; // 5 credits per 10 hours
  
  // Adjust based on level
  if (level === 'Level 3') baseCredits *= 1.2;
  if (level === 'Level 4') baseCredits *= 1.5;
  
  return Math.round(baseCredits);
}

function extractObjectives(content: string): string[] {
  const objectives: string[] = [];
  
  // Look for learning objectives patterns
  const objectivePatterns = [
    /(?:learning objectives?|objectives?|you will learn)[:\s]+([^\n]+(?:\n(?![A-Z])[^\n]+)*)/gi,
    /(?:by the end[^:]+):[:\s]+([^\n]+(?:\n(?![A-Z])[^\n]+)*)/gi
  ];
  
  for (const pattern of objectivePatterns) {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const items = match.split('\n').filter(line => line.trim());
        objectives.push(...items.map(item => item.replace(/^[-•*]\s*/, '').trim()));
      });
      break;
    }
  }
  
  // If no objectives found, generate default ones
  if (objectives.length === 0) {
    objectives.push(
      'Understand the fundamental concepts',
      'Apply theoretical knowledge to practice',
      'Demonstrate competency in key areas',
      'Meet professional standards'
    );
  }
  
  return objectives.slice(0, 5); // Limit to 5 objectives
}

export async function parseAllCourses(directoryPath: string): Promise<ParsedCourse[]> {
  const courses: ParsedCourse[] = [];
  
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
