# Walkthrough Testing — Kasbon App

Panduan testing lengkap berdasarkan requirement `docs/task-info/hiring-task-kasbon.md`.
Ikuti urutan ini untuk memverifikasi semua fitur, constraint, dan anti auto-reject.

---

## Prasyarat

- Node.js 20+ & pnpm terinstall
- Supabase project `kasbon-app` sudah ada (migration sudah di-push)
- File `.env` berisi:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
  ```
- Browser modern (Chrome/Firefox/Edge)
- Postman / curl / Thunder Client (untuk test API)

---

## 0. Setup Awal

```bash
# Install dependencies
pnpm install

# Jalankan dev server
pnpm dev
```

Buka `http://localhost:3000`.

---

## 1. Auth — Signup, Login, Logout

### 1.1 Signup

| Step | Aksi | Expected |
|------|------|----------|
| 1 | Buka `http://localhost:3000` | Redirect ke `/sign-in` |
| 2 | Klik link "Belum punya akun? Daftar" | Navigasi ke `/sign-up` |
| 3 | Isi: Email `tester1@kasbon.test`, Password `password123` | Form valid |
| 4 | Klik "Daftar" | Berhasil redirect ke `/dashboard` |
| 5 | Cek di Supabase Dashboard → Authentication → Users | User `tester1@kasbon.test` muncul (auto-confirmed) |

### 1.2 Logout

| Step | Aksi | Expected |
|------|------|----------|
| 1 | Di sidebar, klik avatar di pojok kiri bawah | Dropdown muncul |
| 2 | Klik "Keluar" | Redirect ke `/sign-in` |

### 1.3 Login

| Step | Aksi | Expected |
|------|------|----------|
| 1 | Isi email `tester1@kasbon.test`, password `password123` | Form valid |
| 2 | Klik "Masuk" | Redirect ke `/dashboard` |

### 1.4 Route Protection (Middleware/Proxy)

| Step | Aksi | Expected |
|------|------|----------|
| 1 | Logout, lalu akses `/dashboard` langsung | Redirect ke `/sign-in` |
| 2 | Login, lalu akses `/sign-in` langsung | Redirect ke `/dashboard` (sudah login) |

### 1.5 Validasi Form Auth

| Step | Aksi | Expected |
|------|------|----------|
| 1 | Sign-up dengan email tidak valid (`test@`) | Error validasi muncul |
| 2 | Sign-up dengan password < 6 char | Error dari Supabase dalam Bahasa Indonesia |
| 3 | Sign-in dengan password salah | Error "Email atau password salah" |

---

## 2. Dashboard — Summary Cards

### 2.1 Empty State

| Step | Aksi | Expected |
|------|------|----------|
| 1 | Login sebagai user baru (belum punya debt) | 3 card muncul: "Dihutang ke Saya" = Rp 0, "Saya Hutang" = Rp 0, "Net" = Rp 0 |
| 2 | Lihat section "Daftar Catatan" | Empty state: ilustrasi + teks "Belum ada catatan utang" |

### 2.2 Summary Calculation

Buat beberapa debt dulu (gunakan form di section 3):

- Debt A: `owed_to_me` (dihutang ke saya), Rp 500.000
- Debt B: `owed_to_me`, Rp 250.000
- Debt C: `i_owe` (saya hutang), Rp 300.000

| Step | Aksi | Expected |
|------|------|----------|
| 1 | Lihat card "Dihutang ke Saya" | `Rp 750.000` (500rb + 250rb) |
| 2 | Lihat card "Saya Hutang" | `Rp 300.000` |
| 3 | Lihat card "Net" | `Rp 450.000` (750rb - 300rb), warna **hijau** (positif) |
| 4 | Tambah debt `i_owe` Rp 500.000 | Net = `Rp -50.000`, warna **merah** (negatif) |

### 2.3 Format Rupiah (AUTO-REJECT CHECK)

| Check | Expected |
|-------|----------|
| Format di summary cards | `Rp 750.000` (titik sebagai pemisah ribuan) |
| Bukan | `Rp 750000`, `IDR 750,000`, `750000` |
| Locale | `id-ID` |

---

## 3. Form Catat Baru / Edit

### 3.1 Create — Happy Path

