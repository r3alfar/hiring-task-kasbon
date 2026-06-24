# Implementation Plan: Kasbon — Personal Debt Tracker

## Overview

Web app to track personal debts (utang piutang). Users record who owes them money (or vice versa), mark debts as settled, see summary totals. Built with Next.js 16 + Supabase + Tailwind CSS v4 + shadcn/ui. All UI in casual Bahasa Indonesia.

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **Supabase JS client only** | RLS enforced automatically, auth + data in one client, no Drizzle overhead |
| **Remove better-auth + Drizzle** | Task mandates Supabase Auth. Clean up after features done |
| **`@supabase/ssr`** | Server-side auth in App Router (cookies-based session) |
| **date-fns + id locale** | Relative dates in Indonesian. Justify in README |
| **Zod v4** (already installed) | Client + server validation |
| **Keep shadcn/ui + recharts** | Already installed, shadcn for forms/modals, recharts for bonus chart |
| **SQL migrations in `supabase/migrations/`** | Task requirement. Raw SQL, not Drizzle |

## Project Structure (Target)

```
app/
├── (auth)/
│   ├── layout.tsx              # Auth pages layout (Indonesian)
│   ├── sign-in/page.tsx        # Login page
│   └── sign-up/page.tsx        # Signup page
├── (protected)/
│   ├── layout.tsx              # Auth guard + navbar
│   └── dashboard/
│       └── page.tsx            # Main dashboard
├── api/
│   └── debts/
│       ├── route.ts            # GET (list) + POST (create)
│       └── [id]/
│           └── route.ts        # PATCH (update/settle) + DELETE
├── globals.css
├── layout.tsx
└── page.tsx                    # Redirect to /dashboard

components/
├── dashboard/
│   ├── summary-cards.tsx       # 3 cards: dihutang, hutang, net
│   ├── debt-list.tsx           # Table/list of debts
│   ├── debt-filters.tsx        # Status + type dropdowns
│   ├── debt-form-modal.tsx     # Create/edit modal
│   └── debt-chart.tsx          # Bonus: bar chart
├── ui/                         # shadcn components (keep)
└── ...

lib/
├── supabase/
│   ├── client.ts               # Browser client
│   ├── server.ts               # Server client (cookies)
│   ├── middleware.ts            # Auth middleware helper
│   └── types.ts                # Database types
├── validators.ts               # Zod schemas for debt
├── format.ts                   # Rupiah formatter + relative date
└── types.ts                    # TypeScript types for Debt

middleware.ts                   # Next.js middleware (auth guard)

supabase/
└── migrations/
    └── 001_create_debts.sql    # Table + RLS policies
```

## Task List

### Phase 1: Foundation — Supabase Setup

#### Task 1: Install Supabase dependencies & configure clients
- **Description:** Install `@supabase/supabase-js` and `@supabase/ssr`. Create browser client, server client, and middleware helper. Add `.env.example` with required vars.
- **Acceptance criteria:**
  - [x] `@supabase/supabase-js` and `@supabase/ssr` installed
  - [x] `lib/supabase/client.ts` — browser client using `createBrowserClient`
  - [x] `lib/supabase/server.ts` — server client using `createServerClient` with cookies
  - [x] `.env.example` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Files:** `lib/supabase/client.ts`, `lib/supabase/server.ts`, `.env.example`, `package.json`
- **Scope:** Small

#### Task 2: Database migration — `debts` table + RLS
- **Description:** Write SQL migration creating `debts` table with all required columns and strict RLS policies.
- **Acceptance criteria:**
  - [x] `supabase/migrations/001_create_debts.sql` exists
  - [x] Table has: `id` (uuid PK), `user_id` (uuid FK auth.users), `type` (enum `owed_to_me`/`i_owe`), `counterpart_name` (text), `amount` (bigint), `note` (text nullable), `due_date` (date nullable), `settled_at` (timestamptz nullable), `created_at`, `updated_at`
  - [x] RLS enabled: SELECT/INSERT/UPDATE/DELETE restricted to `auth.uid() = user_id`
  - [x] INSERT policy forces `user_id = auth.uid()` (prevent spoofing)
