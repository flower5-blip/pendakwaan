-- ============================================
-- PERKESO Prosecution System
-- COMPLETE DATABASE RESET & SETUP
-- Run this in Supabase SQL Editor
-- ============================================
-- WARNING: This will DROP and recreate all tables!
-- ============================================

-- ============================================
-- STEP 1: DROP ALL EXISTING TABLES
-- ============================================

DROP TABLE IF EXISTS audit_trail CASCADE;
DROP TABLE IF EXISTS chain_of_custody CASCADE;
DROP TABLE IF EXISTS charges CASCADE;
DROP TABLE IF EXISTS case_offenses CASCADE;
DROP TABLE IF EXISTS compound_offers CASCADE;
DROP TABLE IF EXISTS statements CASCADE;
DROP TABLE IF EXISTS evidences CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS employers CASCADE;
DROP TABLE IF EXISTS act_references CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS persons CASCADE;

-- Drop old types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS case_status CASCADE;
DROP TYPE IF EXISTS evidence_status CASCADE;
DROP TYPE IF EXISTS person_role CASCADE;
DROP TYPE IF EXISTS compound_status CASCADE;
DROP TYPE IF EXISTS recommendation CASCADE;
DROP TYPE IF EXISTS act_type CASCADE;

-- ============================================
-- STEP 2: CREATE ENUM TYPES
-- ============================================

CREATE TYPE user_role AS ENUM ('admin', 'io', 'po', 'uip', 'viewer');

CREATE TYPE case_status AS ENUM (
    'draft',
    'in_progress', 
    'pending_review',
    'approved',
    'filed',
    'closed',
    'compound_offered',
    'compound_paid',
    'prosecution',
    'completed',
    'nfa'
);

CREATE TYPE act_type AS ENUM ('akta_4', 'akta_800');

CREATE TYPE evidence_status AS ENUM ('collected', 'verified', 'submitted', 'returned');

CREATE TYPE person_role AS ENUM ('saksi', 'oks', 'oks_representative');

CREATE TYPE compound_status AS ENUM ('pending', 'paid', 'expired', 'cancelled');

CREATE TYPE recommendation AS ENUM ('compound', 'prosecute', 'nfa');

-- ============================================
-- STEP 3: CREATE TABLES
-- ============================================

