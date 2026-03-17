"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  color?: string;
  delay?: number;
}

export default function StatsCard({ label, value, icon, trend, color = "text-zinc-900", delay = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 p-8 rounded-[2rem] shadow-sm dark:shadow-none hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group relative overflow-hidden mesh-gradient"
    >
      {/* Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 blur-[60px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-700" />
      
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-150 group-hover:opacity-10 group-hover:text-indigo-500 transition-all duration-700 text-6xl">
        {icon}
      </div>
      
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 transform group-hover:rotate-12 transition-transform shadow-inner`}>
          {icon}
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500 italic">
          {label}
        </span>
      </div>

      <div className="space-y-1">
        <h3 className="text-4xl font-black italic tracking-tighter leading-none text-zinc-900 dark:text-white">
          {value}
        </h3>
        {trend && (
          <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mt-2">
            {trend} <span className="text-zinc-300 dark:text-zinc-700 font-normal ml-1">vs_last_period</span>
          </p>
        )}
      </div>
    </motion.div>
  );
}
