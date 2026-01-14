// ============================================
// src/app/cases/new/page.tsx
// Borang Cipta Kes Baru - PERKESO Prosecution
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ============================================
// Types
// ============================================

type ActType = 'Akta 4' | 'Akta 800';

interface OffenseOption {
    value: string;
    label: string;
    chargeSection: string;
    penaltySection: string;
    compoundSection: string;
}

// ============================================
// Offense Options Data (dari 2.md)
// ============================================

const OFFENSE_OPTIONS: Record<ActType, OffenseOption[]> = {
    'Akta 4': [
        {
            value: 'gagal_daftar_perusahaan',
            label: 'Gagal Daftar Perusahaan',
            chargeSection: 'Seksyen 4',
            penaltySection: 'Seksyen 94(g)',
            compoundSection: 'Seksyen 95A',
        },
        {
            value: 'gagal_daftar_pekerja',
            label: 'Gagal Daftar Pekerja',
            chargeSection: 'Seksyen 5',
            penaltySection: 'Seksyen 94(g)',
            compoundSection: 'Seksyen 95A',
        },
        {
            value: 'gagal_carum',
            label: 'Gagal Bayar Caruman',
            chargeSection: 'Seksyen 6',
            penaltySection: 'Seksyen 94(a)',
            compoundSection: 'Seksyen 95A',
        },
        {
            value: 'gagal_simpan_rekod',
            label: 'Gagal Simpan Rekod',
            chargeSection: 'Seksyen 11(3)',
            penaltySection: 'Seksyen 94(g)',
            compoundSection: 'Seksyen 95A',
        },
        {
            value: 'potong_gaji',
            label: 'Memotong Gaji Pekerja',
            chargeSection: 'Seksyen 7(3)',
            penaltySection: 'Seksyen 94(b)',
            compoundSection: 'Seksyen 95A',
        },
    ],
    'Akta 800': [
        {
            value: 'gagal_daftar_sip',
            label: 'Gagal Daftar SIP',
            chargeSection: 'Seksyen 14(1)',
            penaltySection: 'Seksyen 14(2)',
            compoundSection: 'Seksyen 77',
        },
        {
            value: 'gagal_daftar_pekerja',
            label: 'Gagal Daftar Pekerja',
            chargeSection: 'Seksyen 16(1)',
            penaltySection: 'Seksyen 16(5)',
            compoundSection: 'Seksyen 77',
        },
        {
            value: 'gagal_bayar_caruman',
            label: 'Gagal Bayar Caruman SIP',
            chargeSection: 'Seksyen 18(1)',
            penaltySection: 'Seksyen 18(4)',
            compoundSection: 'Seksyen 77',
        },
        {
            value: 'gagal_simpan_rekod',
            label: 'Gagal Simpan Rekod',
            chargeSection: 'Seksyen 78(1)',
            penaltySection: 'Seksyen 78(3)',
            compoundSection: 'Seksyen 77',
        },
    ],
};

// ============================================
// Component
// ============================================

