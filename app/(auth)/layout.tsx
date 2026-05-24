import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s — Nexus",
    default: "Auth — Nexus",
  },
  description: "Nexus platform authentication",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-svh w-full overflow-hidden bg-background">
      {/* Subtle radial gradient background */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <div className="absolute left-1/2 top-1/4 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 size-[400px] rounded-full bg-primary/3 blur-3xl" />
      </div>

      {/* Grid noise texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.02]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />

      <div className="flex min-h-svh flex-col items-center justify-center px-4 py-12">
        {/* Wordmark */}
        <a
          href="/"
          className="mb-10 flex items-center gap-2 text-lg font-bold tracking-tight transition-opacity hover:opacity-70"
        >
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-[11px] font-black text-primary-foreground">
            N
          </span>
          <span>Nexus</span>
        </a>

        {children}
      </div>
    </div>
  );
}
