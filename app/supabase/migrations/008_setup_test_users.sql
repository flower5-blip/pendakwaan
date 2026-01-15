-- ============================================
-- PERKESO Prosecution System
-- Migration 008: Setup Test Users
-- ============================================
-- Setup test users dengan roles untuk testing
-- ============================================

-- ============================================
-- INSTRUCTIONS:
-- ============================================
-- 1. SEBELUM run SQL ini, create users di Supabase Dashboard:
--    - Go to Authentication → Users → Add User
--    - Create 5 users dengan email berikut:
--      * io@test.com (Password: Test123!)
--      * po@test.com (Password: Test123!)
--      * uip@test.com (Password: Test123!)
--      * admin@test.com (Password: Test123!)
--      * viewer@test.com (Password: Test123!)
--
-- 2. SELEPAS create users, run SQL ini untuk assign roles
-- ============================================

-- ============================================
-- 1. CREATE/UPDATE PROFILES FOR TEST USERS
-- ============================================

-- IO User (Pegawai Penyiasat)
INSERT INTO profiles (id, full_name, role, department, phone, created_at, updated_at)
SELECT 
    u.id,
    'Test IO User',
    'io'::user_role,
    'Unit Siasatan',
    '0123456789',
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'io@test.com'
ON CONFLICT (id) 
DO UPDATE SET
    full_name = 'Test IO User',
    role = 'io'::user_role,
    department = 'Unit Siasatan',
    phone = '0123456789',
    updated_at = NOW();

-- PO User (Pegawai Pendakwa)
INSERT INTO profiles (id, full_name, role, department, phone, created_at, updated_at)
SELECT 
    u.id,
    'Test PO User',
    'po'::user_role,
    'Unit Pendakwaan',
    '0123456790',
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'po@test.com'
ON CONFLICT (id) 
DO UPDATE SET
    full_name = 'Test PO User',
    role = 'po'::user_role,
    department = 'Unit Pendakwaan',
    phone = '0123456790',
    updated_at = NOW();

-- UIP User (Unit Integriti & Pendakwaan)
INSERT INTO profiles (id, full_name, role, department, phone, created_at, updated_at)
SELECT 
    u.id,
    'Test UIP User',
    'uip'::user_role,
    'Unit Integriti & Pendakwaan',
    '0123456791',
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'uip@test.com'
ON CONFLICT (id) 
DO UPDATE SET
    full_name = 'Test UIP User',
    role = 'uip'::user_role,
    department = 'Unit Integriti & Pendakwaan',
    phone = '0123456791',
    updated_at = NOW();

-- Admin User
INSERT INTO profiles (id, full_name, role, department, phone, created_at, updated_at)
SELECT 
    u.id,
    'Test Admin User',
    'admin'::user_role,
    'Pentadbiran',
    '0123456792',
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'admin@test.com'
ON CONFLICT (id) 
DO UPDATE SET
    full_name = 'Test Admin User',
    role = 'admin'::user_role,
    department = 'Pentadbiran',
    phone = '0123456792',
    updated_at = NOW();

-- Viewer User (Read-only)
INSERT INTO profiles (id, full_name, role, department, phone, created_at, updated_at)
SELECT 
    u.id,
    'Test Viewer User',
    'viewer'::user_role,
    'Unit Laporan',
    '0123456793',
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'viewer@test.com'
ON CONFLICT (id) 
DO UPDATE SET
    full_name = 'Test Viewer User',
    role = 'viewer'::user_role,
    department = 'Unit Laporan',
    phone = '0123456793',
    updated_at = NOW();

-- ============================================
-- 2. VERIFY SETUP
-- ============================================

-- Check all test users created
SELECT 
    u.email,
    p.full_name,
    p.role,
    p.department,
    CASE 
        WHEN p.id IS NULL THEN '❌ Profile NOT created'
        ELSE '✅ Profile created'
    END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email IN (
    'io@test.com',
    'po@test.com',
    'uip@test.com',
    'admin@test.com',
    'viewer@test.com'
)
ORDER BY 
    CASE p.role
        WHEN 'admin' THEN 1
        WHEN 'io' THEN 2
        WHEN 'po' THEN 3
        WHEN 'uip' THEN 4
        WHEN 'viewer' THEN 5
    END;

-- ============================================
-- 3. SUMMARY
-- ============================================

DO $$
DECLARE
    total_users INTEGER;
    total_profiles INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_users
    FROM auth.users
    WHERE email IN (
        'io@test.com',
        'po@test.com',
        'uip@test.com',
        'admin@test.com',
        'viewer@test.com'
    );
    
    SELECT COUNT(*) INTO total_profiles
    FROM profiles p
    JOIN auth.users u ON p.id = u.id
    WHERE u.email IN (
        'io@test.com',
        'po@test.com',
        'uip@test.com',
        'admin@test.com',
        'viewer@test.com'
    );
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'TEST USERS SETUP SUMMARY';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total Users in auth.users: %', total_users;
    RAISE NOTICE 'Total Profiles created: %', total_profiles;
    
    IF total_users = 5 AND total_profiles = 5 THEN
        RAISE NOTICE '✅ SUCCESS: All test users setup complete!';
    ELSIF total_users < 5 THEN
        RAISE NOTICE '⚠️  WARNING: Only % users found. Please create users in Dashboard first!', total_users;
    ELSIF total_profiles < 5 THEN
        RAISE NOTICE '⚠️  WARNING: Only % profiles created. Check errors above.', total_profiles;
    END IF;
    RAISE NOTICE '========================================';
END $$;

-- ============================================
-- DONE
-- ============================================

COMMENT ON TABLE profiles IS 'Test users setup complete. Use these credentials to test the system.';
