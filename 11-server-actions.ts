// ============================================
// src/app/actions/case-actions.ts
// Next.js Server Actions for Case Management
// ============================================

'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ActTypeEnum, OffenseTypeEnum, CaseStatusEnum } from '@/types/database.types';

// ============================================
// Response Type
// ============================================

interface ActionResponse {
    success: boolean;
    message: string;
    data?: {
        employer_id?: string;
        case_id?: string;
    };
    error?: string;
}

// ============================================
// CREATE CASE (with Employer)
// ============================================

export async function createCase(formData: FormData): Promise<ActionResponse> {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return {
                success: false,
                message: 'Ralat pengesahan',
                error: 'Anda perlu log masuk untuk mencipta kes baru.',
            };
        }

        // ============================================
        // STEP 1: Extract Employer Data from FormData
        // ============================================

        const employerData = {
            company_name: formData.get('company_name') as string,
            ssm_number: formData.get('ssm_number') as string || null,
            employer_code: formData.get('employer_code') as string || null,
            industry_code: formData.get('industry_code') as string || null,
            address: formData.get('address') as string || null,
            postcode: formData.get('postcode') as string || null,
            city: formData.get('city') as string || null,
            state: formData.get('state') as string || null,
            owner_name: formData.get('owner_name') as string || null,
            owner_ic: formData.get('owner_ic') as string || null,
            phone: formData.get('phone') as string || null,
            email: formData.get('email') as string || null,
            operation_start_date: formData.get('operation_start_date') as string || null,
        };

        // Validate required employer fields
        if (!employerData.company_name) {
            return {
                success: false,
                message: 'Maklumat tidak lengkap',
                error: 'Nama syarikat diperlukan.',
            };
        }

        // ============================================
        // STEP 2: Insert Employer
        // ============================================

        const { data: employer, error: employerError } = await supabase
            .from('employers')
            .insert(employerData)
            .select('id')
            .single();

        if (employerError) {
            console.error('Employer insert error:', employerError);
            return {
                success: false,
                message: 'Gagal mencipta rekod majikan',
                error: employerError.message,
            };
        }

        // ============================================
        // STEP 3: Extract Case Data from FormData
        // ============================================

        const caseData = {
            case_number: formData.get('case_number') as string || generateCaseNumber(),
            employer_id: employer.id,
            investigating_officer_id: user.id,
            act_type: formData.get('act_type') as ActTypeEnum,
            offense_type: formData.get('offense_type') as OffenseTypeEnum,
            date_of_offense: formData.get('date_of_offense') as string,
            time_of_offense: formData.get('time_of_offense') as string || null,
            location_of_offense: formData.get('location_of_offense') as string || null,
            section_charged: formData.get('section_charged') as string,
            section_penalty: formData.get('section_penalty') as string,
            section_compound: formData.get('section_compound') as string || null,
            inspection_date: formData.get('inspection_date') as string || null,
            inspection_location: formData.get('inspection_location') as string || null,
            arrears_start_date: formData.get('arrears_start_date') as string || null,
            arrears_end_date: formData.get('arrears_end_date') as string || null,
            arrears_amount: formData.get('arrears_amount')
                ? parseFloat(formData.get('arrears_amount') as string)
                : null,
            total_employees_affected: formData.get('total_employees_affected')
                ? parseInt(formData.get('total_employees_affected') as string)
                : null,
            status: 'Draft' as CaseStatusEnum,
            notes: formData.get('notes') as string || null,
            created_by: user.id,
        };

        // Validate required case fields
        if (!caseData.act_type || !caseData.offense_type || !caseData.date_of_offense) {
            // Rollback: Delete the employer
            await supabase.from('employers').delete().eq('id', employer.id);

            return {
                success: false,
                message: 'Maklumat kes tidak lengkap',
                error: 'Jenis Akta, Jenis Kesalahan, dan Tarikh Kesalahan diperlukan.',
            };
        }

        if (!caseData.section_charged || !caseData.section_penalty) {
            // Rollback: Delete the employer
            await supabase.from('employers').delete().eq('id', employer.id);

            return {
                success: false,
                message: 'Seksyen tidak lengkap',
                error: 'Seksyen Pertuduhan dan Seksyen Hukuman diperlukan.',
            };
        }

        // ============================================
        // STEP 4: Insert Case
        // ============================================

        const { data: newCase, error: caseError } = await supabase
            .from('cases')
            .insert(caseData)
            .select('id, case_number')
            .single();

        if (caseError) {
            console.error('Case insert error:', caseError);

            // Rollback: Delete the employer
            await supabase.from('employers').delete().eq('id', employer.id);

            return {
                success: false,
                message: 'Gagal mencipta rekod kes',
                error: caseError.message,
            };
        }

        // ============================================
        // STEP 5: Revalidate and Return Success
        // ============================================

        revalidatePath('/cases');
        revalidatePath('/dashboard');

        return {
            success: true,
            message: `Kes ${newCase.case_number} berjaya dicipta!`,
            data: {
                employer_id: employer.id,
                case_id: newCase.id,
            },
        };

    } catch (error) {
        console.error('createCase error:', error);
        return {
            success: false,
            message: 'Ralat sistem',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// ============================================
// CREATE CASE (with Existing Employer)
// ============================================

export async function createCaseWithExistingEmployer(formData: FormData): Promise<ActionResponse> {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return {
                success: false,
                message: 'Ralat pengesahan',
                error: 'Anda perlu log masuk.',
            };
        }

        const employer_id = formData.get('employer_id') as string;

        if (!employer_id) {
            return {
                success: false,
                message: 'Majikan tidak dipilih',
                error: 'Sila pilih majikan sedia ada.',
            };
        }

        const caseData = {
            case_number: formData.get('case_number') as string || generateCaseNumber(),
            employer_id: employer_id,
            investigating_officer_id: user.id,
            act_type: formData.get('act_type') as ActTypeEnum,
            offense_type: formData.get('offense_type') as OffenseTypeEnum,
            date_of_offense: formData.get('date_of_offense') as string,
            time_of_offense: formData.get('time_of_offense') as string || null,
            location_of_offense: formData.get('location_of_offense') as string || null,
            section_charged: formData.get('section_charged') as string,
            section_penalty: formData.get('section_penalty') as string,
            section_compound: formData.get('section_compound') as string || null,
            inspection_date: formData.get('inspection_date') as string || null,
            status: 'Draft' as CaseStatusEnum,
            notes: formData.get('notes') as string || null,
            created_by: user.id,
        };

        const { data: newCase, error: caseError } = await supabase
            .from('cases')
            .insert(caseData)
            .select('id, case_number')
            .single();

        if (caseError) {
            return {
                success: false,
                message: 'Gagal mencipta rekod kes',
                error: caseError.message,
            };
        }

        revalidatePath('/cases');
        revalidatePath('/dashboard');

        return {
            success: true,
            message: `Kes ${newCase.case_number} berjaya dicipta!`,
            data: {
                employer_id: employer_id,
                case_id: newCase.id,
            },
        };

    } catch (error) {
        console.error('createCaseWithExistingEmployer error:', error);
        return {
            success: false,
            message: 'Ralat sistem',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// ============================================
// HELPER: Generate Case Number
// ============================================

function generateCaseNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
    return `KES/${year}/${random}`;
}

// ============================================
// UPDATE CASE STATUS
// ============================================

export async function updateCaseStatus(
    caseId: string,
    newStatus: CaseStatusEnum
): Promise<ActionResponse> {
    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from('cases')
            .update({ status: newStatus })
            .eq('id', caseId);

        if (error) {
            return {
                success: false,
                message: 'Gagal kemaskini status',
                error: error.message,
            };
        }

        revalidatePath('/cases');
        revalidatePath(`/cases/${caseId}`);

        return {
            success: true,
            message: 'Status kes berjaya dikemaskini!',
        };

    } catch (error) {
        return {
            success: false,
            message: 'Ralat sistem',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// ============================================
// DELETE CASE
// ============================================

export async function deleteCase(caseId: string): Promise<ActionResponse> {
    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from('cases')
            .delete()
            .eq('id', caseId);

        if (error) {
            return {
                success: false,
                message: 'Gagal memadam kes',
                error: error.message,
            };
        }

        revalidatePath('/cases');
        revalidatePath('/dashboard');

        return {
            success: true,
            message: 'Kes berjaya dipadam!',
        };

    } catch (error) {
        return {
            success: false,
            message: 'Ralat sistem',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
