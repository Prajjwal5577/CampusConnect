-- ============================================
-- CRITICAL SECURITY FIXES & ENHANCED SCHEMA
-- ============================================

-- 1. Create user_roles table (SECURITY: roles must be separate from profiles)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 3. Helper function to check if user has any admin/faculty role
CREATE OR REPLACE FUNCTION public.is_admin_or_faculty(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'faculty')
  )
$$;

-- 4. New Tables for Enhanced Features

-- Course Enrollments (student-course mapping)
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'dropped', 'completed')),
  UNIQUE(student_id, course_id)
);

ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

-- Course Faculty Assignments
CREATE TABLE IF NOT EXISTS public.course_faculty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  faculty_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, faculty_id)
);

ALTER TABLE public.course_faculty ENABLE ROW LEVEL SECURITY;

-- Course Resources/Materials
CREATE TABLE IF NOT EXISTS public.course_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  resource_type TEXT DEFAULT 'document',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.course_resources ENABLE ROW LEVEL SECURITY;

-- Event Registrations
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- System Analytics
CREATE TABLE IF NOT EXISTS public.system_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value JSONB,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.system_analytics ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES (using security definer functions)
-- ============================================

-- User Roles Policies
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Course Enrollments Policies
CREATE POLICY "Students view own enrollments" ON public.course_enrollments
  FOR SELECT USING (
    student_id = auth.uid() OR 
    public.is_admin_or_faculty(auth.uid())
  );

CREATE POLICY "Faculty and admin manage enrollments" ON public.course_enrollments
  FOR ALL USING (public.is_admin_or_faculty(auth.uid()));

-- Course Faculty Policies
CREATE POLICY "Everyone can view course faculty" ON public.course_faculty
  FOR SELECT USING (true);

CREATE POLICY "Admins manage course faculty" ON public.course_faculty
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Course Resources Policies
CREATE POLICY "Enrolled students view resources" ON public.course_resources
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.course_enrollments 
      WHERE course_id = course_resources.course_id 
      AND student_id = auth.uid()
    ) OR public.is_admin_or_faculty(auth.uid())
  );

CREATE POLICY "Faculty upload resources" ON public.course_resources
  FOR INSERT WITH CHECK (public.is_admin_or_faculty(auth.uid()));

CREATE POLICY "Faculty manage own resources" ON public.course_resources
  FOR ALL USING (uploaded_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Event Registrations Policies
CREATE POLICY "Users view own registrations" ON public.event_registrations
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_or_faculty(auth.uid()));

CREATE POLICY "Users register for events" ON public.event_registrations
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users cancel own registrations" ON public.event_registrations
  FOR UPDATE USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users delete own registrations" ON public.event_registrations
  FOR DELETE USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- System Analytics Policies
CREATE POLICY "Admins view analytics" ON public.system_analytics
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System creates analytics" ON public.system_analytics
  FOR INSERT WITH CHECK (true);

-- ============================================
-- FIX EXISTING TABLES - ADD MISSING POLICIES
-- ============================================

-- Courses - Add management policies
DROP POLICY IF EXISTS "Everyone can view courses" ON public.courses;
CREATE POLICY "Everyone can view courses" ON public.courses
  FOR SELECT USING (true);

CREATE POLICY "Admin and faculty manage courses" ON public.courses
  FOR INSERT WITH CHECK (public.is_admin_or_faculty(auth.uid()));

CREATE POLICY "Admin and faculty update courses" ON public.courses
  FOR UPDATE USING (public.is_admin_or_faculty(auth.uid()));

CREATE POLICY "Admins delete courses" ON public.courses
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Attendance - Add update/delete policies
CREATE POLICY "Faculty update attendance" ON public.attendance
  FOR UPDATE USING (public.is_admin_or_faculty(auth.uid()));

CREATE POLICY "Faculty delete attendance" ON public.attendance
  FOR DELETE USING (public.is_admin_or_faculty(auth.uid()));

-- Events - Add update/delete policies
CREATE POLICY "Organizers update events" ON public.events
  FOR UPDATE USING (
    organizer_id = auth.uid() OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Organizers delete events" ON public.events
  FOR DELETE USING (
    organizer_id = auth.uid() OR 
    public.has_role(auth.uid(), 'admin')
  );

-- Notices - Add update/delete policies
CREATE POLICY "Authors update notices" ON public.notices
  FOR UPDATE USING (
    author_id = auth.uid() OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Authors delete notices" ON public.notices
  FOR DELETE USING (
    author_id = auth.uid() OR 
    public.has_role(auth.uid(), 'admin')
  );

-- Assignments - Add update/delete policies
CREATE POLICY "Faculty update assignments" ON public.assignments
  FOR UPDATE USING (
    created_by = auth.uid() OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Faculty delete assignments" ON public.assignments
  FOR DELETE USING (
    created_by = auth.uid() OR 
    public.has_role(auth.uid(), 'admin')
  );

-- Submissions - Add update/delete policies
CREATE POLICY "Students update own submissions" ON public.submissions
  FOR UPDATE USING (
    student_id = auth.uid() OR 
    public.is_admin_or_faculty(auth.uid())
  );

CREATE POLICY "Students delete own submissions" ON public.submissions
  FOR DELETE USING (
    student_id = auth.uid() OR 
    public.has_role(auth.uid(), 'admin')
  );

-- Profiles - Fix privacy issue (students can only see own profile)
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users view profiles based on role" ON public.profiles
  FOR SELECT USING (
    id = auth.uid() OR 
    public.is_admin_or_faculty(auth.uid())
  );

-- ============================================
-- TRIGGER TO AUTO-ASSIGN STUDENT ROLE ON SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Auto-assign 'student' role to new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  RETURN NEW;
END;
$$;

-- Drop old trigger if exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();