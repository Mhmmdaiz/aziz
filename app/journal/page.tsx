"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  FiArrowLeft,
  FiBookOpen,
  FiLoader,
  FiAlertCircle,
  FiArrowUpRight,
} from "react-icons/fi";

const BASE_URL = "http://127.0.0.1:8000";

/**
 * Helper: Normalisasi URL Image dari Laravel Storage
 */
const getStorageImg = (path: string | null) => {
  if (!path) return "/placeholder-journal.jpg";
  if (path.startsWith("http")) return path;
  const fileName = path.replace(/^(public\/|storage\/|posts\/)/, "");
  return `${BASE_URL}/storage/posts/${fileName}`;
};

export default function JournalPage() {
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchJournals = async () => {
      try {
        setError(false);
        const res = await axios.get(`${BASE_URL}/api/posts`);
        const data = res.data?.data?.data || res.data?.data || res.data;
        setJournals(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Sync Error:", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchJournals();
  }, []);

  return (
    <main className="min-h-screen bg-white text-black selection:bg-black selection:text-white overflow-x-hidden">
      <header className="pt-32 pb-16 md:pt-48 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-screen-xl mx-auto">
        <div className="space-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 block">
            Editorial_Narratives
          </span>
          <h1 className="text-[clamp(3.5rem,12vw,9rem)] font-black italic uppercase tracking-tighter leading-[0.85] text-black">
            Journal<span className="text-blue-600">.</span>
          </h1>
        </div>
      </header>

      {/* 2. CONTENT AREA */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 pb-32">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <FiLoader className="animate-spin text-zinc-200" size={32} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-20">
              Syncing_Records...
            </span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-zinc-100 rounded-[3rem]">
            <FiAlertCircle size={40} className="text-zinc-200 mb-6" />
            <h3 className="font-black uppercase italic tracking-widest text-sm mb-2">
              Network_Disconnect
            </h3>
            <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">
              Verify Laravel Server at Port 8000
            </p>
          </div>
        ) : (
          <>
            {/* ========================= */}
            {/* MOBILE / TABLET / LAPTOP */}
            {/* ========================= */}
            <div className="lg:hidden">
              <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-6">
                <AnimatePresence>
                  {journals.map((post, i) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, x: 60 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, delay: i * 0.05 }}
                      className="min-w-[75%] sm:min-w-[45%] md:min-w-[35%] snap-start group"
                    >
                      <Link
                        href={`/journal/${post.slug || post.id}`}
                        className="block space-y-6"
                      >
                        {/* IMAGE */}
                        <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-zinc-100 shadow-sm group-hover:shadow-xl transition-all duration-700">
                          <img
                            src={getStorageImg(post.image)}
                            alt={post.title}
                            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:rotate-[0.5deg]"
                            onError={(e: any) =>
                              (e.target.src =
                                "https://via.placeholder.com/1200x800")
                            }
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-700" />
                        </div>

                        {/* TEXT */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-600 italic">
                              Vol. {post.id < 10 ? `0${post.id}` : post.id}
                            </span>

                            <span className="text-[9px] uppercase text-zinc-400">
                              {new Date(post.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </div>

                          <h2 className="text-xl font-black uppercase tracking-tight group-hover:italic transition-all">
                            {post.title}
                          </h2>

                          <p className="text-zinc-500 text-xs line-clamp-2 uppercase">
                            {post.excerpt ||
                              post.content
                                ?.replace(/<[^>]*>/g, "")
                                .substring(0, 120)}
                            ...
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* ========================= */}
            {/* DESKTOP EDITORIAL LAYOUT */}
            {/* ========================= */}
            <div className="hidden lg:grid grid-cols-12 gap-y-28 gap-x-16">
              <AnimatePresence>
                {journals.map((post, i) => {
                  const isFeatured = i % 4 === 0;

                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: (i % 4) * 0.08 }}
                      className={isFeatured ? "col-span-8" : "col-span-4"}
                    >
                      <Link
                        href={`/journal/${post.slug || post.id}`}
                        className="group block space-y-8"
                      >
                        {/* IMAGE */}
                        <div
                          className={`relative overflow-hidden rounded-[3rem] bg-zinc-100 transition-all duration-700 group-hover:shadow-2xl ${
                            isFeatured ? "aspect-[21/9]" : "aspect-[4/5]"
                          }`}
                        >
                          <img
                            src={getStorageImg(post.image)}
                            alt={post.title}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                            onError={(e: any) =>
                              (e.target.src =
                                "https://via.placeholder.com/1200x800")
                            }
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-700" />
                        </div>

                        {/* TEXT */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 italic">
                              Vol. {post.id < 10 ? `0${post.id}` : post.id}
                            </span>

                            <div className="h-[1px] w-8 bg-zinc-200" />

                            <span className="text-[10px] uppercase text-zinc-400">
                              {new Date(post.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </div>

                          <h2
                            className={`font-black uppercase tracking-tighter leading-[0.9] transition-all duration-500 group-hover:italic ${
                              isFeatured ? "text-5xl" : "text-2xl"
                            }`}
                          >
                            {post.title}
                          </h2>

                          <p className="text-zinc-500 text-sm leading-relaxed line-clamp-3 uppercase opacity-70">
                            {post.excerpt ||
                              post.content
                                ?.replace(/<[^>]*>/g, "")
                                .substring(0, 160)}
                            ...
                          </p>

                          <span className="text-[10px] font-black uppercase tracking-widest border-b-2 border-transparent group-hover:border-blue-600 pb-1 transition-all italic">
                            Explore Entry →
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      {/* FOOTER SUBTLE */}
      <footer className="py-20 border-t border-zinc-50 text-center">
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-300 italic">
          © 2026 Archive_Stores / Global_Editorial
        </p>
      </footer>

      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 4px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #000;
          border-radius: 10px;
        }
      `}</style>
    </main>
  );
}
