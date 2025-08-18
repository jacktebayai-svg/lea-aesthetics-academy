-- ==========================================
-- ROW LEVEL SECURITY POLICIES
-- Secure data access based on user roles
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practitioners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practitioner_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- HELPER FUNCTIONS
-- ==========================================

-- Get current user's role
CREATE OR REPLACE FUNCTION auth.get_user_role()
RETURNS user_role AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM public.users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'ADMIN'
    FROM public.users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is client
CREATE OR REPLACE FUNCTION auth.is_client()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'CLIENT'
    FROM public.users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is student
CREATE OR REPLACE FUNCTION auth.is_student()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'STUDENT'
    FROM public.users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- USERS TABLE POLICIES
-- ==========================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (auth.is_admin());

-- Admins can update all users
CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (auth.is_admin());

-- Admins can delete users
CREATE POLICY "Admins can delete users" ON public.users
  FOR DELETE USING (auth.is_admin());

-- ==========================================
-- BUSINESS PROFILE POLICIES
-- ==========================================

-- Everyone can view business profile (public info)
CREATE POLICY "Everyone can view business profile" ON public.business_profile
  FOR SELECT USING (true);

-- Only admins can modify business profile
CREATE POLICY "Admins can modify business profile" ON public.business_profile
  FOR ALL USING (auth.is_admin());

-- ==========================================
-- CLIENTS TABLE POLICIES
-- ==========================================

-- Clients can view their own profile
CREATE POLICY "Clients can view own profile" ON public.clients
  FOR SELECT USING (user_id = auth.uid());

-- Clients can update their own profile
CREATE POLICY "Clients can update own profile" ON public.clients
  FOR UPDATE USING (user_id = auth.uid());

-- Admins can view all clients
CREATE POLICY "Admins can view all clients" ON public.clients
  FOR SELECT USING (auth.is_admin());

-- Admins can manage all clients
CREATE POLICY "Admins can manage all clients" ON public.clients
  FOR ALL USING (auth.is_admin());

-- ==========================================
-- STUDENTS TABLE POLICIES
-- ==========================================

-- Students can view their own profile
CREATE POLICY "Students can view own profile" ON public.students
  FOR SELECT USING (user_id = auth.uid());

-- Students can update their own profile
CREATE POLICY "Students can update own profile" ON public.students
  FOR UPDATE USING (user_id = auth.uid());

-- Admins can view all students
CREATE POLICY "Admins can view all students" ON public.students
  FOR SELECT USING (auth.is_admin());

-- Admins can manage all students
CREATE POLICY "Admins can manage all students" ON public.students
  FOR ALL USING (auth.is_admin());

-- ==========================================
-- MEDICAL HISTORIES POLICIES
-- ==========================================

-- Clients can view their own medical history
CREATE POLICY "Clients can view own medical history" ON public.medical_histories
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = auth.uid()
    )
  );

-- Admins can view all medical histories
CREATE POLICY "Admins can view all medical histories" ON public.medical_histories
  FOR SELECT USING (auth.is_admin());

-- Admins can manage all medical histories
CREATE POLICY "Admins can manage all medical histories" ON public.medical_histories
  FOR ALL USING (auth.is_admin());

-- ==========================================
-- SERVICES POLICIES
-- ==========================================

-- Everyone can view active services
CREATE POLICY "Everyone can view active services" ON public.services
  FOR SELECT USING (is_active = true);

-- Admins can manage all services
CREATE POLICY "Admins can manage all services" ON public.services
  FOR ALL USING (auth.is_admin());

-- ==========================================
-- PRACTITIONERS POLICIES
-- ==========================================

-- Everyone can view active practitioners
CREATE POLICY "Everyone can view active practitioners" ON public.practitioners
  FOR SELECT USING (is_active = true);

-- Practitioners can view their own profile
CREATE POLICY "Practitioners can view own profile" ON public.practitioners
  FOR SELECT USING (user_id = auth.uid());

-- Practitioners can update their own profile
CREATE POLICY "Practitioners can update own profile" ON public.practitioners
  FOR UPDATE USING (user_id = auth.uid());

