# PANDUAN TESTING SISTEM PENDAKWAAN PERKESO
## Comprehensive Testing Guide

**Tarikh:** Januari 2026  
**Status:** Ready for Testing

---

## 📋 PRE-TESTING SETUP

### 1. Setup Test Users (REQUIRED)

**Langkah 1: Create Users di Supabase Auth**

1. Login ke Supabase Dashboard
2. Go to **Authentication** → **Users**
3. Create 5 test users dengan email berikut:

```
io@test.com (Password: Test123!)
po@test.com (Password: Test123!)
uip@test.com (Password: Test123!)
admin@test.com (Password: Test123!)
viewer@test.com (Password: Test123!)
```

**Langkah 2: Assign Roles di Database**

Run SQL ini di Supabase SQL Editor untuk assign roles:

```sql
-- Update roles untuk test users
-- Gantikan user IDs dengan actual IDs dari auth.users

-- Get user IDs first
SELECT id, email FROM auth.users WHERE email IN (
    'io@test.com',
    'po@test.com',
    'uip@test.com',
    'admin@test.com',
    'viewer@test.com'
);

-- Then update profiles (gantikan UUID dengan actual IDs)
UPDATE profiles 
SET role = 'io' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'io@test.com');

UPDATE profiles 
SET role = 'po' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'po@test.com');

UPDATE profiles 
SET role = 'uip' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'uip@test.com');

UPDATE profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@test.com');

UPDATE profiles 
SET role = 'viewer' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'viewer@test.com');
```

**Langkah 3: Verify Roles**

```sql
SELECT p.id, u.email, p.role, p.full_name
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email IN (
    'io@test.com',
    'po@test.com',
    'uip@test.com',
    'admin@test.com',
    'viewer@test.com'
);
```

---

## 🧪 TEST SCENARIOS

### TEST 1: Authentication & Login ✅

**Objective:** Verify login functionality

**Steps:**
1. Open application di browser
2. Navigate to `/login`
3. Try login dengan:
   - ✅ Valid credentials (io@test.com / Test123!)
   - ❌ Invalid credentials (should show error)
   - ❌ Empty fields (should show validation)

**Expected Results:**
- ✅ Valid login redirects to `/dashboard`
- ✅ Invalid login shows error message
- ✅ User profile loaded correctly
- ✅ Role-based navigation visible

**Verify:**
- Check browser console untuk errors
- Check network tab untuk API calls
- Verify redirect after login

---

### TEST 2: Case Creation (IO Role) ✅

**Objective:** Verify case creation dengan semua prosecution fields

**Steps:**
1. Login sebagai `io@test.com`
2. Navigate to `/cases/new`
3. Fill form:
   - **Majikan:** Create new atau select existing
   - **Jenis Akta:** Select "Akta 4" atau "Akta 800"
   - **Jenis Kesalahan:** Select dari dropdown (e.g., "Gagal Daftar Perusahaan")
   - **Tarikh Kesalahan:** Select date
   - **Lokasi Kesalahan:** Enter location
   - **Seksyen Pertuduhan:** Should auto-fill based on offense
   - **Seksyen Hukuman:** Should auto-fill
   - **Tarikh Pemeriksaan:** Select date
   - **Lokasi Pemeriksaan:** Enter location
   - **Ringkasan Isu:** Enter description
4. Click **Submit**

**Expected Results:**
- ✅ Case created successfully
- ✅ Redirected to case detail page
- ✅ Case number generated (format: KES/YYYY/XXXXX)
- ✅ Status = 'draf'
- ✅ All fields saved correctly

**Verify di Database:**
```sql
SELECT 
    case_number,
    status,
    act_type,
    offense_type,
    section_charged,
    section_penalty,
    date_of_offense
FROM cases
ORDER BY created_at DESC
LIMIT 1;
```

**Common Issues:**
- ❌ Fields not saving → Check form submission
- ❌ Auto-fill not working → Check `lib/laws.ts`
- ❌ Case number not generated → Check `submitCase` action

