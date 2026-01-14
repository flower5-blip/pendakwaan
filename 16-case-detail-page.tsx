// ============================================
// src/app/cases/[id]/page.tsx
// Case Detail Page - Kertas Minit Pegawai Penyiasat
// PERKESO Prosecution System
// ============================================

import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import PrintButton from './PrintButton';

// ============================================
// Types
// ============================================

interface CaseDetail {
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
    arrears_start_date: string | null;
    arrears_end_date: string | null;
    arrears_amount: number | null;
    total_employees_affected: number | null;
    notes: string | null;
    recommendation: string | null;
    created_at: string;
    employer: {
        id: string;
        company_name: string;
        ssm_number: string | null;
        employer_code: string | null;
        address: string | null;
        owner_name: string | null;
        owner_ic: string | null;
        phone: string | null;
    } | null;
    investigating_officer: {
        id: string;
        full_name: string;
        position: string | null;
        station: string | null;
        authority_card_no: string | null;
    } | null;
}

// ============================================
// Helper: Format Date
// ============================================

function formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ms-MY', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function formatTime(timeString: string | null): string {
    if (!timeString) return '-';
    return timeString.slice(0, 5); // HH:MM
}

function formatCurrency(amount: number | null): string {
    if (amount === null) return '-';
    return new Intl.NumberFormat('ms-MY', {
        style: 'currency',
        currency: 'MYR',
    }).format(amount);
}

// ============================================
// Main Page Component
// ============================================