| Step | Aksi | Expected |
|------|------|----------|
| 1 | Klik tombol "+ Catat baru" | Modal form terbuka |
| 2 | Pilih radio "Saya dihutang" | Radio selected |
| 3 | Isi Nama: "Budi" | Input terisi |
| 4 | Isi Jumlah: `500000` | Input terisi |
| 5 | Tanggal: default hari ini | Date input = today |
| 6 | Catatan: "Utang bulan lalu" (opsional) | Input terisi |
| 7 | Klik "Simpan" | Modal tutup, entry muncul di list, summary update |

### 3.2 Validasi Client

| Step | Aksi | Expected |
|------|------|----------|
| 1 | Buka form, klik "Simpan" tanpa isi apapun | Error: nama wajib, jumlah wajib |
| 2 | Isi nama, jumlah = 0 | Error: jumlah harus > 0 |
| 3 | Isi catatan > 200 char | Error: maksimal 200 karakter |
| 4 | Isi jumlah negatif (`-100`) | Error: jumlah harus positif |

### 3.3 Validasi Server

Test via API langsung (lihat section 5.2).

### 3.4 Edit Entry

| Step | Aksi | Expected |
|------|------|----------|
| 1 | Klik tombol "Edit" di salah satu entry | Modal terbuka, form pre-filled |
| 2 | Ubah Jumlah dari 500.000 → 750.000 | Input terupdate |
| 3 | Klik "Simpan" | Modal tutup, jumlah di list berubah, summary update |

### 3.5 Form Fields Checklist

| Field | Type | Required | Constraint |
|-------|------|----------|------------|
| Tipe | Radio: "Saya dihutang" / "Saya hutang" | ✅ | — |
| Nama orang | Text | ✅ | Tidak kosong |
| Jumlah | Number | ✅ | > 0, integer |
| Tanggal | Date | ✅ | Default hari ini |
| Catatan | Textarea | ❌ | Max 200 char |

---

## 4. Dashboard — Debt List & Actions

### 4.1 List Display

Untuk setiap entry di list, verifikasi:

| Field | Expected |
|-------|----------|
| Nama orang | Tampil (e.g. "Budi") |
| Tipe | "Dihutang" atau "Saya hutang" |
| Jumlah | Format `Rp 500.000` |
| Tanggal relative | "Hari ini", "Kemarin", "3 hari lalu" |
| Status badge | "Belum lunas" (kuning) atau "Lunas" (hijau) |
| Tombol aksi | "Tandai lunas", "Edit", "Hapus" |

### 4.2 Tandai Lunas (AUTO-REJECT CHECK)

| Step | Aksi | Expected |
|------|------|----------|
| 1 | Entry status "Belum lunas", klik "Tandai lunas" | Status berubah jadi "Lunas" |
| 2 | **Refresh halaman (F5)** | Status **TETAP "Lunas"** — tidak balik (bukan client-only) |
| 3 | Cek di Supabase Dashboard → Table Editor → debts | Kolom `settled_at` terisi timestamp |
| 4 | Klik "Tandai belum lunas" (jika ada toggle) | Status balik "Belum lunas", `settled_at` = null |

> ⚠️ **AUTO-REJECT:** Kalau refresh → status balik "Belum lunas", berarti cuma update di client. Harus PATCH ke server.

### 4.3 Hapus Entry

| Step | Aksi | Expected |
|------|------|----------|
| 1 | Klik "Hapus" di salah satu entry | Konfirmasi dialog muncul |
| 2 | Klik "Ya, hapus" | Entry hilang dari list, summary update |
| 3 | Refresh halaman | Entry tetap hilang (terhapus dari DB) |

### 4.4 Filter

| Step | Aksi | Expected |
|------|------|----------|
| 1 | Filter Status: "Belum lunas" | Hanya entry belum lunas muncul |
| 2 | Filter Status: "Lunas" | Hanya entry lunas muncul |
| 3 | Filter Status: "Semua" | Semua entry muncul |
| 4 | Filter Tipe: "Dihutang" | Hanya `owed_to_me` muncul |
| 5 | Filter Tipe: "Hutang" | Hanya `i_owe` muncul |
| 6 | Kombinasi: Status="Lunas" + Tipe="Dihutang" | Hanya yang lunas & dihutang |

