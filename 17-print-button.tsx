// ============================================
// src/app/cases/[id]/PrintButton.tsx
// Client Component untuk Print Button
// ============================================

'use client';

export default function PrintButton() {
    const handlePrint = () => {
        window.print();
    };

    return (
        <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center gap-2"
        >
            🖨️ Cetak / Simpan PDF
        </button>
    );
}
