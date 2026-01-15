-- ============================================
-- Migration: Add Izin Dakwa (Consent to Prosecute) Table
-- PERKESO Prosecution System
-- Version: 2026-01-15
-- ============================================

-- Jadual untuk merekod izin/kelulusan pendakwaan
-- Diperlukan menurut Seksyen 95 Akta 4 dan Seksyen 76 Akta 800

CREATE TABLE IF NOT EXISTS izin_dakwa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    
    -- Maklumat Permohonan
    request_date DATE NOT NULL DEFAULT CURRENT_DATE,
    section_reference TEXT NOT NULL,          -- e.g. "Seksyen 95 Akta 4" atau "Seksyen 76 Akta 800"
    requested_by UUID REFERENCES profiles(id),
    request_notes TEXT,
    
    -- Status Kelulusan
    status TEXT CHECK (status IN ('diminta', 'diluluskan', 'ditolak')) DEFAULT 'diminta',
    
    -- Maklumat Kelulusan
    approved_date DATE,
    approved_by UUID REFERENCES profiles(id),
    approval_notes TEXT,
    
    -- Dokumen Sokongan (jika ada)
    document_url TEXT,
    document_name TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_izin_dakwa_case ON izin_dakwa(case_id);
CREATE INDEX IF NOT EXISTS idx_izin_dakwa_status ON izin_dakwa(status);

-- Trigger untuk auto-update updated_at
CREATE OR REPLACE FUNCTION update_izin_dakwa_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_izin_dakwa_updated_at ON izin_dakwa;
CREATE TRIGGER update_izin_dakwa_updated_at
    BEFORE UPDATE ON izin_dakwa
    FOR EACH ROW
    EXECUTE FUNCTION update_izin_dakwa_updated_at();

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE izin_dakwa ENABLE ROW LEVEL SECURITY;

-- Semua user authenticated boleh baca
CREATE POLICY "Authenticated users can read izin_dakwa"
ON izin_dakwa FOR SELECT
TO authenticated
USING (true);

-- Hanya IO dan Admin boleh insert permohonan
CREATE POLICY "IO and Admin can insert izin_dakwa"
ON izin_dakwa FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('io', 'admin')
    )
);

-- Hanya UIP dan Admin boleh update (meluluskan/menolak)
CREATE POLICY "UIP and Admin can update izin_dakwa"
ON izin_dakwa FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('uip', 'admin')
    )
);

-- Hanya Admin boleh delete
CREATE POLICY "Admin can delete izin_dakwa"
ON izin_dakwa FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE izin_dakwa IS 'Jadual izin pendakwaan (Consent to Prosecute) mengikut Seksyen 95 Akta 4 / Seksyen 76 Akta 800';
COMMENT ON COLUMN izin_dakwa.section_reference IS 'Rujukan seksyen akta yang memerlukan izin pendakwaan';
COMMENT ON COLUMN izin_dakwa.status IS 'Status izin: diminta, diluluskan, atau ditolak';
