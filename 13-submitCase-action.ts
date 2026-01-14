// ============================================
// src/app/actions/submitCase.ts
// Server Action untuk Submit Kes Baru
// ============================================

'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// ============================================
// Types
// ============================================

type ActType = 'Akta 4' | 'Akta 800';
type CaseStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Completed';

interface SubmitCaseResult {
    success: boolean;
    message: string;
    data?: {
        employer_id: string;
        case_id: string;
        case_number: string;
    };
    errors?: Record<string, string>;
}

interface EmployerInsert {
    company_name: string;
    ssm_number: string | null;
    address: string | null;
    owner_name: string | null;
    owner_ic: string | null;
    phone: string | null;
}

interface CaseInsert {
    case_number: string;
    employer_id: string;
    investigating_officer_id: string;
    act_type: ActType;
    offense_type: string;
    date_of_offense: string;
    location_of_offense: string | null;
    section_charged: string;
    section_penalty: string;
    section_compound: string | null;
    status: CaseStatus;
    notes: string | null;
    created_by: string;
}

// ============================================
// Helper: Generate Case Number
// ============================================

function generateCaseNumber(): string {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `KES/${year}/${timestamp}`;
}

// ============================================
// Helper: Extract String from FormData
// ============================================

function getString(formData: FormData, key: string): string {
    const value = formData.get(key);
    return typeof value === 'string' ? value.trim() : '';
}

function getStringOrNull(formData: FormData, key: string): string | null {
    const value = getString(formData, key);
    return value.length > 0 ? value : null;
}

// ============================================
// Main Server Action: submitCase
// ============================================

export async function submitCase(formData: FormData): Promise<SubmitCaseResult> {
    try {
        // ============================================
        // 1. Initialize Supabase Client
        // ============================================

        const supabase = await createClient();

        // ============================================
        // 2. Get Current User
        // ============================================

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return {
                success: false,
                message: 'Sesi anda telah tamat. Sila log masuk semula.',
                errors: { auth: 'Unauthorized' },
            };
        }

        // ============================================
        // 3. Extract & Validate Employer Data
        // ============================================

        const companyName = getString(formData, 'company_name');

        // Validation: Company name required
        if (!companyName) {
            return {
                success: false,
                message: 'Nama syarikat diperlukan.',
                errors: { company_name: 'Nama syarikat tidak boleh kosong' },
            };
        }

        const employerData: EmployerInsert = {
            company_name: companyName,
            ssm_number: getStringOrNull(formData, 'ssm_number'),
            address: getStringOrNull(formData, 'address'),
            owner_name: getStringOrNull(formData, 'owner_name'),
            owner_ic: getStringOrNull(formData, 'owner_ic'),
            phone: getStringOrNull(formData, 'phone'),
        };

        // ============================================
        // 4. Extract & Validate Case Data
        // ============================================

        const actType = getString(formData, 'act_type') as ActType;
        const offenseType = getString(formData, 'offense_type');
        const dateOfOffense = getString(formData, 'date_of_offense');
        const sectionCharged = getString(formData, 'section_charged');
        const sectionPenalty = getString(formData, 'section_penalty');

        // Validation: Required case fields
        const validationErrors: Record<string, string> = {};

        if (!actType || !['Akta 4', 'Akta 800'].includes(actType)) {
            validationErrors.act_type = 'Jenis Akta tidak sah';
        }

        if (!offenseType) {
            validationErrors.offense_type = 'Jenis kesalahan diperlukan';
        }

        if (!dateOfOffense) {
            validationErrors.date_of_offense = 'Tarikh kesalahan diperlukan';
        }

        if (!sectionCharged) {
            validationErrors.section_charged = 'Seksyen pertuduhan diperlukan';
        }

        if (!sectionPenalty) {
            validationErrors.section_penalty = 'Seksyen hukuman diperlukan';
        }

        if (Object.keys(validationErrors).length > 0) {
            return {
                success: false,
                message: 'Sila lengkapkan semua maklumat yang diperlukan.',
                errors: validationErrors,
            };
        }

        // ============================================
        // 5. Insert Employer to Database
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
                message: 'Gagal menyimpan maklumat majikan.',
                errors: { database: employerError.message },
            };
        }

        // ============================================
        // 6. Prepare Case Data with Employer ID
        // ============================================

        const caseNumber = generateCaseNumber();

        const caseData: CaseInsert = {
            case_number: caseNumber,
            employer_id: employer.id,
            investigating_officer_id: user.id,
            act_type: actType,
            offense_type: offenseType,
            date_of_offense: dateOfOffense,
            location_of_offense: getStringOrNull(formData, 'location_of_offense'),
            section_charged: sectionCharged,
            section_penalty: sectionPenalty,
            section_compound: getStringOrNull(formData, 'section_compound'),
            status: 'Draft',
            notes: getStringOrNull(formData, 'notes'),
            created_by: user.id,
        };

        // ============================================
        // 7. Insert Case to Database
        // ============================================

        const { data: newCase, error: caseError } = await supabase
            .from('cases')
            .insert(caseData)
            .select('id, case_number')
            .single();

        if (caseError) {
            console.error('Case insert error:', caseError);

            // Rollback: Delete the employer we just created
            await supabase.from('employers').delete().eq('id', employer.id);

            return {
                success: false,
                message: 'Gagal menyimpan maklumat kes.',
                errors: { database: caseError.message },
            };
        }

        // ============================================
        // 8. Revalidate Cache & Return Success
        // ============================================

        revalidatePath('/cases');
        revalidatePath('/dashboard');

        return {
            success: true,
            message: `Kes ${newCase.case_number} berjaya dicipta!`,
            data: {
                employer_id: employer.id,
                case_id: newCase.id,
                case_number: newCase.case_number,
            },
        };

    } catch (error) {
        console.error('submitCase unexpected error:', error);
        return {
            success: false,
            message: 'Ralat tidak dijangka. Sila cuba lagi.',
            errors: {
                system: error instanceof Error ? error.message : 'Unknown error'
            },
        };
    }
}

