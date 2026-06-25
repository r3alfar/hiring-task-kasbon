"use client";

import type { Debt } from "@/hooks/use-debts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatRupiah, formatRelativeDate } from "@/lib/format";
import { getTypeLabel, isSettled } from "@/hooks/use-debts";
import { Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { notifyDebtChanged } from "@/lib/debt-cache";

export interface DebtItemHandlers {
  onEdit: (debt: Debt) => void;
  onToggleSettle: (id: string, currentSettled: boolean) => Promise<void>;
}

interface DebtItemProps extends DebtItemHandlers {
  debt: Debt;
  /** True jika dirender di dalam grup (DebtGroup) untuk menghindari Card bersarang. */
  isGroupedItem?: boolean;
}

/**
 * Satu item utang. Dipakai baik di flat list (DebtList) maupun di dalam
 * grup (DebtGroup) supaya styling & behavior konsisten di kedua view.
 */
export function DebtItem({ debt, isGroupedItem, onEdit, onToggleSettle }: DebtItemProps) {
  const content = (
    <div className={`flex items-start gap-4 ${isGroupedItem ? "px-4 py-3" : "p-4"}`}>
      {/* Avatar (disembunyikan di dalam grup karena nama sudah ada di header) */}
      {!isGroupedItem && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
          {debt.counterpart_name.charAt(0).toUpperCase()}
        </div>
      )}

      {/* Info */}
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <div>
            {!isGroupedItem && <p className="font-medium">{debt.counterpart_name}</p>}
            <p className="text-xs text-muted-foreground">
              {getTypeLabel(debt.type)} •{" "}
              {formatRelativeDate(debt.due_date ?? debt.created_at)}
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
                {debt.settled_at && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Dilunasi {formatRelativeDate(debt.settled_at)}
                  </p>
                )}
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
                  // Beri tahu semua instance useDebts (list, summary, chart)
                  // untuk re-fetch supaya seluruh dashboard ikut update.
                  notifyDebtChanged();
                }
              }}
              title="Hapus"
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        </div>
    );

  if (isGroupedItem) {
    return <div className={`transition-all ${isSettled(debt.settled_at) ? "opacity-60" : ""}`}>{content}</div>;
  }

  return (
    <Card className={`transition-all ${isSettled(debt.settled_at) ? "opacity-60" : ""}`}>
      <CardContent className="p-0">
        {content}
      </CardContent>
    </Card>
  );
}
