// Forced first-login password change page (/account/change-password).
// Accessible to staff users whose must_change_password flag is true.
// All other /account and /admin pages are blocked until this requirement is completed.

import { KeyRound, ShieldAlert } from "lucide-react";
import { requireStaffAccount } from "@/lib/admin/auth";
import ChangePasswordForm from "@/components/account/ChangePasswordForm";

export const metadata = {
  title: "Set Permanent Password | Staff Account",
  robots: { index: false, follow: false },
};

export default async function ChangePasswordPage() {
  const profile = await requireStaffAccount({ allowChangePasswordPage: true });
  const isForced = Boolean(profile.staffUser?.must_change_password);

  return (
    <div className="mx-auto max-w-md pt-4 sm:pt-8">
      {/* Informative Security Alert */}
      {isForced ? (
        <div className="mb-6 rounded-2xl border border-accent/40 bg-accent/10 p-4 text-xs text-foreground">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <div className="space-y-1">
              <h4 className="font-semibold text-accent text-sm">Action Required: First Login</h4>
              <p className="text-muted-foreground leading-relaxed">
                Your initial login password was set to your registered mobile number. For your security,
                you must set a new, permanent password to continue.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Main Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-8">
        <div className="border-b border-border pb-5 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-sm">
              <KeyRound className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold text-card-foreground">
                {isForced ? "Set Your Permanent Password" : "Change Password"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {profile.staffUser?.name} &bull; {profile.user.email}
              </p>
            </div>
          </div>
        </div>

        <ChangePasswordForm
          userMobile={profile.staffUser?.mobile}
          isForced={isForced}
        />
      </div>
    </div>
  );
}
