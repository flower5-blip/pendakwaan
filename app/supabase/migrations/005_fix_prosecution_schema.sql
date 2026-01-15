-- ============================================
-- PERKESO Prosecution System
-- Migration 005: Fix Prosecution Schema & Add Missing Tables
-- ============================================
-- This migration fixes the critical schema issues identified in audit
-- 1. Add missing prosecution fields to cases table
-- 2. Create act_references table (from 5-act-references.csv)
-- 3. Create case_offenses linking table
-- 4. Create chain_of_custody table
-- 5. Create charges table for pertuduhan records
-- ============================================

-- ============================================
-- 1. ADD MISSING FIELDS TO CASES TABLE
-- ============================================

-- Add missing prosecution fields (if not already added by migration 002)
ALTER TABLE cases 
ADD COLUMN IF NOT EXISTS punca_siasatan TEXT,
ADD COLUMN IF NOT EXISTS tarikh_mula_layak DATE,
ADD COLUMN IF NOT EXISTS tempoh_tunggakan_mula DATE,
ADD COLUMN IF NOT EXISTS tempoh_tunggakan_tamat DATE,
ADD COLUMN IF NOT EXISTS jumlah_caruman DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS jumlah_fclb DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS bil_pekerja_terlibat INTEGER,
ADD COLUMN IF NOT EXISTS notis_pematuhan BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS syor_io TEXT CHECK (syor_io IN ('kompaun', 'dakwa', 'nfa'));

-- Ensure all prosecution fields exist
DO $$
BEGIN
    -- Check and add offense_type if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' AND column_name = 'offense_type'
    ) THEN
        ALTER TABLE cases ADD COLUMN offense_type TEXT;
    END IF;

    -- Check and add date_of_offense if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' AND column_name = 'date_of_offense'
    ) THEN
        ALTER TABLE cases ADD COLUMN date_of_offense DATE;
    END IF;

    -- Check and add section_charged if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' AND column_name = 'section_charged'
    ) THEN
        ALTER TABLE cases ADD COLUMN section_charged TEXT;
    END IF;

    -- Check and add section_penalty if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' AND column_name = 'section_penalty'
    ) THEN
        ALTER TABLE cases ADD COLUMN section_penalty TEXT;
    END IF;

    -- Check and add section_compound if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' AND column_name = 'section_compound'
    ) THEN
        ALTER TABLE cases ADD COLUMN section_compound TEXT;
    END IF;
END $$;

-- ============================================
-- 2. CREATE ACT_REFERENCES TABLE
-- Reference table for offense types and sections
-- ============================================

CREATE TABLE IF NOT EXISTS act_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kod TEXT UNIQUE NOT NULL,
    nama_kesalahan TEXT NOT NULL,
    jenis_akta TEXT NOT NULL CHECK (jenis_akta IN ('akta4', 'akta800', 'akta_4', 'akta_800', 'Akta 4', 'Akta 800')),
    seksyen_pertuduhan TEXT NOT NULL,
    seksyen_hukuman TEXT NOT NULL,
    seksyen_kompaun TEXT,
    seksyen_rakaman TEXT,
    denda_maksimum DECIMAL(12,2) DEFAULT 10000,
    penjara_maksimum TEXT DEFAULT '2 tahun',
    boleh_kompaun BOOLEAN DEFAULT true,
    catatan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_act_references_kod ON act_references(kod);
CREATE INDEX IF NOT EXISTS idx_act_references_jenis_akta ON act_references(jenis_akta);

-- Enable RLS
ALTER TABLE act_references ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Read-only for all authenticated users
CREATE POLICY "Authenticated users can read act_references" ON act_references
    FOR SELECT TO authenticated USING (true);

