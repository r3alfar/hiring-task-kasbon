"use client";

import { useQueryStates } from "nuqs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import {
  dashboardParsers,
  SEARCH_UPDATE_OPTIONS,
  FILTER_UPDATE_OPTIONS,
  SORT_OPTIONS,
  SORT_LABELS,
} from "@/lib/search-params";

export function DebtFilters({ onNew }: { onNew: () => void }) {
  const [filters, setFilters] = useQueryStates(dashboardParsers);
  const { status, type, q, sort } = filters;

  // Search: tulis langsung ke URL state. nuqs men-debounce update URL-nya
  // (lihat SEARCH_UPDATE_OPTIONS), jadi gak ada fetch di setiap ketikan.
  // `history: replace` supaya gak numpuk entry di back button.
  const handleSearchChange = (value: string) => {
    setFilters({ q: value }, SEARCH_UPDATE_OPTIONS);
  };

  // Filter & sort: push history supaya bisa di-back. clearOnDefault (bawaan
  // nuqs) otomatis menghapus param saat nilainya sama dengan default ("all"),
  // jadi URL tetap bersih tanpa perlu set null manual.
  const handleStatusChange = (value: string) => {
    setFilters({ status: value as typeof status }, FILTER_UPDATE_OPTIONS);
  };

  const handleTypeChange = (value: string) => {
    setFilters({ type: value as typeof type }, FILTER_UPDATE_OPTIONS);
  };

  const handleSortChange = (value: string) => {
    setFilters({ sort: value as typeof sort }, FILTER_UPDATE_OPTIONS);
  };

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Cari nama…"
            className="w-[180px] pl-8"
            aria-label="Cari nama"
          />
          {q && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Hapus pencarian"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua status</SelectItem>
            <SelectItem value="unsettled">Belum lunas</SelectItem>
            <SelectItem value="settled">Lunas</SelectItem>
          </SelectContent>
        </Select>

        <Select value={type} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua tipe</SelectItem>
            <SelectItem value="owed_to_me">Dihutang</SelectItem>
            <SelectItem value="i_owe">Hutang</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Urutkan" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {SORT_LABELS[opt]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={onNew}>+ Catat baru</Button>
    </div>
  );
}
