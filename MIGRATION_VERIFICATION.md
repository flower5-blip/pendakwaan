# VERIFICATION CHECKLIST - MIGRATIONS APPLIED
## Status: ✅ Migrations 005, 006, 007 Applied

**Tarikh:** Januari 2026

---

## ✅ MIGRATIONS YANG TELAH DIJALANKAN

1. ✅ `005_fix_prosecution_schema.sql` - Fix Prosecution Schema
2. ✅ `006_fix_security_rls.sql` - Fix Security RLS
3. ✅ `007_update_case_status_enum.sql` - Update Case Status Enum

---

## 🔍 VERIFICATION CHECKLIST

### 1. Verify Tables Created (Migration 005)

Run query ini untuk verify tables wujud:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'act_references',
    'case_offenses',
    'chain_of_custody',
    'charges',
    'workflow_history'
)
ORDER BY table_name;
```

**Expected:** Semua 5 tables harus wujud

---

### 2. Verify Cases Table Fields (Migration 005)

Run query ini untuk verify fields wujud:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cases' 
AND column_name IN (
    'punca_siasatan',
    'tarikh_mula_layak',
    'tempoh_tunggakan_mula',
    'tempoh_tunggakan_tamat',
    'jumlah_caruman',
    'jumlah_fclb',
    'bil_pekerja_terlibat',
    'notis_pematuhan',
    'syor_io'
)
ORDER BY column_name;
```

**Expected:** Semua 9 fields harus wujud

---

### 3. Verify Act References Seed Data (Migration 005)

Run query ini untuk verify seed data:

```sql
SELECT COUNT(*) as total_offenses 
FROM act_references;
```

**Expected:** Minimum 18 records (18 offenses dari seed data)

---

### 4. Verify RLS Policies (Migration 006)

Run query ini untuk verify secure policies wujud:

```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND policyname LIKE 'Secure:%'
ORDER BY tablename, policyname;
```

**Expected:** Policies dengan prefix "Secure:" untuk semua tables

---

### 5. Verify Case Status Column (Migration 007)

Run query ini untuk verify status column type:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'cases' 
AND column_name = 'status';
```

**Expected:** 
- `data_type` = `text` (bukan enum)
- `column_default` = `'draf'`

---

### 6. Verify Case Status Constraint (Migration 007)

Run query ini untuk verify CHECK constraint:

```sql
SELECT constraint_name, check_clause
FROM information_schema.check_constraints 
WHERE constraint_name = 'cases_status_check';
```

**Expected:** Constraint dengan values: draf, dalam_siasatan, menunggu_semakan, menunggu_sanksi, sanksi_diluluskan, dikompaun, didakwa, selesai, nfa

---

### 7. Verify Workflow History Table (Migration 007)

Run query ini untuk verify table wujud:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'workflow_history';
```

**Expected:** Table `workflow_history` wujud

---

## 🧪 FUNCTIONAL TESTING

**📖 Untuk detailed testing guide, rujuk `TESTING_GUIDE.md`**

### Test 1: Case Creation
1. Login sebagai IO
2. Create new case
3. Fill semua fields termasuk:
   - Jenis Akta
   - Jenis Kesalahan
   - Tarikh Kesalahan
   - Seksyen Pertuduhan
   - Seksyen Hukuman
4. Submit
5. ✅ Verify case created dengan status 'draf'
6. ✅ Verify semua prosecution fields disimpan

### Test 2: Status Workflow
1. Open case yang baru dibuat
2. Change status dari 'draf' → 'dalam_siasatan'
3. ✅ Verify status update berjaya
4. Add evidence & statements
5. Change status ke 'menunggu_semakan'
6. ✅ Verify status update berjaya

### Test 3: Review Process
1. Login sebagai PO
2. Open case dengan status 'menunggu_semakan'
3. Review & approve
4. ✅ Verify status update ke 'menunggu_sanksi'

### Test 4: Sanction Process
1. Login sebagai UIP
2. Open case dengan status 'menunggu_sanksi'
3. Sanction & route ke compound/prosecution
4. ✅ Verify status update ke 'sanksi_diluluskan' → 'dikompaun' atau 'didakwa'

### Test 5: Compound Offer
1. Open case dengan status 'sanksi_diluluskan'
2. Create compound offer
3. ✅ Verify compound offer created
4. ✅ Verify case status update ke 'dikompaun'
5. Mark payment received
6. ✅ Verify case status update ke 'selesai'

### Test 6: Security (RLS)
1. Login sebagai 'viewer' role
2. ✅ Verify viewer TIDAK boleh create/edit cases
3. ✅ Verify viewer hanya boleh view cases
4. Login sebagai 'io' role
5. ✅ Verify IO boleh create cases
6. ✅ Verify IO hanya boleh edit own cases

---

## 📊 QUICK VERIFICATION QUERIES

### Check All Tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Check All Policies
```sql
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

### Check Case Status Values
```sql
SELECT DISTINCT status, COUNT(*) as count
FROM cases
GROUP BY status
ORDER BY status;
```

---

## ✅ SUCCESS CRITERIA

- [x] All migrations run successfully
- [ ] All tables created (act_references, case_offenses, chain_of_custody, charges, workflow_history)
- [ ] All fields added to cases table
- [ ] RLS policies secure (no overly permissive policies)
- [ ] Case status column is TEXT (not enum)
- [ ] Case status CHECK constraint working
- [ ] Workflow history table created
- [ ] Act references seed data loaded (18+ records)
- [ ] Case creation working dengan semua fields
- [ ] Status workflow working
- [ ] Security (RLS) working

---

## 🚀 NEXT STEPS

1. **Run Verification Queries** (above)
2. **Test Case Creation** - Verify semua fields save
3. **Test Workflow** - Test status transitions
4. **Test Security** - Test role-based access
5. **Test Compound** - Test compound offer creation
6. **Test Reports** - Test reports & export

---

**Status:** ✅ Migrations Applied - Ready for Testing!
