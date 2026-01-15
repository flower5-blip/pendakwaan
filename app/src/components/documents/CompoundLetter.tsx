// ============================================
// PERKESO Prosecution System
// Compound Offer Letter Component
// ============================================

'use client';

import React from 'react';
import { formatCompoundAmount } from '@/lib/compound';

// ============================================
// TYPES
// ============================================

interface Employer {
    company_name: string;
    ssm_number?: string | null;
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
    date_of_offense: string;
    section_charged: string;
    section_penalty: string;
    section_compound?: string | null;
}

interface CompoundOffer {
    offer_number: string;
    offer_date: string;
    due_date: string;
    amount: number;
}

interface CompoundLetterProps {
    employer: Employer;
    caseData: CaseData;
    offer: CompoundOffer;
}

// ============================================
// HELPER: Format Date
// ============================================

function formatDate(dateString: string): string {
    if (!dateString) return '..................';
    return new Date(dateString).toLocaleDateString('ms-MY', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

// ============================================
// COMPONENT
// ============================================

export default function CompoundLetter({
    employer,
    caseData,
    offer,
}: CompoundLetterProps) {
    return (
        <div className="max-w-4xl mx-auto bg-white p-8 print:p-12 space-y-6 print:space-y-8">
            {/* Header */}
            <div className="text-center space-y-2 border-b-2 border-gray-800 pb-4">
                <h1 className="text-2xl font-bold uppercase">PERKESO</h1>
                <p className="text-sm font-medium">
                    PERBADANAN KESELAMATAN SOSIAL
                </p>
                <p className="text-xs">MALAYSIA</p>
            </div>

            {/* Reference */}
            <div className="text-right space-y-1 text-sm">
                <p>
                    <strong>Rujukan:</strong> {offer.offer_number}
                </p>
                <p>
                    <strong>Tarikh:</strong> {formatDate(offer.offer_date)}
                </p>
            </div>

            {/* Recipient */}
            <div className="space-y-1">
                <p className="font-semibold">Kepada:</p>
                <p>{employer.company_name}</p>
                {employer.ssm_number && <p>No. SSM: {employer.ssm_number}</p>}
                {employer.address && <p>{employer.address}</p>}
                {employer.phone && <p>Tel: {employer.phone}</p>}
            </div>

            {/* Subject */}
            <div className="space-y-1">
                <p className="font-semibold">Perkara: TAWARAN KOMPAUN</p>
                <p className="font-semibold">Kes: {caseData.case_number}</p>
            </div>

            {/* Body */}
            <div className="space-y-4 text-justify leading-relaxed">
                <p>
                    Dengan hormatnya, perkara di atas adalah dirujuk.
                </p>

                <p>
                    Berdasarkan siasatan yang telah dijalankan, pihak PERKESO telah mendapati bahawa syarikat tuan/puan telah melakukan kesalahan di bawah{' '}
                    <strong>{caseData.section_charged}</strong> kerana{' '}
                    <strong>{caseData.offense_type}</strong> pada{' '}
                    <strong>{formatDate(caseData.date_of_offense)}</strong>.
                </p>

                <p>
                    Mengikut <strong>{caseData.section_penalty}</strong>, kesalahan ini boleh dikenakan denda maksimum. Walau bagaimanapun, pihak PERKESO menawarkan untuk menyelesaikan kesalahan ini melalui kompaun.
                </p>

                {caseData.section_compound && (
                    <p>
                        Mengikut <strong>{caseData.section_compound}</strong>, pihak PERKESO menawarkan kompaun sebanyak{' '}
                        <strong>{formatCompoundAmount(offer.amount)}</strong> untuk menyelesaikan kesalahan ini.
                    </p>
                )}

                <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                    <p className="font-bold text-center text-lg mb-2">
                        JUMLAH KOMPAUN: {formatCompoundAmount(offer.amount)}
                    </p>
                    <p className="text-center text-sm">
                        Tarikh Luput: <strong>{formatDate(offer.due_date)}</strong>
                    </p>
                </div>

                <p>
                    <strong>Syarat-syarat Tawaran Kompaun:</strong>
                </p>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>
                        Bayaran kompaun hendaklah dibuat dalam tempoh <strong>14 hari</strong> dari tarikh tawaran ini.
                    </li>
                    <li>
                        Bayaran boleh dibuat melalui:
                        <ul className="list-disc list-inside ml-6 mt-1">
                            <li>Bank transfer ke akaun PERKESO</li>
                            <li>Bank draft atau cek atas nama PERKESO</li>
                            <li>Bayaran tunai di pejabat PERKESO terdekat</li>
                        </ul>
                    </li>
                    <li>
                        Jika bayaran tidak dibuat dalam tempoh yang ditetapkan, tawaran kompaun ini akan dibatalkan dan kes akan diteruskan dengan pendakwaan di mahkamah.
                    </li>
                    <li>
                        Setelah bayaran dibuat, kesalahan ini dianggap telah diselesaikan dan tiada tindakan lanjut akan diambil.
                    </li>
                </ol>

                <p>
                    Sekiranya tuan/puan bersetuju dengan tawaran kompaun ini, sila buat bayaran sebelum tarikh luput yang ditetapkan. Sila kemukakan salinan resit bayaran kepada pejabat PERKESO untuk rekod.
                </p>

                <p>
                    Sekian, terima kasih.
                </p>
            </div>

            {/* Signature */}
            <div className="mt-12 space-y-16">
                <div className="text-center">
                    <p className="mb-16">Yang menjalankan amanah,</p>
                    <div className="border-t-2 border-gray-800 w-48 mx-auto pt-2">
                        <p className="font-semibold">Pegawai Pendakwa</p>
                        <p className="text-sm">PERKESO</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-xs text-center text-gray-600 border-t pt-4 mt-8">
                <p>
                    Nota: Dokumen ini adalah tawaran kompaun rasmi dari PERKESO. Sila simpan dokumen ini untuk rujukan.
                </p>
            </div>
        </div>
    );
}
