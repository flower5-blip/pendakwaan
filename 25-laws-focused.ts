// ============================================
// src/lib/laws.ts
// FOCUSED VERSION - Top 5 Prosecuted Offenses Only
// PERKESO Prosecution System
// ============================================

// ============================================
// Types
// ============================================

export type ActKey = 'akta_4' | 'akta_800';
export type OffenseKey =
    | 'gagal_daftar_perusahaan'
    | 'gagal_daftar_pekerja'
    | 'gagal_bayar_caruman'
    | 'gagal_daftar_majikan';

export interface OffenseDetail {
    label: string;
    charge_section: string;
    penalty_section: string;
    punishment_text: string;
    act_name: string;
}

// ============================================
// OFFENSE_MAPPING - Top 5 Kesalahan Lazim
// ============================================

export const OFFENSE_MAPPING = {
    akta_4: {
        gagal_daftar_perusahaan: {
            label: "Gagal/Lewat Daftar Perusahaan (Akta 4)",
            charge_section: "Seksyen 4, Akta Keselamatan Sosial Pekerja 1969",
            penalty_section: "Seksyen 94, Akta yang sama",
            punishment_text: "denda tidak melebihi sepuluh ribu ringgit atau penjara selama tempoh tidak melebihi dua tahun atau kedua-duanya",
            act_name: "Akta Keselamatan Sosial Pekerja 1969"
        },
        gagal_daftar_pekerja: {
            label: "Gagal/Lewat Daftar Pekerja (Akta 4)",
            charge_section: "Seksyen 5, Akta Keselamatan Sosial Pekerja 1969",
            penalty_section: "Seksyen 94, Akta yang sama",
            punishment_text: "denda tidak melebihi sepuluh ribu ringgit atau penjara selama tempoh tidak melebihi dua tahun atau kedua-duanya",
            act_name: "Akta Keselamatan Sosial Pekerja 1969"
        },
        gagal_bayar_caruman: {
            label: "Gagal Bayar Caruman (Akta 4)",
            charge_section: "Seksyen 6(1) dibaca bersama Seksyen 6(8), Akta Keselamatan Sosial Pekerja 1969",
            penalty_section: "Seksyen 94, Akta yang sama",
            punishment_text: "denda tidak melebihi sepuluh ribu ringgit atau penjara selama tempoh tidak melebihi dua tahun atau kedua-duanya",
            act_name: "Akta Keselamatan Sosial Pekerja 1969"
        }
    },
    akta_800: {
        gagal_daftar_majikan: {
            label: "Gagal/Lewat Daftar Majikan (Akta 800)",
            charge_section: "Seksyen 14(1), Akta Sistem Insurans Pekerjaan 2017",
            penalty_section: "Seksyen 14(2), Akta yang sama",
            punishment_text: "denda tidak melebihi sepuluh ribu ringgit atau penjara selama tempoh tidak melebihi dua tahun atau kedua-duanya",
            act_name: "Akta Sistem Insurans Pekerjaan 2017"
        },
        gagal_daftar_pekerja: {
            label: "Gagal/Lewat Daftar Pekerja (Akta 800)",
            charge_section: "Seksyen 16(1), Akta Sistem Insurans Pekerjaan 2017",
            penalty_section: "Seksyen 16(2), Akta yang sama",
            punishment_text: "denda tidak melebihi sepuluh ribu ringgit atau penjara selama tempoh tidak melebihi dua tahun atau kedua-duanya",
            act_name: "Akta Sistem Insurans Pekerjaan 2017"
        }
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
 * Auto-fill pertuduhan text based on selection
 */
export function getChargeText(
    actKey: ActKey,
    offenseKey: string,
    data: {
        companyName: string;
        ssmNumber?: string;
        dateOfOffense: string;
        timeOfOffense?: string;
        location: string;
        district: string;
        state: string;
    }
): string {
    const offense = getOffenseDetails(actKey, offenseKey);
    if (!offense) return '';

    const { companyName, ssmNumber, dateOfOffense, timeOfOffense, location, district, state } = data;
    const time = timeOfOffense || '10.00 pagi';
    const ssm = ssmNumber ? ` (No. SSM: ${ssmNumber})` : '';

    return `Bahawa kamu, ${companyName}${ssm}, pada ${dateOfOffense} lebih kurang jam ${time} di ${location} dalam daerah ${district}, dalam negeri ${state}, sebagai seorang majikan, telah melakukan kesalahan di bawah ${offense.charge_section} dan boleh dihukum di bawah ${offense.penalty_section} dengan ${offense.punishment_text}.`;
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
// PUNISHMENT STANDARD TEXT
// ============================================

export const PUNISHMENT_TEXT = {
    standard: "denda tidak melebihi sepuluh ribu ringgit atau penjara selama tempoh tidak melebihi dua tahun atau kedua-duanya",
    formatted: "Denda tidak melebihi RM10,000.00 ATAU Penjara tidak melebihi 2 tahun ATAU kedua-duanya sekali"
} as const;

// ============================================
// QUICK REFERENCE TABLE
// ============================================
/*
| Akta | Kesalahan | Tuduh | Hukum | Denda |
|------|-----------|-------|-------|-------|
| 4    | Gagal Daftar Perusahaan | S.4 | S.94 | RM10K/2thn |
| 4    | Gagal Daftar Pekerja | S.5 | S.94 | RM10K/2thn |
| 4    | Gagal Bayar Caruman | S.6(1)+6(8) | S.94 | RM10K/2thn |
| 800  | Gagal Daftar Majikan | S.14(1) | S.14(2) | RM10K/2thn |
| 800  | Gagal Daftar Pekerja | S.16(1) | S.16(2) | RM10K/2thn |
*/
