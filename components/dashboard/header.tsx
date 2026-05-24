"use client"

import { LogOut, Settings, User } from "lucide-react"
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

export function DashboardHeader() {
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

        {/* Avatar / Profile button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="rounded-sm ring-offset-background transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Open profile menu"
            >
              <Avatar className="size-8 rounded-sm">
                <AvatarImage src="" alt="Realfar" />
                <AvatarFallback className="rounded-sm bg-primary/15 text-primary text-xs font-bold">
                  RF
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold">Realfar</span>
              <span className="text-xs font-normal text-muted-foreground">
                admin@nexus.dev
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
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <LogOut />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
