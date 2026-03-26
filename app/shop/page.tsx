"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/utils/supabase/client";
import {
  FiFilter,
  FiSearch,
  FiGrid,
} from "react-icons/fi";
import ProductCard from "@/components/shop/ProductCard";
import FilterSidebar from "@/components/shop/FilterSidebar";
import MobileFilter from "@/components/shop/MobileFilter";
import { Toaster } from "react-hot-toast";

// 1. Tipe Data Eksplisit (Standar Profesional)
interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category: string;
  sizes?: string[];
  show_in_shop: boolean;
  created_at: string;
  stock: number;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSize, setActiveSize] = useState("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]); // Dinaikkan batas atasnya
  const [sortBy, setSortBy] = useState("newest");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    fetchProducts();

    // Subscribe to stock/product updates
    const channel = supabase
      .channel("store_stock")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => fetchProducts(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("show_in_shop", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } else {
      setProducts((data as Product[]) || []);
    }
    setLoading(false);
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (activeCategory !== "All") {
      result = result.filter((p) => p.category === activeCategory);
    }

    if (searchQuery) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (activeSize !== "All") {
      result = result.filter((p) => p.sizes?.includes(activeSize));
    }

    result = result.filter((p) => p.price <= priceRange[1]);

    if (sortBy === "price-low")
      result.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high")
      result.sort((a, b) => b.price - a.price);

    return result;
  }, [products, activeCategory, searchQuery, activeSize, priceRange, sortBy]);

  const displayedProducts = filteredProducts.slice(0, visibleCount);

  return (
    <main className="min-h-screen bg-white dark:bg-[#030303] text-zinc-900 dark:text-white pt-32 pb-24 font-mono overflow-x-hidden transition-colors duration-700">
      <Toaster position="bottom-right" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        {/* --- HEADER --- */}
        <header className="mb-20 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.8]">
                Product <br /> <span className="text-zinc-300 dark:text-zinc-800 italic">Catalog.</span>
              </h1>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.4em]">
                Registry of dark architectural artifacts
              </p>
            </motion.div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="SEARCH ARTIFACTS"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 p-6 pl-16 rounded-full text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-red-600 transition-all text-zinc-900 dark:text-white backdrop-blur-xl"
                />
              </div>
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden p-6 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full shadow-xl"
              >
                <FiFilter />
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* --- SIDEBAR: DESKTOP --- */}
          <div className="hidden lg:block lg:col-span-3">
            <FilterSidebar
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              activeSize={activeSize}
              setActiveSize={setActiveSize}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
            />
          </div>

          {/* --- PRODUCT GRID --- */}
          <div className="lg:col-span-9 space-y-12">
            {/* SORT BAR */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-zinc-50/50 dark:bg-[#0A0A0A] p-4 md:p-6 rounded-[2rem] border border-zinc-200 dark:border-white/5 gap-4 backdrop-blur-md">
              <div className="flex items-center gap-4 md:gap-6 w-full sm:w-auto justify-between sm:justify-start">
                <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase text-zinc-500">
                  <FiGrid className="text-zinc-900 dark:text-white" /> Grid View
                </div>
                <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />
                <p className="text-[9px] md:text-[10px] font-black uppercase text-zinc-500 italic">
                  Showing {displayedProducts.length} Products
                </p>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start border-t sm:border-t-0 border-zinc-200 dark:border-white/5 pt-4 sm:pt-0">
                <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
                  Sort By:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-[9px] md:text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer text-zinc-900 dark:text-white hover:text-red-500 transition-colors"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {loading ? (
              // Skeleton Loader: aspect 4/5 disamakan dengan ProductCard asli
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <div className="aspect-[4/5] bg-zinc-100 dark:bg-zinc-900 rounded-[2rem] animate-pulse" />
                    <div className="space-y-2">
                       <div className="h-4 bg-zinc-100 dark:bg-zinc-900 rounded-md w-3/4 animate-pulse" />
                       <div className="h-3 bg-zinc-100 dark:bg-zinc-900 rounded-md w-1/2 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                <AnimatePresence mode="popLayout">
                  {displayedProducts.map((product) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={product.id}
                      className="w-full"
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              // Empty State Premium (Estetika Brutalist)
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-32 flex flex-col items-center justify-center space-y-8 border-2 border-dashed border-zinc-200 dark:border-white/5 rounded-[3rem]"
              >
                <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4 border border-zinc-200 dark:border-white/10 shadow-inner">
                  <span className="text-3xl font-black text-zinc-300 dark:text-zinc-700 uppercase italic">∅</span>
                </div>
                <div className="text-center space-y-2 px-6">
                  <p className="text-zinc-900 dark:text-white text-xs font-black uppercase tracking-[0.2em]">
                    Tidak ada produk ditemukan
                  </p>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.5em] max-w-sm">
                    Kombinasi filter Anda tidak menghasilkan artifak di garis waktu ini.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveCategory("All");
                    setActiveSize("All");
                    setPriceRange([0, 10000000]);
                    setSearchQuery("");
                  }}
                  className="group relative px-10 py-5 border-2 border-zinc-200 dark:border-zinc-800 rounded-full overflow-hidden transition-all hover:border-black dark:hover:border-white"
                >
                  <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 group-hover:text-white dark:group-hover:text-black transition-colors duration-500">
                    Reset Semua Filter
                  </span>
                  <div className="absolute inset-0 bg-black dark:bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </button>
              </motion.div>
            )}

            {/* LOAD MORE */}
            {displayedProducts.length < filteredProducts.length && (
              <div className="pt-20 flex justify-center">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 4)}
                  className="group relative px-16 py-6 border-2 border-zinc-200 dark:border-zinc-800 rounded-full overflow-hidden transition-all hover:border-zinc-900 dark:hover:border-white"
                >
                  <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 group-hover:text-white dark:group-hover:text-black transition-colors duration-500">
                    Muat Lebih Banyak
                  </span>
                  <div className="absolute inset-0 bg-black dark:bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <MobileFilter
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        activeSize={activeSize}
        setActiveSize={setActiveSize}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
      />
    </main>
  );
}
