"use client";

import { useAuth } from "@/hooks/use-auth";
import { useCases } from "@/hooks/use-cases";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CASE_STATUS_LABELS, USER_ROLE_LABELS } from "@/lib/constants";
import Link from "next/link";
import {
    FolderOpen,
    FileText,
    Clock,
    CheckCircle,
    AlertTriangle,
    Plus,
    ArrowRight,
} from "lucide-react";

export default function DashboardPage() {
    const { profile, loading: authLoading, canEdit } = useAuth();
    const { cases, loading: casesLoading } = useCases();

    const stats = {
        total: cases.length,
        draft: cases.filter((c) => c.status === "draf").length,
        dalamSiasatan: cases.filter((c) => c.status === "dalam_siasatan").length,
        pendingReview: cases.filter((c) => c.status === "menunggu_semakan").length,
        pendingSanction: cases.filter((c) => c.status === "menunggu_sanksi").length,
        selesai: cases.filter((c) => c.status === "selesai").length,
    };

    const recentCases = cases.slice(0, 5);

    if (authLoading || casesLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Welcome Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Selamat Datang, {profile?.full_name || "Pengguna"}
                    </h1>
                    <p className="text-gray-600">
                        {profile ? USER_ROLE_LABELS[profile.role] : ""} • Sistem Prosecution Paper Builder
                    </p>
                </div>
                {canEdit() && (
                    <Link href="/cases/new">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Kes Baru
                        </Button>
                    </Link>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                                <FolderOpen className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Jumlah Kes</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                                <FileText className="h-6 w-6 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Draf</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                                <Clock className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Dalam Siasatan</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.dalamSiasatan}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Menunggu Semakan</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.pendingReview}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Selesai</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.selesai}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Cases */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Kes Terkini</CardTitle>
                    <Link href="/cases">
                        <Button variant="ghost" size="sm">
                            Lihat Semua
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    {recentCases.length === 0 ? (
                        <div className="text-center py-8">
                            <FolderOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600">Tiada kes dijumpai</p>
                            {canEdit() && (
                                <Link href="/cases/new">
                                    <Button variant="outline" className="mt-4">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Buat Kes Pertama
                                    </Button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentCases.map((caseItem) => (
                                <Link
                                    key={caseItem.id}
                                    href={`/cases/${caseItem.id}`}
                                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                                            <FileText className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {caseItem.case_number}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {caseItem.employer?.name || "Majikan tidak ditetapkan"}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge
                                        variant={
                                            caseItem.status === "sanksi_diluluskan" || caseItem.status === "selesai"
                                                ? "success"
                                                : caseItem.status === "menunggu_semakan" || caseItem.status === "menunggu_sanksi"
                                                    ? "warning"
                                                    : "secondary"
                                        }
                                    >
                                        {CASE_STATUS_LABELS[caseItem.status] || caseItem.status}
                                    </Badge>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <Link href="/cases/new">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                                    <Plus className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Buat Kes Baru</p>
                                    <p className="text-sm text-gray-500">Mulakan siasatan baru</p>
                                </div>
                            </div>
                        </CardContent>
                    </Link>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <Link href="/cases?status=pending_review">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Semakan Tertunda</p>
                                    <p className="text-sm text-gray-500">
                                        {stats.pendingReview} kes menunggu
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Link>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <Link href="/cases">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                                    <FolderOpen className="h-5 w-5 text-gray-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Semua Kes</p>
                                    <p className="text-sm text-gray-500">Lihat senarai penuh</p>
                                </div>
                            </div>
                        </CardContent>
                    </Link>
                </Card>
            </div>
        </div>
    );
}