- **Files:** `supabase/migrations/001_create_debts.sql`
- **Scope:** Small

#### Task 3: Auth middleware + route protection
- **Description:** Create Next.js middleware that refreshes Supabase session and redirects unauthenticated users away from protected routes.
- **Acceptance criteria:**
  - [x] `middleware.ts` at project root
  - [x] Unauthenticated users redirected to `/sign-in`
  - [x] Authenticated users accessing `/sign-in` or `/sign-up` redirected to `/dashboard`
  - [x] Session token refreshed on every request
- **Files:** `middleware.ts`, `lib/supabase/middleware.ts`
- **Scope:** Small

### Checkpoint: Foundation
- [x] Supabase clients created
- [x] Migration SQL ready
- [x] Middleware protects routes
- [ ] `pnpm build` succeeds

---

### Phase 2: Auth — Signup, Login, Logout

#### Task 4: Rewrite Sign-up page for Supabase Auth
- **Description:** Replace better-auth sign-up with Supabase `signUp` (email + password). Indonesian UI. Client validation with Zod.
- **Acceptance criteria:**
  - [x] Email + password fields with validation
  - [x] Calls `supabase.auth.signUp()`
  - [x] Error messages in Indonesian
  - [x] Redirects to `/dashboard` on success
  - [x] UI is Indonesian casual copy
- **Files:** `app/(auth)/sign-up/page.tsx`
- **Scope:** Small

#### Task 5: Rewrite Sign-in page for Supabase Auth
- **Description:** Replace better-auth sign-in with Supabase `signInWithPassword`. Indonesian UI.
- **Acceptance criteria:**
  - [x] Email + password fields
  - [x] Calls `supabase.auth.signInWithPassword()`
  - [x] Error handling in Indonesian
  - [x] Redirects to `/dashboard` on success
- **Files:** `app/(auth)/sign-in/page.tsx`
- **Scope:** Small

#### Task 6: Auth layout + Logout
- **Description:** Update auth layout (Indonesian branding "Kasbon"), add logout button to protected layout.
- **Acceptance criteria:**
  - [x] Auth layout branded "Kasbon" with Indonesian copy
  - [x] Protected layout has logout button calling `supabase.auth.signOut()`
  - [x] After logout, redirect to `/sign-in`
- **Files:** `app/(auth)/layout.tsx`, `app/(protected)/layout.tsx`
- **Scope:** Small

### Checkpoint: Auth
- [x] Can sign up, sign in, sign out
- [x] Protected routes redirect when not authenticated
- [ ] Build succeeds

---

### Phase 3: Core — API + Dashboard

#### Task 7: Utility functions — Rupiah format + relative dates
- **Description:** Create helpers for `Rp 1.234.000` formatting (id-ID locale) and Indonesian relative dates using date-fns.
- **Acceptance criteria:**
  - [x] `formatRupiah(amount: number)` returns `Rp X.XXX.XXX`
  - [x] `relativeDate(date: Date | string)` returns Indonesian relative time ("3 hari lalu", "kemarin")
  - [x] Install `date-fns`
- **Files:** `lib/format.ts`, `package.json`
- **Scope:** XS

#### Task 8: Zod validators + TypeScript types
- **Description:** Create Zod schemas for debt creation/update and TypeScript types.
- **Acceptance criteria:**
  - [x] `Debt` type matching DB schema
  - [x] `CreateDebtSchema` — validates type, counterpart_name, amount, date, note
  - [x] `UpdateDebtSchema` — partial of create + settled_at
  - [x] No `any` types
- **Files:** `lib/types.ts`, `lib/validators.ts`
- **Scope:** XS

