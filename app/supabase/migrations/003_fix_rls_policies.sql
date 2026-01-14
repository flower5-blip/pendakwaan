-- Fix RLS policies to allow all authenticated users to manage data
-- Run this in Supabase SQL Editor

-- Allow ALL authenticated users to insert employers (for easier testing)
DROP POLICY IF EXISTS "IO and Admin can create employers" ON employers;
CREATE POLICY "Authenticated can create employers" ON employers
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow ALL authenticated users to update employers
DROP POLICY IF EXISTS "IO and Admin can update employers" ON employers;
CREATE POLICY "Authenticated can update employers" ON employers
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Allow ALL authenticated users to view/create cases
DROP POLICY IF EXISTS "IO can view assigned cases" ON cases;
CREATE POLICY "Authenticated can view cases" ON cases
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "IO and Admin can create cases" ON cases;
CREATE POLICY "Authenticated can create cases" ON cases
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "IO can update own cases" ON cases;
CREATE POLICY "Authenticated can update cases" ON cases
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Also allow profile creation without checking role
DROP POLICY IF EXISTS "Allow profile creation" ON profiles;
CREATE POLICY "Allow profile creation" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to view all profiles (for display purposes)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Authenticated can view profiles" ON profiles
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Verify the policies exist
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';
