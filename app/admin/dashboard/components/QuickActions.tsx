"use client";

import Link from "next/link";
import {
  FiPlus,
  FiShoppingBag,
  FiBox,
  FiLayout,
  FiSettings,
  FiUserPlus,
  FiMail,
} from "react-icons/fi";
import { motion } from "framer-motion";

export default function QuickActions() {
  const actions = [
    {
      label: "New",
      icon: <FiBox />,
      href: "/admin/new",
      color: "hover:bg-amber-500",
    },
    {
       label: "Orders",
       icon: <FiShoppingBag />,
       href: "/admin/orders",
       color: "hover:bg-blue-500",
    },
    {
      label: "Messages",
      icon: <FiMail />,
      href: "/admin/messages",
      color: "hover:bg-fuchsia-500",
    },
    {
      label: "User",
      icon: <FiUserPlus />,
      href: "/admin/users",
      color: "hover:bg-emerald-500",
    },
    {
      label: "Config",
      icon: <FiSettings />,
      href: "/admin/settings",
      color: "hover:bg-zinc-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 w-full">
      {actions.map((action, i) => (
        <motion.div
          key={action.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Link
            href={action.href}
            className={`flex flex-col items-center justify-center gap-3 bg-white dark:bg-zinc-900/50 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800/50 group transition-all hover:border-black dark:hover:border-white shadow-sm hover:shadow-xl hover:shadow-black/5 active:scale-95 h-24`}
          >
            <span
              className={`text-2xl transition-transform group-hover:scale-110 text-zinc-900 dark:text-white`}
            >
              {action.icon}
            </span>
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
              {action.label}
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
