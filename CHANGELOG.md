# CHANGELOG - Sistem Pendakwaan PERKESO

> Rekod perubahan yang dibuat kepada sistem

---

## [v2.1.0] - 2026-01-15

### Penambahbaikan Logik Bisnes

#### ✅ Fasa 1: Pembetulan Kritikal

**Fail:** `app/src/app/(dashboard)/cases/[id]/charges/page.tsx`

1. **Bypass Status Transition Diperbaiki**
   - Gantikan akses langsung DB dengan Server Action `updateCaseStatus()`
   - Kini dikuatkuasakan melalui `isValidTransition()` dan `canPerformAction()`

2. **Validasi Tarikh Pendengaran**
   - Tambah atribut `min` pada input tarikh
   - Tambah semakan JavaScript sebelum submit
   - Tarikh lampau tidak lagi dibenarkan

3. **Prerequisites Check**
   - Dikuatkuasakan melalui Server Action

---

#### ✅ Fasa 2: Refactoring & Database

**Fail:** `app/src/app/actions/workflow-actions.ts`

1. **Server Action Baru: `approveSanctionWithRoute()`**
   - Menggabungkan kelulusan sanksi dan penetapan laluan
   - Mengelakkan race condition dari double update
   - Validasi role (UIP/Admin sahaja)
   - Audit trail automatik

**Fail:** `app/src/app/(dashboard)/cases/[id]/sanction/page.tsx`

2. **Refactor Double Status Update**
   - Sebelum: 2 panggilan `updateCaseStatus()` berturutan
   - Selepas: 1 panggilan `approveSanctionWithRoute()`

**Fail Baru:**

3. **Jadual `izin_dakwa`**
   - Migration: `supabase/migrations/20260115_add_izin_dakwa.sql`
   - Types: `app/src/types/izin-dakwa.types.ts`
   - Merekod kelulusan izin pendakwaan (Seksyen 95 Akta 4 / Seksyen 76 Akta 800)

---

#### ✅ Fasa 3: RLS & Dokumentasi

**Migration:** `supabase/migrations/20260115_add_status_validation.sql`

1. **Database Trigger: `validate_case_status_transition()`**
   - Validasi transisi status di peringkat database
   - Menghalang transisi tidak sah walaupun melalui SQL terus
   - Error message yang jelas untuk debugging

---

## Migrations Diperlukan

Jalankan migrations berikut dalam Supabase SQL Editor:

1. `supabase/migrations/20260115_add_izin_dakwa.sql`
2. `supabase/migrations/20260115_add_status_validation.sql`

---

## Breaking Changes

Tiada breaking changes. Semua perubahan adalah backward compatible.

---

## Risiko

| Perubahan | Risiko | Mitigasi |
|-----------|--------|----------|
| Database trigger | Kes sedia ada mungkin gagal update jika status tidak sah | Audit dahulu sebelum apply |
| Jadual baru | Tiada | DDL sahaja, tiada data migration |
