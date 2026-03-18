"use client";

import { Truck, ShieldCheck, RotateCcw } from "lucide-react";

export function TrustBadges() {
  const badges = [
    {
      icon: <Truck size={20} className="text-red-500" />,
      title: "FREE SHIPPING",
      desc: "Worldwide delivery on artifacts over IDR 1M",
    },
    {
      icon: <RotateCcw size={20} className="text-red-500" />,
      title: "EASY RETURNS",
      desc: "30-day structural guarantee",
    },
    {
      icon: <ShieldCheck size={20} className="text-red-500" />,
      title: "SECURE PAYMENT",
      desc: "Encrypted transaction protocol",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
      {badges.map((b, i) => (
        <div
          key={i}
          className="flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-3 p-4 bg-white dark:bg-[#111] border border-zinc-200 dark:border-[#222] rounded-xl hover:border-zinc-300 dark:hover:border-[#444] transition-colors shadow-sm dark:shadow-none"
        >
          <div className="p-2 bg-zinc-50 dark:bg-[#1A1A1A] border border-zinc-100 dark:border-[#333] rounded-lg shrink-0 transition-colors">
            {b.icon}
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white md:mb-1 transition-colors">
              {b.title}
            </h4>
            <p className="text-[10px] font-mono text-zinc-500">{b.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
