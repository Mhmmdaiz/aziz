import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FiArrowRight, FiZap } from "react-icons/fi";
import { useRef, useState, useEffect } from "react";
import { useSettings } from "@/components/providers/SettingsProvider";

export default function Hero({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const { settings } = useSettings();
  const content = settings?.landing_content?.hero || {
    badge: "Limited Drop SS/26",
    headline: "Summon Your Darkest Style.",
    subheadline:
      "Architectural precision meets brutalist aesthetics. Engineered for the elite, tailored for the shadows. Non-conformist streetwear.",
    cta_primary: "Shop Now",
    cta_secondary: "Explore Collection",
    image_urls: ["https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2000"]
  };

  const images = (content.image_urls && content.image_urls.length > 0) 
    ? content.image_urls 
    : [content.image_url || "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2000"];

  const [currentIndex, setCurrentIndex] = useState(0);

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

  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0B0B0B]"
    >
      {/* Background Parallax Images (Carousel) */}
      <motion.div style={{ y: y1 }} className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-[#0B0B0B] z-10" />
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`Hero ${currentIndex + 1}`}
            initial={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            animate={{ opacity: 0.4, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover grayscale"
          />
        </AnimatePresence>
      </motion.div>

      {/* Dot Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1 transition-all duration-500 rounded-full ${i === currentIndex ? "w-12 bg-[var(--color-primary-accent)]" : "w-2 bg-white/20 hover:bg-white/40"}`}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-20 container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-primary-accent)]/30 bg-[var(--color-primary-accent)]/10 text-[var(--color-primary-accent)] text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md"
          >
            <FiZap className="animate-pulse" /> {content.badge}
          </motion.span>

          <h1 className="text-[clamp(3.5rem,12vw,10rem)] font-black leading-[0.8] tracking-tighter uppercase italic text-white whitespace-pre-line">
            {content.headline}
          </h1>

          <p className="max-w-xl mx-auto text-zinc-400 text-sm md:text-lg italic leading-relaxed font-medium">
            {content.subheadline}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-10">
            <Link
              href="/shop"
              className="group relative px-12 py-5 bg-white text-black font-black uppercase text-xs tracking-[0.3em] rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                {content.cta_primary}{" "}
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary-accent)] to-[var(--color-secondary-accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-white group-hover:bg-transparent transition-colors" />
            </Link>

            <Link
              href="/journal"
              className="px-12 py-5 border border-white/20 text-white font-black uppercase text-xs tracking-[0.3em] rounded-full hover:bg-white hover:text-black transition-all bg-white/5 backdrop-blur-md"
            >
              {content.cta_secondary}
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
    </section>
  );
}