### 4.5 Tanggal Relative (CONSTRAINT CHECK)

| Check | Expected |
|-------|----------|
| Entry dibuat hari ini | "Hari ini" |
| Entry 1 hari lalu | "Kemarin" |
| Entry 3 hari lalu | "3 hari lalu" |
| Entry 1 minggu lalu | "1 minggu lalu" |
| Bukan | "2 days ago", "Yesterday", timestamp ISO |

---

## 5. API Endpoints

Setup: Login via UI, copy cookie `sb-<ref>-auth-token` dari DevTools → Application → Cookies.

Atau gunakan cara lain: signup via API, lalu gunakan access_token dari response.

### 5.1 GET /api/debts

```bash
# Ganti <TOKEN> dengan access_token user yang login
curl -X GET "http://localhost:3000/api/debts" \
  -H "Cookie: sb-<ref>-auth-token=<TOKEN>"
```

| Test | Expected |
|------|----------|
| Tanpa auth | 401, `{ "error": "Tidak terautentikasi..." }` |
| Dengan auth | 200, array of debts |
| `?status=settled` | Hanya yang `settled_at` tidak null |
| `?status=unsettled` | Hanya yang `settled_at` null |
| `?type=owed_to_me` | Hanya tipe `owed_to_me` |
| `?type=i_owe` | Hanya tipe `i_owe` |
| `?status=settled&type=i_owe` | Kombinasi filter |

### 5.2 POST /api/debts — Validasi Server

```bash
curl -X POST "http://localhost:3000/api/debts" \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-<ref>-auth-token=<TOKEN>" \
  -d '{"type":"owed_to_me","counterpart_name":"Budi","amount":500000}'
```

| Test | Body | Expected |
|------|------|----------|
| Valid | `{"type":"owed_to_me","counterpart_name":"Budi","amount":500000}` | 201, debt object |
| Tanpa auth | — | 401 |
| Nama kosong | `{"type":"owed_to_me","counterpart_name":"","amount":500000}` | 400, error Bahasa Indonesia |
| Amount 0 | `{"type":"owed_to_me","counterpart_name":"Budi","amount":0}` | 400 |
| Amount negatif | `{"type":"owed_to_me","counterpart_name":"Budi","amount":-100}` | 400 |
| Type invalid | `{"type":"invalid","counterpart_name":"Budi","amount":100}` | 400 |
| Catatan > 200 char | `{"type":"owed_to_me","counterpart_name":"Budi","amount":100,"note":"<201 char>"}` | 400 |

### 5.3 PATCH /api/debts/[id] — Tandai Lunas

```bash
# Ganti <ID> dengan debt ID
curl -X PATCH "http://localhost:3000/api/debts/<ID>" \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-<ref>-auth-token=<TOKEN>" \
  -d '{"settled_at":"2026-01-15T10:00:00Z"}'
```

| Test | Expected |
|------|----------|
| Tandai lunas | 200, `settled_at` terisi |
| Tandai belum lunas | `{"settled_at":null}` → 200, `settled_at` null |
| Edit field lain | `{"counterpart_name":"Andi"}` → 200, update |
| Tanpa auth | 401 |
| ID tidak ada | 404 |

### 5.4 DELETE /api/debts/[id]

```bash
curl -X DELETE "http://localhost:3000/api/debts/<ID>" \
  -H "Cookie: sb-<ref>-auth-token=<TOKEN>"
```

| Test | Expected |
|------|----------|
| Hapus milik sendiri | 200, `{ "success": true }` |
| Tanpa auth | 401 |
| ID tidak ada | 404 (atau 200 jika idempotent) |

### 5.5 Error Response Checklist

| Check | Expected |
|-------|----------|
| Bahasa | Indonesia (e.g. "Tidak terautentikasi. Silakan login.") |
| Status code | 400 (validasi), 401 (auth), 404 (not found), 500 (server error) |
| Format | `{ "error": "pesan" }` atau `{ "error": "...", "details": [...] }` |

---

## 6. RLS — Test Kebocoran (AUTO-REJECT CHECK)

> ⚠️ **INI PALING KRITIS.** Kalau RLS bocor = auto-reject langsung.

### 6.1 Setup 2 User

