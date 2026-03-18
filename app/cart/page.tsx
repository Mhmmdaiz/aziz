"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FiTrash2,
  FiCheck,
  FiMinus,
  FiPlus,
  FiPackage,
  FiArrowRight,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";

// PERBAIKAN: Gunakan Environment Variable atau fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const router = useRouter();

  // Load cart data
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
    setSelectedIds(savedCart.map((item: any) => item.id));
  }, []);

  // Sync ke LocalStorage setiap kali cart berubah
  const saveAndSetCart = (updatedCart: any[]) => {
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    // Trigger event agar Navbar/Cart Icon di komponen lain ikut update
    window.dispatchEvent(new Event("storage"));
  };

  const updateQuantity = (id: number, delta: number) => {
    const updatedCart = cart.map((item) => {
      if (item.id === id) {
        const newQty = Math.max(1, (item.quantity || 1) + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    saveAndSetCart(updatedCart);
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const removeFromCart = (id: number) => {
    const updatedCart = cart.filter((item) => item.id !== id);
    saveAndSetCart(updatedCart);
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  };

  const totalPrice = useMemo(() => {
    return cart
      .filter((item) => selectedIds.includes(item.id))
      .reduce(
        (acc, item) => acc + Number(item.price) * (item.quantity || 1),
        0,
      );
  }, [cart, selectedIds]);

  const handleCheckout = () => {
    const itemsToCheckout = cart.filter((item) =>
      selectedIds.includes(item.id),
    );

    if (itemsToCheckout.length === 0) {
      Swal.fire({
        title: "SELECTION_EMPTY",
        text: "Please select at least one item to proceed.",
        icon: "warning",
        confirmButtonColor: "#000",
        background: "#000",
        color: "#fff",
      });
      return;
    }

    localStorage.setItem("checkout_items", JSON.stringify(itemsToCheckout));
    localStorage.setItem("checkout_total", totalPrice.toString());

    const token = localStorage.getItem("token");
    router.push(token ? "/checkout" : "/login?redirect=checkout");
  };

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white pt-24 md:pt-32 pb-20 selection:bg-blue-500 transition-colors duration-500">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12 md:mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-baseline gap-4"
          >
            <span className="text-[10px] font-black text-blue-600 tracking-[0.5em] uppercase vertical-text hidden md:block">
              Inventory_v1
            </span>
            <h1 className="text-[clamp(3.5rem,12vw,9rem)] font-black italic uppercase tracking-tighter leading-[0.8] text-zinc-900 dark:text-white">
              Bag<span className="text-blue-600">.</span>
            </h1>
          </motion.div>
          <div className="h-[2px] w-full bg-zinc-900 dark:bg-white/10 mt-8 md:mt-12" />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16 items-start">
          {/* CART LIST */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            <AnimatePresence mode="popLayout">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`group relative bg-white dark:bg-zinc-950 p-4 md:p-8 rounded-[2rem] md:rounded-[3rem] border transition-all duration-500 flex flex-row items-center gap-4 md:gap-10 ${
                      selectedIds.includes(item.id)
                        ? "border-zinc-900 dark:border-white shadow-2xl"
                        : "border-zinc-100 dark:border-white/5 opacity-60"
                    }`}
                  >
                    {/* CHECKBOX */}
                    <button
                      onClick={() => toggleSelect(item.id)}
                      className={`shrink-0 w-6 h-6 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedIds.includes(item.id)
                          ? "bg-black dark:bg-white border-black dark:border-white"
                          : "border-zinc-200 dark:border-zinc-800"
                      }`}
                    >
                      {selectedIds.includes(item.id) && (
                        <FiCheck
                          className="text-white dark:text-black"
                          size={16}
                        />
                      )}
                    </button>

                    {/* IMAGE */}
                    <div className="w-24 h-24 md:w-40 md:h-40 shrink-0 bg-zinc-100 dark:bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-100 dark:border-white/5 relative">
                      <img
                        src={
                          item.image.startsWith("http")
                            ? item.image
                            : `${API_BASE_URL}/storage/${item.image}`
                        }
                        alt={item.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                      />
                    </div>

                    {/* INFO */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg md:text-3xl font-black italic uppercase tracking-tighter leading-tight truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm md:text-xl font-mono text-zinc-400 mb-4">
                        IDR {Number(item.price).toLocaleString()}
                      </p>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-full p-1 border border-zinc-200 dark:border-white/5">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-full transition-all"
                          >
                            <FiMinus size={12} />
                          </button>
                          <span className="w-8 text-center font-black text-xs">
                            {item.quantity || 1}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-full transition-all"
                          >
                            <FiPlus size={12} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-zinc-300 hover:text-red-500 transition-colors"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-20 text-center opacity-20 italic uppercase font-black tracking-widest text-[10px]">
                  Inventory_is_Empty
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* SUMMARY SIDEBAR */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-32">
            <div className="bg-zinc-900 dark:bg-white text-white dark:text-black p-8 md:p-12 rounded-[3rem] shadow-2xl">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-4 block">
                Final_Valuation
              </span>
              <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none mb-10">
                Total<span className="text-blue-600">.</span>
              </h2>

              <div className="space-y-6 border-t border-white/10 dark:border-black/10 pt-8 mb-10">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                    Subtotal
                  </span>
                  <p className="text-3xl md:text-4xl font-black italic tracking-tighter">
                    {totalPrice.toLocaleString()}
                  </p>
                </div>
                <div className="flex justify-between items-center italic">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                    Shipping
                  </span>
                  <span className="text-[9px] font-black uppercase">
                    Calculated_Later
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={selectedIds.length === 0}
                className="w-full py-6 bg-blue-600 text-white dark:bg-black rounded-full font-black uppercase tracking-[0.3em] text-[11px] hover:bg-white hover:text-black transition-all active:scale-95 disabled:opacity-20 flex items-center justify-center gap-3"
              >
                Execute_Order ({selectedIds.length})
                <FiArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
