"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHash,
  FiCreditCard,
  FiArrowLeft,
  FiCalendar,
  FiX,
} from "react-icons/fi";
import Link from "next/link";

// 1. Komponen isi yang menggunakan useSearchParams
function OrderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order_id"); // Mengambil ID dari URL

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          items:order_items(*)
        `)
        .eq("order_id", orderId)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black font-black italic uppercase opacity-30 animate-pulse text-zinc-900 dark:text-white transition-colors duration-300">
        Syncing_Order_Vault...
      </div>
    );

  if (!order)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-black transition-colors duration-300">
        <h1 className="font-black italic text-2xl uppercase text-zinc-900 dark:text-white">
          Order_Not_Found
        </h1>
        <Link
          href="/"
          className="mt-4 underline font-bold uppercase text-[10px] text-zinc-900 dark:text-white"
        >
          Back to Home
        </Link>
      </div>
    );

  return (
    <main className="min-h-screen pt-24 pb-20 px-4 md:px-12 bg-zinc-50 dark:bg-black transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-950 rounded-[3rem] p-10 shadow-2xl border border-gray-100 dark:border-zinc-900 transition-colors duration-300 shadow-zinc-200/50 dark:shadow-none"
        >
          <span className="text-[9px] font-black text-blue-600 tracking-[0.4em] uppercase">
            Success_Manifest
          </span>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter mt-2 mb-8 text-zinc-900 dark:text-white">
            Order_Summary<span className="text-blue-600 dark:text-blue-400">.</span>
          </h2>

          <div className="space-y-6">
            <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-900 pb-4">
              <span className="text-[10px] font-black uppercase text-gray-400 dark:text-zinc-600">
                Order ID
              </span>
              <span className="text-sm font-bold uppercase italic text-zinc-900 dark:text-white">
                {order.order_id}
              </span>
            </div>
            <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-900 pb-4">
              <span className="text-[10px] font-black uppercase text-gray-400 dark:text-zinc-600">
                Status
              </span>
              <span className="px-4 py-1 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-full text-[9px] font-black">
                {order.status}
              </span>
            </div>
            <div className="pt-4">
              <span className="text-[10px] font-black uppercase text-gray-400 dark:text-zinc-600 block mb-4">
                Total_Valuation
              </span>
              <span className="text-4xl font-black italic text-zinc-900 dark:text-white">
                Rp {Number(order.total_price).toLocaleString()}
              </span>
            </div>
          </div>

          <Link
            href="/"
            className="w-full mt-12 bg-black dark:bg-white text-white dark:text-black py-6 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] flex justify-center hover:bg-blue-600 dark:hover:bg-blue-400 transition-all shadow-xl dark:shadow-none"
          >
            Return_To_Base
          </Link>
        </motion.div>
      </div>
    </main>
  );
}

// 2. Export default yang membungkus dengan Suspense
export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black font-black italic uppercase opacity-30 animate-pulse text-zinc-900 dark:text-white transition-colors duration-300">
          Initializing_Security_Protocol...
        </div>
      }
    >
      <OrderContent />
    </Suspense>
  );
}
