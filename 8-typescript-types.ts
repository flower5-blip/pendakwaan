// ============================================
// src/types/index.ts
// PERKESO Prosecution Paper Builder
// TypeScript Interfaces Reference
// ============================================

// ============================================
// ENUM TYPES
// ============================================

export type TypeOfOffense =
    | 'gagal_daftar_perusahaan'
    | 'gagal_daftar_pekerja'
    | 'gagal_bayar_caruman'
    | 'gagal_simpan_rekod'
    | 'potong_gaji_pekerja';

export type CaseStatus =
    | 'draf'
    | 'dalam_siasatan'
    | 'menunggu_kompaun'
    | 'dikompaun'
    | 'menunggu_sanksi'
    | 'didakwa'
    | 'selesai';

export type ActType = 'akta4' | 'akta800';

// ============================================
// EMPLOYER INTERFACE
// ============================================

export interface Employer {
    id: string;
    namaSyarikat: string;
    noSsm: string | null;
    alamat: string | null;
    tarikhMulaOperasi: string | null; // ISO date string
    noTelefon: string | null;
    emel: string | null;
    createdAt: string;
    updatedAt: string;
}

// Form input (tanpa id dan timestamps)
export interface EmployerInput {
    namaSyarikat: string;
    noSsm?: string;
    alamat?: string;
    tarikhMulaOperasi?: string;
    noTelefon?: string;
    emel?: string;
}

// ============================================
// CASE INTERFACE
// ============================================

export interface Case {
    id: string;
    employerId: string;
    typeOfOffense: TypeOfOffense;
    actType: ActType;
    actSection: string;
    penaltySection: string;
    status: CaseStatus;
    tarikhKesalahan: string | null;
    lokasiKesalahan: string | null;
    nota: string | null;
    ioId: string | null;
    createdAt: string;
    updatedAt: string;
    // Joined relations
    employer?: Employer;
    employees?: Employee[];
}

// Form input
export interface CaseInput {
    employerId: string;
    typeOfOffense: TypeOfOffense;
    actType: ActType;
    actSection: string;
    penaltySection: string;
    status?: CaseStatus;
    tarikhKesalahan?: string;
    lokasiKesalahan?: string;
    nota?: string;
}

// ============================================
// EMPLOYEE INTERFACE
// ============================================

export interface Employee {
    id: string;
    caseId: string;
    namaPekerja: string;
    noIc: string | null;
    tarikhMasukKerja: string | null;
    jawatan: string | null;
    gajiBulanan: number | null;
    statusPendaftaran: boolean;
    createdAt: string;
}

// Form input
export interface EmployeeInput {
    caseId: string;
    namaPekerja: string;
    noIc?: string;
    tarikhMasukKerja?: string;
    jawatan?: string;
    gajiBulanan?: number;
    statusPendaftaran?: boolean;
}

// ============================================
// ACT REFERENCE INTERFACE
// ============================================

export interface ActReference {
    id: string;
    actName: string;
    offenseName: string;
    chargeSection: string;
    penaltySection: string;
    compoundSection: string | null;
    maxFine: number;
    maxImprisonment: string;
    isCompoundable: boolean;
}

// ============================================
// DATABASE ROW TYPES (Snake Case - from Supabase)
// ============================================

export interface EmployerRow {
    id: string;
    nama_syarikat: string;
    no_ssm: string | null;
    alamat: string | null;
    tarikh_mula_operasi: string | null;
    no_telefon: string | null;
    emel: string | null;
    created_at: string;
    updated_at: string;
}

export interface CaseRow {
    id: string;
    employer_id: string;
    type_of_offense: TypeOfOffense;
    act_type: ActType;
    act_section: string;
    penalty_section: string;
    status: CaseStatus;
    tarikh_kesalahan: string | null;
    lokasi_kesalahan: string | null;
    nota: string | null;
    io_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface EmployeeRow {
    id: string;
    case_id: string;
    nama_pekerja: string;
    no_ic: string | null;
    tarikh_masuk_kerja: string | null;
    jawatan: string | null;
    gaji_bulanan: number | null;
    status_pendaftaran: boolean;
    created_at: string;
}

// ============================================
// UTILITY: Convert Row to Interface
// ============================================

export function toEmployer(row: EmployerRow): Employer {
    return {
        id: row.id,
        namaSyarikat: row.nama_syarikat,
        noSsm: row.no_ssm,
        alamat: row.alamat,
        tarikhMulaOperasi: row.tarikh_mula_operasi,
        noTelefon: row.no_telefon,
        emel: row.emel,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export function toCase(row: CaseRow): Case {
    return {
        id: row.id,
        employerId: row.employer_id,
        typeOfOffense: row.type_of_offense,
        actType: row.act_type,
        actSection: row.act_section,
        penaltySection: row.penalty_section,
        status: row.status,
        tarikhKesalahan: row.tarikh_kesalahan,
        lokasiKesalahan: row.lokasi_kesalahan,
        nota: row.nota,
        ioId: row.io_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export function toEmployee(row: EmployeeRow): Employee {
    return {
        id: row.id,
        caseId: row.case_id,
        namaPekerja: row.nama_pekerja,
        noIc: row.no_ic,
        tarikhMasukKerja: row.tarikh_masuk_kerja,
        jawatan: row.jawatan,
        gajiBulanan: row.gaji_bulanan,
        statusPendaftaran: row.status_pendaftaran,
        createdAt: row.created_at,
    };
}
