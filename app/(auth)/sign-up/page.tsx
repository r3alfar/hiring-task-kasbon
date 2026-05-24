"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { signUp } from "@/lib/auth-client";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    const result = await signUp.email({
      name: form.name,
      email: form.email,
      password: form.password,
      username: form.username,
    });

    if (result.error) {
      setError(result.error.message ?? "Registration failed. Please try again.");
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/dashboard");
  }

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-xl border border-border/60 bg-card/80 p-8 shadow-xl backdrop-blur-sm">
        <div className="mb-7 space-y-1.5">
          <h1 className="text-xl font-bold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">
            Start with Nexus today — it&apos;s free
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="sign-up-name"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              Full Name
            </label>
            <input
              id="sign-up-name"
              type="text"
              autoComplete="name"
              required
              value={form.name}
              onChange={set("name")}
              placeholder="John Doe"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Username */}
          <div className="space-y-1.5">
            <label
              htmlFor="sign-up-username"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">
                @
              </span>
              <input
                id="sign-up-username"
                type="text"
                autoComplete="username"
                required
                value={form.username}
                onChange={set("username")}
                placeholder="johndoe"
                className="flex h-9 w-full rounded-md border border-input bg-transparent pl-6 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="sign-up-email"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              Email
            </label>
            <input
              id="sign-up-email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={set("email")}
              placeholder="you@example.com"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="sign-up-password"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="sign-up-password"
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                value={form.password}
                onChange={set("password")}
                placeholder="Min. 8 characters"
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

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="sign-up-confirm-password"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              Confirm Password
            </label>
            <input
              id="sign-up-confirm-password"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              required
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              placeholder="Re-enter password"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
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
            id="sign-up-submit"
            type="submit"
            disabled={loading}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                <UserPlus className="size-3.5" />
                Create account
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
