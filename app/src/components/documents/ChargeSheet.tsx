// ============================================
// src/components/documents/ChargeSheet.tsx
// Komponen Kertas Pertuduhan - EDITABLE
// ============================================

'use client';

import React from 'react';
import { OFFENSE_MAPPING, getOffenseDetails, ACT_INFO, type ActKey } from '@/lib/laws';

// ============================================
// Types
// ============================================

interface Employer {
    company_name: string;
    ssm_number?: string | null;
    address?: string | null;
    owner_name?: string | null;
    owner_ic?: string | null;
    state?: string | null;
}

interface CaseData {
    case_number: string;
    act_type: string;
    offense_type: string;
    date_of_offense: string;
    time_of_offense?: string | null;
    location_of_offense?: string | null;
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
    if (!dateString) return '..................';
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

    const isAkta4 = caseData.act_type === 'akta_4' || caseData.act_type === 'Akta 4';

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

    const handlePrint = () => window.print();

    return (
        <div>
            {/* Banner Editable - Hidden on Print */}
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-6 flex items-center gap-3 print:hidden">
                <span className="text-2xl">✏️</span>
                <div className="flex-1">
                    <p className="font-medium text-amber-800">
                        Anda boleh klik pada teks di bawah untuk menyunting sebelum mencetak
                    </p>
                    <p className="text-sm text-amber-600">
                        Perubahan hanya untuk cetakan ini
                    </p>
                </div>
                <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition"
                >
                    🖨️ Cetak
                </button>
            </div>

            {/* Main Document - Editable */}
            <div
                contentEditable={true}
                suppressContentEditableWarning={true}
                className="bg-white mx-auto max-w-4xl shadow-lg print:shadow-none focus:outline-none"
                style={{
                    fontFamily: '"Times New Roman", Times, serif',
                    fontSize: '14pt',
                    lineHeight: '1.8',
                    padding: '60px 80px',
                }}
            >
                {/* Header */}
                <div className="text-center mb-10">
                    <p className="text-xs tracking-[0.3em] mb-4 text-gray-500">SULIT</p>
                    <h1 className="text-base font-bold uppercase tracking-wide">
                        DALAM MAHKAMAH MAJISTRET DI {v.NEGERI.toUpperCase()}
                    </h1>
                    <h2 className="text-base font-bold uppercase">
                        DALAM NEGERI {v.NEGERI.toUpperCase()}, MALAYSIA
                    </h2>
                    <p className="mt-6 font-bold text-lg">KES SAMAN NO: {v.NO_KES}</p>
                </div>

                {/* Parties */}
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

                {/* Pertuduhan Title */}
                <div className="text-center my-10 border-b-2 border-black pb-4">
                    <h2 className="text-xl font-bold uppercase tracking-[0.2em]">PERTUDUHAN</h2>
                </div>

                {/* Charge Body - Offense Specific Wording */}
                <div style={{ textAlign: 'justify' }}>
                    {/* AKTA 4 - Gagal Daftar Perusahaan */}
                    {isAkta4 && caseData.offense_type?.toLowerCase().includes('perusahaan') && (
                        <>
                            <p className="mb-6" style={{ textIndent: '3rem' }}>
                                Bahawa kamu, <strong>{v.NAMA_SYARIKAT}</strong> (No. SSM: {v.NO_SSM}),
                                pada <strong>{v.TARIKH_KESALAHAN}</strong> lebih kurang jam <strong>{v.MASA}</strong> di{' '}
                                <strong>{v.LOKASI}</strong> dalam daerah <strong>{v.NEGERI}</strong>, dalam
                                negeri <strong>{v.NEGERI}</strong>, sebagai seorang <strong>majikan utama</strong> yang
                                menjalankan satu perusahaan yang dinyatakan dalam Jadual Pertama Akta ini, telah
                                <strong> gagal untuk mendaftarkan</strong> perusahaan tersebut dengan Pertubuhan
                                Keselamatan Sosial dalam tempoh yang ditetapkan.
                            </p>
                            <p className="mb-6" style={{ textIndent: '3rem' }}>
                                Oleh yang demikian, kamu telah melakukan suatu kesalahan di bawah{' '}
                                <strong>{caseData.section_charged}</strong> dan boleh
                                dihukum di bawah <strong>{caseData.section_penalty}</strong>.
                            </p>
                        </>
                    )}

                    {/* AKTA 4 - Gagal Daftar Pekerja */}
                    {isAkta4 && caseData.offense_type?.toLowerCase().includes('pekerja') && !caseData.offense_type?.toLowerCase().includes('perusahaan') && (
                        <>
                            <p className="mb-6" style={{ textIndent: '3rem' }}>
                                Bahawa kamu, <strong>{v.NAMA_SYARIKAT}</strong> (No. SSM: {v.NO_SSM}),
                                pada <strong>{v.TARIKH_KESALAHAN}</strong> lebih kurang jam <strong>{v.MASA}</strong> di{' '}
                                <strong>{v.LOKASI}</strong> dalam daerah <strong>{v.NEGERI}</strong>, dalam
                                negeri <strong>{v.NEGERI}</strong>, sebagai seorang <strong>majikan utama</strong> yang
                                menjalankan satu perusahaan yang dinyatakan dalam Jadual Pertama Akta ini, telah
                                <strong> gagal untuk menginsuranskan</strong> pekerja-pekerja berikut dengan Pertubuhan
                                Keselamatan Sosial dalam tempoh tiga puluh (30) hari dari tarikh mula bekerja:
                            </p>
                            {employees.length > 0 && (
                                <div className="my-6 pl-12">
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
                                <strong>{caseData.section_charged}</strong> dan boleh
                                dihukum di bawah <strong>{caseData.section_penalty}</strong>.
                            </p>
                        </>
                    )}

                    {/* AKTA 4 - Gagal Bayar Caruman */}
                    {isAkta4 && caseData.offense_type?.toLowerCase().includes('caruman') && (
                        <>
                            <p className="mb-6" style={{ textIndent: '3rem' }}>
                                Bahawa kamu, <strong>{v.NAMA_SYARIKAT}</strong> (No. SSM: {v.NO_SSM}),
                                pada <strong>{v.TARIKH_KESALAHAN}</strong> lebih kurang jam <strong>{v.MASA}</strong> di{' '}
                                <strong>{v.LOKASI}</strong> dalam daerah <strong>{v.NEGERI}</strong>, dalam
                                negeri <strong>{v.NEGERI}</strong>, sebagai seorang <strong>majikan utama</strong> yang
                                menjalankan satu perusahaan yang dinyatakan dalam Jadual Pertama Akta ini, telah
                                <strong> gagal untuk membayar caruman</strong> yang kena dibayar berkenaan dengan
                                pekerja-pekerja yang diinsuranskan dalam tempoh yang ditetapkan.
                            </p>
                            <p className="mb-6" style={{ textIndent: '3rem' }}>
                                Oleh yang demikian, kamu telah melakukan suatu kesalahan di bawah{' '}
                                <strong>{caseData.section_charged}</strong> dan boleh
                                dihukum di bawah <strong>{caseData.section_penalty}</strong>.
                            </p>
                        </>
                    )}

                    {/* AKTA 4 - Gagal Hadir Saman */}
                    {isAkta4 && caseData.offense_type?.toLowerCase().includes('saman') && (
                        <>
                            <p className="mb-6" style={{ textIndent: '3rem' }}>
                                Bahawa kamu, <strong>{v.NAMA_SYARIKAT}</strong> (No. SSM: {v.NO_SSM}),
                                pada <strong>{v.TARIKH_KESALAHAN}</strong> lebih kurang jam <strong>{v.MASA}</strong> di{' '}
                                <strong>{v.LOKASI}</strong> dalam daerah <strong>{v.NEGERI}</strong>, dalam
                                negeri <strong>{v.NEGERI}</strong>, setelah dikehendaki hadir secara peribadi di hadapan
                                Pegawai Penyiasat sebagaimana yang dikehendaki di bawah <strong>Seksyen 12C</strong> Akta ini,
                                telah <strong> gagal untuk hadir</strong> tanpa alasan yang munasabah.
                            </p>
                            <p className="mb-6" style={{ textIndent: '3rem' }}>
                                Oleh yang demikian, kamu telah melakukan suatu kesalahan di bawah{' '}
                                <strong>{caseData.section_charged}</strong> dan boleh
                                dihukum di bawah <strong>{caseData.section_penalty}</strong>.
                            </p>
                        </>
                    )}

                    {/* AKTA 800 - Gagal Daftar Majikan/Perusahaan */}
                    {!isAkta4 && (caseData.offense_type?.toLowerCase().includes('majikan') || caseData.offense_type?.toLowerCase().includes('perusahaan')) && (
                        <>
                            <p className="mb-6" style={{ textIndent: '3rem' }}>
                                Bahawa kamu, <strong>{v.NAMA_SYARIKAT}</strong> (No. SSM: {v.NO_SSM}),
                                pada <strong>{v.TARIKH_KESALAHAN}</strong> lebih kurang jam <strong>{v.MASA}</strong> di{' '}
                                <strong>{v.LOKASI}</strong> dalam daerah <strong>{v.NEGERI}</strong>, dalam
                                negeri <strong>{v.NEGERI}</strong>, sebagai seorang <strong>majikan</strong> yang
                                menggajikan satu atau lebih orang yang diinsuranskan, telah
                                <strong> gagal untuk mendaftarkan diri</strong> sebagai majikan dengan Pertubuhan
                                di bawah Sistem Insurans Pekerjaan dalam tempoh yang ditetapkan.
                            </p>
                            <p className="mb-6" style={{ textIndent: '3rem' }}>
                                Oleh yang demikian, kamu telah melakukan suatu kesalahan di bawah{' '}
                                <strong>{caseData.section_charged}</strong> dan boleh
                                dihukum di bawah <strong>{caseData.section_penalty}</strong>.
                            </p>
                        </>
                    )}

                    {/* AKTA 800 - Gagal Daftar Pekerja */}
                    {!isAkta4 && caseData.offense_type?.toLowerCase().includes('pekerja') && !caseData.offense_type?.toLowerCase().includes('majikan') && (
                        <>
                            <p className="mb-6" style={{ textIndent: '3rem' }}>
                                Bahawa kamu, <strong>{v.NAMA_SYARIKAT}</strong> (No. SSM: {v.NO_SSM}),
                                pada <strong>{v.TARIKH_KESALAHAN}</strong> lebih kurang jam <strong>{v.MASA}</strong> di{' '}
                                <strong>{v.LOKASI}</strong> dalam daerah <strong>{v.NEGERI}</strong>, dalam
                                negeri <strong>{v.NEGERI}</strong>, sebagai seorang <strong>majikan</strong>, telah
                                <strong> gagal untuk mendaftarkan</strong> pekerja-pekerja berikut dengan Pertubuhan
                                di bawah Sistem Insurans Pekerjaan dalam tempoh tiga puluh (30) hari dari tarikh mula bekerja:
                            </p>
                            {employees.length > 0 && (
                                <div className="my-6 pl-12">
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
                                <strong>{caseData.section_charged}</strong> dan boleh
                                dihukum di bawah <strong>{caseData.section_penalty}</strong>.
                            </p>
                        </>
                    )}

                    {/* AKTA 800 - Gagal Bayar Caruman */}
                    {!isAkta4 && caseData.offense_type?.toLowerCase().includes('caruman') && (
                        <>
                            <p className="mb-6" style={{ textIndent: '3rem' }}>
                                Bahawa kamu, <strong>{v.NAMA_SYARIKAT}</strong> (No. SSM: {v.NO_SSM}),
                                pada <strong>{v.TARIKH_KESALAHAN}</strong> lebih kurang jam <strong>{v.MASA}</strong> di{' '}
                                <strong>{v.LOKASI}</strong> dalam daerah <strong>{v.NEGERI}</strong>, dalam
                                negeri <strong>{v.NEGERI}</strong>, sebagai seorang <strong>majikan</strong>, telah
                                <strong> gagal untuk membayar caruman</strong> yang kena dibayar di bawah Akta ini
                                berkenaan dengan orang-orang yang diinsuranskan dalam tempoh yang ditetapkan.
                            </p>
                            <p className="mb-6" style={{ textIndent: '3rem' }}>
                                Oleh yang demikian, kamu telah melakukan suatu kesalahan di bawah{' '}
                                <strong>{caseData.section_charged}</strong> dan boleh
                                dihukum di bawah <strong>{caseData.section_penalty}</strong>.
                            </p>
                        </>
                    )}

                    {/* AKTA 800 - Gagal Hadir Saman */}
                    {!isAkta4 && caseData.offense_type?.toLowerCase().includes('saman') && (
                        <>
                            <p className="mb-6" style={{ textIndent: '3rem' }}>
                                Bahawa kamu, <strong>{v.NAMA_SYARIKAT}</strong> (No. SSM: {v.NO_SSM}),
                                pada <strong>{v.TARIKH_KESALAHAN}</strong> lebih kurang jam <strong>{v.MASA}</strong> di{' '}
                                <strong>{v.LOKASI}</strong> dalam daerah <strong>{v.NEGERI}</strong>, dalam
                                negeri <strong>{v.NEGERI}</strong>, setelah dikehendaki hadir secara peribadi di hadapan
                                Pemeriksa sebagaimana yang dikehendaki di bawah <strong>Seksyen 70</strong> Akta ini,
                                telah <strong> gagal untuk hadir</strong> tanpa alasan yang munasabah.
                            </p>
                            <p className="mb-6" style={{ textIndent: '3rem' }}>
                                Oleh yang demikian, kamu telah melakukan suatu kesalahan di bawah{' '}
                                <strong>{caseData.section_charged}</strong> dan boleh
                                dihukum di bawah <strong>{caseData.section_penalty}</strong>.
                            </p>
                        </>
                    )}
                </div>

                {/* Butiran Hukuman */}
                <div className="my-10 p-6 border-2 border-black" style={{ textAlign: 'justify' }}>
                    <p className="font-bold uppercase mb-3">BUTIRAN HUKUMAN:</p>
                    <p>
                        Jika disabitkan kesalahan, boleh didenda tidak melebihi{' '}
                        <strong>Ringgit Malaysia Sepuluh Ribu (RM10,000.00)</strong> atau
                        dipenjarakan selama tempoh tidak melebihi <strong>Dua (2) tahun</strong> atau
                        kedua-duanya sekali.
                    </p>
                </div>

                {/* Section Boxes */}
                <div className="grid grid-cols-2 gap-6 my-10">
                    <div className="border-2 border-black p-5 text-center">
                        <p className="text-sm font-bold uppercase mb-2 text-gray-600">Seksyen Pertuduhan</p>
                        <p className="text-2xl font-bold">{caseData.section_charged.split(',')[0]}</p>
                        <p className="text-xs mt-3 text-gray-500">{actFullName}</p>
                    </div>
                    <div className="border-2 border-black p-5 text-center">
                        <p className="text-sm font-bold uppercase mb-2 text-gray-600">Seksyen Hukuman</p>
                        <p className="text-2xl font-bold">{caseData.section_penalty.split(',')[0]}</p>
                        <p className="text-xs mt-3 text-gray-500">{actFullName}</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-16 pt-6 border-t text-center text-sm text-gray-500">
                    <p>Dokumen dijana oleh Sistem Pendakwaan PERKESO</p>
                    <p className="mt-1">{formatDate(new Date().toISOString())}</p>
                </div>
            </div>
        </div>
    );
}
