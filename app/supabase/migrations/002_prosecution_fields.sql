-- ============================================
-- PERKESO Prosecution - Extended Schema
-- Migration 002: Add prosecution-specific fields
-- ============================================

-- ============================================
-- 1. ALTER EMPLOYERS TABLE
-- Add missing owner and state fields
-- ============================================

ALTER TABLE employers 
ADD COLUMN IF NOT EXISTS company_name TEXT;

-- Copy name to company_name if exists
UPDATE employers SET company_name = name WHERE company_name IS NULL;

ALTER TABLE employers 
ADD COLUMN IF NOT EXISTS owner_name TEXT,
ADD COLUMN IF NOT EXISTS owner_ic TEXT,
ADD COLUMN IF NOT EXISTS employer_code TEXT,
ADD COLUMN IF NOT EXISTS postcode TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT;

-- ============================================
-- 2. ALTER CASES TABLE
-- Add offense and section fields
-- ============================================

-- Change act_type constraint to support new format
ALTER TABLE cases DROP CONSTRAINT IF EXISTS cases_act_type_check;
ALTER TABLE cases ADD CONSTRAINT cases_act_type_check 
    CHECK (act_type IN ('akta4', 'akta800', 'both', 'akta_4', 'akta_800', 'Akta 4', 'Akta 800'));

-- Add offense-related columns
ALTER TABLE cases 
ADD COLUMN IF NOT EXISTS offense_type TEXT,
ADD COLUMN IF NOT EXISTS date_of_offense DATE,
ADD COLUMN IF NOT EXISTS time_of_offense TIME,
ADD COLUMN IF NOT EXISTS location_of_offense TEXT;

-- Add section columns
ALTER TABLE cases 
ADD COLUMN IF NOT EXISTS section_charged TEXT,
ADD COLUMN IF NOT EXISTS section_penalty TEXT,
ADD COLUMN IF NOT EXISTS section_compound TEXT;

-- Add arrears columns
ALTER TABLE cases 
ADD COLUMN IF NOT EXISTS arrears_amount DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS arrears_period_start DATE,
ADD COLUMN IF NOT EXISTS arrears_period_end DATE,
ADD COLUMN IF NOT EXISTS total_employees_affected INTEGER;

-- Add recommendation and extended status
ALTER TABLE cases 
ADD COLUMN IF NOT EXISTS recommendation TEXT CHECK (recommendation IN ('compound', 'prosecute', 'nfa'));

-- ============================================
-- 3. CREATE EMPLOYEES TABLE
-- For affected workers
-- ============================================

CREATE TABLE IF NOT EXISTS employees (
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

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Policies for employees
CREATE POLICY "Users can view employees" ON employees
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cases c
            WHERE c.id = employees.case_id
            AND (
                c.io_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() AND role IN ('admin', 'po', 'uip')
                )
            )
        )
    );

CREATE POLICY "IO and Admin can manage employees" ON employees
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM cases c
            WHERE c.id = employees.case_id
            AND (
                c.io_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() AND role = 'admin'
                )
            )
        )
    );

-- Index
CREATE INDEX IF NOT EXISTS idx_employees_case_id ON employees(case_id);

-- ============================================
-- 4. CREATE EVIDENCES TABLE
-- For exhibits/bukti
-- ============================================

CREATE TABLE IF NOT EXISTS evidences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    exhibit_number TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    document_type TEXT,
    collected_date DATE,
    status TEXT DEFAULT 'collected' CHECK (status IN ('collected', 'verified', 'submitted', 'returned')),
    file_path TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE evidences ENABLE ROW LEVEL SECURITY;

-- Policies for evidences
CREATE POLICY "Users can view evidences" ON evidences
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cases c
            WHERE c.id = evidences.case_id
            AND (
                c.io_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() AND role IN ('admin', 'po', 'uip')
                )
            )
        )
    );

CREATE POLICY "IO and Admin can manage evidences" ON evidences
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM cases c
            WHERE c.id = evidences.case_id
            AND (
                c.io_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() AND role = 'admin'
                )
            )
        )
    );

-- Index
CREATE INDEX IF NOT EXISTS idx_evidences_case_id ON evidences(case_id);

-- ============================================
-- 5. CREATE STATEMENTS TABLE
-- For witness/OKS statements
-- ============================================

CREATE TABLE IF NOT EXISTS statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    person_name TEXT NOT NULL,
    person_ic TEXT,
    person_role TEXT DEFAULT 'saksi' CHECK (person_role IN ('saksi', 'oks', 'oks_representative')),
    statement_date DATE,
    statement_time TIME,
    location TEXT,
    section_reference TEXT, -- e.g., "Seksyen 12C Akta 4"
    content TEXT,
    summary TEXT,
    is_signed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE statements ENABLE ROW LEVEL SECURITY;

-- Policies for statements
CREATE POLICY "Users can view statements" ON statements
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cases c
            WHERE c.id = statements.case_id
            AND (
                c.io_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() AND role IN ('admin', 'po', 'uip')
                )
            )
        )
    );

CREATE POLICY "IO and Admin can manage statements" ON statements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM cases c
            WHERE c.id = statements.case_id
            AND (
                c.io_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() AND role = 'admin'
                )
            )
        )
    );

-- Index
CREATE INDEX IF NOT EXISTS idx_statements_case_id ON statements(case_id);

-- ============================================
-- 6. CREATE COMPOUND_OFFERS TABLE
-- For tracking compound offers
-- ============================================

CREATE TABLE IF NOT EXISTS compound_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    offer_number TEXT UNIQUE,
    offer_date DATE NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'expired', 'cancelled')),
    paid_date DATE,
    paid_amount DECIMAL(12,2),
    receipt_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE compound_offers ENABLE ROW LEVEL SECURITY;

-- Policies for compound_offers
CREATE POLICY "Users can view compound_offers" ON compound_offers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cases c
            WHERE c.id = compound_offers.case_id
            AND (
                c.io_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() AND role IN ('admin', 'po', 'uip')
                )
            )
        )
    );

CREATE POLICY "IO and Admin can manage compound_offers" ON compound_offers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM cases c
            WHERE c.id = compound_offers.case_id
            AND (
                c.io_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() AND role = 'admin'
                )
            )
        )
    );

-- Index
CREATE INDEX IF NOT EXISTS idx_compound_offers_case_id ON compound_offers(case_id);

-- ============================================
-- 7. ADDITIONAL INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_cases_offense_type ON cases(offense_type);
CREATE INDEX IF NOT EXISTS idx_cases_date_of_offense ON cases(date_of_offense);

-- ============================================
-- 8. VIEWS FOR REPORTING
-- ============================================

-- View: Case Summary with Employer Info
CREATE OR REPLACE VIEW case_summary AS
SELECT 
    c.id,
    c.case_number,
    c.act_type,
    c.offense_type,
    c.date_of_offense,
    c.section_charged,
    c.section_penalty,
    c.section_compound,
    c.status,
    c.recommendation,
    c.arrears_amount,
    c.created_at,
    e.company_name,
    e.ssm_no as ssm_number,
    e.owner_name,
    e.state,
    (SELECT COUNT(*) FROM employees emp WHERE emp.case_id = c.id) as employee_count,
    (SELECT COUNT(*) FROM evidences ev WHERE ev.case_id = c.id) as evidence_count
FROM cases c
LEFT JOIN employers e ON c.employer_id = e.id;

-- ============================================
-- DONE
-- ============================================
