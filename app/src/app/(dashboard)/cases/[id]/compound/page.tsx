// ============================================
// PERKESO Prosecution System
// Compound Offer Management Page
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    calculateCompoundAmount,
    generateCompoundOfferNumber,
    calculateDueDate,
    isCompoundExpired,
    getDaysUntilExpiry,
    formatCompoundAmount,
    COMPOUND_STATUS_LABELS,
    COMPOUND_STATUS_COLORS,
    type CompoundCalculation,
} from '@/lib/compound';
import { ArrowLeft, Plus, DollarSign, Calendar, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface CompoundOffer {
    id: string;
    offer_number: string;
    offer_date: string;
    due_date: string;
    amount: number;
    status: 'pending' | 'paid' | 'expired' | 'cancelled';
    paid_date?: string | null;
    paid_amount?: number | null;
    receipt_number?: string | null;
    notes?: string | null;
    created_at: string;
}

export default function CompoundPage() {
    const params = useParams();
    const caseId = params.id as string;
    const router = useRouter();
    const { profile, canEdit } = useAuth();
    const supabase = createClient();

    const [caseData, setCaseData] = useState<any>(null);
    const [offers, setOffers] = useState<CompoundOffer[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [calculation, setCalculation] = useState<CompoundCalculation | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        offer_number: generateCompoundOfferNumber(),
        offer_date: new Date().toISOString().split('T')[0],
        due_date: calculateDueDate(new Date().toISOString().split('T')[0], 14),
        amount: 0,
        notes: '',
    });

    useEffect(() => {
        fetchData();
    }, [caseId, supabase]);

    const fetchData = async () => {
        // Fetch case
        const { data: caseResult } = await supabase
            .from('cases')
            .select('*, employer:employers(*)')
            .eq('id', caseId)
            .single();

        if (caseResult) {
            setCaseData(caseResult);

            // Calculate compound amount
            if (caseResult.section_penalty && caseResult.offense_type) {
                const calc = calculateCompoundAmount(
                    caseResult.section_penalty,
                    caseResult.offense_type,
                    caseResult.arrears_amount
                );
                setCalculation(calc);
                setFormData((prev) => ({
                    ...prev,
                    amount: calc.recommendedAmount,
                }));
            }
        }

        // Fetch compound offers
        const { data: offersData, error } = await supabase
            .from('compound_offers')
            .select('*')
            .eq('case_id', caseId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching offers:', error);
        } else {
            setOffers(offersData || []);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const { data, error } = await supabase
                .from('compound_offers')
                .insert({
                    case_id: caseId,
                    offer_number: formData.offer_number,
                    offer_date: formData.offer_date,
                    due_date: formData.due_date,
                    amount: formData.amount,
                    status: 'pending',
                    notes: formData.notes || null,
                    created_by: profile?.id,
                })
                .select()
                .single();

            if (error) throw error;

            // Update case status to dikompaun
            await supabase
                .from('cases')
                .update({
                    status: 'dikompaun',
                    compound_amount: formData.amount,
                    compound_offer_date: formData.offer_date,
                })
                .eq('id', caseId);

            // Reset form
            setFormData({
                offer_number: generateCompoundOfferNumber(),
                offer_date: new Date().toISOString().split('T')[0],
                due_date: calculateDueDate(new Date().toISOString().split('T')[0], 14),
                amount: calculation?.recommendedAmount || 0,
                notes: '',
            });
            setShowAddForm(false);
            fetchData();
        } catch (error) {
            console.error('Error creating offer:', error);
            alert('Ralat semasa mencipta tawaran kompaun. Sila cuba lagi.');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePayment = async (offerId: string) => {
        const paidAmount = prompt('Masukkan jumlah yang dibayar:');
        const receiptNumber = prompt('Masukkan nombor resit (jika ada):');

        if (!paidAmount) return;

        const { error } = await supabase
            .from('compound_offers')
            .update({
                status: 'paid',
                paid_date: new Date().toISOString().split('T')[0],
                paid_amount: parseFloat(paidAmount),
                receipt_number: receiptNumber || null,
            })
            .eq('id', offerId);

        if (error) {
            alert('Ralat semasa mengemaskini bayaran.');
        } else {
            // Update case status to selesai
            await supabase
                .from('cases')
                .update({
                    status: 'selesai',
                    compound_payment_date: new Date().toISOString().split('T')[0],
                    compound_status: 'paid',
                })
                .eq('id', caseId);

            fetchData();
        }
    };

    const handleCancel = async (offerId: string) => {
        if (!confirm('Adakah anda pasti mahu membatalkan tawaran kompaun ini?')) return;

        const { error } = await supabase
            .from('compound_offers')
            .update({ status: 'cancelled' })
            .eq('id', offerId);

        if (error) {
            alert('Ralat semasa membatalkan tawaran.');
        } else {
            fetchData();
        }
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

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/cases/${caseId}`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Pengurusan Kompaun</h1>
                        <p className="text-gray-600">{caseData.case_number}</p>
                    </div>
                </div>
                {canEdit() && caseData.status === 'sanksi_diluluskan' && (
                    <Button onClick={() => setShowAddForm(!showAddForm)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Tawarkan Kompaun
                    </Button>
                )}
            </div>

            {/* Calculation Info */}
            {calculation && (
                <Card>
                    <CardHeader>
                        <CardTitle>Pengiraan Kompaun</CardTitle>
                        <CardDescription>
                            Jumlah kompaun dikira berdasarkan seksyen hukuman dan jenis kesalahan
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Jumlah Disyorkan</p>
                                <p className="text-xl font-bold text-blue-600">
                                    {formatCompoundAmount(calculation.recommendedAmount)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Jumlah Minimum</p>
                                <p className="text-lg font-semibold">
                                    {formatCompoundAmount(calculation.minAmount)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Jumlah Maksimum</p>
                                <p className="text-lg font-semibold">
                                    {formatCompoundAmount(calculation.maxCompound)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Denda Maksimum</p>
                                <p className="text-lg font-semibold">
                                    {formatCompoundAmount(calculation.baseAmount * 2)}
                                </p>
                            </div>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-blue-900 mb-2">Nota Pengiraan:</p>
                            <ul className="text-sm text-blue-700 space-y-1">
                                {calculation.calculationNotes.map((note, idx) => (
                                    <li key={idx}>• {note}</li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Add Offer Form */}
            {showAddForm && canEdit() && (
                <Card>
                    <CardHeader>
                        <CardTitle>Tawaran Kompaun Baru</CardTitle>
                        <CardDescription>
                            Cipta tawaran kompaun untuk kes ini
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Nombor Tawaran"
                                    value={formData.offer_number}
                                    onChange={(e) =>
                                        setFormData({ ...formData, offer_number: e.target.value })
                                    }
                                    required
                                />
                                <Input
                                    label="Jumlah Kompaun (RM)"
                                    type="number"
                                    step="0.01"
                                    min={calculation?.minAmount || 0}
                                    max={calculation?.maxCompound || 10000}
                                    value={formData.amount}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            amount: parseFloat(e.target.value) || 0,
                                        })
                                    }
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Tarikh Tawaran"
                                    type="date"
                                    value={formData.offer_date}
                                    onChange={(e) => {
                                        const newOfferDate = e.target.value;
                                        setFormData({
                                            ...formData,
                                            offer_date: newOfferDate,
                                            due_date: calculateDueDate(newOfferDate, 14),
                                        });
                                    }}
                                    required
                                />
                                <Input
                                    label="Tarikh Luput"
                                    type="date"
                                    value={formData.due_date}
                                    onChange={(e) =>
                                        setFormData({ ...formData, due_date: e.target.value })
                                    }
                                    required
                                />
                            </div>

                            <Textarea
                                label="Nota (Pilihan)"
                                value={formData.notes}
                                onChange={(e) =>
                                    setFormData({ ...formData, notes: e.target.value })
                                }
                                placeholder="Tambah nota untuk tawaran kompaun ini..."
                                rows={3}
                            />

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setFormData({
                                            offer_number: generateCompoundOfferNumber(),
                                            offer_date: new Date().toISOString().split('T')[0],
                                            due_date: calculateDueDate(
                                                new Date().toISOString().split('T')[0],
                                                14
                                            ),
                                            amount: calculation?.recommendedAmount || 0,
                                            notes: '',
                                        });
                                    }}
                                >
                                    Batal
                                </Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? 'Menyimpan...' : 'Cipta Tawaran Kompaun'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Offers List */}
            {offers.length === 0 ? (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center">
                            <DollarSign className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600">Tiada tawaran kompaun dijumpai</p>
                            {canEdit() && caseData.status === 'sanksi_diluluskan' && (
                                <Button className="mt-4" onClick={() => setShowAddForm(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Tawarkan Kompaun Pertama
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {offers.map((offer) => {
                        const expired = isCompoundExpired(offer.due_date);
                        const daysLeft = getDaysUntilExpiry(offer.due_date);

                        return (
                            <Card key={offer.id}>
                                <CardContent className="py-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50">
                                                <DollarSign className="h-6 w-6 text-green-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-semibold text-gray-900">
                                                        {offer.offer_number}
                                                    </p>
                                                    <Badge
                                                        className={
                                                            COMPOUND_STATUS_COLORS[offer.status] ||
                                                            'bg-gray-100 text-gray-800'
                                                        }
                                                    >
                                                        {COMPOUND_STATUS_LABELS[offer.status] ||
                                                            offer.status}
                                                    </Badge>
                                                    {expired && offer.status === 'pending' && (
                                                        <Badge className="bg-red-100 text-red-800">
                                                            Luput
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-2xl font-bold text-green-600 mb-2">
                                                    {formatCompoundAmount(offer.amount)}
                                                </p>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        Tawaran: {new Date(offer.offer_date).toLocaleDateString('ms-MY')}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        Luput: {new Date(offer.due_date).toLocaleDateString('ms-MY')}
                                                    </span>
                                                    {offer.status === 'pending' && !expired && (
                                                        <span className="text-yellow-600 font-medium">
                                                            {daysLeft} hari lagi
                                                        </span>
                                                    )}
                                                </div>
                                                {offer.paid_date && (
                                                    <div className="mt-2 text-sm text-gray-600">
                                                        <p>
                                                            Dibayar: {new Date(offer.paid_date).toLocaleDateString('ms-MY')} - {formatCompoundAmount(offer.paid_amount || 0)}
                                                        </p>
                                                        {offer.receipt_number && (
                                                            <p>Resit: {offer.receipt_number}</p>
                                                        )}
                                                    </div>
                                                )}
                                                {offer.notes && (
                                                    <p className="text-sm text-gray-600 mt-2 italic">
                                                        {offer.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {offer.status === 'pending' && canEdit() && (
                                                <>
                                                    {!expired && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handlePayment(offer.id)}
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                            Tandakan Dibayar
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleCancel(offer.id)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