1. User A: `tester1@kasbon.test` — signup via UI, buat 3 debt
2. User B: `tester2@kasbon.test` — signup via UI, buat 2 debt

### 6.2 Test via Supabase REST API Langsung

Dapatkan access token User A (dari Supabase Dashboard → Authentication → Users, atau via API login):

```bash
# Login User A via Supabase REST API
curl -X POST "https://<project-ref>.supabase.co/auth/v1/token?grant_type=password" \
  -H "apikey: <ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"email":"tester1@kasbon.test","password":"password123"}'
```

Response berisi `access_token`. Ulangi untuk User B.

### 6.3 Test Isolasi Data

```bash
# User A baca debts miliknya — harus berhasil
curl -X GET "https://<project-ref>.supabase.co/rest/v1/debts?select=*" \
  -H "apikey: <ANON_KEY>" \
  -H "Authorization: Bearer <USER_A_TOKEN>"

# Expected: hanya debts milik User A
```

| Test | Aksi | Expected |
|------|------|----------|
| 1 | User A GET debts (pakai token A) | Hanya debts User A |
| 2 | User B GET debts (pakai token B) | Hanya debts User B |
| 3 | User A POST debt dengan `user_id` User B | **DITOLAK** (RLS INSERT policy) |
| 4 | User A PATCH debt milik User B | **DITOLAK** (0 rows affected) |
| 5 | User A DELETE debt milik User B | **DITOLAK** (0 rows affected) |
| 6 | Anon (tanpa token) GET debts | Array kosong `[]` |

### 6.4 Test ID Spoofing

```bash
# User A coba insert dengan user_id User B
curl -X POST "https://<project-ref>.supabase.co/rest/v1/debts" \
  -H "apikey: <ANON_KEY>" \
  -H "Authorization: Bearer <USER_A_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"<USER_B_UUID>","type":"owed_to_me","counterpart_name":"Hack","amount":999}'

# Expected: ERROR — RLS policy WITH CHECK (user_id = auth.uid()) fails
# Row tidak masuk ke DB, atau masuk dengan user_id = User A (tergantung policy)
```

> ✅ **PASS** kalau: row ditolak ATAU `user_id` dipaksa jadi User A.
> ❌ **FAIL (AUTO-REJECT)** kalau: row masuk dengan `user_id` User B.

---

## 7. TypeScript & Code Quality

### 7.1 Type Check

```bash
pnpm typecheck
```

| Check | Expected |
|-------|----------|
| Exit code | 0 (no errors) |
| `any` usage | Minimal / tidak ada |

### 7.2 Build

```bash
pnpm build
```

| Check | Expected |
|-------|----------|
| Build berhasil | ✓ Compiled successfully |
| Tidak ada error | Exit code 0 |

### 7.3 Cek `any` Manual

```bash
# Cari penggunaan 'any' di codebase
rg "\bany\b" --type ts -g "!node_modules" -g "!.next"
```

Expected: hanya di catch blocks atau type assertions yang justified.

---

## 8. Database Schema Verification

### 8.1 Cek Struktur Tabel

```bash
supabase db query --linked "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'debts' ORDER BY ordinal_position;"
```

Verifikasi 10 kolom sesuai spec:

| Column | Type | Nullable |
|--------|------|----------|
| id | uuid | NO |
| user_id | uuid | NO |
| type | USER-DEFINED (enum) | NO |
| counterpart_name | text | NO |
| amount | bigint | NO |
| note | text | YES |
| due_date | date | YES |
| settled_at | timestamp with time zone | YES |
| created_at | timestamp with time zone | YES |
| updated_at | timestamp with time zone | YES |

### 8.2 Cek RLS Policies

```bash
supabase db query --linked "SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'debts';"
```

Expected 4 policies:
- SELECT: `auth.uid() = user_id`
- INSERT: WITH CHECK `user_id = auth.uid()`
- UPDATE: `auth.uid() = user_id`
- DELETE: `auth.uid() = user_id`

### 8.3 Cek RLS Enabled

```bash
supabase db query --linked "SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'debts';"
```

Expected: `relrowsecurity = true`

---

## 9. Constraint Checklist (Anti Auto-Reject)