// ============================================
// Alternative: Submit & Redirect
// ============================================

export async function submitCaseAndRedirect(formData: FormData): Promise<void> {
    const result = await submitCase(formData);

    if (result.success && result.data) {
        redirect(`/cases/${result.data.case_id}`);
    } else {
        // In production, you'd handle this with error state
        throw new Error(result.message);
    }
}

// ============================================
// Delete Case Action
// ============================================

export async function deleteCase(caseId: string): Promise<SubmitCaseResult> {
    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from('cases')
            .delete()
            .eq('id', caseId);

        if (error) {
            return {
                success: false,
                message: 'Gagal memadam kes.',
                errors: { database: error.message },
            };
        }

        revalidatePath('/cases');
        revalidatePath('/dashboard');

        return {
            success: true,
            message: 'Kes berjaya dipadam.',
        };

    } catch (error) {
        return {
            success: false,
            message: 'Ralat tidak dijangka.',
            errors: { system: 'Unknown error' },
        };
    }
}

// ============================================
// Update Case Status Action
// ============================================

export async function updateCaseStatus(
    caseId: string,
    status: CaseStatus
): Promise<SubmitCaseResult> {
    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from('cases')
            .update({ status })
            .eq('id', caseId);

        if (error) {
            return {
                success: false,
                message: 'Gagal kemaskini status.',
                errors: { database: error.message },
            };
        }

        revalidatePath('/cases');
        revalidatePath(`/cases/${caseId}`);

        return {
            success: true,
            message: `Status berjaya dikemaskini kepada "${status}".`,
        };

    } catch (error) {
        return {
            success: false,
            message: 'Ralat tidak dijangka.',
            errors: { system: 'Unknown error' },
        };
    }
}
