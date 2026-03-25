"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useSettings } from "@/components/providers/SettingsProvider";
import Link from "next/link";

export default function Hero({ theme = "dark", data }: { theme?: "dark" | "light", data?: any }) {
  const { settings } = useSettings();
  
  // Content from CMS
  const content = data || settings?.landing_content?.hero?.content || {};
  const title = content.title || "CRAFTING THE FUTURE.";
  const subtitle = content.subtitle || "The ultimate destination for premium digital artifacts and physical collectibles.";
  const ctaText = content.cta_text || "SHOP NOW";
  const ctaLink = content.cta_link || "/shop";

  // Multi-media support (Up to 6)
  const mediaList = content.media_list || (content.media_url ? [{ url: content.media_url }] : [{ url: "https://v1.coveredby.id/chckt/hero-v1.mp4" }]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (mediaList.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % mediaList.length);
    }, 5000); // 5s transition
    return () => clearInterval(timer);
  }, [mediaList]);

  const currentMedia = mediaList[index]?.url || "";
  const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(currentMedia) || currentMedia.includes("video/"); 

  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className={`relative h-screen w-full overflow-hidden transition-colors duration-700 ${theme === "dark" ? "bg-[#0B0B0B] text-white" : "bg-white text-zinc-900"}`}>
      
      {/* Background Media Carousel */}
      <motion.div style={{ y: y1 }} className="absolute inset-0 z-0 select-none">
        <div className="absolute inset-0 bg-black/40 z-10" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {isVideo ? (
              <video
                src={currentMedia}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <img
                src={currentMedia}
                className="absolute inset-0 w-full h-full object-cover"
                alt=""
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Carousel Indicators */}
        {mediaList.length > 1 && (
          <div className="absolute bottom-12 left-6 md:left-12 z-20 flex gap-3">
            {mediaList.map((_: any, i: number) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-1 transition-all duration-500 rounded-full ${i === index ? "w-8 bg-white" : "w-4 bg-white/20 hover:bg-white/40"}`}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* MAIN CONTENT OVERLAY */}
      <motion.div 
        style={{ opacity }}
        className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6"
      >
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           className="max-w-4xl space-y-6"
        >
           <h1 className="text-5xl md:text-9xl font-black italic uppercase tracking-tighter leading-[0.85] break-words max-w-full">
             {title}
           </h1>
           <p className="text-sm md:text-xl font-medium tracking-wide max-w-2xl mx-auto opacity-70 leading-relaxed uppercase">
             {subtitle}
           </p>
        </motion.div>

        {/* CTA BUTTON */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative mt-12 md:mt-20 group cursor-pointer"
        >
          <Link href={ctaLink} className="relative z-10 px-12 py-5 bg-white text-black dark:bg-zinc-900 dark:text-white rounded-full text-[10px] font-black uppercase tracking-[0.4em] hover:scale-110 transition-all block">
             {ctaText}
          </Link>
          
          {/* Scribble Effect */}
          <svg 
            viewBox="0 0 200 60" 
            className="absolute inset-0 w-full h-full scale-[1.3] pointer-events-none overflow-visible"
          >
            <motion.path
              d="M10,30 Q50,5 100,30 T190,30 T100,55 T10,30"
              fill="none"
              stroke={theme === "dark" ? "white" : "black"}
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.4 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
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

      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] z-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </section>
  );
}