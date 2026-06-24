"use client";

import { useDebts } from "@/hooks/use-debts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah } from "@/lib/format";
import { ErrorState, SummaryCardsSkeleton } from "@/components/dashboard/states";

export function SummaryCards() {
  const { debts, loading, error, refetch } = useDebts({ status: "all", type: "all" });

  const totalOwedToMe = debts
    .filter((d) => d.type === "owed_to_me")
    .reduce((sum, d) => sum + (d.settled_at ? 0 : d.amount), 0);

  const totalIOwe = debts
    .filter((d) => d.type === "i_owe")
    .reduce((sum, d) => sum + (d.settled_at ? 0 : d.amount), 0);

  const net = totalOwedToMe - totalIOwe;

  if (loading) {
    return <SummaryCardsSkeleton />;
  }

  if (error) {
    return (
      <ErrorState
        title="Gagal memuat ringkasan"
        description={error}
        onRetry={() => void refetch()}
        compact
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total dihutang ke saya
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatRupiah(totalOwedToMe)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total saya hutang
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatRupiah(totalIOwe)}</div>
        </CardContent>
      </Card>

      <Card className={net >= 0 ? "border-emerald-500/50" : "border-red-500/50"}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Net
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
            {formatRupiah(net)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
