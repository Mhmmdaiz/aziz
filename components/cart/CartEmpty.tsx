"use client";

import { motion } from "framer-motion";
import { FiShoppingBag, FiArrowRight } from "react-icons/fi";
import Link from "next/link";

export default function CartEmpty() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative mb-12"
      >
        <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full" />
        <div className="relative w-32 h-32 md:w-44 md:h-44 bg-zinc-900 rounded-full flex items-center justify-center border border-white/5 shadow-2xl">
          <FiShoppingBag className="text-zinc-700 w-12 h-12 md:w-16 md:h-16" strokeWidth={1} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="space-y-6"
      >
        <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white">
          Vault<span className="text-indigo-500"> </span>Empty
        </h2>
        <p className="max-w-md mx-auto text-[10px] md:text-[12px] font-black uppercase tracking-[0.3em] text-zinc-500 leading-relaxed italic">
          Your digital archive is currently void of artifacts. Access the main grid to secure limited drops.
        </p>
        
        <div className="pt-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-4 px-10 py-5 bg-white text-black rounded-full font-black uppercase tracking-[0.4em] text-[10px] hover:bg-indigo-500 hover:text-white transition-all active:scale-95"
          >
            Access Shop Grid
            <FiArrowRight />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
