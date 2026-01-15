# ARAHAN TEST - Sistem Pendakwaan PERKESO
## Panduan Langkah Demi Langkah untuk Testing

**Masa:** 30-60 minit  
**Status:** Ready untuk Testing

**📖 Untuk quick test (5-15 minit), rujuk `QUICK_TEST.md`**  
**📖 Untuk detailed guide, rujuk `TESTING_GUIDE.md`**

---

## 🚀 QUICK START (5 Minit)

### Test 1: Login & Authentication

1. **Buka Application**
   - Navigate to: `http://localhost:3000/login` (atau URL production)

2. **Test Login dengan Setiap User**
   
   Login dengan credentials ini (satu persatu):

   ```
   Email: io@test.com
   Password: Test123!
   ```
   
   **Expected:**
   - ✅ Login successful
   - ✅ Redirect to `/dashboard`
   - ✅ Role "IO" displayed
   - ✅ Navigation menu sesuai dengan role

   **Repeat untuk:**
   - `po@test.com` / `Test123!` → PO role
   - `uip@test.com` / `Test123!` → UIP role
   - `admin@test.com` / `Test123!` → Admin role
   - `viewer@test.com` / `Test123!` → Viewer role

3. **Verify**
   - ✅ Semua 5 users boleh login
   - ✅ Roles displayed correctly
   - ✅ Navigation sesuai dengan role

---

## 📝 TEST UTAMA (30 Minit)

### Test 2: Case Creation (IO Role)

**Login sebagai:** `io@test.com`

1. **Navigate ke Create Case**
   - Click **"Cases"** di sidebar
   - Click **"New Case"** button

2. **Fill Case Form**
   - **Majikan:** 
     - Option 1: Select existing employer
     - Option 2: Create new (fill company name, SSM number, etc.)
   - **Jenis Akta:** Select "Akta 4" atau "Akta 800"
   - **Jenis Kesalahan:** Select dari dropdown
     - Contoh: "Gagal Daftar Perusahaan"
   - **Tarikh Kesalahan:** Select date
   - **Lokasi Kesalahan:** Enter location
   - **Seksyen Pertuduhan:** Should auto-fill
   - **Seksyen Hukuman:** Should auto-fill
   - **Tarikh Pemeriksaan:** Select date
   - **Lokasi Pemeriksaan:** Enter location
   - **Ringkasan Isu:** Enter description

3. **Submit**
   - Click **"Submit"** button
   - ✅ Case created successfully
   - ✅ Redirected to case detail page
   - ✅ Case number generated (format: KES/YYYY/XXXXX)
   - ✅ Status = "draf"

4. **Verify di Database (Optional)**
   ```sql
   SELECT case_number, status, act_type, offense_type 
   FROM cases 
   ORDER BY created_at DESC 
   LIMIT 1;
   ```

---

### Test 3: Status Workflow (IO Role)

**Login sebagai:** `io@test.com`

1. **Open Case**
   - Go to `/cases`
   - Click on case yang baru dibuat

2. **Change Status**
   - Look for **"Status Change"** component
   - Current status: "draf"
   - Available action: "Mulakan Siasatan"
   - Click action
   - Add notes (optional): "Starting investigation"
   - Confirm

3. **Verify**
   - ✅ Status changed to "dalam_siasatan"
   - ✅ Timeline updated
   - ✅ Workflow history recorded

---

### Test 4: Evidence Management (IO Role)

**Login sebagai:** `io@test.com`

1. **Navigate to Evidence**
   - Open case dengan status "dalam_siasatan"
   - Click **"Evidence"** tab atau go to `/cases/[id]/evidence`

2. **Add Evidence**
   - Click **"Add Evidence"** button
   - Fill form:
     - **Exhibit Number:** "EXH-001"
     - **Evidence Name:** "Surat Akuan"
     - **Description:** "Test evidence description"
     - **Collected Date:** Today
     - **Collected Location:** "Office"
     - **Collected By:** Auto-filled (current user)
   - Submit

