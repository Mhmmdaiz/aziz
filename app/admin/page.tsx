"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import {
  FiLayout,
  FiBox,
  FiShoppingBag,
  FiUsers,
  FiSettings,
  FiBook,
  FiLogOut,
  FiArrowRight,
  FiActivity,
  FiZap,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminPortal() {
  const router = useRouter();
  const [stats, setStats] = useState({ products: 0, orders: 0, journals: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const { count: p } = await supabase.from("products").select("*", { count: "exact", head: true });
      const { count: o } = await supabase.from("orders").select("*", { count: "exact", head: true });
      const { count: j } = await supabase.from("articles").select("*", { count: "exact", head: true });
      setStats({ products: p || 0, orders: o || 0, journals: j || 0 });
    };
    fetchStats();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const modules = [
    {
      title: "Dashboard",
      desc: "Real-time analytics & performance.",
      icon: <FiActivity />,
      href: "/admin/dashboard",
      color: "text-blue-500",
    },
    {
      title: "Inventory",
      desc: "Manage artifacts & stock levels.",
      icon: <FiBox />,
      href: "/admin/inventory",
      color: "text-amber-500",
    },
    {
      title: "Orders",
      desc: "Track shipments & fulfillment.",
      icon: <FiShoppingBag />,
      href: "/admin/orders",
      color: "text-emerald-500",
    },
    {
      title: "Home CMS",
      desc: "Architect the landing experience.",
      icon: <FiLayout />,
      href: "/admin/preorder",
      color: "text-purple-500",
    },
    {
      title: "Journal",
      desc: "Manage editorial archives.",
      icon: <FiBook />,
      href: "/admin/journal",
      color: "text-rose-500",
    },
    {
      title: "Settings",
      desc: "Global system configuration.",
      icon: <FiSettings />,
      href: "/admin/settings",
      color: "text-zinc-500",
    },
  ];

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white p-6 md:p-12 font-mono transition-colors duration-300">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-6">
        <div>
          <h1 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 dark:text-zinc-500 mb-2 flex items-center gap-2">
            <FiZap className="text-zinc-900 dark:text-white animate-pulse" /> Command_Center_v2.0
          </h1>
          <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-zinc-900 dark:text-white leading-none">
            Terminal <br /> <span className="text-zinc-300 dark:text-zinc-800">Overview.</span>
          </h2>
        </div>
        <button
          onClick={handleLogout}
          className="px-6 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white hover:text-red-500 hover:border-red-500/20 transition-all font-mono"
        >
          Terminate_Session <FiLogOut />
        </button>
      </header>

      {/* Stats Quick Look */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatItem label="Artifacts_In_Sync" value={stats.products} />
        <StatItem label="Active_Transmissions" value={stats.orders} />
        <StatItem label="Archives_Indexed" value={stats.journals} />
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((m, i) => (
          <motion.div
            key={m.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link
              href={m.href}
              className="group block p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-black/5"
            >
              <div className="flex justify-between items-start mb-12">
                <div className={`text-4xl ${m.color} group-hover:scale-110 transition-transform duration-500`}>
                  {m.icon}
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <FiArrowRight size={20} />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase italic mb-2 tracking-tighter">
                  {m.title}
                </h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  {m.desc}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <footer className="mt-24 pt-8 border-t border-zinc-100 dark:border-zinc-900/50 text-center">
        <p className="text-[8px] font-black uppercase tracking-[0.5em] text-zinc-300 dark:text-zinc-800">
          PROPRIETARY_ALGORITHM // CHCKT-MGMT-SYS
        </p>
      </footer>
    </main>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white dark:bg-zinc-900/20 p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-900 flex justify-between items-end">
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">{label}</p>
        <p className="text-4xl font-black italic italic tracking-tighter">{value < 10 ? `0${value}` : value}</p>
      </div>
      <div className="w-12 h-[1px] bg-zinc-200 dark:bg-zinc-800 mb-2" />
    </div>
  );
}
