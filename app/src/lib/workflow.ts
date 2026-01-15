// ============================================
// PERKESO Prosecution System
// Workflow Management - Status Transitions & Role-Based Actions
// ============================================

import type { UserRole } from "@/types";

// ============================================
// STATUS TYPES (Based on 4-database-schema.md)
// ============================================

export type CaseStatus =
    | 'draf'
    | 'dalam_siasatan'
    | 'menunggu_semakan'
    | 'menunggu_sanksi'
    | 'sanksi_diluluskan'
    | 'dikompaun'
    | 'didakwa'
    | 'selesai'
    | 'nfa';

// ============================================
// STATUS LABELS (Malay)
// ============================================

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
    draf: 'Draf',
    dalam_siasatan: 'Dalam Siasatan',
    menunggu_semakan: 'Menunggu Semakan',
    menunggu_sanksi: 'Menunggu Sanksi',
    sanksi_diluluskan: 'Sanksi Diluluskan',
    dikompaun: 'Dikompaun',
    didakwa: 'Didakwa',
    selesai: 'Selesai',
    nfa: 'NFA (Tiada Tindakan Lanjut)',
};

// ============================================
// STATUS COLORS
// ============================================

export const CASE_STATUS_COLORS: Record<CaseStatus, string> = {
    draf: 'bg-gray-100 text-gray-800',
    dalam_siasatan: 'bg-blue-100 text-blue-800',
    menunggu_semakan: 'bg-yellow-100 text-yellow-800',
    menunggu_sanksi: 'bg-orange-100 text-orange-800',
    sanksi_diluluskan: 'bg-green-100 text-green-800',
    dikompaun: 'bg-purple-100 text-purple-800',
    didakwa: 'bg-red-100 text-red-800',
    selesai: 'bg-emerald-100 text-emerald-800',
    nfa: 'bg-slate-100 text-slate-800',
};

// ============================================
// STATUS TRANSITION RULES
// ============================================

