"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiSearch, FiArrowRight, FiLoader } from "react-icons/fi";
import { useCart } from "@/components/providers/CartProvider";
import { supabase } from "@/utils/supabase/client";
import Link from "next/link";

export default function SearchDrawer() {
  const { isSearchOpen, setIsSearchOpen } = useCart();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchProducts = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .ilike("name", `%${query}%`)
        .limit(5);

      if (!error && data) {
        setResults(data);
      }
      setLoading(false);
    };

    const timeoutId = setTimeout(searchProducts, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  // Reset search when closed
  useEffect(() => {
    if (!isSearchOpen) {
      setQuery("");
      setResults([]);
    }
  }, [isSearchOpen]);

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSearchOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-[#0A0A0A] z-[160] shadow-2xl flex flex-col border-l border-zinc-200 dark:border-white/5"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiSearch className="text-zinc-400" size={20} />
                <h2 className="text-xl font-black italic uppercase tracking-tighter">Search</h2>
              </div>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-full transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-6">
              <div className="relative">
                <input
                  autoFocus
                  type="text"
                  placeholder="WHAT ARE YOU LOOKING FOR?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-white/5 border-none rounded-2xl py-5 px-6 text-sm font-bold uppercase tracking-widest focus:ring-2 focus:ring-red-600/20 transition-all outline-none"
                />
                {loading && (
                  <div className="absolute right-6 top-1/2 -translate-y-1/2">
                    <FiLoader className="animate-spin text-red-600" size={20} />
                  </div>
                )}
              </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-4">
              {query.trim().length > 0 && results.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-400">No results found for "{query}"</p>
                </div>
              )}

              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/shop/${product.id}`}
                  onClick={() => setIsSearchOpen(false)}
                  className="flex gap-4 p-3 rounded-2xl hover:bg-zinc-50 dark:hover:bg-white/5 transition-all group"
                >
                  <div className="w-20 h-24 bg-zinc-100 dark:bg-zinc-900 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={product.image || product.images?.[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="font-bold text-sm uppercase tracking-tight group-hover:text-red-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 uppercase tracking-widest">
                      {product.category || "Collection"}
                    </p>
                    <p className="font-black text-sm italic mt-2">
                      ${product.price?.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center pr-2">
                    <FiArrowRight className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-red-600" />
                  </div>
                </Link>
              ))}

              {query.trim().length === 0 && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4 px-2">Popular Categories</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {["Outerwear", "Footwear", "Accessories", "Tees"].map((cat) => (
                        <Link 
                          key={cat}
                          href={`/shop?category=${cat}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="p-4 bg-zinc-50 dark:bg-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all text-center"
                        >
                          {cat}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-zinc-50 dark:bg-[#0D0D0D] border-t border-zinc-200 dark:border-white/5">
              <Link
                href="/shop"
                onClick={() => setIsSearchOpen(false)}
                className="w-full py-5 border border-zinc-200 dark:border-white/10 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[#101010] dark:text-white text-xs hover:bg-zinc-900 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all"
              >
                View All Products
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
