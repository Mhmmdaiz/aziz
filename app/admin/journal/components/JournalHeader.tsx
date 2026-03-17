"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";

interface JournalHeaderProps {
  onNew: () => void;
}

export default function JournalHeader({ onNew }: JournalHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em] mb-4 italic flex items-center gap-2">
          <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
          Content_Registry // Brand_Journal
        </p>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9] text-zinc-900 dark:text-white">
          Journal <br /> <span className="text-zinc-300 dark:text-zinc-800 italic">Management.</span>
        </h1>
        <p className="text-xs font-semibold text-zinc-500 mt-4 max-w-md">
          Manage your brand stories, news, and blog articles with a high-performance content engine.
        </p>
      </motion.div>
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onNew}
        className="flex items-center gap-3 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-8 py-5 rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-black/10 dark:shadow-white/5 transition-all"
      >
        <Plus size={16} /> New_Journal_Entry
      </motion.button>
    </header>
  );
}
