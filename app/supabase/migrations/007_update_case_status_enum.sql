-- ============================================
-- PERKESO Prosecution System
-- Migration 007: Update Case Status Enum to Match Workflow
-- ============================================
-- Update case status to match workflow requirements from 4-database-schema.md
-- ============================================

-- ============================================
-- 1. CHANGE STATUS COLUMN FROM ENUM TO TEXT
-- ============================================

-- PostgreSQL doesn't allow direct conversion from ENUM to TEXT
-- We need to use a temporary column approach

-- Step 1: Add temporary column with TEXT type
ALTER TABLE cases ADD COLUMN IF NOT EXISTS status_new TEXT;

-- Step 2: Map old enum values to new text values
UPDATE cases SET status_new = 'draf' WHERE status::text = 'draft';
UPDATE cases SET status_new = 'dalam_siasatan' WHERE status::text = 'in_progress';
UPDATE cases SET status_new = 'menunggu_semakan' WHERE status::text = 'pending_review';
UPDATE cases SET status_new = 'menunggu_sanksi' WHERE status::text = 'approved';
UPDATE cases SET status_new = 'selesai' WHERE status::text = 'closed';
UPDATE cases SET status_new = 'draf' WHERE status::text = 'filed'; -- Map filed to draf

-- Step 3: Set default for any NULL values (shouldn't happen, but safety check)
UPDATE cases SET status_new = 'draf' WHERE status_new IS NULL;

-- Step 4: Drop old status column (this will fail if there are dependencies, but should work)
ALTER TABLE cases DROP COLUMN IF EXISTS status CASCADE;

-- Step 5: Rename status_new to status
ALTER TABLE cases RENAME COLUMN status_new TO status;

-- Step 6: Set NOT NULL and DEFAULT
ALTER TABLE cases ALTER COLUMN status SET NOT NULL;
ALTER TABLE cases ALTER COLUMN status SET DEFAULT 'draf';

-- ============================================
-- 3. ADD NEW STATUS CONSTRAINT
-- ============================================

ALTER TABLE cases 
ADD CONSTRAINT cases_status_check 
CHECK (status IN (
    'draf',
    'dalam_siasatan',
    'menunggu_semakan',
    'menunggu_sanksi',
    'sanksi_diluluskan',
    'dikompaun',
    'didakwa',
    'selesai',
    'nfa'
));

-- ============================================
-- 4. ADD WORKFLOW HISTORY TABLE (if not exists)
-- ============================================

-- Note: We're using audit_trail for workflow history
-- But we can add a dedicated workflow_history table for better tracking

CREATE TABLE IF NOT EXISTS workflow_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    from_status TEXT NOT NULL,
    to_status TEXT NOT NULL,
    action TEXT NOT NULL,
    performed_by UUID REFERENCES profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workflow_history_case_id ON workflow_history(case_id);
CREATE INDEX IF NOT EXISTS idx_workflow_history_created_at ON workflow_history(created_at);

-- Enable RLS
ALTER TABLE workflow_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view workflow_history" ON workflow_history
    FOR SELECT TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM cases c
            WHERE c.id = workflow_history.case_id
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

CREATE POLICY "System can insert workflow_history" ON workflow_history
    FOR INSERT TO authenticated 
    WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- 5. ADD COMMENTS
-- ============================================

COMMENT ON TABLE workflow_history IS 'Sejarah perubahan status kes untuk workflow tracking';
COMMENT ON COLUMN cases.status IS 'Status kes mengikut workflow: draf → dalam_siasatan → menunggu_semakan → menunggu_sanksi → sanksi_diluluskan → dikompaun/didakwa → selesai/nfa';

-- ============================================
-- DONE
-- ============================================
