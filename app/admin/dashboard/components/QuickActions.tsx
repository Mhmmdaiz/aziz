"use client";

import Link from "next/link";
import {
  FiPlus,
  FiShoppingBag,
  FiArchive,
  FiSettings,
  FiUserPlus,
  FiLayout,
  FiMail,
} from "react-icons/fi";
import { motion } from "framer-motion";

export default function QuickActions() {
  const actions = [
    {
      label: "New",
      icon: <FiPlus />,
      href: "/admin/new",
      color: "hover:bg-fuchsia-500",
    },
    {
      label: "Pesan",
      icon: <FiMail />,
      href: "/admin/messages",
      color: "hover:bg-fuchsia-500",
    },
    {
      label: "Orders",
      icon: <FiShoppingBag />,
      href: "/admin/orders",
      color: "hover:bg-blue-500",
    },
    {
      label: "User",
      icon: <FiUserPlus />,
      href: "/admin/users",
      color: "hover:bg-emerald-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      {actions.map((action, i) => (
        <motion.div
          key={action.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Link
            href={
              action.label === "New_Artifact" ||
              action.label === "Registry_Stock"
                ? "/admin/inventory"
                : action.href
            }
            className={`flex items-center gap-4 bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800 group transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/80 shadow-sm hover:shadow-xl hover:shadow-black/5 active:scale-95`}
          >
            <span
              className={`text-xl transition-transform group-hover:scale-110 text-zinc-900 dark:text-white`}
            >
              {action.icon}
            </span>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white">
              {action.label}
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
