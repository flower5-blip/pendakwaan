// ============================================
// PERKESO Prosecution System
// Server Actions for Workflow Management
// ============================================

'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { CaseStatus } from '@/lib/workflow';
import {
    canPerformAction,
    isValidTransition,
    getNotifyRoles,
    type WorkflowAction,
} from '@/lib/workflow';

// ============================================
// TYPES
// ============================================

export interface WorkflowActionResult {
    success: boolean;
    message: string;
    data?: {
        case_id: string;
        new_status: CaseStatus;
    };
    error?: string;
}

// ============================================
// UPDATE CASE STATUS (with validation)
// ============================================

export async function updateCaseStatus(
    caseId: string,
    newStatus: CaseStatus,
    notes?: string
): Promise<WorkflowActionResult> {
    try {
        const supabase = await createClient();

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return {
                success: false,
                message: 'Ralat pengesahan',
                error: 'Anda perlu log masuk untuk mengemaskini status kes.',
            };
        }

        // Get user profile for role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile) {
            return {
                success: false,
                message: 'Profil pengguna tidak dijumpai',
                error: 'Sila hubungi admin untuk menetapkan peranan anda.',
            };
        }

        // Get current case
        const { data: currentCase, error: caseError } = await supabase
            .from('cases')
            .select('id, case_number, status, io_id')
            .eq('id', caseId)
            .single();

        if (caseError || !currentCase) {
            return {
                success: false,
                message: 'Kes tidak dijumpai',
                error: caseError?.message || 'Kes tidak wujud dalam sistem.',
            };
        }

        const currentStatus = currentCase.status as CaseStatus;

        // Validate transition
        if (!isValidTransition(currentStatus, newStatus)) {
            return {
                success: false,
                message: 'Peralihan status tidak sah',
                error: `Tidak boleh menukar status dari "${currentStatus}" ke "${newStatus}".`,
            };
        }

        // Check if user can perform action
        if (!canPerformAction(currentStatus, newStatus, profile.role as any)) {
            return {
                success: false,
                message: 'Tidak dibenarkan',
                error: `Peranan anda (${profile.role}) tidak dibenarkan untuk melakukan tindakan ini.`,
            };
        }

        // Update case status
        const { error: updateError } = await supabase
            .from('cases')
            .update({
                status: newStatus,
                updated_at: new Date().toISOString(),
            })
            .eq('id', caseId);

        if (updateError) {
            return {
                success: false,
                message: 'Gagal kemaskini status',
                error: updateError.message,
            };
        }

        // Log workflow history
        const { error: historyError } = await supabase
            .from('audit_trail')
            .insert({
                table_name: 'cases',
                record_id: caseId,
                action: 'update',
                old_data: { status: currentStatus },
                new_data: { status: newStatus },
                user_id: user.id,
            });

        if (historyError) {
            console.error('Failed to log workflow history:', historyError);
            // Don't fail the operation if history logging fails
        }

        // Revalidate paths
        revalidatePath('/cases');
        revalidatePath(`/cases/${caseId}`);
        revalidatePath('/dashboard');

        return {
            success: true,
            message: `Status kes berjaya dikemaskini kepada "${newStatus}".`,
            data: {
                case_id: caseId,
                new_status: newStatus,
            },
        };
    } catch (error) {
        console.error('updateCaseStatus error:', error);
        return {
            success: false,
            message: 'Ralat sistem',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// ============================================
// APPROVE SANCTION WITH ROUTE (Combined Action)
// Menggabungkan kelulusan sanksi dan penetapan laluan dalam satu operasi
// ============================================

export async function approveSanctionWithRoute(
    caseId: string,
    route: 'dikompaun' | 'didakwa' | 'nfa',
    notes?: string
): Promise<WorkflowActionResult> {
    try {
        const supabase = await createClient();

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return {
                success: false,
                message: 'Ralat pengesahan',
                error: 'Anda perlu log masuk.',
            };
        }

        // Get user profile for role check
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || !['uip', 'admin'].includes(profile.role)) {
            return {
                success: false,
                message: 'Tidak dibenarkan',
                error: 'Hanya UIP atau Admin boleh meluluskan sanksi.',
            };
        }

        // Get current case
        const { data: currentCase, error: caseError } = await supabase
            .from('cases')
            .select('id, case_number, status')
            .eq('id', caseId)
            .single();

        if (caseError || !currentCase) {
            return {
                success: false,
                message: 'Kes tidak dijumpai',
                error: caseError?.message || 'Kes tidak wujud.',
            };
        }

        // Validate current status must be menunggu_sanksi
        if (currentCase.status !== 'menunggu_sanksi') {
            return {
                success: false,
                message: 'Status tidak sah',
                error: `Kes mesti dalam status "Menunggu Sanksi". Status semasa: ${currentCase.status}`,
            };
        }

        // Validate route is allowed from sanksi_diluluskan
        const allowedRoutes = ['dikompaun', 'didakwa', 'nfa'];
        if (!allowedRoutes.includes(route)) {
            return {
                success: false,
                message: 'Laluan tidak sah',
                error: `Laluan ${route} tidak dibenarkan.`,
            };
        }

        // Update directly to the target route (skip intermediate sanksi_diluluskan)
        const { error: updateError } = await supabase
            .from('cases')
            .update({
                status: route,
                updated_at: new Date().toISOString(),
            })
            .eq('id', caseId);

        if (updateError) {
            return {
                success: false,
                message: 'Gagal kemaskini status',
                error: updateError.message,
            };
        }

        // Log audit trail
        const routeLabel = route === 'dikompaun' ? 'Kompaun' : route === 'didakwa' ? 'Pendakwaan' : 'NFA';
        await supabase.from('audit_trail').insert({
            table_name: 'cases',
            record_id: caseId,
            action: 'update',
            old_data: { status: 'menunggu_sanksi' },
            new_data: { status: route, sanction_approved: true, route: routeLabel },
            user_id: user.id,
        });

        revalidatePath('/cases');
        revalidatePath(`/cases/${caseId}`);

        return {
            success: true,
            message: `Sanksi diluluskan. Kes diarahkan ke ${routeLabel}.`,
            data: {
                case_id: caseId,
                new_status: route as CaseStatus,
            },
        };
    } catch (error) {
        console.error('approveSanctionWithRoute error:', error);
        return {
            success: false,
            message: 'Ralat sistem',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// ============================================
// GET AVAILABLE ACTIONS FOR CASE
// ============================================

export async function getAvailableActionsForCase(
    caseId: string
): Promise<{
    success: boolean;
    actions?: WorkflowAction[];
    error?: string;
}> {
    try {
        const supabase = await createClient();

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return {
                success: false,
                error: 'Unauthorized',
            };
        }

        // Get user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile) {
            return {
                success: false,
                error: 'Profile not found',
            };
        }

        // Get case status
        const { data: currentCase } = await supabase
            .from('cases')
            .select('status')
            .eq('id', caseId)
            .single();

        if (!currentCase) {
            return {
                success: false,
                error: 'Case not found',
            };
        }

        // Get available actions
        const { getAvailableActions } = await import('@/lib/workflow');
        const actions = getAvailableActions(
            currentCase.status as CaseStatus,
            profile.role as any
        );

        return {
            success: true,
            actions,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// ============================================
// GET WORKFLOW HISTORY
// ============================================

export async function getWorkflowHistory(caseId: string) {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('audit_trail')
            .select(`
                id,
                action,
                old_data,
                new_data,
                created_at,
                user_id,
                profiles:user_id (
                    full_name,
                    role
                )
            `)
            .eq('table_name', 'cases')
            .eq('record_id', caseId)
            .order('created_at', { ascending: false });

        if (error) {
            return {
                success: false,
                error: error.message,
                history: [],
            };
        }

        // Transform audit trail to workflow history
        const history = (data || [])
            .filter((item) => item.action === 'update' && item.new_data?.status)
            .map((item) => ({
                id: item.id,
                case_id: caseId,
                from_status: item.old_data?.status as CaseStatus,
                to_status: item.new_data?.status as CaseStatus,
                action: 'status_change',
                performed_by: item.user_id || '',
                performed_by_name: (item.profiles as any)?.full_name || 'Unknown',
                created_at: item.created_at,
            }));

        return {
            success: true,
            history,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            history: [],
        };
    }
}
