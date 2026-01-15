# SENARAI MIGRATION UNTUK SUPABASE
## Urutan Pelaksanaan

**PENTING:** 
- ✅ Backup database SEBELUM run migrations!
- ✅ Run migrations mengikut urutan (001 → 007)
- ✅ Check setiap migration berjaya sebelum proceed ke next

---

## 📋 SENARAI MIGRATION FILES

### 1. Migration 001: Initial Schema
**File:** `app/supabase/migrations/001_initial_schema.sql`

**Tujuan:**
- Create basic tables: `profiles`, `employers`, `cases`, `persons`, `audit_trail`
- Setup basic RLS policies
- Create audit triggers

**Status:** 
- ✅ Jika database baru → **PERLU RUN**
- ⚠️ Jika database sudah ada → **SKIP** (tables mungkin sudah wujud)

**Check sebelum run:**
```sql
-- Check jika tables sudah wujud
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'employers', 'cases', 'persons', 'audit_trail');
```

---

### 2. Migration 002: Prosecution Fields
**File:** `app/supabase/migrations/002_prosecution_fields.sql`

**Tujuan:**
- Add prosecution fields ke `cases` table
- Create `employees`, `evidences`, `statements`, `compound_offers` tables
- Add RLS policies untuk new tables

**Status:**
- ✅ Jika `cases` table belum ada fields seperti `offense_type`, `section_charged` → **PERLU RUN**
- ⚠️ Jika sudah ada → **SKIP** atau run dengan `IF NOT EXISTS` checks

**Check sebelum run:**
```sql
-- Check jika fields sudah wujud
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'cases' 
AND column_name IN ('offense_type', 'section_charged', 'section_penalty');
```

---

### 3. Migration 003: Fix RLS Policies
**File:** `app/supabase/migrations/003_fix_rls_policies.sql`

**Tujuan:**
- Fix RLS policies yang ada issues
- Update policies untuk better security

**Status:**
- ⚠️ **OPTIONAL** - Jika migration 006 akan di-run, ini mungkin redundant
- ✅ Run jika migration 006 tidak akan digunakan

---

### 4. Migration 004: Fix RLS 500 Error
**File:** `app/supabase/migrations/004_fix_rls_500_error.sql`

**Tujuan:**
- Fix RLS recursion issues
- Resolve 500 errors dari RLS policies

**Status:**
- ⚠️ **OPTIONAL** - Jika migration 006 akan di-run, ini mungkin redundant
- ✅ Run jika ada RLS recursion errors

---

### 5. Migration 005: Fix Prosecution Schema ⭐ **PENTING**
**File:** `app/supabase/migrations/005_fix_prosecution_schema.sql`

**Tujuan:**
- Add missing prosecution fields ke `cases` table
- Create `act_references` table dengan seed data (18 offenses)
- Create `case_offenses` linking table
- Create `chain_of_custody` table
- Create `charges` table untuk pertuduhan records

**Status:**
- ✅ **PERLU RUN** - Critical untuk prosecution workflow

**Tables yang akan dibuat:**
- `act_references` - Rujukan seksyen akta
- `case_offenses` - Link kes dengan kesalahan
- `chain_of_custody` - Rantaian jagaan bukti
- `charges` - Rekod pertuduhan

---

### 6. Migration 006: Fix Security RLS ⭐ **PENTING**
**File:** `app/supabase/migrations/006_fix_security_rls.sql`

**Tujuan:**
- Remove overly permissive RLS policies
- Implement proper role-based access control
- Secure semua tables dengan role checks

**Status:**
- ✅ **PERLU RUN** - Critical untuk security

**Apa yang akan dibuat:**
- Drop permissive policies
- Create secure role-based policies
- Ensure only authorized roles can access data

---

### 7. Migration 007: Update Case Status Enum

**File:** `app/supabase/migrations/007_update_case_status_enum.sql`

**Tujuan:**
- Convert case status dari ENUM ke TEXT
- Map old status values ke new values
- Add CHECK constraint untuk new statuses
- Create workflow_history table

**Status:** 
- ✅ **APPLIED**

**Dependencies:**
- Requires: 001, 005

---

### 8. Migration 008: Setup Test Users (OPTIONAL)

**File:** `app/supabase/migrations/008_setup_test_users.sql`

**Tujuan:**
- Create/update profiles untuk test users
- Assign roles (io, po, uip, admin, viewer)
- Verify setup

**Status:** 
- ⚠️ **OPTIONAL** - Untuk testing sahaja

**Dependencies:**
- Requires: 001 (profiles table)

**IMPORTANT:**
- **SEBELUM run SQL ini**, create users di Supabase Dashboard:
  - io@test.com
  - po@test.com
  - uip@test.com
  - admin@test.com
  - viewer@test.com
