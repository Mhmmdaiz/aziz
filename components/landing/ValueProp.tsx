import { motion } from "framer-motion";
import { FiHexagon, FiZap, FiTarget, FiBox } from "react-icons/fi";
import { useSettings } from "@/components/providers/SettingsProvider";

const ICON_MAP: any = {
  FiZap: <FiZap />,
  FiHexagon: <FiHexagon />,
  FiTarget: <FiTarget />,
  FiBox: <FiBox />,
};

const defaultContent = {
  title: "Why be anything but elite?",
  items: [
    { icon: "FiZap", title: "Premium Material", desc: "Heavyweight 100% Cotton, architectural durability." },
    { icon: "FiHexagon", title: "Limited Drop", desc: "Only 50 units per design. No restocks, ever." },
    { icon: "FiTarget", title: "Unique Design", desc: "Brutalist-horror aesthetics by top-tier silhouettists." },
    { icon: "FiBox", title: "Eco Packaging", desc: "Sustainable unboxing for a superior tactile experience." }
  ]
};

export default function ValueProp() {
  const { settings } = useSettings();
  const content = settings?.landing_content?.value_props || defaultContent;
  return (
    <section className="py-32 bg-[#0B0B0B] text-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mb-24 space-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-600 block italic">Daemonium_manifest</span>
          <h2 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
            {content.title.split('but')[0]} <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-indigo-500">but {content.title.split('but')[1]}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {content.items.map((p: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-10 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 hover:border-red-500/30 transition-all duration-500 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-2xl text-red-500 mb-8 border border-white/5 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                {ICON_MAP[p.icon] || <FiZap />}
              </div>
              <h4 className="text-[13px] font-black uppercase tracking-widest text-white mb-3">
                {p.title}
              </h4>
              <p className="text-[11px] font-medium text-zinc-500 leading-relaxed italic">
                {p.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
