"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { ACT_TYPE_LABELS } from "@/lib/constants";
import { getOffenseOptions, getAutoFill, type ActKey } from "@/lib/laws";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

interface EditCasePageProps {
    params: Promise<{ id: string }>;
}

export default function EditCasePage({ params }: EditCasePageProps) {
    const { id } = use(params);
    const router = useRouter();
    const { profile } = useAuth();
    const supabase = createClient();

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Form state
    const [formData, setFormData] = useState({
        case_number: "",
        act_type: "akta_4" as ActKey,
        offense_type: "",
        section_charged: "",
        section_penalty: "",
        date_of_offense: "",
        inspection_date: "",
        inspection_location: "",
        issue_summary: "",
        notes: "",
    });

    useEffect(() => {
        const fetchCase = async () => {
            const { data, error } = await supabase
                .from("cases")
                .select("*")
                .eq("id", id)
                .single();

            if (error || !data) {
                console.error("Error fetching case:", error);
                router.push("/cases");
                return;
            }

            setFormData({
                case_number: data.case_number || "",
                act_type: data.act_type || "akta_4",
                offense_type: data.offense_type || "",
                section_charged: data.section_charged || "",
                section_penalty: data.section_penalty || "",
                date_of_offense: data.date_of_offense || "",
                inspection_date: data.inspection_date || "",
                inspection_location: data.inspection_location || "",
                issue_summary: data.issue_summary || "",
                notes: data.notes || "",
            });
            setInitialLoading(false);
        };

        fetchCase();
    }, [id, supabase, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Get auto-fill data for compound section
            const autoFill = getAutoFill(formData.act_type, formData.offense_type);
            const sectionCompound = autoFill?.compound_section || null;

            const { error: updateError } = await supabase
                .from("cases")
                .update({
                    act_type: formData.act_type,
                    offense_type: formData.offense_type,
                    date_of_offense: formData.date_of_offense,
                    section_charged: formData.section_charged,
                    section_penalty: formData.section_penalty,
                    section_compound: sectionCompound,
                    inspection_date: formData.inspection_date || null,
                    inspection_location: formData.inspection_location || null,
                    issue_summary: formData.issue_summary || null,
                    notes: formData.notes || null,
                })
                .eq("id", id);

            if (updateError) throw updateError;

            router.push(`/cases/${id}`);
        } catch (error: unknown) {
            console.error("Error updating case:", error);
            let errorMessage = "Ralat tidak diketahui";
            if (error && typeof error === 'object') {
                const err = error as { message?: string; details?: string; hint?: string };
                errorMessage = err.message || err.details || err.hint || JSON.stringify(error);
            }
            alert(`Ralat semasa mengemaskini kes: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href={`/cases/${id}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Kes</h1>
                    <p className="text-gray-600">{formData.case_number}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Maklumat Kes</CardTitle>
                        <CardDescription>
                            Kemaskini maklumat kes
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            label="Nombor Kes"
                            value={formData.case_number}
                            disabled
                        />

                        <Select
                            label="Jenis Akta"
                            value={formData.act_type}
                            onChange={(e) => {
                                const newActType = e.target.value as ActKey;
                                setFormData({
                                    ...formData,
                                    act_type: newActType,
                                    offense_type: "",
                                    section_charged: "",
                                    section_penalty: ""
                                });
                            }}
                            options={[
                                { value: "akta_4", label: "Akta 4 - Keselamatan Sosial Pekerja 1969" },
                                { value: "akta_800", label: "Akta 800 - Sistem Insurans Pekerjaan 2017" }
                            ]}
                            required
                        />

                        <Select
                            label="Jenis Kesalahan"
                            value={formData.offense_type}
                            onChange={(e) => {
                                const offenseKey = e.target.value;
                                const autoFill = getAutoFill(formData.act_type, offenseKey);
                                setFormData({
                                    ...formData,
                                    offense_type: offenseKey,
                                    section_charged: autoFill?.charge_section || "",
                                    section_penalty: autoFill?.penalty_section || ""
                                });
                            }}
                            options={[
                                { value: "", label: "-- Pilih Jenis Kesalahan --" },
                                ...getOffenseOptions(formData.act_type)
                            ]}
                            required
                        />

                        {/* Auto-filled Sections */}
                        {formData.section_charged && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div>
                                    <p className="text-sm text-blue-600 font-medium">Seksyen Pertuduhan</p>
                                    <p className="font-semibold text-blue-900">{formData.section_charged}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-blue-600 font-medium">Seksyen Hukuman</p>
                                    <p className="font-semibold text-blue-900">{formData.section_penalty}</p>
                                </div>
                            </div>
                        )}

                        <Input
                            label="Tarikh Kesalahan"
                            type="date"
                            value={formData.date_of_offense}
                            onChange={(e) =>
                                setFormData({ ...formData, date_of_offense: e.target.value })
                            }
                            required
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Tarikh Pemeriksaan"
                                type="date"
                                value={formData.inspection_date}
                                onChange={(e) =>
                                    setFormData({ ...formData, inspection_date: e.target.value })
                                }
                            />
                            <Input
                                label="Lokasi Pemeriksaan"
                                value={formData.inspection_location}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        inspection_location: e.target.value,
                                    })
                                }
                                placeholder="Alamat atau lokasi premis"
                            />
                        </div>

                        <Textarea
                            label="Ringkasan Isu"
                            value={formData.issue_summary}
                            onChange={(e) =>
                                setFormData({ ...formData, issue_summary: e.target.value })
                            }
                            placeholder="Nyatakan isu utama yang dijumpai semasa pemeriksaan"
                            rows={4}
                        />

                        <Textarea
                            label="Nota Tambahan"
                            value={formData.notes}
                            onChange={(e) =>
                                setFormData({ ...formData, notes: e.target.value })
                            }
                            placeholder="Sebarang nota tambahan untuk rujukan"
                            rows={3}
                        />
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Link href={`/cases/${id}`}>
                            <Button type="button" variant="outline">
                                Batal
                            </Button>
                        </Link>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Simpan Perubahan
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
