import { motion } from "framer-motion";
import { FiStar, FiTruck, FiShield, FiRotateCcw } from "react-icons/fi";
import { useSettings } from "@/components/providers/SettingsProvider";

const ICON_MAP: any = {
  FiStar: <FiStar className="text-yellow-500" />,
  FiTruck: <FiTruck className="text-indigo-500" />,
  FiShield: <FiShield className="text-emerald-500" />,
  FiRotateCcw: <FiRotateCcw className="text-red-500" />,
};

const defaultBadges = [
  { icon: "FiStar", label: "4.9 Rating", sub: "Global Trust" },
  { icon: "FiTruck", label: "Free Shipping", sub: "Inland Delivery" },
  { icon: "FiShield", label: "Secure Payment", sub: "E2E Encrypted" },
  { icon: "FiRotateCcw", label: "Easy Return", sub: "30-Day Window" },
];

export default function TrustBadges() {
  const { settings } = useSettings();
  const badges = settings?.landing_content?.trust_badges || defaultBadges;
  return (
    <section className="py-12 bg-white dark:bg-[#0B0B0B] border-y border-zinc-100 dark:border-zinc-900 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {badges.map((badge, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center gap-4 group cursor-default"
            >
              <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform duration-500">
                {ICON_MAP[badge.icon] || <FiStar />}
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">
                  {badge.label}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-tighter text-zinc-400">
                  {badge.sub}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
