// ============================================
// types/database.types.ts
// PERKESO Prosecution System
// TypeScript Interfaces (matching SQL schema)
// ============================================

// ============================================
// ENUM TYPES
// ============================================

export type ActTypeEnum = 'Akta 4' | 'Akta 800';

export type OffenseTypeEnum =
    | 'Gagal Daftar Perusahaan'
    | 'Gagal Daftar Pekerja'
    | 'Lewat Daftar'
    | 'Gagal Bayar Caruman'
    | 'Gagal Simpan Rekod'
    | 'Potong Gaji Pekerja';

export type CaseStatusEnum =
    | 'Draft'
    | 'Pending Approval'
    | 'Approved'
    | 'Compound Offered'
    | 'Compound Paid'
    | 'Prosecution'
    | 'Completed'
    | 'NFA';

export type EvidenceStatusEnum =
    | 'Collected'
    | 'Verified'
    | 'Submitted'
    | 'Returned';

export type RecommendationType = 'compound' | 'prosecute' | 'nfa';

// ============================================
// INTERFACE: UserIO (Pegawai Penyiasat)
// ============================================

export interface UserIO {
    id: string;
    full_name: string;
    position: string;
    station: string;
    authority_card_no: string | null;
    phone: string | null;
    email: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface UserIOInsert {
    id: string;
    full_name: string;
    position?: string;
    station: string;
    authority_card_no?: string;
    phone?: string;
    email?: string;
    is_active?: boolean;
}

export interface UserIOUpdate {
    full_name?: string;
    position?: string;
    station?: string;
    authority_card_no?: string;
    phone?: string;
    email?: string;
    is_active?: boolean;
}

// ============================================
// INTERFACE: Employer (Majikan / OKS)
// ============================================

export interface Employer {
    id: string;
    company_name: string;
    ssm_number: string | null;
    employer_code: string | null;
    industry_code: string | null;
    industry_description: string | null;
    address: string | null;
    postcode: string | null;
    city: string | null;
    state: string | null;
    owner_name: string | null;
    owner_ic: string | null;
    phone: string | null;
    email: string | null;
    operation_start_date: string | null;
    created_at: string;
    updated_at: string;
}

export interface EmployerInsert {
    company_name: string;
    ssm_number?: string;
    employer_code?: string;
    industry_code?: string;
    industry_description?: string;
    address?: string;
    postcode?: string;
    city?: string;
    state?: string;
    owner_name?: string;
    owner_ic?: string;
    phone?: string;
    email?: string;
    operation_start_date?: string;
}

export interface EmployerUpdate {
    company_name?: string;
    ssm_number?: string;
    employer_code?: string;
    industry_code?: string;
    industry_description?: string;
    address?: string;
    postcode?: string;
    city?: string;
    state?: string;
    owner_name?: string;
    owner_ic?: string;
    phone?: string;
    email?: string;
    operation_start_date?: string;
}

// ============================================
// INTERFACE: Case (Fail Siasatan)
// ============================================

export interface Case {
    id: string;
    case_number: string;
    employer_id: string;
    investigating_officer_id: string | null;

    // Maklumat Kesalahan
    act_type: ActTypeEnum;
    offense_type: OffenseTypeEnum;
    date_of_offense: string;
    time_of_offense: string | null;
    location_of_offense: string | null;

    // Seksyen
    section_charged: string;
    section_penalty: string;
    section_compound: string | null;

    // Maklumat Siasatan
    inspection_date: string | null;
    inspection_location: string | null;

    // Tunggakan
    arrears_start_date: string | null;
    arrears_end_date: string | null;
    arrears_amount: number | null;
    interest_amount: number | null;
    total_employees_affected: number | null;

    // Status
    status: CaseStatusEnum;
    recommendation: RecommendationType | null;

    // Kompaun
    compound_amount: number | null;
    compound_offer_date: string | null;
    compound_payment_date: string | null;
    compound_status: string | null;

    // Metadata
    notes: string | null;
    created_at: string;
    updated_at: string;
    created_by: string | null;

