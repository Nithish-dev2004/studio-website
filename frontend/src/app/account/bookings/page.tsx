// Staff Bookings Management Page (/account/bookings).
// Server Component that verifies staff authentication and loads
// ONLY confirmed and completed bookings for interactive read-only viewing.

import React from "react";
import StaffBookingsTable from "@/components/account/StaffBookingsTable";
import { getStaffBookings } from "@/lib/account/queries";
import { requireStaffAccount } from "@/lib/admin/auth";
import { services } from "@/data/services";

export const revalidate = 0;

export const metadata = {
  title: "My Bookings | Staff Portal",
  robots: { index: false, follow: false },
};

export default async function StaffBookingsPage() {
  // Enforce server-side active staff verification
  const profile = await requireStaffAccount({ allowChangePasswordPage: false });

  // Query only confirmed and completed bookings on the server
  const bookings = await getStaffBookings();

  const availableServices = services.map((s) => ({
    slug: s.slug,
    title: s.title,
  }));

  const roleLabel =
    profile.staffUser?.role === "photographer"
      ? "PHOTOGRAPHER"
      : profile.staffUser?.role?.toUpperCase() || "PHOTOGRAPHER";

  return (
    <StaffBookingsTable
      initialBookings={bookings}
      availableServices={availableServices}
      roleLabel={roleLabel}
    />
  );
}
