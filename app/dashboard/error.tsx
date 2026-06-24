"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

/**
 * Route-level error boundary untuk dashboard.
 * Next.js akan menangkap error throw dari server/client components
 * di dalam segment ini dan render fallback ini.
 *
 * Docs: https://nextjs.org/docs/app/api-reference/file-conventions/error
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Bantu debugging di dev; di production ini no-op efektif.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-7" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Yah, ada yang error</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Terjadi kesalahan saat memuat dashboard. Coba lagi ya, kalau masih
          error terus, refresh halamannya.
        </p>
      </div>
      <Button onClick={reset}>Coba lagi</Button>
    </div>
  );
}
