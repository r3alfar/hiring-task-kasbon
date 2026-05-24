"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const channels = [
  { name: "Organic Search", value: 38420, pct: 46, color: "bg-primary" },
  { name: "Direct", value: 22150, pct: 27, color: "bg-blue-500" },
  { name: "Referral", value: 13890, pct: 17, color: "bg-amber-500" },
  { name: "Social Media", value: 8230, pct: 10, color: "bg-violet-500" },
]

export function TopChannels() {
  return (
    <Card className="border-border/60 h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold tracking-tight">Traffic Sources</CardTitle>
        <CardDescription className="text-xs">Revenue by acquisition channel</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between gap-5 pt-2">
        {/* Stacked bar */}
        <div className="flex h-2 w-full overflow-hidden rounded-none gap-px">
          {channels.map((c) => (
            <div
              key={c.name}
              className={cn("h-full transition-all duration-700", c.color)}
              style={{ width: `${c.pct}%` }}
            />
          ))}
        </div>

        {/* Channel rows */}
        <div className="flex flex-col gap-3">
          {channels.map((channel) => (
            <div key={channel.name} className="flex items-center gap-3">
              <div className={cn("size-2 shrink-0 rounded-full", channel.color)} />
              <div className="flex flex-1 items-center justify-between gap-2 min-w-0">
                <span className="text-sm text-muted-foreground truncate">{channel.name}</span>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-16 h-1 bg-muted rounded-none overflow-hidden">
                    <div
                      className={cn("h-full rounded-none transition-all duration-700", channel.color)}
                      style={{ width: `${channel.pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-medium text-foreground w-8 text-right">
                    {channel.pct}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t border-border/50 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Total sessions</span>
            <span className="text-sm font-mono font-semibold">
              {channels.reduce((a, c) => a + c.value, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
