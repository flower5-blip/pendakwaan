// ============================================
// PERKESO Prosecution System
// Review Page - PO Review Case
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
import { CASE_STATUS_LABELS, CASE_STATUS_COLORS } from '@/lib/workflow';
import { updateCaseStatus } from '@/app/actions/workflow-actions';
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ReviewPage() {
    const params = useParams();
    const caseId = params.id as string;
    const router = useRouter();
    const { profile, canReview } = useAuth();
    const supabase = createClient();

    const [caseData, setCaseData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [reviewNotes, setReviewNotes] = useState('');
    const [decision, setDecision] = useState<'approve' | 'reject' | null>(null);

    useEffect(() => {
        if (!canReview()) {
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
    }, [caseId, supabase, router, canReview]);

    const handleApprove = async () => {
        if (!caseData) return;

        setSubmitting(true);
        const result = await updateCaseStatus(caseId, 'menunggu_sanksi', reviewNotes);

        if (result.success) {
            alert('Kes diluluskan dan dihantar kepada UIP untuk sanksi.');
            router.push(`/cases/${caseId}`);
        } else {
            alert(`Ralat: ${result.error || result.message}`);
        }
        setSubmitting(false);
    };

    const handleReject = async () => {
        if (!caseData) return;

        setSubmitting(true);
        const result = await updateCaseStatus(caseId, 'dalam_siasatan', reviewNotes);

        if (result.success) {
            alert('Kes ditolak dan dikembalikan kepada IO untuk perbaiki.');
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

    const currentStatus = caseData.status;

    if (currentStatus !== 'menunggu_semakan') {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">
                    Kes ini tidak dalam status "Menunggu Semakan". Status semasa: {CASE_STATUS_LABELS[currentStatus]}
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
                    <h1 className="text-2xl font-bold text-gray-900">Semakan Kes</h1>
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
                            <p className="font-medium">{caseData.employer?.name || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Pegawai Penyiasat</p>
                            <p className="font-medium">{caseData.io?.full_name || '-'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Review Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Semakan</CardTitle>
                    <CardDescription>
                        Semak kes dan buat keputusan: Luluskan atau Tolak
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        label="Nota Semakan"
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Tambah nota semakan anda di sini..."
                        rows={6}
                    />

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
                            Luluskan
                        </Button>
                    </div>

                    {decision && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm font-medium text-blue-900 mb-2">
                                {decision === 'approve'
                                    ? 'Luluskan dan hantar kepada UIP untuk sanksi?'
                                    : 'Tolak dan kembalikan kepada IO untuk perbaiki?'}
                            </p>
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
                                    onClick={decision === 'approve' ? handleApprove : handleReject}
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
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