export const STATUS_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
    draf: ['dalam_siasatan'],
    dalam_siasatan: ['menunggu_semakan', 'draf'], // Can go back to draft if need revision
    menunggu_semakan: ['menunggu_sanksi', 'dalam_siasatan'], // PO can approve or reject
    menunggu_sanksi: ['sanksi_diluluskan', 'menunggu_semakan'], // UIP can approve or send back
    sanksi_diluluskan: ['dikompaun', 'didakwa', 'nfa'],
    dikompaun: ['selesai', 'didakwa'], // If compound not paid, proceed to prosecution
    didakwa: ['selesai'],
    selesai: [], // Terminal state
    nfa: [], // Terminal state
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
    draf: [
        {
            action: 'start_investigation',
            label: 'Mula Siasatan',
            targetStatus: 'dalam_siasatan',
            allowedRoles: ['io', 'admin'],
            description: 'Mula proses siasatan untuk kes ini',
        },
    ],
    dalam_siasatan: [
        {
            action: 'submit_for_review',
            label: 'Hantar untuk Semakan',
            targetStatus: 'menunggu_semakan',
            allowedRoles: ['io', 'admin'],
            description: 'Hantar kes kepada PO untuk semakan',
        },
        {
            action: 'back_to_draft',
            label: 'Kembali ke Draf',
            targetStatus: 'draf',
            allowedRoles: ['io', 'admin'],
            description: 'Kembalikan kes ke status draf untuk kemaskini',
        },
    ],
    menunggu_semakan: [
        {
            action: 'approve_review',
            label: 'Luluskan Semakan',
            targetStatus: 'menunggu_sanksi',
            allowedRoles: ['po', 'admin'],
            description: 'Luluskan semakan dan hantar kepada UIP untuk sanksi',
        },
        {
            action: 'reject_review',
            label: 'Tolak & Kembalikan',
            targetStatus: 'dalam_siasatan',
            allowedRoles: ['po', 'admin'],
            description: 'Tolak semakan dan kembalikan kepada IO untuk perbaiki',
        },
    ],
    menunggu_sanksi: [
        {
            action: 'approve_sanction',
            label: 'Luluskan Sanksi',
            targetStatus: 'sanksi_diluluskan',
            allowedRoles: ['uip', 'admin'],
            description: 'Luluskan sanksi - kes sedia untuk kompaun atau pendakwaan',
        },
        {
            action: 'reject_sanction',
            label: 'Kembalikan untuk Semakan',
            targetStatus: 'menunggu_semakan',
            allowedRoles: ['uip', 'admin'],
            description: 'Kembalikan kepada PO untuk semakan semula',
        },
    ],
    sanksi_diluluskan: [
        {
            action: 'offer_compound',
            label: 'Tawarkan Kompaun',
            targetStatus: 'dikompaun',
            allowedRoles: ['uip', 'po', 'admin'],
            description: 'Tawarkan kompaun kepada OKS',
        },
        {
            action: 'proceed_prosecution',
            label: 'Teruskan Pendakwaan',
            targetStatus: 'didakwa',
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
    dikompaun: [
        {
            action: 'compound_paid',
            label: 'Kompaun Dibayar',
            targetStatus: 'selesai',
            allowedRoles: ['io', 'po', 'admin'],
            description: 'Tandakan kompaun telah dibayar - kes selesai',
        },
        {
            action: 'compound_unpaid',
            label: 'Kompaun Tidak Dibayar',
            targetStatus: 'didakwa',
            allowedRoles: ['io', 'po', 'admin'],
            description: 'Kompaun tidak dibayar - teruskan pendakwaan',
        },
    ],
    didakwa: [
        {
            action: 'case_completed',
            label: 'Kes Selesai',
            targetStatus: 'selesai',
            allowedRoles: ['po', 'uip', 'admin'],
            description: 'Tandakan kes telah selesai selepas keputusan mahkamah',
        },
    ],
    selesai: [],
    nfa: [],
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get available actions for a case status and user role
 */
export function getAvailableActions(
    currentStatus: CaseStatus,
    userRole: UserRole
): WorkflowAction[] {
    const actions = WORKFLOW_ACTIONS[currentStatus] || [];
    return actions.filter((action) => action.allowedRoles.includes(userRole));
}

/**
 * Check if a status transition is valid
 */
export function isValidTransition(
    fromStatus: CaseStatus,
    toStatus: CaseStatus
): boolean {
    const allowedTransitions = STATUS_TRANSITIONS[fromStatus] || [];
    return allowedTransitions.includes(toStatus);
}

/**
 * Check if user can perform action
 */
export function canPerformAction(
    currentStatus: CaseStatus,
    targetStatus: CaseStatus,
    userRole: UserRole
): boolean {
    // Admin can always perform actions
    if (userRole === 'admin') return true;

    // Check if transition is valid
    if (!isValidTransition(currentStatus, targetStatus)) return false;

    // Check if user role is allowed
    const actions = WORKFLOW_ACTIONS[currentStatus] || [];
    const action = actions.find((a) => a.targetStatus === targetStatus);
    if (!action) return false;

    return action.allowedRoles.includes(userRole);
}

/**
 * Get next possible statuses for a given status
 */
export function getNextStatuses(currentStatus: CaseStatus): CaseStatus[] {
    return STATUS_TRANSITIONS[currentStatus] || [];
}

/**
 * Get workflow description for status
 */
export function getStatusDescription(status: CaseStatus): string {
    const descriptions: Record<CaseStatus, string> = {
        draf: 'Kes dalam draf - IO boleh edit dan tambah maklumat',
        dalam_siasatan: 'Kes sedang disiasat - IO sedang mengumpul bukti dan rakaman',
        menunggu_semakan: 'Kes menunggu semakan oleh PO',
        menunggu_sanksi: 'Kes menunggu sanksi oleh UIP',
        sanksi_diluluskan: 'Sanksi diluluskan - sedia untuk kompaun atau pendakwaan',
        dikompaun: 'Kompaun telah ditawarkan - menunggu bayaran',
        didakwa: 'Kes telah didakwa di mahkamah',
        selesai: 'Kes telah selesai',
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

// ============================================
// NOTIFICATION TYPES
// ============================================

export interface WorkflowNotification {
    case_id: string;
    case_number: string;
    status: CaseStatus;
    action: string;
    message: string;
    notify_roles: UserRole[];
    created_at: string;
}

/**
 * Get roles that should be notified for a status change
 */
export function getNotifyRoles(targetStatus: CaseStatus): UserRole[] {
    const roleMap: Record<CaseStatus, UserRole[]> = {
        draf: ['io'],
        dalam_siasatan: ['io'],
        menunggu_semakan: ['po'],
        menunggu_sanksi: ['uip'],
        sanksi_diluluskan: ['io', 'po', 'uip'],
        dikompaun: ['io', 'po'],
        didakwa: ['po', 'uip'],
        selesai: ['io', 'po', 'uip'],
        nfa: ['io', 'po'],
    };
    return roleMap[targetStatus] || [];
}
