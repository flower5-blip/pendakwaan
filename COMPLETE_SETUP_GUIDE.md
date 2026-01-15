# COMPLETE SETUP GUIDE - Test Users
## Step-by-Step untuk Setup Test Users dengan Betul

**Issue:** `total_users = 0` bermakna users belum di-create di Supabase Dashboard.

---

## 🔍 STEP 1: Check Jika Users Wujud

Run query ini di Supabase SQL Editor:

```sql
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at
FROM auth.users
WHERE email IN (
    'io@test.com',
    'po@test.com',
    'uip@test.com',
    'admin@test.com',
    'viewer@test.com'
)
ORDER BY email;
```

**Jika result kosong (0 rows):** Users belum di-create. Continue ke STEP 2.

**Jika ada rows:** Users wujud, continue ke STEP 3.

---

## 📝 STEP 2: Create Users di Supabase Dashboard

### 2.1 Login ke Supabase Dashboard
1. Go to: https://app.supabase.com
2. Select project: **pendakwaan**
3. Navigate to: **Authentication** → **Users**

### 2.2 Create 5 Test Users

Untuk setiap user, ikut steps:

1. Click **"Add User"** button (top right)
2. Select **"Create new user"**
3. Fill form:
   - **Email:** (salah satu dari list below)
   - **Password:** `Test123!`
   - **Auto Confirm User:** ✅ **ON** (IMPORTANT!)
   - **Send Magic Link:** ❌ OFF (optional)
4. Click **"Create User"**

**Create users ini:**
- ✅ `io@test.com` (Password: `Test123!`)
- ✅ `po@test.com` (Password: `Test123!`)
- ✅ `uip@test.com` (Password: `Test123!`)
- ✅ `admin@test.com` (Password: `Test123!`)
- ✅ `viewer@test.com` (Password: `Test123!`)

### 2.3 Verify Users Created

Selepas create semua 5 users, run query dari STEP 1 lagi. Anda sepatutnya nampak 5 rows.

---

## 🔧 STEP 3: Create Profiles untuk Users

Sekarang users wujud, create profiles dengan run SQL ini:

### Option A: Quick Fix (Recommended)

Run fail: `QUICK_FIX_PROFILES.sql`

Atau copy SQL ini:

```sql
INSERT INTO profiles (id, full_name, role, department, phone, created_at, updated_at)
SELECT 
    u.id,
    CASE u.email
        WHEN 'io@test.com' THEN 'Test IO User'
        WHEN 'po@test.com' THEN 'Test PO User'
        WHEN 'uip@test.com' THEN 'Test UIP User'
        WHEN 'admin@test.com' THEN 'Test Admin User'
        WHEN 'viewer@test.com' THEN 'Test Viewer User'
    END as full_name,
    CASE u.email
        WHEN 'io@test.com' THEN 'io'::user_role
        WHEN 'po@test.com' THEN 'po'::user_role
        WHEN 'uip@test.com' THEN 'uip'::user_role
        WHEN 'admin@test.com' THEN 'admin'::user_role
        WHEN 'viewer@test.com' THEN 'viewer'::user_role
    END as role,
    CASE u.email
        WHEN 'io@test.com' THEN 'Unit Siasatan'
        WHEN 'po@test.com' THEN 'Unit Pendakwaan'
        WHEN 'uip@test.com' THEN 'Unit Integriti & Pendakwaan'
        WHEN 'admin@test.com' THEN 'Pentadbiran'
        WHEN 'viewer@test.com' THEN 'Unit Laporan'
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
```

---

## ✅ STEP 4: Verify Complete Setup

Run query ini untuk verify:

```sql
SELECT 
    u.email,
    p.full_name,
    p.role,
    p.department,
    CASE 
        WHEN p.id IS NULL THEN '❌ Profile Missing'
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
    END;
```

**Expected Result:**
- 5 rows
- Semua menunjukkan "✅ OK - Ready to use"
- Roles correct (admin, io, po, uip, viewer)

---

## 🧪 STEP 5: Test Login

Sekarang test login dengan credentials:

1. Open application: `/login`
2. Test login dengan:
   - `io@test.com` / `Test123!`
   - `po@test.com` / `Test123!`
   - `uip@test.com` / `Test123!`
   - `admin@test.com` / `Test123!`
   - `viewer@test.com` / `Test123!`

**Expected:**
- ✅ Login successful
- ✅ Redirect to `/dashboard`
- ✅ Role displayed correctly
- ✅ Navigation sesuai dengan role

---

## 🐛 TROUBLESHOOTING

### Issue: "No users found" after creating in Dashboard

**Solution:**
- Check email spelling (case-sensitive)
- Verify users listed di Authentication → Users
- Run `CHECK_USERS_EXIST.sql` untuk verify

### Issue: "Profile creation failed"

**Solution:**
- Check jika users wujud dulu (run STEP 1)
- Verify `profiles` table exists
- Check untuk error messages di SQL Editor

### Issue: "Login fails"

**Solution:**
- Verify password correct: `Test123!`
- Check "Auto Confirm User" was enabled
- Verify profile exists dengan correct role

---

## 📋 CHECKLIST

- [ ] Users created di Supabase Dashboard (5 users)
- [ ] Users verified dengan query (5 rows returned)
- [ ] Profiles created dengan SQL (Success message)
- [ ] Profiles verified (All show "✅ OK")
- [ ] Login test successful untuk semua users
- [ ] Roles displayed correctly di dashboard

---

**Status:** Follow steps above untuk complete setup! 🚀
