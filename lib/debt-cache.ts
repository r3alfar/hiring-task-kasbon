"use client";

/**
 * Cache invalidation sederhana berbasis CustomEvent.
 *
 * Masalah: ada beberapa komponen (SummaryCards, DebtChart, DebtList) yang
 * masing-masing memanggil `useDebts()` sendiri sehingga state-nya terpisah.
 * Saat user bikin/edit/hapus catatan lewat modal, data baru tidak muncul
 * tanpa refresh karena tiap instance `useDebts` punya state sendiri.
 *
 * Solusi: broadcast event "kasbon:debts:invalidate" lewat window. Semua
 * instance `useDebts` yang sedang mounted akan dengar event ini dan refetch
 * data-nya masing-masing. Dengan begitu seluruh dashboard (cards, chart,
 * list) ikut update tanpa perlu refresh halaman.
 */

const INVALIDATE_EVENT = "kasbon:debts:invalidate";

/**
 * Broadcast bahwa data utang berubah (create/update/delete). Semua instance
 * `useDebts` yang sedang mounted akan refetch. Panggil setelah mutasi API
 * berhasil (POST/PATCH/DELETE).
 */
export function notifyDebtChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(INVALIDATE_EVENT));
  }
}

/** Alias lama, dipakai di beberapa tempat. */
export const invalidateDebts = notifyDebtChanged;

/**
 * Subscribe ke event invalidation. Kembalikan fungsi unsubscribe untuk
 * dibersihkan di `useEffect`.
 */
export function subscribeToDebtChanges(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  window.addEventListener(INVALIDATE_EVENT, callback);
  return () => {
    window.removeEventListener(INVALIDATE_EVENT, callback);
  };
}
