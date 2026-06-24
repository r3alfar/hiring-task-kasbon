import { parseAsString, parseAsStringLiteral, debounce } from "nuqs";

/**
 * Parsers untuk query params dashboard. Dipakai bersama oleh
 * `DebtFilters` (nulis) dan `DashboardPage` (baca) lewat `useQueryStates`,
 * sehingga kedua komponen selalu sinkron & type-safe.
 *
 * `clearOnDefault` (default true di nuqs) otomatis menghapus param dari URL
 * saat nilainya sama dengan default, jadi URL tetap bersih.
 */

// `as const` untuk type inference yang sempurna (union literal), lalu kita
// berikan array mutable ke parser nuqs dengan spread (lihat dashboardParsers).
export const STATUS_OPTIONS = ["all", "settled", "unsettled"] as const;
export const TYPE_OPTIONS = ["all", "owed_to_me", "i_owe"] as const;
export const SORT_OPTIONS = [
  "date-desc",
  "date-asc",
  "amount-desc",
  "amount-asc",
] as const;

export type StatusFilter = (typeof STATUS_OPTIONS)[number];
export type TypeFilter = (typeof TYPE_OPTIONS)[number];
export type SortOption = (typeof SORT_OPTIONS)[number];

/** Label Indonesia untuk opsi sort. */
export const SORT_LABELS: Record<SortOption, string> = {
  "date-desc": "Terbaru",
  "date-asc": "Terlama",
  "amount-desc": "Jumlah tertinggi",
  "amount-asc": "Jumlah terendah",
};

/**
 * Definisi semua query param dashboard. Konstan (bukan hook) sehingga aman
 * dipakai bersama di banyak komponen tanpa bikin closure baru.
 */
export const dashboardParsers = {
  status: parseAsStringLiteral<StatusFilter>(STATUS_OPTIONS).withDefault("all"),
  type: parseAsStringLiteral<TypeFilter>(TYPE_OPTIONS).withDefault("all"),
  q: parseAsString.withDefault(""),
  sort: parseAsStringLiteral<SortOption>(SORT_OPTIONS).withDefault("date-desc"),
};

/**
 * Opsi URL update per-param:
 *  - search: debounce 300ms + replace history (biar gak numpuk di back button)
 *  - filter/sort: push history (bisa di-back)
 */
export const SEARCH_UPDATE_OPTIONS = {
  history: "replace" as const,
  limitUrlUpdates: debounce(300),
};

export const FILTER_UPDATE_OPTIONS = {
  history: "push" as const,
};
