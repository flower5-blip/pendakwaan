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

export const CASE_STATUS = {
    DRAFT: "draft",
    IN_PROGRESS: "in_progress",
    PENDING_REVIEW: "pending_review",
    APPROVED: "approved",
    FILED: "filed",
    CLOSED: "closed",
} as const;

export const CASE_STATUS_LABELS: Record<string, string> = {
    draft: "Draf",
    in_progress: "Dalam Proses",
    pending_review: "Menunggu Semakan",
    approved: "Diluluskan",
    filed: "Difailkan",
    closed: "Ditutup",
};

export const CASE_STATUS_COLORS: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800",
    in_progress: "bg-blue-100 text-blue-800",
    pending_review: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    filed: "bg-purple-100 text-purple-800",
    closed: "bg-red-100 text-red-800",
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
