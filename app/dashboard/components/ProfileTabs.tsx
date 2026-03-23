"use client";

import { motion } from "framer-motion";
import { FiShoppingBag, FiMapPin, FiUser } from "react-icons/fi";

interface ProfileTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TABS = [
  { id: "orders", label: "ORDERS", icon: FiShoppingBag },
  { id: "address", label: "ADDRESSES", icon: FiMapPin },
  { id: "profile", label: "PROFILE", icon: FiUser },
];

export default function ProfileTabs({ activeTab, setActiveTab }: ProfileTabsProps) {
  return (
    <div className="w-full bg-white dark:bg-black border-b border-zinc-200 dark:border-white/10 transition-colors duration-500">
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-8 overflow-x-auto no-scrollbar py-4">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex items-center gap-2 group shrink-0"
              >
                <div className={`p-2 rounded-xl transition-all duration-300 ${isActive ? "bg-red-600 text-white" : "bg-zinc-100 dark:bg-white/5 text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-zinc-400"}`}>
                  <tab.icon size={14} />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${isActive ? "text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-zinc-400"}`}>
                  {tab.label}
                </span>
                
                {isActive && (
                  <motion.div
                    layoutId="active-tab-indicator"
                    className="absolute -bottom-4 left-0 right-0 h-0.5 bg-red-600"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