export default async function CaseDetailPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;

    // ============================================
    // 1. Initialize Supabase & Auth Check
    // ============================================

    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        redirect('/login');
    }

    // ============================================
    // 2. Fetch Case with Employer Data
    // ============================================

    const { data: caseData, error } = await supabase
        .from('cases')
        .select(`
      *,
      employer:employers (*),
      investigating_officer:users_io (
        id,
        full_name,
        position,
        station,
        authority_card_no
      )
    `)
        .eq('id', id)
        .single();

    if (error || !caseData) {
        notFound();
    }

    const caseDetail = caseData as CaseDetail;

    // ============================================
    // 3. Fetch Related Data (Employees, Evidence, Statements)
    // ============================================

    const { data: employees } = await supabase
        .from('employees')
        .select('*')
        .eq('case_id', id);

    const { data: evidences } = await supabase
        .from('evidences')
        .select('*')
        .eq('case_id', id)
        .order('exhibit_number');

    const { data: statements } = await supabase
        .from('statements')
        .select('*')
        .eq('case_id', id);

    // ============================================
    // 4. Prepare Template Variables
    // ============================================

    const vars = {
        NO_KES: caseDetail.case_number,
        NAMA_AKTA: caseDetail.act_type === 'Akta 4'
            ? 'Akta Keselamatan Sosial Pekerja 1969'
            : 'Akta Sistem Insurans Pekerjaan 2017',
        NAMA_SYARIKAT: caseDetail.employer?.company_name || 'TIDAK DIKETAHUI',
        NO_KOD_MAJIKAN: caseDetail.employer?.employer_code || 'TIADA',
        NO_SSM: caseDetail.employer?.ssm_number || 'TIADA',
        ALAMAT_PREMIS: caseDetail.employer?.address || 'TIDAK DIKETAHUI',
        NAMA_PENGARAH: caseDetail.employer?.owner_name || '-',
        NO_KP_PENGARAH: caseDetail.employer?.owner_ic || '-',
        TARIKH_KESALAHAN: formatDate(caseDetail.date_of_offense),
        MASA_KESALAHAN: formatTime(caseDetail.time_of_offense),
        TEMPAT_KEJADIAN: caseDetail.location_of_offense || '-',
        TARIKH_LAWATAN: formatDate(caseDetail.inspection_date),
        LOKASI_LAWATAN: caseDetail.inspection_location || '-',
        SEKSYEN_PERTUDUHAN: caseDetail.section_charged,
        SEKSYEN_HUKUMAN: caseDetail.section_penalty,
        SEKSYEN_KOMPAUN: caseDetail.section_compound || '-',
        NAMA_PEGAWAI_PENYIASAT: caseDetail.investigating_officer?.full_name || '-',
        JAWATAN_PEGAWAI: caseDetail.investigating_officer?.position || 'Pegawai Penyiasat',
        STESEN_PEGAWAI: caseDetail.investigating_officer?.station || '-',
        NO_KAD_KUASA: caseDetail.investigating_officer?.authority_card_no || '-',
        TARIKH_LAPORAN: formatDate(caseDetail.created_at),
        JUMLAH_TUNGGAKAN: formatCurrency(caseDetail.arrears_amount),
        BIL_PEKERJA: caseDetail.total_employees_affected || 0,
    };

    // ============================================
    // 5. Render Page
    // ============================================

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Top Action Bar */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-10 print:hidden">
                <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="text-gray-600 hover:text-gray-900 transition"
                        >
                            ← Kembali
                        </Link>
                        <span className="text-gray-300">|</span>
                        <span className="font-mono text-blue-600 font-medium">
                            {vars.NO_KES}
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href={`/cases/${id}/edit`}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                        >
                            ✏️ Edit
                        </Link>
                        <PrintButton />
                    </div>
                </div>
            </div>

            {/* Main Document */}
            <main className="max-w-5xl mx-auto py-8 px-4">
                <div className="bg-white shadow-lg rounded-xl overflow-hidden print:shadow-none print:rounded-none">

                    {/* ============================================ */}
                    {/* KERTAS MINIT PEGAWAI PENYIASAT */}
                    {/* ============================================ */}

                    <div className="p-8 print:p-6">
                        {/* Header */}
                        <div className="text-center mb-8 border-b pb-6">
                            <div className="text-sm text-gray-500 mb-2">SULIT</div>
                            <h1 className="text-xl font-bold text-gray-900 mb-2">
                                KERTAS MINIT PEGAWAI PENYIASAT
                            </h1>
                            <h2 className="text-lg text-gray-700">
                                PERTUBUHAN KESELAMATAN SOSIAL (PERKESO)
                            </h2>
                            <p className="text-gray-600 mt-2">
                                {vars.NAMA_AKTA}
                            </p>
                        </div>

                        {/* Case Reference */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-blue-600 font-medium">NO. FAIL:</span>
                                    <span className="ml-2 font-mono font-bold text-blue-800">{vars.NO_KES}</span>
                                </div>
                                <div>
                                    <span className="text-sm text-blue-600 font-medium">STATUS:</span>
                                    <span className="ml-2 font-medium text-blue-800">{caseDetail.status}</span>
                                </div>
                            </div>
                        </div>

                        {/* ============================================ */}
                        {/* 1. SASARAN (OKT) */}
                        {/* ============================================ */}

                        <section className="mb-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
                                1. SASARAN (OKT)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                <div>
                                    <label className="text-sm text-gray-500">Nama Syarikat / Perniagaan</label>
                                    <p className="font-semibold text-gray-900">{vars.NAMA_SYARIKAT}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">No. Kod Majikan PERKESO</label>
                                    <p className="font-mono">{vars.NO_KOD_MAJIKAN}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">No. Pendaftaran SSM</label>
                                    <p className="font-mono">{vars.NO_SSM}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">No. Telefon</label>
                                    <p>{caseDetail.employer?.phone || '-'}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm text-gray-500">Alamat Premis</label>
                                    <p>{vars.ALAMAT_PREMIS}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Nama Pengarah / Pemilik</label>
                                    <p>{vars.NAMA_PENGARAH}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">No. KP Pengarah</label>
                                    <p className="font-mono">{vars.NO_KP_PENGARAH}</p>
                                </div>
                            </div>
                        </section>

                        {/* ============================================ */}
                        {/* 2. MAKLUMAT KESALAHAN */}
                        {/* ============================================ */}

                        <section className="mb-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
                                2. MAKLUMAT KESALAHAN
                            </h3>
                            <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
                                <p className="text-red-800">
                                    <strong>Jenis Kesalahan:</strong> {caseDetail.offense_type}
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <label className="text-sm text-gray-500">Tarikh Kesalahan</label>
                                    <p className="font-semibold">{vars.TARIKH_KESALAHAN}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <label className="text-sm text-gray-500">Masa Kesalahan</label>
                                    <p className="font-semibold">{vars.MASA_KESALAHAN}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <label className="text-sm text-gray-500">Bilangan Pekerja Terlibat</label>
                                    <p className="font-semibold">{vars.BIL_PEKERJA} orang</p>
                                </div>
                            </div>
                            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                                <label className="text-sm text-gray-500">Lokasi Kesalahan</label>
                                <p>{vars.TEMPAT_KEJADIAN}</p>
                            </div>
                        </section>

                        {/* ============================================ */}
                        {/* 3. SEKSYEN YANG BERKAITAN */}
                        {/* ============================================ */}

                        <section className="mb-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
                                3. SEKSYEN YANG BERKAITAN
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg text-center">
                                    <label className="text-sm text-indigo-600 font-medium">SEKSYEN PERTUDUHAN</label>
                                    <p className="text-2xl font-bold text-indigo-800 mt-1">{vars.SEKSYEN_PERTUDUHAN}</p>
                                </div>
                                <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-center">
                                    <label className="text-sm text-red-600 font-medium">SEKSYEN HUKUMAN</label>
                                    <p className="text-2xl font-bold text-red-800 mt-1">{vars.SEKSYEN_HUKUMAN}</p>
                                </div>
                                <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
                                    <label className="text-sm text-green-600 font-medium">SEKSYEN KOMPAUN</label>
                                    <p className="text-2xl font-bold text-green-800 mt-1">{vars.SEKSYEN_KOMPAUN}</p>
                                </div>
                            </div>
                            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-800">
                                    <strong>Hukuman:</strong> Jika disabitkan kesalahan, boleh didenda tidak melebihi <strong>RM10,000</strong> atau
                                    dipenjarakan selama tempoh tidak melebihi <strong>2 tahun</strong> atau kedua-duanya sekali.
                                </p>
                            </div>
                        </section>

                        {/* ============================================ */}
                        {/* 4. SENARAI PEKERJA TERLIBAT */}
                        {/* ============================================ */}

                        {employees && employees.length > 0 && (
                            <section className="mb-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
                                    4. SENARAI PEKERJA TERLIBAT
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-4 py-2 text-left">Bil</th>
                                                <th className="px-4 py-2 text-left">Nama Pekerja</th>
                                                <th className="px-4 py-2 text-left">No. KP</th>
                                                <th className="px-4 py-2 text-left">Jawatan</th>
                                                <th className="px-4 py-2 text-left">Tarikh Mula Kerja</th>
                                                <th className="px-4 py-2 text-right">Gaji (RM)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {employees.map((emp: any, index: number) => (
                                                <tr key={emp.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-2">{index + 1}</td>
                                                    <td className="px-4 py-2 font-medium">{emp.full_name}</td>
                                                    <td className="px-4 py-2 font-mono">{emp.ic_number || '-'}</td>
                                                    <td className="px-4 py-2">{emp.position || '-'}</td>
                                                    <td className="px-4 py-2">{formatDate(emp.employment_start_date)}</td>
                                                    <td className="px-4 py-2 text-right">{formatCurrency(emp.monthly_salary)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        )}

                        {/* ============================================ */}
                        {/* 5. SENARAI EKSIBIT */}
                        {/* ============================================ */}

                        {evidences && evidences.length > 0 && (
                            <section className="mb-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
                                    5. SENARAI EKSIBIT / BUKTI
                                </h3>
                                <div className="space-y-2">
                                    {evidences.map((evidence: any) => (
                                        <div
                                            key={evidence.id}
                                            className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                                        >
                                            <span className="font-mono font-bold text-blue-600 w-12">
                                                {evidence.exhibit_number}
                                            </span>
                                            <div className="flex-1">
                                                <p className="font-medium">{evidence.name}</p>
                                                <p className="text-sm text-gray-500">{evidence.description || '-'}</p>
                                            </div>
                                            <span className={`
                        px-2 py-1 rounded text-xs
                        ${evidence.status === 'Verified'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-700'}
                      `}>
                                                {evidence.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* ============================================ */}
                        {/* 6. RINGKASAN KES */}
                        {/* ============================================ */}

                        <section className="mb-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
                                {employees?.length ? '6' : '4'}. RINGKASAN KES
                            </h3>
                            <div className="prose max-w-none">
                                <p className="text-gray-700 leading-relaxed">
                                    Siasatan dijalankan berikutan pemeriksaan yang mendapati majikan <strong>{vars.NAMA_SYARIKAT}</strong> disyaki
                                    melakukan kesalahan <strong>{caseDetail.offense_type}</strong> di bawah {caseDetail.act_type}.
                                </p>
                                <p className="text-gray-700 leading-relaxed mt-4">
                                    Pada <strong>{vars.TARIKH_LAWATAN}</strong>, pemeriksaan telah dijalankan di premis majikan
                                    di <strong>{vars.ALAMAT_PREMIS}</strong>. Hasil semakan mendapati majikan telah melanggar
                                    <strong> {vars.SEKSYEN_PERTUDUHAN}</strong> dan boleh dihukum di bawah <strong>{vars.SEKSYEN_HUKUMAN}</strong>.
                                </p>
                                {caseDetail.notes && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-500 mb-2">Nota Tambahan:</p>
                                        <p className="text-gray-700">{caseDetail.notes}</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* ============================================ */}
                        {/* 7. SYOR PEGAWAI PENYIASAT */}
                        {/* ============================================ */}

                        <section className="mb-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
                                {employees?.length ? '7' : '5'}. SYOR PEGAWAI PENYIASAT
                            </h3>
                            <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                                <p className="text-gray-700 mb-4">
                                    Berdasarkan keterangan dan bukti yang dikumpulkan, terdapat bukti <strong>prima facie</strong> yang
                                    kukuh terhadap OKT. Saya mengesyorkan:
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className={`
                    p-4 rounded-lg border-2
                    ${caseDetail.recommendation === 'compound'
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-200 bg-white'}
                  `}>
                                        <p className="font-semibold text-gray-900">☐ KOMPAUN</p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Ditawarkan kompaun di bawah {vars.SEKSYEN_KOMPAUN}
                                        </p>
                                    </div>
                                    <div className={`
                    p-4 rounded-lg border-2
                    ${caseDetail.recommendation === 'prosecute'
                                            ? 'border-red-500 bg-red-50'
                                            : 'border-gray-200 bg-white'}
                  `}>
                                        <p className="font-semibold text-gray-900">☐ PENDAKWAAN</p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Jika kompaun tidak dijelaskan, pohon izin dakwa
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ============================================ */}
                        {/* SIGNATURE SECTION */}
                        {/* ============================================ */}

                        <section className="mt-12 pt-8 border-t">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <p className="text-gray-600 mb-8">Disediakan oleh:</p>
                                    <div className="border-b border-gray-300 w-48 mb-2"></div>
                                    <p className="font-semibold">{vars.NAMA_PEGAWAI_PENYIASAT}</p>
                                    <p className="text-sm text-gray-600">{vars.JAWATAN_PEGAWAI}</p>
                                    <p className="text-sm text-gray-600">{vars.STESEN_PEGAWAI}</p>
                                    <p className="text-sm text-gray-500 mt-2">Tarikh: {vars.TARIKH_LAPORAN}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 mb-8">Disemak oleh:</p>
                                    <div className="border-b border-gray-300 w-48 mb-2"></div>
                                    <p className="font-semibold">.................................</p>
                                    <p className="text-sm text-gray-600">Pegawai Penyemak</p>
                                    <p className="text-sm text-gray-500 mt-2">Tarikh: ................</p>
                                </div>
                            </div>
                        </section>

                    </div>
                </div>
            </main>

            {/* Print Styles */}
            <style>{`
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:rounded-none { border-radius: 0 !important; }
          .print\\:p-6 { padding: 1.5rem !important; }
        }
      `}</style>
        </div>
    );
}
