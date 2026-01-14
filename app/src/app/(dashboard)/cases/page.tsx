"use client";

import { useCases } from "@/hooks/use-cases";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CASE_STATUS_LABELS, ACT_TYPE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";
import {
    Plus,
    Search,
    FileText,
    Filter,
    MoreVertical,
    Eye,
    Pencil,
    Trash2,
} from "lucide-react";

export default function CasesPage() {
    const { cases, loading, deleteCase } = useCases();
    const { canEdit } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const filteredCases = cases.filter((caseItem) => {
        const matchesSearch =
            caseItem.case_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            caseItem.employer?.name?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
            statusFilter === "all" || caseItem.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleDelete = async (id: string) => {
        if (confirm("Adakah anda pasti mahu memadamkan kes ini?")) {
            await deleteCase(id);
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
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Senarai Kes</h1>
                    <p className="text-gray-600">
                        Urus dan pantau semua kes pendakwaan
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

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Cari nombor kes atau nama majikan..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Semua Status</option>
                                <option value="draft">Draf</option>
                                <option value="in_progress">Dalam Proses</option>
                                <option value="pending_review">Menunggu Semakan</option>
                                <option value="approved">Diluluskan</option>
                                <option value="filed">Difailkan</option>
                                <option value="closed">Ditutup</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Cases List */}
            {filteredCases.length === 0 ? (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center">
                            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Tiada kes dijumpai
                            </h3>
                            <p className="text-gray-600 mb-4">
                                {searchQuery || statusFilter !== "all"
                                    ? "Cuba ubah carian atau penapis anda"
                                    : "Mulakan dengan membuat kes pertama"}
                            </p>
                            {canEdit() && (
                                <Link href="/cases/new">
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Buat Kes Baru
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {filteredCases.map((caseItem) => (
                        <Card
                            key={caseItem.id}
                            className="hover:shadow-md transition-shadow"
                        >
                            <CardContent className="py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                                            <FileText className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/cases/${caseItem.id}`}
                                                    className="font-semibold text-gray-900 hover:text-blue-600"
                                                >
                                                    {caseItem.case_number}
                                                </Link>
                                                <Badge
                                                    variant={
                                                        caseItem.status === "approved"
                                                            ? "success"
                                                            : caseItem.status === "pending_review"
                                                                ? "warning"
                                                                : caseItem.status === "draft"
                                                                    ? "secondary"
                                                                    : "default"
                                                    }
                                                >
                                                    {CASE_STATUS_LABELS[caseItem.status]}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {caseItem.employer?.name || "Majikan tidak ditetapkan"}
                                            </p>
                                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                                <span>{ACT_TYPE_LABELS[caseItem.act_type]}</span>
                                                {caseItem.inspection_date && (
                                                    <span>
                                                        Pemeriksaan: {formatDate(caseItem.inspection_date)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link href={`/cases/${caseItem.id}`}>
                                            <Button variant="ghost" size="sm">
                                                <Eye className="h-4 w-4 mr-1" />
                                                Lihat
                                            </Button>
                                        </Link>
                                        {canEdit() && (
                                            <>
                                                <Link href={`/cases/${caseItem.id}/edit`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Pencil className="h-4 w-4 mr-1" />
                                                        Edit
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(caseItem.id)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

            {/* Summary */}
            <div className="text-sm text-gray-500 text-center">
                Menunjukkan {filteredCases.length} daripada {cases.length} kes
            </div>
        </div>
    );
}
