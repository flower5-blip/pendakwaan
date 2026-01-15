-- ============================================
-- VERIFY PROFILES FIXED
-- ============================================
-- Run query ini untuk verify profiles telah di-create
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
