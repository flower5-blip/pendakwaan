// ============================================
// src/components/documents/InvestigationPaper.tsx
// Komponen Kertas Minit Siasatan
// ============================================

'use client';

import React from 'react';

// ============================================
// Types
// ============================================

interface Employer {
    company_name: string;
    ssm_number?: string | null;
    employer_code?: string | null;
    address?: string | null;
    owner_name?: string | null;
    owner_ic?: string | null;
    phone?: string | null;
    state?: string | null;
}

interface CaseData {
    case_number: string;
    act_type: string;
    offense_type: string;
    status: string;
    date_of_offense: string;
    time_of_offense?: string | null;
    location_of_offense?: string | null;
    section_charged: string;
    section_penalty: string;
    section_compound?: string | null;
    inspection_date?: string | null;
    inspection_location?: string | null;
    arrears_amount?: number | null;
    total_employees_affected?: number | null;
    recommendation?: string | null;
    notes?: string | null;
    created_at: string;
}

interface Employee {
    id: string;
    full_name: string;
    ic_number?: string | null;
    position?: string | null;
    employment_start_date?: string | null;
    monthly_salary?: number | null;
}

interface Evidence {
    id: string;
    exhibit_number: string;
    name: string;
    description?: string | null;
    status: string;
}

interface Props {
    employer: Employer;
    caseData: CaseData;
    employees?: Employee[];
    evidences?: Evidence[];
}

// ============================================
// Helpers
// ============================================

