-- ============================================
-- PERKESO Prosecution System
-- Migration 006: Fix Security - Proper RLS Policies
-- ============================================
-- This migration fixes security vulnerabilities:
-- 1. Remove overly permissive RLS policies
-- 2. Implement proper role-based access control
-- 3. Ensure only authorized roles can perform actions
-- ============================================

-- ============================================
-- 1. DROP OVERLY PERMISSIVE POLICIES
-- ============================================

-- Drop policies that allow all authenticated users
DROP POLICY IF EXISTS "Authenticated users can read employers" ON employers;
DROP POLICY IF EXISTS "Authenticated users can insert employers" ON employers;
DROP POLICY IF EXISTS "Authenticated users can update employers" ON employers;
DROP POLICY IF EXISTS "Authenticated users can delete employers" ON employers;

DROP POLICY IF EXISTS "Authenticated users can read cases" ON cases;
DROP POLICY IF EXISTS "Authenticated users can insert cases" ON cases;
DROP POLICY IF EXISTS "Authenticated users can update cases" ON cases;
DROP POLICY IF EXISTS "Authenticated users can delete cases" ON cases;

DROP POLICY IF EXISTS "Authenticated users can read employees" ON employees;
DROP POLICY IF EXISTS "Authenticated users can insert employees" ON employees;
DROP POLICY IF EXISTS "Authenticated users can update employees" ON employees;
DROP POLICY IF EXISTS "Authenticated users can delete employees" ON employees;

DROP POLICY IF EXISTS "Authenticated users can read evidences" ON evidences;
DROP POLICY IF EXISTS "Authenticated users can insert evidences" ON evidences;
DROP POLICY IF EXISTS "Authenticated users can update evidences" ON evidences;
DROP POLICY IF EXISTS "Authenticated users can delete evidences" ON evidences;

DROP POLICY IF EXISTS "Authenticated users can read statements" ON statements;
DROP POLICY IF EXISTS "Authenticated users can insert statements" ON statements;
DROP POLICY IF EXISTS "Authenticated users can update statements" ON statements;
DROP POLICY IF EXISTS "Authenticated users can delete statements" ON statements;

DROP POLICY IF EXISTS "Authenticated users can read compound_offers" ON compound_offers;
DROP POLICY IF EXISTS "Authenticated users can insert compound_offers" ON compound_offers;
DROP POLICY IF EXISTS "Authenticated users can update compound_offers" ON compound_offers;
DROP POLICY IF EXISTS "Authenticated users can delete compound_offers" ON compound_offers;

-- Drop policies for tables created in migration 005
DROP POLICY IF EXISTS "Authenticated users can read act_references" ON act_references;
DROP POLICY IF EXISTS "Authenticated users can insert act_references" ON act_references;
DROP POLICY IF EXISTS "Authenticated users can update act_references" ON act_references;
DROP POLICY IF EXISTS "Authenticated users can delete act_references" ON act_references;

DROP POLICY IF EXISTS "Users can view case_offenses" ON case_offenses;
DROP POLICY IF EXISTS "IO and Admin can manage case_offenses" ON case_offenses;

DROP POLICY IF EXISTS "Users can view chain_of_custody" ON chain_of_custody;
DROP POLICY IF EXISTS "IO and Admin can manage chain_of_custody" ON chain_of_custody;

DROP POLICY IF EXISTS "Users can view charges" ON charges;
DROP POLICY IF EXISTS "IO and Admin can manage charges" ON charges;

-- ============================================
-- 2. CREATE SECURE RLS POLICIES FOR EMPLOYERS
-- ============================================

-- View: All authenticated users can view employers
CREATE POLICY "Secure: View employers" ON employers
    FOR SELECT TO authenticated 
    USING (true);

-- Create: Only IO and Admin can create employers
CREATE POLICY "Secure: Create employers" ON employers
    FOR INSERT TO authenticated 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'io')
        )
    );

-- Update: Only IO and Admin can update employers
CREATE POLICY "Secure: Update employers" ON employers
    FOR UPDATE TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'io')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'io')
        )
    );