- See `SETUP_TEST_USERS.md` untuk detailed instructions

--- ⭐ **PENTING**
**File:** `app/supabase/migrations/007_update_case_status_enum.sql`

**Tujuan:**
- Update `cases.status` constraint untuk support new workflow statuses
- Create `workflow_history` table
- Map old statuses ke new statuses

**Status:**
- ✅ **PERLU RUN** - Critical untuk workflow

**Status mapping:**
- `draft` → `draf`
- `in_progress` → `dalam_siasatan`
- `pending_review` → `menunggu_semakan`
- `approved` → `menunggu_sanksi` (temporary)
- `closed` → `selesai`

---

## 🚀 URUTAN PELAKSANAAN (RECOMMENDED)

### Scenario 1: Database Baru (Fresh Start)
```sql
1. 001_initial_schema.sql          ✅ RUN
2. 002_prosecution_fields.sql      ✅ RUN
3. 005_fix_prosecution_schema.sql  ✅ RUN
4. 006_fix_security_rls.sql        ✅ RUN
5. 007_update_case_status_enum.sql ✅ RUN
```

**Skip:** 003, 004 (tidak diperlukan jika run 006)

---

### Scenario 2: Database Existing (Sudah Ada Data)
```sql
1. 001_initial_schema.sql          ⚠️ CHECK - mungkin sudah run
2. 002_prosecution_fields.sql      ⚠️ CHECK - mungkin sudah run
3. 005_fix_prosecution_schema.sql  ✅ RUN (add missing tables)
4. 006_fix_security_rls.sql        ✅ RUN (fix security)
5. 007_update_case_status_enum.sql ✅ RUN (update status)
```

**Skip:** 003, 004 (tidak diperlukan jika run 006)

---

## ✅ STATUS MIGRATIONS

**Status:** ✅ **ALL CRITICAL MIGRATIONS APPLIED**

- ✅ 005_fix_prosecution_schema.sql - **APPLIED**
- ✅ 006_fix_security_rls.sql - **APPLIED**
- ✅ 007_update_case_status_enum.sql - **APPLIED**

**Next Step:** Run verification queries (see `MIGRATION_VERIFICATION.md`)

---

## 📝 CARA RUN MIGRATIONS (Reference)

### Method 1: Supabase Dashboard (Recommended)
1. Login ke Supabase Dashboard
2. Go to **SQL Editor**
3. Copy & paste content dari migration file
4. Click **Run**
5. Verify success message
6. Proceed ke next migration

### Method 2: Supabase CLI
```bash
# Install Supabase CLI (jika belum)
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

---

## ⚠️ PERHATIAN

### Sebelum Run Migrations:
1. ✅ **Backup Database** - PENTING!
   ```sql
   -- Export database backup
   pg_dump -h your-host -U postgres -d your-db > backup.sql
   ```

2. ✅ **Check Existing Tables**
   - Verify tables yang sudah wujud
   - Avoid duplicate creation

3. ✅ **Test di Development First**
   - Run migrations di development/staging dulu
   - Test functionality
   - Baru run di production

### Selepas Run Migrations:
1. ✅ **Verify Tables Created**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```

2. ✅ **Verify RLS Policies**
   ```sql
   SELECT tablename, policyname FROM pg_policies 
   WHERE schemaname = 'public';
   ```

3. ✅ **Test Access Control**
   - Login sebagai different roles
   - Verify access permissions working

---

## ✅ CHECKLIST SELEPAS MIGRATIONS

- [ ] All tables created successfully
- [ ] RLS policies applied
- [ ] Status enum updated
- [ ] Workflow history table created
- [ ] Act references table dengan seed data
- [ ] No errors dalam migration logs
- [ ] Test case creation working
- [ ] Test workflow transitions working
- [ ] Test role-based access working

---

## 📊 SUMMARY

**Total Migration Files:** 7 files

**Critical (Must Run):**
- ✅ 005_fix_prosecution_schema.sql
- ✅ 006_fix_security_rls.sql
- ✅ 007_update_case_status_enum.sql

**Optional:**
- ⚠️ 001_initial_schema.sql (jika database baru)
- ⚠️ 002_prosecution_fields.sql (jika belum ada)
- ⚠️ 003_fix_rls_policies.sql (jika tidak run 006)
- ⚠️ 004_fix_rls_500_error.sql (jika tidak run 006)

**Recommended Order:**
1. 001 (jika baru)
2. 002 (jika belum ada)
3. 005 ⭐
4. 006 ⭐
5. 007 ⭐

---

**PENTING:** Backup database sebelum run migrations!
