-- PERKESO Prosecution Paper Builder - Initial Schema
-- Phase A: Foundation

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE user_role AS ENUM ('admin', 'io', 'po', 'uip', 'viewer');
CREATE TYPE case_status AS ENUM ('draft', 'in_progress', 'pending_review', 'approved', 'filed', 'closed');
CREATE TYPE evidence_status AS ENUM ('draft', 'ready', 'need_fix');
CREATE TYPE person_role AS ENUM ('saksi', 'oks', 'pekerja');

-- Users Profile (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'viewer',
    department TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employers (Majikan)
CREATE TABLE employers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    ssm_no TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    business_type TEXT,
    registration_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cases (Kes)
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number TEXT UNIQUE NOT NULL,
    employer_id UUID REFERENCES employers(id) ON DELETE SET NULL,
    io_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status case_status DEFAULT 'draft',
    act_type TEXT NOT NULL CHECK (act_type IN ('akta4', 'akta800', 'both')),
    inspection_date DATE,
    inspection_location TEXT,
    issue_summary TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Persons (Saksi/OKS/Pekerja)
CREATE TABLE persons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    ic_number TEXT,
    role person_role NOT NULL DEFAULT 'pekerja',
    phone TEXT,
    address TEXT,
    employment_start_date DATE,
    employment_end_date DATE,
    position TEXT,
    salary DECIMAL(12,2),
    notes TEXT,
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
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Admin can view all profiles
CREATE POLICY "Admin can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admin can manage all profiles
CREATE POLICY "Admin can manage profiles" ON profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Allow insert during registration
CREATE POLICY "Allow profile creation" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- EMPLOYERS POLICIES
-- ============================================

-- All authenticated users can view employers
CREATE POLICY "Authenticated users can view employers" ON employers
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- IO and Admin can create employers
CREATE POLICY "IO and Admin can create employers" ON employers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'io')
        )
    );

-- IO and Admin can update employers
CREATE POLICY "IO and Admin can update employers" ON employers
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'io')
        )
    );

-- Admin can delete employers
CREATE POLICY "Admin can delete employers" ON employers
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- CASES POLICIES
-- ============================================

-- IO can view their assigned cases
CREATE POLICY "IO can view assigned cases" ON cases
    FOR SELECT USING (
        io_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'po', 'uip')
        )
    );

-- IO and Admin can create cases
CREATE POLICY "IO and Admin can create cases" ON cases
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'io')
        )
    );

-- IO can update their own cases, Admin can update all
CREATE POLICY "IO can update own cases" ON cases
    FOR UPDATE USING (
        io_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admin can delete cases
CREATE POLICY "Admin can delete cases" ON cases
    FOR DELETE USING (
        io_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- PERSONS POLICIES
-- ============================================

-- Users can view persons for cases they have access to
CREATE POLICY "Users can view persons" ON persons
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cases c
            WHERE c.id = persons.case_id
            AND (
                c.io_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() AND role IN ('admin', 'po', 'uip')
                )
            )
        )
    );

-- IO and Admin can manage persons
CREATE POLICY "IO and Admin can manage persons" ON persons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM cases c
            WHERE c.id = persons.case_id
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
-- AUDIT TRAIL POLICIES
-- ============================================

-- Admin, PO, UIP can view audit trail
CREATE POLICY "Authorized users can view audit trail" ON audit_trail
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'po', 'uip')
        )
    );

-- System can insert audit records (via function)
CREATE POLICY "System can insert audit records" ON audit_trail
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_employers_updated_at
    BEFORE UPDATE ON employers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_cases_updated_at
    BEFORE UPDATE ON cases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Function to log changes to audit_trail
CREATE OR REPLACE FUNCTION log_audit_trail()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_trail (table_name, record_id, action, new_data, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'create', to_jsonb(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_trail (table_name, record_id, action, old_data, new_data, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'update', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_trail (table_name, record_id, action, old_data, user_id)
        VALUES (TG_TABLE_NAME, OLD.id, 'delete', to_jsonb(OLD), auth.uid());
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to cases table
CREATE TRIGGER audit_cases
    AFTER INSERT OR UPDATE OR DELETE ON cases
    FOR EACH ROW
    EXECUTE FUNCTION log_audit_trail();

-- Apply audit triggers to employers table
CREATE TRIGGER audit_employers
    AFTER INSERT OR UPDATE OR DELETE ON employers
    FOR EACH ROW
    EXECUTE FUNCTION log_audit_trail();

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_cases_io_id ON cases(io_id);
CREATE INDEX idx_cases_employer_id ON cases(employer_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_act_type ON cases(act_type);
CREATE INDEX idx_persons_case_id ON persons(case_id);
CREATE INDEX idx_audit_trail_table_record ON audit_trail(table_name, record_id);
CREATE INDEX idx_audit_trail_created_at ON audit_trail(created_at);

-- ============================================
-- SEED DATA (Optional - for development)
-- ============================================

-- Note: Run this after creating at least one user through the auth system
-- Then update the role to 'admin' for that user

-- Example: UPDATE profiles SET role = 'admin' WHERE id = 'your-user-uuid';
