"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import {
  FiPlus,
  FiBook,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiArrowRight,
} from "react-icons/fi";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ posts: 0, users: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const { count: postCount } = await supabase
        .from("journals")
        .select("*", { count: "exact", head: true });
      const { count: userCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      setStats({ posts: postCount || 0, users: userCount || 0 });
    };
    fetchStats();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white p-6 md:p-12 font-sans transition-colors duration-300">
      {/* Header */}
      <header className="flex justify-between items-end mb-20">
        <div>
          <h1 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 dark:text-zinc-500 mb-2">
            System_Control_v1.0
          </h1>
          <h2 className="text-5xl font-black italic uppercase tracking-tighter text-zinc-900 dark:text-white">
            Terminal_Dashboard
          </h2>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white hover:text-red-500 transition-colors"
        >
          Terminate_Session <FiLogOut />
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard
          label="Total_Archives"
          value={stats.posts}
          icon={<FiBook />}
        />
        <StatCard
          label="Registered_Entities"
          value={stats.users}
          icon={<FiUsers />}
        />
        <StatCard label="System_Health" value="100%" icon={<FiSettings />} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ActionCard
          title="Create_New_Post"
          desc="Initialize a new journal entry to the database."
          icon={<FiPlus />}
          onClick={() => router.push("/admin/journal")}
        />
        <ActionCard
          title="Manage_Archives"
          desc="Edit, delete, or update existing data entries."
          icon={<FiArrowRight />}
          onClick={() => router.push("/admin/journal")}
        />
      </div>
    </main>
  );
}

function StatCard({ label, value, icon }: any) {
  return (
    <div className="border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl bg-white dark:bg-zinc-900/30 backdrop-blur-sm transition-colors duration-300">
      <div className="text-zinc-500 mb-4 text-xl">{icon}</div>
      <div className="text-zinc-900 dark:text-white text-3xl font-black mb-1">{value}</div>
      <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
        {label}
      </div>
    </div>
  );
}

function ActionCard({ title, desc, icon, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="group text-left border-2 border-zinc-200 dark:border-zinc-800 p-10 rounded-[2.5rem] hover:border-black dark:hover:border-white transition-all duration-500 flex justify-between items-center bg-white dark:bg-transparent"
    >
      <div>
        <h3 className="text-2xl font-black uppercase italic mb-2 flex items-center gap-3 text-zinc-900 dark:text-white">
          {icon} {title}
        </h3>
        <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">
          {desc}
        </p>
      </div>
      <FiArrowRight className="text-3xl opacity-0 group-hover:opacity-100 group-hover:translate-x-4 transition-all" />
    </button>
  );
}
