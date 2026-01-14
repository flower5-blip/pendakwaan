// ============================================
// src/types/database.types.ts
// Extended Database Types for PERKESO Prosecution
// Matches Supabase schema migrations
// ============================================

// ============================================
// ENUM TYPES
// ============================================

export type ActTypeEnum = 'Akta 4' | 'Akta 800' | 'akta_4' | 'akta_800';

export type OffenseTypeEnum =
    | 'Gagal Daftar Perusahaan'
    | 'Gagal Daftar Pekerja'
    | 'Gagal Bayar Caruman'
    | 'Gagal Hadir Saman'
    | 'Gagal Daftar Majikan';

export type CaseStatusEnum =
    | 'draft'
    | 'in_progress'
    | 'pending_review'
    | 'approved'
    | 'filed'
    | 'closed'
    | 'compound_offered'
    | 'compound_paid'
    | 'prosecution'
    | 'completed'
    | 'nfa';

export type EvidenceStatusEnum =
    | 'collected'
    | 'verified'
    | 'submitted'
    | 'returned';

export type PersonRoleEnum = 'saksi' | 'oks' | 'oks_representative';

export type CompoundStatusEnum = 'pending' | 'paid' | 'expired' | 'cancelled';

export type RecommendationEnum = 'compound' | 'prosecute' | 'nfa';

// ============================================
// INTERFACE: Employer
// ============================================

export interface Employer {
    id: string;
    name?: string;
    company_name: string;
    ssm_no?: string | null;
    ssm_number?: string | null;
    employer_code: string | null;
    address: string | null;
    postcode: string | null;
    city: string | null;
    state: string | null;
    owner_name: string | null;
    owner_ic: string | null;
    phone: string | null;
    email: string | null;
    business_type?: string | null;
    registration_date?: string | null;
    created_at: string;
    updated_at: string;
}

export interface EmployerInsert {
    company_name: string;
    name?: string;
    ssm_no?: string;
    ssm_number?: string;
    employer_code?: string;
    address?: string;
    postcode?: string;
    city?: string;
    state?: string;
    owner_name?: string;
    owner_ic?: string;
    phone?: string;
    email?: string;
    business_type?: string;
}

// ============================================
// INTERFACE: Case (Prosecution Case)
// ============================================

export interface ProsecutionCase {
    id: string;
    case_number: string;
    employer_id: string;
    io_id: string | null;
    investigating_officer_id?: string | null;

    // Offense Info
    act_type: ActTypeEnum | string;
    offense_type: string;
    date_of_offense: string;
    time_of_offense: string | null;
    location_of_offense: string | null;

    // Sections
    section_charged: string;
    section_penalty: string;
    section_compound: string | null;

    // Investigation
    inspection_date: string | null;
    inspection_location: string | null;
    issue_summary?: string | null;

    // Arrears
    arrears_amount: number | null;
    arrears_period_start: string | null;
    arrears_period_end: string | null;
    total_employees_affected: number | null;

    // Status
    status: CaseStatusEnum | string;
    recommendation: RecommendationEnum | null;

    // Metadata
    notes: string | null;
    created_at: string;
    updated_at: string;
    created_by: string | null;

    // Joined Relations
    employer?: Employer;
    employees?: Employee[];
    evidences?: Evidence[];
    statements?: Statement[];
    compound_offers?: CompoundOffer[];
}

export interface CaseInsert {
    case_number: string;
    employer_id: string;
    io_id?: string;
    investigating_officer_id?: string;
    act_type: ActTypeEnum | string;
    offense_type: string;
    date_of_offense: string;
    time_of_offense?: string;
    location_of_offense?: string;
    section_charged: string;
    section_penalty: string;
    section_compound?: string;
    inspection_date?: string;
    inspection_location?: string;
    issue_summary?: string;
    arrears_amount?: number;
    arrears_period_start?: string;
    arrears_period_end?: string;
    total_employees_affected?: number;
    status?: CaseStatusEnum | string;
    recommendation?: RecommendationEnum;
    notes?: string;
    created_by?: string;
}

// ============================================
// INTERFACE: Employee (Affected Workers)
// ============================================

