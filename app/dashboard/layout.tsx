import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export const metadata = {
  title: "Dashboard — Nexus",
  description: "Modern analytics dashboard for Nexus platform",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-svh w-full bg-background">
          <DashboardSidebar />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}
