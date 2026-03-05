"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  FiArrowRight,
  FiShoppingBag,
  FiStar,
  FiInstagram,
  FiTwitter,
  FiMail,
} from "react-icons/fi";
import Link from "next/link";
import axios from "axios";

/** * KONFIGURASI
 */
const API_BASE_URL = "http://127.0.0.1:8000";

/** * HELPER: URL Gambar Laravel Storage
 */
const getStorageImg = (
  path: string | null,
  folder: "products" | "posts" = "products",
) => {
  if (!path) return "/placeholder-cloth.jpg";
  const fileName = path.replace(/^(public\/|storage\/|products\/|posts\/)/, "");
  return `${API_BASE_URL}/storage/${folder}/${fileName}`;
};

export default function FashionLandingPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [journals, setJournals] = useState<any[]>([]);
  const { scrollY } = useScroll();

  // Efek Paralaks Hero
  const yHero = useTransform(scrollY, [0, 500], [0, 80]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, journalRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/products`),
          axios.get(`${API_BASE_URL}/api/posts`),
        ]);

        const prodData = prodRes.data?.data?.data || prodRes.data?.data || [];
        const journalData =
          journalRes.data?.data?.data || journalRes.data?.data || [];

        setProducts(Array.isArray(prodData) ? prodData : []);
        setJournals(Array.isArray(journalData) ? journalData : []);
      } catch (err) {
        console.error("Failed to fetch landing data:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <main className="relative min-h-screen bg-white text-black pt-28 md:pt-40 overflow-x-hidden selection:bg-black selection:text-white">
      {/* 1. HERO SECTION (Fix Terpotong & Full Content) */}
      <section className="relative pb-16 md:pb-24 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 md:space-y-8 z-20 text-center lg:text-left"
          >
            <span className="inline-block px-4 py-2 bg-zinc-100 rounded-full text-[clamp(8px,2vw,10px)] font-black uppercase tracking-[0.3em] text-zinc-500 italic">
              Spring/Summer '26 Collection
            </span>

            {/* Perbaikan Leading: Jarak antar baris diperlebar agar font Italic tidak terpotong */}
            <h1 className="text-[clamp(2.5rem,8vw,6.5rem)] font-black leading-[1.1] md:leading-[0.95] tracking-tighter uppercase italic break-words py-2">
              Wear the <br />
              <span className="text-zinc-200">Archive</span>
              <span className="block md:inline-block"> _Statement.</span>
            </h1>

            <p className="text-zinc-500 text-base md:text-lg max-w-sm font-medium leading-relaxed mx-auto lg:mx-0">
              Curated garments designed for those who value architectural
              precision in every stitch.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
              <Link
                href="/shop"
                className="px-8 md:px-10 py-4 md:py-5 bg-black text-white rounded-full font-black uppercase text-[10px] md:text-[11px] tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-all group shadow-xl"
              >
                Shop Collection{" "}
                <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
              </Link>
              <button className="px-8 md:px-10 py-4 md:py-5 border-2 border-zinc-100 rounded-full font-black uppercase text-[10px] md:text-[11px] tracking-widest hover:bg-zinc-50 transition-all">
                Lookbook
              </button>
            </div>
          </motion.div>

          <motion.div
            style={{ y: yHero }}
            className="relative w-full max-w-[500px] lg:max-w-none mx-auto z-10"
          >
            <div className="aspect-[3/4] rounded-[clamp(2rem,10vw,4rem)] overflow-hidden shadow-2xl bg-zinc-100 relative group">
              <img
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000"
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                alt="Archive Model"
              />
            </div>

            {/* Testimonial Floating Badge */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-4 md:-left-8 lg:-left-12 bottom-10 md:bottom-20 bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl border border-zinc-50 max-w-[160px] md:max-w-[220px] hidden sm:block z-20"
            >
              <div className="flex text-yellow-500 mb-2 gap-1">
                <FiStar size={10} fill="currentColor" />
                <FiStar size={10} fill="currentColor" />
                <FiStar size={10} fill="currentColor" />
              </div>
              <p className="text-[9px] md:text-[10px] font-black uppercase italic tracking-tighter leading-tight">
                "The most architectural fit in my collection."
              </p>
              <p className="text-[7px] md:text-[8px] font-bold text-zinc-300 uppercase mt-2 tracking-widest">
                — Alex V.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. BRAND MARQUEE */}
      <section className="border-y border-zinc-100 py-6 md:py-10 mb-20 md:mb-32 opacity-30 overflow-hidden bg-white">
        <div className="flex gap-10 md:gap-20 whitespace-nowrap animate-marquee font-black italic text-xl md:text-2xl uppercase">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="flex gap-10 md:gap-20">
              <span className="flex items-center gap-4">
                Limited Edition{" "}
                <div className="w-2 h-2 bg-black rounded-full" />
              </span>
              <span className="flex items-center gap-4">
                Eco-Conscious <div className="w-2 h-2 bg-black rounded-full" />
              </span>
              <span className="flex items-center gap-4">
                Worldwide Shipping{" "}
                <div className="w-2 h-2 bg-black rounded-full" />
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. NEW ARRIVALS */}
      <section className="bg-black text-white py-20 md:py-32 lg:py-25  mx-2  overflow-hidden ml-0 mr-0">
        <div className="max-w-screen-xl mx-auto px-6 sm:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-24 gap-6">
            <h2 className="text-[clamp(2.5rem,7vw,5rem)] font-black italic uppercase tracking-tighter leading-none">
              Fresh <br /> <span className="text-zinc-700">Artifacts.</span>
            </h2>
            <Link
              href="/shop"
              className="px-6 md:px-8 py-3 md:py-4 border border-zinc-800 rounded-full font-black uppercase text-[9px] md:text-[10px] tracking-widest hover:bg-white hover:text-black transition-all"
            >
              Explore All Items
            </Link>
          </div>

          <div className="flex md:grid md:grid-cols-4 gap-6 md:gap-12 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-6">
            {products.slice(0, 6).map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="min-w-[280px] w-[75vw] md:w-auto snap-start group cursor-pointer"
              >
                <div className="aspect-[4/5] rounded-sm overflow-hidden bg-zinc-50 border border-zinc-100 relative group-hover:shadow-2xl group-hover:shadow-black/5 transition-all duration-500 ease-out">
                  <img
                    src={getStorageImg(
                      item.images?.[0]?.image_path,
                      "products",
                    )}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                    alt={item.name}
                  />
                  <div className="absolute top-4 right-4 md:top-8 md:right-8 p-3 md:p-4 bg-white text-black rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 shadow-xl">
                    <FiShoppingBag size={18} />
                  </div>
                </div>
                <div className="flex justify-between items-start px-2">
                  <div className="max-w-[70%]">
                    <h4 className="text-lg md:text-xl font-black italic uppercase tracking-tighter leading-none truncate">
                      {item.name}
                    </h4>
                    <p className="text-[9px] md:text-[10px] font-bold text-zinc-600 uppercase mt-2 tracking-[0.2em]">
                      Collector_Item
                    </p>
                  </div>
                  <p className="font-black italic text-base md:text-lg opacity-40">
                    {parseInt(item.price).toLocaleString("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. THE PROCESS */}
      <section className="py-24 md:py-32 lg:py-40 bg-white relative overflow-hidden">
        <div className="max-w-screen-xl mx-auto px-4 text-center mb-16 space-y-4">
          <span className="text-[9px] md:text-[10px] font-black uppercase text-zinc-300 tracking-[0.5em]">
            System_Integrity
          </span>
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black italic uppercase tracking-tighter">
            Conscious <span className="text-zinc-200">Creation.</span>
          </h2>
        </div>
        <div className="max-w-screen-xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { n: "01", t: "Source", d: "100% Organic Fabric", r: "-2deg" },
            { n: "02", t: "Cut", d: "Architectural Patterning", r: "3deg" },
            { n: "03", t: "Stitch", d: "Hand-finished Details", r: "-1deg" },
            { n: "04", t: "Package", d: "Zero-plastic Shipping", r: "2deg" },
          ].map((card, i) => (
            <motion.div
              key={i}
              whileInView={{ rotate: [0, parseInt(card.r)] }}
              viewport={{ once: true }}
              className="bg-zinc-50 p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-zinc-100 hover:shadow-xl transition-all group"
            >
              <span className="text-3xl md:text-4xl font-black italic text-zinc-200 mb-6 block group-hover:text-black transition-colors">
                {card.n}
              </span>
              <h4 className="text-xl md:text-2xl font-black italic uppercase mb-2 tracking-tighter">
                {card.t}
              </h4>
              <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-zinc-400">
                {card.d}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. DYNAMIC JOURNAL SECTION */}
      <section className="py-24 md:py-32 lg:py-40 bg-white border-t border-zinc-50 overflow-hidden">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 md:mb-24 gap-6">
            <div>
              <span className="text-[9px] md:text-[10px] font-black uppercase text-zinc-400 tracking-[0.5em] block mb-4">
                Journal_Notes
              </span>
              <h2 className="text-[clamp(2.5rem,7vw,5rem)] font-black italic uppercase tracking-tighter leading-none">
                The Archive <br />{" "}
                <span className="text-zinc-200">Journal.</span>
              </h2>
            </div>
            <Link
              href="/journal"
              className="px-6 md:px-8 py-3 md:py-4 border border-zinc-100 rounded-full font-black uppercase text-[9px] md:text-[10px] tracking-widest hover:bg-black hover:text-white transition-all"
            >
              View All Stories
            </Link>
          </div>

          {journals.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
              {/* Featured Post */}
              <div className="lg:col-span-7 group cursor-pointer">
                <Link href={`/journal/${journals[0].slug}`}>
                  <div className="aspect-[16/10] sm:aspect-[16/9] rounded-[2rem] md:rounded-[4rem] overflow-hidden bg-zinc-100 mb-8 relative">
                    <img
                      src={getStorageImg(journals[0].image, "posts")}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                      alt={journals[0].title}
                    />
                  </div>
                  <div className="space-y-4 max-w-2xl">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 italic">
                      Editorial_01 / {journals[0].category || "Material"}
                    </span>
                    <h3 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-tight">
                      {journals[0].title}
                    </h3>
                    <p className="text-zinc-500 text-sm md:text-base leading-relaxed line-clamp-2">
                      {journals[0].excerpt ||
                        journals[0].content
                          ?.replace(/<[^>]*>/g, "")
                          .substring(0, 160) + "..."}
                    </p>
                    <div className="pt-2">
                      <span className="text-[10px] font-black uppercase tracking-widest border-b-2 border-black pb-1 italic">
                        Read Story →
                      </span>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Sidebar Posts */}
              <div className="lg:col-span-5 flex flex-col gap-16 md:gap-20">
                {journals.slice(1, 3).map((item, i) => (
                  <Link
                    href={`/journal/${item.slug}`}
                    key={i}
                    className="group flex flex-col sm:flex-row lg:flex-col gap-6 cursor-pointer"
                  >
                    <div className="aspect-[4/3] sm:w-1/2 lg:w-full rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden bg-zinc-100 shrink-0">
                      <img
                        src={getStorageImg(item.image, "posts")}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        alt={item.title}
                      />
                    </div>
                    <div className="space-y-3">
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 italic">
                        {item.category || "Collection"}
                      </span>
                      <h4 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter leading-tight">
                        {item.title}
                      </h4>
                      <div className="pt-1">
                        <span className="text-[10px] font-black uppercase tracking-widest border-b border-black/20 pb-1 italic group-hover:border-black transition-all">
                          Read Story →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-zinc-300 font-black italic uppercase tracking-widest animate-pulse">
              Syncing Archive Records...
            </div>
          )}
        </div>
      </section>

      {/* 6. CTA & FOOTER (KEMBALI LENGKAP) */}
      <section className="px-4 md:px-6 mb-20">
        <div className="max-w-screen-xl mx-auto bg-zinc-950 p-10 sm:p-20 md:p-32 rounded-[2.5rem] md:rounded-[5.5rem] text-center space-y-8 relative overflow-hidden shadow-2xl">
          <h2 className="text-[clamp(2rem,8vw,5.5rem)] font-black italic uppercase tracking-tighter text-white leading-none relative z-10">
            Join the <br /> <span className="text-zinc-700">Archive_Club.</span>
          </h2>
          <div className="flex flex-col lg:flex-row gap-4 justify-center items-center relative z-10 w-full max-w-lg mx-auto">
            <input
              type="email"
              placeholder="YOUR@EMAIL.COM"
              className="px-6 py-4 bg-zinc-900 border border-zinc-800 rounded-full text-white font-black italic uppercase tracking-tighter w-full outline-none text-sm"
            />
            <button className="px-10 py-4 bg-white text-black rounded-full font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all w-full lg:w-auto">
              Subscribe
            </button>
          </div>
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-zinc-900 rounded-full blur-3xl opacity-50" />
        </div>
      </section>

      <footer className="pt-20 pb-10 px-6 bg-white border-t border-zinc-100">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="text-2xl font-black uppercase italic tracking-tighter">
              Archive.
            </div>
            <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed max-w-[240px]">
              Minimalist garments for the modern collector. Architecture in
              fabric form.
            </p>
          </div>
          {["Shop", "Policies", "Social"].map((title, i) => (
            <div key={i} className="space-y-4">
              <h5 className="text-[11px] font-black uppercase tracking-[0.3em]">
                {title}
              </h5>
              <ul className="space-y-3 opacity-40 text-[10px] font-black uppercase tracking-widest">
                <li>Contact</li>
                <li>Shipping</li>
                <li>Archives</li>
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6 pt-10 border-t border-zinc-50 opacity-20">
          <p className="text-[10px] font-black uppercase tracking-widest italic">
            © 2026 ARCHIVE_STORES. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-6">
            <FiInstagram size={18} className="cursor-pointer" />
            <FiTwitter size={18} className="cursor-pointer" />
            <FiMail size={18} className="cursor-pointer" />
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          display: flex;
          width: fit-content;
          animation: marquee 25s linear infinite;
        }
      `}</style>
    </main>
  );
}
