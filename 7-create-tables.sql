-- ============================================
-- PERKESO Prosecution Database Schema
-- Supabase/PostgreSQL
-- ============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. ENUM TYPES
-- ============================================

-- Jenis Kesalahan
CREATE TYPE type_of_offense AS ENUM (
    'gagal_daftar_perusahaan',
    'gagal_daftar_pekerja',
    'gagal_bayar_caruman',
    'gagal_simpan_rekod',
    'potong_gaji_pekerja'
);

-- Status Kes
CREATE TYPE case_status AS ENUM (
    'draf',
    'dalam_siasatan',
    'menunggu_kompaun',
    'dikompaun',
    'menunggu_sanksi',
    'didakwa',
    'selesai'
);

-- ============================================
-- 2. JADUAL EMPLOYERS (Majikan)
-- ============================================

CREATE TABLE employers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_syarikat TEXT NOT NULL,
    no_ssm TEXT,
    alamat TEXT,
    tarikh_mula_operasi DATE,
    no_telefon TEXT,
    emel TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk carian
CREATE INDEX idx_employers_nama ON employers(nama_syarikat);
CREATE INDEX idx_employers_ssm ON employers(no_ssm);

-- ============================================
-- 3. JADUAL CASES (Kes)
-- ============================================

CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
    type_of_offense type_of_offense NOT NULL,
    act_type TEXT NOT NULL CHECK (act_type IN ('akta4', 'akta800')),
    act_section TEXT NOT NULL,
    penalty_section TEXT NOT NULL,
    status case_status DEFAULT 'draf',
    tarikh_kesalahan DATE,
    lokasi_kesalahan TEXT,
    nota TEXT,
    io_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_cases_employer ON cases(employer_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_io ON cases(io_id);

-- ============================================
-- 4. JADUAL EMPLOYEES (Pekerja)
-- ============================================

CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    nama_pekerja TEXT NOT NULL,
    no_ic TEXT,
    tarikh_masuk_kerja DATE,
    jawatan TEXT,
    gaji_bulanan DECIMAL(12,2),
    status_pendaftaran BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_employees_case ON employees(case_id);

-- ============================================
-- 5. TRIGGER: Auto-update updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to employers
CREATE TRIGGER update_employers_updated_at
    BEFORE UPDATE ON employers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to cases
CREATE TRIGGER update_cases_updated_at
    BEFORE UPDATE ON cases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES: EMPLOYERS
-- ============================================

-- Authenticated users can read all employers
CREATE POLICY "Authenticated users can read employers"
ON employers FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can insert employers
CREATE POLICY "Authenticated users can insert employers"
ON employers FOR INSERT
TO authenticated
WITH CHECK (true);

-- Authenticated users can update employers
CREATE POLICY "Authenticated users can update employers"
ON employers FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Authenticated users can delete employers
CREATE POLICY "Authenticated users can delete employers"
ON employers FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- RLS POLICIES: CASES
-- ============================================

-- Authenticated users can read all cases
CREATE POLICY "Authenticated users can read cases"
ON cases FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can insert cases
CREATE POLICY "Authenticated users can insert cases"
ON cases FOR INSERT
TO authenticated
WITH CHECK (true);

-- Authenticated users can update cases
CREATE POLICY "Authenticated users can update cases"
ON cases FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Authenticated users can delete cases
CREATE POLICY "Authenticated users can delete cases"
ON cases FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- RLS POLICIES: EMPLOYEES
-- ============================================

-- Authenticated users can read all employees
CREATE POLICY "Authenticated users can read employees"
ON employees FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can insert employees
CREATE POLICY "Authenticated users can insert employees"
ON employees FOR INSERT
TO authenticated
WITH CHECK (true);

-- Authenticated users can update employees
CREATE POLICY "Authenticated users can update employees"
ON employees FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Authenticated users can delete employees
CREATE POLICY "Authenticated users can delete employees"
ON employees FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- 7. SAMPLE DATA (Optional)
-- ============================================

-- Insert sample employer
INSERT INTO employers (nama_syarikat, no_ssm, alamat, tarikh_mula_operasi)
VALUES (
    'Syarikat Jaya Makmur Sdn Bhd',
    '1234567-A',
    'No. 123, Jalan Industri 5, Taman Perindustrian Puchong, 47100 Selangor',
    '2021-02-01'
);

-- Insert sample case
INSERT INTO cases (employer_id, type_of_offense, act_type, act_section, penalty_section, status, tarikh_kesalahan)
SELECT 
    id,
    'gagal_daftar_pekerja',
    'akta800',
    'Seksyen 16(1)',
    'Seksyen 16(5)',
    'draf',
    '2025-06-01'
FROM employers 
WHERE no_ssm = '1234567-A';

-- Insert sample employees
INSERT INTO employees (case_id, nama_pekerja, no_ic, tarikh_masuk_kerja, jawatan, gaji_bulanan)
SELECT 
    c.id,
    'Nurul Izzati Binti Ahmad',
    '950312-14-5432',
    '2025-03-01',
    'Kerani Akaun',
    2500.00
FROM cases c
JOIN employers e ON c.employer_id = e.id
WHERE e.no_ssm = '1234567-A';
