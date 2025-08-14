export interface CourseMetadata {
  title: string;
  description: string;
  level: number;
  prerequisites: string[];
  duration: string;
  objectives: string[];
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'essay' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
  explanation?: string;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  type: 'quiz' | 'exam' | 'assignment';
  questions: AssessmentQuestion[];
  passingScore: number;
  timeLimit?: number; // in minutes
  attempts: number;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  type: 'theory' | 'practical' | 'assessment';
  duration: string;
  resources: string[];
  assessments: Assessment[];
  order: number;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  lessons: Lesson[];
  order: number;
}

export interface Course {
  id: string;
  metadata: CourseMetadata;
  modules: Module[];
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
}

export interface CourseCategory {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  order: number;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'consent' | 'assessment' | 'treatment' | 'medical_history' | 'legal';
  filePath: string;
  version: string;
  isActive: boolean;
  fields: DocumentField[];
}

export interface DocumentField {
  id: string;
  name: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'date' | 'signature';
  label: string;
  required: boolean;
  options?: string[];
  validation?: string;
}

export interface SeedData {
  categories: CourseCategory[];
  courses: Course[];
  templates: DocumentTemplate[];
}
