"use client";

import { motion } from "framer-motion";
import { FiAlertCircle, FiTrendingUp } from "react-icons/fi";
import Image from "next/image";

import { DashboardProduct } from "../page";

interface InventoryWidgetsProps {
  lowStock: DashboardProduct[];
  topProducts: DashboardProduct[];
}

export default function InventoryWidgets({
  lowStock,
  topProducts,
}: InventoryWidgetsProps) {
  return (
    <div className="space-y-8">
      {/* LOW STOCK SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-zinc-950 p-5 md:p-8 border border-zinc-100 dark:border-zinc-900 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm dark:shadow-none relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-[50px] -mr-16 -mt-16 group-hover:bg-rose-500/10 transition-all duration-700" />

        <div className="flex items-center justify-between mb-8">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">
            Priority Shortage
          </h4>
          <FiAlertCircle className="text-red-500" />
        </div>

        <div className="space-y-6">
          {lowStock.length > 0 ? (
            lowStock.map((item) => (
              <div key={item.id} className="flex items-center gap-4 group">
                <div className="w-12 h-12 border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden bg-zinc-50 dark:bg-zinc-900 grayscale group-hover:grayscale-0 transition-opacity">
                  <img
                    src={item.image_url || "/placeholder.jpg"}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase truncate italic text-zinc-900 dark:text-white">
                    {item.name}
                  </p>
                  <p className="text-[9px] font-bold text-red-500 uppercase">
                    STOCK CRITICAL: {item.stock}
                  </p>
                </div>
                <div className="h-1.5 w-16 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(Math.min(item.stock || 0, 5) / 5) * 100}%`,
                    }}
                    className="h-full bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 italic">
              No Shortage Detected
            </p>
          )}
        </div>
      </motion.section>

      {/* TOP PRODUCTS SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-zinc-950 p-5 md:p-8 border border-zinc-100 dark:border-zinc-900 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm dark:shadow-none relative overflow-hidden group"
      >
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-indigo-500/5 blur-[60px] -mr-20 -mb-20 group-hover:bg-indigo-500/10 transition-all duration-700" />

        <div className="flex items-center justify-between mb-8">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
            Trending
          </h4>
          <FiTrendingUp className="text-emerald-500" />
        </div>

        <div className="space-y-6">
          {topProducts.length > 0 ? (
            topProducts.map((item, i) => (
              <div key={item.id} className="flex items-center gap-4 group">
                <div className="text-xl font-black italic text-zinc-100 dark:text-zinc-900 mr-2 group-hover:text-indigo-500 transition-colors">
                  0{i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black uppercase truncate italic text-zinc-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                    {item.name}
                  </p>
                  <p className="text-[9px] font-bold text-zinc-400 uppercase">
                    UNITS DISPATCHED: {item.total_sold}
                  </p>
                </div>
                <div className="text-[10px] font-black italic text-zinc-300">
                  {Math.round(item.performance || 0)}%
                </div>
              </div>
            ))
          ) : (
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-300 italic">
              Data Insufficiency
            </p>
          )}
        </div>
      </motion.section>
    </div>
  );
}
