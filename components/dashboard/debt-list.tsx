"use client";

import { useDebts, type Debt, type SortOption } from "@/hooks/use-debts";
import { DebtItem } from "@/components/dashboard/debt-item";
import { DebtGroup } from "@/components/dashboard/debt-group";
import { groupDebtsByPerson } from "@/lib/group-debts";
import { DebtListSkeleton, EmptyState, ErrorState } from "@/components/dashboard/states";

interface DebtListProps {
  statusFilter?: "all" | "settled" | "unsettled";
  typeFilter?: "all" | "owed_to_me" | "i_owe";
  searchQuery?: string;
  sort?: SortOption;
  group?: boolean;
  onEdit: (debt: Debt) => void;
  onToggleSettle: (id: string, currentSettled: boolean) => Promise<void>;
}

// True bila user sedang memfilter (status/tipe bukan "all" atau ada query
// pencarian). Kalau filter aktif tapi hasilnya kosong, pesannya "tidak ada
// yang cocok"; kalau tanpa filter dan kosong, pesannya "belum catat apa-apa".
function hasActiveFilter(
  status: "all" | "settled" | "unsettled" | undefined,
  type: "all" | "owed_to_me" | "i_owe" | undefined,
  searchQuery?: string,
): boolean {
  const hasStatus = status !== undefined && status !== "all";
  const hasType = type !== undefined && type !== "all";
  const hasSearch = searchQuery !== undefined && searchQuery.trim() !== "";
  return hasStatus || hasType || hasSearch;
}

export function DebtList({
  statusFilter,
  typeFilter,
  searchQuery,
  sort,
  group,
  onEdit,
  onToggleSettle,
}: DebtListProps) {
  const { debts, loading, error, refetch } = useDebts({
    status: statusFilter,
    type: typeFilter,
    q: searchQuery,
    sort,
  });

  if (loading) {
    return <DebtListSkeleton />;
  }

  if (error) {
    return (
      <ErrorState
        title="Gagal memuat daftar utang"
        description={error}
        onRetry={() => void refetch()}
      />
    );
  }

  if (debts.length === 0) {
    if (hasActiveFilter(statusFilter, typeFilter)) {
      return (
        <EmptyState
          icon="search"
          title="Tidak ada yang cocok"
          description="Coba ubah filter atau kata kunci pencarianmu."
        />
      );
    }
    return (
      <EmptyState
        icon="empty"
        title="Belum ada catatan utang"
        description="Catat siapa yang hutang ke kamu atau sebaliknya biar gak lupa."
      />
    );
  }

  // Mode grouped: kelompokkan by counterpart_name (case-insensitive), lalu
  // render satu DebtGroup per orang. Sorting group by totalAmount descending
  // sudah dihandle oleh groupDebtsByPerson.
  if (group) {
    const groups = groupDebtsByPerson(debts);
    return (
      <div className="space-y-3">
        {groups.map((g) => (
          <DebtGroup
            key={g.key}
            group={g}
            onEdit={onEdit}
            onToggleSettle={onToggleSettle}
          />
        ))}
      </div>
    );
  }

  // Mode flat (default): satu DebtItem per entry, urutan dari useDebts.
  return (
    <div className="space-y-3">
      {debts.map((debt) => (
        <DebtItem
          key={debt.id}
          debt={debt}
          onEdit={onEdit}
          onToggleSettle={onToggleSettle}
        />
      ))}
    </div>
  );
}
