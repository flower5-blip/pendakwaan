// ============================================
// PERKESO Prosecution System
// Workflow Management - Status Transitions & Role-Based Actions
// SYNCHRONIZED WITH DATABASE SCHEMA
// ============================================

import type { UserRole, CaseStatus } from "@/types";

// Re-export CaseStatus from types for convenience
export type { CaseStatus } from "@/types";

// ============================================
// STATUS LABELS (Malay for UI display)
// ============================================

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
    draft: 'Draf',
    in_progress: 'Dalam Siasatan',
    pending_review: 'Menunggu Semakan',
    approved: 'Diluluskan',
    filed: 'Difailkan',
    closed: 'Ditutup',
    compound_offered: 'Kompaun Ditawarkan',
    compound_paid: 'Kompaun Dibayar',
    prosecution: 'Dalam Pendakwaan',
    completed: 'Selesai',
    nfa: 'NFA (Tiada Tindakan Lanjut)',
};

// ============================================
// STATUS COLORS
// ============================================

export const CASE_STATUS_COLORS: Record<CaseStatus, string> = {
    draft: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    pending_review: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    filed: 'bg-indigo-100 text-indigo-800',
    closed: 'bg-slate-100 text-slate-800',
    compound_offered: 'bg-orange-100 text-orange-800',
    compound_paid: 'bg-purple-100 text-purple-800',
    prosecution: 'bg-red-100 text-red-800',
    completed: 'bg-emerald-100 text-emerald-800',
    nfa: 'bg-slate-100 text-slate-800',
};

// ============================================
// STATUS TRANSITION RULES
// ============================================

export const STATUS_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
    draft: ['in_progress'],
    in_progress: ['pending_review', 'draft'],
    pending_review: ['approved', 'in_progress'],
    approved: ['compound_offered', 'prosecution', 'nfa'],
    filed: ['prosecution'],
    closed: [],
    compound_offered: ['compound_paid', 'prosecution'],
    compound_paid: ['completed'],
    prosecution: ['completed'],
    completed: [],
    nfa: [],
};

// ============================================
// ROLE-BASED ACTIONS
// ============================================

export interface WorkflowAction {
    action: string;
    label: string;
    targetStatus: CaseStatus;
    allowedRoles: UserRole[];
    description: string;
}

