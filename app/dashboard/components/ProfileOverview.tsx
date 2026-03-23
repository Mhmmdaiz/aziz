"use client";

import { motion } from "framer-motion";
import { FiUser, FiMail, FiPhone, FiLock, FiEdit3 } from "react-icons/fi";

interface ProfileOverviewProps {
  user: any;
  onEdit: () => void;
  onChangePassword: () => void;
}

export default function ProfileOverview({ user, onEdit, onChangePassword }: ProfileOverviewProps) {
  const cards = [
    {
      title: "PERSONAL INFO",
      icon: FiUser,
      items: [
        { label: "FULL NAME", value: user?.full_name || "Not set" },
        { label: "EMAIL", value: user?.email },
        { label: "PHONE", value: user?.phone || "Not set" },
        { label: "ADDRESS", value: user?.address || "Not set" },
      ],
    },
    {
      title: "SECURITY",
      icon: FiLock,
      items: [
        { label: "PASSWORD", value: "••••••••••••" },
      ],
      action: {
        label: "CHANGE PASSWORD",
        onClick: onChangePassword,
      }
    }
  ];

  return (
    <div className="space-y-8">
      {/* Primary CTA for Desktop */}
      <div className="hidden md:flex justify-end">
        <button
          onClick={onEdit}
          className="px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full font-black uppercase text-[10px] tracking-[0.4em] hover:bg-red-600 hover:text-white transition-all shadow-2xl active:scale-95 flex items-center gap-3"
        >
          <FiEdit3 size={16} /> Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="p-8 md:p-10 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-[3rem] group hover:border-zinc-300 dark:hover:border-white/10 transition-all shadow-sm dark:shadow-none"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-zinc-200/50 dark:bg-white/5 rounded-2xl text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                <card.icon size={20} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-500 italic">
                {card.title}
              </h3>
            </div>

            <div className="space-y-6">
              {card.items.map((item, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-600 italic">
                    {item.label}
                  </span>
                  <span className="text-sm md:text-base font-bold text-zinc-800 dark:text-zinc-200 tracking-tight">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {card.action && (
              <button
                onClick={card.action.onClick}
                className="mt-8 px-6 py-3 bg-zinc-200/50 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-zinc-200 dark:border-white/5"
              >
                {card.action.label}
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Primary CTA for Mobile (Sticky in Bottom) */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
        <button
          onClick={onEdit}
          className="w-full py-6 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full font-black uppercase text-[12px] tracking-[0.5em] shadow-2xl active:scale-95 flex items-center justify-center gap-3 border border-white/10"
        >
          <FiEdit3 size={18} /> Edit Profile
        </button>
      </div>
    </div>
  );
}
