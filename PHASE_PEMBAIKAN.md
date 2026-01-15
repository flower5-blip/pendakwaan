# PHASE PEMBAIKAN SISTEM PENDAKWAAN PERKESO
## Pelan Kerja Pembaikan & Penyempurnaan Sistem

**Tarikh:** Januari 2026  
**Status:** Draf untuk Kelulusan  
**Berdasarkan:** Audit Report + Fail Panduan 1-26

---

## SENARAI KANDUNGAN

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Analisis Gap - Flow Semasa vs Flow Lengkap](#2-analisis-gap)
3. [Fasa Pembaikan](#3-fasa-pembaikan)
4. [Jadual Pelaksanaan](#4-jadual-pelaksanaan)
5. [Sumber & Anggaran](#5-sumber--anggaran)

---

## 1. RINGKASAN EKSEKUTIF

### 1.1 Flow Lengkap Sistem (Berdasarkan Fail Panduan 1-26)

```
1. LOGIN / AUTHENTICATION
   ↓
2. DASHBOARD (Overview Kes)
   ↓
3. PEMERIKSAAN (Create Case)
   ├── Maklumat Majikan/OKS
   ├── Maklumat Kesalahan (Akta 4 / Akta 800)
   ├── Auto-fill Sections (Seksyen Pertuduhan, Hukuman, Kompaun)
   └── Maklumat Pemeriksaan
   ↓
4. SIASATAN (Investigation Phase)
   ├── Tambah Pekerja Terlibat
   ├── Tambah Bukti/Eksibit (Dokumen, Foto, Rakaman)
   ├── Rantaian Jagaan (Chain of Custody)
   ├── Rakaman Percakapan (S.112/12C/70)
   │   ├── Wakil Majikan
   │   ├── Pekerja
   │   └── Saksi
   └── Maklumat Tunggakan (jika ada)
   ↓
5. SEMAKAN (Review Phase - PO)
   ├── IO Submit untuk Semakan
   ├── PO Review Kertas Minit
   ├── PO Approve atau Reject
   └── Jika Reject → Kembali ke IO untuk Perbaiki
   ↓
6. SANKSI (Sanction Phase - UIP)
   ├── PO Submit untuk Sanksi
   ├── UIP Review dan Sahkan
   ├── UIP Setujui Kompaun ATAU Pendakwaan
   └── Status: Sanksi Diluluskan
   ↓
7A. KOMPAUN (Compound Path)
   ├── Buat Tawaran Kompaun
   ├── Hantar Notifikasi
   ├── Track Bayaran
   ├── Jika Bayar → Kes Selesai
   └── Jika Tidak Bayar → Ke 7B
   ↓
7B. PENDAKWAAN (Prosecution Path)
   ├── Buat Kertas Pertuduhan
   ├── Fail di Mahkamah
   ├── Track Court Dates
   └── Kes Selesai setelah Keputusan
   ↓
8. DOKUMEN GENERATION
   ├── Kertas Minit Siasatan
   ├── Kertas Pertuduhan
   ├── Surat Izin Dakwa
   ├── Saman Mahkamah
   └── Perakuan Pegawai
   ↓
9. LAPORAN & AUDIT
   ├── Audit Trail (Semua Tindakan)
   ├── Laporan Statistik
   └── Export Data
```

### 1.2 Flow Semasa (Implementation Status)

```
1. LOGIN ✅ WORKING
   ↓
2. DASHBOARD ✅ WORKING (Basic)
   ↓
3. CREATE CASE ⚠️ PARTIAL
   ├── Majikan ✅
   ├── Kesalahan ❌ (Collect but NOT SAVE)
   ├── Sections ❌ (Collect but NOT SAVE)
   └── Pemeriksaan ✅
   ↓
4. VIEW CASE ✅ WORKING (Display Only)
   ↓
5. VIEW DOCUMENTS ✅ WORKING (Display Only)
   ↓
❌ NO WORKFLOW IMPLEMENTATION
❌ NO EVIDENCE MANAGEMENT
❌ NO STATEMENT RECORDING
❌ NO REVIEW/SANCTION PROCESS
❌ NO COMPOUND OFFER
❌ NO PROSECUTION TRACKING
```

### 1.3 Critical Gaps

| No | Gap | Priority | Impact |
|---|-----|----------|--------|
| 1 | Case creation tidak save prosecution fields | P0 | CRITICAL - Data Loss |
| 2 | Tiada workflow implementation | P0 | CRITICAL - No Legal Compliance |
| 3 | Tiada evidence management UI | P1 | HIGH - Chain of custody missing |
| 4 | Tiada statement recording | P1 | HIGH - Legal requirement |
| 5 | Tiada review/sanction process | P0 | CRITICAL - No approval workflow |
| 6 | Tiada compound offer system | P1 | HIGH - Core feature missing |
| 7 | Schema inconsistency | P0 | CRITICAL - System may break |
| 8 | Security vulnerabilities (RLS) | P0 | CRITICAL - Data breach risk |

---

## 2. ANALISIS GAP

### 2.1 Database Schema Gap

#### Schema yang Dikehendaki (dari 4-database-schema.md):
- ✅ `profiles` - Ada tapi nama `profiles` bukan `users_io`
- ✅ `majikan_oks` - Ada tapi nama `employers` (English)
- ⚠️ `kes` - Ada tapi struktur tidak lengkap
- ❌ `pekerja` - Ada tapi nama `persons` (tak match)
- ❌ `rujukan_akta` - **MISSING** (Critical untuk auto-fill)
- ❌ `kesalahan_kes` - **MISSING** (Link kes ↔ kesalahan)
- ⚠️ `bukti` - Ada tapi nama `evidences` (OK)
- ❌ `rantaian_jagaan` - **MISSING**
- ⚠️ `pernyataan` - Ada tapi nama `statements` (OK)
- ⚠️ `kompaun` - Ada tapi nama `compound_offers` (OK)
- ❌ `pertuduhan` - **MISSING** (Charge sheet records)
- ⚠️ `log_audit` - Ada tapi nama `audit_trail` (OK)

#### Tindakan:
1. ✅ **Standardize naming** - **DECIDED: English** (untuk consistency dengan industry standard, libraries, dan database)
2. **Create missing tables** - `act_references`, `case_offenses`, `chain_of_custody`, `charges`
3. **Add missing fields** - Lengkapkan `cases` table dengan semua fields dari documentation

### 2.2 Case Creation Gap

#### Fields yang Collect tetapi TIDAK DISAVE:

**Current Implementation** (app/src/app/(dashboard)/cases/new/page.tsx:95-108):
```typescript
.insert({
    case_number: formData.case_number,
    employer_id: employerId || null,
    io_id: profile?.id,
    status: "draft",
    act_type: formData.act_type,
    inspection_date: formData.inspection_date || null,
    inspection_location: formData.inspection_location || null,
    issue_summary: formData.issue_summary || null,
    notes: formData.notes || null,
    created_by: profile?.id,
})
// ❌ MISSING: offense_type, section_charged, section_penalty, date_of_offense
```

#### Fields yang PERLU ditambah:
- `offense_type` - Jenis kesalahan (required)
- `date_of_offense` - Tarikh kesalahan (required)
- `time_of_offense` - Masa kesalahan (optional)
- `location_of_offense` - Lokasi kesalahan (optional)
- `section_charged` - Seksyen pertuduhan (required)
- `section_penalty` - Seksyen hukuman (required)
- `section_compound` - Seksyen kompaun (optional)
- `punca_siasatan` - Punca siasatan (optional)
- `tarikh_mula_layak` - Tarikh mula layak (optional)
- `tempoh_tunggakan_mula` - Tempoh tunggakan mula (optional)
- `tempoh_tunggakan_tamat` - Tempoh tunggakan tamat (optional)
- `jumlah_caruman` - Jumlah caruman (optional)
- `jumlah_fclb` - Jumlah FCLB (optional)
- `bil_pekerja_terlibat` - Bilangan pekerja terlibat (optional)
- `syor_io` - Syor IO (kompaun/dakwa/nfa)

### 2.3 Workflow Gap

#### Workflow yang PERLU diimplementasi:

1. **Status Transitions:**
   ```
   draft → dalam_siasatan → menunggu_semakan → menunggu_sanksi → 
   sanksi_diluluskan → dikompaun/didakwa → selesai/nfa
   ```

2. **Role-Based Actions:**
   - **IO:** Create, Edit, Submit for Review
   - **PO:** Review, Approve, Reject, Submit for Sanction
   - **UIP:** Sanction, Approve Compound/Prosecution
   - **Admin:** All actions

3. **Approval Workflow:**
   - IO creates case → `draft`
   - IO submits → `menunggu_semakan` (notify PO)
   - PO reviews → Approve → `menunggu_sanksi` (notify UIP) OR Reject → `draf` (notify IO)
   - UIP sanctions → `sanksi_diluluskan` → Route to Compound or Prosecution

---

## 3. FASA PEMBAIKAN

### FASA 0: CRITICAL FIXES (P0) - Minggu 1-2

#### 3.1.1 Fix Case Creation (P0 - CRITICAL)
**Tujuan:** Pastikan semua data prosecution disimpan

**Tugas:**
1. ✅ Update case creation form untuk save semua fields
2. ✅ Add validation untuk required fields
3. ✅ Test data integrity
4. ✅ Add error handling

**Fail Terlibat:**
- `app/src/app/(dashboard)/cases/new/page.tsx`
- `app/src/hooks/use-cases.ts`
- `app/src/types/index.ts`

**Deliverable:**
- Case creation menyimpan semua prosecution fields
- Validation working
- Error messages user-friendly

**Anggaran:** 3 hari

---

#### 3.1.2 Fix Database Schema (P0 - CRITICAL)
**Tujuan:** Standardize schema dan tambah missing tables

**Tugas:**
1. ✅ Create migration untuk standardize table names
2. ✅ Create `act_references` table (from 5-act-references.csv)
3. ✅ Create `case_offenses` linking table
4. ✅ Create `chain_of_custody` table
5. ✅ Create `charges` table untuk pertuduhan
6. ✅ Add missing fields ke `cases` table
7. ✅ Update RLS policies dengan proper role checks

**Fail Terlibat:**
- `app/supabase/migrations/003_fix_schema.sql` (NEW)
- `app/src/types/database.types.ts`
- `app/src/hooks/use-cases.ts`

**Deliverable:**
- All tables created
- Schema consistent
- RLS policies secure

**Anggaran:** 5 hari

---

#### 3.1.3 Fix Security Issues (P0 - CRITICAL)
**Tujuan:** Fix RLS policies dan remove default role assignment

**Tugas:**
1. ✅ Fix RLS policies - Remove overly permissive policies
2. ✅ Add role-based access control
3. ✅ Remove auto-role assignment di use-auth.ts
4. ✅ Add admin interface untuk manage roles
5. ✅ Test role permissions

**Fail Terlibat:**
- `app/supabase/migrations/004_fix_rls_policies.sql` (NEW)
- `app/src/hooks/use-auth.ts`
- `app/src/app/(dashboard)/admin/users/page.tsx`

**Deliverable:**
- Secure RLS policies
- Role-based access working
- Admin can manage roles

**Anggaran:** 3 hari

---

### FASA 1: CORE WORKFLOW (P1) - Minggu 3-5

#### 3.2.1 Implement Status Workflow (P1 - HIGH)
**Tujuan:** Implement status transitions dengan role checks

**Tugas:**
1. ✅ Create workflow service/utility
2. ✅ Implement status transition logic
3. ✅ Add role-based validation
4. ✅ Create status change UI
5. ✅ Add notifications untuk status changes
6. ✅ Add workflow history/timeline

**Fail Terlibat:**
- `app/src/lib/workflow.ts` (NEW)
- `app/src/app/(dashboard)/cases/[id]/status/page.tsx` (NEW)
- `app/src/components/workflow/StatusChange.tsx` (NEW)
- `app/src/components/workflow/Timeline.tsx` (NEW)

**Deliverable:**
- Status workflow working
- Role-based transitions
- Timeline component
- Notifications

**Anggaran:** 7 hari

---

#### 3.2.2 Review & Sanction Process (P1 - HIGH)
**Tujuan:** Implement PO review dan UIP sanction workflow

**Tugas:**
1. ✅ Create review page untuk PO
2. ✅ Create sanction page untuk UIP
3. ✅ Add review comments/notes
4. ✅ Add approval/rejection workflow
5. ✅ Add email notifications
6. ✅ Add review history

**Fail Terlibat:**
- `app/src/app/(dashboard)/cases/[id]/review/page.tsx` (NEW)
- `app/src/app/(dashboard)/cases/[id]/sanction/page.tsx` (NEW)
- `app/src/components/case/ReviewForm.tsx` (NEW)
- `app/src/components/case/SanctionForm.tsx` (NEW)
- `app/src/lib/notifications.ts` (NEW)

**Deliverable:**
- Review workflow complete
- Sanction workflow complete
- Email notifications working

**Anggaran:** 8 hari

---

#### 3.2.3 Evidence Management (P1 - HIGH)
**Tujuan:** Full evidence management dengan chain of custody

**Tugas:**
1. ✅ Create evidence upload UI
2. ✅ Integrate Supabase Storage
3. ✅ Create evidence list page
4. ✅ Implement chain of custody tracking
5. ✅ Add evidence viewing/downloading
6. ✅ Add evidence tagging/categorization

**Fail Terlibat:**
- `app/src/app/(dashboard)/cases/[id]/evidence/page.tsx` (NEW)
- `app/src/components/evidence/EvidenceUpload.tsx` (NEW)
- `app/src/components/evidence/EvidenceList.tsx` (NEW)
- `app/src/components/evidence/ChainOfCustody.tsx` (NEW)
- `app/src/lib/storage.ts` (NEW)

**Deliverable:**
- Evidence upload working
- Chain of custody tracking
- Evidence management complete

**Anggaran:** 7 hari

---

#### 3.2.4 Statement Recording (P1 - HIGH)
**Tujuan:** Record statements dengan signature capture

**Tugas:**
1. ✅ Create statement recording form
2. ✅ Add statement templates (S.112, S.12C, S.70)
3. ✅ Add signature capture (digital/touchpad)
4. ✅ Add statement approval workflow
5. ✅ Add statement viewing/downloading

**Fail Terlibat:**
- `app/src/app/(dashboard)/cases/[id]/statements/page.tsx` (NEW)
- `app/src/components/statements/StatementForm.tsx` (NEW)
- `app/src/components/statements/SignatureCapture.tsx` (NEW)
- `app/src/components/statements/StatementView.tsx` (NEW)

**Deliverable:**
- Statement recording working
- Signature capture working
- Statement templates complete

**Anggaran:** 6 hari

---

### FASA 2: PROSECUTION FEATURES (P2) - Minggu 6-8

#### 3.3.1 Compound Offer System (P2 - MEDIUM)
**Tujuan:** Full compound offer dan payment tracking

**Tugas:**
1. ✅ Create compound offer creation UI
2. ✅ Auto-calculate compound amount (max 50% denda)
3. ✅ Add compound offer letter generation
4. ✅ Add payment tracking
5. ✅ Add payment receipt generation
6. ✅ Add compound expiry tracking
7. ✅ Auto-status update jika expired

**Fail Terlibat:**
- `app/src/app/(dashboard)/cases/[id]/compound/page.tsx` (NEW)
- `app/src/components/compound/CompoundOfferForm.tsx` (NEW)
- `app/src/components/compound/PaymentTracking.tsx` (NEW)
- `app/src/components/documents/CompoundLetter.tsx` (NEW)
- `app/src/lib/compound.ts` (NEW)

**Deliverable:**
- Compound offer creation
- Payment tracking
- Receipt generation
- Expiry tracking

**Anggaran:** 6 hari

---

#### 3.3.2 Prosecution Filing (P2 - MEDIUM)
**Tujuan:** Charge sheet creation dan court filing tracking

**Tugas:**
1. ✅ Enhance charge sheet generation
2. ✅ Add charge sheet approval workflow
3. ✅ Add court filing tracking
4. ✅ Add court date management
5. ✅ Add hearing tracking
6. ✅ Add judgment recording

**Fail Terlibat:**
- `app/src/app/(dashboard)/cases/[id]/charges/page.tsx` (NEW)
- `app/src/components/charges/ChargeSheetForm.tsx` (NEW)
- `app/src/components/charges/CourtFiling.tsx` (NEW)
- `app/src/components/charges/HearingTracking.tsx` (NEW)

**Deliverable:**
- Charge sheet workflow
- Court filing tracking
- Hearing management

**Anggaran:** 7 hari

---

#### 3.3.3 Document Generation Enhancement (P2 - MEDIUM)
**Tujuan:** Server-side PDF generation dan template management

**Tugas:**
1. ✅ Implement server-side PDF generation (jsPDF/Puppeteer)
2. ✅ Add PDF storage
3. ✅ Add template management
4. ✅ Enhance print styling
5. ✅ Add batch document generation

**Fail Terlibat:**
- `app/src/lib/pdf-generator.ts` (NEW)
- `app/src/app/api/documents/generate/route.ts` (NEW)
- `app/src/components/documents/DocumentGenerator.tsx` (NEW)

**Deliverable:**
- PDF generation working
- Templates manageable
- Batch generation

**Anggaran:** 5 hari

---

### FASA 3: ENHANCEMENTS (P3) - Minggu 9-10

#### 3.4.1 Reporting & Analytics (P3 - LOW)
**Tujuan:** Dashboard analytics dan reporting

**Tugas:**
1. ✅ Enhanced dashboard statistics
2. ✅ Case reports (Excel/PDF export)
3. ✅ Statistics charts
4. ✅ Compliance reports
5. ✅ Trend analysis

**Fail Terlibat:**
- `app/src/app/(dashboard)/reports/page.tsx` (NEW)
- `app/src/components/reports/CaseReport.tsx` (NEW)
- `app/src/lib/export.ts` (NEW)

**Deliverable:**
- Enhanced dashboard
- Report generation
- Export functionality

**Anggaran:** 5 hari

---

#### 3.4.2 Email Notifications (P3 - LOW)
**Tujuan:** Email notifications untuk workflow events

**Tugas:**
1. ✅ Integrate email service (Resend/SendGrid)
2. ✅ Create email templates
3. ✅ Add notification preferences
4. ✅ Add email queue system
5. ✅ Add email logs

**Fail Terlibat:**
- `app/src/lib/email.ts` (NEW)
- `app/src/app/api/notifications/route.ts` (NEW)
- Email templates (NEW)

**Deliverable:**
- Email notifications working
- Templates ready
- Queue system

**Anggaran:** 4 hari

---

#### 3.4.3 Audit Trail UI (P3 - LOW)
**Tujuan:** View dan search audit logs

**Tugas:**
1. ✅ Create audit trail viewer
2. ✅ Add filtering/search
3. ✅ Add export functionality
4. ✅ Add audit report generation

**Fail Terlibat:**
- `app/src/app/(dashboard)/audit/page.tsx` (ENHANCE)
- `app/src/components/audit/AuditViewer.tsx` (NEW)

**Deliverable:**
- Audit trail viewer
- Search/filter working
- Export functionality

**Anggaran:** 3 hari

---

## 4. JADUAL PELAKSANAAN

### Timeline Overview

```
Minggu 1-2:  FASA 0 - Critical Fixes (P0)
Minggu 3-5:  FASA 1 - Core Workflow (P1)
Minggu 6-8:  FASA 2 - Prosecution Features (P2)
Minggu 9-10: FASA 3 - Enhancements (P3)
Minggu 11:   Testing & Bug Fixes
Minggu 12:   UAT & Deployment Preparation
```

### Detailed Schedule

| Minggu | Fasa | Tugas Utama | Deliverable |
|--------|------|-------------|-------------|
| **1** | P0 | Fix Case Creation<br>Fix Database Schema | Case creation save semua fields<br>Schema standardized |
| **2** | P0 | Fix Security Issues<br>Testing | RLS policies secure<br>Basic testing done |
| **3** | P1 | Status Workflow<br>Review Process | Workflow working<br>Review page ready |
| **4** | P1 | Sanction Process<br>Evidence Management | Sanction workflow<br>Evidence upload |
| **5** | P1 | Statement Recording<br>Testing | Statement recording<br>P1 testing |
| **6** | P2 | Compound Offer System | Compound creation & tracking |
| **7** | P2 | Prosecution Filing | Charge sheet & court tracking |
| **8** | P2 | Document Generation<br>Testing | PDF generation<br>P2 testing |
| **9** | P3 | Reporting & Analytics | Reports & exports |
| **10** | P3 | Email Notifications<br>Audit Trail UI | Notifications working<br>Audit viewer |
| **11** | QA | Integration Testing<br>Bug Fixes | All features tested |
| **12** | UAT | User Acceptance Testing<br>Deployment Prep | UAT complete<br>Deploy ready |

---

## 5. SUMBER & ANGGARAN

### 5.1 Team Required

| Role | FTE | Duration | Tasks |
|------|-----|----------|-------|
| Full Stack Developer | 1.0 | 12 weeks | Development semua fasa |
| UI/UX Designer | 0.5 | 4 weeks | Design workflow screens |
| QA Tester | 0.5 | 4 weeks | Testing FASA 1-3 |
| Project Manager | 0.25 | 12 weeks | Coordination |

### 5.2 Technology Stack (Additional)

| Technology | Purpose | Cost |
|------------|---------|------|
| PDF Generation Library (jsPDF/Puppeteer) | Server-side PDF | Free |
| Email Service (Resend/SendGrid) | Email notifications | ~$10/month |
| Supabase Storage | File storage | Included in plan |
| Testing Framework (Jest/Playwright) | Testing | Free |

### 5.3 Effort Estimation

| Fasa | Effort (Days) | Dependencies |
|------|---------------|--------------|
| FASA 0 | 11 days | None |
| FASA 1 | 28 days | FASA 0 |
| FASA 2 | 18 days | FASA 1 |
| FASA 3 | 12 days | FASA 2 |
| Testing | 10 days | All phases |
| **TOTAL** | **79 days** (~16 weeks) | |

### 5.4 Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Schema migration issues | Test migrations on staging first |
| Data loss during migration | Backup before migration |
| Integration issues | Incremental integration & testing |
| Timeline delays | Buffer time included in estimates |
| Scope creep | Strict prioritization (P0 → P1 → P2 → P3) |

---

## 6. KRITERIA KEBERHASILAN

### 6.1 Phase 0 Success Criteria
- ✅ Case creation menyimpan semua prosecution fields
- ✅ Database schema standardized dan complete
- ✅ RLS policies secure (role-based access)
- ✅ No security vulnerabilities
- ✅ All tests passing

### 6.2 Phase 1 Success Criteria
- ✅ Status workflow working dengan role checks
- ✅ Review dan sanction process complete
- ✅ Evidence management dengan chain of custody
- ✅ Statement recording dengan signature
- ✅ Email notifications working

### 6.3 Phase 2 Success Criteria
- ✅ Compound offer creation & tracking
- ✅ Prosecution filing & court tracking
- ✅ PDF document generation
- ✅ All documents printable/downloadable

### 6.4 Phase 3 Success Criteria
- ✅ Reporting & analytics dashboard
- ✅ Export functionality (Excel/PDF)
- ✅ Email notifications untuk semua events
- ✅ Audit trail viewer complete

### 6.5 Overall Success Criteria
- ✅ All workflows complete dari Login → Pendakwaan
- ✅ All documents generatable
- ✅ No critical bugs
- ✅ Performance acceptable (<2s page load)
- ✅ Security audit passed
- ✅ User acceptance testing passed

---

## 7. KESIMPULAN

### 7.1 Summary
Sistem memerlukan **12 minggu** untuk mencapai production-ready state dengan:
- **FASA 0 (2 minggu):** Critical fixes untuk data integrity & security
- **FASA 1 (3 minggu):** Core workflow implementation
- **FASA 2 (3 minggu):** Prosecution features (compound & court)
- **FASA 3 (2 minggu):** Enhancements (reports, notifications)
- **QA & UAT (2 minggu):** Testing & deployment prep

### 7.2 Next Steps
1. ✅ Approve phase pembaikan
2. ✅ Allocate resources
3. ✅ Setup development environment
4. ✅ Start FASA 0 - Critical Fixes
5. ✅ Weekly progress review

---

**Dokumen ini adalah pelan kerja yang perlu dikemaskini mengikut progress sebenar.**

*Versi 1.0 - Januari 2026*
