"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiClock, FiArrowRight } from "react-icons/fi";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { useSettings } from "@/components/providers/SettingsProvider";

export default function PreOrderSystem({ data: propData, theme = "dark" }: any) {
  const { settings } = useSettings();
  const data = propData || settings?.preorder;

  // Countdown & Logic Fetching (Singkat)
  const [timeLeft, setTimeLeft] = useState<any>(null);
  const [productData, setProductData] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!data?.product_id) return;
    const fetchProduct = async () => {
      const { data: p } = await supabase
        .from("products")
        .select("name, price, sizes, specifications, description")
        .eq("id", data.product_id)
        .single();
      if (p) setProductData(p);
    };
    fetchProduct();
  }, [data?.product_id]);

  useEffect(() => {
    // Countdown logic
    if (!data?.countdown_target) return;
    const timer = setInterval(() => {
      const diff = new Date(data.countdown_target).getTime() - new Date().getTime();
      if (diff <= 0) { 
        setTimeLeft(null); 
        clearInterval(timer); 
        return; 
      }
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [data?.countdown_target]);

  const carouselImages = data?.carousel_images || ["https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=800"];
  const isExpired = !timeLeft && data?.countdown_target && new Date(data.countdown_target).getTime() < new Date().getTime();

  return (
    <section className={`relative py-12 md:py-36 transition-colors duration-700 ${theme === "dark" ? "bg-[#0B0B0B] text-white" : "bg-white text-zinc-900"}`}>
      <div className="container mx-auto px-4 md:px-8">
        
        {/* GRID UTAMA: Selalu 2 Kolom (Kiri-Kanan) bahkan di Mobile */}
        <div className="grid grid-cols-2 gap-4 md:gap-20 items-center">
          
          {/* SISI KIRI: KONTEN */}
          <div className="flex flex-col gap-3 md:gap-10">
            <div>
              <div className="flex items-center gap-2 mb-2 md:mb-6">
                <span className="w-6 md:w-12 h-px bg-[var(--color-primary-accent)]" />
                <span className="text-[6px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-[var(--color-primary-accent)]">
                  {data?.badge || "PRE-ORDER"}
                </span>
                {isExpired && (
                  <span className="px-2 py-0.5 bg-red-600 text-[6px] md:text-[8px] font-black rounded-full text-white">CLOSED</span>
                )}
              </div>
              
              <h2 className="text-xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.9]">
                {data?.headline || "CRITICAL BATCH."}
              </h2>
              
              <p className={`mt-2 md:mt-8 text-[8px] md:text-base font-medium leading-tight md:leading-relaxed transition-colors ${theme === "dark" ? "text-zinc-500" : "text-zinc-400"}`}>
                {data?.description || productData?.description || "Architected specifically for its owner."}
              </p>

              {/* Ukuran & Detail Tambahan */}
              <div className="mt-4 md:mt-10 space-y-4">
                {(data?.sizes || (productData?.sizes && productData.sizes.length > 0)) && (
                   <div className="space-y-1">
                      <p className="text-[6px] md:text-[10px] font-black uppercase text-zinc-500 tracking-widest">Available Sizes</p>
                      <p className="text-[8px] md:text-sm font-black italic">{data?.sizes || productData?.sizes?.join(", ")}</p>
                   </div>
                )}
                {(data?.details || (productData?.specifications && productData.specifications.length > 0)) && (
                   <div className="space-y-1">
                      <p className="text-[6px] md:text-[10px] font-black uppercase text-zinc-500 tracking-widest">Product Details</p>
                      <p className="text-[8px] md:text-sm font-medium leading-relaxed opacity-80 max-w-sm">
                        {data?.details || productData?.specifications?.map((s:any) => `${s.key}: ${s.value}`).join(" | ")}
                      </p>
                   </div>
                )}
              </div>

              {(data?.price || data?.price_override || productData?.price) && (
                <p className="mt-4 md:mt-12 text-lg md:text-4xl font-black italic text-fuchsia-500">
                  Rp {(data?.price || data?.price_override || productData?.price)?.toLocaleString()}
                </p>
              )}

            </div>

            {/* Deployment Card Mini */}
            <div className={`p-3 md:p-8 rounded-xl md:rounded-[2.5rem] border transition-colors ${theme === "dark" ? "bg-zinc-900/40 border-white/5" : "bg-zinc-50 border-zinc-100"}`}>
              <div className="flex items-center gap-2 md:gap-4">
                <FiClock className="text-[var(--color-primary-accent)] w-3 h-3 md:w-8 md:h-8" />
                <div>
                  <p className="text-[5px] md:text-[9px] font-black uppercase text-zinc-500">Shipping</p>
                  <p className="text-[10px] md:text-2xl font-black italic uppercase">{data?.estimation || "14 Days"}</p>
                </div>
              </div>
            </div>

            {/* Countdown Mini Berjejer */}
            {timeLeft && (
              <div className="flex gap-1 md:gap-4">
                {[{l: "D", v: timeLeft.d}, {l: "H", v: timeLeft.h}, {l: "M", v: timeLeft.m}, {l: "S", v: timeLeft.s}].map((u, i) => (
                  <div key={i} className={`flex-1 py-1 md:py-4 rounded-lg md:rounded-2xl text-center border transition-colors ${theme === "dark" ? "bg-zinc-900/60 border-white/5" : "bg-zinc-50 border-zinc-100"}`}>
                    <p className="text-[9px] md:text-3xl font-black italic tracking-tighter">{u.v.toString().padStart(2, "0")}</p>
                    <p className="text-[5px] md:text-[8px] font-black text-zinc-500">{u.l}</p>
                  </div>
                ))}
              </div>
            )}

            {isExpired ? (
              <Link
                href={`/preOrder/preorder`}
                className="inline-flex items-center justify-center gap-2 md:gap-6 py-3 md:py-6 rounded-full font-black uppercase tracking-widest text-[7px] md:text-[11px] bg-zinc-200 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
              >
                BATCH EXPIRED [VIEW INFO]
              </Link>
            ) : (
              <Link
                href={`/preOrder/preorder`}
                className="inline-flex items-center justify-center gap-2 md:gap-6 py-3 md:py-6 rounded-full font-black uppercase tracking-widest text-[7px] md:text-[11px] transition-colors bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-red-600 dark:hover:bg-red-600 hover:text-white"
              >
                {data?.cta || "PRE-ORDER NOW"}
                <FiArrowRight className="w-2 h-2 md:w-4 md:h-4" />
              </Link>
            )}

          </div>

          {/* SISI KANAN: GAMBAR */}
          <Link href={`/preOrder/preorder`} className="relative block group/img">
            <div className="relative aspect-[4/5] rounded-2xl md:rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={carouselImages[currentImageIndex]}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                  alt={`Preorder preview ${currentImageIndex}`}
                />
              </AnimatePresence>
              
              {/* Overlay Text Mini */}
              <div className="absolute bottom-3 left-3 right-3 md:bottom-10 md:left-10 flex flex-col items-start">
                <h3 className="text-[10px] md:text-4xl font-black italic text-white uppercase tracking-tighter leading-none">
                   BATCH IV
                </h3>
              </div>
              {isExpired && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-black italic text-2xl md:text-5xl border-4 border-white px-6 py-2 rotate-[-10deg] uppercase">CLOSED</span>
                </div>
              )}
            </div>
            {/* Ltd Edition Badge */}
            <div className="absolute -top-2 -right-2 md:-top-6 md:-right-6 px-2 py-1 md:px-6 md:py-4 bg-[#FF416C] text-white rounded-lg md:rounded-3xl font-black uppercase text-[5px] md:text-[10px] shadow-xl z-20">
              LTD EDITION
            </div>
          </Link>

        </div>
      </div>
    </section>
  );
}