-- ============================================
-- FIX MISSING PROFILES FOR TEST USERS
-- ============================================
-- Run SQL ini jika profiles tidak di-create untuk test users
-- ============================================

-- ============================================
-- 1. CHECK CURRENT STATUS
-- ============================================

-- Check which users exist but don't have profiles
SELECT 
    u.id,
    u.email,
    u.created_at as user_created,
    CASE 
        WHEN p.id IS NULL THEN '❌ MISSING PROFILE'
        ELSE '✅ Profile exists'
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
AND p.id IS NULL;

-- ============================================
-- 2. CREATE MISSING PROFILES
-- ============================================

-- IO User
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
AND NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = u.id
);

-- PO User
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
AND NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = u.id
);

-- UIP User
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
AND NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = u.id
);

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
AND NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = u.id
);

-- Viewer User
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
AND NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = u.id
);

-- ============================================
-- 3. VERIFY AFTER FIX
-- ============================================

SELECT 
    u.email,
    p.full_name,
    p.role,
    p.department,
    CASE 
        WHEN p.id IS NULL THEN '❌ Profile NOT created'
        WHEN p.role IS NULL THEN '⚠️  Profile created but NO ROLE'
        ELSE '✅ OK'
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
        ELSE 6
    END,
    u.email;

-- ============================================
-- 4. SUMMARY
-- ============================================

SELECT 
    COUNT(*) FILTER (WHERE p.id IS NOT NULL) as profiles_created,
    COUNT(*) FILTER (WHERE p.id IS NULL) as profiles_missing,
    COUNT(*) as total_users
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email IN (
    'io@test.com',
    'po@test.com',
    'uip@test.com',
    'admin@test.com',
    'viewer@test.com'
);

-- ============================================
-- DONE
-- ============================================
-- Selepas run SQL ini, semua profiles sepatutnya di-create
-- Run verification query untuk confirm
-- ============================================
