import { StatCards } from "@/components/dashboard/stat-cards"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { ActivityTable } from "@/components/dashboard/activity-table"
import { TopChannels } from "@/components/dashboard/top-channels"
import { DashboardHeader } from "@/components/dashboard/header"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-0 min-h-svh">
      <DashboardHeader />

      {/* Dashboard Content */}
      <div className="flex-1 p-6 flex flex-col gap-6">
        {/* Stat Cards */}
        <StatCards />

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <RevenueChart />
          </div>
          <div className="xl:col-span-1">
            <TopChannels />
          </div>
        </div>

        {/* Activity Table */}
        <ActivityTable />
      </div>
    </div>
  )
}
