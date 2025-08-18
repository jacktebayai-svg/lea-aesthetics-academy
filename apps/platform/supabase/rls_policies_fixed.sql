-- ==========================================
-- ROW LEVEL SECURITY POLICIES (FIXED)
-- Secure data access based on user roles
-- ==========================================

-- ==========================================
-- HELPER FUNCTIONS (in public schema)
-- ==========================================

-- Get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
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
CREATE OR REPLACE FUNCTION public.is_admin()
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
CREATE OR REPLACE FUNCTION public.is_client()
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
CREATE OR REPLACE FUNCTION public.is_student()
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
-- DROP EXISTING POLICIES (if any)
-- ==========================================

-- Users table
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;

-- Business profile
DROP POLICY IF EXISTS "Everyone can view business profile" ON public.business_profile;
DROP POLICY IF EXISTS "Admins can modify business profile" ON public.business_profile;

-- Clients
DROP POLICY IF EXISTS "Clients can view own profile" ON public.clients;
DROP POLICY IF EXISTS "Clients can update own profile" ON public.clients;
DROP POLICY IF EXISTS "Admins can view all clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can manage all clients" ON public.clients;

-- Students
DROP POLICY IF EXISTS "Students can view own profile" ON public.students;
DROP POLICY IF EXISTS "Students can update own profile" ON public.students;
DROP POLICY IF EXISTS "Admins can view all students" ON public.students;
DROP POLICY IF EXISTS "Admins can manage all students" ON public.students;

-- Services
DROP POLICY IF EXISTS "Everyone can view active services" ON public.services;
DROP POLICY IF EXISTS "Admins can manage all services" ON public.services;

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
  FOR SELECT USING (public.is_admin());

-- Admins can update all users
CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (public.is_admin());

-- Admins can delete users
CREATE POLICY "Admins can delete users" ON public.users
  FOR DELETE USING (public.is_admin());

-- ==========================================
-- BUSINESS PROFILE POLICIES
-- ==========================================

-- Everyone can view business profile (public info)
CREATE POLICY "Everyone can view business profile" ON public.business_profile
  FOR SELECT USING (true);

-- Only admins can modify business profile
CREATE POLICY "Admins can modify business profile" ON public.business_profile
  FOR ALL USING (public.is_admin());

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
  FOR SELECT USING (public.is_admin());

-- Admins can manage all clients
CREATE POLICY "Admins can manage all clients" ON public.clients
  FOR ALL USING (public.is_admin());

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
  FOR SELECT USING (public.is_admin());

-- Admins can manage all students
CREATE POLICY "Admins can manage all students" ON public.students
  FOR ALL USING (public.is_admin());

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
  FOR SELECT USING (public.is_admin());

-- Admins can manage all medical histories
CREATE POLICY "Admins can manage all medical histories" ON public.medical_histories
  FOR ALL USING (public.is_admin());

-- ==========================================
-- SERVICES POLICIES
-- ==========================================

-- Everyone can view active services
CREATE POLICY "Everyone can view active services" ON public.services
  FOR SELECT USING (is_active = true);

-- Admins can manage all services
CREATE POLICY "Admins can manage all services" ON public.services
  FOR ALL USING (public.is_admin());

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
  FOR ALL USING (public.is_admin());

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
  FOR ALL USING (public.is_admin());

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
  FOR ALL USING (public.is_admin());

-- ==========================================
-- COURSES AND LEARNING POLICIES
-- ==========================================

-- Everyone can view published courses
CREATE POLICY "Everyone can view published courses" ON public.courses
  FOR SELECT USING (is_published = true AND is_active = true);

-- Admins can manage all courses
CREATE POLICY "Admins can manage all courses" ON public.courses
  FOR ALL USING (public.is_admin());

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
  FOR ALL USING (public.is_admin());

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
  FOR ALL USING (public.is_admin());

-- ==========================================
-- AUDIT LOGS POLICIES
-- ==========================================

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (public.is_admin());

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);
