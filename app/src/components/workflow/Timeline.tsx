// ============================================
// PERKESO Prosecution System
// Workflow Timeline Component
// ============================================

'use client';

import { useEffect, useState } from 'react';
import { getWorkflowHistory } from '@/app/actions/workflow-actions';
import { CASE_STATUS_LABELS, CASE_STATUS_COLORS, type CaseStatus } from '@/lib/workflow';
import { formatDate } from '@/lib/utils';
import { Clock } from 'lucide-react';
import { Clock, User } from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface WorkflowHistoryItem {
    id: string;
    case_id: string;
    from_status: CaseStatus;
    to_status: CaseStatus;
    action: string;
    performed_by: string;
    performed_by_name?: string;
    notes?: string;
    created_at: string;
}

// ============================================
// PROPS
// ============================================

interface TimelineProps {
    caseId: string;
}

// ============================================
// COMPONENT
// ============================================

export default function Timeline({ caseId }: TimelineProps) {
    const [history, setHistory] = useState<WorkflowHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            const result = await getWorkflowHistory(caseId);
            if (result.success && result.history) {
                setHistory(result.history);
            }
            setLoading(false);
        };

        fetchHistory();
    }, [caseId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Tiada sejarah status dijumpai</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Sejarah Status</h3>
            <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                {/* Timeline Items */}
                <div className="space-y-6">
                    {history.map((item, index) => (
                        <div key={item.id} className="relative flex items-start gap-4">
                            {/* Timeline Dot */}
                            <div
                                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                                    index === 0
                                        ? 'bg-blue-600'
                                        : 'bg-gray-300'
                                }`}
                            >
                                <div className="h-2 w-2 rounded-full bg-white"></div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span
                                        className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                                            CASE_STATUS_COLORS[item.to_status] ||
                                            'bg-gray-100 text-gray-800'
                                        }`}
                                    >
                                        {CASE_STATUS_LABELS[item.to_status]}
                                    </span>
                                    {item.from_status !== item.to_status && (
                                        <span className="text-xs text-gray-400">
                                            dari {CASE_STATUS_LABELS[item.from_status]}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                                    <User className="h-3 w-3" />
                                    <span>{item.performed_by_name || 'Unknown'}</span>
                                    <span>•</span>
                                    <span>{formatDate(item.created_at)}</span>
                                </div>

                                {item.notes && (
                                    <p className="text-xs text-gray-600 mt-1 italic">
                                        "{item.notes}"
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
