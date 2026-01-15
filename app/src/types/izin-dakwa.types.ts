// ============================================
// types/izin-dakwa.types.ts
// TypeScript types for Izin Dakwa (Consent to Prosecute)
// ============================================

export type IzinDakwaStatus = 'diminta' | 'diluluskan' | 'ditolak';

export interface IzinDakwa {
    id: string;
    case_id: string;

    // Request Info
    request_date: string;
    section_reference: string;
    requested_by: string | null;
    request_notes: string | null;

    // Status
    status: IzinDakwaStatus;

    // Approval Info
    approved_date: string | null;
    approved_by: string | null;
    approval_notes: string | null;

    // Supporting Document
    document_url: string | null;
    document_name: string | null;

    // Metadata
    created_at: string;
    updated_at: string;
}

export interface IzinDakwaInsert {
    case_id: string;
    request_date?: string;
    section_reference: string;
    requested_by?: string;
    request_notes?: string;
    status?: IzinDakwaStatus;
    document_url?: string;
    document_name?: string;
}

export interface IzinDakwaUpdate {
    status?: IzinDakwaStatus;
    approved_date?: string;
    approved_by?: string;
    approval_notes?: string;
    document_url?: string;
    document_name?: string;
}

// Helper function to check if prosecution consent is approved
export function hasApprovedConsent(izinDakwa: IzinDakwa | null | undefined): boolean {
    return izinDakwa?.status === 'diluluskan';
}

// Helper function to get section reference based on act type
export function getConsentSection(actType: 'akta4' | 'akta800'): string {
    return actType === 'akta4' ? 'Seksyen 95 Akta 4' : 'Seksyen 76 Akta 800';
}
