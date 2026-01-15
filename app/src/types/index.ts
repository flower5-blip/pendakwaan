// ============================================
// src/types/index.ts
// UNIFIED Types for PERKESO Prosecution System
// This is the SINGLE source of truth for all types
// Synchronized with Supabase database schema
// ============================================

// ============================================
// ENUM TYPES - Must match database exactly
// ============================================

export type UserRole = 'admin' | 'io' | 'po' | 'uip' | 'viewer';

// Case Status - Using English to match database enum
export type CaseStatus =
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

// Act Type - Standard format
export type ActType = 'akta_4' | 'akta_800';

// Evidence Status
export type EvidenceStatus = 'collected' | 'verified' | 'submitted' | 'returned';

// Person Role
export type PersonRole = 'saksi' | 'oks' | 'oks_representative';

// Compound Status
export type CompoundStatus = 'pending' | 'paid' | 'expired' | 'cancelled';

// Recommendation
export type Recommendation = 'compound' | 'prosecute' | 'nfa';

// ============================================
// INTERFACE: Profile (User)
// Table: profiles
// ============================================

export interface Profile {
    id: string;
    full_name: string;
    role: UserRole;
    department: string | null;
    phone: string | null;
    created_at: string;
    updated_at: string;
}

// ============================================
// INTERFACE: Employer (Majikan)
// Table: employers
// ============================================

export interface Employer {
    id: string;
    company_name: string;
    ssm_number: string | null;
    employer_code: string | null;
    address: string | null;
    postcode: string | null;
    city: string | null;
    state: string | null;
    owner_name: string | null;
    owner_ic: string | null;
    phone: string | null;
    email: string | null;
    business_type: string | null;
    registration_date: string | null;
    created_at: string;
    updated_at: string;
}

export interface EmployerInsert {
    company_name: string;
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
// INTERFACE: Case (Kes Pendakwaan)
// Table: cases
// ============================================

export interface Case {
    id: string;
    case_number: string;
    employer_id: string;
    io_id: string | null;

    // Offense Info
    act_type: ActType;
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
    issue_summary: string | null;

    // Arrears
    arrears_amount: number | null;
    arrears_period_start: string | null;
    arrears_period_end: string | null;
    total_employees_affected: number | null;

    // Status
    status: CaseStatus;
    recommendation: Recommendation | null;

    // Metadata
    notes: string | null;
    created_at: string;
    updated_at: string;
    created_by: string | null;

    // Joined Relations (optional)
    employer?: Employer;
    io?: Profile;
    employees?: Employee[];
    evidences?: Evidence[];
    statements?: Statement[];
    compound_offers?: CompoundOffer[];
}

export interface CaseInsert {
    case_number: string;
    employer_id: string;
    io_id?: string;
    act_type: ActType;
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
    status?: CaseStatus;
    recommendation?: Recommendation;
    notes?: string;
    created_by?: string;
}

// ============================================
// INTERFACE: Employee (Pekerja Terlibat)
// Table: employees
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
// Table: evidences
// ============================================

export interface Evidence {
    id: string;
    case_id: string;
    exhibit_number: string;
    name: string;
    description: string | null;
    document_type: string | null;
    collected_date: string | null;
    status: EvidenceStatus;
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
    status?: EvidenceStatus;
    file_path?: string;
    notes?: string;
}

// ============================================
// INTERFACE: Statement (Pernyataan)
// Table: statements
// ============================================

export interface Statement {
    id: string;
    case_id: string;
    person_name: string;
    person_ic: string | null;
    person_role: PersonRole;
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
    person_role?: PersonRole;
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
// Table: compound_offers
// ============================================

export interface CompoundOffer {
    id: string;
    case_id: string;
    offer_number: string | null;
    offer_date: string;
    due_date: string;
    amount: number;
    status: CompoundStatus;
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
    status?: CompoundStatus;
    paid_date?: string;
    paid_amount?: number;
    receipt_number?: string;
    notes?: string;
    created_by?: string;
}

// ============================================
// INTERFACE: Audit Trail
// Table: audit_trail
// ============================================

export interface AuditTrail {
    id: string;
    table_name: string;
    record_id: string;
    action: 'create' | 'update' | 'delete';
    old_data?: Record<string, unknown>;
    new_data?: Record<string, unknown>;
    user_id: string | null;
    user?: Profile;
    created_at: string;
}

// ============================================
// Helper Types for Forms
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
    act_type: ActType;
    offense_type: string;
    date_of_offense: string;
    time_of_offense: string;
    location_of_offense: string;
    section_charged: string;
    section_penalty: string;
    section_compound?: string;

    // Arrears
    arrears_amount?: number;
    arrears_period_start?: string;
    arrears_period_end?: string;

    // Notes
    notes: string;
}
