"use client";

// Administrator login page.
// Provides a secure, responsive email & password authentication interface with
// rate limiting feedback, loading states, and attacker-safe error messages.

import React, { Suspense, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Lock, Mail, ShieldAlert, ShieldCheck } from "lucide-react";
import { loginAction } from "@/app/admin/actions";
import { useAdminToast } from "@/components/admin/AdminToastContext";
import Button from "@/components/ui/Button";
import { siteConfig } from "@/data/site";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/admin";
  const urlError = searchParams.get("error");
  const { showToast } = useAdminToast();
  const notificationHandledRef = useRef(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    urlError === "inactive"
      ? "Your account is inactive. Contact the admin."
      : urlError === "forbidden"
        ? "Access denied: this account does not have administrator privileges."
        : urlError === "unconfigured"
          ? "Supabase configuration is missing. Please set environment variables."
          : null,
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (notificationHandledRef.current) return;

    if (searchParams.get("logged_out") === "true") {
      notificationHandledRef.current = true;
      showToast("Signed out successfully.", "info");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (urlError === "inactive") {
      notificationHandledRef.current = true;
      showToast("Your account is inactive. Contact the admin.", "error");
    } else if (urlError === "forbidden") {
      notificationHandledRef.current = true;
      showToast("Access denied: administrator privileges required.", "error");
    }
  }, [searchParams, urlError, showToast]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const formData = new FormData();
    formData.set("email", email);
    formData.set("password", password);
    formData.set("next", nextUrl);

    startTransition(async () => {
      const result = await loginAction({}, formData);
      if (result.error) {
        setErrorMessage(result.error);
        showToast(result.error, "error");
      } else if (result.success && result.redirectTo) {
        try {
          sessionStorage.setItem(
            "admin_toast",
            JSON.stringify({
              message: "Signed in successfully. Welcome back!",
              type: "success",
            }),
          );
        } catch {
          // ignore
        }
        router.push(result.redirectTo);
        router.refresh();
      }
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-4 sm:py-6 overflow-x-hidden">
      <div className="w-full max-w-md my-auto space-y-3.5 sm:space-y-4">
        {/* Navigation / Back link */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to website</span>
          </Link>
          <span className="rounded-full border border-accent/20 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
            Admin & Staff
          </span>
        </div>

        {/* Brand and Title Header */}
        <div className="text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-sm">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="font-heading mt-2.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Studio Portal
          </h1>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
            Sign in to access your administrative console or staff account for{" "}
            <span className="font-medium text-foreground">{siteConfig.name}</span>.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"
          >
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="leading-snug">{errorMessage}</p>
          </div>
        )}

        {/* Login Card */}
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Email Address
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@yourstudio.com"
                  disabled={isPending}
                  className="block w-full rounded-lg border border-border bg-background py-2 pr-4 pl-10 text-sm text-foreground transition-colors placeholder:text-muted-foreground/60 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-hidden disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Password
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={isPending}
                  className="block w-full rounded-lg border border-border bg-background py-2 pr-10 pl-10 text-sm text-foreground transition-colors placeholder:text-muted-foreground/60 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-hidden disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                Staff: your first password is your registered mobile number.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-1">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full justify-center bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Verifying credentials...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </div>
          </form>

          <div className="mt-4 border-t border-border pt-3 text-center">
            <p className="text-[11px] text-muted-foreground">
              Secured with Supabase Auth & Multi-Layer Role Verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
