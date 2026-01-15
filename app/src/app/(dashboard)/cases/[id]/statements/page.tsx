// ============================================
// PERKESO Prosecution System
// Statement Recording Page (S.112/12C/70)
// ============================================

'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, FileText, CheckCircle, XCircle, User, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Statement {
    id: string;
    person_name: string;
    person_ic: string | null;
    person_role: string | null;
    statement_date: string;
    statement_time: string | null;
    location: string | null;
    section_reference: string | null;
    content: string | null;
    summary: string | null;
    language: string;
    interpreter_name: string | null;
    is_signed: boolean;
    created_at: string;
}

interface StatementsPageProps {
    params: Promise<{ id: string }>;
}

export default function StatementsPage({ params }: StatementsPageProps) {
    const { id: caseId } = use(params);
    const router = useRouter();
    const { profile, canEdit } = useAuth();
    const supabase = createClient();

    const [statements, setStatements] = useState<Statement[]>([]);
    const [caseData, setCaseData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        person_name: '',
        person_ic: '',
        person_role: 'saksi',
        statement_date: new Date().toISOString().split('T')[0],
        statement_time: '',
        location: '',
        section_reference: '',
        content: '',
        summary: '',
        language: 'bm',
        interpreter_name: '',
        is_signed: false,
    });

    useEffect(() => {
        fetchData();
    }, [caseId, supabase]);

    const fetchData = async () => {
        // Fetch case to get act_type for section reference
        const { data: caseResult } = await supabase
            .from('cases')
            .select('act_type')
            .eq('id', caseId)
            .single();

        if (caseResult) {
            setCaseData(caseResult);
            // Auto-set section reference based on act type
            if (!formData.section_reference) {
                const sectionRef =
                    caseResult.act_type === 'akta_4' || caseResult.act_type === 'akta4'
                        ? 'Seksyen 12C'
                        : 'Seksyen 69 & 70';
                setFormData((prev) => ({ ...prev, section_reference: sectionRef }));
            }
        }

        // Fetch statements
        const { data, error } = await supabase
            .from('statements')
            .select('*')
            .eq('case_id', caseId)
            .order('statement_date', { ascending: false });

        if (error) {
            console.error('Error fetching statements:', error);
        } else {
            setStatements(data || []);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const { data, error } = await supabase
                .from('statements')
                .insert({
                    case_id: caseId,
                    person_name: formData.person_name,
                    person_ic: formData.person_ic || null,
                    person_role: formData.person_role,
                    statement_date: formData.statement_date,
                    statement_time: formData.statement_time || null,
                    location: formData.location || null,
                    section_reference: formData.section_reference || null,
                    content: formData.content || null,
                    summary: formData.summary || null,
                    language: formData.language,
                    interpreter_name: formData.interpreter_name || null,
                    is_signed: formData.is_signed,
                    recorded_by: profile?.id,
                })
                .select()
                .single();

            if (error) throw error;

            // Reset form
            setFormData({
                person_name: '',
                person_ic: '',
                person_role: 'saksi',
                statement_date: new Date().toISOString().split('T')[0],
                statement_time: '',
                location: '',
                section_reference: caseData?.act_type === 'akta_4' || caseData?.act_type === 'akta4' ? 'Seksyen 12C' : 'Seksyen 69 & 70',
                content: '',
                summary: '',
                language: 'bm',
                interpreter_name: '',
                is_signed: false,
            });
            setShowAddForm(false);
            fetchData();
        } catch (error) {
            console.error('Error adding statement:', error);
            alert('Ralat semasa menambah pernyataan. Sila cuba lagi.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Adakah anda pasti mahu memadamkan pernyataan ini?')) return;

        const { error } = await supabase
            .from('statements')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Ralat semasa memadamkan pernyataan.');
        } else {
            fetchData();
        }
    };

    const handleToggleSigned = async (id: string, currentSigned: boolean) => {
        const { error } = await supabase
            .from('statements')
            .update({ is_signed: !currentSigned })
            .eq('id', id);

        if (error) {
            alert('Ralat semasa mengemaskini status tandatangan.');
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
                        <h1 className="text-2xl font-bold text-gray-900">Rakaman Percakapan</h1>
                        <p className="text-gray-600">
                            Pernyataan di bawah {caseData?.act_type === 'akta_4' || caseData?.act_type === 'akta4' ? 'Seksyen 12C' : 'Seksyen 69 & 70'}
                        </p>
                    </div>
                </div>
                {canEdit() && (
                    <Button onClick={() => setShowAddForm(!showAddForm)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Pernyataan
                    </Button>
                )}
            </div>

            {/* Add Statement Form */}
            {showAddForm && canEdit() && (
                <Card>
                    <CardHeader>
                        <CardTitle>Tambah Pernyataan Baru</CardTitle>
                        <CardDescription>
                            Rakam pernyataan saksi, pekerja, atau wakil majikan
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Nama Pemberi Pernyataan"
                                    value={formData.person_name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, person_name: e.target.value })
                                    }
                                    required
                                />
                                <Input
                                    label="No. KP"
                                    value={formData.person_ic}
                                    onChange={(e) =>
                                        setFormData({ ...formData, person_ic: e.target.value })
                                    }
                                    placeholder="950312-14-5432"
                                />
                            </div>

                            <Select
                                label="Peranan"
                                value={formData.person_role}
                                onChange={(e) =>
                                    setFormData({ ...formData, person_role: e.target.value })
                                }
                                options={[
                                    { value: 'saksi', label: 'Saksi' },
                                    { value: 'pekerja', label: 'Pekerja' },
                                    { value: 'oks', label: 'OKS (Orang Kena Saman)' },
                                    { value: 'wakil_majikan', label: 'Wakil Majikan' },
                                ]}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    label="Tarikh Rakaman"
                                    type="date"
                                    value={formData.statement_date}
                                    onChange={(e) =>
                                        setFormData({ ...formData, statement_date: e.target.value })
                                    }
                                    required
                                />
                                <Input
                                    label="Masa Rakaman"
                                    type="time"
                                    value={formData.statement_time}
                                    onChange={(e) =>
                                        setFormData({ ...formData, statement_time: e.target.value })
                                    }
                                />
                                <Input
                                    label="Lokasi"
                                    value={formData.location}
                                    onChange={(e) =>
                                        setFormData({ ...formData, location: e.target.value })
                                    }
                                    placeholder="Lokasi rakaman"
                                />
                            </div>

                            <Input
                                label="Rujukan Seksyen"
                                value={formData.section_reference}
                                onChange={(e) =>
                                    setFormData({ ...formData, section_reference: e.target.value })
                                }
                                placeholder={
                                    caseData?.act_type === 'akta_4' || caseData?.act_type === 'akta4'
                                        ? 'Seksyen 12C'
                                        : 'Seksyen 69 & 70'
                                }
                            />

                            <Textarea
                                label="Kandungan Pernyataan"
                                value={formData.content}
                                onChange={(e) =>
                                    setFormData({ ...formData, content: e.target.value })
                                }
                                placeholder="Rakam kandungan pernyataan di sini..."
                                rows={8}
                            />

                            <Textarea
                                label="Ringkasan"
                                value={formData.summary}
                                onChange={(e) =>
                                    setFormData({ ...formData, summary: e.target.value })
                                }
                                placeholder="Ringkasan pernyataan..."
                                rows={3}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Select
                                    label="Bahasa"
                                    value={formData.language}
                                    onChange={(e) =>
                                        setFormData({ ...formData, language: e.target.value })
                                    }
                                    options={[
                                        { value: 'bm', label: 'Bahasa Melayu' },
                                        { value: 'en', label: 'English' },
                                        { value: 'zh', label: '中文' },
                                        { value: 'ta', label: 'தமிழ்' },
                                    ]}
                                />
                                <Input
                                    label="Nama Jurubahasa (jika ada)"
                                    value={formData.interpreter_name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            interpreter_name: e.target.value,
                                        })
                                    }
                                    placeholder="Nama jurubahasa jika diperlukan"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_signed"
                                    checked={formData.is_signed}
                                    onChange={(e) =>
                                        setFormData({ ...formData, is_signed: e.target.checked })
                                    }
                                    className="h-4 w-4"
                                />
                                <label htmlFor="is_signed" className="text-sm text-gray-700">
                                    Pernyataan telah ditandatangan
                                </label>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setFormData({
                                            person_name: '',
                                            person_ic: '',
                                            person_role: 'saksi',
                                            statement_date: new Date().toISOString().split('T')[0],
                                            statement_time: '',
                                            location: '',
                                            section_reference: caseData?.act_type === 'akta_4' || caseData?.act_type === 'akta4' ? 'Seksyen 12C' : 'Seksyen 69 & 70',
                                            content: '',
                                            summary: '',
                                            language: 'bm',
                                            interpreter_name: '',
                                            is_signed: false,
                                        });
                                    }}
                                >
                                    Batal
                                </Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? 'Menyimpan...' : 'Simpan Pernyataan'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Statements List */}
            {statements.length === 0 ? (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center">
                            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600">Tiada pernyataan dijumpai</p>
                            {canEdit() && (
                                <Button className="mt-4" onClick={() => setShowAddForm(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Tambah Pernyataan Pertama
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {statements.map((statement) => (
                        <Card key={statement.id}>
                            <CardContent className="py-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50">
                                            <User className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-semibold text-gray-900">
                                                    {statement.person_name}
                                                </p>
                                                <Badge variant="outline">
                                                    {statement.person_role || 'saksi'}
                                                </Badge>
                                                {statement.is_signed && (
                                                    <Badge variant="success" className="bg-green-100 text-green-800">
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        Ditandatangan
                                                    </Badge>
                                                )}
                                            </div>
                                            {statement.person_ic && (
                                                <p className="text-sm text-gray-600 mb-2">
                                                    No. KP: {statement.person_ic}
                                                </p>
                                            )}
                                            {statement.summary && (
                                                <p className="text-sm text-gray-700 mb-2">
                                                    {statement.summary}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                {statement.statement_date && (
                                                    <span>
                                                        Tarikh: {new Date(statement.statement_date).toLocaleDateString('ms-MY')}
                                                    </span>
                                                )}
                                                {statement.section_reference && (
                                                    <span>• {statement.section_reference}</span>
                                                )}
                                                {statement.language && (
                                                    <span>• Bahasa: {statement.language === 'bm' ? 'BM' : statement.language.toUpperCase()}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {canEdit() && (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleToggleSigned(statement.id, statement.is_signed)
                                                    }
                                                >
                                                    {statement.is_signed ? (
                                                        <XCircle className="h-4 w-4 text-gray-400" />
                                                    ) : (
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(statement.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
