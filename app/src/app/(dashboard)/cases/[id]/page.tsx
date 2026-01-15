"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CASE_STATUS_LABELS, ACT_TYPE_LABELS, USER_ROLE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import type { Case, Person } from "@/types";
import StatusChange from "@/components/workflow/StatusChange";
import Timeline from "@/components/workflow/Timeline";
import {
    ArrowLeft,
    Pencil,
    Trash2,
    FileText,
    Building2,
    Calendar,
    MapPin,
    User,
    Users,
    Plus,
    Clock,
    AlertCircle,
    Package,
    Scale,
    DollarSign,
    Gavel,
} from "lucide-react";

interface CaseDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function CaseDetailPage({ params }: CaseDetailPageProps) {
    const { id } = use(params);
    const router = useRouter();
    const { canEdit, profile } = useAuth();
    const supabase = createClient();

    const [caseData, setCaseData] = useState<Case | null>(null);
    const [persons, setPersons] = useState<Person[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCase = async () => {
            const { data, error } = await supabase
                .from("cases")
                .select(`
          *,
          employer:employers(*),
          io:profiles!cases_io_id_fkey(*)
        `)
                .eq("id", id)
                .single();

            if (error) {
                console.error("Error fetching case:", error);
                router.push("/cases");
                return;
            }

            setCaseData(data);

            // Fetch persons
            const { data: personsData } = await supabase
                .from("persons")
                .select("*")
                .eq("case_id", id);

            setPersons(personsData || []);
            setLoading(false);
        };

        fetchCase();
    }, [id, supabase, router]);

    const handleDelete = async () => {
        if (!confirm("Adakah anda pasti mahu memadamkan kes ini? Tindakan ini tidak boleh dibatalkan.")) {
            return;
        }

        const { error } = await supabase.from("cases").delete().eq("id", id);

        if (error) {
            alert("Ralat semasa memadamkan kes.");
            return;
        }

        router.push("/cases");
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
                <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Kes Tidak Dijumpai</h2>
                <p className="text-gray-600 mb-4">Kes yang anda cari tidak wujud.</p>
                <Link href="/cases">
                    <Button>Kembali ke Senarai</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/cases">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {caseData.case_number}
                            </h1>
                            <Badge
                                variant={
                                    caseData.status === "sanksi_diluluskan" || caseData.status === "selesai"
                                        ? "success"
                                        : caseData.status === "menunggu_semakan" || caseData.status === "menunggu_sanksi"
                                            ? "warning"
                                            : "secondary"
                                }
                            >
                                {CASE_STATUS_LABELS[caseData.status] || caseData.status}
                            </Badge>
                        </div>
                        <p className="text-gray-600">{ACT_TYPE_LABELS[caseData.act_type]}</p>
                    </div>
                </div>
                {canEdit() && (
                    <div className="flex gap-2">
                        <Link href={`/cases/${id}/documents`}>
                            <Button variant="default">
                                <FileText className="h-4 w-4 mr-2" />
                                Lihat Dokumen
                            </Button>
                        </Link>
                        <Link href={`/cases/${id}/edit`}>
                            <Button variant="outline">
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        </Link>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Padam
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Case Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Maklumat Kes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Tarikh Pemeriksaan</p>
                                        <p className="font-medium">
                                            {caseData.inspection_date
                                                ? formatDate(caseData.inspection_date)
                                                : "Belum ditetapkan"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Lokasi Pemeriksaan</p>
                                        <p className="font-medium">
                                            {caseData.inspection_location || "Belum ditetapkan"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {caseData.issue_summary && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Ringkasan Isu</p>
                                    <p className="text-gray-900">{caseData.issue_summary}</p>
                                </div>
                            )}

                            {caseData.notes && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Nota</p>
                                    <p className="text-gray-900">{caseData.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Employer Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Maklumat Majikan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {caseData.employer ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Nama Majikan</p>
                                        <p className="font-medium">{caseData.employer.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">No. SSM</p>
                                        <p className="font-medium">
                                            {caseData.employer.ssm_no || "-"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Alamat</p>
                                        <p className="font-medium">
                                            {caseData.employer.address || "-"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">No. Telefon</p>
                                        <p className="font-medium">
                                            {caseData.employer.phone || "-"}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500">Maklumat majikan tidak tersedia</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    {canEdit() && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Tindakan Pantas</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <Link href={`/cases/${id}/evidence`}>
                                    <Button variant="outline" size="sm" className="w-full justify-start">
                                        <Package className="h-4 w-4 mr-2" />
                                        Bukti
                                    </Button>
                                </Link>
                                <Link href={`/cases/${id}/statements`}>
                                    <Button variant="outline" size="sm" className="w-full justify-start">
                                        <FileText className="h-4 w-4 mr-2" />
                                        Pernyataan
                                    </Button>
                                </Link>
                                <Link href={`/cases/${id}/documents`}>
                                    <Button variant="outline" size="sm" className="w-full justify-start">
                                        <FileText className="h-4 w-4 mr-2" />
                                        Dokumen
                                    </Button>
                                </Link>
                                {caseData.status === 'menunggu_semakan' && (
                                    <Link href={`/cases/${id}/review`}>
                                        <Button variant="outline" size="sm" className="w-full justify-start">
                                            <FileText className="h-4 w-4 mr-2" />
                                            Semakan
                                        </Button>
                                    </Link>
                                )}
                                {caseData.status === 'menunggu_sanksi' && (
                                    <Link href={`/cases/${id}/sanction`}>
                                        <Button variant="outline" size="sm" className="w-full justify-start">
                                            <Scale className="h-4 w-4 mr-2" />
                                            Sanksi
                                        </Button>
                                    </Link>
                                )}
                                {(caseData.status === 'sanksi_diluluskan' || caseData.status === 'dikompaun') && (
                                    <Link href={`/cases/${id}/compound`}>
                                        <Button variant="outline" size="sm" className="w-full justify-start">
                                            <DollarSign className="h-4 w-4 mr-2" />
                                            Kompaun
                                        </Button>
                                    </Link>
                                )}
                                {(caseData.status === 'sanksi_diluluskan' || caseData.status === 'dikompaun' || caseData.status === 'didakwa') && (
                                    <Link href={`/cases/${id}/charges`}>
                                        <Button variant="outline" size="sm" className="w-full justify-start">
                                            <Gavel className="h-4 w-4 mr-2" />
                                            Pendakwaan
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Persons */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Saksi / OKS / Pekerja
                            </CardTitle>
                            {canEdit() && (
                                <Button variant="outline" size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Tambah
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            {persons.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">
                                    Tiada rekod saksi/OKS/pekerja
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {persons.map((person) => (
                                        <div
                                            key={person.id}
                                            className="flex items-center justify-between p-3 rounded-lg border border-gray-200"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                                                    <User className="h-5 w-5 text-gray-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{person.name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {person.ic_number} • {person.role}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant="outline">{person.role}</Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Status Card with Workflow */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Status Kes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Status Semasa</span>
                                <Badge
                                    variant={
                                        caseData.status === "sanksi_diluluskan" || caseData.status === "selesai" ? "success" : "secondary"
                                    }
                                >
                                    {CASE_STATUS_LABELS[caseData.status]}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Jenis Akta</span>
                                <span className="font-medium">
                                    {ACT_TYPE_LABELS[caseData.act_type]}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Workflow Status Change Component */}
                    <StatusChange
                        caseId={id}
                        currentStatus={caseData.status as any}
                        onStatusChange={(newStatus) => {
                            // Refresh page to show new status
                            window.location.reload();
                        }}
                    />

                    {/* IO Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Pegawai Penyiasat</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {caseData.io ? (
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                        <User className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{caseData.io.full_name}</p>
                                        <p className="text-sm text-gray-500">
                                            {USER_ROLE_LABELS[caseData.io.role]}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500">Tidak ditetapkan</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Workflow Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Garis Masa Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Timeline caseId={id} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
