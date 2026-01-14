'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Search, Building2 } from 'lucide-react';

interface Employer {
    id: string;
    company_name: string;
    ssm_no: string;
    owner_name: string;
    address: string;
    phone: string;
    state: string;
}

export default function EmployersPage() {
    const [employers, setEmployers] = useState<Employer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const supabase = createClient();

    useEffect(() => {
        async function fetchEmployers() {
            const { data, error } = await supabase
                .from('employers')
                .select('*')
                .order('company_name');

            if (!error && data) {
                setEmployers(data);
            }
            setLoading(false);
        }
        fetchEmployers();
    }, []);

    const filteredEmployers = employers.filter(e =>
        e.company_name?.toLowerCase().includes(search.toLowerCase()) ||
        e.ssm_no?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Senarai Majikan</h1>
                    <p className="text-gray-500 mt-1">Urus rekod majikan yang didaftarkan</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
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
                                    <td className="px-6 py-4 font-medium">{employer.company_name || '-'}</td>
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
        </div>
    );
}
