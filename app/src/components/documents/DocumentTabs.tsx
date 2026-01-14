// ============================================
// src/components/documents/DocumentTabs.tsx
// Tabs for all 5 prosecution documents
// ============================================

'use client';

import { useState } from 'react';
import ChargeSheet from './ChargeSheet';
import InvestigationPaper from './InvestigationPaper';
import ConsentLetter from './ConsentLetter';
import CertificateOfOfficer from './CertificateOfOfficer';
import CourtSummons from './CourtSummons';

// ============================================
// Types
// ============================================

interface Employer {
    company_name: string;
    ssm_number?: string | null;
    employer_code?: string | null;
    address?: string | null;
    owner_name?: string | null;
    owner_ic?: string | null;
    phone?: string | null;
    state?: string | null;
}

interface CaseData {
    case_number: string;
    act_type: string;
    offense_type: string;
    status: string;
    date_of_offense: string;
    time_of_offense?: string | null;
    location_of_offense?: string | null;
    section_charged: string;
    section_penalty: string;
    section_compound?: string | null;
    inspection_date?: string | null;
    inspection_location?: string | null;
    arrears_amount?: number | null;
    arrears_period_start?: string | null;
    arrears_period_end?: string | null;
    total_employees_affected?: number | null;
    recommendation?: string | null;
    notes?: string | null;
    created_at: string;
}

interface Employee {
    id: string;
    full_name: string;
    ic_number?: string | null;
    position?: string | null;
    employment_start_date?: string | null;
    monthly_salary?: number | null;
}

interface Evidence {
    id: string;
    exhibit_number: string;
    name: string;
    description?: string | null;
    status: string;
}

interface Props {
    employer: Employer;
    caseData: CaseData;
    employees?: Employee[];
    evidences?: Evidence[];
}

type TabKey = 'minit' | 'pertuduhan' | 'izin' | 'saman' | 'perakuan';

const TABS: { key: TabKey; label: string; icon: string; color: string }[] = [
    { key: 'izin', label: 'Izin Dakwa', icon: '⚠️', color: 'red' },
    { key: 'pertuduhan', label: 'Pertuduhan', icon: '⚖️', color: 'blue' },
    { key: 'minit', label: 'Kertas Minit', icon: '📋', color: 'green' },
    { key: 'saman', label: 'Saman', icon: '📨', color: 'purple' },
    { key: 'perakuan', label: 'Perakuan', icon: '📄', color: 'amber' },
];

// ============================================
// Main Component
// ============================================

export default function DocumentTabs({ employer, caseData, employees = [], evidences = [] }: Props) {
    const [activeTab, setActiveTab] = useState<TabKey>('minit');

    const getTabClasses = (tab: typeof TABS[0]) => {
        const isActive = activeTab === tab.key;
        const baseClasses = 'px-4 py-3 text-center font-medium transition whitespace-nowrap';

        if (isActive) {
            return `${baseClasses} text-${tab.color}-600 border-b-2 border-${tab.color}-600 bg-${tab.color}-50`;
        }
        return `${baseClasses} text-gray-600 hover:text-gray-900 hover:bg-gray-50`;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Tab Buttons - Scrollable on mobile */}
            <div className="flex border-b print:hidden overflow-x-auto">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`
                            flex-1 min-w-[120px] px-4 py-3 text-center font-medium transition whitespace-nowrap
                            ${activeTab === tab.key
                                ? `text-blue-600 border-b-2 border-blue-600 bg-blue-50`
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }
                        `}
                    >
                        <span className="mr-1">{tab.icon}</span>
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className="sm:hidden text-xs">{tab.label.split(' ')[0]}</span>
                    </button>
                ))}
            </div>

            {/* Document Priority Note */}
            <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-sm text-yellow-800 print:hidden">
                <strong>📌 Keutamaan:</strong> Izin Dakwa (wajib) → Pertuduhan → Kertas Minit → Saman
            </div>

            {/* Tab Content */}
            <div className="p-6">
                {activeTab === 'minit' && (
                    <InvestigationPaper
                        employer={employer}
                        caseData={caseData}
                        employees={employees}
                        evidences={evidences}
                    />
                )}

                {activeTab === 'pertuduhan' && (
                    <ChargeSheet
                        employer={employer}
                        caseData={caseData}
                        employees={employees.map(e => ({ name: e.full_name, ic: e.ic_number || '' }))}
                    />
                )}

                {activeTab === 'izin' && (
                    <ConsentLetter
                        employer={employer}
                        caseData={caseData}
                    />
                )}

                {activeTab === 'saman' && (
                    <CourtSummons
                        employer={employer}
                        caseData={caseData}
                    />
                )}

                {activeTab === 'perakuan' && (
                    <CertificateOfOfficer
                        employer={employer}
                        caseData={{
                            ...caseData,
                            arrears_amount: caseData.arrears_amount || undefined,
                            arrears_period_start: caseData.arrears_period_start || undefined,
                            arrears_period_end: caseData.arrears_period_end || undefined,
                        }}
                    />
                )}
            </div>
        </div>
    );
}
