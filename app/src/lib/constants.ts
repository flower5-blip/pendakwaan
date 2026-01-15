// ============================================
// PERKESO Prosecution System Constants
// Synchronized with database schema
// ============================================

export const APP_NAME = "PERKESO Prosecution Paper Builder";
export const APP_SHORT_NAME = "PPB";

// ============================================
// USER ROLES
// ============================================

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

// ============================================
// CASE STATUS - Uses English keys to match database enum
// ============================================

export const CASE_STATUS = {
    DRAFT: "draft",
    IN_PROGRESS: "in_progress",
    PENDING_REVIEW: "pending_review",
    APPROVED: "approved",
    FILED: "filed",
    CLOSED: "closed",
    COMPOUND_OFFERED: "compound_offered",
    COMPOUND_PAID: "compound_paid",
    PROSECUTION: "prosecution",
    COMPLETED: "completed",
    NFA: "nfa",
} as const;

// Labels use Malay for UI display
export const CASE_STATUS_LABELS: Record<string, string> = {
    draft: "Draf",
    in_progress: "Dalam Siasatan",
    pending_review: "Menunggu Semakan",
    approved: "Diluluskan",
    filed: "Difailkan",
    closed: "Ditutup",
    compound_offered: "Kompaun Ditawarkan",
    compound_paid: "Kompaun Dibayar",
    prosecution: "Dalam Pendakwaan",
    completed: "Selesai",
    nfa: "NFA (Tiada Tindakan Lanjut)",
};

export const CASE_STATUS_COLORS: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800",
    in_progress: "bg-blue-100 text-blue-800",
    pending_review: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    filed: "bg-indigo-100 text-indigo-800",
    closed: "bg-slate-100 text-slate-800",
    compound_offered: "bg-orange-100 text-orange-800",
    compound_paid: "bg-purple-100 text-purple-800",
    prosecution: "bg-red-100 text-red-800",
    completed: "bg-emerald-100 text-emerald-800",
    nfa: "bg-slate-100 text-slate-800",
};

// ============================================
// ACT TYPES - Using underscore format to match database
// ============================================

export const ACT_TYPES = {
    AKTA_4: "akta_4",
    AKTA_800: "akta_800",
} as const;

export const ACT_TYPE_LABELS: Record<string, string> = {
    akta_4: "Akta 4 (KWSP)",
    akta_800: "Akta 800 (SIP)",
};

// ============================================
// EVIDENCE STATUS
// ============================================

export const EVIDENCE_STATUS = {
    COLLECTED: "collected",
    VERIFIED: "verified",
    SUBMITTED: "submitted",
    RETURNED: "returned",
} as const;

export const EVIDENCE_STATUS_LABELS: Record<string, string> = {
    collected: "Dikumpulkan",
    verified: "Disahkan",
    submitted: "Dikemukakan",
    returned: "Dikembalikan",
};

// ============================================
// PERSON ROLES
// ============================================

export const PERSON_ROLES = {
    SAKSI: "saksi",
    OKS: "oks",
    OKS_REPRESENTATIVE: "oks_representative",
} as const;

export const PERSON_ROLE_LABELS: Record<string, string> = {
    saksi: "Saksi",
    oks: "OKS",
    oks_representative: "Wakil OKS",
};

// ============================================
// COMPOUND STATUS
// ============================================

export const COMPOUND_STATUS = {
    PENDING: "pending",
    PAID: "paid",
    EXPIRED: "expired",
    CANCELLED: "cancelled",
} as const;

export const COMPOUND_STATUS_LABELS: Record<string, string> = {
    pending: "Menunggu",
    paid: "Dibayar",
    expired: "Tamat Tempoh",
    cancelled: "Dibatalkan",
};

// ============================================
// RECOMMENDATION
// ============================================

export const RECOMMENDATION = {
    COMPOUND: "compound",
    PROSECUTE: "prosecute",
    NFA: "nfa",
} as const;

export const RECOMMENDATION_LABELS: Record<string, string> = {
    compound: "Kompaun",
    prosecute: "Dakwa",
    nfa: "NFA",
};
