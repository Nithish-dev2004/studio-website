import type { Metadata } from "next";
import AdminToastProvider from "@/components/admin/AdminToastContext";

export const metadata: Metadata = {
  title: "Studio Portal | Sivagangai Stories",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminToastProvider>
      <div className="min-h-screen bg-background text-foreground">{children}</div>
    </AdminToastProvider>
  );
}
