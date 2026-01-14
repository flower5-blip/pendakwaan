'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Search, Building2, X } from 'lucide-react';

interface Employer {
    id: string;
    company_name: string;
    name?: string;
    ssm_no: string;
    owner_name: string;
    owner_ic: string;
    address: string;
    phone: string;
    state: string;
}

const STATES = [
    'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan',
    'Pahang', 'Perak', 'Perlis', 'Pulau Pinang', 'Sabah',
    'Sarawak', 'Selangor', 'Terengganu', 'W.P. Kuala Lumpur',
    'W.P. Labuan', 'W.P. Putrajaya'
];

export default function EmployersPage() {
    const [employers, setEmployers] = useState<Employer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        company_name: '',
        ssm_no: '',
        owner_name: '',
        owner_ic: '',
        address: '',
        phone: '',
        state: '',
    });
    const supabase = createClient();

    const fetchEmployers = async () => {
        const { data, error } = await supabase
            .from('employers')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setEmployers(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchEmployers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const { error } = await supabase.from('employers').insert({
            company_name: form.company_name,
            name: form.company_name,
            ssm_no: form.ssm_no,
            owner_name: form.owner_name,
            owner_ic: form.owner_ic,
            address: form.address,
            phone: form.phone,
            state: form.state,
        });

        if (!error) {
            setShowModal(false);
            setForm({
                company_name: '',
                ssm_no: '',
                owner_name: '',
                owner_ic: '',
                address: '',
                phone: '',
                state: '',
            });
            fetchEmployers();
        } else {
            alert('Gagal menyimpan: ' + error.message);
        }
        setSaving(false);
    };

    const filteredEmployers = employers.filter(e =>
        e.company_name?.toLowerCase().includes(search.toLowerCase()) ||
        e.name?.toLowerCase().includes(search.toLowerCase()) ||
        e.ssm_no?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Senarai Majikan</h1>
                    <p className="text-gray-500 mt-1">Urus rekod majikan yang didaftarkan</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus className="h-5 w-5" />
                    Tambah Majikan
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Cari nama syarikat atau SSM..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Memuatkan...</div>
                ) : filteredEmployers.length === 0 ? (
                    <div className="p-8 text-center">
                        <Building2 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">Tiada majikan dijumpai</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="mt-4 text-blue-600 hover:underline"
                        >
                            + Tambah majikan pertama
                        </button>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Nama Syarikat</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">No. SSM</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Pemilik</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Negeri</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Telefon</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredEmployers.map((employer) => (
                                <tr key={employer.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium">{employer.company_name || employer.name || '-'}</td>
                                    <td className="px-6 py-4 text-gray-600">{employer.ssm_no || '-'}</td>
                                    <td className="px-6 py-4 text-gray-600">{employer.owner_name || '-'}</td>
                                    <td className="px-6 py-4 text-gray-600">{employer.state || '-'}</td>
                                    <td className="px-6 py-4 text-gray-600">{employer.phone || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-semibold">Tambah Majikan Baru</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nama Syarikat <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.company_name}
                                    onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="ABC SDN BHD"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">No. SSM</label>
                                <input
                                    type="text"
                                    value={form.ssm_no}
                                    onChange={(e) => setForm({ ...form, ssm_no: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="123456-A"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pengarah</label>
                                    <input
                                        type="text"
                                        value={form.owner_name}
                                        onChange={(e) => setForm({ ...form, owner_name: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">No. KP Pengarah</label>
                                    <input
                                        type="text"
                                        value={form.owner_ic}
                                        onChange={(e) => setForm({ ...form, owner_ic: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="880101-01-1234"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                                <textarea
                                    value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    rows={2}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                                    <input
                                        type="text"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="03-12345678"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Negeri</label>
                                    <select
                                        value={form.state}
                                        onChange={(e) => setForm({ ...form, state: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Pilih negeri</option>
                                        {STATES.map(state => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg"
                                >
                                    {saving ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
