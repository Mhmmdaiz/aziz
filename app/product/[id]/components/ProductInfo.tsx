"use client";

import { Star } from "lucide-react";
import { motion } from "framer-motion";

interface ProductInfoProps {
  id: string;
  name: string;
  price: number;
  category?: string;
  stock?: number;
  is_high_demand?: boolean;
  sold_today?: number;
  rating?: number;
  short_description?: string;
}

export function ProductInfo({ 
  id, 
  name, 
  price, 
  category, 
  stock = 10,
  is_high_demand = false,
  sold_today = 0,
  rating = 4.9,
  short_description
}: ProductInfoProps) {
  // Scarcity state logic
  const isLowStock = stock <= 5;

  return (
    <div className="flex flex-col gap-6">
      {/* Category & Rating */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <span className="px-3 py-1 bg-zinc-100 dark:bg-[#1A1A1A] text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-[#333] rounded-md text-[10px] font-black tracking-[0.3em] uppercase transition-colors duration-500">
          {category || "New Arrival"}
        </span>
        
        <div className="flex items-center gap-2">
          <div className="flex text-yellow-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} fill={i < Math.floor(rating) ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} />
            ))}
          </div>
          <span className="text-[10px] font-mono text-zinc-500">({rating} / 5.0)</span>
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
        {stock <= 0 && (
          <span className="ml-2 px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-md animate-pulse">
            SOLD OUT
          </span>
        )}
      </div>

      {/* Scarcity & Urgency Elements */}
      {(is_high_demand || isLowStock || sold_today > 0) && (
        <div className="flex flex-col gap-3 p-4 bg-white dark:bg-[#111] border border-red-200 dark:border-red-900/30 rounded-xl transition-colors duration-500 shadow-sm dark:shadow-none">
          {is_high_demand && (
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
              <p className="text-xs font-black uppercase tracking-widest text-red-500 m-0">
                Produk Populer
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
            {sold_today > 0 && <span>🔥 {sold_today} unit terjual hari ini</span>}
            {stock <= 0 ? (
               <span className="text-red-500 font-bold">SOLD OUT</span>
            ) : isLowStock ? (
              <span className="text-red-500 dark:text-red-400 font-bold">Sisa {stock} unit!</span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-500">Tersedia</span>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-zinc-200 dark:bg-[#222] rounded-full overflow-hidden transition-colors duration-500">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(10, Math.min(((sold_today || 0) / 100) * 100, 100))}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-red-600 rounded-full" 
            />
          </div>
        </div>
      )}
      
      {/* Short Description */}
      <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 font-mono leading-relaxed mt-2 transition-colors duration-500 italic">
        {short_description || "Siluet taktis yang dirancang untuk gaya hidup urban. Dibuat dengan material berkualitas tinggi untuk durabilitas maksimal. Dapatkan koleksi eksklusif ini segera."}
      </p>
    </div>
  );
}
