# Kasbon — Personal Debt Tracker

> Web app buat catat siapa hutang berapa ke kamu, atau kamu hutang berapa ke siapa. Tandai lunas, lihat summary, filter & cari — semua dalam satu dashboard.

**Demo:** [https://kasbon.vercel.app](https://kasbon.vercel.app) _(ganti dengan link deploy kamu)_

---

## Daftar Isi

- [Preview](#preview)
- [Fitur](#fitur)
- [Tech Stack](#tech-stack)
- [Kenapa Library Ini?](#kenapa-library-ini)
- [Arsitektur & Alur Data](#arsitektur--alur-data)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Setup Lokal](#setup-lokal)
- [Approach](#approach)
- [Trade-off](#trade-off)
- [Time Spent](#time-spent)

---

## Preview

| Dashboard | Form Catat | Dark Mode |
|:---------:|:----------:|:---------:|
| Summary cards + daftar utang | Modal create/edit | Tekan `D` untuk toggle |

---

## Fitur

### Core

- **Auth** — Signup & login pakai email + password (Supabase Auth)
- **Dashboard** — 3 summary card (dihutang, hutang, net) + daftar semua catatan
- **CRUD** — Catat baru, edit, hapus, tandai lunas/belum lunas
- **Filter** — By status (lunas/belum) dan tipe (dihutang/hutang)
- **Format Rupiah** — `Rp 1.234.000` pakai locale `id-ID`
- **Tanggal Relatif** — "Hari ini", "Kemarin", "3 hari lalu" (Bahasa Indonesia)
- **Validasi** — Client-side (Zod) + server-side. Semua pesan error Bahasa Indonesia
- **RLS** — Row Level Security: user cuma bisa akses data miliknya sendiri

### Bonus

- **Search** — Cari by nama orang (case-insensitive)
- **Sort** — By jumlah atau tanggal (ascending/descending)
- **Group by orang** — Kelompokkan catatan per nama, lihat subtotal per orang
- **Bar Chart** — Visualisasi perbandingan total dihutang vs hutang (Recharts)
- **States** — Empty state, loading skeleton, error state + retry
- **Dark/Light Mode** — Toggle pakai tombol atau shortcut `D`

---

## Tech Stack

| Layer | Teknologi | Versi |
|-------|-----------|-------|
| Framework | Next.js (App Router, Turbopack) | 16.1.7 |
| Language | TypeScript (strict mode) | 5.9.3 |
| UI Library | React | 19.2.4 |
| Styling | Tailwind CSS v4 | 4.2.1 |
| Components | shadcn/ui + Radix UI | — |
| Icons | Lucide React | 1.16.0 |
| Database | Supabase (PostgreSQL) | — |
| Auth | Supabase Auth (email + password) | — |
| DB Client | @supabase/supabase-js + @supabase/ssr | 2.108.2 / 0.12.0 |
| Validation | Zod v4 | 4.0.0 |
| Charts | Recharts | 3.8.0 |
| URL State | nuqs | 2.8.9 |
| Theme | next-themes | 0.4.6 |
| Package Manager | pnpm | — |

---

## Kenapa Library Ini?

Library di luar stack wajib dan alasan pakainya:

| Library | Alasan |
|---------|--------|
| **shadcn/ui** | Component library yang customizable. Bukan dependency — component di-copy ke project, jadi bisa di-tweak sesuka hati tanpa dependency lock-in. |
| **Recharts** | Library chart React paling mature. Satu `<BarChart>` component buat bonus bar chart perbandingan utang. |
| **nuqs** | Bikin filter (status, type, search, sort, group) tersimpan di URL query params. User bisa share/bookmark URL filter tertentu, dan state survive page refresh. |
| **next-themes** | Dark mode toggle yang handle SSR hydration mismatch. Satu baris setup. |
| **Zod v4** | Validasi schema yang sama bisa dipakai di client (form) dan server (API). Type inference otomatis. |
| **date-fns** | Terinstall tapi akhirnya relative date di-handle manual pakai native `Intl` + `Date` API supaya kontrol penuh atas output Bahasa Indonesia ("Kemarin", "3 hari lalu"). |
| **clsx + tailwind-merge** | Utility standar buat conditional class names tanpa conflict. |

---

## Arsitektur & Alur Data

```
┌─────────────────────────────────────────────────────┐
│                     Browser                          │
│                                                      │
│  ┌──────────┐   ┌──────────┐   ┌───────────────┐   │
│  │ Summary  │   │  Chart   │   │   Debt List   │   │
│  │  Cards   │   │          │   │  (filtered)   │   │
│  └────┬─────┘   └────┬─────┘   └───────┬───────┘   │
│       │              │                  │            │
│       └──────────────┼──────────────────┘            │
│                      │                               │
│              useDebts() hook                         │
│              (fetch + cache)                         │
│                      │                               │
│              ┌───────▼────────┐                      │
│              │  CustomEvent   │  ◄── notifyDebtChanged()
│              │  (invalidate)  │      (setelah create/edit/delete)
│              └───────┬────────┘                      │
└──────────────────────┼───────────────────────────────┘
                       │ fetch
                       ▼
              ┌────────────────┐
              │   Next.js API  │
              │   /api/debts   │
              │   /api/debts/  │
              │      [id]      │
              └───────┬────────┘
                      │ Zod validate
                      │ Auth check
                      ▼
              ┌────────────────┐
              │   Supabase     │
              │  PostgreSQL    │
              │   + RLS        │
              └────────────────┘
```

**Alur singkat:**

1. User buka `/dashboard` → 3 komponen (`SummaryCards`, `DebtChart`, `DebtList`) masing-masing panggil `useDebts()` hook
2. Hook fetch ke `GET /api/debts` dengan query params filter aktif
3. API route cek auth → query Supabase (RLS otomatis filter by `user_id`) → return data
4. Saat user create/edit/delete → API dipanggil → `notifyDebtChanged()` broadcast `CustomEvent` → semua hook refetch otomatis
5. Filter/sort/search disimpan di URL via `nuqs` — survive refresh, bisa di-share

---

## Database Schema

Satu tabel `debts` dengan Row Level Security (RLS) aktif:

```sql
CREATE TYPE debt_type AS ENUM ('owed_to_me', 'i_owe');

CREATE TABLE debts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type              debt_type NOT NULL,
  counterpart_name  TEXT NOT NULL,
  amount            BIGINT NOT NULL,        -- dalam Rupiah utuh, bukan desimal
  note              TEXT,
  due_date          DATE,
  settled_at        TIMESTAMPTZ,            -- NULL = belum lunas
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS Policies

User **hanya bisa akses data miliknya sendiri** — 4 policy, semua cek `auth.uid() = user_id`:

| Operasi | Policy |
|---------|--------|
| SELECT | `USING (auth.uid() = user_id)` |
| INSERT | `WITH CHECK (auth.uid() = user_id)` — cegah spoofing `user_id` orang lain |
| UPDATE | `USING (auth.uid() = user_id)` |
| DELETE | `USING (auth.uid() = user_id)` |

Ada trigger `set_updated_at` yang otomatis update kolom `updated_at` setiap kali row di-update.

---

## API Endpoints

Semua endpoint wajib authenticated. Response error dalam Bahasa Indonesia.

| Method | Path | Fungsi |
|--------|------|--------|
| `GET` | `/api/debts` | List utang user (+ filter & sort) |
| `POST` | `/api/debts` | Catat utang baru |
| `GET` | `/api/debts/[id]` | Detail satu catatan |
| `PATCH` | `/api/debts/[id]` | Update catatan (termasuk tandai lunas) |
| `DELETE` | `/api/debts/[id]` | Hapus catatan |

### Query Parameters (GET /api/debts)

| Param | Nilai | Contoh |
|-------|-------|--------|
| `status` | `settled` / `unsettled` | `?status=unsettled` |
| `type` | `owed_to_me` / `i_owe` | `?type=owed_to_me` |
| `q` | string (search nama) | `?q=budi` |
| `sort` | `date-desc` / `date-asc` / `amount-desc` / `amount-asc` | `?sort=amount-desc` |

### Contoh Response

**Success (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "...",
  "type": "owed_to_me",
  "counterpart_name": "Budi",
  "amount": 500000,
  "note": "Utang bulan lalu",
  "due_date": "2026-07-01",
  "settled_at": null,
  "created_at": "2026-06-25T10:00:00Z",
  "updated_at": "2026-06-25T10:00:00Z"
}
```

**Error (401):**
```json
{ "error": "Tidak terautentikasi. Silakan login." }
```

**Validation Error (400):**
```json
{
  "error": "Validasi gagal",
  "details": {
    "counterpart_name": ["Nama wajib diisi"],
    "amount": ["Jumlah harus lebih dari 0"]
  }
}
```

---

## Setup Lokal

### Prasyarat

- **Node.js** 20 atau lebih baru
- **pnpm** (install: `npm install -g pnpm`)
- **Akun Supabase** — [supabase.com](https://supabase.com) (free tier cukup)

### 1. Clone & Install

```bash
git clone https://github.com/<username>/hiring-task-kasbon.git
cd hiring-task-kasbon
pnpm install
```

### 2. Setup Supabase

1. Buat project baru di [Supabase Dashboard](https://supabase.com/dashboard)
2. Buka **Settings → API** — copy `Project URL` dan `anon public` key
3. Buka **SQL Editor** — paste & jalankan isi file `supabase/migrations/001_create_debts.sql`

   > File ini membuat tabel `debts`, enum `debt_type`, 4 RLS policy, dan trigger `updated_at`.

4. (Opsional) Di **Authentication → Settings**, matikan "Confirm email" biar signup langsung aktif tanpa verifikasi email — lebih gampang buat testing

### 3. Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> Semua variable `NEXT_PUBLIC_` — aman untuk client karena keamanan dijamin oleh RLS, bukan secret key.

### 4. Jalankan

```bash
pnpm dev
```

Buka [http://localhost:3000](http://localhost:3000) — otomatis redirect ke halaman login.

### Available Scripts

| Perintah | Fungsi |
|----------|--------|
| `pnpm dev` | Jalankan dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Serve production build |
| `pnpm lint` | Jalankan ESLint |
| `pnpm format` | Format semua file (Prettier) |
| `pnpm typecheck` | Cek TypeScript tanpa emit |

---

## Struktur Project

```
app/
├── (auth)/
│   ├── layout.tsx                # Layout halaman auth (branding "Kasbon")
│   ├── sign-in/page.tsx          # Halaman login
│   └── sign-up/page.tsx          # Halaman daftar
├── api/debts/
│   ├── route.ts                  # GET (list + filter) & POST (create)
│   └── [id]/route.ts             # GET (detail), PATCH (update/lunas), DELETE
├── dashboard/
│   ├── layout.tsx                # Sidebar + header
│   ├── page.tsx                  # Halaman utama dashboard
│   └── error.tsx                 # Error boundary
├── globals.css                   # Tailwind v4 + CSS variables tema
├── layout.tsx                    # Root layout (font, provider)
└── page.tsx                      # "/" → redirect ke /dashboard

components/
├── dashboard/
│   ├── sidebar.tsx               # Navigasi + avatar + logout
│   ├── summary-cards.tsx         # 3 card ringkasan
│   ├── debt-chart.tsx            # Bar chart (recharts)
│   ├── debt-filters.tsx          # Search, filter, sort, group toggle
│   ├── debt-list.tsx             # Render daftar flat atau grouped
│   ├── debt-item.tsx             # Card per catatan + aksi
│   ├── debt-group.tsx            # Kelompok catatan per orang (collapsible)
│   ├── debt-form-modal.tsx       # Modal form catat/edit
│   └── states.tsx                # Empty, error, loading skeleton
├── ui/                           # 13 shadcn/ui components
└── theme-provider.tsx            # Dark/light mode toggle

hooks/
├── use-debts.ts                  # Data fetching + cache invalidation
└── use-mobile.ts                 # Deteksi breakpoint mobile

lib/
├── supabase/
│   ├── client.ts                 # Browser Supabase client
│   ├── server.ts                 # Server Supabase client (cookies)
│   ├── middleware.ts             # Auth session refresh helper
│   └── types.ts                  # Database type definitions
├── validators.ts                 # Zod v4 schemas (Debt, Create, Update)
├── format.ts                     # formatRupiah() + formatRelativeDate()
├── group-debts.ts                # Pure function: group by nama
├── search-params.ts              # nuqs URL query param definitions
├── debt-cache.ts                 # CustomEvent-based cache invalidation
└── utils.ts                      # cn() helper

supabase/migrations/
└── 001_create_debts.sql          # Tabel + RLS + trigger
```

---

## Approach

Keputusan arsitektur yang jadi fondasi:

**Supabase JS client langsung (tanpa ORM).** Saya skip Drizzle dan pakai `@supabase/supabase-js` langsung karena:
- RLS otomatis ter-enforce di setiap query — tidak perlu manual filter `WHERE user_id = ?` di application layer
- Insert `user_id` dipaksa match `auth.uid()` oleh policy — spoofing di-block di database level
- Satu client handle auth + data, mengurangi boilerplate

**URL-driven filter state pakai nuqs.** Semua filter, sort, dan search tersimpan di URL query params. Artinya: state survive page refresh, user bisa share link ke filter tertentu, dan browser back/forward berfungsi natural tanpa custom state management.

**CustomEvent cache invalidation.** Daripada pakai global state manager (Redux/Zustand) atau prop drilling, setiap mutasi (create/edit/delete) dispatch `CustomEvent` yang semua mounted `useDebts()` hook subscribe. Komponen yang perlu data terbaru (summary cards, chart, list) refetch secara independen. Simple, zero-dependency, dan scalable.

**Validasi satu schema, dua tempat.** Zod schema yang sama (`CreateDebtSchema`, `UpdateDebtSchema`) dipakai di client (form validation) dan server (API validation). User dapat feedback instan di form, tapi data tetap di-validate ulang di server — defense in depth.

---

## Trade-off

Kalau ada 1 hari lagi, yang saya polish:

1. **Middleware route protection** — Saat ini route protection bergantung pada API-level auth check. Idealnya ada `middleware.ts` di root yang intercept request ke `/dashboard` dan redirect sebelum halaman ter-render. Logic-nya sudah ditulis di `proxy.ts`, tinggal wire ke Next.js middleware.

2. **Optimistic updates** — Saat ini setiap mutasi trigger full refetch. Dengan optimistic UI, user langsung lihat perubahan tanpa nunggu round-trip ke server. Bisa pakai `useSWR` atau `TanStack Query` dengan `mutate()`.

3. **Browser back/forward (nuqs)** — Filter state tersimpan di URL via nuqs, tapi browser back belum sinkron dengan UI. URL berubah saat back, tapi komponen belum react ke perubahan. Perlu perbaikan konfigurasi history mode dan pastikan `popstate` event ter-handle konsisten.

4. **Mobile polish** — Layout sudah responsive, tapi bisa lebih polished: bottom sheet buat form di mobile (bukan modal), swipe gestures buat "tandai lunas", dan touch target yang lebih besar.

5. **E2E test** — Playwright test buat critical path: signup → create debt → tandai lunas → refresh → masih lunas. Saat ini ada unit test buat `groupDebtsByPerson()`, tapi belum cover flow end-to-end.

---

## Time Spent

> _(isi jujur, contoh format di bawah)_

| Aktivitas | Durasi |
|-----------|--------|
| Setup project + Supabase + auth | ~X jam |
| Database schema + RLS + migration | ~X jam |
| API endpoints (CRUD + validasi) | ~X jam |
| Dashboard UI (summary, list, form, filter) | ~X jam |
| Bonus (chart, search, sort, group, states) | ~X jam |
| Polish (dark mode, format, relative date) | ~X jam |
| **Total** | **~X jam** |

---

## License

MIT
