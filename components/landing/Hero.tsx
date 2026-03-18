import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { FiArrowRight, FiZap } from "react-icons/fi";
import { useRef } from "react";
import { useSettings } from "@/components/providers/SettingsProvider";

export default function Hero() {
  const { settings } = useSettings();
  const content = settings?.landing_content?.hero || {
    badge: "Limited Drop SS/26",
    headline: "Summon Your Darkest Style.",
    subheadline:
      "Architectural precision meets brutalist aesthetics. Engineered for the elite, tailored for the shadows. Non-conformist streetwear.",
    cta_primary: "Shop Now",
    cta_secondary: "Explore Collection",
  };

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
      {/* Background Parallax Image */}
      <motion.div style={{ y: y1 }} className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-[#0B0B0B] z-10" />
        <img
          src={content.image_url || "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2000"}
          alt="Daemonium Hero"
          className="w-full h-full object-cover opacity-40 grayscale"
        />
      </motion.div>

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
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md"
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
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
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
