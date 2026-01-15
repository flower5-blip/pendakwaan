// ============================================
// src/app/(dashboard)/cases/[id]/documents/page.tsx
// Documents page for Kertas Minit & Pertuduhan
// ============================================

'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { DocumentTabs } from '@/components/documents';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface DocumentsPageProps {
    params: Promise<{ id: string }>;
}

export default function DocumentsPage({ params }: DocumentsPageProps) {
    const { id } = use(params);
    const router = useRouter();
    const supabase = createClient();

    const [caseData, setCaseData] = useState<any>(null);
    const [employees, setEmployees] = useState<any[]>([]);
    const [evidences, setEvidences] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            // Fetch case with employer
            const { data: caseResult, error } = await supabase
                .from('cases')
                .select(`
          *,
          employer:employers(*)
        `)
                .eq('id', id)
                .single();

            if (error || !caseResult) {
                console.error('Error fetching case:', error);
                router.push('/cases');
                return;
            }

            setCaseData(caseResult);

            // Fetch persons (employees/workers)
            const { data: personsData } = await supabase
                .from('persons')
                .select('*')
                .eq('case_id', id)
                .eq('role', 'pekerja');

            // Map to employee format
            setEmployees((personsData || []).map(p => ({
                id: p.id,
                full_name: p.name,
                ic_number: p.ic_number,
                position: p.position,
                employment_start_date: p.employment_start_date,
                monthly_salary: p.salary,
            })));

            // Fetch evidence if table exists
            try {
                const { data: evidenceData } = await supabase
                    .from('evidences')
                    .select('*')
                    .eq('case_id', id);

                setEvidences((evidenceData || []).map((e, i) => ({
                    id: e.id,
                    exhibit_number: e.exhibit_number || `E${i + 1}`,
                    name: e.name,
                    description: e.description,
                    status: e.status,
                })));
            } catch {
                // Evidence table may not exist yet
                setEvidences([]);
            }

            setLoading(false);
        };

        fetchData();
    }, [id, supabase, router]);

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

    // Build employer object
    const employer = caseData.employer || {
        company_name: caseData.employer?.name || 'Majikan Tidak Diketahui',
        ssm_number: caseData.employer?.ssm_no,
        address: caseData.employer?.address,
        phone: caseData.employer?.phone,
        state: 'Selangor',
    };

    // Normalize employer fields for documents
    const normalizedEmployer = {
        company_name: employer.company_name || employer.name || 'Majikan',
        ssm_number: employer.ssm_number || employer.ssm_no,
        employer_code: employer.employer_code,
        address: employer.address,
        owner_name: employer.owner_name,
        owner_ic: employer.owner_ic,
        phone: employer.phone,
        state: employer.state || 'Selangor',
    };

    // Build case object for documents
    const documentCaseData = {
        case_number: caseData.case_number,
        act_type: caseData.act_type,
        offense_type: caseData.offense_type || caseData.issue_summary || 'Gagal Daftar Pekerja',
        status: caseData.status,
        date_of_offense: caseData.date_of_offense || caseData.inspection_date || new Date().toISOString(),
        time_of_offense: caseData.time_of_offense,
        location_of_offense: caseData.location_of_offense || caseData.inspection_location,
        section_charged: caseData.section_charged || 'Seksyen 5, Akta Keselamatan Sosial Pekerja 1969',
        section_penalty: caseData.section_penalty || 'Seksyen 94, Akta yang sama',
        section_compound: caseData.section_compound,
        inspection_date: caseData.inspection_date,
        inspection_location: caseData.inspection_location,
        arrears_amount: caseData.arrears_amount,
        total_employees_affected: employees.length,
        recommendation: caseData.recommendation,
        notes: caseData.notes || caseData.issue_summary,
        created_at: caseData.created_at,
    };

    return (
        <div className="space-y-6 print:space-y-0">
            {/* Header - Hidden on Print */}
            <div className="flex items-center gap-4 print:hidden">
                <Link href={`/cases/${id}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dokumen Kes</h1>
                    <p className="text-gray-600">{caseData.case_number} • {normalizedEmployer.company_name}</p>
                </div>
            </div>

            {/* Document Tabs */}
            <DocumentTabs
                employer={normalizedEmployer}
                caseData={documentCaseData}
                employees={employees}
                evidences={evidences}
            />
        </div>
    );
}
