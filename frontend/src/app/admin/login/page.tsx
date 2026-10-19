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
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-4 sm:py-8 overflow-x-hidden"
      style={{ background: "linear-gradient(160deg, #1a1005 0%, #2a1e0c 50%, #1a1005 100%)" }}
    >
      <div className="w-full max-w-md my-auto space-y-4">
        {/* Navigation / Back link */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
            style={{ color: "#7a6e5e" }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to website</span>
          </Link>
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{
              background: "rgba(201,168,76,0.12)",
              border: "1px solid rgba(201,168,76,0.22)",
              color: "#c9a84c",
            }}
          >
            Admin &amp; Staff
          </span>
        </div>

        {/* Brand and Title Header */}
        <div className="text-center">
          <div
            className="mx-auto flex h-13 w-13 items-center justify-center rounded-2xl shadow-lg"
            style={{ background: "linear-gradient(135deg, #d4a843, #a8722a)" }}
          >
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h1
            className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Studio Portal
          </h1>
          <p className="mt-1 text-xs max-w-sm mx-auto" style={{ color: "#7a6e5e" }}>
            Sign in to access your administrative console or staff account for{" "}
            <span className="font-medium text-white">{siteConfig.name}</span>.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg p-3 text-xs"
            style={{
              background: "rgba(220,38,38,0.1)",
              border: "1px solid rgba(220,38,38,0.25)",
              color: "#f87171",
            }}
          >
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="leading-snug">{errorMessage}</p>
          </div>
        )}

        {/* Login Card */}
        <div
          className="rounded-2xl p-5 sm:p-6 shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #2a2013 0%, #38291a 100%)",
            border: "1px solid rgba(201,168,76,0.15)",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: "#7a6e5e" }}
              >
                Email Address
              </label>
              <div className="relative mt-1.5">
                <div
                  className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
                  style={{ color: "#7a6e5e" }}
                >
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
                  className="block w-full rounded-lg py-2.5 pr-4 pl-10 text-sm transition-colors focus:outline-hidden disabled:opacity-60"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#f0e6d3",
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: "#7a6e5e" }}
              >
                Password
              </label>
              <div className="relative mt-1.5">
                <div
                  className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
                  style={{ color: "#7a6e5e" }}
                >
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
                  className="block w-full rounded-lg py-2.5 pr-10 pl-10 text-sm transition-colors focus:outline-hidden disabled:opacity-60"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#f0e6d3",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                  style={{ color: "#7a6e5e" }}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1.5 text-[11px]" style={{ color: "#5c5040" }}>
                Staff: your first password is your registered mobile number.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center rounded-lg py-2.5 text-sm font-semibold transition-all cursor-pointer disabled:opacity-60"
                style={{
                  background: isPending
                    ? "rgba(201,168,76,0.5)"
                    : "linear-gradient(90deg, #d4a843 0%, #a8722a 100%)",
                  color: "#1a1005",
                }}
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <span
                      className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
                      style={{ borderColor: "#1a1005", borderTopColor: "transparent" }}
                    />
                    Verifying credentials...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>

          <div
            className="mt-4 pt-3 text-center"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p className="text-[11px]" style={{ color: "#5c5040" }}>
              Secured with Supabase Auth &amp; Multi-Layer Role Verification.
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
