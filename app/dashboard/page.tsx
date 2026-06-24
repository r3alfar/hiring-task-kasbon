"use client";

import { Suspense, useState } from "react";
import { useQueryStates } from "nuqs";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { DebtFilters } from "@/components/dashboard/debt-filters";
import { DebtList } from "@/components/dashboard/debt-list";
import { DebtChart } from "@/components/dashboard/debt-chart";
import { type Debt } from "@/hooks/use-debts";
import { DebtFormModal } from "@/components/dashboard/debt-form-modal";
import { DashboardFallbackSkeleton } from "@/components/dashboard/states";
import { dashboardParsers } from "@/lib/search-params";

function DashboardContent() {
  const [filters] = useQueryStates(dashboardParsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

  const { status: statusFilter, type: typeFilter, q: searchQuery, sort } = filters;

  const handleToggleSettle = async (id: string, currentSettled: boolean) => {
    await fetch(`/api/debts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        settled_at: currentSettled ? null : new Date().toISOString(),
      }),
    });
  };

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDebt(null);
  };

  return (
    <>
      <div className="space-y-6 p-4 md:p-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Track dan kelola utang piutangmu</p>
        </div>

        <SummaryCards />
        <DebtChart />

        <DebtFilters onNew={() => setIsModalOpen(true)} />

        <div className="mt-6">
          <h2 className="mb-4 text-lg font-semibold">Daftar Catatan</h2>
          <DebtList
            statusFilter={statusFilter}
            typeFilter={typeFilter}
            searchQuery={searchQuery}
            sort={sort}
            onEdit={handleEdit}
            onToggleSettle={handleToggleSettle}
          />
        </div>
      </div>

      <DebtFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editDebt={editingDebt}
      />
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardFallbackSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
