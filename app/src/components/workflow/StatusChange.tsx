// ============================================
// PERKESO Prosecution System
// Status Change Component - Workflow Actions
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
    getAvailableActions,
    CASE_STATUS_LABELS,
    CASE_STATUS_COLORS,
    type CaseStatus,
    type WorkflowAction,
} from '@/lib/workflow';
import { updateCaseStatus } from '@/app/actions/workflow-actions';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

// ============================================
// PROPS
// ============================================

interface StatusChangeProps {
    caseId: string;
    currentStatus: CaseStatus;
    onStatusChange?: (newStatus: CaseStatus) => void;
}

// ============================================
// COMPONENT
// ============================================

export default function StatusChange({
    caseId,
    currentStatus,
    onStatusChange,
}: StatusChangeProps) {
    const { profile } = useAuth();
    const [availableActions, setAvailableActions] = useState<WorkflowAction[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedAction, setSelectedAction] = useState<WorkflowAction | null>(null);
    const [notes, setNotes] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (profile && currentStatus) {
            const actions = getAvailableActions(currentStatus, profile.role);
            setAvailableActions(actions);
        }
    }, [profile, currentStatus]);

    const handleActionClick = (action: WorkflowAction) => {
        setSelectedAction(action);
        setMessage(null);
    };

    const handleConfirm = async () => {
        if (!selectedAction) return;

        setLoading(true);
        setMessage(null);

        try {
            const result = await updateCaseStatus(caseId, selectedAction.targetStatus, notes);

            if (result.success) {
                setMessage({
                    type: 'success',
                    text: result.message,
                });
                setSelectedAction(null);
                setNotes('');
                if (onStatusChange) {
                    onStatusChange(selectedAction.targetStatus);
                }
                // Refresh page after 1.5s
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                setMessage({
                    type: 'error',
                    text: result.error || result.message,
                });
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Ralat tidak dijangka. Sila cuba lagi.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setSelectedAction(null);
        setNotes('');
        setMessage(null);
    };

    if (availableActions.length === 0) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-sm text-gray-500 text-center">
                        Tiada tindakan tersedia untuk status semasa.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Kemaskini Status Kes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Current Status */}
                <div>
                    <p className="text-sm text-gray-500 mb-2">Status Semasa</p>
                    <span
                        className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                            CASE_STATUS_COLORS[currentStatus] || 'bg-gray-100 text-gray-800'
                        }`}
                    >
                        {CASE_STATUS_LABELS[currentStatus]}
                    </span>
                </div>

                {/* Available Actions */}
                {!selectedAction && (
                    <div>
                        <p className="text-sm text-gray-500 mb-3">Tindakan Tersedia</p>
                        <div className="space-y-2">
                            {availableActions.map((action) => (
                                <Button
                                    key={action.action}
                                    variant="outline"
                                    className="w-full justify-start text-left"
                                    onClick={() => handleActionClick(action)}
                                >
                                    <div className="flex-1">
                                        <p className="font-medium">{action.label}</p>
                                        <p className="text-xs text-gray-500">
                                            {action.description}
                                        </p>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        → {CASE_STATUS_LABELS[action.targetStatus]}
                                    </span>
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Confirmation */}
                {selectedAction && (
                    <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div>
                            <p className="text-sm font-medium text-blue-900 mb-1">
                                Tindakan: {selectedAction.label}
                            </p>
                            <p className="text-xs text-blue-700">
                                {selectedAction.description}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-blue-900 mb-2">
                                Status baharu: {CASE_STATUS_LABELS[selectedAction.targetStatus]}
                            </p>
                        </div>

                        <Textarea
                            label="Nota (Pilihan)"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Tambah nota untuk perubahan status ini..."
                            rows={3}
                        />

                        {message && (
                            <div
                                className={`p-3 rounded-lg flex items-start gap-2 ${
                                    message.type === 'success'
                                        ? 'bg-green-50 border border-green-200'
                                        : 'bg-red-50 border border-red-200'
                                }`}
                            >
                                {message.type === 'success' ? (
                                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                ) : (
                                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                                )}
                                <p
                                    className={`text-sm ${
                                        message.type === 'success'
                                            ? 'text-green-700'
                                            : 'text-red-700'
                                    }`}
                                >
                                    {message.text}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                disabled={loading}
                                className="flex-1"
                            >
                                Batal
                            </Button>
                            <Button
                                onClick={handleConfirm}
                                disabled={loading}
                                className="flex-1"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Memproses...
                                    </>
                                ) : (
                                    'Sahkan'
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
