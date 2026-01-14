# Reka Bentuk Pangkalan Data - PERKESO Prosecution System

## Dokumen Rujukan: Phase B Database Schema

Dokumen ini mengandungi struktur lengkap pangkalan data untuk sistem pendakwaan PERKESO berdasarkan Akta 4 dan Akta 800.

---

## Senarai Jadual (12 Tables)

| # | Nama Jadual | Fungsi | Bilangan Lajur |
|---|-------------|--------|----------------|
| 1 | `profiles` | Pengguna sistem (IO, PO, Admin) | 11 |
| 2 | `majikan_oks` | Majikan / Orang Kena Saman | 18 |
| 3 | `kes` | Rekod kes siasatan | 22 |
| 4 | `pekerja` | Pekerja/Saksi/OKS dalam kes | 13 |
| 5 | `rujukan_akta` | Seksyen kesalahan & hukuman | 13 |
| 6 | `kesalahan_kes` | Link kes ↔ jenis kesalahan | 7 |
| 7 | `bukti` | Bukti/Eksibit | 13 |
| 8 | `rantaian_jagaan` | Chain of custody | 9 |
| 9 | `pernyataan` | Rakaman percakapan S.112/S.70 | 14 |
| 10 | `kompaun` | Tawaran & bayaran kompaun | 12 |
| 11 | `pertuduhan` | Kertas pertuduhan | 12 |
| 12 | `log_audit` | Audit trail | 8 |

---

## Entity Relationship Diagram

```
profiles ──────┐
               │
majikan_oks ───┼──→ kes ──┬──→ pekerja
               │          │
               │          ├──→ kesalahan_kes ──→ rujukan_akta
               │          │
               │          ├──→ bukti ──→ rantaian_jagaan
               │          │
               │          ├──→ pernyataan
               │          │
               │          ├──→ kompaun
               │          │
               │          └──→ pertuduhan
               │
               └──→ log_audit
```

---

## Enum Types

```sql
-- Peranan Pengguna
CREATE TYPE peranan_pengguna AS ENUM ('admin', 'io', 'po', 'uip', 'viewer');

-- Kategori Majikan
CREATE TYPE kategori_majikan AS ENUM ('majikan_utama', 'majikan_langsung', 'kerajaan', 'badan_berkanun');

-- Jenis Akta
CREATE TYPE jenis_akta AS ENUM ('akta4', 'akta800', 'kedua_dua');

-- Status Kes
CREATE TYPE status_kes AS ENUM (
    'draf', 
    'dalam_siasatan', 
    'menunggu_semakan', 
    'menunggu_sanksi',
    'sanksi_diluluskan',
    'dikompaun',
    'didakwa',
    'selesai',
    'nfa'
);

-- Syor Tindakan
CREATE TYPE syor_tindakan AS ENUM ('kompaun', 'dakwa', 'nfa');

-- Peranan Pekerja
CREATE TYPE jenis_peranan_pekerja AS ENUM ('pekerja', 'saksi', 'oks', 'wakil_majikan');

-- Jenis Bukti
CREATE TYPE jenis_bukti AS ENUM ('dokumen', 'foto', 'rakaman', 'fizikal');

-- Status Bukti
CREATE TYPE status_bukti AS ENUM ('draf', 'sedia', 'perlu_perbaiki');

-- Status Kompaun
CREATE TYPE status_kompaun AS ENUM ('ditawarkan', 'dibayar', 'ditolak', 'tamat_tempoh');

-- Status Pertuduhan
CREATE TYPE status_pertuduhan AS ENUM ('draf', 'sedia', 'difailkan');
```

---

## 1. JADUAL profiles

```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nama_penuh TEXT NOT NULL,
    peranan peranan_pengguna NOT NULL DEFAULT 'viewer',
    no_kad_kuasa TEXT,
    jawatan TEXT,
    pejabat TEXT,
    no_telefon TEXT,
    emel TEXT,
    tandatangan_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 2. JADUAL majikan_oks

```sql
CREATE TABLE majikan_oks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_syarikat TEXT NOT NULL,
    no_kod_majikan TEXT,
    no_ssm TEXT,
    kategori_majikan kategori_majikan DEFAULT 'majikan_utama',
    kod_industri TEXT,
    alamat_premis TEXT,
    poskod TEXT,
    bandar TEXT,
    negeri TEXT,
    nama_pengarah TEXT,
    no_kp_pengarah TEXT,
    no_telefon TEXT,
    emel TEXT,
    tarikh_daftar_ssm DATE,
    tarikh_mula_operasi DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. JADUAL kes

