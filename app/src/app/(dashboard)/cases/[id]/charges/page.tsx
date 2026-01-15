// ============================================
// PERKESO Prosecution System
// Charge Sheet & Court Filing Management
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
import { ArrowLeft, FileText, Calendar, Gavel, CheckCircle, Plus, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import ChargeSheet from '@/components/documents/ChargeSheet';
import { updateCaseStatus } from '@/app/actions/workflow-actions';

interface Charge {
    id: string;
    case_id: string;
    charge_number: string;
    charge_date: string;
    court_name: string;
    court_location: string;
    filing_date: string | null;
    first_hearing_date: string | null;
    status: 'draft' | 'filed' | 'hearing' | 'judgment' | 'completed';
    judgment_date: string | null;
    judgment_result: string | null;
    fine_amount: number | null;
    notes: string | null;
    created_at: string;
}

export default function ChargesPage() {
    const params = useParams();
    const caseId = params.id as string;
    const router = useRouter();
    const { profile, canEdit } = useAuth();
    const supabase = createClient();

    const [caseData, setCaseData] = useState<any>(null);
    const [employer, setEmployer] = useState<any>(null);
    const [employees, setEmployees] = useState<any[]>([]);
    const [charges, setCharges] = useState<Charge[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilingForm, setShowFilingForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Filing form state
    const [filingData, setFilingData] = useState({
        court_name: '',
        court_location: '',
        filing_date: new Date().toISOString().split('T')[0],
        first_hearing_date: '',
        notes: '',
    });

    useEffect(() => {
        fetchData();
    }, [caseId, supabase]);

    const fetchData = async () => {
        // Fetch case with employer
        const { data: caseResult } = await supabase
            .from('cases')
            .select('*, employer:employers(*)')
            .eq('id', caseId)
            .single();

        if (caseResult) {
            setCaseData(caseResult);
            setEmployer(caseResult.employer);
        }

        // Fetch employees
        const { data: employeesData } = await supabase
            .from('employees')
            .select('*')
            .eq('case_id', caseId);

        setEmployees(employeesData || []);

        // Fetch charges (if charges table exists)
        try {
            const { data: chargesData } = await supabase
                .from('charges')
                .select('*')
                .eq('case_id', caseId)
                .order('created_at', { ascending: false });

            setCharges(chargesData || []);
        } catch {
            // Charges table may not exist yet
            setCharges([]);
        }

        setLoading(false);
    };

    const handleFileCharge = async () => {
        if (!caseData) return;

        // Validasi tarikh pendengaran tidak boleh pada masa lampau
        if (filingData.first_hearing_date) {
            const hearingDate = new Date(filingData.first_hearing_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (hearingDate < today) {
                alert('Ralat: Tarikh pendengaran tidak boleh pada masa lampau.');
                return;
            }
        }

        setSubmitting(true);

        try {
            // Gunakan Server Action dengan validasi workflow
            const result = await updateCaseStatus(
                caseId,
                'didakwa',
                `Difailkan di ${filingData.court_name}. ${filingData.notes || ''}`
            );

            if (!result.success) {
                alert(`Ralat: ${result.error || result.message}`);
                return;
            }

            alert('Kes telah difailkan di mahkamah. Status kes telah dikemaskini kepada "Didakwa".');
            setShowFilingForm(false);
            fetchData();
        } catch (error) {
            console.error('Error filing charge:', error);
            alert('Ralat semasa memfailkan kes. Sila cuba lagi.');
        } finally {
            setSubmitting(false);
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

    // Check if case is ready for prosecution
    const canProsecute =
        caseData.status === 'sanksi_diluluskan' ||
        caseData.status === 'dikompaun' ||
        caseData.status === 'didakwa';

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href={`/cases/${caseId}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Kertas Pertuduhan & Pendakwaan</h1>
                    <p className="text-gray-600">{caseData.case_number}</p>
                </div>
            </div>

            {/* Charge Sheet Preview */}
            <Card>
                <CardHeader>
                    <CardTitle>Kertas Pertuduhan</CardTitle>
                    <CardDescription>
                        Semak kertas pertuduhan sebelum memfailkan di mahkamah
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {employer && caseData && (
                        <div className="border rounded-lg p-4 bg-gray-50">
                            <ChargeSheet
                                employer={{
                                    company_name: employer.company_name || employer.name || 'Majikan',
                                    ssm_number: employer.ssm_number || employer.ssm_no,
                                    address: employer.address,
                                    owner_name: employer.owner_name,
                                    owner_ic: employer.owner_ic,
                                    state: employer.state || 'Selangor',
                                }}
                                caseData={{
                                    case_number: caseData.case_number,
                                    act_type: caseData.act_type,
                                    offense_type: caseData.offense_type || 'Gagal Daftar Pekerja',
                                    date_of_offense: caseData.date_of_offense || caseData.inspection_date || new Date().toISOString(),
                                    time_of_offense: caseData.time_of_offense,
                                    location_of_offense: caseData.location_of_offense || caseData.inspection_location,
                                    section_charged: caseData.section_charged || 'Seksyen 5',
                                    section_penalty: caseData.section_penalty || 'Seksyen 94',
                                }}
                                employees={employees.map((e) => ({
                                    name: e.full_name,
                                    ic: e.ic_number || '',
                                }))}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Court Filing */}
            {canProsecute && (
                <Card>
                    <CardHeader>
                        <CardTitle>Failkan di Mahkamah</CardTitle>
                        <CardDescription>
                            Rekod maklumat pendakwaan di mahkamah
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!showFilingForm ? (
                            <div className="text-center py-8">
                                <Gavel className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-600 mb-4">
                                    Sediakan untuk memfailkan kes di mahkamah?
                                </p>
                                {canEdit() && (
                                    <Button onClick={() => setShowFilingForm(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Rekod Pendakwaan
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleFileCharge();
                                }}
                                className="space-y-4"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Nama Mahkamah"
                                        value={filingData.court_name}
                                        onChange={(e) =>
                                            setFilingData({
                                                ...filingData,
                                                court_name: e.target.value,
                                            })
                                        }
                                        placeholder="Cth: Mahkamah Majistret Petaling Jaya"
                                        required
                                    />
                                    <Input
                                        label="Lokasi Mahkamah"
                                        value={filingData.court_location}
                                        onChange={(e) =>
                                            setFilingData({
                                                ...filingData,
                                                court_location: e.target.value,
                                            })
                                        }
                                        placeholder="Cth: Petaling Jaya, Selangor"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Tarikh Fail"
                                        type="date"
                                        value={filingData.filing_date}
                                        onChange={(e) =>
                                            setFilingData({
                                                ...filingData,
                                                filing_date: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                    <Input
                                        label="Tarikh Pendengaran Pertama"
                                        type="date"
                                        value={filingData.first_hearing_date}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) =>
                                            setFilingData({
                                                ...filingData,
                                                first_hearing_date: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <Textarea
                                    label="Nota (Pilihan)"
                                    value={filingData.notes}
                                    onChange={(e) =>
                                        setFilingData({
                                            ...filingData,
                                            notes: e.target.value,
                                        })
                                    }
                                    placeholder="Tambah nota tentang pendakwaan..."
                                    rows={3}
                                />

                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setShowFilingForm(false);
                                            setFilingData({
                                                court_name: '',
                                                court_location: '',
                                                filing_date: new Date().toISOString().split('T')[0],
                                                first_hearing_date: '',
                                                notes: '',
                                            });
                                        }}
                                    >
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={submitting}>
                                        {submitting ? 'Memproses...' : 'Failkan di Mahkamah'}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Existing Charges */}
            {charges.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Rekod Pendakwaan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {charges.map((charge) => (
                                <div
                                    key={charge.id}
                                    className="p-4 border rounded-lg space-y-2"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold">{charge.charge_number}</p>
                                            <p className="text-sm text-gray-600">
                                                {charge.court_name} - {charge.court_location}
                                            </p>
                                        </div>
                                        <Badge>{charge.status}</Badge>
                                    </div>
                                    {charge.filing_date && (
                                        <p className="text-sm">
                                            Tarikh Fail: {new Date(charge.filing_date).toLocaleDateString('ms-MY')}
                                        </p>
                                    )}
                                    {charge.first_hearing_date && (
                                        <p className="text-sm">
                                            Pendengaran Pertama: {new Date(charge.first_hearing_date).toLocaleDateString('ms-MY')}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {!canProsecute && (
                <Card>
                    <CardContent className="py-8">
                        <div className="text-center">
                            <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600">
                                Kes ini belum sedia untuk pendakwaan. Status semasa: {caseData.status}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                Kes perlu dalam status "Sanksi Diluluskan" atau "Dikompaun" untuk memfailkan di mahkamah.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
