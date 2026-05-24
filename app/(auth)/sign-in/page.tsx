"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { authClient } from "@/lib/auth-client";


export default function SignInPage() {
  const router = useRouter();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Strip leading @ if user types "@username"
    const raw = form.identifier.trim();
    const isEmail = raw.includes("@") && raw.indexOf("@") > 0;
    const usernameValue = raw.startsWith("@") ? raw.slice(1) : raw;

    const result = isEmail
      ? await authClient.signIn.email({
          email: raw,
          password: form.password,
        })
      : await authClient.signIn.username({
          username: usernameValue,
          password: form.password,
        });

    if (result.error) {
      setError(result.error.message ?? "Invalid credentials. Please try again.");
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/dashboard");
  }

  return (
    <div className="w-full max-w-sm">
      {/* Card */}
      <div className="rounded-xl border border-border/60 bg-card/80 p-8 shadow-xl backdrop-blur-sm">
        <div className="mb-7 space-y-1.5">
          <h1 className="text-xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Sign in with your email or username
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email or username */}
          <div className="space-y-1.5">
            <label
              htmlFor="sign-in-identifier"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              Email or Username
            </label>
            <input
              id="sign-in-identifier"
              type="text"
              autoComplete="username email"
              required
              value={form.identifier}
              onChange={(e) =>
                setForm((f) => ({ ...f, identifier: e.target.value }))
              }
              placeholder="you@example.com or @username"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="sign-in-password"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                Password
              </label>
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                id="sign-in-password"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                required
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                placeholder="••••••••"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pr-9 text-sm shadow-sm transition-colors placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <button
                type="button"
                aria-label={showPw ? "Hide password" : "Show password"}
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPw ? (
                  <EyeOff className="size-3.5" />
                ) : (
                  <Eye className="size-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
            >
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            id="sign-in-submit"
            type="submit"
            disabled={loading}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                <LogIn className="size-3.5" />
                Sign in
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
