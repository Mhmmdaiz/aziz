"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";
import { useSettings } from "@/components/providers/SettingsProvider";

const defaultCategories = [
  { name: "Oversize", count: "12 Produk", img: "https://images.unsplash.com/photo-1571945153237-4929e783ee4a?q=80&w=800" },
  { name: "Graphic", count: "08 Produk", img: "https://images.unsplash.com/photo-1554568218-0f1715e72254?q=80&w=800" },
  { name: "Minimal", count: "05 Produk", img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800" },
  { name: "Dark Series", count: "07 Produk", img: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800" }
];

export default function CategoryGrid({ theme = "dark", data }: { theme?: "dark" | "light", data?: any }) {
  const { settings } = useSettings();
  const content = data || settings?.landing_content?.categories?.content || {};
  const categories = content.items || defaultCategories;

  return (
    <section className={`py-12 md:py-24 transition-colors duration-700 ${theme === "dark" ? "bg-[#0B0B0B] text-white" : "bg-white text-zinc-900"}`}>
      <div className="container mx-auto px-4 md:px-6">
        {/* Menggunakan grid-cols-2 secara permanen untuk efek kiri-kanan */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-8">
          {categories.map((cat: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              // Tinggi disesuaikan: h-[220px] di mobile agar tidak terlalu panjang
              className={`relative h-[220px] md:h-[500px] rounded-[1.5rem] md:rounded-[3rem] overflow-hidden group cursor-pointer border transition-colors ${theme === "dark" ? "border-white/5" : "border-zinc-200"}`}
            >
              <img 
                src={cat.image || cat.img} 
                className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition duration-[1.5s] ease-out" 
                alt={cat.title || cat.name} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              
              {/* Konten teks dengan ukuran yang disesuaikan skala mobile */}
              <div className="absolute inset-0 p-4 md:p-12 flex flex-col justify-end gap-1 md:gap-2 text-white">
                <span className="text-[6px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] opacity-60 italic">
                  {cat.count || "EXPLORE_COLLECTION"}
                </span>
                <h3 className="text-lg md:text-6xl font-black italic uppercase tracking-tighter leading-none">
                  {cat.title || cat.name}
                </h3>
                
                {/* Button Arrow: Diperkecil di mobile agar tidak menutupi teks */}
                <Link 
                  href={`/shop?category=${cat.slug || cat.name}`}
                  className="mt-2 md:mt-4 w-6 h-6 md:w-14 md:h-14 rounded-full bg-white text-black flex items-center justify-center -translate-x-2 md:-translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition duration-500 shadow-xl"
                >
                  <FiArrowUpRight className="w-3 h-3 md:w-6 md:h-6" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}