export const WORKFLOW_ACTIONS: Record<CaseStatus, WorkflowAction[]> = {
    draft: [
        {
            action: 'start_investigation',
            label: 'Mula Siasatan',
            targetStatus: 'in_progress',
            allowedRoles: ['io', 'admin'],
            description: 'Mula proses siasatan untuk kes ini',
        },
    ],
    in_progress: [
        {
            action: 'submit_for_review',
            label: 'Hantar untuk Semakan',
            targetStatus: 'pending_review',
            allowedRoles: ['io', 'admin'],
            description: 'Hantar kes kepada PO untuk semakan',
        },
        {
            action: 'back_to_draft',
            label: 'Kembali ke Draf',
            targetStatus: 'draft',
            allowedRoles: ['io', 'admin'],
            description: 'Kembalikan kes ke status draf untuk kemaskini',
        },
    ],
    pending_review: [
        {
            action: 'approve_review',
            label: 'Luluskan Semakan',
            targetStatus: 'approved',
            allowedRoles: ['po', 'uip', 'admin'],
            description: 'Luluskan semakan kes',
        },
        {
            action: 'reject_review',
            label: 'Tolak & Kembalikan',
            targetStatus: 'in_progress',
            allowedRoles: ['po', 'admin'],
            description: 'Tolak semakan dan kembalikan kepada IO untuk perbaiki',
        },
    ],
    approved: [
        {
            action: 'offer_compound',
            label: 'Tawarkan Kompaun',
            targetStatus: 'compound_offered',
            allowedRoles: ['uip', 'po', 'admin'],
            description: 'Tawarkan kompaun kepada OKS',
        },
        {
            action: 'proceed_prosecution',
            label: 'Teruskan Pendakwaan',
            targetStatus: 'prosecution',
            allowedRoles: ['uip', 'po', 'admin'],
            description: 'Teruskan dengan pendakwaan di mahkamah',
        },
        {
            action: 'close_nfa',
            label: 'Tutup (NFA)',
            targetStatus: 'nfa',
            allowedRoles: ['uip', 'admin'],
            description: 'Tutup kes dengan status NFA (Tiada Tindakan Lanjut)',
        },
    ],
    filed: [
        {
            action: 'proceed_prosecution',
            label: 'Teruskan Pendakwaan',
            targetStatus: 'prosecution',
            allowedRoles: ['po', 'admin'],
            description: 'Teruskan dengan pendakwaan di mahkamah',
        },
    ],
    closed: [],
    compound_offered: [
        {
            action: 'compound_paid',
            label: 'Kompaun Dibayar',
            targetStatus: 'compound_paid',
            allowedRoles: ['io', 'po', 'admin'],
            description: 'Tandakan kompaun telah dibayar',
        },
        {
            action: 'compound_unpaid',
            label: 'Kompaun Tidak Dibayar',
            targetStatus: 'prosecution',
            allowedRoles: ['io', 'po', 'admin'],
            description: 'Kompaun tidak dibayar - teruskan pendakwaan',
        },
    ],
    compound_paid: [
        {
            action: 'case_completed',
            label: 'Kes Selesai',
            targetStatus: 'completed',
            allowedRoles: ['io', 'po', 'admin'],
            description: 'Tandakan kes telah selesai',
        },
    ],
    prosecution: [
        {
            action: 'case_completed',
            label: 'Kes Selesai',
            targetStatus: 'completed',
            allowedRoles: ['po', 'uip', 'admin'],
            description: 'Tandakan kes telah selesai selepas keputusan mahkamah',
        },
    ],
    completed: [],
    nfa: [],
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getAvailableActions(
    currentStatus: CaseStatus,
    userRole: UserRole
): WorkflowAction[] {
    const actions = WORKFLOW_ACTIONS[currentStatus] || [];
    return actions.filter((action) => action.allowedRoles.includes(userRole));
}

export function isValidTransition(
    fromStatus: CaseStatus,
    toStatus: CaseStatus
): boolean {
    const allowedTransitions = STATUS_TRANSITIONS[fromStatus] || [];
    return allowedTransitions.includes(toStatus);
}

export function canPerformAction(
    currentStatus: CaseStatus,
    targetStatus: CaseStatus,
    userRole: UserRole
): boolean {
    if (userRole === 'admin') return true;
    if (!isValidTransition(currentStatus, targetStatus)) return false;

    const actions = WORKFLOW_ACTIONS[currentStatus] || [];
    const action = actions.find((a) => a.targetStatus === targetStatus);
    if (!action) return false;

    return action.allowedRoles.includes(userRole);
}

export function getNextStatuses(currentStatus: CaseStatus): CaseStatus[] {
    return STATUS_TRANSITIONS[currentStatus] || [];
}

export function getStatusDescription(status: CaseStatus): string {
    const descriptions: Record<CaseStatus, string> = {
        draft: 'Kes dalam draf - IO boleh edit dan tambah maklumat',
        in_progress: 'Kes sedang disiasat - IO sedang mengumpul bukti',
        pending_review: 'Kes menunggu semakan oleh PO/UIP',
        approved: 'Kes diluluskan - sedia untuk kompaun atau pendakwaan',
        filed: 'Kes telah difailkan',
        closed: 'Kes telah ditutup',
        compound_offered: 'Kompaun telah ditawarkan - menunggu bayaran',
        compound_paid: 'Kompaun telah dibayar',
        prosecution: 'Kes dalam pendakwaan di mahkamah',
        completed: 'Kes telah selesai',
        nfa: 'Kes ditutup - Tiada Tindakan Lanjut',
    };
    return descriptions[status] || '';
}

// ============================================
// WORKFLOW HISTORY TYPES
// ============================================

export interface WorkflowHistory {
    id: string;
    case_id: string;
    from_status: CaseStatus;
    to_status: CaseStatus;
    action: string;
    performed_by: string;
    performed_by_name?: string;
    notes?: string;
    created_at: string;
}

export function getNotifyRoles(targetStatus: CaseStatus): UserRole[] {
    const roleMap: Record<CaseStatus, UserRole[]> = {
        draft: ['io'],
        in_progress: ['io'],
        pending_review: ['po', 'uip'],
        approved: ['io', 'po', 'uip'],
        filed: ['po'],
        closed: ['io', 'po'],
        compound_offered: ['io', 'po'],
        compound_paid: ['io', 'po'],
        prosecution: ['po', 'uip'],
        completed: ['io', 'po', 'uip'],
        nfa: ['io', 'po'],
    };
    return roleMap[targetStatus] || [];
}
