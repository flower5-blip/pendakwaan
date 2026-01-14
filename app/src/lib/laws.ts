// ============================================
// src/lib/laws.ts
// PERKESO Prosecution System
// 8 Kesalahan Lazim - Akta 4 & Akta 800
// Termasuk Maklumat Kompaun
// ============================================

// ============================================
// Types
// ============================================

export type ActKey = 'akta_4' | 'akta_800';

export interface OffenseDetail {
    label: string;
    charge_section: string;
    penalty_section: string;
    punishment_text: string;
    act_name: string;
    description?: string;
    // Compound information
    is_compoundable: boolean;
    compound_section?: string;        // e.g., "Seksyen 95A" or "Seksyen 77"
    compound_max?: number;            // Max compound amount (RM)
    compound_regulation?: string;     // For Akta 800: P.U. (A) 294
}

// ============================================
// OFFENSE_MAPPING - 8 Kesalahan Lazim
// ============================================

export const OFFENSE_MAPPING = {
    // ============================================
    // AKTA 4 - Akta Keselamatan Sosial Pekerja 1969
    // Kuasa Kompaun: Seksyen 95A (max 50% denda = RM5,000)
    // ============================================
    akta_4: {
        gagal_daftar_perusahaan: {
            label: "Gagal/Lewat Daftar Perusahaan (Akta 4)",
            charge_section: "Seksyen 4, Akta Keselamatan Sosial Pekerja 1969",
            penalty_section: "Seksyen 94(g), Akta yang sama",
            punishment_text: "denda tidak melebihi sepuluh ribu ringgit atau penjara selama tempoh tidak melebihi dua tahun atau kedua-duanya",
            act_name: "Akta Keselamatan Sosial Pekerja 1969",
            description: "Majikan gagal mendaftarkan perusahaan dengan PERKESO dalam tempoh yang ditetapkan.",
            is_compoundable: true,
            compound_section: "Seksyen 95A",
            compound_max: 5000
        },
        gagal_daftar_pekerja: {
            label: "Gagal/Lewat Daftar Pekerja (Akta 4)",
            charge_section: "Seksyen 5, Akta Keselamatan Sosial Pekerja 1969",
            penalty_section: "Seksyen 94(g), Akta yang sama",
            punishment_text: "denda tidak melebihi sepuluh ribu ringgit atau penjara selama tempoh tidak melebihi dua tahun atau kedua-duanya",
            act_name: "Akta Keselamatan Sosial Pekerja 1969",
            description: "Majikan gagal mendaftarkan pekerja dalam tempoh 30 hari dari mula bekerja.",
            is_compoundable: true,
            compound_section: "Seksyen 95A",
            compound_max: 5000
        },
        gagal_bayar_caruman: {
            label: "Gagal Bayar Caruman (Akta 4)",
            charge_section: "Seksyen 6(1) dibaca bersama Seksyen 6(8), Akta Keselamatan Sosial Pekerja 1969",
            penalty_section: "Seksyen 94(g), Akta yang sama",
            punishment_text: "denda tidak melebihi sepuluh ribu ringgit atau penjara selama tempoh tidak melebihi dua tahun atau kedua-duanya",
            act_name: "Akta Keselamatan Sosial Pekerja 1969",
            description: "Majikan gagal membayar caruman PERKESO dalam tempoh yang ditetapkan.",
            is_compoundable: true,
            compound_section: "Seksyen 95A",
            compound_max: 5000
        },
        gagal_hadir_saman: {
            label: "Gagal Mematuhi Saman / Gagal Hadir (Akta 4)",
            charge_section: "Seksyen 110(1), Akta Keselamatan Sosial Pekerja 1969",
            penalty_section: "Seksyen 110(2), Akta yang sama",
            punishment_text: "denda tidak melebihi sepuluh ribu ringgit atau penjara selama tempoh tidak melebihi dua tahun atau kedua-duanya",
            act_name: "Akta Keselamatan Sosial Pekerja 1969",
            description: "Gagal hadir ke pejabat PERKESO sebagaimana yang dikehendaki oleh saman di bawah Seksyen 12C.",
            is_compoundable: false  // Kesalahan saman biasanya terus ke pendakwaan
        }
    },

    // ============================================
    // AKTA 800 - Akta Sistem Insurans Pekerjaan 2017
    // Kuasa Kompaun: Seksyen 77 + P.U. (A) 294
    // ============================================
    akta_800: {
        gagal_daftar_majikan: {
            label: "Gagal/Lewat Daftar Majikan (Akta 800)",
            charge_section: "Seksyen 14(1), Akta Sistem Insurans Pekerjaan 2017",
            penalty_section: "Seksyen 14(2), Akta yang sama",
            punishment_text: "denda tidak melebihi sepuluh ribu ringgit atau penjara selama tempoh tidak melebihi dua tahun atau kedua-duanya",
            act_name: "Akta Sistem Insurans Pekerjaan 2017",
            description: "Majikan gagal mendaftarkan perusahaan dengan SIP dalam tempoh yang ditetapkan.",
            is_compoundable: true,
            compound_section: "Seksyen 77",
            compound_max: 5000,
            compound_regulation: "P.U. (A) 294 - Peraturan Pengkompaunan Kesalahan 2018"
        },
        gagal_daftar_pekerja: {
            label: "Gagal/Lewat Daftar Pekerja (Akta 800)",
            charge_section: "Seksyen 16(1), Akta Sistem Insurans Pekerjaan 2017",
            penalty_section: "Seksyen 16(5), Akta yang sama",
            punishment_text: "denda tidak melebihi sepuluh ribu ringgit atau penjara selama tempoh tidak melebihi dua tahun atau kedua-duanya",
            act_name: "Akta Sistem Insurans Pekerjaan 2017",
            description: "Majikan gagal mendaftarkan pekerja dalam tempoh 30 hari dari mula bekerja.",
            is_compoundable: true,
            compound_section: "Seksyen 77",
            compound_max: 5000,
            compound_regulation: "P.U. (A) 294 - Peraturan Pengkompaunan Kesalahan 2018"
        },
        gagal_bayar_caruman: {
            label: "Gagal Bayar Caruman (Akta 800)",
            charge_section: "Seksyen 18(6), Akta Sistem Insurans Pekerjaan 2017",
            penalty_section: "Seksyen 18(9), Akta yang sama",
            punishment_text: "denda tidak melebihi sepuluh ribu ringgit atau penjara selama tempoh tidak melebihi dua tahun atau kedua-duanya",
            act_name: "Akta Sistem Insurans Pekerjaan 2017",
            description: "Majikan gagal membayar caruman SIP dalam tempoh yang ditetapkan.",
            is_compoundable: true,
            compound_section: "Seksyen 77",
            compound_max: 5000,
            compound_regulation: "P.U. (A) 294 - Peraturan Pengkompaunan Kesalahan 2018"
        },
        gagal_hadir_saman: {
            label: "Gagal Mematuhi Saman / Gagal Hadir (Akta 800)",
            charge_section: "Seksyen 70(1)(b), Akta Sistem Insurans Pekerjaan 2017",
            penalty_section: "Seksyen 70(3), Akta yang sama",
            punishment_text: "denda tidak melebihi sepuluh ribu ringgit atau penjara selama tempoh tidak melebihi dua tahun atau kedua-duanya",
            act_name: "Akta Sistem Insurans Pekerjaan 2017",
            description: "Gagal hadir di hadapan Pemeriksa sebagaimana yang dikehendaki di bawah Seksyen 70.",
            is_compoundable: false  // Kesalahan saman biasanya terus ke pendakwaan
        }
    }
} as const;

