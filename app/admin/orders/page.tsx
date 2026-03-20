"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiChevronDown,
  FiChevronUp,
  FiBox,
  FiClock,
  FiCheck,
  FiX,
  FiRefreshCw,
  FiMapPin,
  FiPhone,
  FiMail,
} from "react-icons/fi";
import Swal from "sweetalert2";
import { updateOrderStatusAction } from "./actions";

export default function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showPreOrderOnly, setShowPreOrderOnly] = useState(false);

  // Authentication Check
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push("/auth");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role !== "admin") {
          router.push("/");
          return;
        }
        setAuthLoading(false);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/");
      }
    };
    checkAdmin();
  }, [router]);

  // Data Fetching and Realtime Subscription
  useEffect(() => {
    if (authLoading) return;

    fetchOrders();

    const channel = supabase
      .channel("admin_orders_channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          // Re-fetch all orders on any change to ensure relation data (items) is fresh
          // Or we could optimally just fetch the changed order
          fetchOrders();

          Swal.fire({
            toast: true,
            position: "bottom-end",
            icon: "info",
            title: "Vault Sync",
            text: "Incoming timeline mutation detected.",
            showConfirmButton: false,
            timer: 3000,
            background: "#0B0B0B",
            color: "#fff",
            customClass: { popup: "border border-zinc-800" },
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authLoading]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          items:order_items(*)
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      console.error("Fetch orders error:", err);
      Swal.fire("Sync Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesPreOrder = !showPreOrderOnly || order.is_preorder === true;

    return matchesSearch && matchesStatus && matchesPreOrder;
  });

  const toggleExpand = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const handleStatusChange = async (
    orderId: string,
    currentStatus: string,
    newStatus: string,
  ) => {
    if (currentStatus === newStatus) return;

    // Optimistic UI Update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
    );

    const result = await updateOrderStatusAction(orderId, newStatus);
    if (!result.success) {
      // Revert on failure
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: currentStatus } : o,
        ),
      );
      Swal.fire("Update Failed", result.error, "error");
    } else {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Status Updated",
        showConfirmButton: false,
        timer: 1500,
        background: "#0B0B0B",
        color: "#fff",
      });
    }
  };

  if (authLoading || (loading && orders.length === 0)) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center font-mono bg-[#FBFBFD] dark:bg-black text-black dark:text-white">
        <FiRefreshCw className="w-8 h-8 animate-spin mb-4" />
        <div className="text-[10px] font-black tracking-[0.5em] uppercase">
          Synchronizing Orders...
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "paid":
        return "bg-cyan-500/10 text-cyan-500 border-cyan-500/20";
      case "processing":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "shipped":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "completed":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
    }
  };

  return (
    <main className="min-h-screen bg-[#FBFBFD] dark:bg-black text-black dark:text-white pt-24 pb-20 px-4 md:px-8 font-mono">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <header className="space-y-8 mt-5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-200 dark:border-zinc-900 pb-8">
            <div>
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">
                Logistics<span className="text-cyan-500"> </span>Vault
              </h1>
            </div>
            <div className="bg-white dark:bg-zinc-950 px-6 py-3 border border-zinc-200 dark:border-zinc-800 rounded-full flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                Live
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-full">
                {filteredOrders.length} / {orders.length}
              </span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative group">
              <input 
                type="text"
                placeholder="SEARCH_BY_ID_OR_NAME..."
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-4 pl-12 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-cyan-500 transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-800">
                <FiRefreshCw className={loading ? "animate-spin" : ""} size={14} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {['all', 'pending', 'paid', 'processing', 'shipped', 'completed'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                    statusFilter === s 
                    ? "bg-black dark:bg-white text-white dark:text-black border-transparent shadow-lg shadow-cyan-500/10" 
                    : "bg-white dark:bg-zinc-950 border-zinc-100 dark:border-zinc-900 text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  {s === "paid" ? "Sudah Bayar" : s}
                </button>
              ))}
              
              <button
                onClick={() => setShowPreOrderOnly(!showPreOrderOnly)}
                className={`ml-2 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                  showPreOrderOnly 
                  ? "bg-emerald-500 text-white border-transparent" 
                  : "bg-white dark:bg-zinc-950 border-zinc-100 dark:border-zinc-900 text-emerald-600/50 hover:border-emerald-500/20"
                }`}
              >
                Pre-Order Only
              </button>
            </div>
          </div>
        </header>

        {/* Orders Table/List */}
        <div className="w-full space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-900 rounded-[2rem]">
              <FiBox size={48} className="mb-6 opacity-20" />
              <p className="text-[12px] font-black uppercase tracking-[0.5em] italic">
                No_Artifacts_Found
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isExpanded = expandedOrderId === order.id;
              return (
                <div
                  key={order.id}
                  className={`bg-white dark:bg-zinc-950 border transition-all duration-300 rounded-[1.5rem] overflow-hidden ${isExpanded ? "border-cyan-500/50 shadow-2xl dark:shadow-none" : "border-zinc-200 dark:border-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-700"}`}
                >
                  {/* Row Header */}
                  <div
                    className="p-6 md:px-8 grid grid-cols-2 md:grid-cols-6 items-center gap-4 cursor-pointer"
                    onClick={() => toggleExpand(order.id)}
                  >
                    <div className="col-span-2 md:col-span-1">
                      <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                        Identifier
                      </p>
                      <p className="text-[11px] font-bold truncate">
                        {order.order_id}
                      </p>
                    </div>
                    <div className="hidden md:block col-span-1">
                      <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                        Customer
                      </p>
                      <p className="text-[11px] font-bold truncate">
                        {order.customer_name}
                      </p>
                    </div>
                    <div className="col-span-1">
                      <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                        Timestamp
                      </p>
                      <p className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 truncate">
                        {new Date(order.created_at).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="col-span-1 text-left md:text-right">
                      <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                        Total
                      </p>
                      <p className="text-[11px] font-black">
                        IDR {Number(order.total_price).toLocaleString()}
                      </p>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <span
                        className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full border ${getStatusColor(order.status)}`}
                      >
                        {order.status === "paid" ? "SUDAH BAYAR" : order.status}
                      </span>
                    </div>
                    <div className="hidden md:flex col-span-1 justify-end">
                      <button className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
                        {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Accordion */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-[#050505]"
                      >
                        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
                          {/* Left: Subject Details */}
                          <div className="space-y-8">
                            <div>
                              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-6 italic">
                                Customer Details
                              </h3>
                              <div className="bg-white dark:bg-zinc-900/50 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 space-y-4">
                                <div className="flex gap-4 items-start">
                                  <FiMail className="text-zinc-400 shrink-0 mt-1" />
                                  <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">
                                      Email
                                    </p>
                                    <p className="text-[11px] font-bold">
                                      {order.customer_email}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                  <FiPhone className="text-zinc-400 shrink-0 mt-1" />
                                  <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">
                                      Phone
                                    </p>
                                    <p className="text-[11px] font-bold">
                                      {order.customer_phone}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                  <FiMapPin className="text-zinc-400 shrink-0 mt-1" />
                                  <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">
                                      Address
                                    </p>
                                    <p className="text-[11px] font-bold leading-relaxed">
                                      {order.shipping_address}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-6 italic">
                                Order Status
                              </h3>
                              <div className="flex flex-wrap gap-3">
                                {[
                                  "PENDING",
                                  "PAID",
                                  "PROCESSING",
                                  "SHIPPED",
                                  "COMPLETED",
                                  "CANCELLED",
                                ].map((sts) => (
                                  <button
                                    key={sts}
                                    onClick={() =>
                                      handleStatusChange(
                                        order.id,
                                        order.status,
                                        sts.toLowerCase(),
                                      )
                                    }
                                    className={`px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${
                                      order.status.toLowerCase() ===
                                      sts.toLowerCase()
                                        ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                                        : "bg-white dark:bg-zinc-900 text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-cyan-500/50"
                                    }`}
                                  >
                                    {sts === "PAID" ? "SUDAH BAYAR" : sts}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Right: Manifest */}
                          <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-6 italic">
                              Order Items ({order.items?.length || 0})
                            </h3>
                            <div className="space-y-4">
                              {order.items?.map((item: any) => (
                                <div
                                  key={item.id}
                                  className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-between"
                                >
                                  <div>
                                    <p className="text-[10px] font-black uppercase truncate max-w-[200px] mb-1">
                                      {item.product_name}
                                    </p>
                                    <div className="flex items-center gap-3 text-[9px] font-bold text-zinc-500 tracking-widest uppercase">
                                      <span>Size: {item.size}</span>
                                      <span className="w-1 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
                                      <span>Qty: {item.quantity}</span>
                                    </div>
                                  </div>
                                  <p className="text-[10px] font-black">
                                    IDR {Number(item.price).toLocaleString()}
                                  </p>
                                </div>
                              ))}
                            </div>

                            <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                Gross_Total
                              </span>
                              <span className="text-xl font-black italic">
                                IDR {Number(order.total_price).toLocaleString()}
                              </span>
                            </div>
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
