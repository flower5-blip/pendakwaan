-- FIX SUPABASE 500 ERROR
-- Run this in Supabase SQL Editor to fix RLS recursion issues

-- =====================================================
-- STEP 1: DROP ALL EXISTING POLICIES
-- =====================================================

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can manage profiles" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON profiles;
DROP POLICY IF EXISTS "Authenticated can view profiles" ON profiles;

-- Employers policies
DROP POLICY IF EXISTS "Authenticated users can view employers" ON employers;
DROP POLICY IF EXISTS "IO and Admin can create employers" ON employers;
DROP POLICY IF EXISTS "IO and Admin can update employers" ON employers;
DROP POLICY IF EXISTS "Admin can delete employers" ON employers;
DROP POLICY IF EXISTS "Authenticated can create employers" ON employers;
DROP POLICY IF EXISTS "Authenticated can update employers" ON employers;

-- Cases policies
DROP POLICY IF EXISTS "IO can view assigned cases" ON cases;
DROP POLICY IF EXISTS "IO and Admin can create cases" ON cases;
DROP POLICY IF EXISTS "IO can update own cases" ON cases;
DROP POLICY IF EXISTS "Admin can delete cases" ON cases;
DROP POLICY IF EXISTS "Authenticated can view cases" ON cases;
DROP POLICY IF EXISTS "Authenticated can create cases" ON cases;
DROP POLICY IF EXISTS "Authenticated can update cases" ON cases;

-- =====================================================
-- STEP 2: CREATE SIMPLE POLICIES (NO RECURSION)
-- =====================================================

-- PROFILES: Simple policies without recursion
CREATE POLICY "profiles_select" ON profiles
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "profiles_insert" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- EMPLOYERS: All authenticated can do everything
CREATE POLICY "employers_select" ON employers
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "employers_insert" ON employers
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "employers_update" ON employers
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "employers_delete" ON employers
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- CASES: All authenticated can do everything
CREATE POLICY "cases_select" ON cases
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "cases_insert" ON cases
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "cases_update" ON cases
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "cases_delete" ON cases
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- =====================================================
-- STEP 3: VERIFY
-- =====================================================
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';
