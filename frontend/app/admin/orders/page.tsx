"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHash,
  FiCreditCard,
  FiRefreshCw,
  FiArrowLeft,
  FiCalendar,
  FiEye,
  FiTrash2,
  FiEdit,
  FiX,
} from "react-icons/fi";
import Link from "next/link";
import Swal from "sweetalert2";

export default function AdminOrderDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://127.0.0.1:8000/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Hapus Transaksi?",
      text: "Data ini akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#000",
      confirmButtonText: "Ya, Hapus!",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://127.0.0.1:8000/api/admin/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(orders.filter((o) => o.id !== id));
        Swal.fire("Berhasil", "Pesanan dihapus.", "success");
      } catch (err) {
        Swal.fire("Error", "Gagal menghapus.", "error");
      }
    }
  };

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://127.0.0.1:8000/api/admin/orders/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchOrders();
      Swal.fire("Success", `Status: ${newStatus}`, "success");
    } catch (err) {
      Swal.fire("Error", "Gagal update.", "error");
    }
  };

  const totalRevenue = orders
    .filter((o) => o.status === "SUCCESS")
    .reduce((acc, curr) => acc + Number(curr.total_price), 0);

  // Fungsi Komponen StatCard (Compact & Horizontal-ready)
  // Ganti fungsi StatCard lo dengan ini
  function StatCard({ label, value, unit, color = "text-black", icon }: any) {
    return (
      <motion.div
        whileHover={{ y: -3 }}
        className="bg-white p-4 md:p-5 rounded-[1.2rem] shadow-[0_8px_25px_rgba(0,0,0,0.02)] border border-gray-100 relative overflow-hidden group flex flex-col justify-center min-h-[100px]"
      >
        {/* Icon: Dibuat lebih kecil & posisi lebih pas */}
        <div className="absolute top-3 right-3 text-gray-100 group-hover:text-blue-50 transition-colors duration-500 scale-90">
          {icon}
        </div>

        {/* Label: Font size dikurangi dikit biar gak menuhi ruang */}
        <p className="text-[7px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1 relative z-10">
          {label}
        </p>

        {/* Value Container: Pake whitespace-nowrap biar gak patah ke bawah */}
        <div className="flex items-baseline gap-1 relative z-10 overflow-hidden">
          <p
            className={`text-lg md:text-xl font-black italic tracking-tighter leading-none whitespace-nowrap ${color}`}
          >
            {value}
          </p>
          <span className="text-[6px] not-italic font-bold text-gray-300 uppercase shrink-0">
            {unit}
          </span>
        </div>
      </motion.div>
    );
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center font-black italic tracking-widest opacity-30 animate-pulse uppercase">
        Syncing_Vault...
      </div>
    );

  return (
    <main className="min-h-screen pt-24 pb-20 px-4 md:px-12 bg-[#FBFBFD] text-black font-sans">
      <div className="max-w-7xl mx-auto">
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-600 mb-3 mt-2 block">
              Command_Center
            </span>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter italic uppercase leading-none">
              Orders<span className="text-blue-600">.</span>
            </h1>
          </motion.div>
          <div className="flex gap-3">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 bg-white border-2 border-black px-5 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-gray-50 transition-all"
            >
              <FiArrowLeft size={14} /> Back
            </Link>
            <button
              onClick={fetchOrders}
              className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-blue-600 transition-all"
            >
              <FiRefreshCw
                className={loading ? "animate-spin" : ""}
                size={14}
              />{" "}
              Refresh
            </button>
          </div>
        </header>

        {/* STATS GRID - Sejajar 3 kolom */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <StatCard
            label="Orders"
            value={orders.length}
            unit="Entries"
            icon={<FiHash />}
          />
          <StatCard
            label="Revenue"
            value={`Rp ${totalRevenue.toLocaleString()}`}
            unit="IDR"
            color="text-blue-600"
            icon={<FiCreditCard />}
          />
          <StatCard
            label="Status"
            value="Active"
            unit="2026"
            icon={<FiCalendar />}
          />
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-100 overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-50 text-[9px] font-black uppercase text-gray-400">
                <th className="px-10 py-8">Order ID</th>
                <th className="px-10 py-8">Customer</th>
                <th className="px-10 py-8">Valuation</th>
                <th className="px-10 py-8">Pulse_Status</th>
                <th className="px-10 py-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((o) => (
                <tr
                  key={o.id}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="px-10 py-8 font-black italic text-sm">
                    {o.order_id}
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase">
                        {o.user?.name || "Anonymous"}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {o.user?.email || "No Email"}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-8 font-black text-sm">
                    Rp {Number(o.total_price).toLocaleString()}
                  </td>
                  <td className="px-10 py-8">
                    <span
                      className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase ${o.status === "SUCCESS" ? "bg-green-50 text-green-600 border border-green-100" : "bg-yellow-50 text-yellow-600 border border-yellow-100"}`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                      >
                        <FiEye />
                      </button>
                      <button
                        onClick={() =>
                          updateStatus(
                            o.id,
                            o.status === "SUCCESS" ? "PENDING" : "SUCCESS",
                          )
                        }
                        className="p-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-black hover:text-white transition-all"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(o.id)}
                        className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL (Tetap Sama) */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] p-10 md:p-14 relative overflow-hidden shadow-2xl"
            >
              <button
                onClick={() => setSelectedOrder(null)}
                className="absolute top-8 right-8 p-3 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX size={24} />
              </button>
              <div className="mb-10">
                <span className="text-[9px] font-black text-blue-600 tracking-[0.4em] uppercase">
                  Archive_Detail
                </span>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none mt-2">
                  Order_Report<span className="text-blue-600">.</span>
                </h2>
                <p className="text-[10px] font-bold text-gray-300 tracking-widest mt-2">
                  ID: {selectedOrder.order_id}
                </p>
              </div>
              <div className="space-y-6">
                <div className="flex justify-between border-b border-gray-50 pb-4">
                  <span className="text-[10px] font-black uppercase text-gray-400">
                    Customer
                  </span>
                  <span className="text-sm font-bold uppercase">
                    {selectedOrder.user?.name}
                  </span>
                </div>
                <div className="flex flex-col border-b border-gray-50 pb-4">
                  <span className="text-[10px] font-black uppercase text-gray-400 mb-3">
                    Items_Manifest
                  </span>
                  <div className="space-y-2">
                    {JSON.parse(selectedOrder.items || "[]").map(
                      (item: any, i: number) => (
                        <div
                          key={i}
                          className="flex justify-between items-center bg-gray-50 p-3 rounded-xl"
                        >
                          <span className="text-xs font-black italic uppercase">
                            {item.name}
                          </span>
                          <span className="text-xs font-bold text-blue-600">
                            x{item.quantity || 1}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-end pt-4">
                  <span className="text-[10px] font-black uppercase text-gray-400">
                    Total_Valuation
                  </span>
                  <span className="text-3xl font-black italic text-black">
                    Rp {Number(selectedOrder.total_price).toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full mt-12 bg-black text-white py-6 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] hover:bg-blue-600 transition-all shadow-xl"
              >
                Close_Archive
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
