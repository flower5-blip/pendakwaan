"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { generateCaseNumber } from "@/lib/utils";
import { ACT_TYPE_LABELS } from "@/lib/constants";
import { OFFENSE_MAPPING, getOffenseOptions, getAutoFill, type ActKey } from "@/lib/laws";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Employer } from "@/types";

const actTypeOptions = Object.entries(ACT_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
}));

export default function NewCasePage() {
    const router = useRouter();
    const { profile } = useAuth();
    const supabase = createClient();

    const [loading, setLoading] = useState(false);
    const [employers, setEmployers] = useState<Employer[]>([]);
    const [step, setStep] = useState(1);

    // Form state
    const [formData, setFormData] = useState({
        case_number: generateCaseNumber(),
        act_type: "akta_4" as ActKey,
        offense_type: "",
        section_charged: "",
        section_penalty: "",
        date_of_offense: "",
        inspection_date: "",
        inspection_location: "",
        issue_summary: "",
        notes: "",
        // Employer fields (for new employer)
        employer_id: "",
        employer_name: "",
        employer_ssm: "",
        employer_address: "",
        employer_phone: "",
        employer_email: "",
        employer_business_type: "",
    });

    const [createNewEmployer, setCreateNewEmployer] = useState(true);

    useEffect(() => {
        const fetchEmployers = async () => {
            const { data } = await supabase
                .from("employers")
                .select("*")
                .order("name");
            if (data) setEmployers(data);
        };
        fetchEmployers();
    }, [supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let employerId = formData.employer_id;

            // Create new employer if needed
            if (createNewEmployer && formData.employer_name) {
                const { data: newEmployer, error: employerError } = await supabase
                    .from("employers")
                    .insert({
                        name: formData.employer_name,
                        ssm_no: formData.employer_ssm,
                        address: formData.employer_address,
                        phone: formData.employer_phone,
                        email: formData.employer_email,
                        business_type: formData.employer_business_type,
                    })
                    .select()
                    .single();

                if (employerError) throw employerError;
                employerId = newEmployer.id;
            }

            // Validate required prosecution fields
            if (!formData.offense_type || !formData.section_charged || !formData.section_penalty || !formData.date_of_offense) {
                alert("Sila lengkapkan semua maklumat kesalahan yang diperlukan (Jenis Kesalahan, Seksyen, dan Tarikh Kesalahan).");
                setLoading(false);
                return;
            }

            // Get auto-fill data for compound section (if not already set)
            const autoFill = getAutoFill(formData.act_type, formData.offense_type);
            const sectionCompound = autoFill?.compound_section || null;

            // Create case with all prosecution fields
            const { data: newCase, error: caseError } = await supabase
                .from("cases")
                .insert({
                    case_number: formData.case_number,
                    employer_id: employerId || null,
                    io_id: profile?.id,
                    status: "draft",
                    act_type: formData.act_type,
                    // Prosecution fields - CRITICAL FIX: Save all collected data
                    offense_type: formData.offense_type,
                    date_of_offense: formData.date_of_offense,
                    section_charged: formData.section_charged,
                    section_penalty: formData.section_penalty,
                    section_compound: sectionCompound,
                    // Investigation fields
                    inspection_date: formData.inspection_date || null,
                    inspection_location: formData.inspection_location || null,
                    issue_summary: formData.issue_summary || null,
                    notes: formData.notes || null,
                    created_by: profile?.id,
                })
                .select()
                .single();

            if (caseError) throw caseError;

            router.push(`/cases/${newCase.id}`);
        } catch (error) {
            console.error("Error creating case:", error);
            alert("Ralat semasa membuat kes. Sila cuba lagi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/cases">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Kes Baru</h1>
                    <p className="text-gray-600">Buat kes pendakwaan baru</p>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-4">
                {[1, 2, 3].map((s) => (
                    <div
                        key={s}
                        className={`flex items-center gap-2 ${s <= step ? "text-blue-600" : "text-gray-400"
                            }`}
                    >
                        <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${s === step
                                ? "bg-blue-600 text-white"
                                : s < step
                                    ? "bg-blue-100 text-blue-600"
                                    : "bg-gray-100 text-gray-400"
                                }`}
                        >
                            {s}
                        </div>
                        <span className="hidden md:block text-sm font-medium">
                            {s === 1 ? "Maklumat Kes" : s === 2 ? "Maklumat Majikan" : "Ringkasan"}
                        </span>
                        {s < 3 && <div className="w-8 h-px bg-gray-300" />}
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit}>
                {/* Step 1: Case Information */}
                {step === 1 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Maklumat Kes</CardTitle>
                            <CardDescription>
                                Masukkan maklumat asas berkaitan kes
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                label="Nombor Kes"
                                value={formData.case_number}
                                onChange={(e) =>
                                    setFormData({ ...formData, case_number: e.target.value })
                                }
                                required
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
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Button type="button" onClick={() => setStep(2)}>
                                Seterusnya
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                {/* Step 2: Employer Information */}
                {step === 2 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Maklumat Majikan</CardTitle>
                            <CardDescription>
                                Pilih majikan sedia ada atau buat rekod baru
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-4 mb-4">
                                <Button
                                    type="button"
                                    variant={createNewEmployer ? "default" : "outline"}
                                    onClick={() => setCreateNewEmployer(true)}
                                >
                                    Majikan Baru
                                </Button>
                                <Button
                                    type="button"
                                    variant={!createNewEmployer ? "default" : "outline"}
                                    onClick={() => setCreateNewEmployer(false)}
                                >
                                    Majikan Sedia Ada
                                </Button>
                            </div>

                            {createNewEmployer ? (
                                <>
                                    <Input
                                        label="Nama Majikan"
                                        value={formData.employer_name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, employer_name: e.target.value })
                                        }
                                        required
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="No. SSM"
                                            value={formData.employer_ssm}
                                            onChange={(e) =>
                                                setFormData({ ...formData, employer_ssm: e.target.value })
                                            }
                                            placeholder="123456-A"
                                        />
                                        <Input
                                            label="Jenis Perniagaan"
                                            value={formData.employer_business_type}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    employer_business_type: e.target.value,
                                                })
                                            }
                                            placeholder="Sdn. Bhd., Enterprise, dll."
                                        />
                                    </div>
                                    <Textarea
                                        label="Alamat"
                                        value={formData.employer_address}
                                        onChange={(e) =>
                                            setFormData({ ...formData, employer_address: e.target.value })
                                        }
                                        placeholder="Alamat penuh majikan"
                                        rows={2}
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="No. Telefon"
                                            value={formData.employer_phone}
                                            onChange={(e) =>
                                                setFormData({ ...formData, employer_phone: e.target.value })
                                            }
                                            placeholder="012-3456789"
                                        />
                                        <Input
                                            label="E-mel"
                                            type="email"
                                            value={formData.employer_email}
                                            onChange={(e) =>
                                                setFormData({ ...formData, employer_email: e.target.value })
                                            }
                                            placeholder="email@majikan.com"
                                        />
                                    </div>
                                </>
                            ) : (
                                <Select
                                    label="Pilih Majikan"
                                    value={formData.employer_id}
                                    onChange={(e) =>
                                        setFormData({ ...formData, employer_id: e.target.value })
                                    }
                                    options={employers.map((e) => ({
                                        value: e.id,
                                        label: `${e.name} (${e.ssm_no || "Tiada SSM"})`,
                                    }))}
                                    placeholder="-- Pilih majikan --"
                                />
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button type="button" variant="outline" onClick={() => setStep(1)}>
                                Kembali
                            </Button>
                            <Button type="button" onClick={() => setStep(3)}>
                                Seterusnya
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                {/* Step 3: Summary & Notes */}
                {step === 3 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Ringkasan & Nota</CardTitle>
                            <CardDescription>
                                Semak maklumat dan tambah nota jika perlu
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-500">Nombor Kes</p>
                                    <p className="font-medium">{formData.case_number}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Jenis Akta</p>
                                    <p className="font-medium">
                                        {ACT_TYPE_LABELS[formData.act_type]}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Majikan</p>
                                    <p className="font-medium">
                                        {createNewEmployer
                                            ? formData.employer_name || "Belum diisi"
                                            : employers.find((e) => e.id === formData.employer_id)
                                                ?.name || "Belum dipilih"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Tarikh Pemeriksaan</p>
                                    <p className="font-medium">
                                        {formData.inspection_date || "Belum ditetapkan"}
                                    </p>
                                </div>
                            </div>

                            <Textarea
                                label="Nota Tambahan"
                                value={formData.notes}
                                onChange={(e) =>
                                    setFormData({ ...formData, notes: e.target.value })
                                }
                                placeholder="Sebarang nota tambahan untuk rujukan"
                                rows={4}
                            />
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button type="button" variant="outline" onClick={() => setStep(2)}>
                                Kembali
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Simpan Kes
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                )}
            </form>
        </div>
    );
}
