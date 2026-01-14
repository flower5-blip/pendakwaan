// ============================================
// src/app/cases/[id]/page.tsx
// Complete Case Detail Page with Tabs
// Server Component with Supabase Data Fetching
// ============================================

import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import CaseDetailTabs from './CaseDetailTabs';

// ============================================
// Types
// ============================================

interface CaseWithEmployer {
    id: string;
    case_number: string;
    act_type: string;
    offense_type: string;
    status: string;
    date_of_offense: string;
    time_of_offense: string | null;
    location_of_offense: string | null;
    section_charged: string;
    section_penalty: string;
    section_compound: string | null;
    inspection_date: string | null;
    inspection_location: string | null;
    arrears_amount: number | null;
    total_employees_affected: number | null;
    recommendation: string | null;
    notes: string | null;
    created_at: string;
    employers: {
        id: string;
        company_name: string;
        ssm_number: string | null;
        employer_code: string | null;
        address: string | null;
        owner_name: string | null;
        owner_ic: string | null;
        phone: string | null;
        state: string | null;
    } | null;
}

// ============================================
// Helper Functions
// ============================================

function formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ms-MY', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function formatCurrency(amount: number | null): string {
    if (amount === null) return '-';
    return new Intl.NumberFormat('ms-MY', {
        style: 'currency',
        currency: 'MYR',
    }).format(amount);
}

// ============================================
// Status Badge Component
// ============================================

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        'Draft': 'bg-gray-100 text-gray-700 border-gray-300',
        'Pending Approval': 'bg-yellow-100 text-yellow-800 border-yellow-300',
        'Approved': 'bg-green-100 text-green-800 border-green-300',
        'Compound Offered': 'bg-blue-100 text-blue-800 border-blue-300',
        'Prosecution': 'bg-red-100 text-red-800 border-red-300',
        'Completed': 'bg-purple-100 text-purple-800 border-purple-300',
    };

    return (
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${styles[status] || styles['Draft']}`}>
            {status}
        </span>
    );
}

// ============================================
// Main Page Component (Server Component)
// ============================================

export default async function CaseDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    // ============================================
    // 1. Initialize Supabase & Check Auth
    // ============================================

    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        redirect('/login');
    }

    // ============================================
    // 2. Fetch Case with Employer Data (JOIN)
    // ============================================

    const { data: caseData, error } = await supabase
        .from('cases')
        .select('*, employers(*)')  // JOIN employers table
        .eq('id', id)
        .single();

    // ============================================
    // 3. Handle Not Found
    // ============================================

    if (error || !caseData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">📂</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Kes Tidak Dijumpai
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Kes dengan ID ini tidak wujud dalam sistem.
                    </p>
                    <Link
                        href="/dashboard"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
                    >
                        ← Kembali ke Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const caseDetail = caseData as CaseWithEmployer;

    // ============================================
    // 4. Fetch Related Data
    // ============================================

    const { data: employees } = await supabase
        .from('employees')
        .select('*')
        .eq('case_id', id);

    const { data: evidences } = await supabase
        .from('evidences')
        .select('*')
        .eq('case_id', id);

    // ============================================
    // 5. Render Page
    // ============================================

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation Bar */}
            <header className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="text-gray-500 hover:text-gray-700 transition"
                            >
                                ← Kembali
                            </Link>
                            <span className="text-gray-300">|</span>
                            <span className="font-mono text-blue-600 font-bold">
                                {caseDetail.case_number}
                            </span>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                href={`/cases/${id}/edit`}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm"
                            >
                                ✏️ Edit Kes
                            </Link>
                            <button
                                onClick={() => window.print()}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm"
                            >
                                🖨️ Cetak
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                {/* ============================================ */}
                {/* Summary Header */}
                {/* ============================================ */}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {caseDetail.employers?.company_name || 'Nama Syarikat Tidak Diketahui'}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {caseDetail.offense_type} • {caseDetail.act_type}
                            </p>
                        </div>
                        <StatusBadge status={caseDetail.status} />
                    </div>

                    {/* Quick Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                        <div>
                            <p className="text-sm text-gray-500">No. SSM</p>
                            <p className="font-mono font-medium">
                                {caseDetail.employers?.ssm_number || '-'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Tarikh Kesalahan</p>
                            <p className="font-medium">{formatDate(caseDetail.date_of_offense)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Seksyen</p>
                            <p className="font-medium">{caseDetail.section_charged}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Tunggakan</p>
                            <p className="font-medium">{formatCurrency(caseDetail.arrears_amount)}</p>
                        </div>
                    </div>
                </div>

                {/* ============================================ */}
                {/* Tabbed Content (Client Component) */}
                {/* ============================================ */}

                <CaseDetailTabs
                    caseData={caseDetail}
                    employees={employees || []}
                    evidences={evidences || []}
                />
            </main>
        </div>
    );
}
