// ============================================
// src/components/documents/ChargeSheet.tsx
// Komponen Kertas Pertuduhan
// ============================================

'use client';

import React from 'react';

// ============================================
// Types
// ============================================

interface Employer {
    company_name: string;
    ssm_number: string | null;
    address: string | null;
    owner_name: string | null;
    owner_ic: string | null;
    state: string | null;
}

interface CaseData {
    case_number: string;
    act_type: 'Akta 4' | 'Akta 800';
    offense_type: string;
    date_of_offense: string;
    time_of_offense: string | null;
    location_of_offense: string | null;
    section_charged: string;
    section_penalty: string;
}

interface ChargeSheetProps {
    employer: Employer;
    caseData: CaseData;
    employees?: { name: string; ic: string }[];
}

// ============================================
// Helper: Format Date
// ============================================

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ms-MY', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

// ============================================
// ChargeSheet Component
// ============================================

export default function ChargeSheet({ employer, caseData, employees = [] }: ChargeSheetProps) {

    // ============================================
    // CONDITIONAL RENDERING: Semak Akta
    // ============================================

    const isAkta4 = caseData.act_type === 'Akta 4';
    const isAkta800 = caseData.act_type === 'Akta 800';

    // Nama Akta penuh
    const actFullName = isAkta4
        ? 'Akta Keselamatan Sosial Pekerja 1969 [Akta 4]'
        : 'Akta Sistem Insurans Pekerjaan 2017 [Akta 800]';

    // Seksyen berdasarkan Akta
    const chargeSection = isAkta4 ? 'Seksyen 4' : 'Seksyen 14(1)';
    const penaltySection = isAkta4 ? 'Seksyen 94(g)' : 'Seksyen 14(2)';

    // Variables untuk template
    const v = {
        NAMA_SYARIKAT: employer.company_name,
        NO_SSM: employer.ssm_number || 'TIADA',
        ALAMAT: employer.address || '[ALAMAT TIDAK DIKETAHUI]',
        NAMA_PENGARAH: employer.owner_name || '-',
        NO_KP_PENGARAH: employer.owner_ic || '-',
        NEGERI: employer.state || 'SELANGOR',
        TARIKH_KESALAHAN: formatDate(caseData.date_of_offense),
        MASA: caseData.time_of_offense || '10.00 pagi',
        LOKASI: caseData.location_of_offense || employer.address || '[LOKASI]',
        NO_KES: caseData.case_number,
    };

    // ============================================
    // Render
    // ============================================

    return (
        <div
            className="bg-white mx-auto max-w-4xl shadow-lg print:shadow-none"
            style={{
                fontFamily: '"Times New Roman", Times, serif',
                fontSize: '14pt',
                lineHeight: '1.8',
                padding: '60px 80px',
            }}
        >
            {/* ============================================ */}
            {/* HEADER */}
            {/* ============================================ */}

            <div className="text-center mb-10">
                <p className="text-xs tracking-[0.3em] mb-4 text-gray-500">SULIT</p>
                <h1 className="text-base font-bold uppercase tracking-wide">
                    DALAM MAHKAMAH MAJISTRET DI {v.NEGERI.toUpperCase()}
                </h1>
                <h2 className="text-base font-bold uppercase">
                    DALAM NEGERI {v.NEGERI.toUpperCase()}, MALAYSIA
                </h2>
                <p className="mt-6 font-bold text-lg">
                    KES SAMAN NO: {v.NO_KES}
                </p>
            </div>

            {/* ============================================ */}
            {/* PARTIES */}
            {/* ============================================ */}

            <div className="text-center my-10">
                <p className="font-bold text-lg tracking-wide">PENDAKWA RAYA</p>
                <p className="my-6 text-3xl font-bold">LAWAN</p>
                <p className="font-bold text-lg uppercase">{v.NAMA_SYARIKAT}</p>
                <p className="text-sm mt-1">(No. SSM: {v.NO_SSM})</p>
                {v.NAMA_PENGARAH !== '-' && (
                    <p className="text-sm text-gray-600 mt-1">
                        ({v.NAMA_PENGARAH} - {v.NO_KP_PENGARAH})
                    </p>
                )}
            </div>

            {/* ============================================ */}
            {/* PERTUDUHAN TITLE */}
            {/* ============================================ */}

            <div className="text-center my-10 border-b-2 border-black pb-4">
                <h2 className="text-xl font-bold uppercase tracking-[0.2em]">
                    PERTUDUHAN
                </h2>
            </div>

            {/* ============================================ */}
            {/* CHARGE BODY - CONDITIONAL BASED ON ACT TYPE */}
            {/* ============================================ */}

            <div style={{ textAlign: 'justify' }}>

                {/* AKTA 4: Seksyen 4 - Gagal Daftar Perusahaan */}
                {isAkta4 && (
                    <>
                        <p className="mb-6" style={{ textIndent: '3rem' }}>
                            Bahawa kamu, <strong>{v.NAMA_SYARIKAT}</strong> (No. SSM: {v.NO_SSM}),
                            pada <strong>{v.TARIKH_KESALAHAN}</strong> lebih kurang jam <strong>{v.MASA}</strong> di{' '}
                            <strong>{v.LOKASI}</strong> dalam daerah <strong>{v.NEGERI}</strong>, dalam
                            negeri <strong>{v.NEGERI}</strong>, sebagai seorang <strong>majikan utama</strong> yang
                            menjalankan perusahaan yang dinyatakan dalam Jadual Pertama Akta ini, telah
                            <strong> gagal untuk mendaftarkan</strong> perusahaan tersebut dengan
                            Pertubuhan Keselamatan Sosial dalam tempoh yang ditetapkan.
                        </p>

                        <p className="mb-6" style={{ textIndent: '3rem' }}>
                            Oleh yang demikian, kamu telah melakukan suatu kesalahan di bawah{' '}
                            <strong>Seksyen 4</strong> Akta Keselamatan Sosial Pekerja 1969 dan boleh
                            dihukum di bawah <strong>Seksyen 94(g)</strong> Akta yang sama.
                        </p>
                    </>
                )}

                {/* AKTA 800: Seksyen 14/16 - Gagal Daftar */}
                {isAkta800 && (
                    <>
                        <p className="mb-6" style={{ textIndent: '3rem' }}>
                            Bahawa kamu, <strong>{v.NAMA_SYARIKAT}</strong> (No. SSM: {v.NO_SSM}),
                            pada <strong>{v.TARIKH_KESALAHAN}</strong> lebih kurang jam <strong>{v.MASA}</strong> di{' '}
                            <strong>{v.LOKASI}</strong> dalam daerah <strong>{v.NEGERI}</strong>, dalam
                            negeri <strong>{v.NEGERI}</strong>, sebagai seorang <strong>majikan</strong>, telah
                            <strong> gagal untuk mendaftarkan</strong> perusahaan/pekerja tersebut dengan
                            Sistem Insurans Pekerjaan dalam tempoh yang ditetapkan.
                        </p>

                        {/* Senarai Pekerja (jika ada) */}
                        {employees.length > 0 && (
                            <div className="my-6 pl-12">
                                <p className="font-bold mb-2">Iaitu pekerja-pekerja berikut:</p>
                                <ol className="list-decimal pl-6">
                                    {employees.map((emp, i) => (
                                        <li key={i} className="mb-1">
                                            <strong>{emp.name}</strong> (No. KP: {emp.ic})
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        )}

                        <p className="mb-6" style={{ textIndent: '3rem' }}>
                            Oleh yang demikian, kamu telah melakukan suatu kesalahan di bawah{' '}
                            <strong>Seksyen 16(1)</strong> Akta Sistem Insurans Pekerjaan 2017 dan boleh
                            dihukum di bawah <strong>Seksyen 16(5)</strong> Akta yang sama.
                        </p>
                    </>
                )}
            </div>

            {/* ============================================ */}
            {/* BUTIRAN HUKUMAN */}
            {/* ============================================ */}

            <div
                className="my-10 p-6 border-2 border-black"
                style={{ textAlign: 'justify' }}
            >
                <p className="font-bold uppercase mb-3">BUTIRAN HUKUMAN:</p>
                <p>
                    Jika disabitkan kesalahan, boleh didenda tidak melebihi{' '}
                    <strong>Ringgit Malaysia Sepuluh Ribu (RM10,000.00)</strong> atau
                    dipenjarakan selama tempoh tidak melebihi <strong>Dua (2) tahun</strong> atau
                    kedua-duanya sekali.
                </p>
            </div>

            {/* ============================================ */}
            {/* SECTION REFERENCE BOXES */}
            {/* ============================================ */}

            <div className="grid grid-cols-2 gap-6 my-10">
                <div className="border-2 border-black p-5 text-center">
                    <p className="text-sm font-bold uppercase mb-2 text-gray-600">
                        Seksyen Pertuduhan
                    </p>
                    <p className="text-3xl font-bold">
                        {caseData.section_charged || chargeSection}
                    </p>
                    <p className="text-xs mt-3 text-gray-500">{actFullName}</p>
                </div>
                <div className="border-2 border-black p-5 text-center">
                    <p className="text-sm font-bold uppercase mb-2 text-gray-600">
                        Seksyen Hukuman
                    </p>
                    <p className="text-3xl font-bold">
                        {caseData.section_penalty || penaltySection}
                    </p>
                    <p className="text-xs mt-3 text-gray-500">{actFullName}</p>
                </div>
            </div>

            {/* ============================================ */}
            {/* FOOTER */}
            {/* ============================================ */}

            <div className="mt-16 pt-6 border-t text-center text-sm text-gray-500">
                <p>Dokumen ini dijana oleh Sistem Pendakwaan PERKESO</p>
                <p className="mt-1">
                    {new Date().toLocaleDateString('ms-MY', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                    })}
                </p>
            </div>

            {/* ============================================ */}
            {/* PRINT STYLES */}
            {/* ============================================ */}

            <style jsx>{`
        @media print {
          div {
            box-shadow: none !important;
          }
        }
      `}</style>
        </div>
    );
}

// ============================================
// USAGE EXAMPLE:
// ============================================
/*
import ChargeSheet from '@/components/documents/ChargeSheet';

// Dalam component anda:
<ChargeSheet
  employer={{
    company_name: "Syarikat Jaya Makmur Sdn Bhd",
    ssm_number: "1234567-A",
    address: "No. 123, Jalan Industri, Puchong",
    owner_name: "Tan Ah Kow",
    owner_ic: "680415-10-5432",
    state: "Selangor"
  }}
  caseData={{
    case_number: "KES/2026/00123",
    act_type: "Akta 4",  // atau "Akta 800"
    offense_type: "Gagal Daftar Perusahaan",
    date_of_offense: "2026-01-15",
    time_of_offense: "10.00 pagi",
    location_of_offense: "Premis majikan",
    section_charged: "Seksyen 4",
    section_penalty: "Seksyen 94(g)"
  }}
  employees={[
    { name: "Nurul Izzati", ic: "950312-14-5432" },
    { name: "Muhammad Hafiz", ic: "980715-08-7654" }
  ]}
/>
*/
