// ============================================
// PERKESO Prosecution System
// Email Notification Utilities
// ============================================

// ============================================
// TYPES
// ============================================

export interface EmailNotification {
    to: string;
    subject: string;
    template: 'status_change' | 'review_request' | 'sanction_request' | 'compound_offer' | 'payment_received' | 'case_completed';
    data: Record<string, any>;
}

export interface EmailTemplate {
    subject: string;
    body: string;
}

// ============================================
// EMAIL TEMPLATES
// ============================================

export function getEmailTemplate(
    template: EmailNotification['template'],
    data: Record<string, any>
): EmailTemplate {
    const templates: Record<string, (data: Record<string, any>) => EmailTemplate> = {
        status_change: (data) => ({
            subject: `Status Kes ${data.case_number} Telah Berubah`,
            body: `
                <h2>Status Kes Telah Berubah</h2>
                <p>Kes <strong>${data.case_number}</strong> telah ditukar status kepada <strong>${data.new_status}</strong>.</p>
                <p><strong>Majikan:</strong> ${data.employer_name}</p>
                <p><strong>Ditukar oleh:</strong> ${data.changed_by}</p>
                <p><strong>Tarikh:</strong> ${data.date}</p>
                ${data.notes ? `<p><strong>Nota:</strong> ${data.notes}</p>` : ''}
                <p><a href="${data.case_url}">Lihat Kes</a></p>
            `,
        }),

        review_request: (data) => ({
            subject: `Kes ${data.case_number} Memerlukan Semakan`,
            body: `
                <h2>Kes Memerlukan Semakan</h2>
                <p>Kes <strong>${data.case_number}</strong> telah dihantar untuk semakan anda.</p>
                <p><strong>Majikan:</strong> ${data.employer_name}</p>
                <p><strong>Pegawai Penyiasat:</strong> ${data.io_name}</p>
                <p><strong>Jenis Kesalahan:</strong> ${data.offense_type}</p>
                <p><a href="${data.case_url}">Semak Kes</a></p>
            `,
        }),

        sanction_request: (data) => ({
            subject: `Kes ${data.case_number} Memerlukan Sanksi`,
            body: `
                <h2>Kes Memerlukan Sanksi</h2>
                <p>Kes <strong>${data.case_number}</strong> telah diluluskan untuk semakan dan memerlukan sanksi anda.</p>
                <p><strong>Majikan:</strong> ${data.employer_name}</p>
                <p><strong>Pegawai Pendakwa:</strong> ${data.po_name}</p>
                <p><a href="${data.case_url}">Berikan Sanksi</a></p>
            `,
        }),

        compound_offer: (data) => ({
            subject: `Tawaran Kompaun untuk Kes ${data.case_number}`,
            body: `
                <h2>Tawaran Kompaun</h2>
                <p>Kes <strong>${data.case_number}</strong> telah ditawarkan kompaun.</p>
                <p><strong>Jumlah Kompaun:</strong> RM ${data.amount}</p>
                <p><strong>Tarikh Luput:</strong> ${data.due_date}</p>
                <p><strong>Majikan:</strong> ${data.employer_name}</p>
                <p><a href="${data.case_url}">Lihat Tawaran Kompaun</a></p>
            `,
        }),

        payment_received: (data) => ({
            subject: `Bayaran Kompaun Diterima untuk Kes ${data.case_number}`,
            body: `
                <h2>Bayaran Kompaun Diterima</h2>
                <p>Bayaran kompaun untuk kes <strong>${data.case_number}</strong> telah diterima.</p>
                <p><strong>Jumlah:</strong> RM ${data.amount}</p>
                <p><strong>No. Resit:</strong> ${data.receipt_number}</p>
                <p><strong>Tarikh Bayaran:</strong> ${data.payment_date}</p>
            `,
        }),

        case_completed: (data) => ({
            subject: `Kes ${data.case_number} Telah Selesai`,
            body: `
                <h2>Kes Telah Selesai</h2>
                <p>Kes <strong>${data.case_number}</strong> telah ditandakan sebagai selesai.</p>
                <p><strong>Majikan:</strong> ${data.employer_name}</p>
                <p><strong>Status Akhir:</strong> ${data.final_status}</p>
                <p><a href="${data.case_url}">Lihat Kes</a></p>
            `,
        }),
    };

    const templateFn = templates[template];
    if (!templateFn) {
        return {
            subject: 'Notifikasi Sistem',
            body: '<p>Anda menerima notifikasi dari sistem PERKESO.</p>',
        };
    }

    return templateFn(data);
}

// ============================================
// EMAIL SENDING (Placeholder - requires email service integration)
// ============================================

/**
 * Send email notification
 * Note: This is a placeholder. In production, integrate with:
 * - Resend (https://resend.com)
 * - SendGrid (https://sendgrid.com)
 * - AWS SES
 * - Or other email service
 */
export async function sendEmailNotification(notification: EmailNotification): Promise<boolean> {
    try {
        // Get template
        const template = getEmailTemplate(notification.template, notification.data);

        // In production, call your email API here
        // Example with Resend:
        /*
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'PERKESO <noreply@perkeso.gov.my>',
                to: notification.to,
                subject: template.subject,
                html: template.body,
            }),
        });

        return response.ok;
        */

        // For now, just log (development mode)
        console.log('Email Notification:', {
            to: notification.to,
            subject: template.subject,
            template: notification.template,
        });

        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

// ============================================
// WORKFLOW NOTIFICATIONS
// ============================================

/**
 * Send notification for status change
 */
export async function notifyStatusChange(
    caseData: {
        case_number: string;
        employer_name: string;
        new_status: string;
        changed_by: string;
        case_url: string;
        notes?: string;
    },
    recipientEmail: string
): Promise<boolean> {
    return sendEmailNotification({
        to: recipientEmail,
        subject: '',
        template: 'status_change',
        data: {
            ...caseData,
            date: new Date().toLocaleDateString('ms-MY'),
        },
    });
}

/**
 * Send notification for review request
 */
export async function notifyReviewRequest(
    caseData: {
        case_number: string;
        employer_name: string;
        io_name: string;
        offense_type: string;
        case_url: string;
    },
    recipientEmail: string
): Promise<boolean> {
    return sendEmailNotification({
        to: recipientEmail,
        subject: '',
        template: 'review_request',
        data: caseData,
    });
}

/**
 * Send notification for sanction request
 */
export async function notifySanctionRequest(
    caseData: {
        case_number: string;
        employer_name: string;
        po_name: string;
        case_url: string;
    },
    recipientEmail: string
): Promise<boolean> {
    return sendEmailNotification({
        to: recipientEmail,
        subject: '',
        template: 'sanction_request',
        data: caseData,
    });
}
