import type { Metadata } from "next";
import { verifyAdmin } from "@/lib/auth";
import AdminShell from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await verifyAdmin();
  if (!admin) {
    // Login page renders inside /admin/login without sidebar chrome;
    // middleware guards all other /admin/* routes.
    return <>{children}</>;
  }

  return <AdminShell adminEmail={admin.email}>{children}</AdminShell>;
}
