"use client";

import { motion } from "framer-motion";
import { FiArrowUpRight, FiClock } from "react-icons/fi";

import { DashboardOrder } from "../page";

interface RecentOrdersProps {
  orders: DashboardOrder[];
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-[2.5rem] shadow-sm dark:shadow-none overflow-hidden h-full"
    >
      <div className="p-8 border-b border-zinc-100 dark:border-zinc-900 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
        <div>
          <h3 className="text-sm font-black italic uppercase tracking-widest text-zinc-900 dark:text-white">
            Recent_Transactions
          </h3>
          <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-[0.3em] mt-1">
            Registry_Log // Live_Feed
          </p>
        </div>
        <FiClock className="animate-pulse text-blue-500" />
      </div>

      <div className="overflow-x-auto">
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
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors group">
                  <td className="p-6">
                    <span className="font-mono text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-1 border border-black dark:border-zinc-700">
                      #{order.id.slice(0, 8)}
                    </span>
                  </td>
                  <td className="p-6">
                    <p className="text-xs font-black uppercase italic truncate max-w-[120px]">
                      {order.profiles?.full_name || "Unknown_Entity"}
                    </p>
                    <p className="text-[8px] text-zinc-400 uppercase font-bold">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 text-[9px] font-black border border-zinc-200 dark:border-zinc-800 rounded-full uppercase italic ${
                      order.status === "paid" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : 
                      order.status === "pending" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" : 
                      "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-6 text-right font-black italic text-sm">
                    Rp {Number(order.total_price).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-20 text-center italic font-black uppercase tracking-widest text-zinc-300">
                  Empty_Registry_Set
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
