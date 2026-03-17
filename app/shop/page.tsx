"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
// --- FIXED SUPABASE IMPORT ---
import { supabase } from "@/utils/supabase/client";
// -----------------------------
import { FiShoppingBag, FiSearch } from "react-icons/fi";

// --- SKELETON COMPONENT FOR LOADING ---
const ProductSkeleton = () => (
  <div className="space-y-4 animate-pulse min-w-[200px]">
    <div className="aspect-[4/5] bg-zinc-100 dark:bg-zinc-900 rounded-xl" />
    <div className="space-y-2 px-2">
      <div className="h-4 bg-zinc-100 dark:bg-zinc-900 rounded w-2/3" />
      <div className="h-3 bg-zinc-50 dark:bg-zinc-950 rounded w-1/2" />
    </div>
  </div>
);

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Menggunakan objek supabase langsung dari import
        const { data, error } = await supabase.from("products").select("*");

        if (error) {
          console.error("Fetch Error:", error.message);
        } else {
          setProducts(data || []);
        }
      } catch (err) {
        console.error("System Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter Logic (Client-side)
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesCat =
        activeCategory === "All" || p.category === activeCategory;

      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, activeCategory]);

  return (
    <main className="min-h-screen bg-white dark:bg-[#030303] text-zinc-900 dark:text-white selection:bg-indigo-100 dark:selection:bg-indigo-900/30 transition-colors duration-500 mesh-gradient relative">
      <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-[0.03] pointer-events-none" />
      
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 relative z-10 w-full overflow-x-hidden">
        <div className="glass rounded-3xl md:rounded-[4rem] border border-white/20 dark:border-white/5 shadow-2xl overflow-hidden mt-15 w-full">
          {/* --- HEADER SECTION --- */}
          <header className="p-6 md:p-10 lg:p-12 border-b border-zinc-50 dark:border-zinc-900">
            <div className="flex flex-wrap md:flex-row items-center justify-between gap-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-left"
              >
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black italic uppercase tracking-tight text-zinc-900 dark:text-white">
                  The Archive<span className="text-indigo-500 shadow-indigo-500/50">.</span>
                </h1>
                <p className="text-[9px] md:text-[10px] tracking-[0.2em] text-zinc-400 font-bold mt-2 uppercase flex items-center gap-2">
                  <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                  Authenticated System — {filteredProducts.length} Units
                </p>
              </motion.div>

              <button className="relative p-3 md:p-4 bg-zinc-50 dark:bg-zinc-900 rounded-full text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                <FiShoppingBag size={20} />
                <span className="absolute top-0 right-0 w-4 h-4 bg-black dark:bg-white text-white dark:text-black text-[8px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-zinc-900">
                  0
                </span>
              </button>
            </div>
          </header>

          {/* --- SEARCH & FILTER --- */}
          <section className="px-6 md:px-12 py-6 bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-50 dark:border-zinc-900">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="relative w-full lg:flex-1">
                <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search artifacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-3.5 md:py-4 bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-2xl border border-white/20 dark:border-white/5 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all text-sm font-medium dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar">
                {["All", "Latest", "Limited"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                      activeCategory === cat
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-500/20"
                        : "bg-white/50 dark:bg-black/50 text-zinc-400 dark:text-zinc-600 border-white/20 dark:border-white/5 hover:border-indigo-500/40"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* --- PRODUCT GRID --- */}
          <section className="px-4 md:px-10 py-10 w-full">
            <div className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-6 px-2 snap-x snap-mandatory">
              {loading ? (
                [...Array(4)].map((_, i) => <ProductSkeleton key={i} />)
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="min-w-[200px] max-w-[220px] snap-start group"
                  >
                    <Link href={`/product/${item.id}`}>
                      <div className="aspect-[4/5] w-full bg-white dark:bg-black rounded-2xl overflow-hidden relative border border-white/20 dark:border-white/5 shadow-lg group-hover:shadow-indigo-500/10 group-hover:border-indigo-500/20 transition-all duration-700">
                        <img
                          src={item.image_url || "/next.svg"}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                        />
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      <div className="mt-4 px-1">
                        <h3 className="text-[11px] font-black uppercase tracking-tight truncate text-zinc-900 dark:text-white">
                          {item.name}
                        </h3>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-600 font-mono mt-0.5">
                          IDR {Number(item.price || 0).toLocaleString()}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="w-full py-20 text-center text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                  No artifacts found in the archive.
                </div>
              )}
            </div>
          </section>

          {/* --- FOOTER --- */}
          <footer className="p-6 md:p-10 border-t border-zinc-50 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-950/30 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col items-center md:items-start gap-1">
              <p className="text-[8px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em]">
                © 2026 Essence Archive
              </p>
              <div className="flex gap-4">
                <span className="text-[7px] font-black text-zinc-300 dark:text-zinc-700 uppercase italic">
                  Confidential Inventory
                </span>
                <span className="text-[7px] font-black text-zinc-300 dark:text-zinc-700 uppercase italic">
                  Secure Portal v2.0
                </span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
}
