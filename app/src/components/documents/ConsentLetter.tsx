// ============================================
// src/components/documents/ConsentLetter.tsx
// Izin Dakwa (Consent to Prosecute)
// S.95(1) Akta 4 / S.76 Akta 800
// ============================================

'use client';

import React from 'react';

interface Employer {
    company_name: string;
    ssm_number?: string | null;
}

interface CaseData {
    act_type: string;
    section_charged: string;
    case_number?: string;
}

interface Props {
    employer: Employer;
    caseData: CaseData;
}

export default function ConsentLetter({ employer, caseData }: Props) {
    const isAkta4 = caseData.act_type === 'akta_4' || caseData.act_type === 'Akta 4';

    const actName = isAkta4
        ? 'AKTA KESELAMATAN SOSIAL PEKERJA 1969 [AKTA 4]'
        : 'AKTA SISTEM INSURANS PEKERJAAN 2017 [AKTA 800]';

    const sectionConsent = isAkta4 ? 'Seksyen 95(1)' : 'Seksyen 76';

    const handlePrint = () => window.print();

    return (
        <div>
            {/* Banner - Hidden on Print */}
            <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-6 flex items-center gap-3 print:hidden">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                    <p className="font-medium text-red-800">
                        DOKUMEN KRITIKAL - Wajib ditandatangani TPR sebelum daftar mahkamah
                    </p>
                    <p className="text-sm text-red-600">
                        Tanpa Izin Dakwa, kes tidak sah dan boleh dibatalkan serta-merta
                    </p>
                </div>
                <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
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
                {/* Header */}
                <div className="mb-10 font-bold">
                    <p>KEPADA:</p>
                    <p>YANG ARIF MAJISTRET</p>
                    <p>MAHKAMAH MAJISTRET</p>
                    <p className="uppercase">_______________________________</p>
                </div>

                {/* Title */}
                <div className="text-center font-bold mb-10">
                    <p className="text-lg underline">IZIN MENDAKWA</p>
                    <p className="text-sm font-normal mt-2">
                        (Di Bawah {sectionConsent}, {actName})
                    </p>
                </div>

                {/* Body */}
                <div className="space-y-6" style={{ textAlign: 'justify' }}>
                    <p style={{ textIndent: '3rem' }}>
                        SAYA, <strong>TIMBALAN PENDAKWA RAYA</strong>, menurut kuasa yang diberikan
                        kepada saya di bawah <strong>Seksyen 376 Kanun Tatacara Jenayah</strong>,
                        dengan ini memberi keizinan kepada Pegawai Pendakwa Pertubuhan Keselamatan
                        Sosial (PERKESO) untuk memulakan pendakwaan terhadap:
                    </p>

                    <div className="ml-8 border-l-4 border-gray-400 pl-6 py-2 bg-gray-50">
                        <p><span className="font-bold inline-block w-40">Nama OKS:</span> {employer.company_name}</p>
                        <p><span className="font-bold inline-block w-40">No. Pendaftaran:</span> {employer.ssm_number || '________________'}</p>
                    </div>

                    <p style={{ textIndent: '3rem' }}>
                        Bagi kesalahan di bawah <strong>{caseData.section_charged}</strong>, {actName}.
                    </p>

                    <p style={{ textIndent: '3rem' }}>
                        Izin ini diberikan tertakluk kepada peruntukan undang-undang yang berkuat kuasa.
                    </p>
                </div>

                {/* Signature */}
                <div className="mt-20">
                    <p>Bertarikh pada: ________________________________</p>
                    <br /><br /><br /><br />
                    <div className="w-72">
                        <div className="border-t-2 border-black pt-2">
                            <p className="font-bold text-center">
                                ............................................................
                            </p>
                            <p className="font-bold text-center">(TIMBALAN PENDAKWA RAYA)</p>
                            <p className="text-center text-sm">Jabatan Peguam Negara Malaysia</p>
                        </div>
                    </div>
                </div>

                {/* Case Reference */}
                {caseData.case_number && (
                    <div className="mt-16 text-sm text-gray-600">
                        <p>Rujukan Kes: {caseData.case_number}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
