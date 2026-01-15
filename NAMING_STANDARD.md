# NAMING STANDARD - ENGLISH

## Prinsip Penamaan

**Standard:** English naming untuk semua code (variables, functions, types, constants)

### Alasan Pilih English:
1. ✅ **Industry Standard** - English adalah standard dalam programming
2. ✅ **Library Compatibility** - Semua libraries menggunakan English
3. ✅ **Database Consistency** - Supabase/PostgreSQL menggunakan English
4. ✅ **Team Collaboration** - Easier untuk international developers
5. ✅ **Code Readability** - Standard naming conventions (camelCase, PascalCase, etc.)

---

## Naming Conventions

### 1. Variables & Functions (camelCase)
```typescript
// ✅ Correct
const caseData = {...}
const employerName = "..."
function calculateCompoundAmount() {...}
function getAvailableActions() {...}

// ❌ Avoid
const dataKes = {...}
const namaMajikan = "..."
function kiraJumlahKompaun() {...}
```

### 2. Types & Interfaces (PascalCase)
```typescript
// ✅ Correct
interface CaseData {...}
type CaseStatus = "..."
interface CompoundOffer {...}

// ❌ Avoid
interface DataKes {...}
type StatusKes = "..."
```

### 3. Constants (UPPER_SNAKE_CASE)
```typescript
// ✅ Correct
const CASE_STATUS_LABELS = {...}
const ACT_TYPE_LABELS = {...}
const MAX_COMPOUND_AMOUNT = 10000

// ❌ Avoid
const LABEL_STATUS_KES = {...}
const MAKSIMUM_KOMPAUN = 10000
```

### 4. Database Tables & Columns (snake_case)
```typescript
// ✅ Correct (matching database)
table: cases, employers, compound_offers
columns: case_number, employer_id, offer_date

// ❌ Avoid
table: kes, majikan_oks
columns: nombor_kes, id_majikan
```

### 5. File Names (kebab-case)
```typescript
// ✅ Correct
case-detail-page.tsx
compound-offer-form.tsx
workflow-actions.ts

// ❌ Avoid
halaman-detail-kes.tsx
borang-tawaran-kompaun.tsx
```

---

## Display Labels (UI Only)

**Exception:** UI labels dan user-facing text menggunakan Bahasa Melayu

```typescript
// ✅ Correct - Display labels in Malay
const CASE_STATUS_LABELS = {
    draf: 'Draf',
    dalam_siasatan: 'Dalam Siasatan',
    menunggu_semakan: 'Menunggu Semakan',
    // ...
}

// ✅ Correct - User messages in Malay
alert('Kes berjaya dicipta!')
<p>Nama Majikan: {employer.name}</p>
```

---

## Current Codebase Status

### ✅ Already Following English Standard:
- Database tables: `cases`, `employers`, `compound_offers`
- Type definitions: `CaseStatus`, `WorkflowAction`, `CompoundOffer`
- Function names: `calculateCompoundAmount()`, `getAvailableActions()`
- Constants: `CASE_STATUS_LABELS`, `ACT_TYPE_LABELS`

### ⚠️ Need Review:
- Some variable names might mix English/Malay (check during code review)
- Comments should be in English for code, Malay for user-facing docs

---

## Examples

### ✅ Good Examples:
```typescript
// Variable naming
const caseData: CaseData = {...}
const employerList: Employer[] = [...]
const compoundAmount: number = 1000

// Function naming
function calculateCompoundAmount(penalty: number): number {...}
function getAvailableActions(status: CaseStatus): WorkflowAction[] {...}
function exportToCSV(data: any[]): void {...}

// Type naming
interface CaseData {
    caseNumber: string
    employerId: string
    status: CaseStatus
}

// Constants
const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
    draf: 'Draf',  // Display label in Malay
    dalam_siasatan: 'Dalam Siasatan',
    // ...
}
```

### ❌ Avoid:
```typescript
// ❌ Malay variable names
const dataKes = {...}
const senaraiMajikan = [...]
const jumlahKompaun = 1000

// ❌ Malay function names
function kiraJumlahKompaun() {...}
function dapatkanTindakanTersedia() {...}

// ❌ Mixed naming
const caseData = {...}  // English
const dataMajikan = {...}  // Malay - inconsistent!
```

---

## Summary

**Code:** English naming (variables, functions, types, constants)  
**UI Labels:** Malay (user-facing text, display labels)  
**Comments:** English for code documentation, Malay for user guides

**Rule of thumb:** If it's code, use English. If it's what users see, use Malay.