---

### TEST 3: Case List & Search ✅

**Objective:** Verify case listing dan search functionality

**Steps:**
1. Login sebagai IO
2. Navigate to `/cases`
3. Verify:
   - Cases listed in table
   - Search functionality
   - Filter by status
   - Pagination (if many cases)
4. Click on a case → Should open case detail

**Expected Results:**
- ✅ Cases displayed correctly
- ✅ Search works
- ✅ Filters work
- ✅ Click case opens detail page

---

### TEST 4: Case Detail View ✅

**Objective:** Verify case detail page displays all information

**Steps:**
1. Open any case from `/cases`
2. Verify sections:
   - Case Information
   - Employer Information
   - Offense Details
   - Status Badge
   - Quick Actions
   - Timeline/History

**Expected Results:**
- ✅ All case fields displayed
- ✅ Status badge shows correct color
- ✅ Quick Actions visible (based on role & status)
- ✅ Timeline shows history

---

### TEST 5: Status Workflow - IO Actions ✅

**Objective:** Verify IO can change case status

**Steps:**
1. Login sebagai IO
2. Open case dengan status 'draf'
3. Click **Status Change** component
4. Verify available actions:
   - ✅ Should see "Mulakan Siasatan" (→ dalam_siasatan)
5. Click action, add notes, confirm
6. Verify status updated

**Expected Results:**
- ✅ Status changed to 'dalam_siasatan'
- ✅ Workflow history recorded
- ✅ Notes saved
- ✅ Timeline updated

**Verify di Database:**
```sql
SELECT 
    c.case_number,
    c.status,
    wh.from_status,
    wh.to_status,
    wh.action,
    wh.notes
FROM cases c
LEFT JOIN workflow_history wh ON c.id = wh.case_id
WHERE c.case_number = 'KES/2026/00001'  -- Gantikan dengan case number
ORDER BY wh.created_at DESC;
```

---

### TEST 6: Evidence Management ✅

**Objective:** Verify evidence can be added to case

**Steps:**
1. Open case dengan status 'dalam_siasatan'
2. Navigate to `/cases/[id]/evidence`
3. Click **Add Evidence**
4. Fill form:
   - Exhibit Number: "EXH-001"
   - Evidence Name: "Surat Akuan"
   - Description: "Test evidence"
   - Collected Date: Today
   - Collected Location: "Office"
   - Collected By: Auto-filled (current user)
5. Submit
6. Verify evidence listed
7. Test edit & delete

**Expected Results:**
- ✅ Evidence created
- ✅ Exhibit number unique
- ✅ Evidence listed in table
- ✅ Edit works
- ✅ Delete works

**Verify di Database:**
```sql
SELECT 
    exhibit_number,
    evidence_name,
    description,
    collected_date,
    status
FROM evidences
WHERE case_id = '...'  -- Gantikan dengan case ID
ORDER BY exhibit_number;
```

---

### TEST 7: Statement Recording ✅

**Objective:** Verify statements can be recorded

**Steps:**
1. Open case
2. Navigate to `/cases/[id]/statements`
3. Click **Add Statement**
4. Fill form:
   - Person Name: "Ahmad bin Ali"
   - Person IC: "123456789012"
   - Person Role: "Pekerja"
   - Statement Date: Today
   - Statement Time: Current time
   - Location: "Office"
   - Section Reference: Should auto-fill (S.12C for Akta 4, S.69 & 70 for Akta 800)
   - Content: "Test statement content"
   - Summary: "Test summary"
   - Language: "Bahasa Melayu"
5. Submit
6. Verify statement listed

**Expected Results:**
- ✅ Statement created
- ✅ Section reference auto-filled correctly
- ✅ Statement listed
- ✅ Can mark as signed

**Verify di Database:**
```sql
SELECT 
    person_name,
    person_ic,
    person_role,
    section_reference,
    statement_date,
    is_signed
FROM statements
WHERE case_id = '...'
ORDER BY statement_date DESC;
```

