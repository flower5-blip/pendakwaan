// ============================================
// src/lib/laws.ts
// Constant Mapping untuk Akta 4 & Akta 800
// PERKESO Prosecution System
// ============================================

// ============================================
// Types
// ============================================

export type ActKey = 'akta_4' | 'akta_800';

export interface OffenseDetails {
    code: string;
    name: string;
    section_charge: string;
    section_penalty: string;
    section_compound: string;
    section_statement: string;
    max_fine: number;
    max_imprisonment: string;
    is_compoundable: boolean;
    description: string;
    elements: string[];
}

export type OffenseMapping = Record<ActKey, Record<string, OffenseDetails>>;

// ============================================
// OFFENSE_MAPPING - Data Sebenar dari Akta
// ============================================

export const OFFENSE_MAPPING: OffenseMapping = {
    // ============================================
    // AKTA 4 - Akta Keselamatan Sosial Pekerja 1969
    // ============================================
    'akta_4': {
        'gagal_daftar_perusahaan': {
            code: 'A4_01',
            name: 'Gagal Daftar Perusahaan',
            section_charge: 'Seksyen 4',
            section_penalty: 'Seksyen 94(g)',
            section_compound: 'Seksyen 95A',
            section_statement: 'Seksyen 12C',
            max_fine: 10000,
            max_imprisonment: '2 tahun',
            is_compoundable: true,
            description: 'Majikan yang menjalankan perusahaan yang dinyatakan dalam Jadual Pertama gagal untuk mendaftarkan perusahaannya dengan Pertubuhan dalam tempoh yang ditetapkan.',
            elements: [
                'Majikan menjalankan perusahaan yang dinyatakan dalam Jadual Pertama',
                'Gagal mendaftarkan perusahaan dengan PERKESO',
                'Dalam tempoh yang ditetapkan oleh Akta',
            ],
        },

        'gagal_daftar_pekerja': {
            code: 'A4_02',
            name: 'Gagal Daftar/Menginsuranskan Pekerja',
            section_charge: 'Seksyen 5',
            section_penalty: 'Seksyen 94(g)',
            section_compound: 'Seksyen 95A',
            section_statement: 'Seksyen 12C',
            max_fine: 10000,
            max_imprisonment: '2 tahun',
            is_compoundable: true,
            description: 'Majikan utama gagal untuk menginsuranskan setiap pekerjanya yang layak dalam tempoh 30 hari dari tarikh pekerja mula bekerja.',
            elements: [
                'Wujud hubungan majikan-pekerja (Contract of Service)',
                'Pekerja layak di bawah Akta',
                'Gagal menginsuranskan dalam tempoh 30 hari',
                'Pekerja tidak berdaftar dalam sistem PERKESO',
            ],
        },

        'gagal_bayar_caruman': {
            code: 'A4_03',
            name: 'Gagal Bayar Caruman',
            section_charge: 'Seksyen 6',
            section_penalty: 'Seksyen 94(a)',
            section_compound: 'Seksyen 95A',
            section_statement: 'Seksyen 12C',
            max_fine: 10000,
            max_imprisonment: '2 tahun',
            is_compoundable: true,
            description: 'Majikan utama gagal untuk membayar caruman dalam tempoh yang ditetapkan mengikut kadar yang dinyatakan dalam Jadual Ketiga.',
            elements: [
                'Wujud pekerja berdaftar dengan PERKESO',
                'Gagal membayar caruman mengikut kadar',
                'Dalam tempoh yang ditetapkan',
                'Tunggakan caruman wujud',
            ],
        },

        'potong_gaji_pekerja': {
            code: 'A4_04',
            name: 'Memotong Gaji Pekerja (Syer Majikan)',
            section_charge: 'Seksyen 7(3)',
            section_penalty: 'Seksyen 94(b)',
            section_compound: 'Seksyen 95A',
            section_statement: 'Seksyen 12C',
            max_fine: 10000,
            max_imprisonment: '2 tahun',
            is_compoundable: true,
            description: 'Majikan memotong gaji pekerja untuk membayar caruman bahagian majikan, yang mana dilarang sama sekali oleh Akta.',
            elements: [
                'Majikan membuat potongan gaji pekerja',
                'Potongan untuk membayar caruman syer majikan',
                'Larangan mutlak di bawah Seksyen 7(3)',
            ],
        },

        'gagal_simpan_rekod': {
            code: 'A4_05',
            name: 'Gagal Simpan Daftar/Rekod',
            section_charge: 'Seksyen 11(3)',
            section_penalty: 'Seksyen 94(g)',
            section_compound: 'Seksyen 95A',
            section_statement: 'Seksyen 12C',
            max_fine: 10000,
            max_imprisonment: '2 tahun',
            is_compoundable: true,
            description: 'Majikan gagal menyimpan daftar semua pekerja dan rekod berkaitan dalam tempoh yang ditetapkan.',
            elements: [
                'Gagal menyimpan daftar pekerja',
                'Gagal menyimpan rekod gaji/kehadiran',
                'Tidak mengekalkan rekod untuk tempoh yang ditetapkan',
            ],
        },

        'gagal_kemukakan_dokumen': {
            code: 'A4_06',
            name: 'Gagal Kemukakan Dokumen/Rekod',
            section_charge: 'Seksyen 12B',
            section_penalty: 'Seksyen 94(g)',
            section_compound: 'Seksyen 95A',
            section_statement: 'Seksyen 12C',
            max_fine: 10000,
            max_imprisonment: '2 tahun',
            is_compoundable: true,
            description: 'Majikan gagal mengemukakan dokumen atau rekod apabila diminta oleh pegawai penyiasat.',
            elements: [
                'Permintaan dibuat oleh pegawai berkuasa',
                'Gagal mengemukakan dokumen yang diminta',
                'Dalam tempoh yang munasabah',
            ],
        },

        'halangan_pegawai': {
            code: 'A4_07',
            name: 'Halangan Kepada Pegawai',
            section_charge: 'Seksyen 12A(4)',
            section_penalty: 'Seksyen 94(g)',
            section_compound: 'Seksyen 95A',
            section_statement: 'Seksyen 12C',
            max_fine: 10000,
            max_imprisonment: '2 tahun',
            is_compoundable: true,
            description: 'Mana-mana orang yang menghalang, merintangi atau mengganggu pegawai dalam menjalankan kuasanya.',
            elements: [
                'Pegawai sedang menjalankan tugas rasmi',
                'Perbuatan menghalang/merintangi pegawai',
                'Dengan niat atau secara cuai',
            ],
        },

        'maklumat_palsu': {
            code: 'A4_08',
            name: 'Maklumat Palsu/Mengelirukan',
            section_charge: 'Seksyen 94(d)',
            section_penalty: 'Seksyen 94(d)',
            section_compound: 'Seksyen 95A',
            section_statement: 'Seksyen 12C',
            max_fine: 10000,
            max_imprisonment: '2 tahun',
            is_compoundable: true,
            description: 'Memberi maklumat yang palsu atau mengelirukan kepada PERKESO.',
            elements: [
                'Maklumat diberikan kepada PERKESO',
                'Maklumat adalah palsu atau mengelirukan',
                'Dengan pengetahuan bahawa ianya palsu',
            ],
        },

        'gagal_maklum_perubahan': {
            code: 'A4_09',
            name: 'Gagal Maklum Perubahan Butiran',
            section_charge: 'Seksyen 9',
            section_penalty: 'Seksyen 94(g)',
            section_compound: 'Seksyen 95A',
            section_statement: 'Seksyen 12C',
            max_fine: 10000,
            max_imprisonment: '2 tahun',
            is_compoundable: true,
            description: 'Majikan gagal memaklumkan PERKESO mengenai perubahan butiran perusahaan atau pekerja.',
            elements: [
                'Wujud perubahan butiran',
                'Gagal memaklumkan dalam tempoh ditetapkan',
                'Butiran berkaitan perusahaan atau pekerja',
            ],
        },
    },

    // ============================================
    // AKTA 800 - Akta Sistem Insurans Pekerjaan 2017
    // ============================================
    'akta_800': {
        'gagal_daftar_perusahaan': {
            code: 'A800_01',
            name: 'Gagal Daftar Perusahaan (SIP)',
            section_charge: 'Seksyen 14(1)',
            section_penalty: 'Seksyen 14(2)',
            section_compound: 'Seksyen 77',
            section_statement: 'Seksyen 69 & 70',
            max_fine: 10000,
            max_imprisonment: '2 tahun',
            is_compoundable: true,
            description: 'Majikan gagal mendaftarkan perusahaannya dengan Sistem Insurans Pekerjaan dalam tempoh yang ditetapkan.',
            elements: [
                'Majikan menjalankan perusahaan',
                'Gagal mendaftarkan dengan SIP',
                'Dalam tempoh yang ditetapkan',
            ],
        },

        'gagal_daftar_pekerja': {
            code: 'A800_02',
            name: 'Gagal Daftar Pekerja (SIP)',
            section_charge: 'Seksyen 16(1)',
            section_penalty: 'Seksyen 16(5)',
            section_compound: 'Seksyen 77',
            section_statement: 'Seksyen 69 & 70',
            max_fine: 10000,
            max_imprisonment: '2 tahun',
            is_compoundable: true,
            description: 'Majikan gagal mendaftarkan pekerjanya dengan Sistem Insurans Pekerjaan dalam tempoh 30 hari dari tarikh pekerja mula bekerja.',
            elements: [
                'Wujud hubungan majikan-pekerja',
                'Pekerja layak di bawah Akta 800',
                'Gagal mendaftarkan dalam tempoh 30 hari',
                'Pekerja tidak berdaftar dalam sistem SIP',
            ],
        },

        'gagal_bayar_caruman': {
            code: 'A800_03',
            name: 'Gagal Bayar Caruman SIP',
            section_charge: 'Seksyen 18(1)',
            section_penalty: 'Seksyen 18(4)',
            section_compound: 'Seksyen 77',
            section_statement: 'Seksyen 69 & 70',
            max_fine: 10000,
            max_imprisonment: '2 tahun',
            is_compoundable: true,
            description: 'Majikan gagal membayar caruman SIP dalam tempoh yang ditetapkan.',
            elements: [
                'Pekerja berdaftar dengan SIP',
                'Gagal membayar caruman bulanan',
                'Dalam tempoh yang ditetapkan',
            ],
        },

        'potong_gaji_pekerja': {
            code: 'A800_04',
            name: 'Memotong Gaji Pekerja (SIP)',
            section_charge: 'Seksyen 24(1)',
            section_penalty: 'Seksyen 24(2)',
            section_compound: 'Seksyen 77',
            section_statement: 'Seksyen 69 & 70',
            max_fine: 10000,
            max_imprisonment: '2 tahun',
            is_compoundable: true,
            description: 'Majikan memotong gaji pekerja untuk membayar caruman SIP bahagian majikan.',
            elements: [
                'Majikan membuat potongan gaji',
                'Untuk caruman SIP syer majikan',
                'Larangan di bawah Seksyen 24(1)',
            ],
        },

        'gagal_simpan_rekod': {
            code: 'A800_05',
            name: 'Gagal Simpan Daftar/Rekod',
            section_charge: 'Seksyen 78(1)',
            section_penalty: 'Seksyen 78(3)',
            section_compound: 'Seksyen 77',
            section_statement: 'Seksyen 69 & 70',
            max_fine: 10000,
            max_imprisonment: '2 tahun',
            is_compoundable: true,
            description: 'Majikan gagal menyimpan rekod berkaitan caruman dan pekerja.',
            elements: [
                'Gagal menyimpan daftar pekerja',
                'Gagal menyimpan rekod caruman',
                'Tidak mengekalkan untuk tempoh ditetapkan',
            ],
        },

        'halangan_pegawai': {
            code: 'A800_06',
            name: 'Halangan Kepada Pegawai',
            section_charge: 'Seksyen 72(1)',
            section_penalty: 'Seksyen 72(2)',
            section_compound: 'Seksyen 77',
            section_statement: 'Seksyen 69 & 70',
            max_fine: 10000,
            max_imprisonment: '2 tahun',
            is_compoundable: true,
            description: 'Menghalang, merintangi atau mengganggu pegawai dalam menjalankan kuasa.',
            elements: [
                'Pegawai menjalankan tugas rasmi',
                'Perbuatan menghalang/merintangi',
                'Dengan niat atau secara cuai',
            ],
        },

        'maklumat_palsu': {
            code: 'A800_07',
            name: 'Maklumat Palsu/Mengelirukan',
            section_charge: 'Seksyen 79(1)',
            section_penalty: 'Seksyen 79(2)',
            section_compound: 'Seksyen 77',
            section_statement: 'Seksyen 69 & 70',
            max_fine: 10000,
            max_imprisonment: '2 tahun',
            is_compoundable: true,
            description: 'Memberi maklumat palsu atau mengelirukan kepada PERKESO berkaitan SIP.',
            elements: [
                'Maklumat diberikan kepada PERKESO',
                'Berkaitan SIP',
                'Maklumat adalah palsu atau mengelirukan',
            ],
        },

        'gagal_maklum_perubahan': {
            code: 'A800_08',
            name: 'Gagal Maklum Perubahan Butiran',
            section_charge: 'Seksyen 15(1)',
            section_penalty: 'Seksyen 15(2)',
            section_compound: 'Seksyen 77',
            section_statement: 'Seksyen 69 & 70',
            max_fine: 10000,
            max_imprisonment: '2 tahun',
            is_compoundable: true,
            description: 'Gagal memaklumkan perubahan butiran perusahaan atau pekerja.',
            elements: [
                'Wujud perubahan butiran',
                'Gagal memaklumkan dalam tempoh',
                'Berkaitan SIP',
            ],
        },
    },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get offense details by act and offense key
 */
export function getOffenseDetails(
    actKey: ActKey,
    offenseKey: string
): OffenseDetails | null {
    return OFFENSE_MAPPING[actKey]?.[offenseKey] || null;
}

/**
 * Get all offenses for a specific act
 */
export function getOffensesByAct(actKey: ActKey): OffenseDetails[] {
    const offenses = OFFENSE_MAPPING[actKey];
    return offenses ? Object.values(offenses) : [];
}

/**
 * Get offense options for dropdown (simplified)
 */
export function getOffenseOptions(actKey: ActKey): { value: string; label: string }[] {
    const offenses = OFFENSE_MAPPING[actKey];
    if (!offenses) return [];

    return Object.entries(offenses).map(([key, offense]) => ({
        value: key,
        label: offense.name,
    }));
}

/**
 * Auto-fill sections based on offense selection
 */
export function getAutoFillSections(actKey: ActKey, offenseKey: string) {
    const offense = getOffenseDetails(actKey, offenseKey);
    if (!offense) return null;

    return {
        section_charge: offense.section_charge,
        section_penalty: offense.section_penalty,
        section_compound: offense.section_compound,
        section_statement: offense.section_statement,
    };
}

// ============================================
// ACT INFORMATION
// ============================================

export const ACT_INFO = {
    'akta_4': {
        key: 'akta_4',
        name: 'Akta 4',
        full_name: 'Akta Keselamatan Sosial Pekerja 1969',
        short_name: 'SOCSO Act 1969',
        description: 'Akta untuk mengadakan peruntukan bagi jaminan sosial dalam hal-hal kecederaan, hilang upaya dan kematian yang timbul daripada pekerjaan.',
    },
    'akta_800': {
        key: 'akta_800',
        name: 'Akta 800',
        full_name: 'Akta Sistem Insurans Pekerjaan 2017',
        short_name: 'SIP Act 2017',
        description: 'Akta untuk mengadakan peruntukan bagi sistem insurans pekerjaan bagi orang yang berinsurans yang kehilangan pekerjaan.',
    },
} as const;

// ============================================
// SECTION REFERENCES
// ============================================

export const SECTION_REFERENCES = {
    // Akta 4 - Statement Recording
    'akta_4_statement': {
        section: 'Seksyen 12C',
        description: 'Kuasa untuk merekod pernyataan',
        act: 'Akta 4',
    },
    // Akta 4 - Compound
    'akta_4_compound': {
        section: 'Seksyen 95A',
        description: 'Kuasa untuk mengkompaun kesalahan',
        act: 'Akta 4',
    },
    // Akta 4 - Prosecution
    'akta_4_prosecution': {
        section: 'Seksyen 95',
        description: 'Pendakwaan kesalahan',
        act: 'Akta 4',
    },

    // Akta 800 - Statement Recording
    'akta_800_statement': {
        section: 'Seksyen 69 & 70',
        description: 'Kuasa untuk merekod pernyataan',
        act: 'Akta 800',
    },
    // Akta 800 - Compound
    'akta_800_compound': {
        section: 'Seksyen 77',
        description: 'Kuasa untuk mengkompaun kesalahan',
        act: 'Akta 800',
    },
    // Akta 800 - Prosecution
    'akta_800_prosecution': {
        section: 'Seksyen 76',
        description: 'Pendakwaan kesalahan',
        act: 'Akta 800',
    },
} as const;
