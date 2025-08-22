-- ==========================================
-- ALTERNATIVE RLS APPROACH - NO AUTH SCHEMA FUNCTIONS
-- This approach works without needing auth schema access
-- ==========================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;

-- ==========================================
-- USERS TABLE POLICIES (SIMPLIFIED)
-- ==========================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Admins can view all users (check role directly)
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    auth.uid() = id OR 
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'
  );

-- Admins can update all users
CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (
    auth.uid() = id OR 
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'
  );

-- Admins can delete users
CREATE POLICY "Admins can delete users" ON public.users
  FOR DELETE USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'
  );

-- ==========================================
-- CLIENTS TABLE POLICIES (SIMPLIFIED)
-- ==========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Clients can view own profile" ON public.clients;
DROP POLICY IF EXISTS "Clients can update own profile" ON public.clients;
DROP POLICY IF EXISTS "Admins can view all clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can manage all clients" ON public.clients;

-- Clients can view their own profile
CREATE POLICY "Clients can view own profile" ON public.clients
  FOR SELECT USING (user_id = auth.uid());

-- Clients can update their own profile
CREATE POLICY "Clients can update own profile" ON public.clients
  FOR UPDATE USING (user_id = auth.uid());

-- Admins can view all clients
CREATE POLICY "Admins can view all clients" ON public.clients
  FOR SELECT USING (
    user_id = auth.uid() OR 
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'
  );

-- Admins can manage all clients
CREATE POLICY "Admins can manage all clients" ON public.clients
  FOR ALL USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'
  );

-- ==========================================
-- STUDENTS TABLE POLICIES (SIMPLIFIED)
-- ==========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Students can view own profile" ON public.students;
DROP POLICY IF EXISTS "Students can update own profile" ON public.students;
DROP POLICY IF EXISTS "Admins can view all students" ON public.students;
DROP POLICY IF EXISTS "Admins can manage all students" ON public.students;

-- Students can view their own profile
CREATE POLICY "Students can view own profile" ON public.students
  FOR SELECT USING (user_id = auth.uid());

-- Students can update their own profile
CREATE POLICY "Students can update own profile" ON public.students
  FOR UPDATE USING (user_id = auth.uid());

-- Admins can view all students
CREATE POLICY "Admins can view all students" ON public.students
  FOR SELECT USING (
    user_id = auth.uid() OR 
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'
  );

-- Admins can manage all students
CREATE POLICY "Admins can manage all students" ON public.students
  FOR ALL USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'
  );

-- ==========================================
-- OTHER TABLE POLICIES (SIMPLIFIED)
-- ==========================================

-- Services
DROP POLICY IF EXISTS "Anyone can view active services" ON public.services;
DROP POLICY IF EXISTS "Admins can manage services" ON public.services;

CREATE POLICY "Anyone can view active services" ON public.services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage services" ON public.services
  FOR ALL USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'
  );

-- Courses
DROP POLICY IF EXISTS "Anyone can view published courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;

CREATE POLICY "Anyone can view published courses" ON public.courses
  FOR SELECT USING (is_published = true AND is_active = true);

CREATE POLICY "Admins can manage courses" ON public.courses
  FOR ALL USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'
  );

-- Modules
DROP POLICY IF EXISTS "Students can view modules for enrolled courses" ON public.modules;
DROP POLICY IF EXISTS "Admins can manage modules" ON public.modules;

CREATE POLICY "Students can view modules for enrolled courses" ON public.modules
  FOR SELECT USING (
    course_id IN (
      SELECT e.course_id 
      FROM public.enrollments e 
      WHERE e.user_id = auth.uid()
    ) OR 
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'
  );

CREATE POLICY "Admins can manage modules" ON public.modules
  FOR ALL USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'
  );

-- Lessons
DROP POLICY IF EXISTS "Students can view lessons for enrolled courses" ON public.lessons;
DROP POLICY IF EXISTS "Admins can manage lessons" ON public.lessons;

CREATE POLICY "Students can view lessons for enrolled courses" ON public.lessons
  FOR SELECT USING (
    module_id IN (
      SELECT m.id 
      FROM public.modules m
      JOIN public.enrollments e ON m.course_id = e.course_id
      WHERE e.user_id = auth.uid()
    ) OR 
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'
  );

CREATE POLICY "Admins can manage lessons" ON public.lessons
  FOR ALL USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'
  );

-- Assessments
DROP POLICY IF EXISTS "Students can view assessments for enrolled courses" ON public.assessments;
DROP POLICY IF EXISTS "Admins can manage assessments" ON public.assessments;

CREATE POLICY "Students can view assessments for enrolled courses" ON public.assessments
  FOR SELECT USING (
    (module_id IN (
      SELECT m.id 
      FROM public.modules m
      JOIN public.enrollments e ON m.course_id = e.course_id
      WHERE e.user_id = auth.uid()
    ) OR 
    course_id IN (
      SELECT e.course_id 
      FROM public.enrollments e 
      WHERE e.user_id = auth.uid()
    )) OR 
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'
  );

CREATE POLICY "Admins can manage assessments" ON public.assessments
  FOR ALL USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'
  );

-- Enrollments
DROP POLICY IF EXISTS "Students can view own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Admins can manage enrollments" ON public.enrollments;

CREATE POLICY "Students can view own enrollments" ON public.enrollments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage enrollments" ON public.enrollments
  FOR ALL USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'
  );
