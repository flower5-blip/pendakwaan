-- ============================================
-- PERKESO PROSECUTION SYSTEM
-- Complete Database Schema for Supabase (PostgreSQL)
-- Version: 2.0
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. ENUM TYPES
-- ============================================

-- Jenis Akta
CREATE TYPE act_type_enum AS ENUM (
    'Akta 4',
    'Akta 800'
);

-- Jenis Kesalahan
CREATE TYPE offense_type_enum AS ENUM (
    'Gagal Daftar Perusahaan',
    'Gagal Daftar Pekerja',
    'Lewat Daftar',
    'Gagal Bayar Caruman',
    'Gagal Simpan Rekod',
    'Potong Gaji Pekerja'
);

-- Status Kes
CREATE TYPE case_status_enum AS ENUM (
    'Draft',
    'Pending Approval',
    'Approved',
    'Compound Offered',
    'Compound Paid',
    'Prosecution',
    'Completed',
    'NFA'
);

-- Status Bukti
CREATE TYPE evidence_status_enum AS ENUM (
    'Collected',
    'Verified',
    'Submitted',
    'Returned'
);

-- ============================================
-- 2. TABEL users_io (Pegawai Penyiasat)
-- Linked dengan auth.users Supabase
-- ============================================

CREATE TABLE users_io (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    position TEXT NOT NULL DEFAULT 'Pegawai Penyiasat',
    station TEXT NOT NULL,
    authority_card_no TEXT,
    phone TEXT,
    email TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_users_io_station ON users_io(station);

-- Comment
COMMENT ON TABLE users_io IS 'Jadual pegawai penyiasat PERKESO. Linked dengan Supabase auth.users';

-- ============================================
-- 3. TABEL employers (Orang Kena Saman / Majikan)
-- ============================================

CREATE TABLE employers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    ssm_number TEXT,
    employer_code TEXT,
    industry_code TEXT,
    industry_description TEXT,
    address TEXT,
    postcode TEXT,
    city TEXT,
    state TEXT,
    owner_name TEXT,
    owner_ic TEXT,
    phone TEXT,
    email TEXT,
    operation_start_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_employers_company_name ON employers(company_name);
CREATE INDEX idx_employers_ssm ON employers(ssm_number);
CREATE INDEX idx_employers_state ON employers(state);

-- Comment
COMMENT ON TABLE employers IS 'Jadual majikan / OKS (Orang Kena Saman)';

-- ============================================
-- 4. TABEL cases (Fail Siasatan)
-- ============================================

CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number TEXT UNIQUE NOT NULL,
    employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE RESTRICT,
    investigating_officer_id UUID REFERENCES users_io(id) ON DELETE SET NULL,
    
    -- Maklumat Kesalahan
    act_type act_type_enum NOT NULL,
    offense_type offense_type_enum NOT NULL,
    date_of_offense DATE NOT NULL,
    time_of_offense TIME,
    location_of_offense TEXT,
    
    -- Seksyen Pertuduhan
    section_charged TEXT NOT NULL,
    section_penalty TEXT NOT NULL,
    section_compound TEXT,
    
    -- Maklumat Siasatan
    inspection_date DATE,
    inspection_location TEXT,
    
    -- Tunggakan (jika ada)
    arrears_start_date DATE,
    arrears_end_date DATE,
    arrears_amount DECIMAL(15,2),
    interest_amount DECIMAL(15,2),
    total_employees_affected INTEGER,
    
    -- Status & Recommendation
    status case_status_enum DEFAULT 'Draft',
    recommendation TEXT CHECK (recommendation IN ('compound', 'prosecute', 'nfa')),
    
    -- Kompaun (jika ada)
    compound_amount DECIMAL(12,2),
    compound_offer_date DATE,
    compound_payment_date DATE,
    compound_status TEXT,
    
    -- Notes & Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users_io(id)
);

