"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"

const data = [
  { month: "Jan", revenue: 42000, expenses: 28000 },
  { month: "Feb", revenue: 51000, expenses: 31000 },
  { month: "Mar", revenue: 47000, expenses: 29000 },
  { month: "Apr", revenue: 63000, expenses: 34000 },
  { month: "May", revenue: 58000, expenses: 32000 },
  { month: "Jun", revenue: 72000, expenses: 38000 },
  { month: "Jul", revenue: 68000, expenses: 36000 },
  { month: "Aug", revenue: 79000, expenses: 41000 },
  { month: "Sep", revenue: 84250, expenses: 43000 },
]

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--color-primary)",
  },
  expenses: {
    label: "Expenses",
    color: "var(--color-muted-foreground)",
  },
} satisfies ChartConfig

export function RevenueChart() {
  return (
    <Card className="border-border/60 h-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base font-semibold tracking-tight">Revenue vs Expenses</CardTitle>
            <CardDescription className="text-xs">January – September 2026</CardDescription>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
            <span className="flex items-center gap-1.5">
              <span className="inline-block size-2 rounded-full bg-primary" />
              Revenue
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block size-2 rounded-full bg-muted-foreground" />
              Expenses
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-muted-foreground)" stopOpacity={0.15} />
                <stop offset="100%" stopColor="var(--color-muted-foreground)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              strokeOpacity={0.5}
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "var(--color-muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "var(--color-muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              width={40}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="var(--color-muted-foreground)"
              strokeWidth={1.5}
              fill="url(#expensesGradient)"
              strokeDasharray="4 2"
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-primary)"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
