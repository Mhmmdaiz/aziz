"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiEdit3,
  FiTrash2,
  FiPlus,
  FiBox,
  FiActivity,
  FiSearch,
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
  FiAlertCircle,
  FiCheckCircle,
  FiZap,
  FiLoader,
} from "react-icons/fi";
import Link from "next/link";
import Swal from "sweetalert2";

export default function AdminDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // 1. Fungsi Fetch Data Terpadu
  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Ambil Produk & Stats secara bersamaan
      const [resProducts, resStats] = await Promise.all([
        axios.get("http://127.0.0.1:8000/api/products", { headers }),
        axios.get("http://127.0.0.1:8000/api/admin/dashboard-stats", {
          headers,
        }),
      ]);

      // Unpack data (menyesuaikan struktur paginasi Laravel jika ada)
      const actualProducts =
        resProducts.data.data?.data || resProducts.data.data || [];
      setProducts(actualProducts);
      setStats(resStats.data.data);
    } catch (err) {
      console.error("Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }
    fetchData();
  }, [router, fetchData]);

  // 2. Fungsi Hapus Produk
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Hapus Produk?",
      text: "Data akan hilang permanen dari database.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#000",
      cancelButtonColor: "#f4f4f5",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://127.0.0.1:8000/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(products.filter((p) => p.id !== id));
        Swal.fire("Deleted!", "Produk berhasil dihapus.", "success");
      } catch (err) {
        Swal.fire("Error!", "Gagal menghapus produk.", "error");
      }
    }
  };

  if (loading || !stats) return <LoadingScreen />;

  return (
    <main className="min-h-screen bg-[#FBFBFB] pt-24 pb-12 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-2 mt-4 italic">
              System_Node: 021-Admin
            </p>
            <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
              Operational <br />{" "}
              <span className="text-zinc-200">Intelligence.</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" />
              <input
                type="text"
                placeholder="Global Search..."
                className="w-full bg-white border border-zinc-100 p-4 pl-12 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-black/5 outline-none transition-all"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Link
              href="/admin/add-product"
              className="p-4 bg-black text-white rounded-2xl hover:bg-zinc-800 transition-all shadow-xl shadow-black/10"
            >
              <FiPlus size={20} />
            </Link>
          </div>
        </header>

        {/* KPI CARDS */}
        <div className="flex overflow-x-auto pb-4 gap-4 mb-12 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0 scrollbar-hide">
          {" "}
          <KPICard
            label="Gross_Revenue"
            value={stats.revenue_formatted}
            trend={stats.growth}
            icon={<FiDollarSign />}
            color="text-emerald-500"
            subtext="Calculated from paid orders"
          />
          <KPICard
            label="Total_Personnel"
            value={stats.users_count}
            trend="+2.4%"
            icon={<FiUsers />}
            color="text-blue-500"
            subtext="Active database entries"
          />
          <KPICard
            label="Active_Artifacts"
            value={stats.products_count}
            icon={<FiBox />}
            color="text-orange-500"
            subtext="Live inventory items"
          />
          <KPICard
            label="System_Health"
            value={stats.system_health}
            icon={<FiZap />}
            color="text-purple-500"
            subtext="Uptime operational"
          />
        </div>

        <div className="grid lg:grid-cols-12 gap-8 mb-12">
          {/* ANALYTICS */}
          <div className="lg:col-span-8 bg-white border border-zinc-100 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-zinc-300 min-h-[400px]">
            <FiTrendingUp size={48} className="mb-4 opacity-20" />
            <p className="text-[10px] font-bold uppercase tracking-widest italic">
              Live Revenue Graph Integration...
            </p>
          </div>

          {/* SIDE ALERTS */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-black text-white p-8 rounded-[2.5rem] shadow-2xl">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 opacity-60">
                Priority_Alerts
              </h4>
              <div className="space-y-4">
                <AlertItem
                  icon={<FiAlertCircle />}
                  text={`Stock Critical: ${stats.critical_stock} Items`}
                  color={
                    stats.critical_stock > 0
                      ? "text-red-400"
                      : "text-emerald-400"
                  }
                />
                <AlertItem
                  icon={<FiCheckCircle />}
                  text="Security Protocol: Active"
                  color="text-blue-400"
                />
                <AlertItem
                  icon={<FiActivity />}
                  text="API Connection: Stable"
                  color="text-emerald-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* TABLE SECTION - ARTIFACT LOG */}
        <section>
          <div className="flex justify-between items-end mb-8 px-4">
            <h4 className="text-2xl font-black italic tracking-tighter uppercase">
              Artifact_Log<span className="text-zinc-200">.</span>
            </h4>
          </div>

          <div className="bg-white rounded-[3rem] border border-zinc-100 overflow-hidden shadow-xl shadow-zinc-200/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 border-b border-zinc-50 bg-zinc-50/30">
                    <th className="p-8">Artifact_Reference</th>
                    <th className="p-8">Price_Unit</th>
                    <th className="p-8">Stock_Level</th>
                    <th className="p-8 text-right">Action_Matrix</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {products
                    .filter((p) =>
                      p.name.toLowerCase().includes(searchQuery.toLowerCase()),
                    )
                    .map((p) => (
                      <tr
                        key={p.id}
                        className="group hover:bg-zinc-50/50 transition-colors"
                      >
                        <td className="p-8">
                          <div className="flex items-center gap-6">
                            <img
                              src={
                                p.images?.[0]
                                  ? `http://127.0.0.1:8000/storage/${p.images[0].image_path}`
                                  : "/void.jpg"
                              }
                              className="w-16 h-16 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                            />
                            <div>
                              <p className="text-sm font-black italic uppercase text-zinc-900">
                                {p.name}
                              </p>
                              <p className="text-[9px] font-bold text-zinc-300 uppercase mt-1">
                                ID_{p.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-8">
                          <p className="text-sm font-black italic">
                            Rp {Number(p.price).toLocaleString("id-ID")}
                          </p>
                        </td>
                        <td className="p-8">
                          <span
                            className={`inline-flex items-center px-4 py-1 rounded-full text-[9px] font-black uppercase italic ${p.stock < 10 ? "bg-red-50 text-red-500" : "bg-zinc-100 text-zinc-600"}`}
                          >
                            {p.stock} Units
                          </span>
                        </td>
                        <td className="p-8 text-right">
                          <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                            <Link
                              href={`/admin/edit-product/${p.id}`}
                              className="p-3 bg-zinc-50 hover:bg-black hover:text-white rounded-xl transition-all"
                            >
                              <FiEdit3 size={14} />
                            </Link>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="p-3 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

// SUB-KOMPONEN
function KPICard({ label, value, trend, icon, color, subtext }: any) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <div
          className={`p-3 rounded-2xl ${color} bg-opacity-10 text-xl group-hover:bg-opacity-100 group-hover:text-white transition-all`}
        >
          {icon}
        </div>
        {trend && (
          <span
            className={`text-[10px] font-black italic ${trend.includes("+") ? "text-emerald-500" : "text-red-500"}`}
          >
            {trend}
          </span>
        )}
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">
        {label}
      </p>
      <h3 className="text-3xl font-black italic tracking-tighter text-zinc-900 leading-none">
        {value}
      </h3>
      <p className="text-[9px] font-bold text-zinc-300 mt-2 uppercase italic">
        {subtext}
      </p>
    </motion.div>
  );
}

function AlertItem({ icon, text, color }: any) {
  return (
    <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/10">
      <span className={`${color} text-lg`}>{icon}</span>
      <p className="text-[10px] font-bold uppercase tracking-widest">{text}</p>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="h-screen flex items-center justify-center bg-[#FBFBFB]">
      <div className="flex flex-col items-center gap-4">
        <FiLoader className="animate-spin text-zinc-300" size={40} />
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
          Synchronizing_Data...
        </p>
      </div>
    </div>
  );
}
