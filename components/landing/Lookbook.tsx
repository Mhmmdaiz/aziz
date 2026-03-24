"use client";

import { motion } from "framer-motion";
import { FiPlayCircle } from "react-icons/fi";
import { useSettings } from "@/components/providers/SettingsProvider";

export default function Lookbook({
  theme = "dark",
}: {
  theme?: "dark" | "light";
}) {
  const { settings } = useSettings();
  const lookbook = settings?.landing_content?.lookbook || {
    image_1:
      "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800",
    image_2:
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800",
  };

  return (
    <section
      className={`py-20 md:py-32 transition-colors duration-500 ${theme === "dark" ? "bg-[#0B0B0B] text-white" : "bg-white text-black"}`}
    >
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Layout: Stack di Mobile (col), Grid di Desktop (lg:grid-cols-12) */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          {/* SISI ATAS/KIRI: TEXT CONTENT */}
          <div className="w-full lg:col-span-5 space-y-6 md:space-y-10">
            <div className="space-y-3 md:space-y-4 text-center lg:text-left">
              <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-[var(--color-primary-accent)] italic block">
                Manifesto Visual
              </span>
              <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.85]">
                The Dark <br />
                <span
                  className={
                    theme === "dark" ? "text-zinc-800" : "text-zinc-200"
                  }
                >
                  Visions.
                </span>
              </h2>
            </div>

            <p className="text-zinc-500 text-xs md:text-lg italic leading-relaxed font-medium mx-auto lg:mx-0 max-w-xs md:max-w-md text-center lg:text-left">
              Every shadow tells a story of rebellion and refined silence.
              Architected for those who walk the void.
            </p>

            <div className="flex justify-center lg:justify-start">
              <button
                className={`flex items-center gap-3 md:gap-4 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] border-b-2 pb-2 hover:border-red-500 transition-all duration-500 group ${theme === "dark" ? "border-zinc-900" : "border-zinc-300"}`}
              >
                Watch Film{" "}
                <FiPlayCircle className="group-hover:scale-125 transition-transform" />
              </button>
            </div>
          </div>

          {/* SISI BAWAH/KANAN: IMAGES */}
          <div className="w-full lg:col-span-7 grid grid-cols-2 gap-3 md:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="aspect-[3/4.5] rounded-[1.5rem] md:rounded-[3rem] overflow-hidden bg-zinc-900 mt-6 md:mt-16 shadow-2xl"
            >
              <img
                src={lookbook.image_1}
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-105 hover:scale-100"
                alt="Lookbook 1"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="aspect-[3/4.5] rounded-[1.5rem] md:rounded-[3rem] overflow-hidden bg-zinc-900 shadow-2xl"
            >
              <img
                src={lookbook.image_2}
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-105 hover:scale-100"
                alt="Lookbook 2"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