| # | Constraint | Cara Test | Status |
|---|------------|-----------|--------|
| 1 | RLS tidak bocor | Section 6.3 & 6.4 | ☐ |
| 2 | Format Rupiah `Rp 1.234.000` | Section 2.3 & 4.1 | ☐ |
| 3 | "Tandai lunas" persist setelah refresh | Section 4.2 | ☐ |
| 4 | Tidak ada `any` di mana-mana | Section 7.3 | ☐ |
| 5 | Tidak ada mock/hardcode data | Cek codebase, semua dari Supabase | ☐ |
| 6 | Deploy jalan | Test di Vercel URL | ☐ |
| 7 | Bisa jelasin kode di Loom | Review semua file, pahami setiap baris | ☐ |

---

## 10. Bonus Features (Jika Diimplementasi)

### 10.1 Search by Nama

| Step | Aksi | Expected |
|------|------|----------|
| 1 | Ketik "Budi" di search box | List terfilter, hanya entry dengan nama "Budi" |
| 2 | Ketik nama yang tidak ada | Empty state "Tidak ditemukan" |

### 10.2 Sort

| Step | Aksi | Expected |
|------|------|----------|
| 1 | Sort by Jumlah (desc) | Entry dengan amount terbesar di atas |
| 2 | Sort by Tanggal (desc) | Entry terbaru di atas |

### 10.3 Group by Orang

| Step | Aksi | Expected |
|------|------|----------|
| 1 | Aktifkan group view | Entry dikelompokkan per nama |
| 2 | Lihat "Budi" | "Budi: 3 entry, total Rp 1.250.000" |

### 10.4 Bar Chart

| Step | Aksi | Expected |
|------|------|----------|
| 1 | Lihat chart di dashboard | Bar chart: "Dihutang" vs "Saya Hutang" |
| 2 | Hover bar | Tooltip muncul dengan nilai |

### 10.5 States

| State | Cara Trigger | Expected |
|-------|--------------|----------|
| Empty | User baru tanpa debt | Ilustrasi + pesan |
| Loading | Throttle network (DevTools) | Skeleton/spinner |
| Error | Matikan Supabase / putus internet | Error message + retry button |

### 10.6 Mobile-First

| Step | Aksi | Expected |
|------|------|----------|
| 1 | DevTools → Toggle device toolbar (Ctrl+Shift+M) | Viewport mobile |
| 2 | Set ke iPhone SE (375px) | Layout tidak overflow horizontal |
| 3 | Cek summary cards | Stack vertikal (tidak 3 kolom) |
| 4 | Cek debt list | Card layout, touch-friendly |
| 5 | Cek sidebar | Bisa collapse/expand |
| 6 | Cek form modal | Full-width, scrollable jika perlu |

---

## 11. Final Smoke Test

Lakukan end-to-end flow lengkap:

1. **Signup** user baru `demo@kasbon.test`
2. **Login** → masuk dashboard, lihat empty state
3. **Create** 3 debt:
   - "Andi" dihutang ke saya Rp 200.000
   - "Budi" dihutang ke saya Rp 500.000 (dengan catatan)
   - "Citra" saya hutang Rp 150.000
4. **Verify** summary: Dihutang = Rp 700.000, Hutang = Rp 150.000, Net = Rp 550.000 (hijau)
5. **Tandai lunas** debt "Andi" → refresh → status tetap "Lunas"
6. **Edit** debt "Budi" → ubah jadi Rp 600.000 → summary update
7. **Filter** Status="Belum lunas" → hanya "Budi" & "Citra" muncul
8. **Filter** Tipe="Dihutang" → hanya "Budi" muncul (Andi sudah lunas)
9. **Hapus** debt "Citra" → hilang dari list, summary update
10. **Logout** → redirect ke sign-in
11. **Login** lagi → data masih ada (persisted di Supabase)

---

## Checklist Sebelum Submit

- [ ] Semua test di section 1-6 PASS
- [ ] Tidak ada auto-reject (section 9)
- [ ] `pnpm typecheck` clean
- [ ] `pnpm build` clean
- [ ] RLS tested dengan 2 user (section 6)
- [ ] Deploy Vercel jalan
- [ ] README lengkap (setup, demo link, approach, trade-off, time spent)
- [ ] Minimal 5 commit bermakna
- [ ] Loom 3 menit (demo + technical decision + trade-off)
