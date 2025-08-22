-- ==========================================
-- LMS SCHEMA EXTENSION FOR LEA AESTHETICS ACADEMY
-- Extends existing Master Aesthetics Suite with comprehensive Learning Management System
-- ==========================================

-- Additional ENUM types for LMS
DROP TYPE IF EXISTS lesson_type CASCADE;
CREATE TYPE lesson_type AS ENUM ('video', 'text', 'quiz', 'assignment', 'interactive', 'pdf', 'live_session');

DROP TYPE IF EXISTS assignment_type CASCADE;
CREATE TYPE assignment_type AS ENUM ('essay', 'case_study', 'practical', 'portfolio', 'peer_review');

DROP TYPE IF EXISTS quiz_question_type CASCADE;
CREATE TYPE quiz_question_type AS ENUM ('multiple_choice', 'true_false', 'short_answer', 'essay', 'matching');

DROP TYPE IF EXISTS submission_status CASCADE;
CREATE TYPE submission_status AS ENUM ('not_started', 'in_progress', 'submitted', 'graded', 'returned');

-- ==========================================
-- COURSE CONTENT STRUCTURE TABLES
-- ==========================================

-- Course Modules (chapters/sections within courses)
DROP TABLE IF EXISTS public.course_modules CASCADE;
CREATE TABLE public.course_modules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES public.courses ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  duration_minutes INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT TRUE,
  prerequisites JSONB DEFAULT '{}', -- Required previous modules
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(course_id, order_index)
);

-- Course Lessons (individual content items within modules)
DROP TABLE IF EXISTS public.course_lessons CASCADE;
CREATE TABLE public.course_lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  module_id UUID REFERENCES public.course_modules ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type lesson_type NOT NULL,
  content JSONB NOT NULL DEFAULT '{}', -- Lesson content (text, video URL, etc.)
  duration_minutes INTEGER DEFAULT 0,
  order_index INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT TRUE,
  resources JSONB DEFAULT '{}', -- Additional resources, downloads, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(module_id, order_index)
);

-- Course Assignments
DROP TABLE IF EXISTS public.course_assignments CASCADE;
CREATE TABLE public.course_assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lesson_id UUID REFERENCES public.course_lessons ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type assignment_type NOT NULL,
  instructions JSONB NOT NULL DEFAULT '{}',
  max_points INTEGER DEFAULT 100,
  due_days INTEGER, -- Days after enrollment or lesson completion
  rubric JSONB DEFAULT '{}', -- Grading criteria
  allow_late_submission BOOLEAN DEFAULT TRUE,
  late_penalty_percent INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course Quizzes
DROP TABLE IF EXISTS public.course_quizzes CASCADE;
CREATE TABLE public.course_quizzes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lesson_id UUID REFERENCES public.course_lessons ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  time_limit_minutes INTEGER, -- NULL for no time limit
  max_attempts INTEGER DEFAULT 3,
  passing_score INTEGER DEFAULT 70, -- Percentage
  show_answers BOOLEAN DEFAULT FALSE,
  randomize_questions BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz Questions
DROP TABLE IF EXISTS public.quiz_questions CASCADE;
CREATE TABLE public.quiz_questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quiz_id UUID REFERENCES public.course_quizzes ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  type quiz_question_type NOT NULL,
  options JSONB DEFAULT '{}', -- Multiple choice options, matching pairs, etc.
  correct_answer JSONB NOT NULL, -- Correct answer(s)
  points INTEGER DEFAULT 1,
  explanation TEXT, -- Shown after answer
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(quiz_id, order_index)
);

-- ==========================================
-- STUDENT PROGRESS TRACKING TABLES
-- ==========================================

-- Student Lesson Progress
DROP TABLE IF EXISTS public.student_lesson_progress CASCADE;
CREATE TABLE public.student_lesson_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.students ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.course_lessons ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'not_started', -- not_started, in_progress, completed
  time_spent_minutes INTEGER DEFAULT 0,
  completion_percentage INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  notes TEXT, -- Student notes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(student_id, lesson_id)
);

