"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiShoppingBag, FiX } from "react-icons/fi";

const PURCHASES = [
  { name: "Andi", location: "Jakarta", product: "Darkest Oversize Hoodie", time: "2 menit yang lalu" },
  { name: "Budi", location: "Surabaya", product: "Minimalist Graphic Tee", time: "5 menit yang lalu" },
  { name: "Citra", location: "Bandung", product: "Limited Edition Black Cap", time: "8 menit yang lalu" },
  { name: "Deni", location: "Medan", product: "Brutalist Cargo Pants", time: "12 menit yang lalu" },
];

export default function RecentPurchase() {
  const [current, setCurrent] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showNext = () => {
      const random = PURCHASES[Math.floor(Math.random() * PURCHASES.length)];
      setCurrent(random);
      setVisible(true);

      setTimeout(() => {
        setVisible(false);
      }, 5000);
    };

    const interval = setInterval(showNext, 15000 + Math.random() * 10000);
    setTimeout(showNext, 5000); // Initial delay

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {visible && current && (
        <motion.div
          initial={{ opacity: 0, x: -50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -20, scale: 0.9 }}
          className="fixed bottom-10 left-6 z-[100] max-w-[280px] w-full"
        >
          <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-100 dark:border-white/10 p-4 rounded-[1.5rem] shadow-2xl flex items-center gap-4 relative">
            <button 
              onClick={() => setVisible(false)}
              className="absolute top-2 right-2 text-zinc-400 hover:text-red-500"
            >
              <FiX size={12} />
            </button>

            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
              <FiShoppingBag size={20} />
            </div>

            <div className="flex flex-col gap-0.5 min-w-0">
              <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Pembelian terbaru</p>
              <h4 className="text-[10px] font-black uppercase italic truncate text-zinc-900 dark:text-white">
                {current.name} di {current.location}
              </h4>
              <p className="text-[9px] font-bold text-zinc-500 truncate">
                Membeli {current.product} — {current.time}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
