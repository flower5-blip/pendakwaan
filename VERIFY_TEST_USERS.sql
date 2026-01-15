-- ============================================
-- VERIFY TEST USERS SETUP
-- ============================================
-- Run query ini untuk verify test users telah di-setup dengan betul
-- ============================================

-- ============================================
-- 1. CHECK USERS & PROFILES
-- ============================================

SELECT 
    u.email,
    u.created_at as user_created,
    p.full_name,
    p.role,
    p.department,
    p.phone,
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
-- 2. SUMMARY COUNT
-- ============================================

SELECT 
    'Total Users in auth.users' as description,
    COUNT(*) as count
FROM auth.users
WHERE email IN (
    'io@test.com',
    'po@test.com',
    'uip@test.com',
    'admin@test.com',
    'viewer@test.com'
)

UNION ALL

SELECT 
    'Total Profiles created' as description,
    COUNT(*) as count
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email IN (
    'io@test.com',
    'po@test.com',
    'uip@test.com',
    'admin@test.com',
    'viewer@test.com'
)

UNION ALL

SELECT 
    'Users with correct roles' as description,
    COUNT(*) as count
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email IN (
    'io@test.com',
    'po@test.com',
    'uip@test.com',
    'admin@test.com',
    'viewer@test.com'
)
AND p.role IN ('admin', 'io', 'po', 'uip', 'viewer');

-- ============================================
-- 3. DETAILED ROLE BREAKDOWN
-- ============================================

SELECT 
    p.role,
    COUNT(*) as user_count,
    STRING_AGG(u.email, ', ' ORDER BY u.email) as emails
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email IN (
    'io@test.com',
    'po@test.com',
    'uip@test.com',
    'admin@test.com',
    'viewer@test.com'
)
GROUP BY p.role
ORDER BY 
    CASE p.role
        WHEN 'admin' THEN 1
        WHEN 'io' THEN 2
        WHEN 'po' THEN 3
        WHEN 'uip' THEN 4
        WHEN 'viewer' THEN 5
    END;

-- ============================================
-- 4. CHECK FOR MISSING USERS
-- ============================================

SELECT 
    'Missing Users' as check_type,
    STRING_AGG(expected_email, ', ') as missing_emails
FROM (
    SELECT 'io@test.com' as expected_email
    UNION ALL SELECT 'po@test.com'
    UNION ALL SELECT 'uip@test.com'
    UNION ALL SELECT 'admin@test.com'
    UNION ALL SELECT 'viewer@test.com'
) expected
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users u 
    WHERE u.email = expected.expected_email
);

-- ============================================
-- 5. CHECK FOR MISSING PROFILES
-- ============================================

SELECT 
    'Missing Profiles' as check_type,
    STRING_AGG(u.email, ', ') as users_without_profiles
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
);

-- ============================================
-- EXPECTED RESULTS:
-- ============================================
-- Query 1: Should show 5 rows dengan status "✅ OK"
-- Query 2: Should show:
--   - Total Users: 5
--   - Total Profiles: 5
--   - Users with correct roles: 5
-- Query 3: Should show 5 roles dengan 1 user each
-- Query 4: Should return NULL (no missing users)
-- Query 5: Should return NULL (no missing profiles)
-- ============================================
