// ============================================
// src/components/documents/CourtSummons.tsx
// Saman Mahkamah (Borang 34)
// ============================================

'use client';

import React from 'react';

interface Employer {
    company_name: string;
    ssm_number?: string | null;
    address?: string | null;
    owner_name?: string | null;
    owner_ic?: string | null;
    state?: string | null;
}

interface CaseData {
    case_number?: string;
    act_type: string;
    section_charged: string;
    offense_type?: string;
}

interface Props {
    employer: Employer;
    caseData: CaseData;
}

export default function CourtSummons({ employer, caseData }: Props) {
    const isAkta4 = caseData.act_type === 'akta_4' || caseData.act_type === 'Akta 4';

    const actName = isAkta4
        ? 'Akta Keselamatan Sosial Pekerja 1969 [Akta 4]'
        : 'Akta Sistem Insurans Pekerjaan 2017 [Akta 800]';

    const state = employer.state || 'SELANGOR';

    const handlePrint = () => window.print();

    return (
        <div>
            {/* Banner */}
            <div className="bg-purple-50 border border-purple-300 rounded-lg p-4 mb-6 flex items-center gap-3 print:hidden">
                <span className="text-2xl">📨</span>
                <div className="flex-1">
                    <p className="font-medium text-purple-800">
                        Saman Mahkamah (Borang 34)
                    </p>
                    <p className="text-sm text-purple-600">
                        Dokumen untuk memanggil OKS hadir ke mahkamah
                    </p>
                </div>
                <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
                >
                    🖨️ Cetak
                </button>
            </div>

            {/* Document */}
            <div
                contentEditable={true}
                suppressContentEditableWarning={true}
                className="bg-white mx-auto max-w-4xl shadow-lg print:shadow-none focus:outline-none"
                style={{
                    fontFamily: '"Times New Roman", Times, serif',
                    fontSize: '14pt',
                    lineHeight: '2',
                    padding: '60px 80px',
                    minHeight: '29.7cm',
                }}
            >
                {/* Form Reference */}
                <div className="text-right font-bold text-sm mb-4">
                    BORANG 34
                    <br />
                    <span className="font-normal">(Seksyen 34 Kanun Tatacara Jenayah)</span>
                </div>

                {/* Court Header */}
                <div className="text-center font-bold mb-8 uppercase">
                    <p>DALAM MAHKAMAH MAJISTRET DI {state.toUpperCase()}</p>
                    <p>DALAM NEGERI {state.toUpperCase()}, MALAYSIA</p>
                    <p className="mt-4">KES SAMAN NO: {caseData.case_number || '_______________________'}</p>
                </div>

                {/* Parties */}
                <div className="my-10">
                    <div className="flex justify-between items-center">
                        <span className="font-bold">PENDAKWA RAYA</span>
                        <span className="text-sm">...Pendakwa</span>
                    </div>
                    <div className="text-center my-4 font-bold text-2xl">LAWAN</div>
                    <div className="flex justify-between items-center">
                        <span className="font-bold uppercase">{employer.company_name}</span>
                        <span className="text-sm">...Orang Kena Saman</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                        (No. SSM: {employer.ssm_number || '________________'})
                    </div>
                </div>

                {/* Title */}
                <div className="text-center font-bold text-xl mb-8 py-3 border-y-2 border-black">
                    SAMAN UNTUK HADIR
                </div>

                {/* Body */}
                <div className="space-y-6" style={{ textAlign: 'justify' }}>
                    <div className="bg-gray-50 p-4 border-l-4 border-gray-400">
                        <p><strong>KEPADA:</strong> {employer.company_name}</p>
                        {employer.owner_name && (
                            <p className="ml-16">({employer.owner_name} - {employer.owner_ic})</p>
                        )}
                        <p><strong>DI ALAMAT:</strong> {employer.address || '________________________________________________'}</p>
                    </div>

                    <p style={{ textIndent: '3rem' }}>
                        BAHAWASANYA kehadiran kamu adalah dikehendaki untuk menjawab satu pertuduhan
                        di bawah <strong>{caseData.section_charged}</strong>, {actName}, iaitu kerana:
                    </p>

                    <div className="bg-gray-100 p-6 text-center italic border-2 border-gray-300 my-6">
                        <p className="font-bold">"{caseData.offense_type || 'Gagal mematuhi peruntukan Akta berkenaan'}"</p>
                    </div>

                    <p style={{ textIndent: '3rem' }}>
                        OLEH ITU, kamu dengan ini dikehendaki hadir sendiri atau melalui peguam bela
                        di Mahkamah Majistret di <strong>________________________</strong> pada:
                    </p>

                    <div className="grid grid-cols-2 gap-6 ml-10 my-8 p-6 border-2 border-black">
                        <div>
                            <p className="font-bold">TARIKH:</p>
                            <p className="text-lg">________________________</p>
                        </div>
                        <div>
                            <p className="font-bold">MASA:</p>
                            <p className="text-lg">9.00 PAGI</p>
                        </div>
                    </div>

                    <div className="bg-red-50 border-2 border-red-600 p-4 text-center mt-8">
                        <p className="font-bold text-red-700 text-lg">
                            ⚠️ AMARAN
                        </p>
                        <p className="text-red-700 mt-2">
                            JIKA KAMU GAGAL HADIR PADA TARIKH DAN MASA YANG DINYATAKAN DI ATAS
                            TANPA ALASAN YANG MUNASABAH, SATU WARAN TANGKAP BOLEH DIKELUARKAN
                            TERHADAP KAMU.
                        </p>
                    </div>
                </div>

                {/* Footer - Signature */}
                <div className="mt-20 flex justify-end">
                    <div className="text-center w-72">
                        <p>Bertarikh: ________________________</p>
                        <br /><br /><br /><br />
                        <div className="border-t-2 border-black pt-2">
                            <p className="font-bold">............................................</p>
                            <p className="font-bold">MAJISTRET</p>
                        </div>
                    </div>
                </div>

                {/* Proof of Service Section */}
                <div className="mt-16 pt-8 border-t-2 border-dashed border-gray-400">
                    <p className="font-bold text-center underline mb-4">BUKTI PENYERAHAN</p>
                    <p className="text-sm">
                        Saman ini telah diserahkan kepada OKS pada _______________________
                        oleh ______________________________________.
                    </p>
                    <div className="mt-8 flex justify-end">
                        <div className="text-center w-48">
                            <div className="border-t border-black pt-1">
                                <p className="text-sm">Tandatangan Penyerah</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
