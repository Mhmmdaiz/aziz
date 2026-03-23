"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/utils/supabase/client";
import JournalHero from "@/components/journal/JournalHero";
import ArticleCard from "@/components/journal/ArticleCard";
import CategoryFilter from "@/components/journal/CategoryFilter";
import { Toaster } from "react-hot-toast";

const CATEGORIES = [
  "All",
  "Style",
  "Culture",
  "Horror Inspiration",
  "Behind The Design",
];

// Fallback data if table is empty or while developing
const MOCK_ARTICLES = [
  {
    id: "1",
    title: "Shadows in the Threads: The Brutalist Aesthetic",
    excerpt:
      "Exploring the intersection of raw architecture and streetwear silhouettes in our latest dark drop.",
    image_url:
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop",
    category: "Style",
    read_time: "5 min read",
    slug: "shadows-threads-brutalist",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Visions of Nihilism: Street Culture 2026",
    excerpt:
      "The shift from neon brightness to archival darkness in the modern city center.",
    image_url:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
    category: "Culture",
    read_time: "8 min read",
    slug: "visions-nihilism-2026",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "3",
    title: "Unseen Horror: Influences Behind Daemonium",
    excerpt:
      "How classic gothic literature shaped the typographic choices of our 'Phantom' series.",
    image_url:
      "https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=2076&auto=format&fit=crop",
    category: "Horror Inspiration",
    read_time: "4 min read",
    slug: "unseen-horror-influences",
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

export default function JournalPage() {
  const [articles, setArticles] = useState<any[]>([]);
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

    if (error || !data || data.length === 0) {
      console.log("Using mock articles for development");
      setArticles(MOCK_ARTICLES);
    } else {
      setArticles(data);
    }
    setLoading(false);
  };

  const filteredArticles =
    activeCategory === "All"
      ? articles
      : articles.filter((a) => a.category === activeCategory);

  const featured = articles[0] || MOCK_ARTICLES[0];
  const gridArticles = filteredArticles
    .filter((a) => a.id !== featured.id)
    .slice(0, visibleCount);

  return (
    <main className="min-h-screen bg-[#FBFBFD] dark:bg-[#0B0B0B] pb-32 transition-colors duration-500">
      <Toaster position="bottom-right" />

      {/* Editorial Hero */}
      <JournalHero featuredArticle={featured} />

      <div className="container mx-auto px-6 mt-20">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-20">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-6 animate-pulse">
                <div className="aspect-[16/10] bg-zinc-200 dark:bg-zinc-900 rounded-[2rem]" />
                <div className="h-4 bg-zinc-200 dark:bg-zinc-900 rounded-full w-2/3" />
                <div className="h-3 bg-zinc-200 dark:bg-zinc-900 rounded-full w-1/2" />
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
          <div className="py-40 text-center space-y-8">
            <div className="text-9xl font-black italic opacity-5 uppercase tracking-tighter text-black dark:text-white">
              Null Data
            </div>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.5em]">
              No stories found in this timeline.
            </p>
            <button
              onClick={() => setActiveCategory("All")}
              className="px-12 py-5 bg-black dark:bg-white text-white dark:text-black rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all shadow-xl"
            >
              Reset Timeline
            </button>
          </div>
        )}

        {/* Load More */}
        {filteredArticles.length > gridArticles.length + 1 && (
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
