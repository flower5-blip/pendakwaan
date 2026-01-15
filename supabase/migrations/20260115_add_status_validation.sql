-- ============================================
-- Migration: Add Status Transition Validation Trigger
-- PERKESO Prosecution System
-- Version: 2026-01-15
-- ============================================

-- Fungsi untuk validasi transisi status kes
-- Memastikan hanya transisi yang sah dibenarkan

CREATE OR REPLACE FUNCTION validate_case_status_transition()
RETURNS TRIGGER AS $$
DECLARE
    valid_transitions TEXT[];
BEGIN
    -- Jika status tidak berubah, skip validasi
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    -- Definisi transisi yang sah mengikut workflow
    CASE OLD.status
        WHEN 'draf' THEN 
            valid_transitions := ARRAY['dalam_siasatan'];
        WHEN 'dalam_siasatan' THEN 
            valid_transitions := ARRAY['menunggu_semakan', 'draf'];
        WHEN 'menunggu_semakan' THEN 
            valid_transitions := ARRAY['menunggu_sanksi', 'dalam_siasatan'];
        WHEN 'menunggu_sanksi' THEN 
            valid_transitions := ARRAY['sanksi_diluluskan', 'dikompaun', 'didakwa', 'nfa', 'menunggu_semakan'];
        WHEN 'sanksi_diluluskan' THEN 
            valid_transitions := ARRAY['dikompaun', 'didakwa', 'nfa'];
        WHEN 'dikompaun' THEN 
            valid_transitions := ARRAY['selesai', 'didakwa'];
        WHEN 'didakwa' THEN 
            valid_transitions := ARRAY['selesai'];
        WHEN 'selesai' THEN 
            valid_transitions := ARRAY[]::TEXT[];  -- Terminal state
        WHEN 'nfa' THEN 
            valid_transitions := ARRAY[]::TEXT[];  -- Terminal state
        ELSE 
            valid_transitions := ARRAY[]::TEXT[];
    END CASE;
    
    -- Semak jika transisi adalah sah
    IF NOT (NEW.status = ANY(valid_transitions)) THEN
        RAISE EXCEPTION 'Transisi status tidak sah: % -> %. Transisi yang dibenarkan: %', 
            OLD.status, NEW.status, array_to_string(valid_transitions, ', ');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Buang trigger lama jika wujud dan cipta semula
DROP TRIGGER IF EXISTS enforce_status_transition ON cases;

CREATE TRIGGER enforce_status_transition
    BEFORE UPDATE OF status ON cases
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION validate_case_status_transition();

-- ============================================
-- Comments
-- ============================================

COMMENT ON FUNCTION validate_case_status_transition IS 
    'Fungsi trigger untuk memvalidasi transisi status kes mengikut workflow yang ditetapkan';

-- ============================================
-- Test Cases (untuk rujukan, jangan execute secara langsung)
-- ============================================

/*
-- Test 1: Transisi sah (draf -> dalam_siasatan)
UPDATE cases SET status = 'dalam_siasatan' WHERE status = 'draf' AND id = 'some-id';
-- Expected: Success

-- Test 2: Transisi tidak sah (draf -> didakwa)
UPDATE cases SET status = 'didakwa' WHERE status = 'draf' AND id = 'some-id';
-- Expected: Error - Transisi status tidak sah

-- Test 3: Terminal state tidak boleh diubah (selesai -> ???)
UPDATE cases SET status = 'draf' WHERE status = 'selesai' AND id = 'some-id';
-- Expected: Error - Transisi status tidak sah
*/
