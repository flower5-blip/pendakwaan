// ============================================
// PERKESO Prosecution System
// Audit Trail Viewer
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { exportToCSV, exportToExcel } from '@/lib/export';
import { FileText, Download, Search, Calendar, User, Loader2 } from 'lucide-react';

interface AuditLog {
    id: string;
    table_name: string;
    record_id: string;
    action: 'create' | 'update' | 'delete';
    old_data: Record<string, any> | null;
    new_data: Record<string, any> | null;
    user_id: string | null;
    user?: {
        full_name: string;
        role: string;
    };
    created_at: string;
}

export default function AuditPage() {
    const { profile, isAdmin } = useAuth();
    const supabase = createClient();

    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterTable, setFilterTable] = useState('all');
    const [filterAction, setFilterAction] = useState('all');
    const [filterUser, setFilterUser] = useState('');
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        if (isAdmin()) {
            fetchLogs();
        }
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('audit_trail')
                .select(`
                    *,
                    user:profiles!audit_trail_user_id_fkey(id, full_name, role)
                `)
                .order('created_at', { ascending: false })
                .limit(1000);

            if (error) {
                console.error('Error fetching audit logs:', error);
            } else {
                setLogs(data || []);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter((log) => {
        if (filterTable !== 'all' && log.table_name !== filterTable) return false;
        if (filterAction !== 'all' && log.action !== filterAction) return false;
        if (filterUser && log.user?.full_name && !log.user.full_name.toLowerCase().includes(filterUser.toLowerCase())) return false;
        if (filterDateFrom && log.created_at < filterDateFrom) return false;
        if (filterDateTo && log.created_at > filterDateTo + 'T23:59:59') return false;
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            const matchesTable = log.table_name.toLowerCase().includes(searchLower);
            const matchesRecordId = log.record_id.toLowerCase().includes(searchLower);
            const matchesUser = log.user?.full_name?.toLowerCase().includes(searchLower) || false;
            const matchesData = JSON.stringify(log.new_data || log.old_data || {}).toLowerCase().includes(searchLower);
            if (!matchesTable && !matchesRecordId && !matchesUser && !matchesData) return false;
        }
        return true;
    });

    const handleExport = async (format: 'csv' | 'excel') => {
        setExporting(true);
        try {
            const exportData = filteredLogs.map((log) => ({
                'ID': log.id,
                'Jadual': log.table_name,
                'ID Rekod': log.record_id,
                'Tindakan': log.action,
                'Pengguna': log.user?.full_name || 'Unknown',
                'Peranan': log.user?.role || '',
                'Data Lama': log.old_data ? JSON.stringify(log.old_data) : '',
                'Data Baru': log.new_data ? JSON.stringify(log.new_data) : '',
                'Tarikh': new Date(log.created_at).toLocaleString('ms-MY'),
            }));

            if (format === 'csv') {
                exportToCSV(exportData, `audit_trail_${new Date().toISOString().split('T')[0]}.csv`);
            } else {
                exportToExcel(exportData, `audit_trail_${new Date().toISOString().split('T')[0]}.xlsx`);
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('Ralat semasa mengeksport data. Sila cuba lagi.');
        } finally {
            setExporting(false);
        }
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'create':
                return 'bg-green-100 text-green-800';
            case 'update':
                return 'bg-blue-100 text-blue-800';
            case 'delete':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getActionLabel = (action: string) => {
        switch (action) {
            case 'create':
                return 'Cipta';
            case 'update':
                return 'Kemaskini';
            case 'delete':
                return 'Padam';
            default:
                return action;
        }
    };

    if (!isAdmin()) {
        return (
            <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Akses Ditolak</h2>
                <p className="text-gray-600">Hanya pentadbir boleh mengakses audit trail.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Get unique table names and actions
    const tableNames = Array.from(new Set(logs.map((log) => log.table_name))).sort();
    const actions = Array.from(new Set(logs.map((log) => log.action))).sort();

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
                    <p className="text-gray-600">Log aktiviti sistem dan perubahan data</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => handleExport('csv')}
                        disabled={exporting || filteredLogs.length === 0}
                    >
                        {exporting ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Download className="h-4 w-4 mr-2" />
                        )}
                        Eksport CSV
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => handleExport('excel')}
                        disabled={exporting || filteredLogs.length === 0}
                    >
                        {exporting ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Download className="h-4 w-4 mr-2" />
                        )}
                        Eksport Excel
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Penapis</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div className="lg:col-span-2">
                            <Input
                                label="Carian"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Cari dalam jadual, ID rekod, pengguna..."
                                icon={<Search className="h-4 w-4" />}
                            />
                        </div>
                        <Select
                            label="Jadual"
                            value={filterTable}
                            onChange={(e) => setFilterTable(e.target.value)}
                            options={[
                                { value: 'all', label: 'Semua Jadual' },
                                ...tableNames.map((name) => ({ value: name, label: name })),
                            ]}
                        />
                        <Select
                            label="Tindakan"
                            value={filterAction}
                            onChange={(e) => setFilterAction(e.target.value)}
                            options={[
                                { value: 'all', label: 'Semua Tindakan' },
                                ...actions.map((action) => ({
                                    value: action,
                                    label: getActionLabel(action),
                                })),
                            ]}
                        />
                        <Input
                            label="Dari Tarikh"
                            type="date"
                            value={filterDateFrom}
                            onChange={(e) => setFilterDateFrom(e.target.value)}
                        />
                        <Input
                            label="Hingga Tarikh"
                            type="date"
                            value={filterDateTo}
                            onChange={(e) => setFilterDateTo(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Summary */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Memaparkan <strong>{filteredLogs.length}</strong> daripada{' '}
                            <strong>{logs.length}</strong> log audit
                        </p>
                        <Button variant="outline" size="sm" onClick={fetchLogs}>
                            Muat Semula
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Audit Logs */}
            <Card>
                <CardHeader>
                    <CardTitle>Log Audit</CardTitle>
                    <CardDescription>
                        Semua perubahan data dalam sistem direkodkan di sini
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredLogs.length === 0 ? (
                        <div className="text-center py-8">
                            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600">Tiada log audit dijumpai</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredLogs.map((log) => (
                                <div
                                    key={log.id}
                                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <Badge className={getActionColor(log.action)}>
                                                {getActionLabel(log.action)}
                                            </Badge>
                                            <span className="font-medium text-gray-900">
                                                {log.table_name}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                ID: {log.record_id.substring(0, 8)}...
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {new Date(log.created_at).toLocaleString('ms-MY')}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                        <User className="h-4 w-4" />
                                        <span>
                                            {log.user?.full_name || 'Unknown'} ({log.user?.role || 'N/A'})
                                        </span>
                                    </div>

                                    {log.action === 'update' && (
                                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            {log.old_data && Object.keys(log.old_data).length > 0 && (
                                                <div className="p-3 bg-red-50 rounded border border-red-200">
                                                    <p className="font-medium text-red-900 mb-1">
                                                        Data Lama:
                                                    </p>
                                                    <pre className="text-xs text-red-700 overflow-x-auto">
                                                        {JSON.stringify(log.old_data, null, 2)}
                                                    </pre>
                                                </div>
                                            )}
                                            {log.new_data && Object.keys(log.new_data).length > 0 && (
                                                <div className="p-3 bg-green-50 rounded border border-green-200">
                                                    <p className="font-medium text-green-900 mb-1">
                                                        Data Baru:
                                                    </p>
                                                    <pre className="text-xs text-green-700 overflow-x-auto">
                                                        {JSON.stringify(log.new_data, null, 2)}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {(log.action === 'create' || log.action === 'delete') && log.new_data && (
                                        <div className="mt-3 p-3 bg-gray-50 rounded border text-sm">
                                            <p className="font-medium text-gray-900 mb-1">Data:</p>
                                            <pre className="text-xs text-gray-700 overflow-x-auto">
                                                {JSON.stringify(log.new_data, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
