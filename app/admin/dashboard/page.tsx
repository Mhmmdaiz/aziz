"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBox,
  FiActivity,
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
  FiZap,
} from "react-icons/fi";

// Types
interface ChartData {
  date: string;
  total: number;
}

export interface DashboardOrder {
  id: string;
  created_at: string;
  total_price: number;
  status: string;
  profiles?: {
    full_name: string;
  };
}

export interface DashboardProduct {
  id: string;
  name: string;
  stock: number;
  image_url: string;
  total_sold?: number;
  performance?: number;
}

// Components
import StatsCard from "./components/StatsCard";
import SalesChart from "./components/SalesChart";
import RecentOrders from "./components/RecentOrders";
import InventoryWidgets from "./components/InventoryWidgets";
import QuickActions from "./components/QuickActions";

export default function AdminDashboard() {
  const [data, setData] = useState({
    stats: {
      revenue: 0,
      orders: 0,
      products: 0,
      pending: 0,
    },
    chartData: [] as ChartData[],
    recentOrders: [] as DashboardOrder[],
    lowStock: [] as DashboardProduct[],
    topProducts: [] as DashboardProduct[],
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Fetch Basic Totals
      const [resOrders, resProducts, resPending] = await Promise.all([
        supabase.from("orders").select("total_price, created_at, status"),
        supabase.from("products").select("id, name, stock, image_url"),
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
      ]);

      // 2. Fetch Recent Orders with Profiles
      const { data: recentOrders } = await supabase
        .from("orders")
        .select("*, profiles(full_name)")
        .order("created_at", { ascending: false })
        .limit(5);

      if (resOrders.data) {
        // Calculate Revenue (Paid only)
        const revenue = resOrders.data
          .filter((o) => o.status === "paid")
          .reduce((acc, curr) => acc + Number(curr.total_price), 0);

        // Process Chart Data (Last 7 Days)
        const days = [...Array(7)]
          .map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split("T")[0];
          })
          .reverse();

        const chartData = days.map((date) => {
          const total = resOrders.data
            .filter((o) => o.created_at.startsWith(date) && o.status === "paid")
            .reduce((acc, curr) => acc + Number(curr.total_price), 0);
          return { date: date.slice(5), total };
        });

        // 3. Low Stock Check
        const lowStock = (resProducts.data || [])
          .filter((p) => p.stock < 5)
          .slice(0, 3);

        // 4. Mocking Top Products (Idealnya join order_items, tapi kita simulasikan dulu)
        const topProducts: DashboardProduct[] = (resProducts.data || [])
          .slice(0, 3)
          .map((p) => ({
            ...p,
            total_sold: Math.floor(Math.random() * 50) + 10,
            performance: Math.random() * 40 + 60,
          }));

        setData({
          stats: {
            revenue,
            orders: resOrders.data.length,
            products: resProducts.data?.length || 0,
            pending: resPending.count || 0,
          },
          chartData,
          recentOrders: (recentOrders as unknown as DashboardOrder[]) || [],
          lowStock: lowStock as DashboardProduct[],
          topProducts,
        });
      }
    } catch (err) {
      console.error("SUPABASE_SYNC_ERROR:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth");
        return;
      }
      fetchDashboardData();

      // REALTIME SUBSCRIPTION
      const channel = supabase
        .channel("dashboard-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "orders" },
          () => {
            console.log("Realtime Update: Database Triggered");
            fetchDashboardData();
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };
    init();
  }, [router, fetchDashboardData]);

  if (loading) return <LoadingSkeleton />;

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black pt-30 pb-12 px-4 md:px-12 font-mono text-zinc-900 dark:text-white transition-colors duration-300 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9] text-zinc-900 dark:text-white">
              Admin <br />{" "}
              <span className="text-zinc-300 dark:text-zinc-800 italic">
                Dashboard.
              </span>
            </h1>
          </motion.div>

          <div className="w-full md:w-auto">
            <QuickActions />
          </div>
        </header>

        {/* STATS GRID */}
        <section className="grid grid-cols-1 sm:grid-cols-4 xl:grid-cols-4 gap-6">
          <StatsCard
            label="Pendapatan"
            value={`Rp ${data.stats.revenue.toLocaleString()}`}
            icon={<FiDollarSign />}
            trend="+12.5%"
            color="text-emerald-500"
            delay={0.1}
          />
          <StatsCard
            label="Pesanan"
            value={data.stats.orders}
            icon={<FiActivity />}
            trend="+8"
            color="text-blue-500"
            delay={0.2}
          />
          <StatsCard
            label="Jumlah Unit"
            value={data.stats.products}
            icon={<FiBox />}
            color="text-orange-500"
            delay={0.3}
          />
          <StatsCard
            label="Anggota"
            value={data.stats.pending}
            icon={<FiZap />}
            trend="Needs_Review"
            color="text-purple-500"
            delay={0.4}
          />
        </section>

        {/* ANALYTICS ROW */}
        <section className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-12">
            <SalesChart data={data.chartData} />
          </div>
        </section>

        {/* DATA ROW */}
        <section className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <RecentOrders orders={data.recentOrders} />
          </div>
          <div className="lg:col-span-4">
            <InventoryWidgets
              lowStock={data.lowStock}
              topProducts={data.topProducts}
            />
          </div>
        </section>

        {/* FOOTER METADATA */}
        <footer className="pt-20 text-[8px] font-black uppercase tracking-[0.5em] text-zinc-300 dark:text-zinc-800 flex justify-between">
          <span>Encrypted_Terminal // DMNM v2.1</span>
          <span>© 2026 AZZ</span>
        </footer>
      </div>
    </main>
  );
}

function LoadingSkeleton() {
  return (
    <div className="h-screen bg-zinc-50 dark:bg-black p-12 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent animate-spin rounded-full mb-6 mx-auto" />
        <p className="font-black italic uppercase tracking-[0.5em] text-xs text-zinc-400 animate-pulse">
          Initializing_Control_Center...
        </p>
      </div>
    </div>
  );
}
