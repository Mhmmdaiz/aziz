"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useSettings } from "@/components/providers/SettingsProvider";

export default function Hero({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const { settings } = useSettings();
  
  // Mengambil gambar dari CMS atau fallback ke default
  const images = settings?.landing_content?.hero?.image_urls?.length > 0 
    ? settings?.landing_content?.hero?.image_urls 
    : ["https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2000"];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Timer untuk auto-slide
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Efek parallax saat scroll
  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);

  return (
    <section ref={ref} className={`relative h-screen w-full overflow-hidden transition-colors duration-700 ${theme === "dark" ? "bg-[#0B0B0B] text-white" : "bg-white text-zinc-900"}`}>
      {/* Background Slider Container */}
      <motion.div style={{ y: y1 }} className="absolute inset-0 z-0">
        {/* Overlay Gelap agar transisi lebih smooth */}
        <div className="absolute inset-0 bg-black/20 z-10" />
        
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ 
                duration: 1.8, 
                ease: [0.4, 0, 0.2, 1] // Custom cubic-bezier untuk feel premium
            }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
      </motion.div>

      {/* Progress Indicators (Garis tipis di bagian paling bawah) */}
      {images.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {images.map((_, i) => (
            <div 
              key={i} 
              className="h-[2px] overflow-hidden bg-white/10 w-8 md:w-16 rounded-full"
            >
              {i === currentIndex && (
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 5, ease: "linear" }}
                  className="h-full bg-white"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Noise Texture Overlay (Optional, untuk look brutalist) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </section>
  );
}