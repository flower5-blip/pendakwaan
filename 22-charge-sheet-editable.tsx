// ============================================
// src/components/documents/ChargeSheet.tsx
// Komponen Kertas Pertuduhan - EDITABLE VERSION
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
// ChargeSheet Component (EDITABLE)
// ============================================

export default function ChargeSheet({ employer, caseData, employees = [] }: ChargeSheetProps) {

    const isAkta4 = caseData.act_type === 'Akta 4';
    const isAkta800 = caseData.act_type === 'Akta 800';

    const actFullName = isAkta4
        ? 'Akta Keselamatan Sosial Pekerja 1969 [Akta 4]'
        : 'Akta Sistem Insurans Pekerjaan 2017 [Akta 800]';

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
    // Handle Print
    // ============================================

    const handlePrint = () => {
        window.print();
    };

    // ============================================
    // Render
    // ============================================

    return (
        <div>
            {/* ============================================ */}
            {/* AMARAN EDITABLE - Print Hidden */}
            {/* ============================================ */}

            <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-6 flex items-center gap-3 print:hidden">
                <span className="text-2xl">✏️</span>
                <div>
                    <p className="font-medium text-amber-800">
                        Anda boleh klik pada teks di bawah untuk menyunting sebelum mencetak
                    </p>
                    <p className="text-sm text-amber-600 mt-1">
                        Sebarang perubahan hanya untuk cetakan ini dan tidak akan disimpan ke pangkalan data.
                    </p>
                </div>
                <button
                    onClick={handlePrint}
                    className="ml-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition"
                >
                    🖨️ Cetak
                </button>
            </div>

            {/* ============================================ */}
            {/* MAIN DOCUMENT - CONTENT EDITABLE */}
            {/* ============================================ */}

            <div
                contentEditable={true}
                suppressContentEditableWarning={true}
                className="bg-white mx-auto max-w-4xl shadow-lg print:shadow-none focus:outline-none focus:ring-0"
                style={{
                    fontFamily: '"Times New Roman", Times, serif',
                    fontSize: '14pt',
                    lineHeight: '1.8',
                    padding: '60px 80px',
                    outline: 'none',  // Buang outline biru
                }}
            >
                {/* HEADER */}
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

                {/* PARTIES */}
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

                {/* PERTUDUHAN TITLE */}
                <div className="text-center my-10 border-b-2 border-black pb-4">
                    <h2 className="text-xl font-bold uppercase tracking-[0.2em]">
                        PERTUDUHAN
                    </h2>
                </div>

                {/* CHARGE BODY - CONDITIONAL */}
                <div style={{ textAlign: 'justify' }}>

                    {/* AKTA 4 */}
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

                    {/* AKTA 800 */}
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

                {/* BUTIRAN HUKUMAN */}
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

                {/* SECTION BOXES */}
                <div className="grid grid-cols-2 gap-6 my-10">
                    <div className="border-2 border-black p-5 text-center">
                        <p className="text-sm font-bold uppercase mb-2 text-gray-600">
                            Seksyen Pertuduhan
                        </p>
                        <p className="text-3xl font-bold">{caseData.section_charged}</p>
                        <p className="text-xs mt-3 text-gray-500">{actFullName}</p>
                    </div>
                    <div className="border-2 border-black p-5 text-center">
                        <p className="text-sm font-bold uppercase mb-2 text-gray-600">
                            Seksyen Hukuman
                        </p>
                        <p className="text-3xl font-bold">{caseData.section_penalty}</p>
                        <p className="text-xs mt-3 text-gray-500">{actFullName}</p>
                    </div>
                </div>

                {/* FOOTER */}
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
            </div>

            {/* ============================================ */}
            {/* GLOBAL STYLES */}
            {/* ============================================ */}

            <style jsx global>{`
        /* Remove blue outline when contentEditable is focused */
        [contenteditable]:focus {
          outline: none !important;
          box-shadow: none !important;
        }
        
        [contenteditable] {
          outline: none !important;
          -webkit-user-modify: read-write;
        }
        
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          
          [contenteditable] {
            box-shadow: none !important;
          }
        }
      `}</style>
        </div>
    );
}
