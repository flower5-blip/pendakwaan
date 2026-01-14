// ============================================
// src/components/PrintButton.tsx
// Butang Cetak Dokumen dengan .no-print
// ============================================

'use client';

import { Printer } from 'lucide-react';

interface PrintButtonProps {
    label?: string;
    className?: string;
    variant?: 'primary' | 'secondary' | 'outline';
}

export default function PrintButton({
    label = 'Cetak Dokumen',
    className = '',
    variant = 'primary',
}: PrintButtonProps) {

    const handlePrint = () => {
        window.print();
    };

    // Variant styles
    const variantStyles = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
        outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
    };

    return (
        <button
            onClick={handlePrint}
            className={`
        no-print
        inline-flex items-center gap-2 
        px-4 py-2 rounded-lg font-medium 
        transition-colors duration-200
        print:hidden
        ${variantStyles[variant]}
        ${className}
      `}
        >
            <Printer className="w-5 h-5" />
            <span>{label}</span>
        </button>
    );
}

// ============================================
// Alternative: Text Icon Version (tanpa lucide-react)
// ============================================

export function PrintButtonSimple({
    label = 'Cetak Dokumen',
    className = '',
}: {
    label?: string;
    className?: string;
}) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <button
            onClick={handlePrint}
            className={`
        no-print
        inline-flex items-center gap-2 
        px-4 py-2 rounded-lg font-medium 
        bg-blue-600 hover:bg-blue-700 text-white
        transition-colors duration-200
        print:hidden
        ${className}
      `}
        >
            <span className="text-lg">🖨️</span>
            <span>{label}</span>
        </button>
    );
}

// ============================================
// Usage Example in Case Detail Page:
// ============================================
/*
import PrintButton, { PrintButtonSimple } from '@/components/PrintButton';

// Dalam halaman butiran kes:
<div className="flex justify-end gap-4 mb-6">
  <Link href={`/cases/${id}/edit`} className="no-print ...">
    Edit Kes
  </Link>
  
  <PrintButton />
  
  // atau tanpa lucide-react:
  <PrintButtonSimple />
</div>
*/