function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '..................';
    return new Date(dateString).toLocaleDateString('ms-MY', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function formatCurrency(amount: number | null | undefined): string {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('ms-MY', {
        style: 'currency',
        currency: 'MYR',
    }).format(amount);
}

// ============================================
// Main Component
// ============================================

export default function InvestigationPaper({
    employer,
    caseData,
    employees = [],
    evidences = []
}: Props) {

    const isAkta4 = caseData.act_type === 'akta_4' || caseData.act_type === 'Akta 4';

    const actFullName = isAkta4
        ? 'Akta Keselamatan Sosial Pekerja 1969'
        : 'Akta Sistem Insurans Pekerjaan 2017';

    const v = {
        NO_KES: caseData.case_number,
        NAMA_SYARIKAT: employer.company_name,
        NO_SSM: employer.ssm_number || 'TIADA',
        NO_KOD_MAJIKAN: employer.employer_code || 'TIADA',
        ALAMAT: employer.address || '[ALAMAT]',
        NEGERI: employer.state || '[NEGERI]',
        NAMA_PENGARAH: employer.owner_name || '-',
        NO_KP_PENGARAH: employer.owner_ic || '-',
        TELEFON: employer.phone || '-',
        TARIKH_KESALAHAN: formatDate(caseData.date_of_offense),
        TARIKH_LAWATAN: formatDate(caseData.inspection_date),
        LOKASI: caseData.location_of_offense || employer.address || '[LOKASI]',
        BIL_PEKERJA: caseData.total_employees_affected || employees.length,
    };

    const handlePrint = () => window.print();

    return (
        <div>
            {/* Print Button - Hidden on Print */}
            <div className="flex justify-end mb-4 print:hidden">
                <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center gap-2"
                >
                    🖨️ Cetak Kertas Minit
                </button>
            </div>

            {/* Main Document */}
            <div
                className="bg-white mx-auto max-w-4xl shadow-lg print:shadow-none p-8"
                style={{ fontFamily: '"Times New Roman", Times, serif' }}
            >
                {/* Header */}
                <div className="text-center mb-8 pb-4 border-b-2 border-black">
                    <p className="text-sm tracking-widest mb-2">SULIT</p>
                    <h1 className="text-xl font-bold mb-1">KERTAS MINIT PEGAWAI PENYIASAT</h1>
                    <h2 className="text-lg font-bold">PERTUBUHAN KESELAMATAN SOSIAL (PERKESO)</h2>
                    <p className="mt-2">{actFullName}</p>
                </div>

                {/* Case Reference */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-sm text-blue-600 font-medium">NO. FAIL:</span>
                            <span className="ml-2 font-mono font-bold text-blue-800">{v.NO_KES}</span>
                        </div>
                        <div>
                            <span className="text-sm text-blue-600 font-medium">STATUS:</span>
                            <span className="ml-2 font-medium text-blue-800">{caseData.status}</span>
                        </div>
                    </div>
                </div>

                {/* 1. Sasaran */}
                <section className="mb-8">
                    <h3 className="text-lg font-bold border-b pb-2 mb-4">1. SASARAN (OKT)</h3>
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                        <div>
                            <span className="text-sm text-gray-600">Nama Syarikat:</span>
                            <p className="font-bold">{v.NAMA_SYARIKAT}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-600">No. Kod Majikan:</span>
                            <p className="font-mono">{v.NO_KOD_MAJIKAN}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-600">No. SSM:</span>
                            <p className="font-mono">{v.NO_SSM}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-600">Telefon:</span>
                            <p>{v.TELEFON}</p>
                        </div>
                        <div className="col-span-2">
                            <span className="text-sm text-gray-600">Alamat Premis:</span>
                            <p>{v.ALAMAT}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-600">Nama Pengarah:</span>
                            <p>{v.NAMA_PENGARAH}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-600">No. KP:</span>
                            <p className="font-mono">{v.NO_KP_PENGARAH}</p>
                        </div>
                    </div>
                </section>

                {/* 2. Maklumat Kesalahan */}
                <section className="mb-8">
                    <h3 className="text-lg font-bold border-b pb-2 mb-4">2. MAKLUMAT KESALAHAN</h3>
                    <div className="bg-red-50 border border-red-200 p-4 rounded mb-4">
                        <p className="text-red-800">
                            <strong>Jenis Kesalahan:</strong> {caseData.offense_type}
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-3 rounded">
                            <span className="text-sm text-gray-600">Tarikh Kesalahan:</span>
                            <p className="font-semibold">{v.TARIKH_KESALAHAN}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                            <span className="text-sm text-gray-600">Tarikh Lawatan:</span>
                            <p className="font-semibold">{v.TARIKH_LAWATAN}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                            <span className="text-sm text-gray-600">Bil. Pekerja:</span>
                            <p className="font-semibold">{v.BIL_PEKERJA} orang</p>
                        </div>
                    </div>
                </section>

                {/* 3. Seksyen */}
                <section className="mb-8">
                    <h3 className="text-lg font-bold border-b pb-2 mb-4">3. SEKSYEN YANG BERKAITAN</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-indigo-50 border border-indigo-200 p-4 rounded text-center">
                            <p className="text-sm text-indigo-600 font-medium">PERTUDUHAN</p>
                            <p className="text-xl font-bold text-indigo-800">{caseData.section_charged.split(',')[0]}</p>
                        </div>
                        <div className="bg-red-50 border border-red-200 p-4 rounded text-center">
                            <p className="text-sm text-red-600 font-medium">HUKUMAN</p>
                            <p className="text-xl font-bold text-red-800">{caseData.section_penalty.split(',')[0]}</p>
                        </div>
                        <div className="bg-green-50 border border-green-200 p-4 rounded text-center">
                            <p className="text-sm text-green-600 font-medium">KOMPAUN</p>
                            <p className="text-xl font-bold text-green-800">{caseData.section_compound || '-'}</p>
                        </div>
                    </div>
                </section>

                {/* 4. Senarai Pekerja */}
                {employees.length > 0 && (
                    <section className="mb-8">
                        <h3 className="text-lg font-bold border-b pb-2 mb-4">4. SENARAI PEKERJA TERLIBAT</h3>
                        <table className="w-full text-sm border">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border p-2 text-left">Bil</th>
                                    <th className="border p-2 text-left">Nama</th>
                                    <th className="border p-2 text-left">No. KP</th>
                                    <th className="border p-2 text-left">Jawatan</th>
                                    <th className="border p-2 text-right">Gaji (RM)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((emp, i) => (
                                    <tr key={emp.id}>
                                        <td className="border p-2">{i + 1}</td>
                                        <td className="border p-2 font-medium">{emp.full_name}</td>
                                        <td className="border p-2 font-mono">{emp.ic_number || '-'}</td>
                                        <td className="border p-2">{emp.position || '-'}</td>
                                        <td className="border p-2 text-right">{formatCurrency(emp.monthly_salary)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                )}

                {/* 5. Senarai Eksibit */}
                {evidences.length > 0 && (
                    <section className="mb-8">
                        <h3 className="text-lg font-bold border-b pb-2 mb-4">{employees.length > 0 ? '5' : '4'}. SENARAI EKSIBIT</h3>
                        <div className="space-y-2">
                            {evidences.map((ev) => (
                                <div key={ev.id} className="flex gap-4 p-2 bg-gray-50 rounded">
                                    <span className="font-mono font-bold text-blue-600 w-10">{ev.exhibit_number}</span>
                                    <div>
                                        <p className="font-medium">{ev.name}</p>
                                        <p className="text-sm text-gray-500">{ev.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Ringkasan */}
                <section className="mb-8">
                    <h3 className="text-lg font-bold border-b pb-2 mb-4">
                        {employees.length > 0 ? (evidences.length > 0 ? '6' : '5') : (evidences.length > 0 ? '5' : '4')}. RINGKASAN KES
                    </h3>
                    <p className="text-justify leading-relaxed">
                        Siasatan dijalankan berikutan pemeriksaan pada <strong>{v.TARIKH_LAWATAN}</strong> di
                        premis <strong>{v.NAMA_SYARIKAT}</strong> yang beralamat di <strong>{v.ALAMAT}</strong>.
                        Hasil semakan mendapati majikan disyaki melakukan kesalahan <strong>{caseData.offense_type}</strong> di
                        bawah {actFullName}.
                    </p>
                    {caseData.notes && (
                        <div className="mt-4 p-4 bg-gray-50 rounded">
                            <p className="text-sm text-gray-500 mb-1">Nota:</p>
                            <p>{caseData.notes}</p>
                        </div>
                    )}
                </section>

                {/* Syor */}
                <section className="mb-8">
                    <h3 className="text-lg font-bold border-b pb-2 mb-4">SYOR PEGAWAI PENYIASAT</h3>
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                        <p className="mb-4">
                            Berdasarkan bukti, terdapat <em>prima facie</em> terhadap OKT atas
                            kesalahan <strong>{caseData.section_charged.split(',')[0]}</strong>.
                        </p>
                        <div className="flex gap-6">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={caseData.recommendation === 'compound'} readOnly />
                                Tawarkan Kompaun
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={caseData.recommendation === 'prosecute'} readOnly />
                                Pendakwaan
                            </label>
                        </div>
                    </div>
                </section>

                {/* Signature */}
                <section className="mt-12 pt-8 border-t">
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-gray-500 mb-10">Disediakan oleh:</p>
                            <div className="border-b border-black w-48 mb-2"></div>
                            <p className="font-bold">Pegawai Penyiasat</p>
                            <p className="text-sm text-gray-500">Tarikh: {formatDate(caseData.created_at)}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 mb-10">Disemak oleh:</p>
                            <div className="border-b border-black w-48 mb-2"></div>
                            <p className="font-bold">Pegawai Penyemak</p>
                            <p className="text-sm text-gray-500">Tarikh: ..................</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
