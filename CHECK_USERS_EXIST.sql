-- ============================================
-- CHECK IF TEST USERS EXIST IN auth.users
-- ============================================
-- Run query ini untuk check jika users wujud
-- ============================================

-- Check if test users exist in auth.users
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    CASE 
        WHEN email_confirmed_at IS NULL THEN '⚠️  Email NOT confirmed'
        ELSE '✅ Email confirmed'
    END as email_status
FROM auth.users
WHERE email IN (
    'io@test.com',
    'po@test.com',
    'uip@test.com',
    'admin@test.com',
    'viewer@test.com'
)
ORDER BY email;

-- Count summary
SELECT 
    COUNT(*) as total_test_users_found,
    COUNT(*) FILTER (WHERE email_confirmed_at IS NOT NULL) as confirmed_users,
    COUNT(*) FILTER (WHERE email_confirmed_at IS NULL) as unconfirmed_users,
    CASE 
        WHEN COUNT(*) = 0 THEN '❌ NO USERS FOUND - Please create users in Dashboard first!'
        WHEN COUNT(*) < 5 THEN '⚠️  PARTIAL - Only ' || COUNT(*) || ' users found'
        WHEN COUNT(*) = 5 AND COUNT(*) FILTER (WHERE email_confirmed_at IS NOT NULL) = 5 THEN '✅ ALL 5 USERS EXIST & CONFIRMED'
        WHEN COUNT(*) = 5 THEN '⚠️  ALL 5 USERS EXIST but some not confirmed'
        ELSE '✅ Users found'
    END as status
FROM auth.users
WHERE email IN (
    'io@test.com',
    'po@test.com',
    'uip@test.com',
    'admin@test.com',
    'viewer@test.com'
);

-- Check ALL users (to see what exists)
SELECT 
    email,
    created_at,
    email_confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 20;
