// ============================================
// PERKESO Prosecution System
// Evidence Management Page
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
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, FileText, Image, Video, Package, Trash2, Eye, Download } from 'lucide-react';
import Link from 'next/link';

interface Evidence {
    id: string;
    exhibit_number: string;
    name: string;
    description: string | null;
    document_type: string | null;
    collected_date: string | null;
    collected_location: string | null;
    file_url: string | null;
    file_type: string | null;
    status: string;
    created_at: string;
}

interface EvidencePageProps {
    params: Promise<{ id: string }>;
}

export default function EvidencePage({ params }: EvidencePageProps) {
    const { id: caseId } = use(params);
    const router = useRouter();
    const { profile, canEdit } = useAuth();
    const supabase = createClient();

    const [evidences, setEvidences] = useState<Evidence[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        exhibit_number: '',
        name: '',
        description: '',
        document_type: '',
        collected_date: '',
        collected_location: '',
    });

    useEffect(() => {
        fetchEvidences();
    }, [caseId, supabase]);

    const fetchEvidences = async () => {
        const { data, error } = await supabase
            .from('evidences')
            .select('*')
            .eq('case_id', caseId)
            .order('exhibit_number', { ascending: true });

        if (error) {
            console.error('Error fetching evidences:', error);
        } else {
            setEvidences(data || []);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);

        try {
            // Generate exhibit number if not provided
            let exhibitNumber = formData.exhibit_number;
            if (!exhibitNumber) {
                const count = evidences.length + 1;
                exhibitNumber = `E${count.toString().padStart(3, '0')}`;
            }

            const { data, error } = await supabase
                .from('evidences')
                .insert({
                    case_id: caseId,
                    exhibit_number: exhibitNumber,
                    name: formData.name,
                    description: formData.description || null,
                    document_type: formData.document_type || null,
                    collected_date: formData.collected_date || null,
                    collected_location: formData.collected_location || null,
                    collected_by: profile?.id,
                    status: 'collected',
                })
                .select()
                .single();

            if (error) throw error;

            // Reset form
            setFormData({
                exhibit_number: '',
                name: '',
                description: '',
                document_type: '',
                collected_date: '',
                collected_location: '',
            });
            setShowAddForm(false);
            fetchEvidences();
        } catch (error) {
            console.error('Error adding evidence:', error);
            alert('Ralat semasa menambah bukti. Sila cuba lagi.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Adakah anda pasti mahu memadamkan bukti ini?')) return;

        const { error } = await supabase
            .from('evidences')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Ralat semasa memadamkan bukti.');
        } else {
            fetchEvidences();
        }
    };

    const getEvidenceIcon = (type: string | null) => {
        if (!type) return <FileText className="h-5 w-5" />;
        if (type.includes('image') || type.includes('photo')) return <Image className="h-5 w-5" />;
        if (type.includes('video')) return <Video className="h-5 w-5" />;
        return <FileText className="h-5 w-5" />;
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
                        <h1 className="text-2xl font-bold text-gray-900">Pengurusan Bukti</h1>
                        <p className="text-gray-600">Senarai bukti dan eksibit untuk kes ini</p>
                    </div>
                </div>
                {canEdit() && (
                    <Button onClick={() => setShowAddForm(!showAddForm)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Bukti
                    </Button>
                )}
            </div>

            {/* Add Evidence Form */}
            {showAddForm && canEdit() && (
                <Card>
                    <CardHeader>
                        <CardTitle>Tambah Bukti Baru</CardTitle>
                        <CardDescription>
                            Masukkan maklumat bukti yang dikumpul
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="No. Eksibit"
                                    value={formData.exhibit_number}
                                    onChange={(e) =>
                                        setFormData({ ...formData, exhibit_number: e.target.value })
                                    }
                                    placeholder="E001 (kosongkan untuk auto-generate)"
                                />
                                <Input
                                    label="Nama Bukti"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    required
                                    placeholder="Cth: Daftar Pekerja, Slip Gaji, dll."
                                />
                            </div>

                            <Textarea
                                label="Keterangan"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                placeholder="Keterangan lanjut tentang bukti ini..."
                                rows={3}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    label="Jenis Dokumen"
                                    value={formData.document_type}
                                    onChange={(e) =>
                                        setFormData({ ...formData, document_type: e.target.value })
                                    }
                                    placeholder="Cth: Dokumen, Foto, Rakaman"
                                />
                                <Input
                                    label="Tarikh Disita"
                                    type="date"
                                    value={formData.collected_date}
                                    onChange={(e) =>
                                        setFormData({ ...formData, collected_date: e.target.value })
                                    }
                                />
                                <Input
                                    label="Lokasi Disita"
                                    value={formData.collected_location}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            collected_location: e.target.value,
                                        })
                                    }
                                    placeholder="Lokasi bukti dikumpul"
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setFormData({
                                            exhibit_number: '',
                                            name: '',
                                            description: '',
                                            document_type: '',
                                            collected_date: '',
                                            collected_location: '',
                                        });
                                    }}
                                >
                                    Batal
                                </Button>
                                <Button type="submit" disabled={uploading}>
                                    {uploading ? 'Menyimpan...' : 'Simpan Bukti'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Evidence List */}
            {evidences.length === 0 ? (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center">
                            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600">Tiada bukti dijumpai</p>
                            {canEdit() && (
                                <Button
                                    className="mt-4"
                                    onClick={() => setShowAddForm(true)}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Tambah Bukti Pertama
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {evidences.map((evidence) => (
                        <Card key={evidence.id}>
                            <CardContent className="py-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                                            {getEvidenceIcon(evidence.document_type)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-gray-900">
                                                    {evidence.exhibit_number}
                                                </span>
                                                <Badge variant="outline">{evidence.status}</Badge>
                                            </div>
                                            <p className="font-medium text-gray-900 mb-1">
                                                {evidence.name}
                                            </p>
                                            {evidence.description && (
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {evidence.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                {evidence.collected_date && (
                                                    <span>
                                                        Disita: {new Date(evidence.collected_date).toLocaleDateString('ms-MY')}
                                                    </span>
                                                )}
                                                {evidence.collected_location && (
                                                    <span>• {evidence.collected_location}</span>
                                                )}
                                                {evidence.document_type && (
                                                    <span>• {evidence.document_type}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {evidence.file_url && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => window.open(evidence.file_url!, '_blank')}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {canEdit() && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(evidence.id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
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