-- Admins can manage all practitioners
CREATE POLICY "Admins can manage all practitioners" ON public.practitioners
  FOR ALL USING (auth.is_admin());

-- ==========================================
-- APPOINTMENTS POLICIES
-- ==========================================

-- Clients can view their own appointments
CREATE POLICY "Clients can view own appointments" ON public.appointments
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = auth.uid()
    )
  );

-- Clients can create appointments for themselves
CREATE POLICY "Clients can create own appointments" ON public.appointments
  FOR INSERT WITH CHECK (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = auth.uid()
    )
  );

-- Practitioners can view their appointments
CREATE POLICY "Practitioners can view own appointments" ON public.appointments
  FOR SELECT USING (
    practitioner_id IN (
      SELECT id FROM public.practitioners WHERE user_id = auth.uid()
    )
  );

-- Admins can manage all appointments
CREATE POLICY "Admins can manage all appointments" ON public.appointments
  FOR ALL USING (auth.is_admin());

-- ==========================================
-- PAYMENTS POLICIES
-- ==========================================

-- Clients can view their own payments
CREATE POLICY "Clients can view own payments" ON public.payments
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = auth.uid()
    )
  );

-- Students can view their course payments
CREATE POLICY "Students can view own course payments" ON public.payments
  FOR SELECT USING (
    enrollment_id IN (
      SELECT id FROM public.enrollments WHERE user_id = auth.uid()
    )
  );

-- Admins can manage all payments
CREATE POLICY "Admins can manage all payments" ON public.payments
  FOR ALL USING (auth.is_admin());

-- ==========================================
-- DOCUMENTS POLICIES
-- ==========================================

-- Clients can view their own documents
CREATE POLICY "Clients can view own documents" ON public.documents
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = auth.uid()
    )
  );

-- Clients can sign their own documents
CREATE POLICY "Clients can sign own documents" ON public.documents
  FOR UPDATE USING (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = auth.uid()
    )
  );

-- Admins can manage all documents
CREATE POLICY "Admins can manage all documents" ON public.documents
  FOR ALL USING (auth.is_admin());

-- ==========================================
-- COURSE CONTENT POLICIES
-- ==========================================

-- Everyone can view published courses
CREATE POLICY "Everyone can view published courses" ON public.courses
  FOR SELECT USING (is_published = true AND is_active = true);

-- Admins can manage all courses
CREATE POLICY "Admins can manage all courses" ON public.courses
  FOR ALL USING (auth.is_admin());

-- Everyone can view modules of published courses
CREATE POLICY "Everyone can view published modules" ON public.modules
  FOR SELECT USING (
    course_id IN (
      SELECT id FROM public.courses 
      WHERE is_published = true AND is_active = true
    )
  );

-- Admins can manage all modules
CREATE POLICY "Admins can manage all modules" ON public.modules
  FOR ALL USING (auth.is_admin());

-- Everyone can view lessons of published courses
CREATE POLICY "Everyone can view published lessons" ON public.lessons
  FOR SELECT USING (
    module_id IN (
      SELECT m.id FROM public.modules m
      JOIN public.courses c ON m.course_id = c.id
      WHERE c.is_published = true AND c.is_active = true
    )
  );

-- Admins can manage all lessons
CREATE POLICY "Admins can manage all lessons" ON public.lessons
  FOR ALL USING (auth.is_admin());

-- ==========================================
-- ENROLLMENT POLICIES
-- ==========================================

-- Students can view their own enrollments
CREATE POLICY "Students can view own enrollments" ON public.enrollments
  FOR SELECT USING (user_id = auth.uid());

-- Students can enroll themselves
CREATE POLICY "Students can create own enrollments" ON public.enrollments
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Students can update their own enrollments
CREATE POLICY "Students can update own enrollments" ON public.enrollments
  FOR UPDATE USING (user_id = auth.uid());

-- Admins can manage all enrollments
CREATE POLICY "Admins can manage all enrollments" ON public.enrollments
  FOR ALL USING (auth.is_admin());

-- ==========================================
-- LESSON PROGRESS POLICIES
-- ==========================================

