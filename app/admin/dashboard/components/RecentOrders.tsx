"use client";

import { motion } from "framer-motion";
import { FiClock, FiArrowRight } from "react-icons/fi";
import { DashboardOrder } from "../page";

interface RecentOrdersProps {
  orders: DashboardOrder[];
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm overflow-hidden h-full"
    >
      {/* Header */}
      <div className="p-5 md:p-8 border-b border-zinc-100 dark:border-zinc-900 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
        <div>
          <h3 className="text-xs md:text-sm font-black italic uppercase tracking-[0.2em] text-zinc-900 dark:text-white">
            Transaksi Baru
          </h3>
          <p className="text-[7px] md:text-[8px] font-bold text-zinc-400 uppercase tracking-[0.3em] mt-1">
            Registry_Log // Live_Feed
          </p>
        </div>
        <FiClock className="animate-pulse text-blue-500 text-sm" />
      </div>

      {/* Mobile View: Stacked Cards (Hidden on Desktop) */}
      <div className="block md:hidden divide-y divide-zinc-100 dark:divide-zinc-900">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div
              key={order.id}
              className="p-5 active:bg-zinc-50 dark:active:bg-zinc-900 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="font-mono text-[9px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 border border-zinc-200 dark:border-zinc-700">
                  #{order.id.slice(0, 8)}
                </span>
                <span
                  className={`text-[8px] font-black uppercase italic ${
                    order.status === "paid"
                      ? "text-emerald-500"
                      : "text-amber-500"
                  }`}
                >
                  // {order.status}
                </span>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[11px] font-black uppercase italic mb-1">
                    {order.profiles?.full_name || "Unknown_Entity"}
                  </p>
                  <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider">
                    {new Date(order.created_at).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black italic">
                    Rp {Number(order.total_price).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-10 text-center italic font-black uppercase text-[10px] text-zinc-300 tracking-widest">
            Empty_Registry_Set
          </div>
        )}
      </div>

      {/* Desktop View: Original Table (Hidden on Mobile) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[9px] font-black uppercase tracking-[0.3em] bg-zinc-50/50 dark:bg-zinc-900/20 text-zinc-400 dark:text-zinc-600 border-b border-zinc-100 dark:border-zinc-900">
              <th className="p-6">Manifest_ID</th>
              <th className="p-6">Identity</th>
              <th className="p-6">Status</th>
              <th className="p-6 text-right">Valuation</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-zinc-100 dark:divide-zinc-900">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors"
              >
                <td className="p-6 font-mono text-[10px]">
                  #{order.id.slice(0, 8)}
                </td>
                <td className="p-6">
                  <p className="text-xs font-black uppercase italic">
                    {order.profiles?.full_name}
                  </p>
                  <p className="text-[8px] text-zinc-400">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </td>
                <td className="p-6 italic font-black text-[9px] uppercase">
                  {order.status}
                </td>
                <td className="p-6 text-right font-black italic text-sm">
                  Rp {Number(order.total_price).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