```sql
CREATE TABLE kes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    no_kes TEXT UNIQUE NOT NULL,
    majikan_id UUID REFERENCES majikan_oks(id) ON DELETE SET NULL,
    io_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    jenis_akta jenis_akta NOT NULL,
    status_kes status_kes DEFAULT 'draf',
    tarikh_pemeriksaan DATE,
    masa_pemeriksaan TIME,
    lokasi_pemeriksaan TEXT,
    punca_siasatan TEXT,
    ringkasan_isu TEXT,
    tarikh_mula_layak DATE,
    tempoh_tunggakan_mula DATE,
    tempoh_tunggakan_tamat DATE,
    jumlah_caruman DECIMAL(15,2),
    jumlah_fclb DECIMAL(15,2),
    bil_pekerja_terlibat INTEGER,
    notis_pematuhan BOOLEAN DEFAULT false,
    syor_io syor_tindakan,
    nota TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. JADUAL pekerja

```sql
CREATE TABLE pekerja (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kes_id UUID REFERENCES kes(id) ON DELETE CASCADE,
    nama TEXT NOT NULL,
    no_kp TEXT,
    jenis_peranan jenis_peranan_pekerja DEFAULT 'pekerja',
    no_telefon TEXT,
    alamat TEXT,
    jawatan TEXT,
    tarikh_mula_kerja DATE,
    tarikh_tamat_kerja DATE,
    gaji_bulanan DECIMAL(12,2),
    status_pendaftaran BOOLEAN,
    nota TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. JADUAL rujukan_akta

```sql
CREATE TABLE rujukan_akta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kod TEXT UNIQUE NOT NULL,
    nama_kesalahan TEXT NOT NULL,
    jenis_akta jenis_akta NOT NULL,
    seksyen_pertuduhan TEXT NOT NULL,
    seksyen_hukuman TEXT NOT NULL,
    seksyen_kompaun TEXT,
    seksyen_rakaman TEXT,
    denda_maksimum DECIMAL(12,2) DEFAULT 10000,
    penjara_maksimum TEXT DEFAULT '2 tahun',
    boleh_kompaun BOOLEAN DEFAULT true,
    catatan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEED DATA (dari 2.md)
INSERT INTO rujukan_akta (kod, nama_kesalahan, jenis_akta, seksyen_pertuduhan, seksyen_hukuman, seksyen_kompaun, seksyen_rakaman) VALUES
('A4_GAGAL_DAFTAR_PERUSAHAAN', 'Gagal Daftar Perusahaan', 'akta4', 'Seksyen 4', 'Seksyen 94(g)', 'Seksyen 95A', 'Seksyen 12C'),
('A4_GAGAL_DAFTAR_PEKERJA', 'Gagal Daftar Pekerja', 'akta4', 'Seksyen 5', 'Seksyen 94(g)', 'Seksyen 95A', 'Seksyen 12C'),
('A4_GAGAL_BAYAR_CARUMAN', 'Gagal Bayar Caruman', 'akta4', 'Seksyen 6', 'Seksyen 94(a)', 'Seksyen 95A', 'Seksyen 12C'),
('A4_GAGAL_SIMPAN_REKOD', 'Gagal Simpan Daftar/Rekod', 'akta4', 'Seksyen 11(3)', 'Seksyen 94(g)', 'Seksyen 95A', 'Seksyen 12C'),
('A4_POTONG_GAJI', 'Memotong Gaji Pekerja', 'akta4', 'Seksyen 7(3)', 'Seksyen 94(b)', 'Seksyen 95A', 'Seksyen 12C'),
('A800_GAGAL_DAFTAR_PERUSAHAAN', 'Gagal Daftar Perusahaan', 'akta800', 'Seksyen 14(1)', 'Seksyen 14(2)', 'Seksyen 77', 'Seksyen 69 & 70'),
('A800_GAGAL_DAFTAR_PEKERJA', 'Gagal Daftar Pekerja', 'akta800', 'Seksyen 16(1)', 'Seksyen 16(5)', 'Seksyen 77', 'Seksyen 69 & 70'),
('A800_GAGAL_SIMPAN_REKOD', 'Gagal Simpan Daftar/Rekod', 'akta800', 'Seksyen 78(1)', 'Seksyen 78(3)', 'Seksyen 77', 'Seksyen 69 & 70'),
('A800_POTONG_GAJI', 'Memotong Gaji Pekerja', 'akta800', 'Seksyen 24(1)', 'Seksyen 24(2)', 'Seksyen 77', 'Seksyen 69 & 70');
```

---

## 6. JADUAL kesalahan_kes

```sql
CREATE TABLE kesalahan_kes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kes_id UUID REFERENCES kes(id) ON DELETE CASCADE,
    jenis_kesalahan_id UUID REFERENCES rujukan_akta(id),
    tarikh_kesalahan DATE NOT NULL,
    masa_kesalahan TIME,
    tempat_kesalahan TEXT,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 7. JADUAL bukti

```sql
CREATE TABLE bukti (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kes_id UUID REFERENCES kes(id) ON DELETE CASCADE,
    no_eksibit TEXT,
    nama TEXT NOT NULL,
    jenis_bukti jenis_bukti DEFAULT 'dokumen',
    keterangan TEXT,
    fail_url TEXT,
    jenis_fail TEXT,
    tarikh_disita DATE,
    lokasi_disita TEXT,
    disita_oleh UUID REFERENCES profiles(id),
    status status_bukti DEFAULT 'draf',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 8. JADUAL rantaian_jagaan

```sql
CREATE TABLE rantaian_jagaan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bukti_id UUID REFERENCES bukti(id) ON DELETE CASCADE,
    tindakan TEXT NOT NULL,
    dari_pihak TEXT,
    kepada_pihak TEXT,
    lokasi TEXT,
    tarikh_masa TIMESTAMPTZ DEFAULT NOW(),
    nota TEXT,
    direkod_oleh UUID REFERENCES profiles(id)
);
```

---

## 9. JADUAL pernyataan

```sql
CREATE TABLE pernyataan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kes_id UUID REFERENCES kes(id) ON DELETE CASCADE,
    pekerja_id UUID REFERENCES pekerja(id) ON DELETE SET NULL,
    tarikh_rakaman DATE NOT NULL,
    masa_rakaman TIME,
    lokasi TEXT,
    rujukan_seksyen TEXT,
    kandungan TEXT,
    bahasa TEXT DEFAULT 'bm',
    nama_jurubahasa TEXT,
    ditandatangan BOOLEAN DEFAULT false,
    tandatangan_url TEXT,
    direkod_oleh UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 10. JADUAL kompaun

```sql
CREATE TABLE kompaun (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kes_id UUID REFERENCES kes(id) ON DELETE CASCADE,
    tarikh_tawaran DATE NOT NULL,
    jumlah DECIMAL(12,2) NOT NULL,
    rujukan_seksyen TEXT,
    tarikh_akhir DATE,
    status status_kompaun DEFAULT 'ditawarkan',
    tarikh_bayaran DATE,
    rujukan_bayaran TEXT,
    nota TEXT,
    dibuat_oleh UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 11. JADUAL pertuduhan

```sql
CREATE TABLE pertuduhan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kes_id UUID REFERENCES kes(id) ON DELETE CASCADE,
    no_pertuduhan TEXT,
    daerah_mahkamah TEXT,
    negeri_mahkamah TEXT,
    tarikh_pertuduhan DATE,
    kandungan TEXT,
    jenis_kesalahan_id UUID REFERENCES rujukan_akta(id),
    status status_pertuduhan DEFAULT 'draf',
    dibuat_oleh UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 12. JADUAL log_audit

```sql
CREATE TABLE log_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_jadual TEXT NOT NULL,
    rekod_id UUID NOT NULL,
    tindakan TEXT NOT NULL CHECK (tindakan IN ('create', 'update', 'delete')),
    data_lama JSONB,
    data_baru JSONB,
    pengguna_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Indexes

```sql
CREATE INDEX idx_kes_majikan_id ON kes(majikan_id);
CREATE INDEX idx_kes_io_id ON kes(io_id);
CREATE INDEX idx_kes_status ON kes(status_kes);
CREATE INDEX idx_kes_jenis_akta ON kes(jenis_akta);
CREATE INDEX idx_pekerja_kes_id ON pekerja(kes_id);
CREATE INDEX idx_kesalahan_kes_kes_id ON kesalahan_kes(kes_id);
CREATE INDEX idx_bukti_kes_id ON bukti(kes_id);
CREATE INDEX idx_pernyataan_kes_id ON pernyataan(kes_id);
CREATE INDEX idx_kompaun_kes_id ON kompaun(kes_id);
CREATE INDEX idx_pertuduhan_kes_id ON pertuduhan(kes_id);
CREATE INDEX idx_log_audit_jadual_rekod ON log_audit(nama_jadual, rekod_id);
CREATE INDEX idx_log_audit_created_at ON log_audit(created_at);
```

---

## Ringkasan Hubungan (Foreign Keys)

| Jadual | Foreign Key | References |
|--------|-------------|------------|
| `kes` | `majikan_id` | `majikan_oks(id)` |
| `kes` | `io_id` | `profiles(id)` |
| `pekerja` | `kes_id` | `kes(id)` |
| `kesalahan_kes` | `kes_id` | `kes(id)` |
| `kesalahan_kes` | `jenis_kesalahan_id` | `rujukan_akta(id)` |
| `bukti` | `kes_id` | `kes(id)` |
| `rantaian_jagaan` | `bukti_id` | `bukti(id)` |
| `pernyataan` | `kes_id` | `kes(id)` |
| `pernyataan` | `pekerja_id` | `pekerja(id)` |
| `kompaun` | `kes_id` | `kes(id)` |
| `pertuduhan` | `kes_id` | `kes(id)` |

---

## Status: DRAFT
Dokumen ini akan digunakan untuk Phase B selepas keperluan dilengkapkan.
