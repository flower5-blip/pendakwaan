// ============================================
// src/components/documents/ChargeSheet.tsx
// Komponen Kertas Pertuduhan (Charge Sheet)
// Format Dokumen Undang-undang Rasmi
// ============================================

'use client';

import React from 'react';

// ============================================
// Types
// ============================================

type ActType = 'Akta 4' | 'Akta 800';

interface ChargeSheetProps {
    // Maklumat Kes
    caseNumber: string;
    dateOfOffense: string;
    timeOfOffense?: string;
    locationOfOffense: string;
    districtOfOffense: string;
    stateOfOffense: string;

    // Maklumat Majikan / OKT
    companyName: string;
    ownerName?: string;
    ownerIc?: string;

    // Maklumat Kesalahan
    actType: ActType;
    offenseType: string;
    sectionCharged: string;
    sectionPenalty: string;

    // Maklumat Mahkamah
    courtDistrict: string;
    courtState: string;

    // Senarai Pekerja (untuk kesalahan gagal daftar pekerja)
    employees?: {
        name: string;
        icNumber: string;
    }[];
}

// ============================================
// Legal Text Templates
// ============================================

const LEGAL_TEXT = {
    'Akta 4': {
        actFullName: 'Akta Keselamatan Sosial Pekerja 1969 [Akta 4]',
        sections: {
            'gagal_daftar_perusahaan': {
                chargeSection: 'Seksyen 4',
                penaltySection: 'Seksyen 94(g)',
                chargeText: (vars: any) => `
          Bahawa kamu, ${vars.companyName}, pada ${vars.dateOfOffense} lebih kurang jam ${vars.timeOfOffense} 
          di ${vars.locationOfOffense} dalam daerah ${vars.districtOfOffense}, dalam negeri ${vars.stateOfOffense}, 
          sebagai seorang majikan yang menjalankan perusahaan yang dinyatakan dalam Jadual Pertama Akta ini, 
          telah gagal untuk mendaftarkan perusahaan tersebut dengan Pertubuhan Keselamatan Sosial dalam 
          tempoh yang ditetapkan.
        `,
                punishmentText: `
          Oleh yang demikian, kamu telah melakukan suatu kesalahan di bawah Seksyen 4 Akta Keselamatan 
          Sosial Pekerja 1969 dan boleh dihukum di bawah Seksyen 94(g) Akta yang sama.
        `,
            },
            'gagal_daftar_pekerja': {
                chargeSection: 'Seksyen 5',
                penaltySection: 'Seksyen 94(g)',
                chargeText: (vars: any) => `
          Bahawa kamu, ${vars.companyName}, pada ${vars.dateOfOffense} lebih kurang jam ${vars.timeOfOffense} 
          di ${vars.locationOfOffense} dalam daerah ${vars.districtOfOffense}, dalam negeri ${vars.stateOfOffense}, 
          sebagai seorang majikan utama, telah gagal untuk mendaftarkan pekerja-pekerja berikut dengan 
          Pertubuhan Keselamatan Sosial dalam tempoh yang ditetapkan, iaitu dalam masa 30 hari dari 
          tarikh pekerja-pekerja tersebut mula diambil bekerja.
        `,
                punishmentText: `
          Oleh yang demikian, kamu telah melakukan suatu kesalahan di bawah Seksyen 5 Akta Keselamatan 
          Sosial Pekerja 1969 dan boleh dihukum di bawah Seksyen 94(g) Akta yang sama.
        `,
            },
            'gagal_bayar_caruman': {
                chargeSection: 'Seksyen 6',
                penaltySection: 'Seksyen 94(a)',
                chargeText: (vars: any) => `
          Bahawa kamu, ${vars.companyName}, pada ${vars.dateOfOffense} lebih kurang jam ${vars.timeOfOffense} 
          di ${vars.locationOfOffense} dalam daerah ${vars.districtOfOffense}, dalam negeri ${vars.stateOfOffense}, 
          sebagai seorang majikan utama, telah gagal untuk membayar caruman dalam tempoh yang ditetapkan 
          mengikut Akta ini.
        `,
                punishmentText: `
          Oleh yang demikian, kamu telah melakukan suatu kesalahan di bawah Seksyen 6 Akta Keselamatan 
          Sosial Pekerja 1969 dan boleh dihukum di bawah Seksyen 94(a) Akta yang sama.
        `,
            },
        },
        penaltyDescription: `
      BUTIRAN HUKUMAN: Jika disabitkan kesalahan, boleh didenda tidak melebihi Ringgit Malaysia 
      Sepuluh Ribu (RM10,000.00) atau dipenjarakan selama tempoh tidak melebihi Dua (2) tahun 
      atau kedua-duanya sekali.
    `,
    },

    'Akta 800': {
        actFullName: 'Akta Sistem Insurans Pekerjaan 2017 [Akta 800]',
        sections: {
            'gagal_daftar_perusahaan': {
                chargeSection: 'Seksyen 14(1)',
                penaltySection: 'Seksyen 14(2)',
                chargeText: (vars: any) => `
          Bahawa kamu, ${vars.companyName}, pada ${vars.dateOfOffense} lebih kurang jam ${vars.timeOfOffense} 
          di ${vars.locationOfOffense} dalam daerah ${vars.districtOfOffense}, dalam negeri ${vars.stateOfOffense}, 
          sebagai seorang majikan, telah gagal untuk mendaftarkan perusahaan tersebut dengan Sistem 
          Insurans Pekerjaan dalam tempoh yang ditetapkan.
        `,
                punishmentText: `
          Oleh yang demikian, kamu telah melakukan suatu kesalahan di bawah Seksyen 14(1) Akta 
          Sistem Insurans Pekerjaan 2017 dan boleh dihukum di bawah Seksyen 14(2) Akta yang sama.
        `,
            },
            'gagal_daftar_pekerja': {
                chargeSection: 'Seksyen 16(1)',
                penaltySection: 'Seksyen 16(5)',
                chargeText: (vars: any) => `
          Bahawa kamu, ${vars.companyName}, pada ${vars.dateOfOffense} lebih kurang jam ${vars.timeOfOffense} 
          di ${vars.locationOfOffense} dalam daerah ${vars.districtOfOffense}, dalam negeri ${vars.stateOfOffense}, 
          sebagai seorang majikan, telah gagal untuk mendaftarkan pekerja-pekerja berikut dengan 
          Sistem Insurans Pekerjaan dalam tempoh yang ditetapkan, iaitu dalam masa 30 hari dari 
          tarikh pekerja-pekerja tersebut mula diambil bekerja.
        `,
                punishmentText: `
          Oleh yang demikian, kamu telah melakukan suatu kesalahan di bawah Seksyen 16(1) Akta 
          Sistem Insurans Pekerjaan 2017 dan boleh dihukum di bawah Seksyen 16(5) Akta yang sama.
        `,
            },
            'gagal_bayar_caruman': {
                chargeSection: 'Seksyen 18(1)',
                penaltySection: 'Seksyen 18(4)',
                chargeText: (vars: any) => `
          Bahawa kamu, ${vars.companyName}, pada ${vars.dateOfOffense} lebih kurang jam ${vars.timeOfOffense} 
          di ${vars.locationOfOffense} dalam daerah ${vars.districtOfOffense}, dalam negeri ${vars.stateOfOffense}, 
          sebagai seorang majikan, telah gagal untuk membayar caruman dalam tempoh yang ditetapkan 
          mengikut Akta ini.
        `,
                punishmentText: `
          Oleh yang demikian, kamu telah melakukan suatu kesalahan di bawah Seksyen 18(1) Akta 
          Sistem Insurans Pekerjaan 2017 dan boleh dihukum di bawah Seksyen 18(4) Akta yang sama.
        `,
            },
        },
        penaltyDescription: `
      BUTIRAN HUKUMAN: Jika disabitkan kesalahan, boleh didenda tidak melebihi Ringgit Malaysia 
      Sepuluh Ribu (RM10,000.00) atau dipenjarakan selama tempoh tidak melebihi Dua (2) tahun 
      atau kedua-duanya sekali.
    `,
    },
};

