// ============================================
// PERKESO Prosecution System
// Compound Calculation & Management Utilities
// ============================================

import type { CaseStatus } from '@/lib/workflow';

// ============================================
// TYPES
// ============================================

export interface CompoundCalculation {
    baseAmount: number;
    maxCompound: number; // Max 50% of penalty
    recommendedAmount: number;
    minAmount: number;
    calculationNotes: string[];
}

export interface CompoundOffer {
    id: string;
    case_id: string;
    offer_number: string;
    offer_date: string;
    due_date: string;
    amount: number;
    status: 'pending' | 'paid' | 'expired' | 'cancelled';
    paid_date?: string | null;
    paid_amount?: number | null;
    receipt_number?: string | null;
    notes?: string | null;
    created_at: string;
}

// ============================================
// COMPOUND CALCULATION
// ============================================

/**
 * Calculate compound amount based on offense and penalty
 * Rule: Max compound = 50% of maximum penalty
 */
export function calculateCompoundAmount(
    penaltySection: string,
    offenseType: string,
    arrearsAmount?: number | null
): CompoundCalculation {
    const notes: string[] = [];
    let baseAmount = 0;
    let maxPenalty = 0;

    // Base calculation from penalty section
    // Default max penalty for PERKESO offenses: RM 10,000 (Akta 4) or RM 20,000 (Akta 800)
    if (penaltySection.includes('Akta 4') || penaltySection.includes('Akta Keselamatan Sosial')) {
        maxPenalty = 10000;
        notes.push('Akta 4: Denda maksimum RM 10,000');
    } else if (penaltySection.includes('Akta 800') || penaltySection.includes('Sistem Insurans')) {
        maxPenalty = 20000;
        notes.push('Akta 800: Denda maksimum RM 20,000');
    } else {
        // Default assumption
        maxPenalty = 10000;
        notes.push('Denda maksimum dianggarkan RM 10,000');
    }

    // Max compound = 50% of max penalty
    const maxCompound = maxPenalty * 0.5;
    notes.push(`Kompaun maksimum: 50% daripada denda maksimum = RM ${maxCompound.toLocaleString('ms-MY')}`);

    // Base amount calculation
    if (arrearsAmount && arrearsAmount > 0) {
        // If there are arrears, compound is typically 10-20% of arrears
        baseAmount = arrearsAmount * 0.15; // 15% of arrears
        notes.push(`Tunggakan: RM ${arrearsAmount.toLocaleString('ms-MY')}`);
        notes.push(`Kompaun asas (15% tunggakan): RM ${baseAmount.toLocaleString('ms-MY')}`);
    } else {
        // Base compound for non-arrears offenses
        // Typical range: RM 500 - RM 2,000 depending on offense severity
        if (offenseType.includes('Gagal Daftar')) {
            baseAmount = 1000;
            notes.push('Kesalahan: Gagal Daftar - Kompaun asas RM 1,000');
        } else if (offenseType.includes('Gagal Bayar')) {
            baseAmount = 1500;
            notes.push('Kesalahan: Gagal Bayar - Kompaun asas RM 1,500');
        } else if (offenseType.includes('Lewat')) {
            baseAmount = 500;
            notes.push('Kesalahan: Lewat - Kompaun asas RM 500');
        } else {
            baseAmount = 1000;
            notes.push('Kompaun asas: RM 1,000');
        }
    }

    // Recommended amount (between base and max, but not exceeding max)
    const recommendedAmount = Math.min(baseAmount, maxCompound);
    const minAmount = Math.min(500, maxCompound); // Minimum RM 500

    notes.push(`Jumlah disyorkan: RM ${recommendedAmount.toLocaleString('ms-MY')}`);
    notes.push(`Jumlah minimum: RM ${minAmount.toLocaleString('ms-MY')}`);

    return {
        baseAmount,
        maxCompound,
        recommendedAmount,
        minAmount,
        calculationNotes: notes,
    };
}

/**
 * Generate compound offer number
 * Format: KOMPAUN/YYYY/XXXXX
 */
export function generateCompoundOfferNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `KOMPAUN/${year}/${random}`;
}

/**
 * Calculate due date (typically 14 days from offer date)
 */
export function calculateDueDate(offerDate: string, days: number = 14): string {
    const date = new Date(offerDate);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

/**
 * Check if compound offer is expired
 */
export function isCompoundExpired(dueDate: string): boolean {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
}

/**
 * Get days until expiry
 */
export function getDaysUntilExpiry(dueDate: string): number {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = due.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Format compound amount for display
 */
export function formatCompoundAmount(amount: number): string {
    return `RM ${amount.toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ============================================
// COMPOUND STATUS HELPERS
// ============================================

export const COMPOUND_STATUS_LABELS: Record<string, string> = {
    pending: 'Menunggu Bayaran',
    paid: 'Telah Dibayar',
    expired: 'Telah Luput',
    cancelled: 'Dibatalkan',
};

export const COMPOUND_STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    expired: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
};
