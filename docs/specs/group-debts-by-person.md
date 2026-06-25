# Spec: Group Multiple Debts by Person

## Status
**Phase:** Implement (plan approved, building incrementally)

## Objective

User sering punya beberapa catatan utang dengan orang yang sama (mis. "Budi" muncul 3x dengan jumlah berbeda). Saat ini `DebtList` menampilkan setiap entry sebagai card terpisah, sehingga sulit melihat total exposure ke satu orang. Fitur ini mengelompokkan utang berdasarkan `counterpart_name` sehingga user bisa melihat ringkasan per orang, lengkap dengan total amount dan kemampuan collapse/expand.

**User:** User terautentikasi yang sudah mencatat beberapa utang dengan orang yang sama.
**Success:** User bisa toggle antara flat list (default) dan grouped view; di grouped view, utang dari nama yang sama (case-insensitive) tergabung dalam satu grup dengan header menampilkan nama + total amount; grup bisa di-collapse; aksi per item (edit/hapus/tandai lunas) tetap berfungsi.

## Commands

```bash
Build:    pnpm build
Dev:      pnpm dev
Lint:     pnpm lint
Format:   pnpm format
Typecheck: pnpm typecheck
```

> Catatan: tidak ada test runner (jest/vitest) yang ter-setup di proyek. Verifikasi dilakukan via typecheck + lint + build + manual check di browser.

## Project Structure

```
app/
  api/debts/route.ts          # GET list (tidak diubah — grouping di client)
components/
  dashboard/
    debt-list.tsx              # Konsumer utama — render flat atau grouped
    debt-filters.tsx           # Tambah toggle "Kelompokkan" di sini
    debt-group.tsx             # BARU — komponen grup (collapsible header + items)
lib/
  group-debts.ts               # BARU — pure function grouping logic
  group-debts.test.ts          # BARU — unit test (manual run, lihat catatan test)
  search-params.ts             # Tambah parser `group` baru
hooks/
  use-debts.ts                 # Tidak diubah
```

## Design Decisions

### 1. Grouping di client-side, bukan backend
Data `debts` sudah di-fetch semua oleh `useDebts`. Grouping adalah transformasi presentasi, bukan query baru. Membuat endpoint baru atau mengubah query hanya menambah kompleksitas tanpa nilai. Logic grouping di-isolasi di `lib/group-debts.ts` (pure function) agar testable.

### 2. Case-insensitive matching
"budi" dan "Budi" dianggap orang yang sama. Key grouping = `counterpart_name.toLowerCase()`. Nama yang ditampilkan di header = nama asli dari entry pertama yang ditemukan (preserve case asli).

### 3. Default flat, toggle ke grouped
Mengikuti prinsip "least surprise" — user yang sudah terbiasa dengan flat list tidak terkejut. Toggle disimpan di URL param (`?group=true`) via nuqs supaya bisa di-share/bookmark dan survive refresh.

### 4. Header grup: nama + total amount
Total = sum dari semua amount dalam grup (termasuk yang sudah lunas), sesuai klarifikasi user. Tidak ada aksi batch — setiap item tetap punya tombol edit/hapus/tandai lunas sendiri.

### 5. Collapse state di client state (bukan URL)
Collapsible groups menggunakan state lokal (Set<string> di komponen). Tidak perlu disimpan di URL karena ini transient view state, bukan filter yang ingin di-share. Default: semua expanded.

### 6. Urutan grup & item dalam grup
- Grup diurutkan by total amount descending (terbesar dulu) — konsisten dengan default sort "amount-desc"
- Item dalam grup tetap mengikuti sort yang dipilih user (date-desc, amount-desc, dll)

## Data Model & Types

```typescript
// lib/group-debts.ts
import type { Debt } from "@/hooks/use-debts";

export type DebtGroup = {
  key: string;            // lowercase counterpart_name
  displayName: string;    // original case dari entry pertama
  totalCount: number;     // jumlah entry dalam grup
  totalAmount: number;    // sum semua amount (termasuk lunas)
  debts: Debt[];          // urutan sesuai sort yang dipilih
};

export function groupDebtsByPerson(debts: Debt[]): DebtGroup[];
```

## UI / UX

### Toggle di DebtFilters
Tambah button/toggle "Kelompokkan" di baris filter, sebelum button "+ Catat baru". Saat aktif, beri visual indicator (variant default; saat inactive variant outline/ghost).

### Grouped View (DebtGroup component)
```
┌─────────────────────────────────────────────┐
│ ▼ Budi                          Rp 1.500.000│
│   3 entry · 2 belum lunas                   │
├─────────────────────────────────────────────┤
│   ┌─ card item 1 (sama seperti flat) ─────┐ │
│   ┌─ card item 2 ─────────────────────────┐ │
│   ┌─ card item 3 ─────────────────────────┐ │
└─────────────────────────────────────────────┘
```

- Header clickable → toggle collapse (chevron rotate)
- Header menampilkan: nama, total amount (formatRupiah), jumlah entry, jumlah belum lunas
- Saat collapsed: sembunyikan item, hanya tampilkan header
- Aksesibilitas: `aria-expanded`, `aria-controls`, keyboard accessible (button element)

### Empty state pada grouped view
Jika tidak ada debts → tetap pakai EmptyState yang sama dengan flat view (tidak perlu special case).

## Acceptance Criteria

1. Toggle "Kelompokkan" muncul di DebtFilters; default off
2. Saat toggle on, URL update ke `?group=true`; refresh preserve state
3. Debts dengan `counterpart_name` yang sama (case-insensitive) tergabung dalam satu grup
4. Header grup menampilkan: nama, total amount (sum semua), jumlah entry, jumlah belum lunas
5. Klik header → collapse/expand item; chevron berputar; default expanded
6. Aksi per item (edit, hapus, tandai lunas) tetap berfungsi di grouped view
7. Urutan grup: total amount descending
8. Urutan item dalam grup: sesuai sort yang dipilih user
9. Search/filter/sort tetap berfungsi bersamaan dengan grouping
10. Tidak ada regression di flat list view (toggle off = behavior lama)
11. Typecheck pass, lint pass, build pass

## Boundaries

**Always:**
- Pure function untuk grouping logic (testable terpisah dari UI)
- Preserve behavior flat list (toggle off = exactly same as before)
- Gunakan komponen shadcn/ui yang sudah ada (Card, Button, Collapsible jika ada)
- Copy Bahasa Indonesia casual (konsisten dengan existing)

**Ask First:**
- Jika butuh dependency baru
- Jika perlu mengubah schema DB
- Jika perlu mengubah API endpoint

**Never:**
- Mengubah behavior API `/api/debts` (grouping murni client-side)
- Menambah kolom DB atau migration
- Menghapus atau mengubah signature `useDebts`
- Hardcode data

## Success Criteria (Testable)

- [ ] `groupDebtsByPerson([])` returns `[]`
- [ ] `groupDebtsByPerson` menggabungkan "Budi" dan "budi" ke satu grup
- [ ] `groupDebtsByPerson` menghitung totalAmount dengan benar (sum semua amount)
- [ ] `groupDebtsByPerson` menghitung totalCount dan jumlah belum lunas dengan benar
- [ ] Grup diurutkan by totalAmount descending
- [ ] Toggle "Kelompokkan" mengubah view tanpa fetch ulang
- [ ] Collapse/expand bekerja per grup secara independen
- [ ] `pnpm typecheck` && `pnpm lint` && `pnpm build` semua pass