-- Delete: Only Admin can delete employers
CREATE POLICY "Secure: Delete employers" ON employers
    FOR DELETE TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- ============================================
-- 3. CREATE SECURE RLS POLICIES FOR CASES
-- ============================================

-- View: IO can view their cases, PO/UIP can view all, Admin can view all
CREATE POLICY "Secure: View cases" ON cases
    FOR SELECT TO authenticated 
    USING (
        io_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'po', 'uip', 'viewer')
        )
    );

-- Create: Only IO and Admin can create cases
CREATE POLICY "Secure: Create cases" ON cases
    FOR INSERT TO authenticated 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'io')
        )
        AND (io_id = auth.uid() OR EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        ))
    );

-- Update: IO can update their own cases, Admin can update all
CREATE POLICY "Secure: Update cases" ON cases
    FOR UPDATE TO authenticated 
    USING (
        io_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    )
    WITH CHECK (
        io_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Delete: Only Admin can delete cases
CREATE POLICY "Secure: Delete cases" ON cases
    FOR DELETE TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- ============================================
-- 4. CREATE SECURE RLS POLICIES FOR EMPLOYEES
-- ============================================

-- View: Users can view employees for cases they have access to
CREATE POLICY "Secure: View employees" ON employees
    FOR SELECT TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM cases c
            WHERE c.id = employees.case_id
            AND (
                c.io_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() 
                    AND role IN ('admin', 'po', 'uip', 'viewer')
                )
            )
        )
    );

-- Create/Update/Delete: Only IO and Admin can manage employees
CREATE POLICY "Secure: Manage employees" ON employees
    FOR ALL TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM cases c
            WHERE c.id = employees.case_id
            AND (
                c.io_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() 
                    AND role = 'admin'
                )
            )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM cases c
            WHERE c.id = employees.case_id
            AND (
                c.io_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() 
                    AND role = 'admin'
                )
            )
        )
    );

-- ============================================
-- 5. CREATE SECURE RLS POLICIES FOR EVIDENCES
-- ============================================

-- View: Users can view evidences for cases they have access to
CREATE POLICY "Secure: View evidences" ON evidences
    FOR SELECT TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM cases c
            WHERE c.id = evidences.case_id
            AND (
                c.io_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() 
                    AND role IN ('admin', 'po', 'uip', 'viewer')
                )
            )
        )
    );

-- Create/Update/Delete: Only IO and Admin can manage evidences
CREATE POLICY "Secure: Manage evidences" ON evidences
    FOR ALL TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM cases c
            WHERE c.id = evidences.case_id
            AND (
                c.io_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() 
                    AND role = 'admin'
                )
            )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM cases c
            WHERE c.id = evidences.case_id
            AND (
                c.io_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() 
                    AND role = 'admin'
                )
            )
        )
    );

-- ============================================
-- 6. CREATE SECURE RLS POLICIES FOR STATEMENTS
-- ============================================

-- View: Users can view statements for cases they have access to
CREATE POLICY "Secure: View statements" ON statements
    FOR SELECT TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM cases c
            WHERE c.id = statements.case_id
            AND (
                c.io_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() 
                    AND role IN ('admin', 'po', 'uip', 'viewer')
                )
            )
        )
    );

-- Create/Update/Delete: Only IO and Admin can manage statements
CREATE POLICY "Secure: Manage statements" ON statements
    FOR ALL TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM cases c
            WHERE c.id = statements.case_id
            AND (
                c.io_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() 
                    AND role = 'admin'
                )
            )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM cases c
            WHERE c.id = statements.case_id
            AND (
                c.io_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() 
                    AND role = 'admin'
                )
            )
        )
    );

-- ============================================
-- 7. CREATE SECURE RLS POLICIES FOR COMPOUND_OFFERS
-- ============================================

-- View: Users can view compound offers for cases they have access to
CREATE POLICY "Secure: View compound_offers" ON compound_offers
    FOR SELECT TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM cases c
            WHERE c.id = compound_offers.case_id
            AND (
                c.io_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() 
                    AND role IN ('admin', 'po', 'uip', 'viewer')
                )
            )
        )
    );

