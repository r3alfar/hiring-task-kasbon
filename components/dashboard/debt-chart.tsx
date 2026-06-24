"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebts } from "@/hooks/use-debts";
import { formatRupiah } from "@/lib/format";

const chartConfig = {
  owed_to_me: {
    label: "Dihutang ke saya",
    color: "var(--chart-1)",
  },
  i_owe: {
    label: "Saya hutang",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

/**
 * Bar chart membandingkan total yang belum lunas: dihutang ke saya vs
 * saya hutang. Hanya hitung yang belum lunas (settled_at null) supaya
 * fokus ke posisi utang aktif.
 *
 * Catatan: ambil data sendiri (status="all", type="all") agar chart tetap
 * utuh meski user sedang memfilter list di bawah.
 */
export function DebtChart() {
  const { debts, loading, error } = useDebts({ status: "all", type: "all" });

  // Hitung total per tipe (hanya yang belum lunas).
  const totalOwedToMe = debts
    .filter((d) => d.type === "owed_to_me" && !d.settled_at)
    .reduce((sum, d) => sum + d.amount, 0);
  const totalIOwe = debts
    .filter((d) => d.type === "i_owe" && !d.settled_at)
    .reduce((sum, d) => sum + d.amount, 0);

  const data = [
    { type: "owed_to_me", value: totalOwedToMe, label: "Dihutang" },
    { type: "i_owe", value: totalIOwe, label: "Hutang" },
  ];

  const isEmpty = !loading && !error && totalOwedToMe === 0 && totalIOwe === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perbandingan Utang</CardTitle>
        <CardDescription>Total belum lunas per tipe</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-[200px] items-end justify-center gap-8">
            <Skeleton className="h-32 w-20" />
            <Skeleton className="h-24 w-20" />
          </div>
        ) : error ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            Gagal memuat chart
          </div>
        ) : isEmpty ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            Belum ada data utang aktif
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={70}
                tickFormatter={(value: number) =>
                  new Intl.NumberFormat("id-ID", {
                    notation: "compact",
                    maximumFractionDigits: 1,
                  }).format(value)
                }
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent formatter={(value) => formatRupiah(Number(value))} />}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {/* Isi warna bar per-tipe via cell-like mapping: recharts
                    otomatis pakai config key yang cocok dengan dataKey "type". */}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
