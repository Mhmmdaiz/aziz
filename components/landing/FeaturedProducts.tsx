"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/utils/supabase/client";
import { useSettings } from "@/components/providers/SettingsProvider";
import { useCart } from "@/components/providers/CartProvider";
import Link from "next/link";
import { FiPlus, FiArrowRight } from "react-icons/fi";
import { toast } from "react-hot-toast";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

export default function FeaturedProducts({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { settings, loading: settingsLoading } = useSettings();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const featuredIds = settings?.landing_content?.featured_products;
      let query = supabase.from("products").select("*").eq("show_in_shop", true);

      if (featuredIds && featuredIds.length > 0) {
        query = query.in("id", featuredIds);
      } else {
        query = query.order("created_at", { ascending: false }).limit(8);
      }

      const { data, error } = await query;
      if (error) throw error;
      if (data) {
        const finalData = featuredIds?.length 
          ? [...data].sort((a, b) => featuredIds.indexOf(a.id) - featuredIds.indexOf(b.id))
          : data;
        setProducts(finalData);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [settings?.landing_content?.featured_products]);

  useEffect(() => {
    if (!settingsLoading) fetchProducts();
  }, [settingsLoading, fetchProducts]);

  const handleQuickAdd = (p: any) => {
    if (p.stock <= 0) {
      toast.error("Stok Habis");
      return;
    }
    addToCart({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image_url,
      size: p.sizes?.[0] || "All Size",
      quantity: 1,
    });
    toast.success(`${p.name} DITAMBAHKAN`);
  };

  return (
    <section className={`py-12 md:py-32 overflow-hidden transition-colors duration-700 ${theme === "dark" ? "bg-[#0B0B0B] text-white" : "bg-white text-zinc-900"}`}>
      <div className="container mx-auto px-4 md:px-6">
        
        {/* HEADER MINIATUR */}
        <div className="flex flex-row justify-between items-end gap-4 mb-8 md:mb-16">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-9xl font-black italic uppercase tracking-tighter leading-[0.8]">
              Koleksi <br /> 
              <span className="text-zinc-500">Terbaru.</span>
            </h2>
          </motion.div>

          <Link
            href="/shop"
            className="group flex items-center gap-2 text-[8px] md:text-xs font-black uppercase tracking-widest py-1 border-b border-[var(--color-primary-accent)] md:border-b-2"
          >
            Katalog <FiArrowRight className="text-[var(--color-primary-accent)]" />
          </Link>
        </div>

        {/* GRID AREA DENGAN SCROLL SAMPING (UKURAN DIPERKECIL) */}
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 overflow-x-auto md:overflow-visible gap-4 md:gap-8 pb-8 no-scrollbar snap-x snap-mandatory">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="min-w-[55%] md:min-w-0 animate-pulse bg-zinc-900 aspect-[4/5] rounded-2xl" />
            ))
          ) : (
            products.map((p, idx) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                // Lebar kartu di mobile diperkecil menjadi 55% agar terlihat berdampingan
                className="min-w-[55%] md:min-w-0 group snap-center"
              >
                {/* IMAGE CARD MINI */}
                <div className={`relative aspect-[4/5] overflow-hidden rounded-[1.5rem] md:rounded-[2rem] mb-3 md:mb-6 border transition-colors ${theme === "dark" ? "bg-zinc-900 border-white/5" : "bg-zinc-100 border-zinc-200"}`}>
                  <Link href={`/product/${p.id}`} className="block w-full h-full">
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition duration-700"
                    />
                  </Link>

                  {/* Stock Badge Mini */}
                  {p.stock <= 0 && (
                    <div className="absolute top-3 left-3 px-2 py-0.5 bg-red-600 text-[7px] md:text-[9px] font-black uppercase rounded-full">
                      Habis
                    </div>
                  )}

                  {/* Quick Add Button Mini */}
                  <button
                    onClick={() => handleQuickAdd(p)}
                    className="absolute bottom-3 right-3 p-3 md:p-5 bg-white text-black rounded-full shadow-2xl active:scale-90 md:opacity-0 md:group-hover:opacity-100 transition"
                  >
                    <FiPlus size={14} className="md:w-6 md:h-6" />
                  </button>
                </div>

                {/* INFO MINI */}
                <div className="px-1 space-y-1">
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-[10px] md:text-sm font-black uppercase italic tracking-tight leading-none truncate">
                      {p.name}
                    </h3>
                    <p className="text-[7px] md:text-[10px] text-zinc-500 font-bold uppercase">
                      {p.category || "General"}
                    </p>
                  </div>
                  <p className="text-[9px] md:text-xs font-black text-[var(--color-primary-accent)]">
                    {formatPrice(p.price)}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}