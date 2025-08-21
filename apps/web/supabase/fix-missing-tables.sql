-- ==========================================
-- MASTER AESTHETICS SUITE - FIX MISSING TABLES
-- Quick fix for missing tables in partially configured database
-- ==========================================

-- Create missing enums if they don't exist
DO $$ BEGIN
    CREATE TYPE enrollment_status AS ENUM ('enrolled', 'in_progress', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded', 'partial_refund');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_type AS ENUM ('consent', 'aftercare_guide', 'policy_agreement', 'certificate');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_status AS ENUM ('draft', 'sent', 'signed', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create missing courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- in pence
  duration_hours INTEGER NOT NULL,
  max_students INTEGER,
  curriculum JSONB DEFAULT '{}',
  prerequisites JSONB DEFAULT '{}',
  certificate_template JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create missing course_enrollments table
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.students ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses ON DELETE CASCADE NOT NULL,
  status enrollment_status DEFAULT 'enrolled',
  progress JSONB DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  certificate_issued BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(student_id, course_id)
);

-- Create missing payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments ON DELETE CASCADE,
  course_enrollment_id UUID REFERENCES public.course_enrollments ON DELETE CASCADE,
  stripe_payment_intent_id TEXT,
  amount INTEGER NOT NULL, -- in pence
  deposit_amount INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'GBP',
  status payment_status DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT payment_has_source CHECK (
    (appointment_id IS NOT NULL AND course_enrollment_id IS NULL) OR 
    (appointment_id IS NULL AND course_enrollment_id IS NOT NULL)
  )
);

-- Create missing documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type document_type NOT NULL,
  client_id UUID REFERENCES public.clients ON DELETE CASCADE,
  student_id UUID REFERENCES public.students ON DELETE CASCADE,
  template_id UUID REFERENCES public.templates ON DELETE RESTRICT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  pdf_url TEXT,
  status document_status DEFAULT 'draft',
  signed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT document_has_recipient CHECK (
    (client_id IS NOT NULL AND student_id IS NULL) OR 
    (client_id IS NULL AND student_id IS NOT NULL)
  )
);

-- Create missing audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Add missing RLS policies
CREATE POLICY "Anyone can view active courses" ON public.courses
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Owner can manage courses" ON public.courses
  FOR ALL USING (public.is_owner());

CREATE POLICY "Students can view own enrollments" ON public.course_enrollments
  FOR SELECT USING (
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
  );

CREATE POLICY "Owner can manage all enrollments" ON public.course_enrollments
  FOR ALL USING (public.is_owner());

CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (
    (appointment_id IN (
      SELECT a.id FROM public.appointments a
      JOIN public.clients c ON a.client_id = c.id
      WHERE c.user_id = auth.uid()
    )) OR
    (course_enrollment_id IN (
      SELECT e.id FROM public.course_enrollments e
      JOIN public.students s ON e.student_id = s.id
      WHERE s.user_id = auth.uid()
    ))
  );

CREATE POLICY "Owner can manage all payments" ON public.payments
  FOR ALL USING (public.is_owner());

-- Add indexes for the new tables
CREATE INDEX IF NOT EXISTS idx_payments_appointment_id ON public.payments(appointment_id);
CREATE INDEX IF NOT EXISTS idx_payments_course_enrollment_id ON public.payments(course_enrollment_id);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON public.documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_student_id ON public.documents(student_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_student_id ON public.course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON public.course_enrollments(course_id);

-- Add update triggers for new tables (drop first to avoid conflicts)
DROP TRIGGER IF EXISTS update_courses_updated_at ON public.courses;
CREATE TRIGGER update_courses_updated_at 
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_course_enrollments_updated_at ON public.course_enrollments;
CREATE TRIGGER update_course_enrollments_updated_at 
  BEFORE UPDATE ON public.course_enrollments
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Insert sample data for new tables
INSERT INTO public.courses (title, slug, description, price, duration_hours, curriculum)
VALUES 
  ('Level 2 Anatomy & Physiology', 'level-2-anatomy-physiology', 'Foundation course covering human anatomy and physiology for aesthetic practitioners', 50000, 40, '{"modules": ["Basic Anatomy", "Facial Anatomy", "Skin Physiology", "Safety Protocols"]}'),
  ('Level 3 Injectable Treatments', 'level-3-injectable-treatments', 'Advanced training in botox and dermal filler techniques', 150000, 60, '{"modules": ["Product Knowledge", "Injection Techniques", "Complication Management", "Patient Assessment"]}'),
  ('Level 4 Advanced Aesthetics', 'level-4-advanced-aesthetics', 'Master level training for experienced practitioners', 250000, 80, '{"modules": ["Advanced Techniques", "Business Development", "Mentorship Skills", "Research Methods"]}')
ON CONFLICT (slug) DO NOTHING;

-- Add business settings if missing
INSERT INTO public.business_settings (id, business_name, owner_name, email)
VALUES ('business_settings', 'LEA Aesthetics Academy', 'Business Owner', 'contact@leaaesthetics.com')
ON CONFLICT (id) DO NOTHING;

-- Add sample services if missing
INSERT INTO public.services (name, slug, description, base_price, duration_minutes, category, settings)
VALUES 
  ('Botox Consultation', 'botox-consultation', 'Professional consultation for botox treatments', 5000, 30, 'consultation', '{"requiresConsultation": false}'),
  ('Dermal Filler Treatment', 'dermal-filler', 'Premium dermal filler application', 35000, 60, 'treatment', '{"requiresConsultation": true}'),
  ('Skin Assessment', 'skin-assessment', 'Comprehensive skin analysis and treatment planning', 7500, 45, 'consultation', '{}')
ON CONFLICT (slug) DO NOTHING;

-- Verification query
SELECT 'Missing tables fix completed!' as result, NOW() as completed_at;
