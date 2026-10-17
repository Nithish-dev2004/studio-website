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
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Return to website link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to website</span>
          </Link>
        </div>

        {/* Brand and Title Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-md">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="font-heading mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Admin Portal
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to manage bookings, contact messages, and studio inquiries for{" "}
            <span className="font-medium text-foreground">{siteConfig.name}</span>.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
          >
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="leading-snug">{errorMessage}</p>
          </div>
        )}

        {/* Login Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Admin Email
              </label>
              <div className="relative mt-2">
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
                  placeholder="admin@yourstudio.com"
                  disabled={isPending}
                  className="block w-full rounded-lg border border-border bg-background py-2.5 pr-4 pl-10 text-sm text-foreground transition-colors placeholder:text-muted-foreground/60 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-hidden disabled:opacity-60"
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
              <div className="relative mt-2">
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
                  className="block w-full rounded-lg border border-border bg-background py-2.5 pr-10 pl-10 text-sm text-foreground transition-colors placeholder:text-muted-foreground/60 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-hidden disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                Staff: your first password is your registered mobile number.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
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
                  "Sign In to Admin"
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 border-t border-border pt-4 text-center">
            <p className="text-xs text-muted-foreground">
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
