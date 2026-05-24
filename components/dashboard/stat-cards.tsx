"use client"

import { ArrowDownRight, ArrowUpRight, DollarSign, Package, ShoppingCart, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const stats = [
  {
    title: "Total Revenue",
    value: "$84,250",
    change: "+12.5%",
    trend: "up" as const,
    icon: DollarSign,
    sub: "vs last month",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Active Users",
    value: "24,891",
    change: "+8.2%",
    trend: "up" as const,
    icon: Users,
    sub: "vs last month",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "New Orders",
    value: "1,482",
    change: "-3.1%",
    trend: "down" as const,
    icon: ShoppingCart,
    sub: "vs last month",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    title: "Products",
    value: "342",
    change: "+2.4%",
    trend: "up" as const,
    icon: Package,
    sub: "active listings",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
]

export function StatCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Card
          key={stat.title}
          className="relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 border-border/60"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          {/* Subtle top accent line */}
          <div className={cn("absolute inset-x-0 top-0 h-px", stat.color.replace("text-", "bg-"))} />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              {stat.title}
            </CardTitle>
            <div className={cn("flex size-8 items-center justify-center rounded-sm", stat.bgColor)}>
              <stat.icon className={cn("size-4", stat.color)} />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <span className="text-2xl font-bold tracking-tight font-mono">{stat.value}</span>
            <div className="flex items-center gap-1.5">
              <Badge
                variant={stat.trend === "up" ? "default" : "destructive"}
                className="gap-0.5 text-xs px-1.5 py-0.5 font-mono"
              >
                {stat.trend === "up" ? (
                  <ArrowUpRight className="size-3" />
                ) : (
                  <ArrowDownRight className="size-3" />
                )}
                {stat.change}
              </Badge>
              <span className="text-xs text-muted-foreground">{stat.sub}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
