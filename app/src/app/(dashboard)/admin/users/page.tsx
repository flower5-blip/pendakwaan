'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Shield, UserPlus, Search } from 'lucide-react';

interface UserProfile {
    id: string;
    full_name: string;
    role: string;
    department: string;
    phone: string;
    created_at: string;
}

const roleLabels: Record<string, string> = {
    admin: 'Admin',
    io: 'Pegawai Penyiasat (IO)',
    po: 'Pegawai Pendakwa (PO)',
    uip: 'Unit Integriti',
    viewer: 'Pelihat',
};

const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-700',
    io: 'bg-blue-100 text-blue-700',
    po: 'bg-green-100 text-green-700',
    uip: 'bg-purple-100 text-purple-700',
    viewer: 'bg-gray-100 text-gray-700',
};

export default function UsersPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const supabase = createClient();

    useEffect(() => {
        async function fetchUsers() {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setUsers(data);
            }
            setLoading(false);
        }
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(u =>
        u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.department?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pengurusan Pengguna</h1>
                    <p className="text-gray-500 mt-1">Urus akaun pengguna sistem</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Tambah Pengguna
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Cari nama atau jabatan..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Memuatkan...</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-8 text-center">
                        <Shield className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">Tiada pengguna dijumpai</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Nama</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Peranan</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Jabatan</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Telefon</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Tindakan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium">{user.full_name || '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${roleColors[user.role] || roleColors.viewer}`}>
                                            {roleLabels[user.role] || user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{user.department || '-'}</td>
                                    <td className="px-6 py-4 text-gray-600">{user.phone || '-'}</td>
                                    <td className="px-6 py-4">
                                        <button className="text-blue-600 hover:underline text-sm">Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
