"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/utils/supabase/client";
import { FiArrowUpRight, FiClock } from "react-icons/fi";

// --- SKELETON LOADING ---
const JournalSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="aspect-video bg-zinc-100 dark:bg-zinc-900 rounded-3xl" />
    <div className="space-y-3">
      <div className="h-4 bg-zinc-100 dark:bg-zinc-900 rounded w-1/4" />
      <div className="h-8 bg-zinc-100 dark:bg-zinc-900 rounded w-full" />
    </div>
  </div>
);

export default function JournalPage() {
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchJournals = async () => {
      try {
        setLoading(true);
        setError(false);

        // --- FETCH DARI SUPABASE ---
        const { data, error: supabaseError } = await supabase
          .from("journals")
          .select("*")
          .eq("status", "published")
          .order("created_at", { ascending: false });

        if (supabaseError) throw supabaseError;
        setJournals(data || []);
      } catch (e: any) {
        console.error("JOURNAL_FETCH_ERROR:", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchJournals();
  }, []);

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white selection:bg-blue-100 dark:selection:bg-blue-900 pb-20 transition-colors duration-300">
      <div className="max-w-screen-xl mx-auto px-6 md:px-12 pt-32 md:pt-44">
        {/* HEADER SECTION */}
        <header className="mb-20 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-600">
              The_Archive_Journal
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.8]"
          >
            Editorial<span className="text-blue-600 dark:text-blue-400">.</span>
          </motion.h1>
        </header>

        {/* CONTENT GRID */}
        {loading ? (
          <div className="grid md:grid-cols-2 gap-12">
            {[...Array(4)].map((_, i) => (
              <JournalSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="py-20 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-[3rem]">
            <p className="text-[10px] font-black uppercase tracking-widest text-red-500 dark:text-red-400">
              Failed_to_retrieve_editorial_archive
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-24">
            {journals.map((post, idx) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group cursor-pointer"
              >
                <Link href={`/journal/${post.slug}`}>
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                    <img
                      src={post.cover_image || "/next.svg"}
                      alt={post.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-6 right-6 p-4 bg-white/50 dark:bg-black/50 backdrop-blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-all text-zinc-900 dark:text-white">
                      <FiArrowUpRight size={20} />
                    </div>
                  </div>

                  <div className="mt-8 space-y-4">
                    <div className="flex items-center gap-6 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">
                      <span>{post.category || "General"}</span>
                      <div className="flex items-center gap-2">
                        <FiClock />
                        <span>
                          {post.created_at ? new Date(post.created_at).toLocaleDateString(
                            "id-ID",
                            { month: "short", day: "numeric", year: "numeric" },
                          ) : "Recently"}
                        </span>
                      </div>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter leading-none group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </h2>

                    <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 font-medium max-w-md">
                      {post.excerpt || post.content?.replace(/<[^>]*>?/gm, "").slice(0, 150) + "..."}
                    </p>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && journals.length === 0 && (
          <div className="py-40 text-center italic font-black text-zinc-200 dark:text-zinc-800 uppercase tracking-[1em]">
            Archive_Empty
          </div>
        )}
      </div>
    </main>
  );
}
