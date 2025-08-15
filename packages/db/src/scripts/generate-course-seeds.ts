#!/usr/bin/env ts-node

import * as path from 'path';
import * as fs from 'fs/promises';
import { parseAllCourses } from '../utils/course-parser';

async function generateCourseSeedData() {
  const documentsPath = path.join(
    process.cwd(),
    '../../FondationAesthetics'
  );
  
  const outputPath = path.join(
    process.cwd(),
    'src/seed-data/courses.json'
  );
  
  console.log('📂 Reading courses from:', documentsPath);
  console.log('📝 Output will be saved to:', outputPath);
  
  try {
    // Parse all course documents
    const courses = await parseAllCourses(documentsPath);
    
    if (courses.length === 0) {
      console.error('❌ No courses were parsed');
      return;
    }
    
    console.log(`✅ Successfully parsed ${courses.length} courses`);
    
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
      console.log(`  - ${course.title}`);
      console.log(`    Level: ${course.level}`);
      console.log(`    Category: ${course.category}`);
      console.log(`    Modules: ${course.modules.length}`);
      console.log(`    Duration: ${course.duration} hours`);
      console.log(`    Credits: ${course.credits}`);
    });
    
  } catch (error) {
    console.error('❌ Error generating course seed data:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateCourseSeedData();
}
