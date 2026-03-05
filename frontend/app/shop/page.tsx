"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Link from "next/link";
import Image from "next/image"; // Dioptimasi untuk Next.js
import {
  FiArrowLeft,
  FiShoppingBag,
  FiSearch,
  FiPackage,
  FiPlus,
} from "react-icons/fi";

// --- SKELETON COMPONENT FOR LOADING ---
const ProductSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="aspect-[4/5] bg-zinc-100 rounded-[1.5rem] md:rounded-[2rem]" />
    <div className="space-y-2 px-2">
      <div className="h-4 bg-zinc-100 rounded w-2/3" />
      <div className="h-3 bg-zinc-50 rounded w-1/2" />
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
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/products");
        const data = res.data.data?.data || res.data.data || res.data;
        setProducts(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Fetch Error:", e);
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
        activeCategory === "All" || p.category?.name === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, activeCategory]);

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 selection:bg-blue-100">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        {/* --- MAIN CONTAINER --- */}
        <div className="bg-white rounded-3xl md:rounded-[3rem] border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden mt-15 md:mt-15">
          {/* --- HEADER SECTION --- */}
          <header className="p-6 md:p-10 lg:p-12 border-b border-zinc-50">
            <div className="flex flex-wrap md:flex-row items-center justify-between gap-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black italic uppercase tracking-tight text-black">
                  The Archive<span className="text-blue-600">.</span>
                </h1>
                <p className="text-[9px] md:text-[10px] tracking-[0.2em] text-zinc-400 font-bold mt-2 uppercase flex items-center justify-center gap-2">
                  <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                  Authenticated System — {filteredProducts.length} Units
                </p>
              </motion.div>

              <button className="relative p-3 md:p-4 bg-zinc-50 rounded-full text-black hover:bg-zinc-100 transition-colors">
                <FiShoppingBag size={20} />
                <span className="absolute top-0 right-0 w-4 h-4 bg-black text-white text-[8px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                  0
                </span>
              </button>
            </div>
          </header>

          {/* --- SEARCH & FILTER (STICKY OPTIMIZED) --- */}
          <section className="px-6 md:px-12 py-6 bg-zinc-50/50 border-b border-zinc-50 pt-0">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="relative w-full lg:flex-1 border-1 border-zinc-200 rounded-2xl">
                <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search artifacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-3.5 md:py-4 bg-white rounded-2xl outline-none border border-transparent focus:border-zinc-200 focus:ring-4 focus:ring-zinc-100 transition-all text-sm font-medium"
                />
              </div>

              <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
                {["All", "Latest", "Limited"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-6 py-3.5 md:py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                      activeCategory === cat
                        ? "bg-black text-white border-black shadow-lg shadow-black/10"
                        : "bg-white text-zinc-400 border-zinc-100 hover:border-zinc-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="px-6 md:px-10 py-10">
            <div
              className="
              flex
              gap-6
              overflow-x-auto
              scrollbar-hide
              pb-4
              snap-x
              snap-mandatory
              "
            >
              {filteredProducts.map((item) => (
                <div
                  key={item.id}
                  className="
        min-w-[180px]
        sm:min-w-[200px]
        md:min-w-[220px]
        lg:min-w-[240px]
        snap-start
        group
        "
                >
                  <Link href={`/product/${item.id}`}>
                    {/* IMAGE */}
                    <div className="aspect-[4/5] bg-zinc-100 rounded-xl overflow-hidden">
                      <img
                        src={`http://127.0.0.1:8000/storage/${item.images?.[0]?.image_path}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                      />
                    </div>

                    {/* INFO */}
                    <div className="mt-3">
                      <h3 className="text-sm font-bold uppercase">
                        {item.name}
                      </h3>

                      <p className="text-xs text-zinc-400">
                        IDR {Number(item.price).toLocaleString()}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* --- FOOTER SECTION --- */}
          <footer className="p-6 md:p-10 border-t border-zinc-50 bg-zinc-50/30 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col items-center md:items-start gap-1">
              <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-[0.3em]">
                © 2026 Essence Archive
              </p>
              <div className="flex gap-4">
                <span className="text-[7px] font-black text-zinc-300 uppercase italic">
                  Confidential Inventory
                </span>
                <span className="text-[7px] font-black text-zinc-300 uppercase italic">
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
