"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FiArrowRight, FiClock } from "react-icons/fi";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  image_url: string;
  category: string;
  read_time: string;
  slug: string;
}

interface JournalHeroProps {
  featuredArticle: Article | null;
}

export default function JournalHero({ featuredArticle }: JournalHeroProps) {
  if (!featuredArticle) return null;

  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[#FBFBFD] dark:bg-[#0B0B0B] transition-colors duration-500">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(185,28,28,0.05),transparent_50%)]" />
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col gap-12 lg:gap-20">
          {/* Header Text */}
          <div className="space-y-6">
            
            
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter leading-[0.8] text-zinc-900 dark:text-white transition-colors duration-500"
            >
              Stories<br />
              <span className="text-zinc-800">From the dark.</span>
            </motion.h1>
          </div>

          {/* Featured Article Box */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="group relative grid lg:grid-cols-2 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-3xl border border-black/5 dark:border-white/5 rounded-[3rem] overflow-hidden hover:border-red-500/20 transition-all duration-700 shadow-xl dark:shadow-2xl"
          >
            <div className="relative aspect-video lg:aspect-auto overflow-hidden">
              <img 
                src={featuredArticle.image_url?.split(',')[0]} 
                alt={featuredArticle.title}
                className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[2s] ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/80 dark:from-zinc-900/80 to-transparent lg:hidden" />
            </div>

            <div className="p-8 md:p-16 flex flex-col justify-center gap-8 relative">
              <div className="space-y-4">
                <span className="px-4 py-1.5 bg-red-600/10 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-red-500/20">
                  Featured_Artifact
                </span>
                <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-tight text-black dark:text-white group-hover:text-red-500 transition-colors duration-500">
                  {featuredArticle.title}
                </h2>
                <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-lg font-medium italic">
                  "{featuredArticle.excerpt}"
                </p>
              </div>

              <div className="flex items-center gap-8 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <FiClock className="text-red-500" />
                  {featuredArticle.read_time}
                </div>
                <div>{featuredArticle.category}</div>
              </div>

              <Link 
                href={`/journal/${featuredArticle.slug}`}
                className="group/btn self-start px-10 py-5 bg-black dark:bg-white text-white dark:text-black rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all transform hover:scale-105 active:scale-95 flex items-center gap-4"
              >
                Read_The_Story <FiArrowRight className="group-hover/btn:translate-x-2 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
