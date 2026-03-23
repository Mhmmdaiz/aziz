"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { FiPackage, FiChevronDown, FiChevronUp, FiCheckCircle, FiClock } from "react-icons/fi";

interface ProfileOrdersProps {
  userId: string;
}

export default function ProfileOrders({ userId }: ProfileOrdersProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select(`*, items:order_items(*, product:products(image_url))`)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error) setOrders(data || []);
      setLoading(false);
    };

    fetchOrders();

    // Real-time subscription for orders
    const channel = supabase
      .channel(`user_orders_${userId}`)
      .on(
        "postgres_changes",
        { 
          event: "*", 
          schema: "public", 
          table: "orders",
          filter: `user_id=eq.${userId}`
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const getStatusStyle = (status: string) => {
    const s = status.toLowerCase();
    if (s === "paid") return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (s === "pending") return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    if (s === "shipped") return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    return "text-zinc-500 bg-zinc-500/10 border-zinc-500/20";
  };

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center gap-4">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white animate-spin rounded-full" />
      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Loading Orders...</span>
    </div>
  );

  if (orders.length === 0) return (
    <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[3.5rem] bg-zinc-900/50">
      <FiPackage size={40} className="mx-auto mb-6 text-zinc-800" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 italic">No orders found</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const isExpanded = expandedId === order.id;
        const mainImage = order.items?.[0]?.product?.image_url;

        return (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white dark:bg-zinc-900 border transition-all duration-300 rounded-[2.5rem] overflow-hidden ${isExpanded ? "border-zinc-300 dark:border-white/20 shadow-2xl" : "border-zinc-100 dark:border-white/5 shadow-sm dark:shadow-none"}`}
          >
            <div 
              className="p-6 md:p-8 flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedId(isExpanded ? null : order.id)}
            >
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-zinc-100 dark:bg-black border border-zinc-200 dark:border-white/5 overflow-hidden flex items-center justify-center shrink-0`}>
                  {mainImage ? (
                    <img src={mainImage} alt="Order" className="w-full h-full object-cover" />
                  ) : (
                    <FiPackage size={24} className="text-zinc-400 dark:text-zinc-800" />
                  ) }
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500 mb-1">ID: {order.order_id}</p>
                  <p className="text-sm font-black uppercase italic text-zinc-900 dark:text-white leading-none">
                    {new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                 <div className={`hidden md:block px-4 py-1.5 rounded-full border text-[9px] font-black tracking-widest ${getStatusStyle(order.status)}`}>
                    {order.status.toUpperCase()}
                 </div>
                 <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500 mb-1">Total</p>
                    <p className="text-sm font-black text-zinc-900 dark:text-white italic">Rp {Number(order.total_price).toLocaleString('id-ID')}</p>
                 </div>
                 {isExpanded ? <FiChevronUp className="text-zinc-400 dark:text-zinc-500" /> : <FiChevronDown className="text-zinc-400 dark:text-zinc-500" />}
              </div>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-8 pb-8 space-y-8"
                >
                  <div className="pt-8 border-t border-zinc-100 dark:border-white/5 grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-500 italic">Order Details</h4>
                      <div className="space-y-3">
                        {order.items?.map((item: any) => (
                          <div key={item.id} className="flex gap-4 items-center p-4 bg-zinc-50 dark:bg-black/40 rounded-2xl border border-zinc-200 dark:border-white/5">
                            <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-black border border-zinc-200 dark:border-white/5 overflow-hidden shrink-0">
                               <img src={item.product?.image_url} alt={item.product_name} className="w-full h-full object-cover opacity-80" />
                            </div>
                            <div className="flex-1">
                              <p className="text-[10px] font-black uppercase text-zinc-900 dark:text-white">{item.product_name}</p>
                              <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{item.size} × {item.quantity}</p>
                            </div>
                            <p className="text-[10px] font-black text-zinc-900 dark:text-white">Rp {Number(item.price).toLocaleString('id-ID')}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                       <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-500 italic">Shipping Information</h4>
                       <div className="p-6 bg-zinc-50 dark:bg-black/40 rounded-3xl border border-zinc-200 dark:border-white/5 space-y-6">
                          <div className="flex gap-4">
                             <FiClock className="text-zinc-400 dark:text-zinc-500 mt-1" />
                             <div>
                                <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-600 mb-1">Status Timeline</p>
                                <p className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300">Updated: {new Date(order.updated_at).toLocaleString('en-US')}</p>
                             </div>
                          </div>
                          <div className={`flex items-center gap-3 p-4 rounded-2xl border ${getStatusStyle(order.status)}`}>
                             <FiCheckCircle size={14} />
                             <p className="text-[9px] font-black uppercase tracking-[0.2em]">{order.status === 'paid' ? 'Payment Verified - Preparing Order' : order.status.toUpperCase()}</p>
                          </div>
                       </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