3. **Verify**
   - ✅ Evidence listed in table
   - ✅ Exhibit number displayed
   - ✅ Can edit/delete evidence

---

### Test 5: Statement Recording (IO Role)

**Login sebagai:** `io@test.com`

1. **Navigate to Statements**
   - Open case
   - Click **"Statements"** tab atau go to `/cases/[id]/statements`

2. **Add Statement**
   - Click **"Add Statement"** button
   - Fill form:
     - **Person Name:** "Ahmad bin Ali"
     - **Person IC:** "123456789012"
     - **Person Role:** "Pekerja"
     - **Statement Date:** Today
     - **Statement Time:** Current time
     - **Location:** "Office"
     - **Section Reference:** Should auto-fill (S.12C for Akta 4, S.69 & 70 for Akta 800)
     - **Content:** "Test statement content"
     - **Summary:** "Test summary"
     - **Language:** "Bahasa Melayu"
   - Submit

3. **Verify**
   - ✅ Statement listed
   - ✅ Section reference auto-filled correctly
   - ✅ Can mark as signed

---

### Test 6: Review Process (PO Role)

**Login sebagai:** `io@test.com` (dulu)

1. **Change Case Status**
   - Open case
   - Change status to "menunggu_semakan"
   - Logout

**Login sebagai:** `po@test.com`

2. **Navigate to Review**
   - Go to `/cases/[id]/review`
   - Or click "Review" dari case detail page

3. **Review Case**
   - Read case summary
   - Read evidence & statements
   - Add review notes: "Case looks good, approve for sanction"
   - Click **"Approve"** atau **"Reject"**

4. **Verify**
   - ✅ If Approve: Status = "menunggu_sanksi"
   - ✅ If Reject: Status = "dalam_siasatan" (with notes)
   - ✅ Review notes saved
   - ✅ Workflow history updated

---

### Test 7: Sanction Process (UIP Role)

**Login sebagai:** `uip@test.com`

1. **Navigate to Sanction**
   - Open case dengan status "menunggu_sanksi"
   - Go to `/cases/[id]/sanction`

2. **Review & Sanction**
   - Read case summary
   - Read PO review notes
   - Choose action:
     - **Approve Sanction** → Route to:
       - Compound
       - Prosecution
       - NFA
   - Add sanction notes: "Approved for compound offer"
   - Select route: "Compound"
   - Submit

3. **Verify**
   - ✅ Status updated to "sanksi_diluluskan"
   - ✅ Sanction notes saved
   - ✅ Case ready for compound/prosecution

---

### Test 8: Compound Offer (IO/UIP Role)

**Login sebagai:** `io@test.com` atau `uip@test.com`

1. **Navigate to Compound**
   - Open case dengan status "sanksi_diluluskan"
   - Go to `/cases/[id]/compound`

2. **Create Compound Offer**
   - Click **"Create Compound Offer"** button
   - Verify:
     - ✅ Amount auto-calculated
     - ✅ Offer number auto-generated (KOMPAUN/YYYY/XXXXX)
     - ✅ Due date calculated (14 days from today)
   - Submit

3. **Verify**
   - ✅ Compound offer created
   - ✅ Case status = "dikompaun"
   - ✅ Offer listed in table

4. **Mark Payment (Optional)**
   - Click on compound offer
   - Click **"Mark as Paid"**
   - Fill:
     - Paid Date: Today
     - Paid Amount: Full amount
     - Receipt Number: "REC-001"
   - Submit
   - ✅ Status = "paid"
   - ✅ Case status = "selesai"

---

### Test 9: Document Generation

**Login sebagai:** `io@test.com` atau `admin@test.com`

1. **Navigate to Documents**
   - Open any case
   - Go to `/cases/[id]/documents`

