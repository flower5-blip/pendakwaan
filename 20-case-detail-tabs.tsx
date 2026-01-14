// ============================================
// src/app/cases/[id]/CaseDetailTabs.tsx
// Client Component for Tab Switching
// Kertas Minit vs Pertuduhan View
// ============================================

'use client';

import { useState } from 'react';

// ============================================
// Types
// ============================================

interface CaseData {
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

interface Employee {
    id: string;
    full_name: string;
    ic_number: string | null;
    position: string | null;
    employment_start_date: string | null;
    monthly_salary: number | null;
}

interface Evidence {
    id: string;
    exhibit_number: string;
    name: string;
    description: string | null;
    status: string;
}

interface Props {
    caseData: CaseData;
    employees: Employee[];
    evidences: Evidence[];
}

// ============================================
// Helper Functions
// ============================================

function formatDate(dateString: string | null): string {
    if (!dateString) return '..................';
    return new Date(dateString).toLocaleDateString('ms-MY', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

// ============================================
// Main Component
// ============================================

export default function CaseDetailTabs({ caseData, employees, evidences }: Props) {
    const [activeTab, setActiveTab] = useState<'minit' | 'pertuduhan'>('minit');

    // Template variables
    const v = {
        NAMA_SYARIKAT: caseData.employers?.company_name || '[NAMA SYARIKAT]',
        NO_SSM: caseData.employers?.ssm_number || '[NO SSM]',
        ALAMAT: caseData.employers?.address || '[ALAMAT PREMIS]',
        NO_KOD_MAJIKAN: caseData.employers?.employer_code || 'TIADA',
        NAMA_PENGARAH: caseData.employers?.owner_name || '[NAMA PENGARAH]',
        NO_KP_PENGARAH: caseData.employers?.owner_ic || '[NO KP]',
        NEGERI: caseData.employers?.state || '[NEGERI]',
        TARIKH_KESALAHAN: formatDate(caseData.date_of_offense),
        TARIKH_LAWATAN: formatDate(caseData.inspection_date),
        LOKASI: caseData.location_of_offense || caseData.employers?.address || '[LOKASI]',
        SEKSYEN_PERTUDUHAN: caseData.section_charged,
        SEKSYEN_HUKUMAN: caseData.section_penalty,
        SEKSYEN_KOMPAUN: caseData.section_compound || '-',
        AKTA: caseData.act_type,
        JENIS_KESALAHAN: caseData.offense_type,
        BIL_PEKERJA: caseData.total_employees_affected || employees.length,
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* ============================================ */}
            {/* Tab Buttons */}
            {/* ============================================ */}

            <div className="flex border-b">
                <button
                    onClick={() => setActiveTab('minit')}
                    className={`
            flex-1 px-6 py-4 text-center font-medium transition
            ${activeTab === 'minit'
                            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }
          `}
                >
                    📋 Kertas Minit Siasatan
                </button>
                <button
                    onClick={() => setActiveTab('pertuduhan')}
                    className={`
            flex-1 px-6 py-4 text-center font-medium transition
            ${activeTab === 'pertuduhan'
                            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }
          `}
                >
                    ⚖️ Kertas Pertuduhan
                </button>
            </div>

            {/* ============================================ */}
            {/* Tab Content */}
            {/* ============================================ */}

            <div className="p-6">
                {activeTab === 'minit' ? (
                    <KertasMinit v={v} employees={employees} evidences={evidences} caseData={caseData} />
                ) : (
                    <KertasPertuduhan v={v} employees={employees} caseData={caseData} />
                )}
            </div>
        </div>
    );
}

// ============================================
// Kertas Minit Siasatan Component
// ============================================

function KertasMinit({
    v,
    employees,
    evidences,
    caseData
}: {
    v: any;
    employees: Employee[];
    evidences: Evidence[];
    caseData: CaseData;
}) {
    return (
        <div
            className="prose max-w-none"
            style={{ fontFamily: '"Times New Roman", Times, serif' }}
        >
            {/* Header */}
            <div className="text-center mb-8 pb-4 border-b-2 border-black">
                <p className="text-sm tracking-widest mb-2">SULIT</p>
                <h1 className="text-xl font-bold mb-1">KERTAS MINIT PEGAWAI PENYIASAT</h1>
                <h2 className="text-lg font-bold">PERTUBUHAN KESELAMATAN SOSIAL (PERKESO)</h2>
                <p className="mt-2">{v.AKTA === 'Akta 4'
                    ? 'Akta Keselamatan Sosial Pekerja 1969'
                    : 'Akta Sistem Insurans Pekerjaan 2017'}
                </p>
            </div>

            {/* 1. Sasaran */}
            <section className="mb-8">
                <h3 className="font-bold border-b pb-2 mb-4">1. SASARAN (OKT)</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                    <div>
                        <span className="text-gray-600">Nama Syarikat:</span>
                        <p className="font-bold">{v.NAMA_SYARIKAT}</p>
                    </div>
                    <div>
                        <span className="text-gray-600">No. Kod Majikan:</span>
                        <p className="font-mono">{v.NO_KOD_MAJIKAN}</p>
                    </div>
                    <div>
                        <span className="text-gray-600">No. SSM:</span>
                        <p className="font-mono">{v.NO_SSM}</p>
                    </div>
                    <div>
                        <span className="text-gray-600">Negeri:</span>
                        <p>{v.NEGERI}</p>
                    </div>
                    <div className="col-span-2">
                        <span className="text-gray-600">Alamat Premis:</span>
                        <p>{v.ALAMAT}</p>
                    </div>
                </div>
            </section>

            {/* 2. Ringkasan Kes */}
            <section className="mb-8">
                <h3 className="font-bold border-b pb-2 mb-4">2. RINGKASAN KES</h3>
                <p className="text-justify leading-relaxed">
                    Siasatan dijalankan berikutan pemeriksaan yang dijalankan pada <strong>{v.TARIKH_LAWATAN}</strong> di
                    premis <strong>{v.NAMA_SYARIKAT}</strong> yang beralamat di <strong>{v.ALAMAT}</strong>.
                    Hasil semakan mendapati majikan disyaki telah melakukan kesalahan <strong>{v.JENIS_KESALAHAN}</strong> di
                    bawah {v.AKTA}.
                </p>
                <p className="text-justify leading-relaxed mt-4">
                    Saya telah pergi ke premis <strong>{v.NAMA_SYARIKAT}</strong> pada {v.TARIKH_LAWATAN} dan
                    mendapati majikan telah gagal mematuhi peruntukan di bawah <strong>{v.SEKSYEN_PERTUDUHAN}</strong> {v.AKTA}.
                    Sebanyak <strong>{v.BIL_PEKERJA}</strong> orang pekerja didapati terlibat dalam kes ini.
                </p>
            </section>

            {/* 3. Seksyen */}
            <section className="mb-8">
                <h3 className="font-bold border-b pb-2 mb-4">3. SEKSYEN YANG BERKAITAN</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-indigo-50 border border-indigo-200 p-4 rounded text-center">
                        <p className="text-sm text-indigo-600 font-medium">PERTUDUHAN</p>
                        <p className="text-2xl font-bold text-indigo-800">{v.SEKSYEN_PERTUDUHAN}</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 p-4 rounded text-center">
                        <p className="text-sm text-red-600 font-medium">HUKUMAN</p>
                        <p className="text-2xl font-bold text-red-800">{v.SEKSYEN_HUKUMAN}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 p-4 rounded text-center">
                        <p className="text-sm text-green-600 font-medium">KOMPAUN</p>
                        <p className="text-2xl font-bold text-green-800">{v.SEKSYEN_KOMPAUN}</p>
                    </div>
                </div>
            </section>

            {/* 4. Senarai Pekerja */}
            {employees.length > 0 && (
                <section className="mb-8">
                    <h3 className="font-bold border-b pb-2 mb-4">4. SENARAI PEKERJA TERLIBAT</h3>
                    <table className="w-full text-sm border">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2 text-left">Bil</th>
                                <th className="border p-2 text-left">Nama</th>
                                <th className="border p-2 text-left">No. KP</th>
                                <th className="border p-2 text-left">Jawatan</th>
                                <th className="border p-2 text-left">Tarikh Mula</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp, i) => (
                                <tr key={emp.id}>
                                    <td className="border p-2">{i + 1}</td>
                                    <td className="border p-2 font-medium">{emp.full_name}</td>
                                    <td className="border p-2 font-mono">{emp.ic_number || '-'}</td>
                                    <td className="border p-2">{emp.position || '-'}</td>
                                    <td className="border p-2">{formatDate(emp.employment_start_date)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            )}

            {/* 5. Senarai Eksibit */}
            {evidences.length > 0 && (
                <section className="mb-8">
                    <h3 className="font-bold border-b pb-2 mb-4">5. SENARAI EKSIBIT</h3>
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

            {/* 6. Syor */}
            <section className="mb-8">
                <h3 className="font-bold border-b pb-2 mb-4">{employees.length > 0 ? '6' : '4'}. SYOR PEGAWAI PENYIASAT</h3>
                <p className="text-justify leading-relaxed">
                    Berdasarkan keterangan dan bukti yang dikumpulkan, terdapat bukti <em>prima facie</em> yang
                    mencukupi terhadap OKT atas kesalahan melanggar <strong>{v.SEKSYEN_PERTUDUHAN}</strong> di
                    bawah {v.AKTA}.
                </p>
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                    <p className="font-bold mb-2">Syor:</p>
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
    );
}

// ============================================
// Kertas Pertuduhan Component (Charge Sheet)
// ============================================

function KertasPertuduhan({
    v,
    employees,
    caseData
}: {
    v: any;
    employees: Employee[];
    caseData: CaseData;
}) {
    // Conditional text based on Act type
    const actFullName = caseData.act_type === 'Akta 4'
        ? 'Akta Keselamatan Sosial Pekerja 1969'
        : 'Akta Sistem Insurans Pekerjaan 2017';

    return (
        <div
            className="max-w-3xl mx-auto"
            style={{
                fontFamily: '"Times New Roman", Times, serif',
                fontSize: '14pt',
                lineHeight: '1.8',
            }}
        >
            {/* Header */}
            <div className="text-center mb-8">
                <p className="text-sm tracking-widest mb-4">SULIT</p>
                <h1 className="text-lg font-bold uppercase">
                    DALAM MAHKAMAH MAJISTRET DI {v.NEGERI.toUpperCase()}
                </h1>
                <h2 className="text-base font-bold uppercase">
                    DALAM NEGERI {v.NEGERI.toUpperCase()}, MALAYSIA
                </h2>
                <p className="mt-4 font-bold">KES SAMAN NO: {caseData.case_number}</p>
            </div>

            {/* Parties */}
            <div className="text-center my-8">
                <p className="font-bold text-lg">PENDAKWA RAYA</p>
                <p className="my-4 text-2xl font-bold">LAWAN</p>
                <p className="font-bold text-lg uppercase">{v.NAMA_SYARIKAT}</p>
                {v.NAMA_PENGARAH && (
                    <p className="text-sm">({v.NAMA_PENGARAH} - {v.NO_KP_PENGARAH})</p>
                )}
            </div>

            {/* Pertuduhan Title */}
            <div className="text-center my-8 border-b-2 border-black pb-4">
                <h2 className="text-xl font-bold uppercase tracking-widest">PERTUDUHAN</h2>
            </div>

            {/* Charge Body - Conditional Based on Act Type */}
            <div className="my-8" style={{ textAlign: 'justify' }}>
                <p className="mb-6" style={{ textIndent: '2rem' }}>
                    Bahawa kamu, <strong>{v.NAMA_SYARIKAT}</strong>, pada <strong>{v.TARIKH_KESALAHAN}</strong> lebih
                    kurang jam <strong>{caseData.time_of_offense || '10.00 pagi'}</strong> di <strong>{v.LOKASI}</strong> dalam
                    daerah <strong>{v.NEGERI}</strong>, dalam negeri <strong>{v.NEGERI}</strong>, sebagai
                    seorang majikan{caseData.act_type === 'Akta 4' ? ' utama' : ''}, telah gagal
                    untuk {getOffenseDescription(caseData.offense_type, caseData.act_type)}.
                </p>

                {/* Employee List */}
                {employees.length > 0 && caseData.offense_type.includes('Pekerja') && (
                    <div className="my-6 pl-8">
                        <p className="font-bold mb-2">Senarai Pekerja:</p>
                        <ol className="list-decimal pl-6">
                            {employees.map((emp, i) => (
                                <li key={emp.id} className="mb-1">
                                    <strong>{emp.full_name}</strong>
                                    {emp.ic_number && ` (No. KP: ${emp.ic_number})`}
                                </li>
                            ))}
                        </ol>
                    </div>
                )}

                <p className="mb-6" style={{ textIndent: '2rem' }}>
                    Oleh yang demikian, kamu telah melakukan suatu kesalahan di bawah <strong>{v.SEKSYEN_PERTUDUHAN}</strong> {actFullName} dan
                    boleh dihukum di bawah <strong>{v.SEKSYEN_HUKUMAN}</strong> Akta yang sama.
                </p>
            </div>

            {/* Penalty Box */}
            <div className="my-8 p-6 border-2 border-black" style={{ textAlign: 'justify' }}>
                <p className="font-bold uppercase mb-2">BUTIRAN HUKUMAN:</p>
                <p>
                    Jika disabitkan kesalahan, boleh didenda tidak melebihi <strong>Ringgit Malaysia
                        Sepuluh Ribu (RM10,000.00)</strong> atau dipenjarakan selama tempoh tidak melebihi
                    <strong> Dua (2) tahun</strong> atau kedua-duanya sekali.
                </p>
            </div>

            {/* Section Reference */}
            <div className="my-8 grid grid-cols-2 gap-4">
                <div className="border-2 border-black p-4 text-center">
                    <p className="text-sm font-bold mb-2">SEKSYEN PERTUDUHAN</p>
                    <p className="text-3xl font-bold">{v.SEKSYEN_PERTUDUHAN}</p>
                    <p className="text-xs mt-2">{actFullName}</p>
                </div>
                <div className="border-2 border-black p-4 text-center">
                    <p className="text-sm font-bold mb-2">SEKSYEN HUKUMAN</p>
                    <p className="text-3xl font-bold">{v.SEKSYEN_HUKUMAN}</p>
                    <p className="text-xs mt-2">{actFullName}</p>
                </div>
            </div>
        </div>
    );
}

// ============================================
// Helper: Get Offense Description
// ============================================

function getOffenseDescription(offenseType: string, actType: string): string {
    const descriptions: Record<string, string> = {
        'Gagal Daftar Perusahaan': 'mendaftarkan perusahaan tersebut dengan Pertubuhan dalam tempoh yang ditetapkan',
        'Gagal Daftar Pekerja': 'mendaftarkan pekerja-pekerja dengan Pertubuhan dalam tempoh yang ditetapkan, iaitu dalam masa 30 hari dari tarikh pekerja-pekerja tersebut mula diambil bekerja',
        'Gagal Daftar SIP': 'mendaftarkan perusahaan tersebut dengan Sistem Insurans Pekerjaan dalam tempoh yang ditetapkan',
        'Gagal Bayar Caruman': 'membayar caruman dalam tempoh yang ditetapkan mengikut Akta ini',
    };
    return descriptions[offenseType] || 'mematuhi peruntukan Akta';
}