#### Task 9: API — `GET /api/debts` + `POST /api/debts`
- **Description:** List debts (with ?status & ?type filters) and create new debt. Auth required. Indonesian error messages.
- **Acceptance criteria:**
  - [x] GET returns user's debts, supports `?status=settled|unsettled` and `?type=owed_to_me|i_owe`
  - [x] POST creates debt with server-side Zod validation
  - [x] 401 if not authenticated
  - [x] Error responses in Indonesian with proper status codes
  - [x] TypeScript strict, no `any`
- **Files:** `app/api/debts/route.ts`
- **Scope:** Small

#### Task 10: API — `PATCH /api/debts/[id]` + `DELETE /api/debts/[id]`
- **Description:** Update debt (including settle) and delete debt. Auth + ownership enforced by RLS.
- **Acceptance criteria:**
  - [x] PATCH updates fields, can set `settled_at` to mark as settled
  - [x] DELETE removes debt
  - [x] 401 if not authenticated, 404 if not found (RLS handles ownership)
  - [x] Indonesian error messages
- **Files:** `app/api/debts/[id]/route.ts`
- **Scope:** Small

### Checkpoint: API
- [ ] All 4 endpoints work (test via curl/Postman)
- [ ] RLS prevents cross-user access
- [ ] Build succeeds

---

### Phase 4: Dashboard UI

#### Task 11: Summary cards component (3 cards)
- **Description:** Build 3 cards showing "Total dihutang ke saya", "Total saya hutang", "Net" (green/red).
- **Acceptance criteria:**
  - [x] Fetches aggregated data from API
  - [x] Rupiah formatted with `id-ID` locale
  - [x] Net card green if positive, red if negative
  - [x] Loading state
- **Files:** `components/dashboard/summary-cards.tsx`
- **Scope:** Small

#### Task 12: Debt list + action buttons
- **Description:** Table/list of all debt entries with name, type, amount, relative date, status, action buttons.
- **Acceptance criteria:**
  - [x] Shows all fields per spec (nama, tipe, jumlah, tanggal relative, status)
  - [x] "Tandai lunas" button → PATCH settled_at
  - [x] "Edit" button → opens form modal
  - [x] "Hapus" button → DELETE with confirmation
  - [x] Optimistic UI or refetch after mutation
- **Files:** `components/dashboard/debt-list.tsx`
- **Scope:** Medium

#### Task 13: Filter controls
- **Description:** Dropdown filters for status (semua/belum lunas/lunas) and type (semua/dihutang/hutang).
- **Acceptance criteria:**
  - [x] Two dropdown/select components
  - [x] Filters passed as query params to API
  - [x] "Semua" = no filter
- **Files:** `components/dashboard/debt-filters.tsx`
- **Scope:** Small

#### Task 14: Debt form modal (create + edit)
- **Description:** Modal with form for creating/editing debt. Radio for type, text for name, number for amount, date picker, notes textarea.
- **Acceptance criteria:**
  - [x] Radio: "Saya dihutang" / "Saya hutang"
  - [x] Client-side Zod validation
  - [x] Create mode: POST to API
  - [x] Edit mode: pre-filled, PATCH to API
  - [x] Notes max 200 chars
  - [x] Date defaults to today
  - [x] Indonesian labels and validation messages
- **Files:** `components/dashboard/debt-form-modal.tsx`
- **Scope:** Medium

#### Task 15: Dashboard page — assemble all components
- **Description:** Wire summary cards, filters, debt list, and form modal into the dashboard page. Add "+ Catat baru" button.
- **Acceptance criteria:**
  - [x] Summary cards at top
  - [x] Filters below
  - [x] Debt list below filters
  - [x] "+ Catat baru" button opens modal
  - [x] Page fetches data and passes to components
  - [x] Empty state when no debts
- **Files:** `app/(protected)/page.tsx`
- **Scope:** Medium

### Checkpoint: Core Complete
- [ ] Full CRUD flow works end-to-end
- [ ] Summary numbers correct
- [ ] Filters work
- [ ] Status toggle persists after refresh
- [ ] Mobile responsive