-- Profiles (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'viewer',
    department TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employers
CREATE TABLE employers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    ssm_number TEXT,
    employer_code TEXT,
    address TEXT,
    postcode TEXT,
    city TEXT,
    state TEXT,
    owner_name TEXT,
    owner_ic TEXT,
    phone TEXT,
    email TEXT,
    business_type TEXT,
    registration_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cases
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number TEXT UNIQUE NOT NULL,
    employer_id UUID REFERENCES employers(id) ON DELETE SET NULL,
    io_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Offense Info
    act_type act_type NOT NULL,
    offense_type TEXT NOT NULL,
    date_of_offense DATE NOT NULL,
    time_of_offense TIME,
    location_of_offense TEXT,
    
    -- Sections
    section_charged TEXT NOT NULL,
    section_penalty TEXT NOT NULL,
    section_compound TEXT,
    
    -- Investigation
    inspection_date DATE,
    inspection_location TEXT,
    issue_summary TEXT,
    
    -- Arrears
    arrears_amount DECIMAL(15,2),
    arrears_period_start DATE,
    arrears_period_end DATE,
    total_employees_affected INTEGER,
    
    -- Status
    status case_status DEFAULT 'draft',
    recommendation recommendation,
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Employees (Pekerja Terlibat)
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    ic_number TEXT,
    position TEXT,
    employment_start_date DATE,
    employment_end_date DATE,
    monthly_salary DECIMAL(12,2),
    is_registered BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evidences (Bahan Bukti)
CREATE TABLE evidences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    exhibit_number TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    document_type TEXT,
    collected_date DATE,
    status evidence_status DEFAULT 'collected',
    file_path TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Statements (Pernyataan)
CREATE TABLE statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    person_name TEXT NOT NULL,
    person_ic TEXT,
    person_role person_role DEFAULT 'saksi',
    statement_date DATE,
    statement_time TIME,
    location TEXT,
    section_reference TEXT,
    content TEXT,
    summary TEXT,
    is_signed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compound Offers (Tawaran Kompaun)
CREATE TABLE compound_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    offer_number TEXT,
    offer_date DATE NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    status compound_status DEFAULT 'pending',
    paid_date DATE,
    paid_amount DECIMAL(12,2),
    receipt_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Act References (Rujukan Seksyen)
CREATE TABLE act_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kod TEXT UNIQUE NOT NULL,
    nama_kesalahan TEXT NOT NULL,
    jenis_akta act_type NOT NULL,
    seksyen_pertuduhan TEXT NOT NULL,
    seksyen_hukuman TEXT NOT NULL,
    seksyen_kompaun TEXT,
    denda_maksimum DECIMAL(12,2) DEFAULT 10000,
    penjara_maksimum TEXT DEFAULT '2 tahun',
    boleh_kompaun BOOLEAN DEFAULT true,
    catatan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Trail
CREATE TABLE audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
    old_data JSONB,
    new_data JSONB,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 4: CREATE INDEXES
-- ============================================

CREATE INDEX idx_cases_employer_id ON cases(employer_id);
CREATE INDEX idx_cases_io_id ON cases(io_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_act_type ON cases(act_type);
CREATE INDEX idx_employees_case_id ON employees(case_id);
CREATE INDEX idx_evidences_case_id ON evidences(case_id);
CREATE INDEX idx_statements_case_id ON statements(case_id);
CREATE INDEX idx_compound_offers_case_id ON compound_offers(case_id);
CREATE INDEX idx_audit_trail_table_record ON audit_trail(table_name, record_id);

-- ============================================
-- STEP 5: ENABLE RLS
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE compound_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE act_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 6: CREATE SIMPLE RLS POLICIES
-- (No recursion - prevents infinite loops)
-- ============================================

-- PROFILES
CREATE POLICY "profiles_select" ON profiles
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "profiles_insert" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- EMPLOYERS
CREATE POLICY "employers_all" ON employers
    FOR ALL USING (auth.uid() IS NOT NULL);

-- CASES
CREATE POLICY "cases_all" ON cases
    FOR ALL USING (auth.uid() IS NOT NULL);

-- EMPLOYEES
CREATE POLICY "employees_all" ON employees
    FOR ALL USING (auth.uid() IS NOT NULL);

-- EVIDENCES
CREATE POLICY "evidences_all" ON evidences
    FOR ALL USING (auth.uid() IS NOT NULL);

-- STATEMENTS
CREATE POLICY "statements_all" ON statements
    FOR ALL USING (auth.uid() IS NOT NULL);

-- COMPOUND OFFERS
CREATE POLICY "compound_offers_all" ON compound_offers
    FOR ALL USING (auth.uid() IS NOT NULL);

-- ACT REFERENCES (Read only for all)
CREATE POLICY "act_references_select" ON act_references
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- AUDIT TRAIL
CREATE POLICY "audit_trail_select" ON audit_trail
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "audit_trail_insert" ON audit_trail
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- STEP 7: CREATE TRIGGER FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_employers_updated_at
    BEFORE UPDATE ON employers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_cases_updated_at
    BEFORE UPDATE ON cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- STEP 8: SEED ACT REFERENCES DATA
-- ============================================

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
-- Akta 800
('A800_GAGAL_DAFTAR_PERUSAHAAN', 'Gagal daftar perusahaan', 'akta_800', 'Seksyen 14(1)', 'Seksyen 14(2)', 'Seksyen 77', true),
('A800_GAGAL_DAFTAR_PEKERJA', 'Gagal daftar/insurans pekerja', 'akta_800', 'Seksyen 16(1)', 'Seksyen 16(5)', 'Seksyen 77', true),
('A800_GAGAL_BAYAR_CARUMAN', 'Gagal bayar caruman SIP', 'akta_800', 'Seksyen 18(1)', 'Seksyen 18(4)', 'Seksyen 77', true),
('A800_POTONG_GAJI', 'Memotong gaji pekerja (syer majikan)', 'akta_800', 'Seksyen 24(1)', 'Seksyen 24(2)', 'Seksyen 77', true),
('A800_GAGAL_SIMPAN_REKOD', 'Gagal simpan daftar/rekod', 'akta_800', 'Seksyen 78(1)', 'Seksyen 78(3)', 'Seksyen 77', true),
('A800_HALANGAN_PEGAWAI', 'Halangan kepada pegawai', 'akta_800', 'Seksyen 72(1)', 'Seksyen 72(2)', 'Seksyen 77', true),
('A800_MAKLUMAT_PALSU', 'Maklumat palsu/mengelirukan', 'akta_800', 'Seksyen 79(1)', 'Seksyen 79(2)', 'Seksyen 77', true);

-- ============================================
-- STEP 9: CREATE FUNCTION FOR AUTO PROFILE
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'viewer'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 10: VERIFY SETUP
-- ============================================

-- Count tables
SELECT COUNT(*) as table_count FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- List all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================
-- DONE! Database is now synchronized.
-- ============================================