2. **Test Each Document**
   - **Charge Sheet:** Click → Preview & Print
   - **Investigation Paper:** Click → Preview & Print
   - **Consent Letter:** Click → Preview & Print
   - **Court Summons:** Click → Preview & Print
   - **Certificate of Officer:** Click → Preview & Print
   - **Compound Letter:** Click → Preview & Print

3. **Verify**
   - ✅ All documents render correctly
   - ✅ Data populated correctly
   - ✅ Print functionality works

---

### Test 10: Reports & Analytics (Admin Role)

**Login sebagai:** `admin@test.com`

1. **Navigate to Reports**
   - Go to `/reports`

2. **Test Features**
   - ✅ Statistics displayed (total cases, by status, etc.)
   - ✅ Filter by date range
   - ✅ Filter by status
   - ✅ Filter by act type
   - ✅ Search functionality
   - ✅ Export to CSV
   - ✅ Export to Excel
   - ✅ Export to PDF

3. **Verify**
   - ✅ All statistics accurate
   - ✅ Filters work correctly
   - ✅ Export files generated

---

### Test 11: Security & Access Control

**Test dengan setiap role:**

1. **Viewer Role** (`viewer@test.com`)
   - ✅ Can view cases
   - ❌ Cannot create/edit cases
   - ❌ Cannot access review/sanction pages
   - ❌ Cannot access reports

2. **IO Role** (`io@test.com`)
   - ✅ Can create cases
   - ✅ Can edit own cases
   - ❌ Cannot edit other IO's cases
   - ❌ Cannot access review/sanction pages

3. **PO Role** (`po@test.com`)
   - ✅ Can view all cases
   - ✅ Can access review pages
   - ❌ Cannot create/edit cases
   - ❌ Cannot access sanction pages

4. **UIP Role** (`uip@test.com`)
   - ✅ Can view all cases
   - ✅ Can access sanction pages
   - ❌ Cannot create/edit cases
   - ❌ Cannot access review pages

5. **Admin Role** (`admin@test.com`)
   - ✅ Full access to everything
   - ✅ Can access reports
   - ✅ Can access audit trail

---

## ✅ TESTING CHECKLIST

### Core Features
- [ ] Login/Logout (all 5 users)
- [ ] Case Creation (IO)
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
- [ ] Audit Trail (Admin)
- [ ] Security & Access Control

---

## 🐛 TROUBLESHOOTING

### Issue: Login fails
**Check:**
- Password correct: `Test123!`
- User exists in Dashboard
- Profile exists dengan role

### Issue: Case creation fails
**Check:**
- All required fields filled
- Form validation
- Browser console untuk errors

### Issue: Status change not working
**Check:**
- User role correct
- Case status allows transition
- Workflow rules

### Issue: Access denied (403)
**Check:**
- User role correct
- RLS policies
- Case ownership (io_id)

---

## 📊 TEST RESULTS TEMPLATE

```
Test Date: ___________
Tester: ___________

| Test # | Feature | Status | Notes |
|--------|---------|--------|-------|
| 1 | Login | ✅/❌ | |
| 2 | Case Creation | ✅/❌ | |
| 3 | Status Workflow | ✅/❌ | |
| 4 | Evidence | ✅/❌ | |
| 5 | Statements | ✅/❌ | |
| 6 | Review | ✅/❌ | |
| 7 | Sanction | ✅/❌ | |
| 8 | Compound | ✅/❌ | |
| 9 | Documents | ✅/❌ | |
| 10 | Reports | ✅/❌ | |
| 11 | Security | ✅/❌ | |
```

---

## 🎯 PRIORITY TESTING

**Jika masa terhad, test ini dulu:**

1. ✅ Login (all users)
2. ✅ Case Creation
3. ✅ Status Workflow
4. ✅ Review Process
5. ✅ Security (role-based access)

---

**Status:** Ready untuk Testing! 🚀

*Ikut arahan di atas untuk comprehensive testing sistem.*
