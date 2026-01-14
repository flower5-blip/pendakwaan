// ============================================
// src/app/(dashboard)/cases/preview/page.tsx
// Test page for previewing document components
// ============================================

'use client';

import { DocumentTabs } from '@/components/documents';

// Mock data for testing
const mockEmployer = {
    company_name: 'ABC SUMBER RAYA SDN BHD',
    ssm_number: '123456-A',
    employer_code: 'E123456',
    address: 'Lot 123, Jalan Industri 1, Kawasan Perindustrian ABC, 43000 Kajang, Selangor',
    owner_name: 'AHMAD BIN ISMAIL',
    owner_ic: '780101-10-1234',
    phone: '03-8912 3456',
    state: 'Selangor',
};

const mockCase = {
    case_number: 'SEL/PP/2026/001234',
    act_type: 'akta_4',
    offense_type: 'Gagal/Lewat Daftar Pekerja',
    status: 'Pending Review',
    date_of_offense: '2025-06-15',
    time_of_offense: '10.30 pagi',
    location_of_offense: 'Lot 123, Jalan Industri 1, Kawasan Perindustrian ABC, 43000 Kajang',
    section_charged: 'Seksyen 5, Akta Keselamatan Sosial Pekerja 1969',
    section_penalty: 'Seksyen 94, Akta yang sama',
    section_compound: 'Seksyen 95A',
    inspection_date: '2025-07-20',
    inspection_location: 'Pejabat PERKESO Kajang',
    arrears_amount: 15000,
    total_employees_affected: 5,
    recommendation: 'compound' as const,
    notes: 'Majikan didapati gagal mendaftarkan 5 orang pekerja dalam tempoh yang ditetapkan.',
    created_at: new Date().toISOString(),
};

const mockEmployees = [
    { id: '1', full_name: 'MUHAMMAD ALI BIN AHMAD', ic_number: '900101-01-1234', position: 'Pengurus', employment_start_date: '2024-01-01', monthly_salary: 3500 },
    { id: '2', full_name: 'SITI AMINAH BINTI ISMAIL', ic_number: '920515-10-5678', position: 'Kerani', employment_start_date: '2024-03-15', monthly_salary: 2200 },
    { id: '3', full_name: 'KUMAR A/L RAJU', ic_number: '880312-07-9012', position: 'Operator', employment_start_date: '2024-02-01', monthly_salary: 1800 },
    { id: '4', full_name: 'LIM MEI LING', ic_number: '950721-14-3456', position: 'Pembantu Stor', employment_start_date: '2024-06-01', monthly_salary: 1650 },
    { id: '5', full_name: 'HASSAN BIN OSMAN', ic_number: '870429-08-7890', position: 'Pemandu', employment_start_date: '2024-04-01', monthly_salary: 2000 },
];

const mockEvidences = [
    { id: '1', exhibit_number: 'E1', name: 'Borang Caruman PERKESO', description: 'Rekod caruman dari Jan-Jun 2025', status: 'Verified' },
    { id: '2', exhibit_number: 'E2', name: 'Fail Pekerja', description: 'Salinan fail pekerja yang tidak didaftarkan', status: 'Verified' },
    { id: '3', exhibit_number: 'E3', name: 'Slip Gaji', description: 'Slip gaji bulanan pekerja terlibat', status: 'Collected' },
    { id: '4', exhibit_number: 'E4', name: 'Rakaman Percakapan', description: 'Transkrip rakaman percakapan S.12C dengan pengarah', status: 'Verified' },
];

export default function PreviewPage() {
    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8 print:hidden">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">📄 Preview Dokumen</h1>
                <p className="text-gray-600">Pratonton Kertas Minit Siasatan dan Kertas Pertuduhan</p>

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800">
                        <strong>Kes:</strong> {mockCase.case_number} |
                        <strong> Majikan:</strong> {mockEmployer.company_name} |
                        <strong> Kesalahan:</strong> {mockCase.offense_type}
                    </p>
                </div>
            </div>

            {/* Document Tabs */}
            <DocumentTabs
                employer={mockEmployer}
                caseData={mockCase}
                employees={mockEmployees}
                evidences={mockEvidences}
            />
        </div>
    );
}
