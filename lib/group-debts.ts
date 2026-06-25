import type { Debt } from "@/hooks/use-debts";

/**
 * Grup utang berdasarkan `counterpart_name` (case-insensitive).
 *
 * "budi" dan "Budi" dianggap orang yang sama. Key grouping pakai
 * `toLowerCase()`, tapi nama yang ditampilkan di header ambil dari
 * `counterpart_name` asli entry pertama yang ditemukan (preserve case).
 *
 * Grup diurutkan by totalAmount descending supaya orang dengan exposure
 * terbesar tampil paling atas.
 */
export type DebtGroup = {
  /** Key grouping (lowercase). */
  key: string;
  /** Nama asli dari entry pertama (preserve case). */
  displayName: string;
  /** Semua utang dalam grup ini, urutan asli dari input. */
  debts: Debt[];
  /** Sum semua amount (termasuk yang sudah lunas). */
  totalAmount: number;
  /** Jumlah total entry dalam grup. */
  totalCount: number;
  /** Jumlah entry yang belum lunas (settled_at === null). */
  unsettledCount: number;
};

export function groupDebtsByPerson(debts: Debt[]): DebtGroup[] {
  const map = new Map<string, DebtGroup>();

  for (const debt of debts) {
    const key = debt.counterpart_name.toLowerCase();
    const existing = map.get(key);

    if (existing) {
      existing.debts.push(debt);
      existing.totalAmount += debt.amount;
      existing.totalCount += 1;
      if (debt.settled_at === null) {
        existing.unsettledCount += 1;
      }
    } else {
      map.set(key, {
        key,
        displayName: debt.counterpart_name,
        debts: [debt],
        totalAmount: debt.amount,
        totalCount: 1,
        unsettledCount: debt.settled_at === null ? 1 : 0,
      });
    }
  }

  // Urutkan by totalAmount descending. Sort di array baru supaya gak
  // mutasi Map insertion order (meskipun Map order gak dipakai setelah ini).
  return [...map.values()].sort((a, b) => b.totalAmount - a.totalAmount);
}
