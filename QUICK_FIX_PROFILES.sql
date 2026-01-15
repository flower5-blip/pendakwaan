-- ============================================
-- QUICK FIX: Create Missing Profiles
-- ============================================
-- Run SQL ini untuk create profiles untuk test users yang missing
-- ============================================

-- Create profiles untuk semua test users yang missing
INSERT INTO profiles (id, full_name, role, department, phone, created_at, updated_at)
SELECT 
    u.id,
    CASE u.email
        WHEN 'io@test.com' THEN 'Test IO User'
        WHEN 'po@test.com' THEN 'Test PO User'
        WHEN 'uip@test.com' THEN 'Test UIP User'
        WHEN 'admin@test.com' THEN 'Test Admin User'
        WHEN 'viewer@test.com' THEN 'Test Viewer User'
        ELSE 'Test User'
    END as full_name,
    CASE u.email
        WHEN 'io@test.com' THEN 'io'::user_role
        WHEN 'po@test.com' THEN 'po'::user_role
        WHEN 'uip@test.com' THEN 'uip'::user_role
        WHEN 'admin@test.com' THEN 'admin'::user_role
        WHEN 'viewer@test.com' THEN 'viewer'::user_role
        ELSE 'viewer'::user_role
    END as role,
    CASE u.email
        WHEN 'io@test.com' THEN 'Unit Siasatan'
        WHEN 'po@test.com' THEN 'Unit Pendakwaan'
        WHEN 'uip@test.com' THEN 'Unit Integriti & Pendakwaan'
        WHEN 'admin@test.com' THEN 'Pentadbiran'
        WHEN 'viewer@test.com' THEN 'Unit Laporan'
        ELSE NULL
    END as department,
    '0123456789' as phone,
    NOW() as created_at,
    NOW() as updated_at
FROM auth.users u
WHERE u.email IN (
    'io@test.com',
    'po@test.com',
    'uip@test.com',
    'admin@test.com',
    'viewer@test.com'
)
AND NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- VERIFY PROFILES CREATED
-- ============================================

-- Check all test users and their profiles
SELECT 
    u.email,
    p.full_name,
    p.role,
    p.department,
    CASE 
        WHEN p.id IS NULL THEN '❌ Still Missing'
        WHEN p.role IS NULL THEN '⚠️  Profile exists but NO ROLE'
        ELSE '✅ OK - Ready to use'
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

-- Summary
SELECT 
    COUNT(*) FILTER (WHERE p.id IS NOT NULL) as profiles_created,
    COUNT(*) FILTER (WHERE p.id IS NULL) as profiles_missing,
    COUNT(*) as total_users,
    CASE 
        WHEN COUNT(*) FILTER (WHERE p.id IS NOT NULL) = 5 THEN '✅ ALL PROFILES CREATED'
        WHEN COUNT(*) FILTER (WHERE p.id IS NOT NULL) = 0 THEN '❌ NO PROFILES CREATED'
        ELSE '⚠️  PARTIAL - Some profiles missing'
    END as summary
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email IN (
    'io@test.com',
    'po@test.com',
    'uip@test.com',
    'admin@test.com',
    'viewer@test.com'
);
