'use client';

import { useState } from 'react';
import { Settings, Bell, Lock, Palette, Save } from 'lucide-react';

export default function SettingsPage() {
    const [saving, setSaving] = useState(false);

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => setSaving(false), 1000);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Tetapan</h1>
                <p className="text-gray-500 mt-1">Urus tetapan akaun dan sistem</p>
            </div>

            <div className="grid gap-6">
                {/* Profile Settings */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Settings className="h-6 w-6 text-blue-600" />
                        <h2 className="text-lg font-semibold">Profil</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Penuh</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Nama anda"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Cth: Cawangan Shah Alam"
                            />
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Bell className="h-6 w-6 text-amber-500" />
                        <h2 className="text-lg font-semibold">Notifikasi</h2>
                    </div>
                    <div className="space-y-3">
                        <label className="flex items-center gap-3">
                            <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded" />
                            <span className="text-gray-700">E-mel untuk kes baru</span>
                        </label>
                        <label className="flex items-center gap-3">
                            <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded" />
                            <span className="text-gray-700">E-mel untuk kelulusan</span>
                        </label>
                        <label className="flex items-center gap-3">
                            <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" />
                            <span className="text-gray-700">Notifikasi push browser</span>
                        </label>
                    </div>
                </div>

                {/* Security */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Lock className="h-6 w-6 text-red-500" />
                        <h2 className="text-lg font-semibold">Keselamatan</h2>
                    </div>
                    <button className="text-blue-600 hover:underline">
                        Tukar Kata Laluan
                    </button>
                </div>

                {/* Theme */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Palette className="h-6 w-6 text-purple-500" />
                        <h2 className="text-lg font-semibold">Tema</h2>
                    </div>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                            <input type="radio" name="theme" defaultChecked className="h-4 w-4 text-blue-600" />
                            <span>Terang</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="radio" name="theme" className="h-4 w-4 text-blue-600" />
                            <span>Gelap</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="radio" name="theme" className="h-4 w-4 text-blue-600" />
                            <span>Sistem</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                >
                    <Save className="h-5 w-5" />
                    {saving ? 'Menyimpan...' : 'Simpan Tetapan'}
                </button>
            </div>
        </div>
    );
}
