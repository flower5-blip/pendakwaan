'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ClipboardList, Calendar, User, Database } from 'lucide-react';

interface AuditEntry {
    id: string;
    table_name: string;
    record_id: string;
    action: string;
    old_data: object | null;
    new_data: object | null;
    user_id: string;
    created_at: string;
}

export default function AuditPage() {
    const [audits, setAudits] = useState<AuditEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchAudits() {
            const { data, error } = await supabase
                .from('audit_trail')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);

            if (!error && data) {
                setAudits(data);
            }
            setLoading(false);
        }
        fetchAudits();
    }, []);

    const getActionColor = (action: string) => {
        switch (action) {
            case 'create': return 'bg-green-100 text-green-700';
            case 'update': return 'bg-blue-100 text-blue-700';
            case 'delete': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('ms-MY');
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
                <p className="text-gray-500 mt-1">Log semua perubahan dalam sistem</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Memuatkan...</div>
                ) : audits.length === 0 ? (
                    <div className="p-8 text-center">
                        <ClipboardList className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">Tiada rekod audit</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {audits.map((audit) => (
                            <div key={audit.id} className="p-4 hover:bg-gray-50">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <Database className="h-5 w-5 text-gray-400 mt-1" />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{audit.table_name}</span>
                                                <span className={`px-2 py-0.5 text-xs rounded-full ${getActionColor(audit.action)}`}>
                                                    {audit.action}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Record ID: {audit.record_id.slice(0, 8)}...
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {formatDate(audit.created_at)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
