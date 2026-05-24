"use client"

import { useRouter } from "next/navigation"
import { Bell, CheckCheck, LogOut, Settings, User } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSession, signOut } from "@/lib/auth-client"

const notifications = [
  {
    id: 1,
    title: "New enterprise signup",
    desc: "Marcus Webb joined on the Enterprise plan.",
    time: "2m ago",
    unread: true,
  },
  {
    id: 2,
    title: "Payment failed",
    desc: "TXN-8817 could not be processed.",
    time: "18m ago",
    unread: true,
  },
  {
    id: 3,
    title: "Monthly report ready",
    desc: "Your April 2026 report is available.",
    time: "1h ago",
    unread: true,
  },
  {
    id: 4,
    title: "System update complete",
    desc: "All services are running normally.",
    time: "3h ago",
    unread: false,
  },
]

const unreadCount = notifications.filter((n) => n.unread).length

function getInitials(name?: string | null): string {
  if (!name) return "??"
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
}

export function DashboardHeader() {
  const router = useRouter()
  const { data: session } = useSession()

  const user = session?.user
  const displayName = user?.name ?? user?.email ?? "Unknown"
  const initials = getInitials(user?.name)

  async function handleSignOut() {
    await signOut()
    router.push("/sign-in")
  }

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border/50 bg-background/80 backdrop-blur-md px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-4" />

      {/* Title */}
      <h1 className="text-sm font-semibold tracking-tight">Overview</h1>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        <Badge variant="secondary" className="font-mono text-xs hidden sm:flex">
          Live
          <span className="ml-1.5 inline-block size-1.5 rounded-full bg-primary animate-pulse" />
        </Badge>
        <span className="text-xs text-muted-foreground font-mono hidden md:block">
          May 2026
        </span>

        <Separator orientation="vertical" className="h-4 hidden sm:block" />

        {/* Notification Bell */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="relative flex size-8 items-center justify-center rounded-sm text-muted-foreground ring-offset-background transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Notifications"
            >
              <Bell className="size-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex size-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground leading-none">
                  {unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
              <DropdownMenuLabel className="p-0 text-sm font-semibold">
                Notifications
              </DropdownMenuLabel>
              <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono">
                <CheckCheck className="size-3" />
                Mark all read
              </button>
            </div>

            {/* Notification list */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((n, i) => (
                <div key={n.id}>
                  <DropdownMenuItem className="flex items-start gap-3 px-4 py-3 cursor-pointer rounded-none focus:rounded-none">
                    {/* Unread dot */}
                    <span
                      className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
                        n.unread ? "bg-primary" : "bg-transparent"
                      }`}
                    />
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-xs font-semibold leading-snug">{n.title}</span>
                      <span className="text-xs text-muted-foreground leading-snug truncate">
                        {n.desc}
                      </span>
                      <span className="text-[11px] text-muted-foreground/70 font-mono mt-0.5">
                        {n.time}
                      </span>
                    </div>
                  </DropdownMenuItem>
                  {i < notifications.length - 1 && (
                    <div className="h-px bg-border/40 mx-4" />
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-border/50 px-4 py-2.5">
              <button className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors font-mono">
                View all notifications
              </button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Avatar / Profile button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="rounded-sm ring-offset-background transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Open profile menu"
            >
              <Avatar className="size-8 rounded-sm">
                <AvatarImage src={user?.image ?? ""} alt={displayName} />
                <AvatarFallback className="rounded-sm bg-primary/15 text-primary text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold">{displayName}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {user?.email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={handleSignOut}
            >
              <LogOut />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
