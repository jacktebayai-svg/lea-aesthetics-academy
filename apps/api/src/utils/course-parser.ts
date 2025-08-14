import * as fs from 'fs';
import * as path from 'path';
import { 
  Course, 
  Module, 
  Lesson, 
  Assessment, 
  AssessmentQuestion, 
  CourseCategory, 
  DocumentTemplate,
  SeedData 
} from '../types/course-seeding.types';

interface ParsedContent {
  title: string;
  sections: Array<{
    title: string;
    content: string;
    questions?: string[];
  }>;
  questions: string[];
}

export class CourseParser {
  private coursesData: SeedData = {
    categories: [],
    courses: [],
    templates: []
  };

  constructor() {
    this.initializeCategories();
    this.initializeDocumentTemplates();
  }

  private initializeCategories(): void {
    this.coursesData.categories = [
      {
        id: 'anatomy-physiology',
        name: 'Anatomy & Physiology',
        description: 'Fundamental understanding of human anatomy and physiological processes',
        order: 1
      },
      {
        id: 'medical-safety',
        name: 'Medical Safety & Emergency Response',
        description: 'Safety protocols, emergency procedures, and medical safety standards',
        order: 2
      },
      {
        id: 'practical-treatments',
        name: 'Practical Treatments',
        description: 'Hands-on training for aesthetic treatments and procedures',
        order: 3
      },
      {
        id: 'foundation',
        name: 'Foundation Courses',
        description: 'Essential foundational knowledge for aesthetic practitioners',
        parentId: 'anatomy-physiology',
        order: 4
      }
    ];
  }

  private initializeDocumentTemplates(): void {
    this.coursesData.templates = [
      {
        id: 'consent-form-botox',
        name: 'Botox Treatment Consent Form',
        description: 'Comprehensive consent form for botulinum toxin treatments',
        category: 'consent',
        filePath: '/templates/forms/botox-consent.pdf',
        version: '1.0',
        isActive: true,
        fields: [
          {
            id: 'patient-name',
            name: 'patientName',
            type: 'text',
            label: 'Patient Full Name',
            required: true
          },
          {
            id: 'treatment-areas',
            name: 'treatmentAreas',
            type: 'checkbox',
            label: 'Treatment Areas',
            required: true,
            options: ['Forehead', 'Glabella (Frown Lines)', 'Crows Feet', 'Other']
          },
          {
            id: 'medical-conditions',
            name: 'medicalConditions',
            type: 'textarea',
            label: 'Current Medical Conditions',
            required: true
          },
          {
            id: 'patient-signature',
            name: 'patientSignature',
            type: 'signature',
            label: 'Patient Signature',
            required: true
          },
          {
            id: 'practitioner-signature',
            name: 'practitionerSignature',
            type: 'signature',
            label: 'Practitioner Signature',
            required: true
          }
        ]
      },
      {
        id: 'consultation-form',
        name: 'Client Consultation Form',
        description: 'Comprehensive client consultation form for aesthetic treatments',
        category: 'assessment',
        filePath: '/templates/forms/client-consultation.pdf',
        version: '1.0',
        isActive: true,
        fields: [
          {
            id: 'client-details',
            name: 'clientDetails',
            type: 'text',
            label: 'Client Name, DOB, Address',
            required: true
          },
          {
            id: 'medical-history',
            name: 'medicalHistory',
            type: 'textarea',
            label: 'Medical History',
            required: true
          },
          {
            id: 'allergies',
            name: 'allergies',
            type: 'textarea',
            label: 'Known Allergies',
            required: true
          },
          {
            id: 'next-of-kin',
            name: 'nextOfKin',
            type: 'text',
            label: 'Emergency Contact',
            required: true
          },
          {
            id: 'informed-consent',
            name: 'informedConsent',
            type: 'checkbox',
            label: 'I give informed consent for treatment',
            required: true
          }
        ]
      }
    ];
  }

