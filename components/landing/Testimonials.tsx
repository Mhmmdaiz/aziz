"use client";

import { motion } from "framer-motion";
import { FiStar } from "react-icons/fi";
import { FaQuoteLeft } from "react-icons/fa";

const testimonials = [
  { 
    name: "ALEX_K", 
    role: "Collector", 
    text: "The fabric weight is insane. It's the first streetwear brand that actually feels architectural.",
    rating: 5
  },
  { 
    name: "SARAH_V", 
    role: "Designer", 
    text: "Minimalist but devastating. The fit is exactly what I've been searching for years.",
    rating: 5
  },
  { 
    name: "JASON_M", 
    role: "Regular", 
    text: "Quick shipping, even better packaging. Daemonium is the new standard for the underground.",
    rating: 5
  }
];

export default function Testimonials() {
  return (
    <section className="py-32 bg-zinc-50 dark:bg-[#050505] text-black dark:text-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-24 space-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 italic block">Voice_of_the_archive</span>
          <h2 className="text-4xl md:text-[5rem] font-black italic uppercase tracking-tighter leading-none mb-12">
            The Verified.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-12 rounded-[3.5rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 shadow-2xl shadow-zinc-200/50 dark:shadow-none relative overflow-hidden group"
            >
              <FaQuoteLeft className="absolute top-10 right-10 text-6xl text-zinc-100 dark:text-white/5 group-hover:text-red-500/10 transition-colors" />
              
              <div className="flex text-yellow-500 gap-1 mb-6">
                {[...Array(t.rating)].map((_, i) => <FiStar key={i} size={14} fill="currentColor" />)}
              </div>
              
              <p className="text-lg md:text-xl font-bold italic leading-relaxed text-zinc-600 dark:text-zinc-400 mb-10 relative z-10">
                 "{t.text}"
              </p>

              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">{t.name}</span>
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest italic">{t.role}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