---

### TEST 8: Review Process (PO Role) ✅

**Objective:** Verify PO can review cases

**Steps:**
1. Login sebagai IO
2. Change case status to 'menunggu_semakan'
3. Logout
4. Login sebagai `po@test.com`
5. Navigate to `/cases/[id]/review`
6. Review case:
   - Read case summary
   - Read evidence & statements
   - Add review notes
7. Click **Approve** atau **Reject**

**Expected Results:**
- ✅ PO can access review page
- ✅ Case information displayed
- ✅ Approve → status = 'menunggu_sanksi'
- ✅ Reject → status = 'dalam_siasatan' (with notes)
- ✅ Review notes saved

**Verify:**
- Check status updated
- Check workflow history
- Check review notes saved

---

### TEST 9: Sanction Process (UIP Role) ✅

**Objective:** Verify UIP can sanction cases

**Steps:**
1. Login sebagai UIP
2. Open case dengan status 'menunggu_sanksi'
3. Navigate to `/cases/[id]/sanction`
4. Review case & PO notes
5. Choose action:
   - **Approve Sanction** → Route to:
     - Compound
     - Prosecution
     - NFA
6. Add sanction notes
7. Submit

**Expected Results:**
- ✅ UIP can access sanction page
- ✅ Can route to compound/prosecution/NFA
- ✅ Status updated accordingly
- ✅ Sanction notes saved

---

### TEST 10: Compound Offer Creation ✅

**Objective:** Verify compound offer system

**Steps:**
1. Open case dengan status 'sanksi_diluluskan'
2. Navigate to `/cases/[id]/compound`
3. Click **Create Compound Offer**
4. Verify:
   - Amount auto-calculated
   - Offer number auto-generated (KOMPAUN/YYYY/XXXXX)
   - Due date calculated (14 days)
5. Submit
6. Verify:
   - Case status = 'dikompaun'
   - Compound offer listed
   - Can track payment

**Expected Results:**
- ✅ Compound offer created
- ✅ Amount calculated correctly
- ✅ Offer number unique
- ✅ Case status updated
- ✅ Payment tracking works

**Verify di Database:**
```sql
SELECT 
    offer_number,
    offer_date,
    due_date,
    amount,
    status,
    case_id
FROM compound_offers
WHERE case_id = '...'
ORDER BY offer_date DESC;
```

---

### TEST 11: Payment Tracking ✅

**Objective:** Verify payment can be recorded

**Steps:**
1. Open compound offer
2. Click **Mark as Paid**
3. Fill:
   - Paid Date: Today
   - Paid Amount: Full amount
   - Receipt Number: "REC-001"
4. Submit
5. Verify:
   - Status = 'paid'
   - Case status = 'selesai'

**Expected Results:**
- ✅ Payment recorded
- ✅ Status updated
- ✅ Case closed

---

### TEST 12: Charge Sheet & Court Filing ✅

**Objective:** Verify prosecution filing

**Steps:**
1. Open case dengan status 'sanksi_diluluskan'
2. Navigate to `/cases/[id]/charges`
3. Verify:
   - Charge sheet preview displayed
   - All offense details shown
4. Fill court filing form:
   - Court Name: "Mahkamah Sesyen"
   - Court Location: "Kuala Lumpur"
   - Filing Date: Today
   - First Hearing Date: Future date
5. Submit

**Expected Results:**
- ✅ Charge sheet generated correctly
- ✅ Court filing details saved
- ✅ Case status = 'didakwa'

---

### TEST 13: Document Generation ✅

**Objective:** Verify documents can be generated

**Steps:**
1. Open case
2. Navigate to `/cases/[id]/documents`
3. Test each document:
   - **Charge Sheet** - Preview & Print
   - **Investigation Paper** - Preview & Print
   - **Consent Letter** - Preview & Print
   - **Court Summons** - Preview & Print
   - **Certificate of Officer** - Preview & Print
   - **Compound Letter** - Preview & Print

