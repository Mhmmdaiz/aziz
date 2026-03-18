"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";
import { useSettings } from "@/components/providers/SettingsProvider";

const defaultCategories = [
  { name: "Oversize", count: "12 Artifacts", img: "https://images.unsplash.com/photo-1571945153237-4929e783ee4a?q=80&w=800" },
  { name: "Graphic", count: "08 Artifacts", img: "https://images.unsplash.com/photo-1554568218-0f1715e72254?q=80&w=800" },
  { name: "Minimal", count: "05 Artifacts", img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800" },
  { name: "Dark Series", count: "07 Artifacts", img: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800" }
];

export default function CategoryGrid() {
  const { settings } = useSettings();
  const categories = settings?.landing_content?.categories || defaultCategories;
  return (
    <section className="py-24 bg-white dark:bg-[#0B0B0B] text-black dark:text-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative h-[400px] rounded-[3rem] overflow-hidden group cursor-pointer ${i % 3 === 0 ? 'md:col-span-1' : ''}`}
            >
              <img 
                src={cat.img} 
                className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[2s]" 
                alt={cat.name} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              <div className="absolute inset-0 p-12 flex flex-col justify-end gap-2 text-white">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 italic">{cat.count}</span>
                <h3 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
                  {cat.name}
                </h3>
                <Link 
                  href={`/shop?category=${cat.name}`}
                  className="mt-4 w-12 h-12 rounded-full bg-white text-black flex items-center justify-center -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500"
                >
                  <FiArrowUpRight size={20} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