-- Student Assignment Submissions
DROP TABLE IF EXISTS public.assignment_submissions CASCADE;
CREATE TABLE public.assignment_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.students ON DELETE CASCADE NOT NULL,
  assignment_id UUID REFERENCES public.course_assignments ON DELETE CASCADE NOT NULL,
  status submission_status DEFAULT 'not_started',
  content JSONB NOT NULL DEFAULT '{}', -- Submission content
  file_attachments TEXT[], -- Array of file URLs
  submitted_at TIMESTAMPTZ,
  graded_at TIMESTAMPTZ,
  score INTEGER, -- Points earned
  feedback TEXT, -- Instructor feedback
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(student_id, assignment_id)
);

-- Student Quiz Attempts
DROP TABLE IF EXISTS public.quiz_attempts CASCADE;
CREATE TABLE public.quiz_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.students ON DELETE CASCADE NOT NULL,
  quiz_id UUID REFERENCES public.course_quizzes ON DELETE CASCADE NOT NULL,
  attempt_number INTEGER NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  score INTEGER, -- Points earned
  max_score INTEGER, -- Total points possible
  percentage INTEGER, -- Calculated percentage
  time_taken_minutes INTEGER,
  answers JSONB NOT NULL DEFAULT '{}', -- Student answers
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(student_id, quiz_id, attempt_number)
);

-- Student Module Progress (calculated from lessons)
DROP TABLE IF EXISTS public.student_module_progress CASCADE;
CREATE TABLE public.student_module_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.students ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES public.course_modules ON DELETE CASCADE NOT NULL,
  completion_percentage INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  total_time_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(student_id, module_id)
);

-- ==========================================
-- CERTIFICATION AND ACHIEVEMENTS
-- ==========================================

-- Student Certificates
DROP TABLE IF EXISTS public.student_certificates CASCADE;
CREATE TABLE public.student_certificates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.students ON DELETE CASCADE NOT NULL,
  course_enrollment_id UUID REFERENCES public.course_enrollments ON DELETE CASCADE NOT NULL,
  certificate_number TEXT UNIQUE NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- NULL for non-expiring certificates
  pdf_url TEXT, -- Supabase Storage URL
  verification_code TEXT UNIQUE, -- For external verification
  metadata JSONB DEFAULT '{}', -- Additional certificate data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(student_id, course_enrollment_id)
);

-- Student Achievements/Badges
DROP TABLE IF EXISTS public.student_achievements CASCADE;
CREATE TABLE public.student_achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.students ON DELETE CASCADE NOT NULL,
  achievement_type TEXT NOT NULL, -- 'perfect_score', 'early_completion', 'participation', etc.
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- Emoji or icon name
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  course_id UUID REFERENCES public.courses ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}' -- Additional achievement data
);

-- ==========================================
-- COMMUNICATION AND SUPPORT
-- ==========================================

-- Course Discussion Forums
DROP TABLE IF EXISTS public.course_discussions CASCADE;
CREATE TABLE public.course_discussions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES public.courses ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES public.course_modules ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.course_lessons ON DELETE CASCADE,
  student_id UUID REFERENCES public.students ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_question BOOLEAN DEFAULT FALSE,
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Discussion Replies
DROP TABLE IF EXISTS public.discussion_replies CASCADE;
CREATE TABLE public.discussion_replies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  discussion_id UUID REFERENCES public.course_discussions ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_instructor_reply BOOLEAN DEFAULT FALSE,
  is_helpful BOOLEAN DEFAULT FALSE, -- Marked by student who asked question
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student Notes
DROP TABLE IF EXISTS public.student_notes CASCADE;
CREATE TABLE public.student_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.students ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.course_lessons ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  timestamp_seconds INTEGER, -- For video notes - timestamp in video
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

