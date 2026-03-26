"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiPackage, 
  FiClock, 
  FiCheckCircle, 
  FiArrowLeft, 
  FiRefreshCw, 
  FiChevronDown, 
  FiChevronUp,
  FiMapPin
} from "react-icons/fi";

export default function UserOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndOrders = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/auth?redirect=/orders");
        return;
      }
      
      setUser(user);

      // Fetch user's orders with items
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          items:order_items(*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fetch orders error:", error);
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    };

    fetchUserAndOrders();

    // Subscribe to changes for real-time status updates
    const channel = supabase
      .channel(`user_orders_${user?.id}`)
      .on(
        "postgres_changes",
        { 
          event: "UPDATE", 
          schema: "public", 
          table: "orders",
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          fetchUserAndOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router, user?.id]);

  const toggleExpand = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const getStatusDisplay = (status: string) => {
    const s = status.toLowerCase();
    if (s === "paid") return { text: "PAID", color: "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" };
    if (s === "pending") return { text: "PENDING", color: "text-amber-500 border-amber-500/20 bg-amber-500/5" };
    if (s === "shipped") return { text: "SHIPPED", color: "text-blue-500 border-blue-500/20 bg-blue-500/5" };
    if (s === "completed") return { text: "COMPLETED", color: "text-cyan-500 border-cyan-500/20 bg-cyan-500/5" };
    if (s === "cancelled") return { text: "CANCELLED", color: "text-red-500 border-red-500/20 bg-red-500/5" };
    return { text: status.toUpperCase(), color: "text-zinc-500 border-zinc-200 bg-zinc-50" };
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-mono bg-[#FBFBFD] dark:bg-black text-black dark:text-white">
        <FiRefreshCw className="w-8 h-8 animate-spin mb-4" />
        <div className="text-[10px] font-black tracking-[0.4em] uppercase opacity-40">
          Decrypting Logistics...
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FBFBFD] dark:bg-black text-black dark:text-white pt-32 pb-20 px-4 md:px-8 font-mono">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col gap-6">
          <button 
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black dark:hover:text-white transition-colors w-fit"
          >
            <FiArrowLeft /> Back to HQ
          </button>
          <div className="flex justify-between items-end border-b border-zinc-200 dark:border-zinc-900 pb-8">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">
              Order<span className="text-emerald-500">History</span>
            </h1>
            <div className="hidden md:flex flex-col items-end">
               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Authenticated Subject</p>
               <p className="text-[11px] font-bold">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-900 rounded-[3rem]">
              <FiPackage size={48} className="mb-6 opacity-10" />
              <p className="text-[12px] font-black uppercase tracking-[0.5em] italic opacity-40">
                Manifest Zero
              </p>
              <button 
                onClick={() => router.push("/shop")}
                className="mt-8 px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
              >
                Start Acquisition
              </button>
            </div>
          ) : (
            orders.map((order) => {
              const remains = getStatusDisplay(order.status);
              const isExpanded = expandedOrderId === order.id;

              return (
                <div 
                  key={order.id}
                  className={`bg-white dark:bg-zinc-950 border transition-all duration-300 rounded-[2rem] overflow-hidden ${isExpanded ? "border-emerald-500/30 shadow-2xl dark:shadow-none" : "border-zinc-100 dark:border-zinc-900"}`}
                >
                  {/* Row Header */}
                  <div 
                    className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer"
                    onClick={() => toggleExpand(order.id)}
                  >
                    <div className="flex items-center gap-6">
                       <div className={`p-4 rounded-2xl ${isExpanded ? "bg-emerald-500 text-white" : "bg-zinc-50 dark:bg-zinc-900 text-zinc-400"} transition-colors`}>
                          <FiPackage size={20} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">ID: {order.order_id}</p>
                          <p className="text-[14px] font-black uppercase italic">
                            {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                       </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end flex-1 gap-8">
                       <div className="text-right hidden sm:block">
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Total Payload</p>
                          <p className="text-[14px] font-black">IDR {Number(order.total_price).toLocaleString()}</p>
                       </div>
                       <div className={`px-5 py-2 rounded-full border text-[9px] font-black tracking-widest ${remains.color}`}>
                          {remains.text}
                       </div>
                       <div className="text-zinc-300">
                          {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                       </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/10 px-6 py-8 md:px-12 md:pb-12 space-y-10"
                      >
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Manifest */}
                            <div className="space-y-6">
                               <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic">Order Manifest</h3>
                               <div className="space-y-3">
                                  {order.items?.map((item: any) => (
                                    <div key={item.id} className="flex justify-between items-center bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                       <div>
                                          <p className="text-[10px] font-black uppercase">{item.product_name}</p>
                                          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{item.size} × {item.quantity}</p>
                                       </div>
                                       <p className="text-[10px] font-black">IDR {Number(item.price).toLocaleString()}</p>
                                    </div>
                                  ))}
                               </div>
                               <div className="flex justify-between items-center pt-4 border-t border-zinc-200 dark:border-zinc-800">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Settlement</span>
                                  <span className="text-xl font-black italic">IDR {Number(order.total_price).toLocaleString()}</span>
                               </div>
                            </div>

                            {/* Logistics */}
                            <div className="space-y-6">
                               <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic">Logistics Detail</h3>
                               <div className="bg-white dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-6">
                                  <div className="flex gap-4">
                                     <FiMapPin className="text-emerald-500 shrink-0 mt-1" />
                                     <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">Destination Address</p>
                                        <p className="text-[11px] font-bold leading-relaxed">{order.shipping_address}</p>
                                     </div>
                                  </div>
                                  <div className="flex gap-4">
                                     <FiClock className="text-zinc-300 shrink-0 mt-1" />
                                     <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">Status Timeline</p>
                                        <p className="text-[11px] font-bold">Updated: {new Date(order.updated_at).toLocaleString()}</p>
                                     </div>
                                  </div>
                               </div>
                               
                               {order.status === "pending" && (
                                 <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-center gap-4">
                                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-amber-600">Awaiting Signal Verification</p>
                                 </div>
                               )}
                               
                               {order.status === "paid" && (
                                 <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-4">
                                    <FiCheckCircle className="text-emerald-500" />
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-600">Payment Secured - Preparing Payload</p>
                                 </div>
                               )}
                            </div>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
