"use client";

import { useState } from "react";
import type { Debt } from "@/hooks/use-debts";
import type { DebtGroup as DebtGroupData } from "@/lib/group-debts";
import { Card } from "@/components/ui/card";
import { formatRupiah } from "@/lib/format";
import { ChevronDown } from "lucide-react";
import { DebtItem } from "@/components/dashboard/debt-item";

interface DebtGroupProps {
  group: DebtGroupData;
  onEdit: (debt: Debt) => void;
  onToggleSettle: (id: string, currentSettled: boolean) => Promise<void>;
}

/**
 * Grup utang berdasarkan nama lawan utang. Header menampilkan nama, total
 * amount, jumlah entry, dan jumlah belum lunas. Body berisi daftar DebtItem
 * yang bisa di-collapse/expand per grup secara independen.
 *
 * State collapse disimpan lokal (useState), bukan di URL — supaya URL tetap
 * bersih dan behavior-nya sesuai spec: "state collapse tidak perlu di-share".
 */
export function DebtGroup({ group, onEdit, onToggleSettle }: DebtGroupProps) {
  const [open, setOpen] = useState(true);

  const unsettledLabel =
    group.unsettledCount > 0
      ? `${group.unsettledCount} belum lunas`
      : "Semua lunas";

  return (
    <Card className="overflow-hidden">
      {/* Header — klik untuk toggle collapse */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 p-4 text-left hover:bg-muted/80 bg-muted/30 transition-colors"
        aria-expanded={open}
        aria-label={`${open ? "Sembunyikan" : "Tampilkan"} detail utang ${group.displayName}`}
      >
        {/* Avatar — inisial nama */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
          {group.displayName.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex flex-1 items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium truncate">{group.displayName}</p>
            <p className="text-xs text-muted-foreground">
              {group.totalCount} catatan • {unsettledLabel}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-semibold">{formatRupiah(group.totalAmount)}</p>
          </div>
        </div>

        {/* Chevron — rotates saat collapse */}
        <ChevronDown
          className={`size-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
            open ? "" : "-rotate-90"
          }`}
        />
      </button>

      {/* Body — daftar DebtItem */}
      {open && (
        <div className="divide-y border-t bg-muted/10">
          {group.debts.map((debt) => (
            <DebtItem
              key={debt.id}
              debt={debt}
              isGroupedItem={true}
              onEdit={onEdit}
              onToggleSettle={onToggleSettle}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
