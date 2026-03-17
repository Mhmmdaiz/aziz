"use client";

import { supabase } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import { FiArrowRight, FiInstagram, FiTwitter } from "react-icons/fi";
import Link from "next/link";
import { FaTiktok } from "react-icons/fa";

const getImg = (path: string | null) => {
  if (!path)
    return "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200";
  return path;
};

// Animation Variants
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const fadeUp: any = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

export default function FashionLandingPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { scrollY } = useScroll();
  const yHero = useTransform(scrollY, [0, 800], [0, 150]);

  useEffect(() => {
    const fetchSupabaseData = async () => {
      try {
        const { data: prodData } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(6);

        const { data: postData } = await supabase
          .from("journals")
          .select("*")
          .eq("status", "published")
          .limit(3);

        if (prodData) setProducts(prodData);
        if (postData) setJournals(postData);
      } catch (err) {
        console.error("Supabase Sync Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSupabaseData();
  }, []);

  return (
    <main className="bg-white dark:bg-[#030303] text-zinc-900 dark:text-white overflow-x-hidden transition-colors duration-500 mesh-gradient relative">
      <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-[0.03] pointer-events-none" />
      
      {/* 1. HERO */}
      <section className="relative min-h-[95vh] flex items-center pt-24 pb-16 px-6 max-w-screen-xl mx-auto">
        {/* Atmosphere Glow */}
        <div className="absolute top-1/4 -left-1/4 w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 -right-1/4 w-[50%] h-[50%] bg-rose-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-16 w-full">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="w-full md:w-1/2 space-y-6 md:space-y-10 z-10"
          >
            <motion.span
              variants={fadeUp}
              className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-500 italic block"
            >
              SS/26_COLLECTION • ARCHIVE
            </motion.span>
            <motion.h1
              variants={fadeUp}
              className="text-[clamp(3.5rem,8vw,8rem)] font-black leading-[0.85] tracking-tighter uppercase italic"
            >
              Refine <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-indigo-300 block mt-2">
                The Norm.
              </span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-zinc-600 dark:text-zinc-400 max-w-[280px] md:max-w-md text-xs md:text-lg italic leading-relaxed"
            >
              Architectural precision in every stitch. Seamless design tailored
              for the modern silhouette.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                href="/shop"
                className="inline-flex items-center gap-3 px-8 py-4 md:px-12 md:py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black uppercase text-[10px] md:text-[12px] tracking-[0.2em] hover:scale-105 transition-all duration-500 shadow-2xl shadow-indigo-500/20 hover:shadow-indigo-500/40 active:scale-95 group"
              >
                Access Archive{" "}
                <FiArrowRight className="text-[14px] md:text-xl group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            style={{ y: yHero }}
            className="w-full md:w-1/2 h-[50vh] md:h-[80vh] rounded-[2rem] md:rounded-[5rem] overflow-hidden bg-zinc-100 dark:bg-zinc-900 shadow-2xl relative group"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <img
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200"
              className="w-full h-full object-cover grayscale opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 ease-out"
              alt="Hero Concept"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 dark:from-black/80 via-transparent to-transparent opacity-60"></div>
          </motion.div>
        </div>
      </section>

      {/* 2. MARQUEE */}
      <div className="border-y border-zinc-200 dark:border-zinc-800/50 py-6 md:py-12 bg-white dark:bg-[#050505] overflow-hidden transition-colors duration-300">
        <div className="flex gap-16 whitespace-nowrap animate-marquee font-black italic text-sm md:text-3xl uppercase text-black dark:text-zinc-100 opacity-50">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="flex gap-16 items-center">
              <span>Limited Edition</span>
              <span className="w-2 h-2 rounded-full bg-black dark:bg-white"></span>
              <span>Eco-Conscious</span>
              <span className="w-2 h-2 rounded-full bg-black dark:bg-white"></span>
              <span>Global Dispatch</span>
              <span className="w-2 h-2 rounded-full bg-black dark:bg-white"></span>
            </span>
          ))}
        </div>
      </div>

      {/* 3. NEW ARRIVALS */}
      <section className="py-20 md:py-32 bg-zinc-100 dark:bg-zinc-900/40 text-black dark:text-white rounded-[3rem] md:rounded-[5rem] -mt-10 relative z-20 transition-colors duration-500 shadow-2xl shadow-zinc-200/50 dark:shadow-none">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-500 italic block">
                Latest_Registry
              </span>
              <h2 className="text-4xl md:text-[5rem] leading-[0.9] font-black italic uppercase tracking-tighter text-zinc-900 dark:text-white">
                The <br /> New Season.
              </h2>
            </div>

            <Link
              href="/shop"
              className="group flex items-center gap-3 text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] border-b-2 border-zinc-200 dark:border-zinc-800 pb-2 hover:border-black dark:hover:border-white transition-all duration-500"
            >
              Explore Full Catalog
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <div className="flex flex-col items-center gap-6">
                <div className="w-10 h-10 border-4 border-indigo-100 dark:border-indigo-900 border-t-indigo-500 rounded-full animate-spin" />
                <span className="text-[10px] font-black tracking-[0.4em] uppercase italic animate-pulse text-indigo-400 dark:text-indigo-600">
                  Decrypting_Vault...
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-row overflow-x-auto no-scrollbar gap-6 md:gap-8 snap-x snap-mandatory py-6">
              {products.map((item, i) => (
                <Link
                  href={`/product/${item.id}`}
                  key={i}
                  className="min-w-[180px] md:min-w-[220px] max-w-[240px] snap-start group"
                >
                  <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-900 shadow-sm group-hover:shadow-2xl transition-all duration-700 relative">
                    <img
                      src={getImg(item.image_url)}
                      className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[1.5s]"
                      alt={item.name}
                    />
                    <div className="absolute top-6 left-6 px-3 py-1 bg-black/80 backdrop-blur-md rounded-full text-[7px] font-black text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      Quick_View
                    </div>
                  </div>

                  <div className="mt-5 px-1 text-left">
                    <h4 className="text-[11px] font-black italic uppercase tracking-tight truncate text-zinc-900 dark:text-white mb-1">
                      {item.name}
                    </h4>
                    <p className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-600">
                      IDR {Number(item.price || 0).toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. ESSENCE CTA */}
      <section className="py-32 md:py-52 bg-white dark:bg-[#050505] text-zinc-900 dark:text-white text-center px-6 transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="max-w-4xl mx-auto flex flex-col items-center"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-8 block">
            Craftsmanship
          </span>
          <h2 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.9] mb-12">
            Engineered for <br /> performance.{" "}
            <span className="text-zinc-300 dark:text-zinc-600 block">
              Styled for life.
            </span>
          </h2>
          <p className="text-zinc-400 max-w-xl text-sm md:text-lg italic leading-relaxed mb-12">
            Every garment is a carefully considered composition of texture,
            form, and utility. Created in collaboration with industry-leading
            textile laboratories to ensure longevity.
          </p>
          <Link
            href="/journal"
            className="px-8 py-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full font-black uppercase text-[10px] tracking-[0.2em] hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-300 text-zinc-900 dark:text-white"
          >
            Read the Manifesto
          </Link>
        </motion.div>
      </section>

      {/* 5. FOOTER */}
      <footer className="bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white pt-20 pb-10 px-6 border-t border-zinc-100 dark:border-zinc-900 transition-colors duration-300">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="md:col-span-2 space-y-6">
              <div className="text-3xl font-black tracking-tighter uppercase italic text-zinc-900 dark:text-white">
                CHCKT<span className="text-indigo-500">.</span>
              </div>
              <p className="text-zinc-500 max-w-sm text-xs md:text-sm font-medium leading-relaxed">
                Elevating everyday utility with precision engineering and
                avant-garde aesthetics. The definitive destination for technical
                fashion.
              </p>
            </div>

            <div className="space-y-6">
              <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">
                Navigation
              </h5>
              <div className="flex flex-col gap-3 text-xs md:text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                <Link
                  href="/shop"
                  className="hover:text-black dark:hover:text-white transition-colors"
                >
                  Shop All
                </Link>
                <Link
                  href="/journal"
                  className="hover:text-black dark:hover:text-white transition-colors"
                >
                  Journal
                </Link>
                <Link
                  href="/auth"
                  className="hover:text-black dark:hover:text-white transition-colors"
                >
                  Account
                </Link>
              </div>
            </div>

            <div className="space-y-6">
              <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">
                Connect
              </h5>
              <div className="flex gap-4 items-center">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-zinc-900 dark:bg-zinc-800 flex items-center justify-center text-white hover:bg-white dark:hover:bg-white hover:text-black dark:hover:text-black transition-all"
                >
                  <FiInstagram size={18} />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-zinc-900 dark:bg-zinc-800 flex items-center justify-center text-white hover:bg-white dark:hover:bg-white hover:text-black dark:hover:text-black transition-all"
                >
                  <FiTwitter size={18} />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-zinc-900 dark:bg-zinc-800 flex items-center justify-center text-white hover:bg-white dark:hover:bg-white hover:text-black dark:hover:text-black transition-all"
                >
                  <FaTiktok size={18} />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">
            <p>
              &copy; {new Date().getFullYear()} CHCKT.SYSTEM_ ALL RIGHTS
              RESERVED.
            </p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-zinc-400 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-zinc-400 transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
