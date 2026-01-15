export const APP_NAME = "PERKESO Prosecution Paper Builder";
export const APP_SHORT_NAME = "PPB";

export const USER_ROLES = {
    ADMIN: "admin",
    IO: "io", // Pegawai Penyiasat
    PO: "po", // Pegawai Pendakwa
    UIP: "uip", // Unit Perundangan
    VIEWER: "viewer",
} as const;

export const USER_ROLE_LABELS: Record<string, string> = {
    admin: "Pentadbir",
    io: "Pegawai Penyiasat (IO)",
    po: "Pegawai Pendakwa (PO)",
    uip: "Unit Perundangan (UIP)",
    viewer: "Pemerhati",
};

// Updated to match workflow from 4-database-schema.md
export const CASE_STATUS = {
    DRAF: "draf",
    DALAM_SIASATAN: "dalam_siasatan",
    MENUNGGU_SEMAKAN: "menunggu_semakan",
    MENUNGGU_SANKSI: "menunggu_sanksi",
    SANKSI_DILULUSKAN: "sanksi_diluluskan",
    DIKOMPAUN: "dikompaun",
    DIDAKWA: "didakwa",
    SELESAI: "selesai",
    NFA: "nfa",
} as const;

export const CASE_STATUS_LABELS: Record<string, string> = {
    draf: "Draf",
    dalam_siasatan: "Dalam Siasatan",
    menunggu_semakan: "Menunggu Semakan",
    menunggu_sanksi: "Menunggu Sanksi",
    sanksi_diluluskan: "Sanksi Diluluskan",
    dikompaun: "Dikompaun",
    didakwa: "Didakwa",
    selesai: "Selesai",
    nfa: "NFA (Tiada Tindakan Lanjut)",
};

export const CASE_STATUS_COLORS: Record<string, string> = {
    draf: "bg-gray-100 text-gray-800",
    dalam_siasatan: "bg-blue-100 text-blue-800",
    menunggu_semakan: "bg-yellow-100 text-yellow-800",
    menunggu_sanksi: "bg-orange-100 text-orange-800",
    sanksi_diluluskan: "bg-green-100 text-green-800",
    dikompaun: "bg-purple-100 text-purple-800",
    didakwa: "bg-red-100 text-red-800",
    selesai: "bg-emerald-100 text-emerald-800",
    nfa: "bg-slate-100 text-slate-800",
};

export const ACT_TYPES = {
    AKTA_4: "akta4",
    AKTA_800: "akta800",
    BOTH: "both",
} as const;

export const ACT_TYPE_LABELS: Record<string, string> = {
    akta4: "Akta 4 (KWSP)",
    akta800: "Akta 800 (SIP)",
    both: "Kedua-dua Akta",
};

export const EVIDENCE_STATUS = {
    DRAFT: "draft",
    READY: "ready",
    NEED_FIX: "need_fix",
} as const;

export const EVIDENCE_STATUS_LABELS: Record<string, string> = {
    draft: "Draf",
    ready: "Sedia",
    need_fix: "Perlu Diperbaiki",
};