export interface Employee {
    id: string;
    case_id: string;
    full_name: string;
    ic_number: string | null;
    position: string | null;
    employment_start_date: string | null;
    employment_end_date: string | null;
    monthly_salary: number | null;
    is_registered: boolean;
    notes: string | null;
    created_at: string;
}

export interface EmployeeInsert {
    case_id: string;
    full_name: string;
    ic_number?: string;
    position?: string;
    employment_start_date?: string;
    employment_end_date?: string;
    monthly_salary?: number;
    is_registered?: boolean;
    notes?: string;
}

// ============================================
// INTERFACE: Evidence (Bahan Bukti)
// ============================================

export interface Evidence {
    id: string;
    case_id: string;
    exhibit_number: string;
    name: string;
    description: string | null;
    document_type: string | null;
    collected_date: string | null;
    status: EvidenceStatusEnum | string;
    file_path: string | null;
    notes: string | null;
    created_at: string;
}

export interface EvidenceInsert {
    case_id: string;
    exhibit_number: string;
    name: string;
    description?: string;
    document_type?: string;
    collected_date?: string;
    status?: EvidenceStatusEnum;
    file_path?: string;
    notes?: string;
}

// ============================================
// INTERFACE: Statement (Pernyataan)
// ============================================

export interface Statement {
    id: string;
    case_id: string;
    person_name: string;
    person_ic: string | null;
    person_role: PersonRoleEnum | string;
    statement_date: string | null;
    statement_time: string | null;
    location: string | null;
    section_reference: string | null;
    content: string | null;
    summary: string | null;
    is_signed: boolean;
    created_at: string;
}

export interface StatementInsert {
    case_id: string;
    person_name: string;
    person_ic?: string;
    person_role?: PersonRoleEnum;
    statement_date?: string;
    statement_time?: string;
    location?: string;
    section_reference?: string;
    content?: string;
    summary?: string;
    is_signed?: boolean;
}

// ============================================
// INTERFACE: Compound Offer (Tawaran Kompaun)
// ============================================

export interface CompoundOffer {
    id: string;
    case_id: string;
    offer_number: string | null;
    offer_date: string;
    due_date: string;
    amount: number;
    status: CompoundStatusEnum | string;
    paid_date: string | null;
    paid_amount: number | null;
    receipt_number: string | null;
    notes: string | null;
    created_at: string;
    created_by: string | null;
}

export interface CompoundOfferInsert {
    case_id: string;
    offer_number?: string;
    offer_date: string;
    due_date: string;
    amount: number;
    status?: CompoundStatusEnum;
    paid_date?: string;
    paid_amount?: number;
    receipt_number?: string;
    notes?: string;
    created_by?: string;
}

// ============================================
// INTERFACE: Profile (User)
// ============================================

export interface Profile {
    id: string;
    full_name: string;
    role: 'admin' | 'io' | 'po' | 'uip' | 'viewer';
    department: string | null;
    phone: string | null;
    created_at: string;
    updated_at: string;
}

// ============================================
// Form Data Types
// ============================================

export interface NewCaseFormData {
    // Employer
    company_name: string;
    ssm_number: string;
    address: string;
    owner_name: string;
    owner_ic: string;
    phone: string;
    state: string;

    // Case
    act_type: ActTypeEnum | string;
    offense_type: string;
    date_of_offense: string;
    time_of_offense: string;
    location_of_offense: string;
    section_charged: string;
    section_penalty: string;
    section_compound?: string;

    // Arrears (for caruman cases)
    arrears_amount?: number;
    arrears_period_start?: string;
    arrears_period_end?: string;

    // Notes
    notes: string;
}

// ============================================
// View Types
// ============================================

export interface CaseSummary {
    id: string;
    case_number: string;
    act_type: string;
    offense_type: string;
    date_of_offense: string;
    section_charged: string;
    section_penalty: string;
    section_compound: string | null;
    status: string;
    recommendation: string | null;
    arrears_amount: number | null;
    created_at: string;
    company_name: string;
    ssm_number: string | null;
    owner_name: string | null;
    state: string | null;
    employee_count: number;
    evidence_count: number;
}

// ============================================
// Database Response Types
// ============================================

export interface DatabaseResponse<T> {
    data: T | null;
    error: {
        message: string;
        details?: string;
        code?: string;
    } | null;
}
