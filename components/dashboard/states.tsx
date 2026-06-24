"use client";

import {
  Inbox,
  SearchX,
  AlertCircle,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

/* -------------------------------------------------------------------------- */
/*                                Empty State                                 */
/* -------------------------------------------------------------------------- */

type EmptyStateIcon = "empty" | "search";

const EMPTY_ICONS: Record<EmptyStateIcon, LucideIcon> = {
  empty: Inbox,
  search: SearchX,
};

interface EmptyStateProps {
  /** Jenis ilustrasi ikon yang ditampilkan. */
  icon?: EmptyStateIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Empty state dengan ikon, pesan Bahasa Indonesia, dan opsional action.
 * Dipakai saat belum ada debt sama sekali atau hasil filter kosong.
 */
export function EmptyState({
  icon = "empty",
  title,
  description,
  action,
}: EmptyStateProps) {
  const Icon = EMPTY_ICONS[icon];
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="size-6" aria-hidden />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">{title}</p>
          {description && (
            <p className="mx-auto text-xs text-muted-foreground max-w-xs">
              {description}
            </p>
          )}
        </div>
        {action && (
          <Button size="sm" onClick={action.onClick} className="mt-2">
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Error State                                 */
/* -------------------------------------------------------------------------- */

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  /** Variant ringkas: tanpa deskripsi tambahan, padding lebih kecil. */
  compact?: boolean;
}

/**
 * Error state dengan ikon, pesan Bahasa Indonesia, dan tombol coba lagi.
 */
export function ErrorState({
  title = "Gagal memuat data",
  description = "Coba beberapa saat lagi atau periksa koneksi kamu.",
  onRetry,
  compact = false,
}: ErrorStateProps) {
  return (
    <Card className="border-destructive/30">
      <CardContent
        className={`flex flex-col items-center justify-center gap-3 text-center ${
          compact ? "py-10" : "py-12"
        }`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="size-6" aria-hidden />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-destructive">{title}</p>
          {!compact && description && (
            <p className="mx-auto text-xs text-muted-foreground max-w-xs">
              {description}
            </p>
          )}
        </div>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
            <RefreshCw className="size-3.5" aria-hidden />
            Coba lagi
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*                             Loading Skeletons                              */
/* -------------------------------------------------------------------------- */

/** Skeleton untuk 3 summary cards (dihutang / hutang / net). */
export function SummaryCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="py-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-3 h-7 w-28" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** Skeleton untuk list debt (default 3 baris). */
export function DebtListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <div className="flex gap-1">
                <Skeleton className="size-8" />
                <Skeleton className="size-8" />
                <Skeleton className="size-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** Skeleton ringan untuk fallback Suspense di dashboard. */
export function DashboardFallbackSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="space-y-1">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <SummaryCardsSkeleton />
      <div className="flex justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-32" />
      </div>
      <DebtListSkeleton />
    </div>
  );
}
