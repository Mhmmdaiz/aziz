"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { FiArrowRight, FiClock } from "react-icons/fi";

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

interface ArticleCardProps {
  article: Article;
  index: number;
}

export default function ArticleCard({ article, index }: ArticleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <Link href={`/journal/${article.slug}`}>
        <div className="space-y-6">
          {/* Image Container */}
          <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] bg-zinc-100 dark:bg-zinc-900 border border-black/5 dark:border-white/5">
            <Image 
              src={article.image_url?.split(',')[0]} 
              alt={article.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)]"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/80 dark:from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            {/* Date Badge */}
            <div className="absolute top-6 left-6 px-3 py-1 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md text-zinc-500 dark:text-zinc-400 text-[8px] font-black uppercase tracking-[0.2em] rounded-full border border-black/5 dark:border-white/5">
              {new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-4 px-2">
            <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] text-red-500 italic">
               <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
               {article.category}
            </div>
            
            <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter leading-tight text-zinc-900 dark:text-white group-hover:text-zinc-400 transition-colors">
              {article.title}
            </h3>
            
            <p className="text-zinc-600 text-xs font-medium leading-relaxed line-clamp-2 italic">
              "{article.excerpt}"
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
               <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-700 dark:text-zinc-500 uppercase tracking-widest">
                  <FiClock /> {article.read_time}
               </div>
               <div className="text-black dark:text-white opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-500">
                  <FiArrowRight />
               </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