-- Course content indexes
CREATE INDEX idx_course_modules_course_id ON public.course_modules(course_id);
CREATE INDEX idx_course_modules_order ON public.course_modules(course_id, order_index);
CREATE INDEX idx_course_lessons_module_id ON public.course_lessons(module_id);
CREATE INDEX idx_course_lessons_order ON public.course_lessons(module_id, order_index);
CREATE INDEX idx_course_assignments_lesson_id ON public.course_assignments(lesson_id);
CREATE INDEX idx_course_quizzes_lesson_id ON public.course_quizzes(lesson_id);
CREATE INDEX idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);

-- Progress tracking indexes
CREATE INDEX idx_student_lesson_progress_student_id ON public.student_lesson_progress(student_id);
CREATE INDEX idx_student_lesson_progress_lesson_id ON public.student_lesson_progress(lesson_id);
CREATE INDEX idx_student_module_progress_student_id ON public.student_module_progress(student_id);
CREATE INDEX idx_assignment_submissions_student_id ON public.assignment_submissions(student_id);
CREATE INDEX idx_quiz_attempts_student_id ON public.quiz_attempts(student_id);

-- Certificate and achievement indexes
CREATE INDEX idx_student_certificates_student_id ON public.student_certificates(student_id);
CREATE INDEX idx_student_achievements_student_id ON public.student_achievements(student_id);

-- Communication indexes
CREATE INDEX idx_course_discussions_course_id ON public.course_discussions(course_id);
CREATE INDEX idx_discussion_replies_discussion_id ON public.discussion_replies(discussion_id);
CREATE INDEX idx_student_notes_student_id ON public.student_notes(student_id);

-- ==========================================
-- UPDATED TRIGGERS FOR LMS TABLES
-- ==========================================

-- Add updated_at triggers for new tables
CREATE TRIGGER trigger_course_modules_updated_at BEFORE UPDATE ON public.course_modules FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_course_lessons_updated_at BEFORE UPDATE ON public.course_lessons FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_course_assignments_updated_at BEFORE UPDATE ON public.course_assignments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_student_lesson_progress_updated_at BEFORE UPDATE ON public.student_lesson_progress FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_assignment_submissions_updated_at BEFORE UPDATE ON public.assignment_submissions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_student_module_progress_updated_at BEFORE UPDATE ON public.student_module_progress FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_course_discussions_updated_at BEFORE UPDATE ON public.course_discussions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_discussion_replies_updated_at BEFORE UPDATE ON public.discussion_replies FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==========================================
-- PROGRESS CALCULATION FUNCTIONS
-- ==========================================

