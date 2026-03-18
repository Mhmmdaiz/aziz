"use client";

import { Star } from "lucide-react";
import { motion } from "framer-motion";

interface ProductInfoProps {
  id: string;
  name: string;
  price: number;
  category?: string;
  stock?: number;
}

export function ProductInfo({ id, name, price, category, stock = 10 }: ProductInfoProps) {
  // Simulate scarcity based on random stable value or passed stock
  const isLowStock = stock < 5;
  const soldCount = Math.floor(id.charCodeAt(0) / 2) || 42; // deterministic but random looking

  return (
    <div className="flex flex-col gap-6">
      {/* Category & Rating */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <span className="px-3 py-1 bg-zinc-100 dark:bg-[#1A1A1A] text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-[#333] rounded-md text-[10px] font-black tracking-[0.3em] uppercase transition-colors duration-500">
          {category || "Subject_Unknown"}
        </span>
        
        <div className="flex items-center gap-2">
          <div className="flex text-red-600">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} fill="currentColor" strokeWidth={0} />
            ))}
          </div>
          <span className="text-[10px] font-mono text-zinc-500">(4.9 / 5.0)</span>
        </div>
      </div>

      {/* Main Title */}
      <motion.h1 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-5xl lg:text-7xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white leading-[0.9] drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-colors duration-500"
      >
        {name}
      </motion.h1>

      <div className="h-px w-16 bg-red-600/50" />

      {/* Price Block */}
      <div className="flex items-baseline gap-4 mt-2">
        <span className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white tracking-tighter font-mono transition-colors duration-500">
          IDR {Number(price).toLocaleString()}
        </span>
        <span className="text-sm font-black text-zinc-400 dark:text-zinc-600 line-through tracking-tight font-mono transition-colors duration-500">
          IDR {(Number(price) * 1.3).toLocaleString()}
        </span>
      </div>

      {/* Scarcity & Urgency Elements */}
      <div className="flex flex-col gap-3 p-4 bg-white dark:bg-[#111] border border-red-200 dark:border-red-900/30 rounded-xl transition-colors duration-500 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
          </span>
          <p className="text-xs font-black uppercase tracking-widest text-red-500 m-0">
            High_Demand_Artifact
          </p>
        </div>
        
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
          <span>🔥 {soldCount} units claimed today</span>
          {isLowStock ? (
            <span className="text-red-500 dark:text-red-400 font-bold">Only {stock} left!</span>
          ) : (
            <span className="text-emerald-600 dark:text-emerald-500">In Stock</span>
          )}
        </div>
        
        {/* Fake Progress Bar to induce urgency */}
        <div className="w-full h-1.5 bg-zinc-200 dark:bg-[#222] rounded-full overflow-hidden transition-colors duration-500">
          <div 
            className="h-full bg-red-600 rounded-full" 
            style={{ width: `${Math.max(10, (stock / 50) * 100)}%` }}
          />
        </div>
      </div>
      
      {/* Short Description */}
      <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 font-mono leading-relaxed mt-2 transition-colors duration-500">
        Tactical silhouette engineered for urban survival. Material infused with durability protocols. Assume control of your aesthetic parameters immediately.
      </p>
    </div>
  );
}
