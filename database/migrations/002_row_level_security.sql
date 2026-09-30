-- ============================================================
-- MediQueue - Phase 5: Row Level Security (RLS) Policies
-- Migration: 002_row_level_security.sql
-- ============================================================

-- ============================================================
-- 0. HELPER FUNCTIONS FOR CLEAN, HIGH-PERFORMANCE POLICIES
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS VARCHAR AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_auth_clinic_id()
RETURNS UUID AS $$
  SELECT clinic_id FROM (
    SELECT clinic_id FROM public.doctors WHERE user_id = auth.uid()
    UNION ALL
    SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()
  ) c LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_auth_patient_id()
RETURNS UUID AS $$
  SELECT id FROM public.patients WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- ============================================================
-- 1. CLINICS TABLE RLS
-- ============================================================
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to clinics" ON public.clinics;
CREATE POLICY "Allow public read access to clinics"
ON public.clinics FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow admin manage clinics" ON public.clinics;
CREATE POLICY "Allow admin manage clinics"
ON public.clinics FOR ALL
TO authenticated
USING (public.get_auth_role() = 'admin')
WITH CHECK (public.get_auth_role() = 'admin');


-- ============================================================
-- 2. USERS TABLE RLS
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile or staff view" ON public.users;
CREATE POLICY "Users can read own profile or staff view"
ON public.users FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR
  public.get_auth_role() IN ('doctor', 'receptionist', 'admin')
);

DROP POLICY IF EXISTS "Users insert own profile" ON public.users;
CREATE POLICY "Users insert own profile"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (
  (auth.uid() = id AND role = 'patient') OR
  public.get_auth_role() = 'admin'
);

-- Users can update full_name but CANNOT change role (Privilege Escalation Protection)
DROP POLICY IF EXISTS "Users update own profile without role change" ON public.users;
CREATE POLICY "Users update own profile without role change"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id OR public.get_auth_role() = 'admin')
WITH CHECK (
  (auth.uid() = id AND role = (SELECT role FROM public.users WHERE id = auth.uid())) OR
  public.get_auth_role() = 'admin'
);


-- ============================================================
-- 3. PATIENTS TABLE RLS
-- ============================================================
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Patients read own record or staff read" ON public.patients;
CREATE POLICY "Patients read own record or staff read"
ON public.patients FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  public.get_auth_role() IN ('doctor', 'receptionist', 'admin')
);

DROP POLICY IF EXISTS "Patients or staff insert patient records" ON public.patients;
CREATE POLICY "Patients or staff insert patient records"
ON public.patients FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() OR
  public.get_auth_role() IN ('receptionist', 'admin')
);

DROP POLICY IF EXISTS "Patients or staff update patient records" ON public.patients;
CREATE POLICY "Patients or staff update patient records"
ON public.patients FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() OR
  public.get_auth_role() IN ('receptionist', 'admin')
);


-- ============================================================
-- 4. DOCTORS TABLE RLS
-- ============================================================
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to doctors" ON public.doctors;
CREATE POLICY "Allow public read access to doctors"
ON public.doctors FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Doctor updates own status or admin manage" ON public.doctors;
CREATE POLICY "Doctor updates own status or admin manage"
ON public.doctors FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() OR
  public.get_auth_role() = 'admin'
);


-- ============================================================
-- 5. STAFF TABLE RLS
-- ============================================================
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff reads own record or admin read" ON public.staff;
CREATE POLICY "Staff reads own record or admin read"
ON public.staff FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  public.get_auth_role() = 'admin'
);


-- ============================================================
-- 6. APPOINTMENTS TABLE RLS
-- ============================================================
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Appointments select policy" ON public.appointments;
CREATE POLICY "Appointments select policy"
ON public.appointments FOR SELECT
TO authenticated
USING (
  patient_id = public.get_auth_patient_id() OR
  clinic_id = public.get_auth_clinic_id() OR
  public.get_auth_role() = 'admin'
);

DROP POLICY IF EXISTS "Appointments insert policy" ON public.appointments;
CREATE POLICY "Appointments insert policy"
ON public.appointments FOR INSERT
TO authenticated
WITH CHECK (
  (patient_id = public.get_auth_patient_id() AND clinic_id IS NOT NULL) OR
  public.get_auth_role() IN ('receptionist', 'admin')
);

DROP POLICY IF EXISTS "Appointments update policy" ON public.appointments;
CREATE POLICY "Appointments update policy"
ON public.appointments FOR UPDATE
TO authenticated
USING (
  patient_id = public.get_auth_patient_id() OR
  clinic_id = public.get_auth_clinic_id() OR
  public.get_auth_role() = 'admin'
);


-- ============================================================
-- 7. QUEUE ENTRIES TABLE RLS
-- ============================================================
ALTER TABLE public.queue_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Queue entries select policy" ON public.queue_entries;
CREATE POLICY "Queue entries select policy"
ON public.queue_entries FOR SELECT
TO authenticated
USING (
  patient_id = public.get_auth_patient_id() OR
  clinic_id = public.get_auth_clinic_id() OR
  public.get_auth_role() = 'admin'
);

DROP POLICY IF EXISTS "Queue entries insert policy" ON public.queue_entries;
CREATE POLICY "Queue entries insert policy"
ON public.queue_entries FOR INSERT
TO authenticated
WITH CHECK (
  patient_id = public.get_auth_patient_id() OR
  (clinic_id = public.get_auth_clinic_id() AND public.get_auth_role() IN ('receptionist', 'doctor', 'admin'))
);

DROP POLICY IF EXISTS "Queue entries update policy" ON public.queue_entries;
CREATE POLICY "Queue entries update policy"
ON public.queue_entries FOR UPDATE
TO authenticated
USING (
  clinic_id = public.get_auth_clinic_id() OR
  public.get_auth_role() = 'admin'
);


-- ============================================================
-- 8. CONSULTATIONS TABLE RLS
-- ============================================================
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Consultations select policy" ON public.consultations;
CREATE POLICY "Consultations select policy"
ON public.consultations FOR SELECT
TO authenticated
USING (
  patient_id = public.get_auth_patient_id() OR
  doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()) OR
  public.get_auth_role() = 'admin'
);

DROP POLICY IF EXISTS "Consultations insert policy" ON public.consultations;
CREATE POLICY "Consultations insert policy"
ON public.consultations FOR INSERT
TO authenticated
WITH CHECK (
  doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()) OR
  public.get_auth_role() = 'admin'
);


-- ============================================================
-- 9. NOTIFICATIONS TABLE RLS
-- ============================================================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Notifications select policy" ON public.notifications;
CREATE POLICY "Notifications select policy"
ON public.notifications FOR SELECT
TO authenticated
USING (
  patient_id = public.get_auth_patient_id() OR
  public.get_auth_role() = 'admin'
);

DROP POLICY IF EXISTS "Notifications update policy" ON public.notifications;
CREATE POLICY "Notifications update policy"
ON public.notifications FOR UPDATE
TO authenticated
USING (
  patient_id = public.get_auth_patient_id() OR
  public.get_auth_role() = 'admin'
);
