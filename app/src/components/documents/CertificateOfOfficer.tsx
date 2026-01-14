// ============================================
// src/components/documents/CertificateOfOfficer.tsx
// Perakuan Pegawai Berkuasa (Prima Facie Evidence)
// S.94C Akta 4 / S.75 Akta 800
// ============================================

'use client';

import React from 'react';

interface Employer {
    company_name: string;
    ssm_number?: string | null;
    address?: string | null;
}

interface CaseData {
    act_type: string;
    case_number?: string;
    arrears_amount?: number;
    arrears_period_start?: string;
    arrears_period_end?: string;
}

interface Props {
    employer: Employer;
    caseData: CaseData;
}

function formatDate(dateString?: string): string {
    if (!dateString) return '________________';
    return new Date(dateString).toLocaleDateString('ms-MY', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function formatCurrency(amount?: number): string {
    if (!amount) return '________________';
    return new Intl.NumberFormat('ms-MY', {
        style: 'currency',
        currency: 'MYR',
    }).format(amount);
}

export default function CertificateOfOfficer({ employer, caseData }: Props) {
    const isAkta4 = caseData.act_type === 'akta_4' || caseData.act_type === 'Akta 4';

    const sectionRef = isAkta4 ? 'Seksyen 94C' : 'Seksyen 75(1)';
    const actName = isAkta4
        ? 'Akta Keselamatan Sosial Pekerja 1969 [Akta 4]'
        : 'Akta Sistem Insurans Pekerjaan 2017 [Akta 800]';

    const handlePrint = () => window.print();

    return (
        <div>
            {/* Banner */}
            <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 mb-6 flex items-center gap-3 print:hidden">
                <span className="text-2xl">📋</span>
                <div className="flex-1">
                    <p className="font-medium text-blue-800">
                        Perakuan Pegawai - Bukti Prima Facie
                    </p>
                    <p className="text-sm text-blue-600">
                        Untuk kes tunggakan caruman - diterima sebagai bukti kecuali dibuktikan sebaliknya
                    </p>
                </div>
                <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
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
                {/* Court Header */}
                <div className="text-center font-bold mb-8 uppercase">
                    <p>DALAM MAHKAMAH MAJISTRET DI _______________________</p>
                    <p className="mt-4">KES SAMAN NO: {caseData.case_number || '_______________________'}</p>
                </div>

                {/* Title */}
                <div className="text-center font-bold mb-10">
                    <p className="text-lg underline">PERAKUAN JUMLAH CARUMAN TERTUNGGAK</p>
                    <p className="text-sm font-normal mt-2">
                        (Di Bawah {sectionRef}, {actName})
                    </p>
                </div>

                {/* Body */}
                <div className="space-y-6" style={{ textAlign: 'justify' }}>
                    <p style={{ textIndent: '3rem' }}>
                        SAYA, <strong>______________________________________</strong>,
                        No. Kad Pengenalan <strong>______________________________</strong>,
                        dengan ini memperakui bahawa saya adalah seorang Pegawai yang diberi kuasa
                        secara sah di bawah {actName}.
                    </p>

                    <p className="font-bold mt-8">SAYA DENGAN INI MEMPERAKUI BAHAWA:</p>

                    <ol className="list-decimal ml-10 space-y-6">
                        <li>
                            Saya telah menyemak rekod caruman bagi majikan yang bernama{' '}
                            <strong>{employer.company_name}</strong>{' '}
                            (No. Pendaftaran SSM: <strong>{employer.ssm_number || '________________'}</strong>)
                            yang beralamat di <strong>{employer.address || '________________________________'}</strong>.
                        </li>
                        <li>
                            Berdasarkan rekod rasmi Pertubuhan Keselamatan Sosial, majikan tersebut
                            mempunyai tunggakan caruman yang belum dijelaskan seperti berikut:

                            <div className="mt-4 p-6 border-2 border-black">
                                <table className="w-full">
                                    <tbody>
                                        <tr>
                                            <td className="font-bold w-40 py-2">TEMPOH:</td>
                                            <td>
                                                {formatDate(caseData.arrears_period_start)} hingga{' '}
                                                {formatDate(caseData.arrears_period_end)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-bold w-40 py-2">JUMLAH:</td>
                                            <td className="font-bold text-lg">
                                                {formatCurrency(caseData.arrears_amount)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </li>
                        <li>
                            Perakuan ini dikeluarkan sebagai keterangan <em className="font-bold">prima facie</em> bagi
                            amaun yang kena dibayar oleh majikan tersebut menurut peruntukan {sectionRef}, {actName}.
                        </li>
                        <li>
                            Salinan catatan dalam akaun Pertubuhan yang disahkan dengan sempurna oleh
                            saya hendaklah menjadi keterangan <em className="font-bold">prima facie</em> tentang kandungannya.
                        </li>
                    </ol>
                </div>

                {/* Signature */}
                <div className="mt-20">
                    <p>Bertarikh pada: ________________________________</p>
                    <br /><br /><br /><br />
                    <div className="w-80">
                        <div className="border-t-2 border-black pt-2">
                            <p className="font-bold text-center">
                                ............................................................
                            </p>
                            <p className="font-bold text-center">(TANDATANGAN PEGAWAI)</p>
                            <p className="text-center text-sm">Pertubuhan Keselamatan Sosial (PERKESO)</p>
                            <p className="text-center text-sm mt-2">Cop Rasmi:</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
