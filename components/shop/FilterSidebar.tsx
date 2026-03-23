"use client";

import { motion } from "framer-motion";
import { FiFilter, FiChevronDown, FiX } from "react-icons/fi";

interface FilterSidebarProps {
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  activeSize: string;
  setActiveSize: (size: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
}

const CATEGORIES = ["All", "Oversize", "Graphic", "Minimal", "Dark Series"];
const SIZES = ["All", "S", "M", "L", "XL"];

export default function FilterSidebar({ 
  activeCategory, 
  setActiveCategory,
  activeSize,
  setActiveSize,
  priceRange,
  setPriceRange
}: FilterSidebarProps) {
  return (
    <aside className="w-full space-y-12 sticky top-32">
       {/* 01. CATEGORIES */}
       <section className="space-y-6">
          <div className="flex items-center gap-3">
             <span className="text-lg font-black italic opacity-20">01</span>
             <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Kategori Warna</h3>
          </div>
          <div className="space-y-2">
             {CATEGORIES.map((cat) => (
               <button
                 key={cat}
                 onClick={() => setActiveCategory(cat)}
                 className={`w-full text-left py-3 px-6 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-between group ${
                   activeCategory === cat 
                   ? "bg-zinc-900 dark:bg-white text-white dark:text-black shadow-xl" 
                   : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 shadow-sm"
                 }`}
               >
                 {cat}
                 <span className={`w-1.5 h-1.5 rounded-full bg-red-600 ${activeCategory === cat ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`} />
               </button>
             ))}
          </div>
       </section>

       {/* 02. PRICE RANGE */}
       <section className="space-y-6">
          <div className="flex items-center gap-3">
             <span className="text-lg font-black italic opacity-20">02</span>
             <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Rentang Harga</h3>
          </div>
          <div className="space-y-4 px-2">
             <input 
               type="range" 
               min="0" 
               max="1000000" 
               step="50000"
               value={priceRange[1]}
               onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
               className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-600"
             />
             <div className="flex justify-between items-center text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                <span>Rp 0</span>
                <span className="text-zinc-900 dark:text-white">Di bawah Rp {priceRange[1].toLocaleString()}</span>
             </div>
          </div>
       </section>

       {/* 03. SIZE GRID */}
       <section className="space-y-6">
          <div className="flex items-center gap-3">
             <span className="text-lg font-black italic opacity-20">03</span>
             <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Pilihan Ukuran</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
             {SIZES.map((size) => (
               <button
                 key={size}
                 onClick={() => setActiveSize(size)}
                 className={`py-4 border rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest ${
                    activeSize === size
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white shadow-xl"
                    : "border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-white/5 text-zinc-400 hover:border-zinc-900 dark:hover:border-white hover:text-zinc-900 dark:hover:text-white"
                 }`}
               >
                 {size}
               </button>
             ))}
          </div>
       </section>

       {/* RESET OPTION */}
       <button 
         onClick={() => {
           setActiveCategory("All");
           setPriceRange([0, 1000000]);
         }}
         className="w-full py-4 rounded-full border border-zinc-800 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700 hover:text-red-500 hover:border-red-500 transition-all flex items-center justify-center gap-2"
       >
         <FiX /> Reset Filter
       </button>
    </aside>
  );
}