    // Joined Relations (optional)
    employer?: Employer;
    investigating_officer?: UserIO;
    evidences?: Evidence[];
    employees?: Employee[];
    statements?: Statement[];
}

export interface CaseInsert {
    case_number: string;
    employer_id: string;
    investigating_officer_id?: string;
    act_type: ActTypeEnum;
    offense_type: OffenseTypeEnum;
    date_of_offense: string;
    time_of_offense?: string;
    location_of_offense?: string;
    section_charged: string;
    section_penalty: string;
    section_compound?: string;
    inspection_date?: string;
    inspection_location?: string;
    arrears_start_date?: string;
    arrears_end_date?: string;
    arrears_amount?: number;
    interest_amount?: number;
    total_employees_affected?: number;
    status?: CaseStatusEnum;
    recommendation?: RecommendationType;
    compound_amount?: number;
    compound_offer_date?: string;
    notes?: string;
    created_by?: string;
}

export interface CaseUpdate {
    employer_id?: string;
    investigating_officer_id?: string;
    act_type?: ActTypeEnum;
    offense_type?: OffenseTypeEnum;
    date_of_offense?: string;
    time_of_offense?: string;
    location_of_offense?: string;
    section_charged?: string;
    section_penalty?: string;
    section_compound?: string;
    inspection_date?: string;
    inspection_location?: string;
    arrears_start_date?: string;
    arrears_end_date?: string;
    arrears_amount?: number;
    interest_amount?: number;
    total_employees_affected?: number;
    status?: CaseStatusEnum;
    recommendation?: RecommendationType;
    compound_amount?: number;
    compound_offer_date?: string;
    compound_payment_date?: string;
    compound_status?: string;
    notes?: string;
}

// ============================================
// INTERFACE: Evidence (Bukti)
// ============================================

export interface Evidence {
    id: string;
    case_id: string;
    exhibit_number: string;
    name: string;
    description: string | null;
    document_type: string | null;
    collected_date: string | null;
    collected_location: string | null;
    collected_by: string | null;
    file_url: string | null;
    file_type: string | null;
    file_size: number | null;
    status: EvidenceStatusEnum;
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
    collected_location?: string;
    collected_by?: string;
    file_url?: string;
    file_type?: string;
    file_size?: number;
    status?: EvidenceStatusEnum;
    notes?: string;
}

export interface EvidenceUpdate {
    exhibit_number?: string;
    name?: string;
    description?: string;
    document_type?: string;
    collected_date?: string;
    collected_location?: string;
    collected_by?: string;
    file_url?: string;
    file_type?: string;
    file_size?: number;
    status?: EvidenceStatusEnum;
    notes?: string;
}

// ============================================
// INTERFACE: Employee (Pekerja Terlibat)
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
    registration_date: string | null;
    role_in_case: string;
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
    registration_date?: string;
    role_in_case?: string;
    notes?: string;
}

export interface EmployeeUpdate {
    full_name?: string;
    ic_number?: string;
    position?: string;
    employment_start_date?: string;
    employment_end_date?: string;
    monthly_salary?: number;
    is_registered?: boolean;
    registration_date?: string;
    role_in_case?: string;
    notes?: string;
}

// ============================================
// INTERFACE: Statement (Rakaman Percakapan)
// ============================================

export interface Statement {
    id: string;
    case_id: string;
    person_name: string;
    person_ic: string | null;
    person_role: string | null;
    statement_date: string;
    statement_time: string | null;
    location: string | null;
    section_reference: string | null;
    content: string | null;
    summary: string | null;
    language: string;
    interpreter_name: string | null;
    is_signed: boolean;
    signature_url: string | null;
    recorded_by: string | null;
    created_at: string;
}

export interface StatementInsert {
    case_id: string;
    person_name: string;
    person_ic?: string;
    person_role?: string;
    statement_date: string;
    statement_time?: string;
    location?: string;
    section_reference?: string;
    content?: string;
    summary?: string;
    language?: string;
    interpreter_name?: string;
    is_signed?: boolean;
    signature_url?: string;
    recorded_by?: string;
}

export interface StatementUpdate {
    person_name?: string;
    person_ic?: string;
    person_role?: string;
    statement_date?: string;
    statement_time?: string;
    location?: string;
    section_reference?: string;
    content?: string;
    summary?: string;
    language?: string;
    interpreter_name?: string;
    is_signed?: boolean;
    signature_url?: string;
}

// ============================================
// INTERFACE: ActReference (Rujukan Seksyen)
// ============================================

export interface ActReference {
    id: string;
    code: string;
    act_name: string;
    offense_name: string;
    charge_section: string;
    penalty_section: string;
    compound_section: string | null;
    statement_section: string | null;
    max_fine: number;
    max_imprisonment: string;
    is_compoundable: boolean;
    notes: string | null;
    created_at: string;
}

// ============================================
// DATABASE TYPE (for Supabase client)
// ============================================

export interface Database {
    public: {
        Tables: {
            users_io: {
                Row: UserIO;
                Insert: UserIOInsert;
                Update: UserIOUpdate;
            };
            employers: {
                Row: Employer;
                Insert: EmployerInsert;
                Update: EmployerUpdate;
            };
            cases: {
                Row: Case;
                Insert: CaseInsert;
                Update: CaseUpdate;
            };
            evidences: {
                Row: Evidence;
                Insert: EvidenceInsert;
                Update: EvidenceUpdate;
            };
            employees: {
                Row: Employee;
                Insert: EmployeeInsert;
                Update: EmployeeUpdate;
            };
            statements: {
                Row: Statement;
                Insert: StatementInsert;
                Update: StatementUpdate;
            };
            act_references: {
                Row: ActReference;
                Insert: never;
                Update: never;
            };
        };
        Enums: {
            act_type_enum: ActTypeEnum;
            offense_type_enum: OffenseTypeEnum;
            case_status_enum: CaseStatusEnum;
            evidence_status_enum: EvidenceStatusEnum;
        };
    };
}
