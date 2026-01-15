// ============================================
// PERKESO Prosecution System
// Export Utilities (Excel/PDF/CSV)
// ============================================

// ============================================
// TYPES
// ============================================

export interface ExportOptions {
    format: 'excel' | 'csv' | 'pdf';
    filename?: string;
    includeHeaders?: boolean;
}

// ============================================
// CSV EXPORT
// ============================================

/**
 * Export data to CSV format
 */
export function exportToCSV(
    data: Record<string, any>[],
    filename: string = 'export.csv'
): void {
    if (data.length === 0) {
        alert('Tiada data untuk dieksport');
        return;
    }

    // Get headers from first row
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
        // Headers
        headers.map((h) => `"${h}"`).join(','),
        // Data rows
        ...data.map((row) =>
            headers
                .map((header) => {
                    const value = row[header];
                    if (value === null || value === undefined) return '""';
                    // Escape quotes and wrap in quotes
                    return `"${String(value).replace(/"/g, '""')}"`;
                })
                .join(',')
        ),
    ].join('\n');

    // Create blob and download
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ============================================
// EXCEL EXPORT (Using CSV format - compatible with Excel)
// ============================================

/**
 * Export data to Excel format (CSV with .xlsx extension)
 * Note: For true Excel format, would need a library like xlsx
 */
export function exportToExcel(
    data: Record<string, any>[],
    filename: string = 'export.xlsx'
): void {
    // For now, export as CSV with .xlsx extension
    // Excel will open it correctly
    exportToCSV(data, filename.replace('.xlsx', '.csv'));
}

// ============================================
// PDF EXPORT (Using window.print())
// ============================================

/**
 * Export to PDF using browser print dialog
 */
export function exportToPDF(elementId?: string): void {
    if (elementId) {
        // Print specific element
        const element = document.getElementById(elementId);
        if (!element) {
            alert('Elemen tidak dijumpai');
            return;
        }

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Pop-up blocker menghalang pembukaan tetingkap cetak');
            return;
        }

        printWindow.document.write(`
            <html>
                <head>
                    <title>Print</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        @media print {
                            @page { margin: 1cm; }
                        }
                    </style>
                </head>
                <body>
                    ${element.innerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    } else {
        // Print entire page
        window.print();
    }
}

// ============================================
// CASE DATA FORMATTING FOR EXPORT
// ============================================

export interface CaseExportData {
    'Nombor Kes': string;
    'Nama Majikan': string;
    'No. SSM': string;
    'Jenis Akta': string;
    'Jenis Kesalahan': string;
    'Tarikh Kesalahan': string;
    'Status': string;
    'Pegawai Penyiasat': string;
    'Tarikh Dibuat': string;
    'Tarikh Kemaskini': string;
}

/**
 * Format case data for export
 */
export function formatCaseForExport(caseData: any): CaseExportData {
    return {
        'Nombor Kes': caseData.case_number || '',
        'Nama Majikan': caseData.employer?.company_name || caseData.employer?.name || '',
        'No. SSM': caseData.employer?.ssm_number || caseData.employer?.ssm_no || '',
        'Jenis Akta': caseData.act_type || '',
        'Jenis Kesalahan': caseData.offense_type || '',
        'Tarikh Kesalahan': caseData.date_of_offense
            ? new Date(caseData.date_of_offense).toLocaleDateString('ms-MY')
            : '',
        'Status': caseData.status || '',
        'Pegawai Penyiasat': caseData.io?.full_name || caseData.io?.name || '',
        'Tarikh Dibuat': caseData.created_at
            ? new Date(caseData.created_at).toLocaleDateString('ms-MY')
            : '',
        'Tarikh Kemaskini': caseData.updated_at
            ? new Date(caseData.updated_at).toLocaleDateString('ms-MY')
            : '',
    };
}

// ============================================
// STATISTICS CALCULATION
// ============================================

export interface CaseStatistics {
    total: number;
    byStatus: Record<string, number>;
    byActType: Record<string, number>;
    byOffenseType: Record<string, number>;
    byMonth: Record<string, number>;
    averageResolutionDays: number;
    compoundTotal: number;
    prosecutionTotal: number;
}

/**
 * Calculate case statistics
 */
export function calculateCaseStatistics(cases: any[]): CaseStatistics {
    const stats: CaseStatistics = {
        total: cases.length,
        byStatus: {},
        byActType: {},
        byOffenseType: {},
        byMonth: {},
        averageResolutionDays: 0,
        compoundTotal: 0,
        prosecutionTotal: 0,
    };

    let totalResolutionDays = 0;
    let resolvedCount = 0;

    cases.forEach((caseItem) => {
        // By status
        const status = caseItem.status || 'unknown';
        stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

        // By act type
        const actType = caseItem.act_type || 'unknown';
        stats.byActType[actType] = (stats.byActType[actType] || 0) + 1;

        // By offense type
        const offenseType = caseItem.offense_type || 'unknown';
        stats.byOffenseType[offenseType] = (stats.byOffenseType[offenseType] || 0) + 1;

        // By month
        if (caseItem.created_at) {
            const date = new Date(caseItem.created_at);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            stats.byMonth[monthKey] = (stats.byMonth[monthKey] || 0) + 1;
        }

        // Resolution days (for completed cases)
        if (caseItem.status === 'selesai' && caseItem.created_at && caseItem.updated_at) {
            const created = new Date(caseItem.created_at);
            const updated = new Date(caseItem.updated_at);
            const days = Math.floor((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
            totalResolutionDays += days;
            resolvedCount++;
        }

        // Compound/Prosecution totals
        if (caseItem.status === 'dikompaun' || caseItem.status === 'selesai') {
            stats.compoundTotal += caseItem.compound_amount || 0;
        }
        if (caseItem.status === 'didakwa') {
            stats.prosecutionTotal++;
        }
    });

    // Average resolution days
    if (resolvedCount > 0) {
        stats.averageResolutionDays = Math.round(totalResolutionDays / resolvedCount);
    }

    return stats;
}
