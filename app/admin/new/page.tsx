"use client";

import Link from "next/link";
import {
  FiPlus,
  FiBox,
  FiEdit3,
  FiBookOpen,
  FiArrowRight,
} from "react-icons/fi";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-[#050505] pt-20 md:pt-32 pb-20 px-6 md:px-16 font-mono text-zinc-900 dark:text-zinc-100 transition-colors duration-500">
      <div className="max-w-6xl mx-auto">
        {/* HEADER SECTION */}
        <header className="relative mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-2"
          >
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none">
              Control <br />
              <span className="text-zinc-300 dark:text-zinc-800 italic hover:text-emerald-500 transition-colors duration-300">
                Center.
              </span>
            </h1>
          </motion.div>

          {/* Decorative element */}
          <div className="absolute top-0 right-0 hidden lg:block">
            <div className="w-32 h-32 border border-zinc-200 dark:border-zinc-800 rounded-full animate-pulse"></div>
          </div>
        </header>

        {/* SECTION TITLE */}
        <div className="flex items-center justify-between mb-8">
          <div className="h-[1px] flex-1 bg-zinc-100 dark:bg-zinc-900 ml-6"></div>
        </div>

        {/* ACTIONS GRID */}
        <QuickActions />
      </div>
    </main>
  );
}

function QuickActions() {
  const actions = [
    {
      label: "Product",
      desc: "Add new inventory items",
      icon: <FiBox />,
      href: "/admin/inventory",
      color: "text-blue-500",
    },
    {
      label: "Home Edit",
      desc: "Manage advance bookings",
      icon: <FiEdit3 />,
      href: "/admin/preorder",
      color: "text-amber-500",
    },
    {
      label: "Journal",
      desc: "Daily financial records",
      icon: <FiBookOpen />,
      href: "/admin/journal",
      color: "text-rose-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {actions.map((action, i) => (
        <motion.div
          key={action.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
        >
          <Link
            href={action.href}
            className="group relative flex flex-col justify-between h-48 bg-white dark:bg-zinc-900/50 p-8 rounded-[2rem] border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-sm transition-all hover:border-emerald-500/50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
          >
            {/* Icon & Plus Tag */}
            <div className="flex justify-between items-start">
              <div
                className={`text-3xl ${action.color} group-hover:scale-110 transition-transform duration-300`}
              >
                {action.icon}
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-500 text-white p-2 rounded-full">
                <FiPlus className="text-sm" />
              </div>
            </div>

            {/* Labels */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-1 text-zinc-400 group-hover:text-emerald-500 transition-colors">
                {action.label}
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                {action.desc}
              </p>
            </div>

            {/* Hover Arrow Decoration */}
            <div className="absolute bottom-8 right-8 text-zinc-200 dark:text-zinc-800 group-hover:text-emerald-500/20 transition-colors">
              <FiArrowRight className="text-4xl" />
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
