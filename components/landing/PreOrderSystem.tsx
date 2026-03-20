"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  FiClock,
  FiTool,
  FiTruck,
  FiShield,
  FiArrowRight,
  FiZap,
} from "react-icons/fi";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { useSettings } from "@/components/providers/SettingsProvider";

interface PreOrderProps {
  data?: {
    badge?: string;
    headline?: string;
    description?: string;
    estimation?: string;
    urgency?: string;
    cta?: string;
    image_url?: string;
    product_id?: string;
    countdown_target?: string;
    featured_badge?: string;
    cta_secondary?: string;
    steps?: Array<{ title: string; desc: string }>;
  };
}

export default function PreOrderSystem({ data: propData, theme = "dark" }: PreOrderProps & { theme?: "dark" | "light" }) {
  const { settings } = useSettings();
  const dbData = settings?.preorder;
  const data = propData || dbData;

  // Countdown Logic
  const [timeLeft, setTimeLeft] = useState<{
    d: number;
    h: number;
    m: number;
    s: number;
  } | null>(null);

  useEffect(() => {
    if (!data?.countdown_target) return;

    const calculate = () => {
      const target = new Date(data.countdown_target!).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft(null);
        return false;
      }

      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((diff % (1000 * 60)) / 1000),
      });
      return true;
    };

    calculate();
    const timer = setInterval(() => {
      if (!calculate()) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [data?.countdown_target]);

  // Product Detail Fetch
  const [productData, setProductData] = useState<any>(null);
  const [productLoading, setProductLoading] = useState(false);

  useEffect(() => {
    if (!data?.product_id) return;

    const fetchProduct = async () => {
      setProductLoading(true);
      const { data: product } = await supabase
        .from("products")
        .select("*")
        .eq("id", data.product_id)
        .single();

      if (product) setProductData(product);
      setProductLoading(false);
    };

    fetchProduct();

    const channel = supabase
      .channel(`product_${data.product_id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
          filter: `id=eq.${data.product_id}`,
        },
        (payload) => {
          setProductData(payload.new);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [data?.product_id]);

  // Carousel Logic
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const carouselImages = data?.carousel_images || [
    "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=800",
    "https://images.unsplash.com/photo-1618335829737-2228ad3088bc?q=80&w=800"
  ];

  useEffect(() => {
    if (carouselImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  return (
    <section className={`relative py-24 md:py-36 overflow-hidden transition-colors duration-500 selection:bg-[var(--color-primary-accent)] ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}>
      {/* Background Accents */}
      <div className={`absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-primary-accent)] blur-[120px] rounded-full -mr-64 -mt-32 transition-opacity duration-1000 ${theme === "dark" ? "opacity-5" : "opacity-10"}`} />
      <div className={`absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--color-secondary-accent)] blur-[100px] rounded-full -ml-32 -mb-32 transition-opacity duration-1000 ${theme === "dark" ? "opacity-5" : "opacity-10"}`} />

      <div className="max-w-screen-xl mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
          {/* Left Side: Copywriting & Logic */}
          <div className="space-y-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="w-12 h-px bg-[var(--color-primary-accent)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--color-primary-accent)]">
                  {data?.badge || "PROTOCOL V4: PRE-ORDER SYSTEM"}
                </span>
              </div>
              <h2 className={`text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.85] overflow-hidden ${theme === "dark" ? "text-white" : "text-black"}`}>
                {data?.headline || "CRITICAL BATCH: THE PO LOGIC."}
              </h2>
              <p className={`mt-8 text-sm md:text-base font-medium leading-relaxed max-w-md ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}>
                {data?.description ||
                  "We reject mass-production. Every piece is architected specifically for its owner. This protocol ensures absolute quality and exclusivity while eliminating global waste."}
              </p>
            </motion.div>

            {/* Timeline Indicator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className={`p-8 rounded-[2.5rem] border backdrop-blur-xl relative group overflow-hidden transition-all duration-500 ${theme === "dark" ? "bg-zinc-900/40 border-white/5" : "bg-zinc-50 border-zinc-100 shadow-sm"}`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary-accent)]/5 to-[var(--color-secondary-accent)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="flex items-center gap-6 relative z-10">
                <div className={`p-4 rounded-2xl text-[var(--color-primary-accent)] ${theme === "dark" ? "bg-white/5" : "bg-white shadow-inner"}`}>
                  <FiClock size={28} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-1">
                    Estimated Deployment
                  </p>
                  <p className={`text-2xl font-black italic uppercase tracking-tighter ${theme === "dark" ? "text-white" : "text-black"}`}>
                    {data?.estimation || "14 Days to Arrival"}
                  </p>
                </div>
              </div>
              <div className={`mt-6 pt-6 border-t relative z-10 ${theme === "dark" ? "border-white/5" : "border-zinc-100"}`}>
                <p className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  {data?.urgency || "Batch 04: 12 Slots Remaining"}
                </p>
              </div>
            </motion.div>

            {/* COUNTDOWN TIMER */}
            {timeLeft && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="flex gap-4"
              >
                {[
                  { label: "Days", val: timeLeft.d },
                  { label: "Hrs", val: timeLeft.h },
                  { label: "Min", val: timeLeft.m },
                  { label: "Sec", val: timeLeft.s },
                ].map((unit, i) => (
                  <div
                    key={i}
                    className={`flex-1 p-4 rounded-2xl text-center backdrop-blur-md border transition-all duration-500 ${theme === "dark" ? "bg-zinc-900/60 border-white/5" : "bg-white border-zinc-100 shadow-sm"}`}
                  >
                    <p className={`text-2xl md:text-3xl font-black italic tracking-tighter leading-none ${theme === "dark" ? "text-white" : "text-black"}`}>
                      {unit.val.toString().padStart(2, "0")}
                    </p>
                    <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mt-1">
                      {unit.label}
                    </p>
                  </div>
                ))}
              </motion.div>
            )}

            <div className="pt-4 flex flex-col gap-6">
              <Link
                href={`/preOrder/${settings?.preorder_id || "default"}`}
                onClick={() =>
                  localStorage.setItem("is_preorder_session", "true")
                }
                className={`group relative inline-flex items-center justify-center gap-6 px-10 py-6 rounded-full font-black uppercase tracking-[0.4em] text-[11px] transition-all active:scale-95 shadow-2xl ${theme === "dark" ? "bg-white text-black hover:bg-[var(--color-primary-accent)] hover:text-white shadow-white/5" : "bg-black text-white hover:bg-[var(--color-primary-accent)] shadow-black/10"}`}
              >
                {data?.cta || "Amankan Slot Kamu"}
                <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Side: Product Visual (Carousel) */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 1 }}
              className="relative group cursor-pointer"
            >
              <Link
                href={`/preOrder/${settings?.preorder_id || "default"}`}
                onClick={() =>
                  localStorage.setItem("is_preorder_session", "true")
                }
                className="block"
              >
                <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden border border-white/10 group-hover:border-[var(--color-primary-accent)]/50 transition-all duration-700 shadow-3xl bg-zinc-950">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentImageIndex}
                      src={carouselImages[currentImageIndex]}
                      alt="Pre-Order Item"
                      initial={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0"
                    />
                  </AnimatePresence>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                  {/* Dot Indicators */}
                  {carouselImages.length > 1 && (
                    <div className="absolute top-8 right-10 flex gap-2">
                      {carouselImages.map((_: string, i: number) => (
                        <div 
                          key={i} 
                          className={`h-1 rounded-full transition-all duration-500 ${i === currentImageIndex ? "w-8 bg-[var(--color-primary-accent)]" : "w-2 bg-white/20"}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Product Details Overlay */}
                  <div className="absolute bottom-10 left-10 right-10 flex flex-col items-start gap-1">
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-1"
                    >
                      {data?.featured_badge || "Featured Artifact"}
                    </motion.span>
                    <h3 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter leading-none mb-2">
                      {productLoading
                        ? "Scanning Archive..."
                        : productData?.name || data?.headline || "The Void"}
                    </h3>
                    <div className="flex items-center gap-4 overflow-hidden">
                      <p className="text-[9px] font-black uppercase tracking-widest text-[var(--color-primary-accent)] bg-[var(--color-primary-accent)]/10 px-3 py-1.5 rounded-full border border-[var(--color-primary-accent)]/20">
                        {productData?.price
                          ? `IDR ${Number(productData.price).toLocaleString()}`
                          : "PRICE PROTOCOL UNDEFINED"}
                      </p>
                      <FiArrowRight className="text-white group-hover:translate-x-2 transition-transform duration-500" />
                    </div>
                  </div>

                  {/* View Details Label (Centered on Hover) */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-black/20 backdrop-blur-[2px]">
                    <span className="px-8 py-3 bg-white text-black rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
                      {data?.cta_secondary || "View Details"}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Decorative Floating Label */}
            <div className="absolute -top-6 -right-6 p-6 bg-[var(--color-primary-accent)] text-white rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-[var(--color-primary-accent)]/20 z-20 hidden md:block animate-bounce-slow">
              Ltd Edition
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