-- Function to calculate student module progress
CREATE OR REPLACE FUNCTION calculate_module_progress(p_student_id UUID, p_module_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_lessons INTEGER;
    completed_lessons INTEGER;
    progress_percentage INTEGER;
BEGIN
    -- Count total lessons in module
    SELECT COUNT(*) INTO total_lessons
    FROM course_lessons
    WHERE module_id = p_module_id;
    
    IF total_lessons = 0 THEN
        RETURN 0;
    END IF;
    
    -- Count completed lessons
    SELECT COUNT(*) INTO completed_lessons
    FROM student_lesson_progress slp
    JOIN course_lessons cl ON slp.lesson_id = cl.id
    WHERE slp.student_id = p_student_id 
      AND cl.module_id = p_module_id 
      AND slp.status = 'completed';
    
    -- Calculate percentage
    progress_percentage := ROUND((completed_lessons::DECIMAL / total_lessons::DECIMAL) * 100);
    
    -- Update or insert module progress
    INSERT INTO student_module_progress (student_id, module_id, completion_percentage, updated_at)
    VALUES (p_student_id, p_module_id, progress_percentage, NOW())
    ON CONFLICT (student_id, module_id)
    DO UPDATE SET 
        completion_percentage = EXCLUDED.completion_percentage,
        updated_at = NOW(),
        completed_at = CASE WHEN EXCLUDED.completion_percentage = 100 THEN NOW() ELSE NULL END;
    
    RETURN progress_percentage;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate course enrollment progress
CREATE OR REPLACE FUNCTION calculate_course_progress(p_student_id UUID, p_course_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_modules INTEGER;
    completed_modules INTEGER;
    progress_percentage INTEGER;
    total_progress INTEGER := 0;
    module_record RECORD;
BEGIN
    -- Get all modules for the course
    FOR module_record IN 
        SELECT id FROM course_modules WHERE course_id = p_course_id ORDER BY order_index
    LOOP
        total_progress := total_progress + calculate_module_progress(p_student_id, module_record.id);
        total_modules := total_modules + 1;
    END LOOP;
    
    IF total_modules = 0 THEN
        RETURN 0;
    END IF;
    
    progress_percentage := ROUND(total_progress::DECIMAL / total_modules::DECIMAL);
    
    -- Update course enrollment progress
    UPDATE course_enrollments 
    SET 
        progress = jsonb_build_object('completion_percentage', progress_percentage),
        updated_at = NOW(),
        completed_at = CASE WHEN progress_percentage = 100 THEN NOW() ELSE completed_at END
    WHERE student_id = p_student_id AND course_id = p_course_id;
    
    RETURN progress_percentage;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update progress when lesson is completed
CREATE OR REPLACE FUNCTION update_progress_on_lesson_completion()
RETURNS TRIGGER AS $$
DECLARE
    module_id_val UUID;
    course_id_val UUID;
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        -- Get module and course IDs
        SELECT cl.module_id, cm.course_id INTO module_id_val, course_id_val
        FROM course_lessons cl
        JOIN course_modules cm ON cl.module_id = cm.id
        WHERE cl.id = NEW.lesson_id;
        
        -- Update module progress
        PERFORM calculate_module_progress(NEW.student_id, module_id_val);
        
        -- Update course progress
        PERFORM calculate_course_progress(NEW.student_id, course_id_val);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_progress_on_lesson_completion
    AFTER INSERT OR UPDATE ON student_lesson_progress
    FOR EACH ROW EXECUTE PROCEDURE update_progress_on_lesson_completion();

-- ==========================================
-- CERTIFICATE GENERATION FUNCTION
-- ==========================================

CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TEXT AS $$
DECLARE
    cert_number TEXT;
    counter INTEGER;
BEGIN
    counter := 1;
    LOOP
        cert_number := 'LEA-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(counter::TEXT, 4, '0');
        
        -- Check if this number exists
        IF NOT EXISTS (SELECT 1 FROM student_certificates WHERE certificate_number = cert_number) THEN
            RETURN cert_number;
        END IF;
        
        counter := counter + 1;
        
        -- Prevent infinite loop
        IF counter > 9999 THEN
            cert_number := 'LEA-' || TO_CHAR(NOW(), 'YYYY-MM-DD-HH24-MI-SS') || '-' || LPAD((RANDOM() * 1000)::INTEGER::TEXT, 3, '0');
            RETURN cert_number;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to issue certificate when course is completed
CREATE OR REPLACE FUNCTION issue_certificate_on_completion()
RETURNS TRIGGER AS $$
DECLARE
    cert_number TEXT;
    verification_code TEXT;
BEGIN
    IF NEW.completed_at IS NOT NULL AND (OLD.completed_at IS NULL OR OLD.completed_at != NEW.completed_at) THEN
        -- Generate certificate number and verification code
        cert_number := generate_certificate_number();
        verification_code := 'LEA' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 8));
        
        -- Insert certificate record
        INSERT INTO student_certificates (
            student_id,
            course_enrollment_id,
            certificate_number,
            verification_code,
            metadata
        ) VALUES (
            NEW.student_id,
            NEW.id,
            cert_number,
            verification_code,
            jsonb_build_object(
                'course_title', (SELECT title FROM courses WHERE id = NEW.course_id),
                'completion_date', NEW.completed_at,
                'final_score', COALESCE((NEW.progress->>'final_score')::INTEGER, 100)
            )
        ) ON CONFLICT (student_id, course_enrollment_id) DO NOTHING;
        
        -- Update enrollment to mark certificate as issued
        UPDATE course_enrollments 
        SET certificate_issued = TRUE 
        WHERE id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_issue_certificate_on_completion
    AFTER UPDATE ON course_enrollments
    FOR EACH ROW EXECUTE PROCEDURE issue_certificate_on_completion();
