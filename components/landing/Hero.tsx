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

  // Efek parallax & fade out saat scroll
  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className={`relative h-screen w-full overflow-hidden transition-colors duration-700 ${theme === "dark" ? "bg-[#0B0B0B] text-white" : "bg-white text-zinc-900"}`}>
      {/* Background Slider Container */}
      <motion.div style={{ y: y1 }} className="absolute inset-0 z-0">
        {/* Overlay Gelap agar transisi lebih smooth & teks terbaca */}
        <div className="absolute inset-0 bg-black/40 z-10" />
        
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ 
                duration: 2.5, 
                ease: [0.4, 0, 0.2, 1] 
            }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
      </motion.div>

      {/* MAIN CONTENT OVERLAY */}
      <motion.div 
        style={{ opacity }}
        className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6"
      >
        {/* SHOP NOW BUTTON WITH SCRIBBLE */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
          className="relative mt-8 md:mt-20 group cursor-pointer"
        >
          <button className="relative z-10 px-8 py-3 text-[11px] font-black uppercase tracking-[0.4em] text-white hover:text-white/80 transition-colors">
            SHOP NOW
          </button>
          
          {/* Scribble Effect */}
          <svg 
            viewBox="0 0 200 60" 
            className="absolute inset-0 w-full h-full scale-[1.3] pointer-events-none overflow-visible"
          >
            <motion.path
              d="M10,30 Q50,5 100,30 T190,30 T100,55 T10,30"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ 
                duration: 2, 
                delay: 1.5,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse",
                repeatDelay: 1
              }}
            />
            <motion.path
              d="M15,35 Q55,10 105,35 T185,35 T105,50 T15,35"
              fill="none"
              stroke="white"
              strokeWidth="1"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              transition={{ 
                duration: 2.5, 
                delay: 1.8,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          </svg>
        </motion.div>
      </motion.div>

      {/* VERTICAL SCROLL DOWN INDICATOR */}
      <div className="absolute right-6 md:right-12 bottom-12 z-20 hidden md:flex flex-col items-center gap-12 group">
        <motion.span 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="text-[9px] font-black uppercase tracking-[0.5em] text-white/40 rotate-180"
          style={{ writingMode: 'vertical-rl' }}
        >
          SCROLL DOWN
        </motion.span>
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: 60 }}
          transition={{ delay: 2.2, duration: 1 }}
          className="w-[1px] bg-white/20 relative overflow-hidden"
        >
          <motion.div 
            animate={{ y: [0, 60] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-full h-1/2 bg-white"
          />
        </motion.div>
      </div>

      {/* Image Count / Progress */}
      {images.length > 1 && (
        <div className="absolute bottom-10 left-6 md:left-12 z-20 flex flex-col gap-4">
           <span className="text-[10px] font-black tabular-nums text-white/60">
             0{currentIndex + 1} // 0{images.length}
           </span>
           <div className="flex gap-2">
             {images.map((_, i) => (
               <div 
                 key={i} 
                 className="h-[1px] overflow-hidden bg-white/20 w-8 rounded-full"
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
        </div>
      )}

      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] z-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </section>
  );
}