-- Seed data from 5-act-references.csv
INSERT INTO act_references (kod, nama_kesalahan, jenis_akta, seksyen_pertuduhan, seksyen_hukuman, seksyen_kompaun, boleh_kompaun) VALUES
-- Akta 4
('A4_GAGAL_DAFTAR_PERUSAHAAN', 'Gagal daftar perusahaan', 'akta_4', 'Seksyen 4', 'Seksyen 94(g)', 'Seksyen 95A', true),
('A4_GAGAL_DAFTAR_PEKERJA', 'Gagal daftar/insurans pekerja', 'akta_4', 'Seksyen 5', 'Seksyen 94(g)', 'Seksyen 95A', true),
('A4_GAGAL_BAYAR_CARUMAN', 'Gagal bayar caruman', 'akta_4', 'Seksyen 6', 'Seksyen 94(a)', 'Seksyen 95A', true),
('A4_POTONG_GAJI', 'Memotong gaji pekerja (syer majikan)', 'akta_4', 'Seksyen 7(3)', 'Seksyen 94(b)', 'Seksyen 95A', true),
('A4_GAGAL_SIMPAN_REKOD', 'Gagal simpan daftar/rekod pekerja', 'akta_4', 'Seksyen 11(3)', 'Seksyen 94(g)', 'Seksyen 95A', true),
('A4_GAGAL_KEMUKAKAN_DOKUMEN', 'Gagal kemukakan dokumen/rekod', 'akta_4', 'Seksyen 12B', 'Seksyen 94(g)', 'Seksyen 95A', true),
('A4_HALANGAN_PEGAWAI', 'Halangan kepada pegawai', 'akta_4', 'Seksyen 12A(4)', 'Seksyen 94(g)', 'Seksyen 95A', true),
('A4_MAKLUMAT_PALSU', 'Maklumat palsu/mengelirukan', 'akta_4', 'Seksyen 94(d)', 'Seksyen 94(d)', 'Seksyen 95A', true),
('A4_GAGAL_MAKLUM_PERUBAHAN', 'Gagal maklum perubahan butiran', 'akta_4', 'Seksyen 9', 'Seksyen 94(g)', 'Seksyen 95A', true),
-- Akta 800
('A800_GAGAL_DAFTAR_PERUSAHAAN', 'Gagal daftar perusahaan', 'akta_800', 'Seksyen 14(1)', 'Seksyen 14(2)', 'Seksyen 77', true),
('A800_GAGAL_DAFTAR_PEKERJA', 'Gagal daftar/insurans pekerja', 'akta_800', 'Seksyen 16(1)', 'Seksyen 16(5)', 'Seksyen 77', true),
('A800_GAGAL_BAYAR_CARUMAN', 'Gagal bayar caruman SIP', 'akta_800', 'Seksyen 18(1)', 'Seksyen 18(4)', 'Seksyen 77', true),
('A800_POTONG_GAJI', 'Memotong gaji pekerja (syer majikan)', 'akta_800', 'Seksyen 24(1)', 'Seksyen 24(2)', 'Seksyen 77', true),
('A800_GAGAL_SIMPAN_REKOD', 'Gagal simpan daftar/rekod', 'akta_800', 'Seksyen 78(1)', 'Seksyen 78(3)', 'Seksyen 77', true),
('A800_HALANGAN_PEGAWAI', 'Halangan kepada pegawai', 'akta_800', 'Seksyen 72(1)', 'Seksyen 72(2)', 'Seksyen 77', true),
('A800_MAKLUMAT_PALSU', 'Maklumat palsu/mengelirukan', 'akta_800', 'Seksyen 79(1)', 'Seksyen 79(2)', 'Seksyen 77', true),
('A800_GAGAL_MAKLUM_PERUBAHAN', 'Gagal maklum perubahan butiran', 'akta_800', 'Seksyen 15(1)', 'Seksyen 15(2)', 'Seksyen 77', true)
ON CONFLICT (kod) DO NOTHING;

-- ============================================
-- 3. CREATE CASE_OFFENSES TABLE
-- Linking table: kes ↔ jenis kesalahan
-- ============================================

CREATE TABLE IF NOT EXISTS case_offenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kes_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    jenis_kesalahan_id UUID REFERENCES act_references(id),
    tarikh_kesalahan DATE NOT NULL,
    masa_kesalahan TIME,
    tempat_kesalahan TEXT,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_case_offenses_kes_id ON case_offenses(kes_id);