**Expected Results:**
- ✅ All documents render correctly
- ✅ Print functionality works
- ✅ Data populated correctly

---

### TEST 14: Reports & Analytics ✅

**Objective:** Verify reports functionality

**Steps:**
1. Login sebagai Admin
2. Navigate to `/reports`
3. Test:
   - Statistics display
   - Filter by date range
   - Filter by status
   - Filter by act type
   - Search functionality
   - Export to CSV
   - Export to Excel
   - Export to PDF

**Expected Results:**
- ✅ Statistics accurate
- ✅ Filters work
- ✅ Export works
- ✅ Data correct

---

### TEST 15: Audit Trail ✅

**Objective:** Verify audit trail viewer

**Steps:**
1. Login sebagai Admin
2. Navigate to `/audit`
3. Test:
   - View all audit logs
   - Filter by table
   - Filter by action
   - Filter by user
   - Filter by date range
   - Search
   - Export

**Expected Results:**
- ✅ All actions logged
- ✅ Filters work
- ✅ Data differences shown for updates
- ✅ Export works

---

### TEST 16: Security & Access Control ✅

**Objective:** Verify role-based access control

**Test Matrix:**

| Action | IO | PO | UIP | Admin | Viewer |
|--------|----|----|-----|-------|--------|
| Create Case | ✅ | ❌ | ❌ | ✅ | ❌ |
| Edit Own Case | ✅ | ❌ | ❌ | ✅ | ❌ |
| Edit Other Case | ❌ | ❌ | ❌ | ✅ | ❌ |
| Review Case | ❌ | ✅ | ❌ | ✅ | ❌ |
| Sanction Case | ❌ | ❌ | ✅ | ✅ | ❌ |
| View Cases | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Reports | ❌ | ❌ | ❌ | ✅ | ❌ |
| View Audit | ❌ | ❌ | ❌ | ✅ | ❌ |

**Steps:**
1. Test each role dengan actions above
2. Verify:
   - ✅ Allowed actions work
   - ❌ Disallowed actions blocked (403/redirect)

**Expected Results:**
- ✅ Access control working
- ✅ UI hides unauthorized actions
- ✅ API returns 403 for unauthorized

---

## 🐛 TROUBLESHOOTING

### Issue: Login fails
**Check:**
- Supabase connection
- Environment variables
- User exists in auth.users
- Profile exists in profiles table

### Issue: Case creation fails
**Check:**
- All required fields filled
- Form validation
- Server action logs
- Database constraints

### Issue: Status change not working
**Check:**
- User role correct
- Workflow rules in `lib/workflow.ts`
- Server action permissions
- Database RLS policies

### Issue: Auto-fill not working
**Check:**
- `lib/laws.ts` has correct mappings
- Form fields match expected names
- JavaScript console untuk errors

### Issue: RLS blocking access
**Check:**
- User role in profiles table
- RLS policies in database
- Case ownership (io_id)

---

## ✅ TESTING CHECKLIST

### Core Features
- [ ] Login/Logout
- [ ] Case Creation
- [ ] Case List & Search
- [ ] Case Detail View
- [ ] Status Workflow
- [ ] Evidence Management
- [ ] Statement Recording

### Workflow
- [ ] Review Process (PO)
- [ ] Sanction Process (UIP)
- [ ] Compound Offer
- [ ] Payment Tracking
- [ ] Court Filing

### Features
- [ ] Document Generation
- [ ] Reports & Analytics
- [ ] Audit Trail
- [ ] Security & Access Control

---

## 📊 TEST RESULTS TEMPLATE

```
Test Date: ___________
Tester: ___________

| Test # | Feature | Status | Notes |
|--------|---------|--------|-------|
| 1 | Authentication | ✅/❌ | |
| 2 | Case Creation | ✅/❌ | |
| 3 | Case List | ✅/❌ | |
| ... | ... | ... | ... |
```

---

**Status:** Ready for Testing! 🚀

*Ikut panduan ini untuk comprehensive testing sebelum deployment.*