// ============================================
// SEKSYEN KUASA SAMAN
// ============================================

export const SUMMONS_POWER = {
    akta_4: {
        section: "Seksyen 12C",
        description: "Kuasa untuk memeriksa orang"
    },
    akta_800: {
        section: "Seksyen 70",
        description: "Kuasa untuk menghendaki maklumat dan kehadiran"
    }
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get offense details by act and offense key
 */
export function getOffenseDetails(
    actKey: ActKey,
    offenseKey: string
): OffenseDetail | null {
    const actOffenses = OFFENSE_MAPPING[actKey];
    if (!actOffenses) return null;

    const offense = actOffenses[offenseKey as keyof typeof actOffenses];
    return offense || null;
}

/**
 * Get dropdown options for offense selection
 */
export function getOffenseOptions(actKey: ActKey): { value: string; label: string }[] {
    const actOffenses = OFFENSE_MAPPING[actKey];
    if (!actOffenses) return [];

    return Object.entries(actOffenses).map(([key, offense]) => ({
        value: key,
        label: offense.label
    }));
}

/**
 * Auto-fill when offense is selected (includes compound info)
 */
export function getAutoFill(actKey: ActKey, offenseKey: string) {
    const offense = getOffenseDetails(actKey, offenseKey);
    if (!offense) return null;

    return {
        charge_section: offense.charge_section,
        penalty_section: offense.penalty_section,
        punishment_text: offense.punishment_text,
        act_name: offense.act_name,
        // Compound info
        is_compoundable: offense.is_compoundable,
        compound_section: offense.compound_section,
        compound_max: offense.compound_max,
        compound_regulation: offense.compound_regulation
    };
}

// ============================================
// COMPOUND INFORMATION
// ============================================

export const COMPOUND_INFO = {
    akta_4: {
        section: "Seksyen 95A",
        description: "Pengkompaunan Kesalahan",
        max_percentage: 50,
        max_amount: 5000,
        fine_max: 10000,
        note: "Tawaran kompaun tidak boleh melebihi 50% daripada denda maksimum"
    },
    akta_800: {
        section: "Seksyen 77",
        description: "Pengkompaunan Kesalahan",
        max_percentage: 50,
        max_amount: 5000,
        fine_max: 10000,
        regulation: "P.U. (A) 294 - Peraturan Pengkompaunan Kesalahan 2018",
        note: "Kesalahan yang boleh dikompaun disenaraikan dalam Jadual Pertama P.U. (A) 294"
    }
} as const;

/**
 * Get compound info for an offense
 */
export function getCompoundInfo(actKey: ActKey, offenseKey: string) {
    const offense = getOffenseDetails(actKey, offenseKey);
    if (!offense || !offense.is_compoundable) return null;

    const actCompound = COMPOUND_INFO[actKey];
    return {
        is_compoundable: true,
        section: offense.compound_section || actCompound.section,
        max_amount: offense.compound_max || actCompound.max_amount,
        regulation: offense.compound_regulation,
        note: actCompound.note
    };
}

// ============================================
// ACT INFORMATION
// ============================================

export const ACT_INFO = {
    akta_4: {
        name: 'Akta 4',
        fullName: 'Akta Keselamatan Sosial Pekerja 1969',
        shortCode: 'SOCSO',
        compound_section: 'Seksyen 95A'
    },
    akta_800: {
        name: 'Akta 800',
        fullName: 'Akta Sistem Insurans Pekerjaan 2017',
        shortCode: 'SIP',
        compound_section: 'Seksyen 77'
    }
} as const;
