"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/utils/supabase/client";
import { useCart } from "@/components/providers/CartProvider";
import Link from "next/link";
import { FiPlus, FiArrowRight } from "react-icons/fi";
import { toast } from "react-hot-toast";

export default function FeaturedProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel("realtime_stock")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "products" },
        (payload) => {
          setProducts((prev) =>
            prev.map((p) =>
              p.id === payload.new.id ? { ...p, stock: payload.new.stock } : p,
            ),
          );
        },
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
      .order("created_at", { ascending: false })
      .limit(8);

    if (data) setProducts(data);
    setLoading(false);
  };

  const handleQuickAdd = (p: any) => {
    addToCart({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image_url,
      size: p.sizes?.[0] || "All Size",
      quantity: 1,
    });
    toast.success(`${p.name} ADDED_TO_VAULT`, {
      style: {
        background: "#000",
        color: "#fff",
        borderRadius: "0.5rem",
        fontSize: "10px",
        fontWeight: "black",
        textTransform: "uppercase",
        letterSpacing: "0.2em",
        border: "1px solid #333",
      },
    });
  };

  return (
    <section className="py-16 md:py-24 bg-[#0B0B0B] text-white overflow-hidden transition-colors">
      <div className="container mx-auto px-6">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.85]">
              The <br /> <span className="text-zinc-800">New season.</span>
            </h2>
          </motion.div>

          <Link
            href="/shop"
            className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-all duration-500"
          >
            Explore All Catalog{" "}
            <FiArrowRight className="group-hover:translate-x-2 transition-transform text-blue-600" />
          </Link>
        </div>

        {/* PRODUCTS AREA - Horizontal Scroll on Mobile, Grid on Desktop */}
        <div className="flex md:grid md:grid-cols-4 overflow-x-auto md:overflow-visible gap-6 md:gap-10 pb-10 md:pb-0 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
          {loading
            ? [...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="min-w-[80%] md:min-w-0 space-y-4 animate-pulse"
                >
                  <div className="aspect-[4/5] bg-zinc-900 rounded-[2.5rem]" />
                  <div className="h-3 bg-zinc-900 rounded-full w-2/3" />
                </div>
              ))
            : products.map((p, idx) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="min-w-[80%] md:min-w-0 group relative snap-start"
                >
                  <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-white/5 relative mb-6">
                    <Link href={`/product/${p.id}`}>
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100"
                      />
                    </Link>

                    {/* Stock Badge */}
                    {p.stock < 10 && (
                      <div className="absolute top-6 left-6 px-3 py-1 bg-red-600 text-white text-[8px] font-black uppercase tracking-widest rounded-full italic">
                        Limit: {p.stock}
                      </div>
                    )}

                    {/* Quick Add - Hidden on Mobile for better UX, shown on Desktop Hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center pointer-events-none">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleQuickAdd(p);
                        }}
                        className="pointer-events-auto p-5 bg-white text-black rounded-full scale-50 group-hover:scale-100 transition-all duration-500 hover:bg-blue-600 hover:text-white"
                      >
                        <FiPlus size={24} />
                      </button>
                    </div>

                    {/* Mobile Quick Add Button (Floating) */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleQuickAdd(p);
                      }}
                      className="md:hidden absolute bottom-6 right-6 p-4 bg-white text-black rounded-full shadow-xl active:scale-90 transition-transform"
                    >
                      <FiPlus size={18} />
                    </button>
                  </div>

                  <div className="space-y-2 px-1">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="text-[13px] font-black uppercase italic tracking-tight text-white group-hover:text-blue-500 transition-colors leading-tight">
                        {p.name}
                      </h3>
                      <span className="text-[11px] font-mono font-bold text-zinc-500 flex-shrink-0">
                        {Number(p.price).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-700 bg-zinc-900 px-2 py-0.5 rounded">
                        {p.category}
                      </span>
                      <div className="h-[1px] flex-1 bg-zinc-900" />
                    </div>
                  </div>
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
}
