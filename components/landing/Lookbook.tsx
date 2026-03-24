"use client";

import { motion } from "framer-motion";
import { FiPlayCircle } from "react-icons/fi";
import { useSettings } from "@/components/providers/SettingsProvider";

export default function Lookbook({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const { settings } = useSettings();
  const lookbook = settings?.landing_content?.lookbook || {
    image_1: "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800",
    image_2: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800"
  };

  return (
    <section className={`py-16 md:py-32 transition-colors duration-500 ${theme === "dark" ? "bg-[#0B0B0B] text-white" : "bg-white text-black"}`}>
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Force Grid 2 Kolom di Mobile & Desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-4 md:gap-12 items-center">
          
          {/* SISI KIRI: TEXT CONTENT */}
          <div className="lg:col-span-5 space-y-4 md:space-y-10">
            <div className="space-y-2 md:space-y-4">
              <span className="text-[7px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-[var(--color-primary-accent)] italic block">
                Manifesto Visual
              </span>
              <h2 className="text-xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.9]">
                The Dark <br /> 
                <span className={theme === "dark" ? "text-zinc-800" : "text-zinc-100"}>Visions.</span>
              </h2>
            </div>
            
            <p className="text-zinc-500 text-[9px] md:text-lg italic leading-tight md:leading-relaxed font-medium max-w-[140px] md:max-w-md">
              Every shadow tells a story of rebellion and refined silence.
            </p>

            <button className={`flex items-center gap-2 md:gap-4 text-[7px] md:text-[10px] font-black uppercase tracking-[0.2em] border-b md:border-b-2 pb-1 md:pb-2 hover:border-red-500 transition-all duration-500 group ${theme === "dark" ? "border-zinc-900" : "border-zinc-300"}`}>
              Watch Film <FiPlayCircle className="group-hover:scale-125 transition-transform" />
            </button>
          </div>

          {/* SISI KANAN: IMAGES */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-2 md:gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="aspect-[3/5] rounded-[1rem] md:rounded-[2.5rem] overflow-hidden bg-zinc-900 mt-4 md:mt-12"
            >
              <img 
                src={lookbook.image_1} 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" 
                alt="Lookbook 1"
              />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: -15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="aspect-[3/5] rounded-[1rem] md:rounded-[2.5rem] overflow-hidden bg-zinc-900"
            >
              <img 
                src={lookbook.image_2} 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" 
                alt="Lookbook 2"
              />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}