// ============================================
// Helper: Get Offense Key
// ============================================

function getOffenseKey(offenseType: string): string {
    const mapping: Record<string, string> = {
        'Gagal Daftar Perusahaan': 'gagal_daftar_perusahaan',
        'Gagal Daftar Pekerja': 'gagal_daftar_pekerja',
        'Gagal Bayar Caruman': 'gagal_bayar_caruman',
        'Gagal Daftar SIP': 'gagal_daftar_perusahaan',
    };
    return mapping[offenseType] || 'gagal_daftar_perusahaan';
}

// ============================================
// ChargeSheet Component
// ============================================

export default function ChargeSheet({
    caseNumber,
    dateOfOffense,
    timeOfOffense = '10.00 pagi',
    locationOfOffense,
    districtOfOffense,
    stateOfOffense,
    companyName,
    ownerName,
    ownerIc,
    actType,
    offenseType,
    sectionCharged,
    sectionPenalty,
    courtDistrict,
    courtState,
    employees = [],
}: ChargeSheetProps) {

    // ============================================
    // Conditional Rendering: Act 4 vs Act 800
    // ============================================

    const legalConfig = LEGAL_TEXT[actType];
    const offenseKey = getOffenseKey(offenseType);
    const sectionConfig = legalConfig.sections[offenseKey as keyof typeof legalConfig.sections];

    const templateVars = {
        companyName,
        dateOfOffense,
        timeOfOffense,
        locationOfOffense,
        districtOfOffense,
        stateOfOffense,
    };

    // ============================================
    // Render
    // ============================================

    return (
        <div
            className="charge-sheet-document bg-white p-12 max-w-4xl mx-auto shadow-lg"
            style={{
                fontFamily: '"Times New Roman", Times, serif',
                fontSize: '14pt',
                lineHeight: '1.8',
            }}
        >
            {/* Document Header */}
            <div className="text-center mb-8">
                <p className="text-sm tracking-widest mb-4">SULIT</p>
                <h1 className="text-lg font-bold uppercase tracking-wide mb-2">
                    DALAM MAHKAMAH MAJISTRET DI {courtDistrict.toUpperCase()}
                </h1>
                <h2 className="text-base font-bold uppercase">
                    DALAM NEGERI {courtState.toUpperCase()}, MALAYSIA
                </h2>
                <p className="mt-4 font-bold">KES SAMAN NO: {caseNumber}</p>
            </div>

            {/* Parties */}
            <div className="text-center my-8">
                <p className="font-bold text-lg">PENDAKWA RAYA</p>
                <p className="my-4 text-2xl font-bold">LAWAN</p>
                <p className="font-bold text-lg uppercase">{companyName}</p>
                {ownerName && (
                    <p className="text-sm mt-1">
                        ({ownerName} {ownerIc && `- ${ownerIc}`})
                    </p>
                )}
            </div>

            {/* Charge Title */}
            <div className="text-center my-8 border-b-2 border-black pb-4">
                <h2 className="text-xl font-bold uppercase tracking-widest">PERTUDUHAN</h2>
            </div>

            {/* Charge Body - Conditional Based on Act Type */}
            <div
                className="my-8"
                style={{ textAlign: 'justify' }}
            >
                {/* Main Charge Text */}
                <p className="mb-6 indent-8">
                    {sectionConfig?.chargeText(templateVars)}
                </p>

                {/* Employee List (if applicable) */}
                {employees.length > 0 && offenseKey === 'gagal_daftar_pekerja' && (
                    <div className="my-6 pl-8">
                        <p className="font-bold mb-2">Senarai Pekerja:</p>
                        <ol className="list-decimal pl-8">
                            {employees.map((emp, index) => (
                                <li key={index} className="mb-1">
                                    <span className="font-semibold">{emp.name}</span>
                                    {emp.icNumber && (
                                        <span className="ml-2">(No. KP: {emp.icNumber})</span>
                                    )}
                                </li>
                            ))}
                        </ol>
                    </div>
                )}

                {/* Punishment Section */}
                <p className="mb-6 indent-8">
                    {sectionConfig?.punishmentText}
                </p>
            </div>

            {/* Penalty Box */}
            <div
                className="my-8 p-6 border-2 border-black"
                style={{ textAlign: 'justify' }}
            >
                <p className="font-bold uppercase mb-2">BUTIRAN HUKUMAN:</p>
                <p>
                    Jika disabitkan kesalahan, boleh didenda tidak melebihi <strong>Ringgit Malaysia
                        Sepuluh Ribu (RM10,000.00)</strong> atau dipenjarakan selama tempoh tidak melebihi
                    <strong> Dua (2) tahun</strong> atau kedua-duanya sekali.
                </p>
            </div>

            {/* Section Reference Box */}
            <div className="my-8 grid grid-cols-2 gap-4">
                <div className="border-2 border-black p-4 text-center">
                    <p className="text-sm font-bold mb-2">SEKSYEN PERTUDUHAN</p>
                    <p className="text-2xl font-bold">{sectionCharged || sectionConfig?.chargeSection}</p>
                    <p className="text-xs mt-2">{legalConfig.actFullName}</p>
                </div>
                <div className="border-2 border-black p-4 text-center">
                    <p className="text-sm font-bold mb-2">SEKSYEN HUKUMAN</p>
                    <p className="text-2xl font-bold">{sectionPenalty || sectionConfig?.penaltySection}</p>
                    <p className="text-xs mt-2">{legalConfig.actFullName}</p>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-12 text-center">
                <p className="text-sm text-gray-600">
                    Dokumen ini dijana oleh Sistem Pendakwaan PERKESO
                </p>
                <p className="text-xs text-gray-500 mt-2">
                    {new Date().toLocaleDateString('ms-MY', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </p>
            </div>

            {/* Print Styles */}
            <style jsx>{`
        @media print {
          .charge-sheet-document {
            box-shadow: none;
            padding: 2cm;
          }
        }
        
        .indent-8 {
          text-indent: 2rem;
        }
      `}</style>
        </div>
    );
}

// ============================================
// Usage Example:
// ============================================
/*
<ChargeSheet
  caseNumber="KES/2026/00123"
  dateOfOffense="15 Januari 2026"
  timeOfOffense="10.00 pagi"
  locationOfOffense="No. 123, Jalan Industri, Taman Perindustrian Puchong"
  districtOfOffense="Petaling"
  stateOfOffense="Selangor"
  companyName="Syarikat Jaya Makmur Sdn Bhd"
  ownerName="Tan Ah Kow"
  ownerIc="680415-10-5432"
  actType="Akta 4"    // or "Akta 800"
  offenseType="Gagal Daftar Pekerja"
  sectionCharged="Seksyen 5"
  sectionPenalty="Seksyen 94(g)"
  courtDistrict="Petaling Jaya"
  courtState="Selangor"
  employees={[
    { name: "Nurul Izzati Binti Ahmad", icNumber: "950312-14-5432" },
    { name: "Muhammad Hafiz Bin Ismail", icNumber: "980715-08-7654" },
  ]}
/>
*/