-- Create/Update: Only IO, PO, UIP, and Admin can manage compound offers
CREATE POLICY "Secure: Manage compound_offers" ON compound_offers
    FOR ALL TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM cases c
            WHERE c.id = compound_offers.case_id
            AND (
                c.io_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() 
                    AND role IN ('admin', 'po', 'uip')
                )
            )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM cases c
            WHERE c.id = compound_offers.case_id
            AND (
                c.io_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() 
                    AND role IN ('admin', 'po', 'uip')
                )
            )
        )
    );

-- ============================================
-- 8. CREATE SECURE RLS POLICIES FOR ACT_REFERENCES
-- ============================================

-- View: All authenticated users can view act_references (read-only reference data)
CREATE POLICY "Secure: View act_references" ON act_references
    FOR SELECT TO authenticated 
    USING (true);

-- Create/Update/Delete: Only Admin can manage act_references
CREATE POLICY "Secure: Manage act_references" ON act_references
    FOR ALL TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- ============================================
-- 9. CREATE SECURE RLS POLICIES FOR CASE_OFFENSES
-- ============================================

-- View: Users can view case_offenses for cases they have access to
CREATE POLICY "Secure: View case_offenses" ON case_offenses
    FOR SELECT TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM cases c
            WHERE c.id = case_offenses.kes_id
            AND (
                c.io_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() 
                    AND role IN ('admin', 'po', 'uip', 'viewer')
                )
            )
        )
    );

-- Create/Update/Delete: Only IO and Admin can manage case_offenses
CREATE POLICY "Secure: Manage case_offenses" ON case_offenses
    FOR ALL TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM cases c
            WHERE c.id = case_offenses.kes_id
            AND (
                c.io_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() 
                    AND role = 'admin'
                )
            )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM cases c
            WHERE c.id = case_offenses.kes_id
            AND (
                c.io_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() 
                    AND role = 'admin'
                )
            )
        )
    );

-- ============================================
-- 10. CREATE SECURE RLS POLICIES FOR CHAIN_OF_CUSTODY
-- ============================================

-- View: Users can view chain_of_custody for evidences they have access to
CREATE POLICY "Secure: View chain_of_custody" ON chain_of_custody
    FOR SELECT TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM evidences e
            JOIN cases c ON c.id = e.case_id
            WHERE e.id = chain_of_custody.bukti_id
            AND (
                c.io_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() 
                    AND role IN ('admin', 'po', 'uip', 'viewer')
                )
            )
        )
    );

-- Create/Update/Delete: Only IO and Admin can manage chain_of_custody
CREATE POLICY "Secure: Manage chain_of_custody" ON chain_of_custody
    FOR ALL TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM evidences e
            JOIN cases c ON c.id = e.case_id
            WHERE e.id = chain_of_custody.bukti_id
            AND (
                c.io_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() 
                    AND role = 'admin'
                )
            )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM evidences e
            JOIN cases c ON c.id = e.case_id
            WHERE e.id = chain_of_custody.bukti_id
            AND (
                c.io_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() 
                    AND role = 'admin'
                )
            )
        )
    );

-- ============================================
-- 11. CREATE SECURE RLS POLICIES FOR CHARGES
-- ============================================

-- View: Users can view charges for cases they have access to
CREATE POLICY "Secure: View charges" ON charges
    FOR SELECT TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM cases c
            WHERE c.id = charges.kes_id
            AND (
                c.io_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() 
                    AND role IN ('admin', 'po', 'uip', 'viewer')
                )
            )
        )
    );

-- Create/Update/Delete: Only IO, PO, UIP, and Admin can manage charges
CREATE POLICY "Secure: Manage charges" ON charges
    FOR ALL TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM cases c
            WHERE c.id = charges.kes_id
            AND (
                c.io_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() 
                    AND role IN ('admin', 'po', 'uip')
                )
            )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM cases c
            WHERE c.id = charges.kes_id
            AND (
                c.io_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() 
                    AND role IN ('admin', 'po', 'uip')
                )
            )
        )
    );

-- ============================================
-- 12. VERIFY POLICIES
-- ============================================

-- List all policies to verify
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- DONE
-- ============================================
