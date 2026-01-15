-- ============================================
-- PERKESO Prosecution System
-- CLEAN DATA + SEED TEST DATA
-- Preserves auth.users and profiles
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: DELETE ALL DATA (KEEP USERS!)
-- Order matters due to foreign key constraints
-- ============================================

-- Delete child tables first
DELETE FROM audit_trail;
DELETE FROM evidences;
DELETE FROM statements;
DELETE FROM compound_offers;
DELETE FROM employees;

-- Delete cases
DELETE FROM cases;

-- Delete employers
DELETE FROM employers;

-- DO NOT DELETE profiles - they are linked to auth.users!
-- DO NOT DELETE act_references - these are reference data!

-- ============================================
-- STEP 2: UPDATE EXISTING USER PROFILES
-- Make the first user an admin/io so they can access the system
-- ============================================

-- Update ALL profiles to 'io' role so they can create/edit cases
UPDATE profiles SET role = 'io' WHERE role = 'viewer';

-- ============================================
-- STEP 3: INSERT TEST EMPLOYERS
-- ============================================

INSERT INTO employers (id, company_name, ssm_number, employer_code, address, postcode, city, state, owner_name, owner_ic, phone, email, business_type, registration_date) VALUES
-- Employer 1: Syarikat ABC
('11111111-1111-1111-1111-111111111111', 
 'Syarikat ABC Sdn Bhd', 
 'ABC-12345-K', 
 'E0001234',
 'No. 123, Jalan Industri 1, Kawasan Perindustrian Nilai',
 '71800',
 'Nilai',
 'Negeri Sembilan',
 'Ahmad bin Abdullah',
 '850101-05-1234',
 '06-7991234',
 'ahmad@abc-sdn.com.my',
 'Manufacturing',
 '2020-01-15'),

-- Employer 2: XYZ Enterprise
('22222222-2222-2222-2222-222222222222', 
 'XYZ Enterprise', 
 'XYZ-67890-P', 
 'E0005678',
 'Lot 456, Jalan Bunga Raya, Taman Melawati',
 '53100',
 'Kuala Lumpur',
 'W.P. Kuala Lumpur',
 'Tan Wei Ming',
 '780315-14-5678',
 '03-41021234',
 'wm.tan@xyz-ent.com',
 'Retail',
 '2018-06-20'),

-- Employer 3: Perniagaan 123
('33333333-3333-3333-3333-333333333333', 
 'Perniagaan 123', 
 '123-PERNIAGAAN-M', 
 'E0009999',
 'No. 789, Jalan Pasar, Pusat Bandar Ipoh',
 '30000',
 'Ipoh',
 'Perak',
 'Muthu a/l Raman',
 '900520-08-9012',
 '05-2541234',
 'muthu@123perniagaan.my',
 'Food & Beverage',
 '2022-03-10');

-- ============================================
-- STEP 4: INSERT TEST CASES
-- ============================================

INSERT INTO cases (id, case_number, employer_id, act_type, offense_type, date_of_offense, time_of_offense, location_of_offense, section_charged, section_penalty, section_compound, inspection_date, inspection_location, issue_summary, arrears_amount, arrears_period_start, arrears_period_end, total_employees_affected, status, recommendation, notes) VALUES

-- Case 1: Draft (Akta 4)
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 'PPB/2026/0001',
 '11111111-1111-1111-1111-111111111111',
 'akta_4',
 'Gagal daftar pekerja',
 '2025-11-15',
 '10:30:00',
 'No. 123, Jalan Industri 1, Kawasan Perindustrian Nilai',
 'Seksyen 5',
 'Seksyen 94(g)',
 'Seksyen 95A',
 '2025-12-01',
 'Pejabat PERKESO Nilai',
 'Majikan gagal mendaftarkan 5 orang pekerja untuk skim KWSP.',
 15000.00,
 '2025-06-01',
 '2025-11-30',
 5,
 'draft',
 NULL,
 'Kes draf untuk ujian'),

-- Case 2: In Progress (Akta 800)
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
 'PPB/2026/0002',
 '22222222-2222-2222-2222-222222222222',
 'akta_800',
 'Gagal bayar caruman SIP',
 '2025-10-20',
 '14:00:00',
 'Lot 456, Jalan Bunga Raya, Taman Melawati',
 'Seksyen 18(1)',
 'Seksyen 18(4)',
 'Seksyen 77',
 '2025-11-10',
 'Pejabat PERKESO KL',
 'Majikan gagal membayar caruman SIP untuk 8 pekerja.',
 28800.00,
 '2025-04-01',
 '2025-09-30',
 8,
 'in_progress',
 NULL,
 'Siasatan sedang dijalankan'),

-- Case 3: Pending Review (Akta 4)
('cccccccc-cccc-cccc-cccc-cccccccccccc',
 'PPB/2026/0003',
 '33333333-3333-3333-3333-333333333333',
 'akta_4',
 'Gagal simpan rekod pekerja',
 '2025-09-05',
 '09:00:00',
 'No. 789, Jalan Pasar, Pusat Bandar Ipoh',
 'Seksyen 11(3)',
 'Seksyen 94(g)',
 'Seksyen 95A',
 '2025-09-20',
 'Pejabat PERKESO Ipoh',
 'Majikan tidak menyimpan rekod pekerja dengan lengkap.',
 NULL,
 NULL,
 NULL,
 3,
 'pending_review',
 'compound',
 'Menunggu semakan');

-- ============================================
-- STEP 5: INSERT TEST EMPLOYEES
-- ============================================

INSERT INTO employees (case_id, full_name, ic_number, position, employment_start_date, monthly_salary, is_registered, notes) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Ali bin Hassan', '950101-05-1234', 'Operator', '2025-01-15', 2200.00, false, NULL),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Siti binti Osman', '980202-05-5678', 'Penyelia', '2025-02-01', 3500.00, false, NULL),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Lee Mei Ling', '890520-14-3456', 'Jurujual', '2024-06-01', 2500.00, true, NULL),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Roslan bin Hamid', '870830-01-7890', 'Pengurus', '2024-01-15', 4000.00, true, NULL),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Aisha binti Yusof', '001215-08-2345', 'Tukang Masak', '2024-08-01', 1800.00, true, NULL);

-- ============================================
-- STEP 6: INSERT TEST EVIDENCES
-- ============================================

INSERT INTO evidences (case_id, exhibit_number, name, description, document_type, collected_date, status) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'EXH-001', 'Borang Caruman KWSP', 'Borang caruman bulanan tidak lengkap', 'Dokumen Rasmi', '2025-12-01', 'collected'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'EXH-001', 'Penyata Gaji', 'Penyata gaji 6 bulan', 'Rekod Kewangan', '2025-11-10', 'verified'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'EXH-001', 'Gambar Premis', 'Gambar premis perniagaan', 'Fotografi', '2025-09-20', 'submitted');

-- ============================================
-- VERIFY: Count records
-- ============================================

SELECT 'profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL SELECT 'employers', COUNT(*) FROM employers
UNION ALL SELECT 'cases', COUNT(*) FROM cases
UNION ALL SELECT 'employees', COUNT(*) FROM employees
UNION ALL SELECT 'evidences', COUNT(*) FROM evidences
UNION ALL SELECT 'act_references', COUNT(*) FROM act_references;

-- ============================================
-- DONE! Database cleaned and seeded.
-- User accounts preserved, test data added.
-- ============================================
