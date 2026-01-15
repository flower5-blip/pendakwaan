// ============================================
// PERKESO Prosecution System
// Reports & Analytics Page
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
import {
    exportToCSV,
    exportToExcel,
    exportToPDF,
    formatCaseForExport,
    calculateCaseStatistics,
    type CaseStatistics,
} from '@/lib/export';
import { CASE_STATUS_LABELS, ACT_TYPE_LABELS } from '@/lib/constants';
import {
    FileText,
    Download,
    BarChart3,
    TrendingUp,
    Calendar,
    DollarSign,
    Gavel,
    Loader2,
} from 'lucide-react';

export default function ReportsPage() {
    const { profile } = useAuth();
    const supabase = createClient();

    const [cases, setCases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statistics, setStatistics] = useState<CaseStatistics | null>(null);
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterActType, setFilterActType] = useState('all');
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetchCases();
    }, []);

    useEffect(() => {
        if (cases.length > 0) {
            const stats = calculateCaseStatistics(cases);
            setStatistics(stats);
        }
    }, [cases]);

    const fetchCases = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('cases')
            .select(`
                *,
                employer:employers(*),
                io:profiles!cases_io_id_fkey(*)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching cases:', error);
        } else {
            setCases(data || []);
        }
        setLoading(false);
    };

    const filteredCases = cases.filter((caseItem) => {
        if (filterStatus !== 'all' && caseItem.status !== filterStatus) return false;
        if (filterActType !== 'all' && caseItem.act_type !== filterActType) return false;
        if (filterDateFrom && caseItem.created_at < filterDateFrom) return false;
        if (filterDateTo && caseItem.created_at > filterDateTo + 'T23:59:59') return false;
        return true;
    });

    const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
        setExporting(true);
        try {
            const exportData = filteredCases.map(formatCaseForExport);

            if (format === 'csv') {
                exportToCSV(exportData, `laporan_kes_${new Date().toISOString().split('T')[0]}.csv`);
            } else if (format === 'excel') {
                exportToExcel(exportData, `laporan_kes_${new Date().toISOString().split('T')[0]}.xlsx`);
            } else if (format === 'pdf') {
                // For PDF, we'll use print dialog
                exportToPDF();
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('Ralat semasa mengeksport data. Sila cuba lagi.');
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Laporan & Analitik</h1>
                    <p className="text-gray-600">Statistik dan laporan kes pendakwaan</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => handleExport('csv')}
                        disabled={exporting || filteredCases.length === 0}
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
                        disabled={exporting || filteredCases.length === 0}
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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                        <Select
                            label="Status"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            options={[
                                { value: 'all', label: 'Semua Status' },
                                ...Object.entries(CASE_STATUS_LABELS).map(([value, label]) => ({
                                    value,
                                    label,
                                })),
                            ]}
                        />
                        <Select
                            label="Jenis Akta"
                            value={filterActType}
                            onChange={(e) => setFilterActType(e.target.value)}
                            options={[
                                { value: 'all', label: 'Semua Akta' },
                                ...Object.entries(ACT_TYPE_LABELS).map(([value, label]) => ({
                                    value,
                                    label,
                                })),
                            ]}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Statistics Overview */}
            {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                                    <FileText className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Jumlah Kes</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {statistics.total}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                                    <DollarSign className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Jumlah Kompaun</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        RM {statistics.compoundTotal.toLocaleString('ms-MY')}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                                    <Gavel className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Kes Pendakwaan</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {statistics.prosecutionTotal}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                                    <Calendar className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Purata Hari Selesai</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {statistics.averageResolutionDays}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Status Breakdown */}
            {statistics && (
                <Card>
                    <CardHeader>
                        <CardTitle>Pecahan Mengikut Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {Object.entries(statistics.byStatus).map(([status, count]) => (
                                <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                                    <p className="text-sm text-gray-600">
                                        {CASE_STATUS_LABELS[status] || status}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Act Type Breakdown */}
            {statistics && (
                <Card>
                    <CardHeader>
                        <CardTitle>Pecahan Mengikut Jenis Akta</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(statistics.byActType).map(([actType, count]) => (
                                <div
                                    key={actType}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                                >
                                    <p className="font-medium">
                                        {ACT_TYPE_LABELS[actType] || actType}
                                    </p>
                                    <Badge variant="outline" className="text-lg">
                                        {count}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Cases List */}
            <Card>
                <CardHeader>
                    <CardTitle>Senarai Kes ({filteredCases.length})</CardTitle>
                    <CardDescription>
                        Kes yang dipaparkan berdasarkan penapis yang dipilih
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredCases.length === 0 ? (
                        <div className="text-center py-8">
                            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600">Tiada kes dijumpai</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-2">Nombor Kes</th>
                                        <th className="text-left p-2">Majikan</th>
                                        <th className="text-left p-2">Jenis Akta</th>
                                        <th className="text-left p-2">Status</th>
                                        <th className="text-left p-2">Tarikh Dibuat</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCases.slice(0, 50).map((caseItem) => (
                                        <tr key={caseItem.id} className="border-b hover:bg-gray-50">
                                            <td className="p-2 font-medium">{caseItem.case_number}</td>
                                            <td className="p-2">
                                                {caseItem.employer?.company_name ||
                                                    caseItem.employer?.name ||
                                                    '-'}
                                            </td>
                                            <td className="p-2">
                                                {ACT_TYPE_LABELS[caseItem.act_type] || caseItem.act_type}
                                            </td>
                                            <td className="p-2">
                                                <Badge variant="outline">
                                                    {CASE_STATUS_LABELS[caseItem.status] ||
                                                        caseItem.status}
                                                </Badge>
                                            </td>
                                            <td className="p-2">
                                                {caseItem.created_at
                                                    ? new Date(caseItem.created_at).toLocaleDateString(
                                                          'ms-MY'
                                                      )
                                                    : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredCases.length > 50 && (
                                <p className="text-sm text-gray-500 mt-4 text-center">
                                    Memaparkan 50 daripada {filteredCases.length} kes. Gunakan eksport
                                    untuk melihat semua.
                                </p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