-- Indexes
CREATE INDEX idx_cases_employer ON cases(employer_id);
CREATE INDEX idx_cases_io ON cases(investigating_officer_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_act_type ON cases(act_type);
CREATE INDEX idx_cases_date ON cases(date_of_offense);

-- Comment
COMMENT ON TABLE cases IS 'Jadual kes siasatan pendakwaan PERKESO';

-- ============================================
-- 5. TABEL evidences (Senarai Bukti)
-- ============================================

CREATE TABLE evidences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    
    -- Maklumat Bukti
    exhibit_number TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    document_type TEXT,
    
    -- Pengumpulan
    collected_date DATE,
    collected_location TEXT,
    collected_by UUID REFERENCES users_io(id),
    
    -- Fail Digital (jika ada)
    file_url TEXT,
    file_type TEXT,
    file_size INTEGER,
    
    -- Status
    status evidence_status_enum DEFAULT 'Collected',
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_evidences_case ON evidences(case_id);

-- Comment
COMMENT ON TABLE evidences IS 'Jadual bukti/dokumen yang disita untuk kes pendakwaan';

-- ============================================
-- 6. TABEL employees (Pekerja Terlibat)
-- ============================================

CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    
    -- Maklumat Pekerja
    full_name TEXT NOT NULL,
    ic_number TEXT,
    position TEXT,
    employment_start_date DATE,
    employment_end_date DATE,
    monthly_salary DECIMAL(12,2),
    
    -- Status Pendaftaran
    is_registered BOOLEAN DEFAULT false,
    registration_date DATE,
    
    -- Role dalam kes
    role_in_case TEXT DEFAULT 'affected_employee',
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_employees_case ON employees(case_id);

-- Comment
COMMENT ON TABLE employees IS 'Jadual pekerja yang terlibat dalam kes pendakwaan';

-- ============================================
-- 7. TABEL statements (Rakaman Percakapan)
-- ============================================

CREATE TABLE statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    
    -- Pemberi Pernyataan
    person_name TEXT NOT NULL,
    person_ic TEXT,
    person_role TEXT,
    
    -- Maklumat Rakaman
    statement_date DATE NOT NULL,
    statement_time TIME,
    location TEXT,
    section_reference TEXT,
    
    -- Kandungan
    content TEXT,
    summary TEXT,
    
    -- Bahasa & Penterjemah
    language TEXT DEFAULT 'Bahasa Melayu',
    interpreter_name TEXT,
    
    -- Tandatangan
    is_signed BOOLEAN DEFAULT false,
    signature_url TEXT,
    
    -- Metadata
    recorded_by UUID REFERENCES users_io(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_statements_case ON statements(case_id);

-- Comment
COMMENT ON TABLE statements IS 'Jadual rakaman percakapan di bawah Seksyen 12C/70';

-- ============================================
-- 8. TABEL act_references (Rujukan Seksyen Akta)
-- ============================================

CREATE TABLE act_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    act_name TEXT NOT NULL,
    offense_name TEXT NOT NULL,
    charge_section TEXT NOT NULL,
    penalty_section TEXT NOT NULL,
    compound_section TEXT,
    statement_section TEXT,
    max_fine DECIMAL(12,2) DEFAULT 10000,
    max_imprisonment TEXT DEFAULT '2 tahun',
    is_compoundable BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Data - Akta 4
INSERT INTO act_references (code, act_name, offense_name, charge_section, penalty_section, compound_section, statement_section) VALUES
('A4_01', 'Akta 4', 'Gagal Daftar Perusahaan', 'Seksyen 4', 'Seksyen 94(g)', 'Seksyen 95A', 'Seksyen 12C'),
('A4_02', 'Akta 4', 'Gagal Daftar Pekerja', 'Seksyen 5', 'Seksyen 94(g)', 'Seksyen 95A', 'Seksyen 12C'),
('A4_03', 'Akta 4', 'Gagal Bayar Caruman', 'Seksyen 6', 'Seksyen 94(a)', 'Seksyen 95A', 'Seksyen 12C'),
('A4_04', 'Akta 4', 'Potong Gaji Pekerja', 'Seksyen 7(3)', 'Seksyen 94(b)', 'Seksyen 95A', 'Seksyen 12C'),
('A4_05', 'Akta 4', 'Gagal Simpan Rekod', 'Seksyen 11(3)', 'Seksyen 94(g)', 'Seksyen 95A', 'Seksyen 12C'),
('A4_06', 'Akta 4', 'Gagal Kemukakan Dokumen', 'Seksyen 12B', 'Seksyen 94(g)', 'Seksyen 95A', 'Seksyen 12C'),
('A4_07', 'Akta 4', 'Halangan Kepada Pegawai', 'Seksyen 12A(4)', 'Seksyen 94(g)', 'Seksyen 95A', 'Seksyen 12C'),
('A4_08', 'Akta 4', 'Maklumat Palsu', 'Seksyen 94(d)', 'Seksyen 94(d)', 'Seksyen 95A', 'Seksyen 12C');

-- Seed Data - Akta 800
INSERT INTO act_references (code, act_name, offense_name, charge_section, penalty_section, compound_section, statement_section) VALUES
('A800_01', 'Akta 800', 'Gagal Daftar Perusahaan', 'Seksyen 14(1)', 'Seksyen 14(2)', 'Seksyen 77', 'Seksyen 69 & 70'),
('A800_02', 'Akta 800', 'Gagal Daftar Pekerja', 'Seksyen 16(1)', 'Seksyen 16(5)', 'Seksyen 77', 'Seksyen 69 & 70'),
('A800_03', 'Akta 800', 'Gagal Bayar Caruman', 'Seksyen 18(1)', 'Seksyen 18(4)', 'Seksyen 77', 'Seksyen 69 & 70'),
('A800_04', 'Akta 800', 'Potong Gaji Pekerja', 'Seksyen 24(1)', 'Seksyen 24(2)', 'Seksyen 77', 'Seksyen 69 & 70'),
('A800_05', 'Akta 800', 'Gagal Simpan Rekod', 'Seksyen 78(1)', 'Seksyen 78(3)', 'Seksyen 77', 'Seksyen 69 & 70'),
('A800_06', 'Akta 800', 'Halangan Kepada Pegawai', 'Seksyen 72(1)', 'Seksyen 72(2)', 'Seksyen 77', 'Seksyen 69 & 70'),
('A800_07', 'Akta 800', 'Maklumat Palsu', 'Seksyen 79(1)', 'Seksyen 79(2)', 'Seksyen 77', 'Seksyen 69 & 70');

-- Comment
COMMENT ON TABLE act_references IS 'Jadual rujukan seksyen kesalahan dan hukuman Akta 4 & 800';

-- ============================================
-- 9. TRIGGER: Auto-update updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_users_io_updated_at
    BEFORE UPDATE ON users_io
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employers_updated_at
    BEFORE UPDATE ON employers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at
    BEFORE UPDATE ON cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE users_io ENABLE ROW LEVEL SECURITY;
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE act_references ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES: users_io
-- ============================================

CREATE POLICY "Users can view own profile"
ON users_io FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON users_io FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON users_io FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated can view all IO"
ON users_io FOR SELECT
TO authenticated
USING (true);

-- ============================================
-- RLS POLICIES: employers
-- ============================================

CREATE POLICY "Authenticated users can read employers"
ON employers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert employers"
ON employers FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update employers"
ON employers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete employers"
ON employers FOR DELETE TO authenticated USING (true);

-- ============================================
-- RLS POLICIES: cases
-- ============================================

CREATE POLICY "Authenticated users can read cases"
ON cases FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert cases"
ON cases FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update cases"
ON cases FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete cases"
ON cases FOR DELETE TO authenticated USING (true);

-- ============================================
-- RLS POLICIES: evidences
-- ============================================

CREATE POLICY "Authenticated users can read evidences"
ON evidences FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert evidences"
ON evidences FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update evidences"
ON evidences FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete evidences"
ON evidences FOR DELETE TO authenticated USING (true);

-- ============================================
-- RLS POLICIES: employees
-- ============================================

CREATE POLICY "Authenticated users can read employees"
ON employees FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert employees"
ON employees FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update employees"
ON employees FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete employees"
ON employees FOR DELETE TO authenticated USING (true);

-- ============================================
-- RLS POLICIES: statements
-- ============================================

CREATE POLICY "Authenticated users can read statements"
ON statements FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert statements"
ON statements FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update statements"
ON statements FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete statements"
ON statements FOR DELETE TO authenticated USING (true);

-- ============================================
-- RLS POLICIES: act_references (Read-only for all)
-- ============================================

CREATE POLICY "Anyone can read act references"
ON act_references FOR SELECT TO authenticated USING (true);

-- ============================================
-- 11. HELPER FUNCTION: Generate Case Number
-- ============================================

CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    seq_num INTEGER;
    case_num TEXT;
BEGIN
    year_part := TO_CHAR(NOW(), 'YYYY');
    
    SELECT COALESCE(MAX(
        CAST(SPLIT_PART(case_number, '/', 3) AS INTEGER)
    ), 0) + 1
    INTO seq_num
    FROM cases
    WHERE case_number LIKE 'KES/' || year_part || '/%';
    
    case_num := 'KES/' || year_part || '/' || LPAD(seq_num::TEXT, 5, '0');
    
    RETURN case_num;
END;
$$ LANGUAGE plpgsql;

-- Comment
COMMENT ON FUNCTION generate_case_number IS 'Menjana nombor kes automatik: KES/YYYY/00001';

-- ============================================
-- SCHEMA COMPLETE!
-- ============================================