CREATE INDEX IF NOT EXISTS idx_case_offenses_jenis_kesalahan_id ON case_offenses(jenis_kesalahan_id);

-- Enable RLS
ALTER TABLE case_offenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view case_offenses" ON case_offenses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cases c
            WHERE c.id = case_offenses.kes_id
            AND (
                c.io_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() AND role IN ('admin', 'po', 'uip')
                )
            )
        )
    );

CREATE POLICY "IO and Admin can manage case_offenses" ON case_offenses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM cases c
            WHERE c.id = case_offenses.kes_id
            AND (
                c.io_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() AND role = 'admin'
                )
            )
        )
    );

-- ============================================
-- 4. CREATE CHAIN_OF_CUSTODY TABLE
-- Track evidence chain of custody
-- ============================================

CREATE TABLE IF NOT EXISTS chain_of_custody (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bukti_id UUID REFERENCES evidences(id) ON DELETE CASCADE,
    tindakan TEXT NOT NULL,
    dari_pihak TEXT,
    kepada_pihak TEXT,
    lokasi TEXT,
    tarikh_masa TIMESTAMPTZ DEFAULT NOW(),
    nota TEXT,
    direkod_oleh UUID REFERENCES profiles(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chain_of_custody_bukti_id ON chain_of_custody(bukti_id);
CREATE INDEX IF NOT EXISTS idx_chain_of_custody_tarikh_masa ON chain_of_custody(tarikh_masa);

-- Enable RLS
ALTER TABLE chain_of_custody ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view chain_of_custody" ON chain_of_custody
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM evidences e
            JOIN cases c ON e.case_id = c.id
            WHERE e.id = chain_of_custody.bukti_id
            AND (
                c.io_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() AND role IN ('admin', 'po', 'uip')
                )
            )
        )
    );

CREATE POLICY "IO and Admin can manage chain_of_custody" ON chain_of_custody
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM evidences e
            JOIN cases c ON e.case_id = c.id
            WHERE e.id = chain_of_custody.bukti_id
            AND (
                c.io_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() AND role = 'admin'
                )
            )
        )
    );

-- ============================================
-- 5. CREATE CHARGES TABLE
-- For pertuduhan (charge sheet) records
-- ============================================

CREATE TABLE IF NOT EXISTS charges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kes_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    no_pertuduhan TEXT,
    daerah_mahkamah TEXT,
    negeri_mahkamah TEXT,
    tarikh_pertuduhan DATE,
    kandungan TEXT,
    jenis_kesalahan_id UUID REFERENCES act_references(id),
    status TEXT DEFAULT 'draf' CHECK (status IN ('draf', 'sedia', 'difailkan')),
    dibuat_oleh UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_charges_kes_id ON charges(kes_id);
CREATE INDEX IF NOT EXISTS idx_charges_status ON charges(status);

-- Enable RLS
ALTER TABLE charges ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view charges" ON charges
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cases c
            WHERE c.id = charges.kes_id
            AND (
                c.io_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() AND role IN ('admin', 'po', 'uip')
                )
            )
        )
    );

CREATE POLICY "IO and Admin can manage charges" ON charges
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM cases c
            WHERE c.id = charges.kes_id
            AND (
                c.io_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() AND role = 'admin'
                )
            )
        )
    );

-- ============================================
-- 6. UPDATE TRIGGER FOR CHARGES UPDATED_AT
-- ============================================

CREATE TRIGGER update_charges_updated_at
    BEFORE UPDATE ON charges
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 7. ADD COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE act_references IS 'Jadual rujukan seksyen kesalahan dan hukuman Akta 4 & 800';
COMMENT ON TABLE case_offenses IS 'Jadual link kes ↔ jenis kesalahan (many-to-many)';
COMMENT ON TABLE chain_of_custody IS 'Rantaian jagaan bukti - track semua perpindahan bukti';
COMMENT ON TABLE charges IS 'Kertas pertuduhan - rekod pertuduhan yang difailkan';

-- ============================================
-- DONE
-- ============================================