  private parseMarkdownContent(filePath: string): ParsedContent {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    const result: ParsedContent = {
      title: '',
      sections: [],
      questions: []
    };

    let currentSection = '';
    let currentContent = '';
    let inQuestionSection = false;
    
    for (const line of lines) {
      // Extract main title
      if (line.startsWith('# ') && !result.title) {
        result.title = line.replace('# ', '').trim();
        continue;
      }

      // Section headers
      if (line.startsWith('## ') || line.startsWith('### ')) {
        // Save previous section
        if (currentSection && currentContent) {
          result.sections.push({
            title: currentSection,
            content: currentContent.trim()
          });
        }
        
        currentSection = line.replace(/^#{2,3} /, '').trim();
        currentContent = '';
        
        // Check if this is a questions section
        inQuestionSection = currentSection.toLowerCase().includes('question') || 
                           currentSection.toLowerCase().includes('essay');
        continue;
      }

      // Extract questions
      if (inQuestionSection && line.match(/^\d+\./)) {
        const question = line.replace(/^\d+\.\s*/, '').trim();
        if (question) {
          result.questions.push(question);
        }
        continue;
      }

      // Regular content
      currentContent += line + '\n';
    }

    // Save last section
    if (currentSection && currentContent) {
      result.sections.push({
        title: currentSection,
        content: currentContent.trim(),
        questions: inQuestionSection ? result.questions : undefined
      });
    }

    return result;
  }

  private createAssessmentQuestions(questions: string[]): AssessmentQuestion[] {
    return questions.map((question, index) => ({
      id: `q-${index + 1}`,
      question,
      type: question.includes('explain') || question.includes('describe') ? 'essay' : 'short_answer',
      points: 10,
      explanation: `Question ${index + 1} from course material`
    }));
  }

  public generateCourseData(): SeedData {
    const courseFiles = [
      '1. A&P Level 2.md',
      '2. A&P Level 3.md', 
      '3. A&P Level 4.md',
      '4. CPR and Anaphylaxis.md',
      '5. Safety in Medicine.md',
      '6. Dermal Fillers and Botulinum Toxin.md'
    ];

    const coursesPath = '/home/yelovelo/Desktop/LACA/FondationAesthetics';

    courseFiles.forEach((fileName, courseIndex) => {
      const filePath = path.join(coursesPath, fileName);
      
      if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        return;
      }

      const parsedContent = this.parseMarkdownContent(filePath);
      
      const courseId = `course-${courseIndex + 1}`;
      const level = parseInt(fileName.match(/Level (\d+)/)?.[1] || '1');
      
      // Create modules from major sections
      const modules: Module[] = parsedContent.sections.map((section, moduleIndex) => {
        const lessons: Lesson[] = [];
        
        // Create lesson from section content
        const lessonId = `${courseId}-lesson-${moduleIndex + 1}`;
        const lesson: Lesson = {
          id: lessonId,
          title: section.title,
          description: `Study material for ${section.title}`,
          content: section.content,
          type: 'theory',
          duration: '45 minutes',
          resources: [],
          assessments: [],
          order: moduleIndex + 1
        };

        // Add assessment if questions exist
        if (section.questions && section.questions.length > 0) {
          const assessment: Assessment = {
            id: `${lessonId}-assessment`,
            title: `${section.title} Assessment`,
            description: `Assessment questions for ${section.title}`,
            type: 'quiz',
            questions: this.createAssessmentQuestions(section.questions),
            passingScore: 70,
            timeLimit: 30,
            attempts: 3
          };
          lesson.assessments.push(assessment);
        }

        lessons.push(lesson);

        return {
          id: `${courseId}-module-${moduleIndex + 1}`,
          title: section.title,
          description: `Module covering ${section.title}`,
          objectives: [`Understand ${section.title}`],
          lessons,
          order: moduleIndex + 1
        };
      });

      // Add final assessment if questions exist at course level
      if (parsedContent.questions.length > 0) {
        const finalAssessment: Assessment = {
          id: `${courseId}-final-assessment`,
          title: `${parsedContent.title} Final Exam`,
          description: `Comprehensive assessment for ${parsedContent.title}`,
          type: 'exam',
          questions: this.createAssessmentQuestions(parsedContent.questions),
          passingScore: 75,
          timeLimit: 60,
          attempts: 2
        };

        // Add to last module or create assessment module
        if (modules.length > 0) {
          modules[modules.length - 1].lessons.push({
            id: `${courseId}-final-lesson`,
            title: 'Final Assessment',
            description: 'Comprehensive course assessment',
            content: 'Complete the final assessment to demonstrate your understanding.',
            type: 'assessment',
            duration: '60 minutes',
            resources: [],
            assessments: [finalAssessment],
            order: modules[modules.length - 1].lessons.length + 1
          });
        }
      }

      // Determine category based on course content
      let category = 'foundation';
      if (fileName.includes('A&P')) {
        category = 'anatomy-physiology';
      } else if (fileName.includes('CPR') || fileName.includes('Safety')) {
        category = 'medical-safety';
      } else if (fileName.includes('Botox') || fileName.includes('Fillers')) {
        category = 'practical-treatments';
      }

      const course: Course = {
        id: courseId,
        metadata: {
          title: parsedContent.title,
          description: `Comprehensive course covering ${parsedContent.title.toLowerCase()}`,
          level,
          prerequisites: courseIndex > 0 ? [`course-${courseIndex}`] : [],
          duration: `${modules.length * 2} hours`,
          objectives: [
            `Master the fundamentals of ${parsedContent.title.toLowerCase()}`,
            'Demonstrate practical understanding through assessments',
            'Apply knowledge in real-world scenarios'
          ]
        },
        modules,
        category,
        tags: this.extractTags(parsedContent.title, fileName),
        status: 'published'
      };

      this.coursesData.courses.push(course);
    });

    return this.coursesData;
  }

  private extractTags(title: string, fileName: string): string[] {
    const tags: string[] = [];
    
    if (title.includes('Anatomy') || title.includes('Physiology')) {
      tags.push('anatomy', 'physiology', 'medical');
    }
    
    if (title.includes('CPR')) {
      tags.push('emergency', 'cpr', 'life-saving');
    }
    
    if (title.includes('Safety')) {
      tags.push('safety', 'protocols', 'medicine');
    }
    
    if (title.includes('Botox') || title.includes('Filler')) {
      tags.push('botox', 'fillers', 'injectables', 'practical');
    }
    
    if (fileName.includes('Level')) {
      const level = fileName.match(/Level (\d+)/)?.[1];
      if (level) {
        tags.push(`level-${level}`);
      }
    }

    return tags;
  }
}

// Export function to generate seed data
export function generateCourseSeedData(): SeedData {
  const parser = new CourseParser();
  return parser.generateCourseData();
}
