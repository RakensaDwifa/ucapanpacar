import type { Metadata } from "next";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin Control Panel",
  description: "Kelola statistik, transaksi, dan ucapan pengguna.",
};

export default function AdminPage() {
  return <AdminDashboard />;
}
