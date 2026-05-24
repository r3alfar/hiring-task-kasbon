"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const transactions = [
  {
    id: "TXN-8821",
    user: "Marcus Webb",
    initials: "MW",
    email: "m.webb@acme.io",
    plan: "Enterprise",
    amount: "$2,400.00",
    status: "completed" as const,
    date: "May 24, 2026",
  },
  {
    id: "TXN-8820",
    user: "Priya Sharma",
    initials: "PS",
    email: "priya@techflow.com",
    plan: "Pro",
    amount: "$299.00",
    status: "completed" as const,
    date: "May 24, 2026",
  },
  {
    id: "TXN-8819",
    user: "Jordan Lee",
    initials: "JL",
    email: "j.lee@orbit.io",
    plan: "Starter",
    amount: "$49.00",
    status: "pending" as const,
    date: "May 23, 2026",
  },
  {
    id: "TXN-8818",
    user: "Aiko Tanaka",
    initials: "AT",
    email: "aiko@pixelcraft.jp",
    plan: "Pro",
    amount: "$299.00",
    status: "completed" as const,
    date: "May 23, 2026",
  },
  {
    id: "TXN-8817",
    user: "Carlos Mendez",
    initials: "CM",
    email: "carlos@launchpad.mx",
    plan: "Enterprise",
    amount: "$2,400.00",
    status: "failed" as const,
    date: "May 22, 2026",
  },
  {
    id: "TXN-8816",
    user: "Elena Volkov",
    initials: "EV",
    email: "e.volkov@datastack.eu",
    plan: "Pro",
    amount: "$299.00",
    status: "completed" as const,
    date: "May 22, 2026",
  },
]

const statusConfig = {
  completed: { label: "Completed", variant: "default" as const },
  pending: { label: "Pending", variant: "secondary" as const },
  failed: { label: "Failed", variant: "destructive" as const },
}

export function ActivityTable() {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base font-semibold tracking-tight">Recent Transactions</CardTitle>
            <CardDescription className="text-xs">Last 6 transactions across all plans</CardDescription>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {transactions.length} entries
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-widest pl-6">
                Transaction
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-widest hidden sm:table-cell">
                Customer
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-widest hidden md:table-cell">
                Plan
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-widest text-right">
                Amount
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                Status
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-widest hidden lg:table-cell pr-6">
                Date
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((txn) => (
              <TableRow
                key={txn.id}
                className="border-border/30 hover:bg-muted/30 transition-colors cursor-pointer group"
              >
                <TableCell className="pl-6">
                  <span className="font-mono text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    {txn.id}
                  </span>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-7 rounded-sm shrink-0">
                      <AvatarFallback className="rounded-sm text-xs font-bold bg-primary/10 text-primary">
                        {txn.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{txn.user}</span>
                      <span className="text-xs text-muted-foreground hidden md:block">{txn.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="text-xs text-muted-foreground font-mono">{txn.plan}</span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-mono text-sm font-semibold">{txn.amount}</span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={statusConfig[txn.status].variant}
                    className="text-xs font-mono"
                  >
                    {statusConfig[txn.status].label}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground font-mono hidden lg:table-cell pr-6">
                  {txn.date}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
