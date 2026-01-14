// ============================================
// src/lib/laws.ts
// COMPLETE VERSION - 7 Top Prosecuted Offenses
// Termasuk Saman Jabatan (Gagal Hadir)
// PERKESO Prosecution System
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
}

// ============================================
// OFFENSE_MAPPING - 7 Kesalahan Lazim
// ============================================

export const OFFENSE_MAPPING = {
    // ============================================
    // AKTA 4 - Akta Keselamatan Sosial Pekerja 1969
    // ============================================
    akta_4: {
        gagal_daftar_perusahaan: {
            label: "Gagal/Lewat Daftar Perusahaan (Akta 4)",
            charge_section: "Seksyen 4, Akta Keselamatan Sosial Pekerja 1969",
            penalty_section: "Seksyen 94, Akta yang sama",
            punishment_text: "denda tidak melebihi sepuluh ribu ringgit atau penjara selama tempoh tidak melebihi dua tahun atau kedua-duanya",
            act_name: "Akta Keselamatan Sosial Pekerja 1969",
            description: "Majikan gagal mendaftarkan perusahaan dengan PERKESO dalam tempoh yang ditetapkan."
        },
        gagal_daftar_pekerja: {
            label: "Gagal/Lewat Daftar Pekerja (Akta 4)",
            charge_section: "Seksyen 5, Akta Keselamatan Sosial Pekerja 1969",
            penalty_section: "Seksyen 94, Akta yang sama",
            punishment_text: "denda tidak melebihi sepuluh ribu ringgit atau penjara selama tempoh tidak melebihi dua tahun atau kedua-duanya",
            act_name: "Akta Keselamatan Sosial Pekerja 1969",
            description: "Majikan gagal mendaftarkan pekerja dalam tempoh 30 hari dari mula bekerja."
        },
        gagal_bayar_caruman: {
            label: "Gagal Bayar Caruman (Akta 4)",
            charge_section: "Seksyen 6(1) dibaca bersama Seksyen 6(8), Akta Keselamatan Sosial Pekerja 1969",
            penalty_section: "Seksyen 94, Akta yang sama",
            punishment_text: "denda tidak melebihi sepuluh ribu ringgit atau penjara selama tempoh tidak melebihi dua tahun atau kedua-duanya",
            act_name: "Akta Keselamatan Sosial Pekerja 1969",
            description: "Majikan gagal membayar caruman PERKESO dalam tempoh yang ditetapkan."
        },
        gagal_hadir_saman: {
            label: "Gagal Mematuhi Saman / Gagal Hadir (Akta 4)",
            charge_section: "Seksyen 110(1), Akta Keselamatan Sosial Pekerja 1969",
            penalty_section: "Seksyen 110(2), Akta yang sama",
            punishment_text: "denda tidak melebihi sepuluh ribu ringgit atau penjara selama tempoh tidak melebihi dua tahun atau kedua-duanya",
            act_name: "Akta Keselamatan Sosial Pekerja 1969",
            description: "Gagal hadir ke pejabat PERKESO sebagaimana yang dikehendaki oleh saman di bawah Seksyen 12C."
        }
    },

    // ============================================
    // AKTA 800 - Akta Sistem Insurans Pekerjaan 2017
    // ============================================
    akta_800: {
        gagal_daftar_majikan: {
            label: "Gagal/Lewat Daftar Majikan (Akta 800)",
            charge_section: "Seksyen 14(1), Akta Sistem Insurans Pekerjaan 2017",
            penalty_section: "Seksyen 14(2), Akta yang sama",
            punishment_text: "denda tidak melebihi sepuluh ribu ringgit atau penjara selama tempoh tidak melebihi dua tahun atau kedua-duanya",
            act_name: "Akta Sistem Insurans Pekerjaan 2017",
            description: "Majikan gagal mendaftarkan perusahaan dengan SIP dalam tempoh yang ditetapkan."
        },
        gagal_daftar_pekerja: {
            label: "Gagal/Lewat Daftar Pekerja (Akta 800)",
            charge_section: "Seksyen 16(1), Akta Sistem Insurans Pekerjaan 2017",
            penalty_section: "Seksyen 16(2), Akta yang sama",
            punishment_text: "denda tidak melebihi sepuluh ribu ringgit atau penjara selama tempoh tidak melebihi dua tahun atau kedua-duanya",
            act_name: "Akta Sistem Insurans Pekerjaan 2017",
            description: "Majikan gagal mendaftarkan pekerja dalam tempoh 30 hari dari mula bekerja."
        },
        gagal_hadir_saman: {
            label: "Gagal Mematuhi Saman / Gagal Hadir (Akta 800)",
            charge_section: "Seksyen 70(1)(b), Akta Sistem Insurans Pekerjaan 2017",
            penalty_section: "Seksyen 70(3), Akta yang sama",
            punishment_text: "denda tidak melebihi sepuluh ribu ringgit atau penjara selama tempoh tidak melebihi dua tahun atau kedua-duanya",
            act_name: "Akta Sistem Insurans Pekerjaan 2017",
            description: "Gagal hadir di hadapan Pemeriksa sebagaimana yang dikehendaki di bawah Seksyen 70."
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
 * Auto-fill when offense is selected
 */
export function getAutoFill(actKey: ActKey, offenseKey: string) {
    const offense = getOffenseDetails(actKey, offenseKey);
    if (!offense) return null;

    return {
        charge_section: offense.charge_section,
        penalty_section: offense.penalty_section,
        punishment_text: offense.punishment_text,
        act_name: offense.act_name
    };
}

// ============================================
// ACT INFORMATION
// ============================================

export const ACT_INFO = {
    akta_4: {
        name: 'Akta 4',
        fullName: 'Akta Keselamatan Sosial Pekerja 1969',
        shortCode: 'SOCSO'
    },
    akta_800: {
        name: 'Akta 800',
        fullName: 'Akta Sistem Insurans Pekerjaan 2017',
        shortCode: 'SIP'
    }
} as const;

// ============================================
// QUICK REFERENCE TABLE
// ============================================
/*
| Akta | Kesalahan | Tuduh | Hukum |
|------|-----------|-------|-------|
| 4    | Gagal Daftar Perusahaan | S.4 | S.94 |
| 4    | Gagal Daftar Pekerja | S.5 | S.94 |
| 4    | Gagal Bayar Caruman | S.6(1)+6(8) | S.94 |
| 4    | Gagal Hadir Saman | S.110(1) | S.110(2) |
| 800  | Gagal Daftar Majikan | S.14(1) | S.14(2) |
| 800  | Gagal Daftar Pekerja | S.16(1) | S.16(2) |
| 800  | Gagal Hadir Saman | S.70(1)(b) | S.70(3) |

Semua: Denda RM10,000 / Penjara 2 tahun / Kedua-duanya
*/
