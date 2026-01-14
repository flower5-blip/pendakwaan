// ============================================
// src/app/dashboard/page.tsx
// Dashboard Page - PERKESO Prosecution System
// Server-side data fetching dengan Supabase
// ============================================

import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

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
    created_at: string;
    employer: {
        id: string;
        company_name: string;
    } | null;
}

// ============================================
// Status Badge Component
// ============================================

function StatusBadge({ status }: { status: string }) {
    const statusStyles: Record<string, string> = {
        'Draft': 'bg-gray-100 text-gray-700',
        'Pending Approval': 'bg-yellow-100 text-yellow-700',
        'Approved': 'bg-green-100 text-green-700',
        'Compound Offered': 'bg-blue-100 text-blue-700',
        'Compound Paid': 'bg-emerald-100 text-emerald-700',
        'Prosecution': 'bg-red-100 text-red-700',
        'Completed': 'bg-purple-100 text-purple-700',
        'NFA': 'bg-slate-100 text-slate-700',
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-700'}`}>
            {status}
        </span>
    );
}

// ============================================
// Stats Card Component
// ============================================

function StatsCard({
    title,
    value,
    icon,
    color
}: {
    title: string;
    value: number;
    icon: string;
    color: string;
}) {
    return (
        <div className={`${color} rounded-xl p-6 shadow-sm`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium opacity-80">{title}</p>
                    <p className="text-3xl font-bold mt-1">{value}</p>
                </div>
                <div className="text-4xl opacity-80">{icon}</div>
            </div>
        </div>
    );
}

// ============================================
// Main Dashboard Page (Server Component)
// ============================================

export default async function DashboardPage() {
    // ============================================
    // 1. Initialize Supabase Server Client
    // ============================================

    const supabase = await createClient();

    // ============================================
    // 2. Check Authentication
    // ============================================

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect('/login');
    }

    // ============================================
    // 3. Fetch User Profile
    // ============================================

    const { data: profile } = await supabase
        .from('users_io')
        .select('full_name, position, station')
        .eq('id', user.id)
        .single();

    // ============================================
    // 4. Fetch Cases with Employer Data
    // ============================================

    const { data: cases, error: casesError } = await supabase
        .from('cases')
        .select(`
      id,
      case_number,
      act_type,
      offense_type,
      status,
      date_of_offense,
      created_at,
      employer:employers (
        id,
        company_name
      )
    `)
        .order('created_at', { ascending: false })
        .limit(20);

    if (casesError) {
        console.error('Error fetching cases:', casesError);
    }

    const casesList = (cases as CaseWithEmployer[]) || [];

    // ============================================
    // 5. Calculate Statistics
    // ============================================

    const stats = {
        total: casesList.length,
        draft: casesList.filter(c => c.status === 'Draft').length,
        pending: casesList.filter(c => c.status === 'Pending Approval').length,
        completed: casesList.filter(c => c.status === 'Completed').length,
    };

    // ============================================
    // 6. Render Dashboard
    // ============================================

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Dashboard
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Selamat datang, {profile?.full_name || 'Pengguna'}
                            </p>
                        </div>
                        <Link
                            href="/cases/new"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition flex items-center gap-2"
                        >
                            <span>＋</span>
                            Kes Baru
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                        title="Jumlah Kes"
                        value={stats.total}
                        icon="📁"
                        color="bg-white border border-gray-200"
                    />
                    <StatsCard
                        title="Draf"
                        value={stats.draft}
                        icon="📝"
                        color="bg-gray-50 border border-gray-200"
                    />
                    <StatsCard
                        title="Menunggu Kelulusan"
                        value={stats.pending}
                        icon="⏳"
                        color="bg-yellow-50 border border-yellow-200"
                    />
                    <StatsCard
                        title="Selesai"
                        value={stats.completed}
                        icon="✅"
                        color="bg-green-50 border border-green-200"
                    />
                </div>

                {/* Cases Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Senarai Kes Terkini
                        </h2>
                    </div>

                    {casesList.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <div className="text-6xl mb-4">📂</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Tiada Kes Ditemui
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Anda belum mempunyai sebarang kes. Mulakan dengan mencipta kes baru.
                            </p>
                            <Link
                                href="/cases/new"
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
                            >
                                <span>＋</span>
                                Cipta Kes Baru
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            No. Kes
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Nama Syarikat
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Jenis Kesalahan
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Akta
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Tarikh
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Tindakan
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {casesList.map((caseItem) => (
                                        <tr
                                            key={caseItem.id}
                                            className="hover:bg-gray-50 transition"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-mono text-sm text-blue-600 font-medium">
                                                    {caseItem.case_number}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-gray-900 font-medium">
                                                    {caseItem.employer?.company_name || 'Tidak Diketahui'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-gray-600 text-sm">
                                                    {caseItem.offense_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`
                          px-2 py-1 rounded text-xs font-medium
                          ${caseItem.act_type === 'Akta 4'
                                                        ? 'bg-indigo-100 text-indigo-700'
                                                        : 'bg-teal-100 text-teal-700'}
                        `}>
                                                    {caseItem.act_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge status={caseItem.status} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(caseItem.date_of_offense).toLocaleDateString('ms-MY', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <Link
                                                    href={`/cases/${caseItem.id}`}
                                                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm transition"
                                                >
                                                    Lihat Fail
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Quick Links */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link
                        href="/cases"
                        className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition group"
                    >
                        <div className="text-3xl mb-3">📋</div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                            Semua Kes
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Lihat senarai lengkap semua kes pendakwaan
                        </p>
                    </Link>

                    <Link
                        href="/employers"
                        className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition group"
                    >
                        <div className="text-3xl mb-3">🏢</div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                            Senarai Majikan
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Urus rekod majikan / OKS
                        </p>
                    </Link>

                    <Link
                        href="/reports"
                        className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition group"
                    >
                        <div className="text-3xl mb-3">📊</div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                            Laporan
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Jana laporan dan statistik
                        </p>
                    </Link>
                </div>
            </main>
        </div>
    );
}
