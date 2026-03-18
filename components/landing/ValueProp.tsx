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
  title: "Why be anything but elite?",
  items: [
    {
      icon: "FiZap",
      title: "Premium Material",
      desc: "Heavyweight 100% Cotton, architectural durability.",
    },
    {
      icon: "FiHexagon",
      title: "Limited Drop",
      desc: "Only 50 units per design. No restocks, ever.",
    },
    {
      icon: "FiTarget",
      title: "Unique Design",
      desc: "Brutalist-horror aesthetics by top-tier silhouettists.",
    },
    {
      icon: "FiBox",
      title: "Eco Packaging",
      desc: "Sustainable unboxing for a superior tactile experience.",
    },
  ],
};

export default function ValueProp() {
  const { settings } = useSettings();
  const content = settings?.landing_content?.value_props || defaultContent;

  // Fungsi aman untuk membagi judul tanpa merusak layout jika kata "but" tidak ada
  const renderTitle = () => {
    const parts = content.title.split(/(but)/i); // Split tapi tetap simpan kata "but"
    if (parts.length < 3) return content.title;

    return (
      <>
        {parts[0]} <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-indigo-500 to-blue-600">
          {parts[1]} {parts[2]}
        </span>
      </>
    );
  };

  return (
    <section className="py-24 md:py-32 bg-[#0B0B0B] text-white overflow-hidden selection:bg-red-600">
      <div className="container mx-auto px-6">
        {/* HEADER SECTION */}
        <div className="max-w-4xl mb-16 md:mb-24 space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-px w-12 bg-red-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-600 block italic">
              Daemonium_manifest // 004
            </span>
          </div>
          <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.85]">
            {renderTitle()}
          </h2>
        </div>

        {/* GRID SYSTEM - Responsive Scroll on Mobile */}
        <div className="flex md:grid overflow-x-auto md:overflow-visible grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 pb-10 md:pb-0 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
          {content.items.map((p: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              className="min-w-[85%] md:min-w-0 p-8 md:p-10 rounded-[2.5rem] bg-gradient-to-br from-zinc-900/80 to-black border border-white/5 hover:border-red-600/50 transition-all duration-700 group relative overflow-hidden snap-center"
            >
              {/* Animated Glow Effect */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-600/10 blur-[80px] group-hover:bg-red-600/20 transition-all duration-700" />

              {/* Icon Container */}
              <div className="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center text-3xl text-red-600 mb-10 border border-white/5 shadow-2xl group-hover:shadow-red-900/20 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                {ICON_MAP[p.icon] || <FiZap />}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-zinc-700">
                    0{i + 1}
                  </span>
                  <h4 className="text-[14px] font-black uppercase tracking-[0.2em] text-white">
                    {p.title}
                  </h4>
                </div>
                <p className="text-[12px] font-medium text-zinc-500 leading-relaxed italic opacity-80 group-hover:opacity-100 transition-opacity">
                  {p.desc}
                </p>
              </div>

              {/* Bottom Decorative Line */}
              <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-red-600 group-hover:w-full transition-all duration-700" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
