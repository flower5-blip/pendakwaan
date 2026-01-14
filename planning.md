Anda ialah AI Senior Full-Stack Engineer + Legal Workflow Designer (PERKESO). 
Bina web dalaman “PERKESO Prosecution Paper Builder” untuk membantu Pegawai Penyiasat (IO) menyediakan dokumen pendakwaan Akta 4 & Akta 800 secara sistematik, neutral dan selamat dari segi undang-undang.

KEKANGAN WAJIB
- Sistem dalaman sahaja (no public access). 
- Fokus pada penyediaan dokumen & semakan elemen kes (ingredients of offence), bukan “menghukum”.
- Semua ayat output mesti neutral: fakta + tarikh + sumber bukti; elak emosi/andaian niat.
- Setiap langkah wajib ada “Evidence Link” (dokumen/nota/saksi) dan status (Draft/Ready/Need Fix).
- Tidak boleh “Proceed to Court” jika sanksi bertulis belum wujud.
- Semua fail/dokumen mesti ada audit trail (siapa, bila, apa diubah).
- Multi-role: Admin, IO, PO (Pegawai Pendakwa), UIP/Legal State Unit, Viewer.
- Bahasa UI: BM (utama) + EN (opsyen).
- Minimum kos, boleh guna free tier (contoh: Next.js + Firebase/Supabase + storage).

OUTPUT YANG SAYA MAHU (WAJIB SEDIAKAN SEMUA)
1) ARKITEKTUR: frontend + backend + auth + storage + database + audit log.
2) DATA MODEL (schema) terperinci:
   - Case (kes)
   - Employer (majikan)
   - Persons (saksi/OKS)
   - Evidence (dokumen digital/fizikal)
   - ChainOfCustody
   - Steps/Checklist (Langkah 1-12 + versi ringkas 4 fasa)
   - Statements (Seksyen 112 CPC)
   - CompoundOffer (kompaun)
   - IPFile (kertas siasatan/IP brief)
   - SanksiRequest (Seksyen 95 Akta 4 / Seksyen 76 Akta 800)
   - Charges (Borang 113/114)
   - FactsOfCase
   - CourtFiling (M143 + Saman)
   - Comments/Review (PO/UIP)
   - AuditTrail
3) FLOW & RULES:
   - Flow langkah 1–12 + versi ringkas 4 fasa.
   - Gatekeeper rules: tidak boleh generate “Pertuduhan/M143” sebelum “Sanksi Approved”.
   - Validasi tarikh (tarikh mula kerja, tarikh liabiliti, tarikh operasi syarikat) & elak percanggahan.
4) UI PAGES (wireframe teks):
   - Dashboard kes
   - Create new case wizard
   - Evidence uploader + metadata + chain of custody
   - Elemen kes (Akta 4) checklist
   - Elemen kes (Akta 800) checklist
   - Statement builder (Seksyen 112) + signature checklist
   - Sanksi request builder (Seksyen 95/76) + lampiran auto-list
   - Charge sheet builder (113/114) + template neutral
   - Fakta kes builder (ringkas, tunjuk intipati)
   - Court filing pack (M143 + Saman + 3 salinan checklist)
   - Review screen (PO/UIP) + “Return with notes”
   - Audit log viewer
5) TEMPLATE CONTENT (NEUTRAL) untuk auto-generate teks:
   - Kronologi pemeriksaan
   - Ringkasan ketidakpatuhan (tanpa andaian niat)
   - Ringkasan bukti (dokumen + saksi)
   - Ayat untuk permohonan sanksi (neutral)
   - Ayat pertuduhan (placeholder yang patuh struktur masa/tempat/seksyen)
   - Fakta kes (pendek, tunjuk elemen)
6) EXPORT:
   - Generate PDF/Docx pack (IP brief + sanksi + pertuduhan + fakta kes + senarai eksibit).
   - Cover page + Table of contents + numbering eksibit (E1, E2…).
7) SECURITY & COMPLIANCE:
   - Role-based access control
   - Storage rules (hanya kes yang ditugaskan)
   - Log perubahan tidak boleh dipadam
   - Backup/restore plan ringkas

TEKNIK PEMBANGUNAN (AGENT MODE)
- Buat secara fasa:
  Phase A: UI skeleton + Auth + Case CRUD
  Phase B: Evidence + Chain of custody + checklist elemen kes
  Phase C: Builders (112, sanksi, 113/114, fakta kes, M143)
  Phase D: Export pack + audit + hard validations
- Setiap phase: hasilkan “Definition of Done” + senarai fail yang dibuat + arahan run.

STACK CADANGAN (pilih 1 dan teruskan)
Pilihan 1 (disyorkan): Next.js (App Router) + TypeScript + Firebase Auth + Firestore + Firebase Storage + Cloud Functions (PDF)
Pilihan 2: Next.js + Supabase Auth + Postgres + Storage + Edge Functions

KEPERLUAN KHUSUS ELEMAN KES (WAJIB ADA DALAM MODUL CHECKLIST)
Akta 4:
- Identiti majikan (SSM / pihak bertanggungjawab bayar gaji)
- Status pekerja (kontrak perkhidmatan)
- Tarikh mula kerja & tarikh liabiliti
- Kegagalan daftar perusahaan/pekerja (jika relevan)
- Kegagalan bayar caruman (bulan + amaun + rekod pembayaran)
- Rekod/daftar pekerja (kewujudan/ketiadaan)
- Bukti sistem (ASSIST) vs bukti fizikal
Akta 800:
- Majikan tertakluk SIP
- Pendaftaran perusahaan SIP
- Pendaftaran/insurans pekerja SIP
- Kegagalan bayar caruman SIP (bulan + amaun)
- Halangan tugas (jika kes halang) — bukti perbuatan + saksi + catatan masa/tempat

CONTOH INPUT UNTUK 1 KES (BINA SEBAGAI SEED DATA)
- Nama Majikan: [contoh]
- No SSM: [contoh]
- Lokasi premis: [contoh]
- Tarikh pemeriksaan: [contoh]
- Pekerja terlibat: [nama + IC + tarikh mula kerja]
- Isu: gagal daftar / gagal carum / tunggakan / FCLB
- Bukti: daftar pekerja, baucar gaji, rekod bank, screenshot ASSIST, gambar premis, rakaman percakapan

AKHIR SEKALI
- Hasilkan repo structure lengkap.
- Tulis kod penuh (bukan snippet) untuk Phase A dulu sahaja.
- Selepas Phase A siap, berikan arahan test + checklist penerimaan.
