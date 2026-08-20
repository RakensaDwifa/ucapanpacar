"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Wallet,
  Users,
  CreditCard,
  Eye,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ShieldAlert,
} from "lucide-react";

interface PaymentRow {
  id: number;
  ucapan_id: string;
  merchant_ref: string;
  method: string;
  amount: number;
  status: string;
  tripay_ref?: string;
  paid_at?: string;
  created_at: string;
}

interface UcapanAdminRow {
  id: string;
  title: string;
  to_name: string;
  from_name: string;
  template_slug: string;
  paid: boolean;
  paid_at?: string;
  created_at: string;
  email?: string;
  totalViews: number;
}

interface AdminData {
  stats: {
    totalRevenue: number;
    totalPaidCount: number;
    totalUcapans: number;
    totalPayments: number;
  };
  payments: PaymentRow[];
  ucapans: UcapanAdminRow[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"payments" | "ucapans">("payments");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || !json.ok) {
          setError(json.error || "Gagal memuat data admin");
        } else {
          setData(json);
        }
      })
      .catch(() => setError("Gagal terhubung ke server"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface pt-24 pb-16 flex items-center justify-center">
        <p className="text-body-md text-on-surface-variant">Memuat panel admin…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface pt-24 pb-16">
        <div className="max-w-[700px] mx-auto px-5 text-center">
          <div className="bg-red-50 border border-red-200 rounded-3xl p-10 shadow-card">
            <ShieldAlert className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="font-heading text-headline-sm text-red-800 mb-2">Akses Ditolak / Gagal</h1>
            <p className="text-body-md text-red-600 mb-6">{error}</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-label-lg font-semibold rounded-full"
            >
              <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { stats, payments, ucapans } = data;

  return (
    <div className="min-h-screen bg-surface pt-24 pb-16">
      <div className="max-w-[1200px] mx-auto px-5 md:px-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link
                href="/dashboard"
                className="text-primary hover:underline text-body-md inline-flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" /> Dashboard User
              </Link>
            </div>
            <h1 className="font-heading text-headline-lg text-primary">Admin Control Panel</h1>
            <p className="text-body-md text-on-surface-variant">
              Ringkasan pendapatan, transaksi pembayaran, dan seluruh ucapan pengguna.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-3xl border border-outline-variant/30 shadow-card p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-body-md text-on-surface-variant font-medium">Total Pendapatan</span>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
            <p className="font-heading text-headline-md text-on-surface">
              Rp {stats.totalRevenue.toLocaleString("id-ID")}
            </p>
            <p className="text-label-md text-green-600 mt-1">Dari {stats.totalPaidCount} pembayaran sukses</p>
          </div>

          <div className="bg-white rounded-3xl border border-outline-variant/30 shadow-card p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-body-md text-on-surface-variant font-medium">Total Transaksi</span>
              <div className="w-10 h-10 rounded-full bg-primary-fixed/30 flex items-center justify-center text-primary">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
            <p className="font-heading text-headline-md text-on-surface">{stats.totalPayments}</p>
            <p className="text-label-md text-on-surface-variant mt-1">Semua status (Paid/Unpaid)</p>
          </div>

          <div className="bg-white rounded-3xl border border-outline-variant/30 shadow-card p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-body-md text-on-surface-variant font-medium">Total Ucapan</span>
              <div className="w-10 h-10 rounded-full bg-primary-fixed/30 flex items-center justify-center text-primary">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="font-heading text-headline-md text-on-surface">{stats.totalUcapans}</p>
            <p className="text-label-md text-on-surface-variant mt-1">Kartu ucapan terbuat</p>
          </div>

          <div className="bg-white rounded-3xl border border-outline-variant/30 shadow-card p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-body-md text-on-surface-variant font-medium">Total Kunjungan</span>
              <div className="w-10 h-10 rounded-full bg-primary-fixed/30 flex items-center justify-center text-primary">
                <Eye className="h-5 w-5" />
              </div>
            </div>
            <p className="font-heading text-headline-md text-on-surface">
              {ucapans.reduce((acc, u) => acc + u.totalViews, 0)}
            </p>
            <p className="text-label-md text-on-surface-variant mt-1">Total view di semua kartu</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-3 mb-6 border-b border-outline-variant/30 pb-4">
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-6 py-2.5 rounded-full text-label-lg font-semibold transition-all ${
              activeTab === "payments"
                ? "bg-primary text-white shadow-md"
                : "bg-surface-container-low text-on-surface hover:bg-surface-container"
            }`}
          >
            Riwayat Pembayaran ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab("ucapans")}
            className={`px-6 py-2.5 rounded-full text-label-lg font-semibold transition-all ${
              activeTab === "ucapans"
                ? "bg-primary text-white shadow-md"
                : "bg-surface-container-low text-on-surface hover:bg-surface-container"
            }`}
          >
            Daftar Ucapan ({ucapans.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "payments" ? (
          <div className="bg-white rounded-3xl border border-outline-variant/30 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant/30 text-label-md text-on-surface-variant">
                    <th className="p-4">Merchant Ref</th>
                    <th className="p-4">Metode</th>
                    <th className="p-4">Nominal</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Waktu Dibuat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 text-body-md text-on-surface">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-on-surface-variant">
                        Belum ada data pembayaran.
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p.id} className="hover:bg-surface-container-low/50">
                        <td className="p-4 font-medium">{p.merchant_ref}</td>
                        <td className="p-4 uppercase">{p.method || "-"}</td>
                        <td className="p-4 font-semibold">Rp {(p.amount || 0).toLocaleString("id-ID")}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-label-md font-semibold ${
                              p.status === "PAID"
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {p.status === "PAID" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                            {p.status}
                          </span>
                        </td>
                        <td className="p-4 text-on-surface-variant text-sm">
                          {new Date(p.created_at).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-outline-variant/30 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant/30 text-label-md text-on-surface-variant">
                    <th className="p-4">Judul / Kepada</th>
                    <th className="p-4">Template</th>
                    <th className="p-4">Status Bayar</th>
                    <th className="p-4">Views</th>
                    <th className="p-4">Dibuat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 text-body-md text-on-surface">
                  {ucapans.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-on-surface-variant">
                        Belum ada data ucapan.
                      </td>
                    </tr>
                  ) : (
                    ucapans.map((u) => (
                      <tr key={u.id} className="hover:bg-surface-container-low/50">
                        <td className="p-4">
                          <p className="font-semibold">{u.title || "Untuk Kamu"}</p>
                          <p className="text-sm text-on-surface-variant">
                            {u.to_name} (dari {u.from_name})
                          </p>
                        </td>
                        <td className="p-4 capitalize">{u.template_slug}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-label-md font-semibold ${
                              u.paid
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {u.paid ? "Aktif" : "Pending"}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-primary">{u.totalViews}×</td>
                        <td className="p-4 text-on-surface-variant text-sm">
                          {new Date(u.created_at).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
