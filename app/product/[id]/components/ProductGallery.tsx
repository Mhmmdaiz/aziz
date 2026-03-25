"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, X, ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const activeImage = images[activeIndex] || "/placeholder.jpg";

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* FULLSCREEN MODAL */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-white/95 dark:bg-[#0B0B0B]/95 backdrop-blur-3xl flex items-center justify-center p-4 cursor-zoom-out transition-colors duration-500"
            onClick={() => setIsFullscreen(false)}
          >
            <motion.div
              layoutId="gallery-main"
              className="relative w-full h-[80vh] md:h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={activeImage}
                fill
                className="object-contain"
                alt={`${productName} fullscreen`}
                unoptimized
              />
              
              {/* Navigation Arrows (Fullscreen) */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-zinc-900 dark:text-white rounded-full backdrop-blur-md transition-all border border-black/10 dark:border-white/10"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-zinc-900 dark:text-white rounded-full backdrop-blur-md transition-all border border-black/10 dark:border-white/10"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </motion.div>

            <button
              className="absolute top-6 right-6 p-4 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/25 text-zinc-900 dark:text-white rounded-full backdrop-blur-md transition-all border border-black/10 dark:border-white/10 hover:scale-110 active:scale-95"
              onClick={() => setIsFullscreen(false)}
            >
              <X size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN IMAGE CONTAINER */}
      <motion.div
        layoutId="gallery-main"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full aspect-[4/5] md:aspect-[3/4] bg-white dark:bg-[#111] rounded-2xl overflow-hidden border border-zinc-200 dark:border-[#222] shadow-[0_0_20px_rgba(0,0,0,0.05)] dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] group cursor-zoom-in transition-colors duration-500"
        onClick={() => setIsFullscreen(true)}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(e, { offset, velocity }) => {
          const swipe = offset.x;
          if (swipe < -50) nextImage();
          else if (swipe > 50) prevImage();
        }}
      >
        <AnimatePresence mode="popLayout" custom={activeIndex}>
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, filter: "blur(10px)", scale: 1.05 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)", scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Image
              src={activeImage}
              fill
              className="object-cover transition-transform duration-[1.5s] group-hover:scale-105"
              alt={`${productName} view`}
              priority
            />
          </motion.div>
        </AnimatePresence>

        {/* Brutalist accents */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
          <div className="px-3 py-1.5 bg-red-600/90 text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg shadow-red-900/50 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            LIVE_VIEW
          </div>
        </div>

        <button
          className="absolute bottom-4 right-4 p-3 bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black/80 text-zinc-900 dark:text-white rounded-full backdrop-blur-md transition-all border border-black/10 dark:border-white/10 opacity-0 group-hover:opacity-100 shadow-sm"
          onClick={(e) => { e.stopPropagation(); setIsFullscreen(true); }}
        >
          <Maximize2 size={20} />
        </button>
      </motion.div>

      {/* THUMBNAILS LIST */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative w-20 h-24 shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-300
                ${activeIndex === i ? "border-red-600 shadow-[0_0_10px_rgba(220,38,38,0.2)] dark:shadow-[0_0_15px_rgba(220,38,38,0.3)] filter brightness-110" : "border-zinc-200 dark:border-[#222] opacity-50 hover:opacity-100 grayscale hover:grayscale-0"}`}
            >
              <Image src={img} fill className="object-cover" alt={`Thumbnail ${i}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
