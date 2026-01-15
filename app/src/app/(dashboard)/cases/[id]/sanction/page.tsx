// ============================================
// PERKESO Prosecution System
// Sanction Page - UIP Sanction Case
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CASE_STATUS_LABELS, CASE_STATUS_COLORS, type CaseStatus } from '@/lib/workflow';
import { updateCaseStatus, approveSanctionWithRoute } from '@/app/actions/workflow-actions';
import { ArrowLeft, CheckCircle, XCircle, Loader2, Scale } from 'lucide-react';
import Link from 'next/link';

export default function SanctionPage() {
    const params = useParams();
    const caseId = params.id as string;
    const router = useRouter();
    const { profile, isUIP } = useAuth();
    const supabase = createClient();

    const [caseData, setCaseData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [sanctionNotes, setSanctionNotes] = useState('');
    const [decision, setDecision] = useState<'approve' | 'reject' | null>(null);
    const [sanctionType, setSanctionType] = useState<'compound' | 'prosecution' | 'nfa' | null>(null);

    useEffect(() => {
        if (!isUIP()) {
            router.push('/cases');
            return;
        }

        const fetchCase = async () => {
            const { data, error } = await supabase
                .from('cases')
                .select(`
                    *,
                    employer:employers(*),
                    io:profiles!cases_io_id_fkey(*)
                `)
                .eq('id', caseId)
                .single();

            if (error || !data) {
                router.push('/cases');
                return;
            }

            setCaseData(data);
            setLoading(false);
        };

        fetchCase();
    }, [caseId, supabase, router, isUIP]);

    const handleApprove = async () => {
        if (!caseData || !sanctionType) return;

        setSubmitting(true);

        // Tentukan laluan berdasarkan pilihan
        let route: 'compound_offered' | 'prosecution' | 'nfa' = 'compound_offered';
        if (sanctionType === 'prosecution') route = 'prosecution';
        if (sanctionType === 'nfa') route = 'nfa';

        // Gunakan Server Action yang menggabungkan kedua-dua operasi
        const result = await approveSanctionWithRoute(caseId, route, sanctionNotes);

        if (result.success) {
            const routeLabel = route === 'compound_offered' ? 'Kompaun' : route === 'prosecution' ? 'Pendakwaan' : 'NFA';
            alert(`Sanksi diluluskan. Kes telah diarahkan ke ${routeLabel}.`);
            router.push(`/cases/${caseId}`);
        } else {
            alert(`Ralat: ${result.error || result.message}`);
        }
        setSubmitting(false);
    };

    const handleReject = async () => {
        if (!caseData) return;

        setSubmitting(true);
        const result = await updateCaseStatus(caseId, 'pending_review', sanctionNotes);

        if (result.success) {
            alert('Sanksi ditolak. Kes dikembalikan kepada PO untuk semakan semula.');
            router.push(`/cases/${caseId}`);
        } else {
            alert(`Ralat: ${result.error || result.message}`);
        }
        setSubmitting(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!caseData) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">Kes tidak dijumpai</p>
                <Link href="/cases">
                    <Button className="mt-4">Kembali</Button>
                </Link>
            </div>
        );
    }

    const currentStatus = caseData.status as CaseStatus;

    if (currentStatus !== 'approved') {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">
                    Kes ini tidak dalam status "Menunggu Sanksi". Status semasa: {CASE_STATUS_LABELS[currentStatus]}
                </p>
                <Link href={`/cases/${caseId}`}>
                    <Button className="mt-4">Kembali ke Detail Kes</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href={`/cases/${caseId}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Sanksi Kes</h1>
                    <p className="text-gray-600">{caseData.case_number}</p>
                </div>
            </div>

            {/* Case Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Maklumat Kes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Nombor Kes</p>
                            <p className="font-medium">{caseData.case_number}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <Badge className={CASE_STATUS_COLORS[currentStatus]}>
                                {CASE_STATUS_LABELS[currentStatus]}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Majikan</p>
                            <p className="font-medium">{caseData.employer?.company_name || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Pegawai Penyiasat</p>
                            <p className="font-medium">{caseData.io?.full_name || '-'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Sanction Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Scale className="h-5 w-5" />
                        Sanksi
                    </CardTitle>
                    <CardDescription>
                        Luluskan sanksi dan tentukan tindakan seterusnya
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        label="Nota Sanksi"
                        value={sanctionNotes}
                        onChange={(e) => setSanctionNotes(e.target.value)}
                        placeholder="Tambah nota sanksi anda di sini..."
                        rows={6}
                    />

                    {decision === 'approve' && (
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm font-medium text-green-900 mb-3">
                                Pilih Tindakan Seterusnya:
                            </p>
                            <div className="grid grid-cols-3 gap-3">
                                <Button
                                    variant={sanctionType === 'compound' ? 'default' : 'outline'}
                                    onClick={() => setSanctionType('compound')}
                                    disabled={submitting}
                                >
                                    Kompaun
                                </Button>
                                <Button
                                    variant={sanctionType === 'prosecution' ? 'default' : 'outline'}
                                    onClick={() => setSanctionType('prosecution')}
                                    disabled={submitting}
                                >
                                    Pendakwaan
                                </Button>
                                <Button
                                    variant={sanctionType === 'nfa' ? 'default' : 'outline'}
                                    onClick={() => setSanctionType('nfa')}
                                    disabled={submitting}
                                >
                                    NFA
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setDecision('reject')}
                            disabled={submitting}
                        >
                            <XCircle className="h-4 w-4 mr-2" />
                            Tolak & Kembalikan
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={() => setDecision('approve')}
                            disabled={submitting}
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Luluskan Sanksi
                        </Button>
                    </div>

                    {decision && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm font-medium text-blue-900 mb-2">
                                {decision === 'approve'
                                    ? sanctionType
                                        ? `Luluskan sanksi dan teruskan dengan ${sanctionType === 'compound' ? 'Kompaun' : sanctionType === 'prosecution' ? 'Pendakwaan' : 'NFA'}?`
                                        : 'Sila pilih tindakan seterusnya (Kompaun/Pendakwaan/NFA)'
                                    : 'Tolak sanksi dan kembalikan kepada PO untuk semakan semula?'}
                            </p>
                            {decision === 'approve' && sanctionType && (
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setDecision(null);
                                            setSanctionType(null);
                                        }}
                                        disabled={submitting}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleApprove}
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                Memproses...
                                            </>
                                        ) : (
                                            'Sahkan'
                                        )}
                                    </Button>
                                </div>
                            )}
                            {decision === 'reject' && (
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setDecision(null)}
                                        disabled={submitting}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleReject}
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                Memproses...
                                            </>
                                        ) : (
                                            'Sahkan'
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
