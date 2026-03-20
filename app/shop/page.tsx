"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/utils/supabase/client";
import {
  FiFilter,
  FiSearch,
  FiChevronDown,
  FiGrid,
  FiList,
} from "react-icons/fi";
import ProductCard from "@/components/shop/ProductCard";
import FilterSidebar from "@/components/shop/FilterSidebar";
import MobileFilter from "@/components/shop/MobileFilter";
import { Toaster } from "react-hot-toast";

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSize, setActiveSize] = useState("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [sortBy, setSortBy] = useState("newest");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    fetchProducts();

    // Subscribe to stock updates
    const channel = supabase
      .channel("store_stock")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "products" },
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

    if (data) setProducts(data);
    setLoading(false);
  };

  const filteredProducts = useMemo(() => {
    let result = products;

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
      result = [...result].sort((a, b) => a.price - b.price);
    if (sortBy === "price-high")
      result = [...result].sort((a, b) => b.price - a.price);

    return result;
  }, [products, activeCategory, searchQuery, priceRange, sortBy]);

  const displayedProducts = filteredProducts.slice(0, visibleCount);

  return (
    <main className="min-h-screen bg-white dark:bg-[#0B0B0B] text-zinc-900 dark:text-white pt-32 pb-24 font-mono overflow-x-hidden transition-colors duration-300">
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
                Manifest<span className="text-zinc-800"></span>Shop
              </h1>
            </motion.div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="SEARCH"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 p-6 pl-16 rounded-full text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-red-600 transition-all text-zinc-900 dark:text-white"
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
            <div className="flex flex-col sm:flex-row justify-between items-center bg-zinc-50 dark:bg-[#1A1A1A] p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-zinc-200 dark:border-white/5 gap-4">
              <div className="flex items-center gap-4 md:gap-6 w-full sm:w-auto justify-between sm:justify-start">
                <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase text-zinc-500">
                  <FiGrid className="text-zinc-900 dark:text-white" /> Grid View
                </div>
                <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />
                <p className="text-[9px] md:text-[10px] font-black uppercase text-zinc-500 italic">
                  Showing {displayedProducts.length} Artifacts
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
                  <option value="price-low">Price Low</option>
                  <option value="price-high">Price High</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex md:grid md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 overflow-x-auto pb-8 no-scrollbar snap-x">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="min-w-[200px] md:min-w-0 space-y-4 animate-pulse snap-center"
                  >
                    <div className="aspect-[4/5] bg-zinc-100 dark:bg-zinc-900 rounded-[2.5rem]" />
                    <div className="h-4 bg-zinc-100 dark:bg-zinc-900 rounded-full w-2/3" />
                    <div className="h-3 bg-zinc-100 dark:bg-zinc-900 rounded-full w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="flex md:grid md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 overflow-x-auto pb-8 no-scrollbar snap-x scroll-smooth">
                <AnimatePresence mode="popLayout">
                  {displayedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="min-w-[200px] md:min-w-0 snap-center"
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="py-40 text-center space-y-6">
                <div className="text-8xl font-black italic opacity-5 uppercase tracking-tighter">
                  Empty Vault
                </div>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.5em]">
                  No artifacts match your current filters.
                </p>
                <button
                  onClick={() => {
                    setActiveCategory("All");
                    setActiveSize("All");
                    setPriceRange([0, 1000000]);
                    setSearchQuery("");
                  }}
                  className="px-12 py-5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                >
                  Reset All Protocols
                </button>
              </div>
            )}

            {/* LOAD MORE */}
            {displayedProducts.length < filteredProducts.length && (
              <div className="pt-20 flex justify-center">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 6)}
                  className="group relative px-16 py-6 border-2 border-zinc-200 dark:border-zinc-800 rounded-full overflow-hidden transition-all hover:border-zinc-900 dark:hover:border-white"
                >
                  <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.5em] group-hover:text-white dark:group-hover:text-black transition-colors">
                    Load More Artifacts
                  </span>
                  <div className="absolute inset-0 bg-zinc-900 dark:bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
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
