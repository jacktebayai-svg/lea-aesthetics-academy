-- ==========================================
-- SIMPLE RLS POLICIES - NO CONFLICTS
-- This version avoids all function conflicts
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- CLEAN UP ALL EXISTING POLICIES AND FUNCTIONS
-- ==========================================

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;

DROP POLICY IF EXISTS "Clients can view own profile" ON public.clients;
DROP POLICY IF EXISTS "Clients can update own profile" ON public.clients;
DROP POLICY IF EXISTS "Admins can view all clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can manage all clients" ON public.clients;

DROP POLICY IF EXISTS "Students can view own profile" ON public.students;
DROP POLICY IF EXISTS "Students can update own profile" ON public.students;
DROP POLICY IF EXISTS "Admins can view all students" ON public.students;
DROP POLICY IF EXISTS "Admins can manage all students" ON public.students;

-- Drop ALL existing functions (including any with wrong return types)
DROP FUNCTION IF EXISTS auth.get_user_role();
DROP FUNCTION IF EXISTS auth.is_admin();
DROP FUNCTION IF EXISTS auth.is_client();
DROP FUNCTION IF EXISTS auth.is_student();
DROP FUNCTION IF EXISTS public.get_user_role();
DROP FUNCTION IF EXISTS public.is_admin();

-- ==========================================
-- SIMPLE HELPER FUNCTIONS (NO CUSTOM TYPES)
-- ==========================================

-- Simple function to check if current user is admin
CREATE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT CASE 
      WHEN role = 'ADMIN' THEN TRUE 
      ELSE FALSE 
    END
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
