"use client";

import { useEffect, useState, useCallback } from "react";
import type { CreateDebtInput as CreateDebtInputOrig, UpdateDebtInput as UpdateDebtInputOrig } from "@/lib/validators";
import type { SortOption } from "@/lib/search-params";
import { subscribeToDebtChanges } from "@/lib/debt-cache";

export type { SortOption };

export type Debt = {
  id: string;
  user_id: string;
  type: "owed_to_me" | "i_owe";
  counterpart_name: string;
  amount: number;
  note: string | null;
  due_date: string | null;
  settled_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateDebtInput = CreateDebtInputOrig;
export type UpdateDebtInput = UpdateDebtInputOrig;

type UseDebtsOptions = {
  status?: "all" | "settled" | "unsettled";
  type?: "all" | "owed_to_me" | "i_owe";
  q?: string;
  sort?: SortOption;
};

export function useDebts(options?: UseDebtsOptions) {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Destructure into stable primitives so the callback only re-creates
  // when the actual filter values change (not the parent's object identity).
  const status = options?.status;
  const type = options?.type;
  const q = options?.q;
  const sort = options?.sort;

  const fetchDebts = useCallback(async () => {
    const params = new URLSearchParams();
    if (status && status !== "all") {
      params.append("status", status);
    }
    if (type && type !== "all") {
      params.append("type", type);
    }
    if (q && q.trim()) {
      params.append("q", q.trim());
    }
    if (sort) {
      params.append("sort", sort);
    }

    try {
      const res = await fetch(`/api/debts?${params.toString()}`);

      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/sign-in";
          return;
        }
        throw new Error("Gagal memuat data utang");
      }

      const data = await res.json();
      setDebts(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, [status, type, q, sort]);

  useEffect(() => {
    // Fetch on mount and when filters change. All setState calls inside
    // `fetchDebts` happen after the first `await`, so there are no
    // cascading synchronous renders. This is a legitimate data-fetching
    // effect (see https://react.dev/learn/you-might-not-need-an-effect#fetching-data).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchDebts();
  }, [fetchDebts]);

  // Re-fetch ketika ada perubahan data (create/update/delete) dari komponen
  // lain di dashboard. Karena SummaryCards, DebtChart, dan DebtList masing-
  // masing punya instance useDebts sendiri, kita pakai event-based cache
  // invalidation supaya semua instance ikut refresh tanpa reload halaman.
  useEffect(() => {
    return subscribeToDebtChanges(() => {
      void fetchDebts();
    });
  }, [fetchDebts]);

  const addDebt = useCallback((newDebt: Debt) => {
    setDebts((prev) => [newDebt, ...prev]);
  }, []);

  const updateDebt = useCallback((updatedDebt: Debt) => {
    setDebts((prev) => prev.map((d) => (d.id === updatedDebt.id ? updatedDebt : d)));
  }, []);

  const removeDebt = useCallback((id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  }, []);

  return { debts, loading, error, refetch: fetchDebts, addDebt, updateDebt, removeDebt };
}

// Format helpers for UI usage
export function getTypeLabel(type: Debt["type"]): string {
  return type === "owed_to_me" ? "Dihutang ke saya" : "Saya hutang";
}

export function getStatusLabel(settled_at: Debt["settled_at"] | null): string {
  return settled_at ? "Lunas" : "Belum lunas";
}

export function isSettled(settled_at: Debt["settled_at"] | null): boolean {
  return settled_at !== null;
}