-- Students can view their own progress
CREATE POLICY "Students can view own progress" ON public.lesson_progress
  FOR SELECT USING (
    enrollment_id IN (
      SELECT id FROM public.enrollments WHERE user_id = auth.uid()
    )
  );

-- Students can update their own progress
CREATE POLICY "Students can update own progress" ON public.lesson_progress
  FOR ALL USING (
    enrollment_id IN (
      SELECT id FROM public.enrollments WHERE user_id = auth.uid()
    )
  );

-- Admins can view all progress
CREATE POLICY "Admins can view all progress" ON public.lesson_progress
  FOR SELECT USING (auth.is_admin());

-- ==========================================
-- ASSESSMENT POLICIES
-- ==========================================

-- Students can view assessments for enrolled courses
CREATE POLICY "Students can view enrolled assessments" ON public.assessments
  FOR SELECT USING (
    module_id IN (
      SELECT m.id FROM public.modules m
      JOIN public.courses c ON m.course_id = c.id
      JOIN public.enrollments e ON c.id = e.course_id
      WHERE e.user_id = auth.uid()
    )
  );

-- Admins can manage all assessments
CREATE POLICY "Admins can manage all assessments" ON public.assessments
  FOR ALL USING (auth.is_admin());

-- Students can view their own attempts
CREATE POLICY "Students can view own attempts" ON public.assessment_attempts
  FOR SELECT USING (user_id = auth.uid());

-- Students can create their own attempts
CREATE POLICY "Students can create own attempts" ON public.assessment_attempts
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can view all attempts
CREATE POLICY "Admins can view all attempts" ON public.assessment_attempts
  FOR SELECT USING (auth.is_admin());

-- ==========================================
-- CERTIFICATES POLICIES
-- ==========================================

-- Students can view their own certificates
CREATE POLICY "Students can view own certificates" ON public.certificates
  FOR SELECT USING (user_id = auth.uid());

-- Admins can manage all certificates
CREATE POLICY "Admins can manage all certificates" ON public.certificates
  FOR ALL USING (auth.is_admin());

-- ==========================================
-- FILES POLICIES
-- ==========================================

-- Users can view files they uploaded
CREATE POLICY "Users can view own files" ON public.files
  FOR SELECT USING (uploaded_by = auth.uid());

-- Users can view public files
CREATE POLICY "Users can view public files" ON public.files
  FOR SELECT USING (is_public = true);

-- Users can upload files
CREATE POLICY "Users can upload files" ON public.files
  FOR INSERT WITH CHECK (uploaded_by = auth.uid());

-- Admins can manage all files
CREATE POLICY "Admins can manage all files" ON public.files
  FOR ALL USING (auth.is_admin());

-- ==========================================
-- MESSAGING POLICIES
-- ==========================================

-- Users can view messages they sent or received
CREATE POLICY "Users can view own messages" ON public.messages
  FOR SELECT USING (
    sender_id = auth.uid() OR receiver_id = auth.uid()
  );

-- Users can send messages
CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Admins can manage all messages
CREATE POLICY "Admins can manage all messages" ON public.messages
  FOR ALL USING (auth.is_admin());

-- ==========================================
-- AUDIT LOGS POLICIES
-- ==========================================

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (auth.is_admin());

-- System can insert audit logs (service role)
CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- ==========================================
-- FUNCTION TO CREATE USER PROFILE ON SIGNUP
-- ==========================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.users table
  INSERT INTO public.users (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'CLIENT')::user_role
  );
  
  -- Create role-specific profile
  IF (NEW.raw_user_meta_data->>'role') = 'CLIENT' THEN
    INSERT INTO public.clients (
      user_id, 
      first_name, 
      last_name, 
      email
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      NEW.email
    );
  ELSIF (NEW.raw_user_meta_data->>'role') = 'STUDENT' THEN
    INSERT INTO public.students (
      user_id,
      student_number,
      first_name,
      last_name,
      email
    ) VALUES (
      NEW.id,
      'STU' || EXTRACT(YEAR FROM NOW()) || LPAD(EXTRACT(DOY FROM NOW())::TEXT, 3, '0') || SUBSTR(NEW.id::TEXT, 1, 4),
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      NEW.email
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