export default function NewCasePage() {
    const router = useRouter();

    // ============================================
    // State
    // ============================================

    const [selectedAct, setSelectedAct] = useState<ActType>('Akta 4');
    const [selectedOffense, setSelectedOffense] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Auto-fill sections
    const [chargeSection, setChargeSection] = useState<string>('');
    const [penaltySection, setPenaltySection] = useState<string>('');
    const [compoundSection, setCompoundSection] = useState<string>('');

    // Form data
    const [formData, setFormData] = useState({
        // Majikan
        company_name: '',
        ssm_number: '',
        address: '',
        owner_name: '',
        owner_ic: '',
        phone: '',
        // Kesalahan
        date_of_offense: '',
        location_of_offense: '',
        notes: '',
    });

    // ============================================
    // Effect: Reset offense when act changes
    // ============================================

    useEffect(() => {
        setSelectedOffense('');
        setChargeSection('');
        setPenaltySection('');
        setCompoundSection('');
    }, [selectedAct]);

    // ============================================
    // Effect: Auto-fill sections when offense changes
    // ============================================

    useEffect(() => {
        if (selectedOffense) {
            const offense = OFFENSE_OPTIONS[selectedAct].find(
                (o) => o.value === selectedOffense
            );
            if (offense) {
                setChargeSection(offense.chargeSection);
                setPenaltySection(offense.penaltySection);
                setCompoundSection(offense.compoundSection);
            }
        } else {
            setChargeSection('');
            setPenaltySection('');
            setCompoundSection('');
        }
    }, [selectedOffense, selectedAct]);

    // ============================================
    // Handlers
    // ============================================

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        console.log('Submitting:', {
            act_type: selectedAct,
            offense_type: selectedOffense,
            section_charged: chargeSection,
            section_penalty: penaltySection,
            section_compound: compoundSection,
            ...formData,
        });

        // TODO: Call server action here
        // const result = await createCase(formData);

        setTimeout(() => {
            setIsSubmitting(false);
            alert('Kes berjaya dicipta! (Demo)');
            router.push('/cases');
        }, 1500);
    };

    // ============================================
    // Render
    // ============================================

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/cases"
                        className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block"
                    >
                        ← Kembali ke Senarai Kes
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Cipta Kes Baru</h1>
                    <p className="text-gray-600 mt-1">
                        Isi maklumat di bawah untuk mendaftarkan kes pendakwaan baru.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* ============================================ */}
                    {/* SECTION 1: Pilihan Akta (Tab) */}
                    {/* ============================================ */}

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            1. Pilih Jenis Akta
                        </h2>

                        <div className="flex gap-4">
                            {(['Akta 4', 'Akta 800'] as ActType[]).map((act) => (
                                <button
                                    key={act}
                                    type="button"
                                    onClick={() => setSelectedAct(act)}
                                    className={`
                    flex-1 py-4 px-6 rounded-lg border-2 font-medium transition-all
                    ${selectedAct === act
                                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                        }
                  `}
                                >
                                    <div className="text-lg">{act}</div>
                                    <div className="text-sm opacity-75 mt-1">
                                        {act === 'Akta 4'
                                            ? 'Keselamatan Sosial Pekerja 1969'
                                            : 'Sistem Insurans Pekerjaan 2017'}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ============================================ */}
                    {/* SECTION 2: Maklumat Majikan */}
                    {/* ============================================ */}

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            2. Maklumat Majikan (OKS)
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nama Syarikat */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nama Syarikat <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="company_name"
                                    value={formData.company_name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Cth: Syarikat Jaya Makmur Sdn Bhd"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                />
                            </div>

                            {/* No. SSM */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    No. Pendaftaran SSM
                                </label>
                                <input
                                    type="text"
                                    name="ssm_number"
                                    value={formData.ssm_number}
                                    onChange={handleInputChange}
                                    placeholder="Cth: 1234567-A"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    No. Telefon
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="Cth: 03-80618888"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                />
                            </div>

                            {/* Owner Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nama Pengarah / Pemilik
                                </label>
                                <input
                                    type="text"
                                    name="owner_name"
                                    value={formData.owner_name}
                                    onChange={handleInputChange}
                                    placeholder="Nama penuh"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                />
                            </div>

                            {/* Owner IC */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    No. KP Pengarah
                                </label>
                                <input
                                    type="text"
                                    name="owner_ic"
                                    value={formData.owner_ic}
                                    onChange={handleInputChange}
                                    placeholder="Cth: 680415-10-5432"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                />
                            </div>

                            {/* Alamat */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Alamat Premis
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="Alamat penuh premis perniagaan"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ============================================ */}
                    {/* SECTION 3: Maklumat Kesalahan */}
                    {/* ============================================ */}

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            3. Maklumat Kesalahan
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Jenis Kesalahan - Dropdown */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Jenis Kesalahan <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedOffense}
                                    onChange={(e) => setSelectedOffense(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                                >
                                    <option value="">-- Pilih Jenis Kesalahan --</option>
                                    {OFFENSE_OPTIONS[selectedAct].map((offense) => (
                                        <option key={offense.value} value={offense.value}>
                                            {offense.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Tarikh Kesalahan */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tarikh Kesalahan <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="date_of_offense"
                                    value={formData.date_of_offense}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                />
                            </div>

                            {/* Lokasi Kesalahan */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Lokasi Kesalahan
                                </label>
                                <input
                                    type="text"
                                    name="location_of_offense"
                                    value={formData.location_of_offense}
                                    onChange={handleInputChange}
                                    placeholder="Alamat kejadian"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                />
                            </div>
                        </div>

                        {/* ============================================ */}
                        {/* Auto-fill Sections Display */}
                        {/* ============================================ */}

                        {selectedOffense && (
                            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h3 className="text-sm font-semibold text-blue-800 mb-3">
                                    📋 Seksyen Auto-fill ({selectedAct})
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <div className="text-xs text-blue-600 uppercase tracking-wide mb-1">
                                            Seksyen Pertuduhan
                                        </div>
                                        <div className="text-lg font-bold text-blue-900">
                                            {chargeSection}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-blue-600 uppercase tracking-wide mb-1">
                                            Seksyen Hukuman
                                        </div>
                                        <div className="text-lg font-bold text-blue-900">
                                            {penaltySection}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-blue-600 uppercase tracking-wide mb-1">
                                            Seksyen Kompaun
                                        </div>
                                        <div className="text-lg font-bold text-blue-900">
                                            {compoundSection}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ============================================ */}
                    {/* SECTION 4: Nota Tambahan */}
                    {/* ============================================ */}

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            4. Nota Tambahan
                        </h2>

                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            rows={4}
                            placeholder="Sebarang maklumat tambahan mengenai kes ini..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                        />
                    </div>

                    {/* ============================================ */}
                    {/* Submit Buttons */}
                    {/* ============================================ */}

                    <div className="flex justify-end gap-4">
                        <Link
                            href="/cases"
                            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`
                px-8 py-3 rounded-lg font-medium text-white transition
                ${isSubmitting
                                    ? 'bg-blue-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                }
              `}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle
                                            className="opacity-25"
                                            cx="12" cy="12" r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                        />
                                    </svg>
                                    Menyimpan...
                                </span>
                            ) : (
                                'Simpan Kes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
