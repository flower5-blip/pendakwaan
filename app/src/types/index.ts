export type UserRole = "admin" | "io" | "po" | "uip" | "viewer";
// Updated to match workflow from 4-database-schema.md
export type CaseStatus = 
    | "draf" 
    | "dalam_siasatan" 
    | "menunggu_semakan" 
    | "menunggu_sanksi" 
    | "sanksi_diluluskan" 
    | "dikompaun" 
    | "didakwa" 
    | "selesai" 
    | "nfa";
export type EvidenceStatus = "draft" | "ready" | "need_fix";
export type ActType = "akta4" | "akta800" | "both";
export type PersonRole = "saksi" | "oks" | "pekerja";

export interface Profile {
    id: string;
    full_name: string;
    role: UserRole;
    department?: string;
    phone?: string;
    created_at: string;
    updated_at: string;
}

export interface Employer {
    id: string;
    name: string;
    ssm_no?: string;
    address?: string;
    phone?: string;
    email?: string;
    business_type?: string;
    registration_date?: string;
    created_at: string;
    updated_at: string;
}

export interface Case {
    id: string;
    case_number: string;
    employer_id?: string;
    employer?: Employer;
    io_id?: string;
    io?: Profile;
    status: CaseStatus;
    act_type: ActType;
    inspection_date?: string;
    inspection_location?: string;
    issue_summary?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    created_by?: string;
}

export interface Person {
    id: string;
    case_id: string;
    name: string;
    ic_number?: string;
    role: PersonRole;
    phone?: string;
    address?: string;
    employment_start_date?: string;
    employment_end_date?: string;
    position?: string;
    salary?: number;
    notes?: string;
    created_at: string;
}

export interface AuditTrail {
    id: string;
    table_name: string;
    record_id: string;
    action: "create" | "update" | "delete";
    old_data?: Record<string, unknown>;
    new_data?: Record<string, unknown>;
    user_id?: string;
    user?: Profile;
    created_at: string;
}

export interface Evidence {
    id: string;
    case_id: string;
    name: string;
    description?: string;
    file_url?: string;
    file_type?: string;
    status: EvidenceStatus;
    exhibit_number?: string;
    collected_date?: string;
    collected_by?: string;
    chain_of_custody?: ChainOfCustody[];
    created_at: string;
    updated_at: string;
}

export interface ChainOfCustody {
    id: string;
    evidence_id: string;
    action: string;
    from_person?: string;
    to_person?: string;
    location?: string;
    notes?: string;
    timestamp: string;
    recorded_by?: string;
}
