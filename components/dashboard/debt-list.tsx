"use client";

import { useDebts, type Debt, type SortOption } from "@/hooks/use-debts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatRupiah, formatRelativeDate } from "@/lib/format";
import { getTypeLabel, isSettled } from "@/hooks/use-debts";
import { Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { DebtListSkeleton, EmptyState, ErrorState } from "@/components/dashboard/states";

interface DebtListProps {
  statusFilter?: "all" | "settled" | "unsettled";
  typeFilter?: "all" | "owed_to_me" | "i_owe";
  searchQuery?: string;
  sort?: SortOption;
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

  return (
    <div className="space-y-3">
      {debts.map((debt) => (
        <Card key={debt.id} className={`transition-all ${isSettled(debt.settled_at) ? "opacity-60" : ""}`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                {debt.counterpart_name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{debt.counterpart_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {getTypeLabel(debt.type)} • {formatRelativeDate(debt.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatRupiah(debt.amount)}</p>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        debt.settled_at
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}
                    >
                      {debt.settled_at ? (
                        <>
                          <CheckCircle2 className="mr-1 size-3" />
                          Lunas
                        </>
                      ) : (
                        <>
                          <XCircle className="mr-1 size-3" />
                          Belum lunas
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Note */}
                {debt.note && (
                  <p className="text-xs text-muted-foreground line-clamp-1">{debt.note}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {!debt.settled_at && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleSettle(debt.id, false)}
                    title="Tandai lunas"
                  >
                    <CheckCircle2 className="size-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(debt)}
                  title="Edit"
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    if (confirm("Hapus catatan ini?")) {
                      await fetch(`/api/debts/${debt.id}`, { method: "DELETE" });
                      refetch();
                    }
                  }}
                  title="Hapus"
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
