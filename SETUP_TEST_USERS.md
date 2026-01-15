# SETUP TEST USERS
## Panduan Lengkap untuk Create Test Users

**Masa:** 5-10 minit

---

## ⚠️ PENTING: Baca Ini Dulu!

**Jika anda dapat `total_users = 0` dalam verification:**
- Ini bermakna users **BELUM di-create** di Supabase Dashboard
- **MESTI create users di Dashboard SEBELUM run SQL untuk profiles**
- Rujuk `COMPLETE_SETUP_GUIDE.md` untuk step-by-step lengkap

---

## 📋 LANGKAH-LANGKAH

### LANGKAH 1: Create Users di Supabase Dashboard (5 minit) ⚠️ REQUIRED!

1. **Login ke Supabase Dashboard**
   - Go to: https://app.supabase.com
   - Select your project

2. **Navigate ke Authentication**
   - Click **Authentication** di sidebar
   - Click **Users** tab

3. **Create 5 Test Users**

   Untuk setiap user, click **Add User** → **Create New User**:

   | Email | Password | Notes |
   |-------|----------|-------|
   | `io@test.com` | `Test123!` | IO Role |
   | `po@test.com` | `Test123!` | PO Role |
   | `uip@test.com` | `Test123!` | UIP Role |
   | `admin@test.com` | `Test123!` | Admin Role |
   | `viewer@test.com` | `Test123!` | Viewer Role |

   **Settings untuk setiap user:**
   - ✅ Auto Confirm User: **ON**
   - ✅ Send Magic Link: **OFF** (optional)

4. **Verify Users Created**
   - Check semua 5 users listed di Users table
   - Verify emails correct

---

### LANGKAH 2: Run SQL untuk Assign Roles (2 minit)

1. **Open SQL Editor**
   - Click **SQL Editor** di sidebar
   - Click **New Query**

2. **Copy & Paste SQL**
   - Open file: `app/supabase/migrations/008_setup_test_users.sql`
   - Copy semua content
   - Paste ke SQL Editor

3. **Run SQL**
   - Click **Run** button
   - Wait for success message

4. **Verify Results**
   - Check output untuk verify message
   - Should see: `✅ SUCCESS: All test users setup complete!`

---

### LANGKAH 3: Verify Setup (1 minit)

**Note:** Jika anda dapat "Success. No rows returned" selepas run migration, ini adalah **NORMAL**. INSERT statements tidak return rows.

**Untuk verify setup, run query ini:**

Atau gunakan fail: `VERIFY_TEST_USERS.sql` untuk comprehensive verification.

**Quick Verify:**

```sql
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
```

**Expected Output:**
```
email           | full_name        | role  | department              | status
----------------|------------------|-------|-------------------------|--------
admin@test.com  | Test Admin User  | admin | Pentadbiran            | ✅ Profile created
io@test.com     | Test IO User     | io    | Unit Siasatan           | ✅ Profile created
po@test.com     | Test PO User     | po    | Unit Pendakwaan         | ✅ Profile created
uip@test.com    | Test UIP User    | uip   | Unit Integriti & Pendakwaan | ✅ Profile created
viewer@test.com | Test Viewer User | viewer| Unit Laporan            | ✅ Profile created
```

---

## 🧪 TEST LOGIN

Sekarang test login dengan credentials:

1. **Open Application**
   - Navigate to `/login`

2. **Test Each User**
   - Login dengan `io@test.com` / `Test123!`
   - Verify redirect to `/dashboard`
   - Verify role displayed correctly
   - Logout
   - Repeat untuk other users

---

## 🔧 TROUBLESHOOTING

### Issue: "User not found" when running SQL

**Solution:**
- Verify users created di Dashboard first
- Check email spelling
- Run verification query to see which users exist

### Issue: "Profile already exists" error

**Solution:**
- SQL menggunakan `ON CONFLICT`, so ini OK
- Profile akan di-update dengan new values

### Issue: "Role does not exist" error

**Solution:**
- Check `user_role` enum exists:
  ```sql
  SELECT enumlabel FROM pg_enum 
  WHERE enumtypid = 'user_role'::regtype;
  ```
- Should see: admin, io, po, uip, viewer

### Issue: Login fails

**Solution:**
- Verify user exists in auth.users
- Verify profile exists with correct role
- Check password correct
- Check Auto Confirm enabled

---

## 📝 QUICK REFERENCE

### Test User Credentials

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **IO** | `io@test.com` | `Test123!` | Create & edit own cases |
| **PO** | `po@test.com` | `Test123!` | Review cases |
| **UIP** | `uip@test.com` | `Test123!` | Sanction cases |
| **Admin** | `admin@test.com` | `Test123!` | Full access |
| **Viewer** | `viewer@test.com` | `Test123!` | Read-only |

---

## ✅ CHECKLIST

- [ ] 5 users created di Supabase Dashboard
- [ ] SQL migration run successfully
- [ ] All profiles created dengan correct roles
- [ ] Login test successful untuk semua users
- [ ] Roles displayed correctly di dashboard

---

**Status:** Ready untuk testing! 🚀

*Gunakan credentials ini untuk test semua features mengikut TESTING_GUIDE.md*