---

### Phase 5: Polish + Bonus

#### Task 16: Mobile-first responsive design pass
- **Description:** Ensure all components look good on mobile. Cards stack, table becomes card list on small screens.
- **Acceptance criteria:**
  - [ ] Dashboard usable on 375px width
  - [ ] No horizontal scroll
  - [ ] Touch targets adequate
- **Files:** Multiple component files
- **Scope:** Medium

#### Task 17: States — empty, loading, error
- **Description:** Add proper empty states (no debts yet), loading skeletons, error boundaries.
- **Acceptance criteria:**
  - [ ] Empty state with illustration/message
  - [ ] Loading skeletons for cards and list
  - [ ] Error state with retry button
- **Files:** Multiple component files
- **Scope:** Small

#### Task 18: Bonus — search + sort + bar chart
- **Description:** Search by name, sort by amount/date, bar chart comparing totals.
- **Acceptance criteria:**
  - [ ] Search input filters by counterpart_name
  - [ ] Sort toggle on columns
  - [ ] Bar chart using recharts (dihutang vs hutang)
- **Files:** `components/dashboard/debt-filters.tsx`, `components/dashboard/debt-chart.tsx`
- **Scope:** Medium

#### Task 19: Cleanup — remove boilerplate, old deps
- **Description:** Remove better-auth, Drizzle, mock components, old dashboard code. Clean up unused files.
- **Acceptance criteria:**
  - [ ] `better-auth`, `drizzle-orm`, `drizzle-kit`, `pg` removed from deps
  - [ ] `db/` folder removed
  - [ ] Mock dashboard components removed
  - [ ] `proxy.ts` removed
  - [ ] Build succeeds with no unused imports
- **Files:** Multiple files, `package.json`
- **Scope:** Medium

#### Task 20: README + .env.example
- **Description:** Write README per task spec: setup instructions, demo link, approach, trade-offs, time spent.
- **Acceptance criteria:**
  - [ ] Setup section (env vars, migration, local dev)
  - [ ] Demo link placeholder (Vercel)
  - [ ] Approach paragraph
  - [ ] Trade-off section
  - [ ] Time spent
  - [ ] Justification for date-fns in README
- **Files:** `README.md`, `.env.example`
- **Scope:** Small

### Checkpoint: Ship-Ready
- [ ] All acceptance criteria met
- [ ] `pnpm build` clean
- [ ] `pnpm typecheck` clean (no `any`)
- [ ] RLS tested
- [ ] Deploy to Vercel works
- [ ] 5+ meaningful commits

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| RLS misconfigured → auto-reject | High | Test with 2 users via curl against Supabase REST API directly |
| Rupiah format wrong → auto-reject | High | Use `Intl.NumberFormat('id-ID')` + test cases |
| "Tandai lunas" client-only → auto-reject | High | PATCH API sets `settled_at` server-side, verify with refresh |
| Next.js 16 compatibility issues | Medium | Check docs for any breaking changes |
| Supabase SSR cookie handling in Next.js 16 | Medium | Use latest `@supabase/ssr`, test middleware |

## Current Status

**Phases 1-4 (Tasks 1-15): COMPLETE** — All core features implemented.

**Known TypeScript errors to fix:**
1. `lib/supabase/middleware.ts` — `updateSession` not exported from `@supabase/ssr` (API changed, needs rewrite)
2. `app/(protected)/page.tsx` — `Debt` type import should come from `use-debts.ts` not `debt-form-modal.tsx`
3. `app/api/debts/route.ts` line 92 — type mismatch on insert

**Remaining (Phase 5):**
- Fix TypeScript errors → `pnpm typecheck` clean
- Mobile responsive polish
- Cleanup boilerplate (remove better-auth, Drizzle, mock components, `db/`, `proxy.ts`)
- README
- Deploy to Vercel
- Test RLS
- 5+ meaningful commits
