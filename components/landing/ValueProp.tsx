"use client";

import { motion } from "framer-motion";
import { FiHexagon, FiZap, FiTarget, FiBox } from "react-icons/fi";
import { useSettings } from "@/components/providers/SettingsProvider";

// Menggunakan mapping yang lebih bersih
const ICON_MAP: Record<string, React.ReactNode> = {
  FiZap: <FiZap />,
  FiHexagon: <FiHexagon />,
  FiTarget: <FiTarget />,
  FiBox: <FiBox />,
};

const defaultContent = {
  title: "NOT FOR EVERYONE. ONLY FOR THE ELITE.",
  items: [
    {
      icon: "FiBox",
      title: "PREMIUM ARMOR",
      desc: "24oz Industrial-grade heavyweight cotton. Engineered for structural dominance and lifetime durability.",
    },
    {
      icon: "FiTarget",
      title: "THE LIMITED VOID",
      desc: "Micro-batch production: 50 units worldwide. Individually numbered. No restocks, no second chances.",
    },
    {
      icon: "FiZap",
      title: "BRUTAL AESTHETICS",
      desc: "A fusion of raw industrial horror and high-end silhouette. Designed for the fringe, not the mass.",
    },
    {
      icon: "FiHexagon",
      title: "TACTICAL UNBOXING",
      desc: "Vacuum-sealed sustainable logistics. Zero-waste packaging engineered for a premium tactile reveal.",
    },
  ],
};

export default function ValueProp({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const { settings } = useSettings();
  const cmsContent = settings?.landing_content?.value_props;
  
  const content = (cmsContent && cmsContent.title) 
    ? cmsContent 
    : defaultContent;

  const renderTitle = () => {
    const parts = content.title.split(/(ONLY)/i);
    if (parts.length < 3) return content.title;

    return (
      <>
        {parts[0]} <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary-accent)] via-[var(--color-secondary-accent)] to-[var(--color-accent)]">
          {parts[1]} {parts[2]}
        </span>
      </>
    );
  };

  return (
    <section className={`py-24 md:py-32 overflow-hidden transition-colors duration-500 selection:bg-[var(--color-primary-accent)] ${theme === "dark" ? "bg-[#0B0B0B] text-white" : "bg-white text-black"}`}>
      <div className="container mx-auto px-6">
        {/* HEADER SECTION */}
        <div className="max-w-4xl mb-16 md:mb-24 space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-px w-12 bg-[var(--color-primary-accent)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-600 block italic">
              Daemonium manifest // 004
            </span>
          </div>
          <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.85]">
            {renderTitle()}
          </h2>
        </div>

        {/* ITEMS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {content.items.map((item: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`group p-8 rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden ${theme === "dark" ? "bg-zinc-900/40 border-white/5 hover:border-[var(--color-primary-accent)]/30" : "bg-zinc-50 border-zinc-100 hover:border-[var(--color-primary-accent)]/50 shadow-sm hover:shadow-xl"}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-[var(--color-primary-accent)] mb-8 group-hover:scale-110 transition-all duration-500 ${theme === "dark" ? "bg-white/5" : "bg-white shadow-inner"}`}>
                  {ICON_MAP[item.icon] || <FiZap />}
                </div>
                <h3 className={`text-lg font-black uppercase italic tracking-tighter mb-4 group-hover:text-[var(--color-primary-accent)] transition-colors ${theme === "dark" ? "text-white" : "text-black"}`}>
                  {item.title}
                </h3>
                <p className="text-sm text-zinc-500 font-medium leading-relaxed italic">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
