"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/utils/supabase/client";
import JournalHero from "@/components/journal/JournalHero";
import ArticleCard from "@/components/journal/ArticleCard";
import CategoryFilter from "@/components/journal/CategoryFilter";
import { Toaster } from "react-hot-toast";

// 1. Tipe Data Eksplisit (Standar Profesional)
interface Article {
  id: string;
  title: string;
  excerpt: string;
  image_url: string;
  category: string;
  read_time: string;
  slug: string;
  created_at: string;
}

const CATEGORIES = [
  "All",
  "Style",
  "Culture",
  "Horror Inspiration",
  "Behind The Design",
];

export default function JournalPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    fetchArticles();

    // Subscribe to journal updates
    const channel = supabase
      .channel("journal_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "articles" },
        () => fetchArticles(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching articles:", error);
      setArticles([]);
    } else {
      setArticles(data as Article[] || []);
    }
    setLoading(false);
  };

  const filteredArticles =
    activeCategory === "All"
      ? articles
      : articles.filter((a) => a.category === activeCategory);

  const featured = articles.length > 0 ? articles[0] : null;

  // Pastikan grid tidak memunculkan artikel featured
  const gridArticles = featured
    ? filteredArticles.filter((a) => a.id !== featured.id).slice(0, visibleCount)
    : filteredArticles.slice(0, visibleCount);

  return (
    <main className="min-h-screen bg-[#FBFBFD] dark:bg-[#0B0B0B] pb-32 transition-colors duration-500">
      <Toaster position="bottom-right" />

      {/* Editorial Hero. Hanya muncul jika featured ada */}
      {featured && <JournalHero featuredArticle={featured} />}

      <div className={`container mx-auto px-6 ${featured ? 'mt-20' : 'pt-40'}`}>
        {/* Filter Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-12 mb-20">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-zinc-900 dark:text-white transition-colors duration-500">
              Archive Registry<span className="text-red-600">.</span>
            </h2>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.4em]">
              Selected artifacts from the void
            </p>
          </div>

          <div className="lg:w-1/2">
            <CategoryFilter
              categories={CATEGORIES}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
            />
          </div>
        </div>

        {/* Article Grid */}
        {loading ? (
          // Skeleton Loader: aspect proporsi ke 4/5 disamakan dengan ArticleCard aslinya
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-20">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-6">
                <div className="aspect-[4/5] bg-zinc-200/50 dark:bg-zinc-900/50 rounded-[2rem] animate-pulse" />
                <div className="space-y-3">
                  <div className="h-5 bg-zinc-200/50 dark:bg-zinc-900/50 rounded-md w-3/4 animate-pulse" />
                  <div className="h-3 bg-zinc-200/50 dark:bg-zinc-900/50 rounded-md w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : gridArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-20">
            <AnimatePresence mode="popLayout">
              {gridArticles.map((article, idx) => (
                <ArticleCard key={article.id} article={article} index={idx} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          // Empty State Premium
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-32 flex flex-col items-center justify-center space-y-8 border-2 border-dashed border-zinc-200 dark:border-white/5 rounded-[3rem] mx-4 lg:mx-0"
          >
            <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4 border border-zinc-200 dark:border-white/10 shadow-inner">
              <span className="text-3xl font-black text-zinc-300 dark:text-zinc-700 uppercase italic">∅</span>
            </div>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.5em] text-center max-w-sm px-6">
              The archive is currently empty. No artifacts found in this timeline.
            </p>
            {activeCategory !== "All" && (
              <button
                onClick={() => setActiveCategory("All")}
                className="group relative px-10 py-5 border-2 border-zinc-200 dark:border-zinc-800 rounded-full overflow-hidden transition-all hover:border-black dark:hover:border-white"
              >
                 <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 group-hover:text-white dark:group-hover:text-black transition-colors duration-500">
                  Reset Timeline
                 </span>
                 <div className="absolute inset-0 bg-black dark:bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </button>
            )}
          </motion.div>
        )}

        {/* Load More */}
        {filteredArticles.filter((a) => a.id !== featured?.id).length > gridArticles.length && (
          <div className="mt-32 flex justify-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + 3)}
              className="group relative px-16 py-6 border-2 border-zinc-200 dark:border-zinc-800 rounded-full overflow-hidden transition-all hover:border-black dark:hover:border-white"
            >
              <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 group-hover:text-white dark:group-hover:text-black transition-colors duration-500">
                Load More Registry
              </span>
              <div className="absolute inset-0 bg-black dark:bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
