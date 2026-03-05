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

const API_BASE_URL = "http://127.0.0.1:8000";

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const router = useRouter();

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
    setSelectedIds(savedCart.map((item: any) => item.id));
  }, []);

  const updateQuantity = (id: number, delta: number) => {
    const updatedCart = cart.map((item) => {
      if (item.id === id) {
        const newQty = Math.max(1, (item.quantity || 1) + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const removeFromCart = (id: number) => {
    const updatedCart = cart.filter((item) => item.id !== id);
    setCart(updatedCart);
    setSelectedIds((prev) => prev.filter((i) => i !== id));
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // Optimization: Memoized Total Price
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
        title: "Selection Empty",
        text: "Please select at least one item to proceed.",
        icon: "warning",
        confirmButtonColor: "#000",
      });
      return;
    }
    localStorage.setItem("checkout_items", JSON.stringify(itemsToCheckout));
    localStorage.setItem("checkout_total", totalPrice.toString());
    const token = localStorage.getItem("token");
    router.push(token ? "/checkout" : "/login");
  };

  return (
    <main className="min-h-screen bg-[#fafafa] text-black pt-24 md:pt-32 pb-20 selection:bg-black selection:text-white">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* --- DYNAMIC HEADER --- */}
        <header className="mb-12 md:mb-20">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(3.5rem,15vw,10rem)] font-black italic uppercase tracking-tighter leading-[0.85] text-black"
          >
            Bag<span className="text-zinc-200">.</span>
          </motion.h1>
          <div className="h-px w-full bg-zinc-200 mt-8 md:mt-12" />
        </header>

        {/* --- GRID SYSTEM --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
          {/* CART LIST (LEFT) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4 md:space-y-6">
            <AnimatePresence mode="popLayout" initial={false}>
              {cart.length > 0 ? (
                cart.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className={`group relative bg-white p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] border-2 flex flex-row items-center gap-4 md:gap-8 transition-all duration-500 ${
                      selectedIds.includes(item.id)
                        ? "border-black shadow-xl shadow-black/5"
                        : "border-transparent opacity-50 grayscale hover:opacity-100 hover:grayscale-0"
                    }`}
                  >
                    {/* CUSTOM CHECKBOX */}
                    <button
                      onClick={() => toggleSelect(item.id)}
                      className={`shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        selectedIds.includes(item.id)
                          ? "bg-black border-black"
                          : "border-zinc-200 bg-white hover:border-black"
                      }`}
                    >
                      {selectedIds.includes(item.id) && (
                        <FiCheck className="text-white" size={14} />
                      )}
                    </button>

                    {/* PRODUCT IMAGE */}
                    <div className="w-20 h-20 md:w-32 md:h-32 shrink-0 bg-zinc-50 rounded-xl md:rounded-[2rem] overflow-hidden border border-zinc-100 relative">
                      <img
                        src={`${API_BASE_URL}/storage/${item.image}`}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>

                    {/* INFO BLOCK */}
                    <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="text-lg md:text-2xl font-black italic uppercase tracking-tighter leading-none truncate pr-4">
                          {item.name}
                        </h3>
                        <p className="text-sm md:text-lg font-bold italic tracking-tighter text-zinc-400">
                          Rp {Number(item.price).toLocaleString()}
                        </p>
                      </div>

                      {/* CONTROLS */}
                      <div className="flex items-center gap-3 md:gap-6 self-start md:self-center">
                        <div className="flex items-center bg-zinc-50 rounded-full border border-zinc-100 p-1">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-7 h-7 md:w-9 md:h-9 flex items-center justify-center hover:bg-white rounded-full transition-all"
                          >
                            <FiMinus size={12} />
                          </button>
                          <span className="w-8 md:w-10 text-center font-black italic text-xs md:text-sm">
                            {item.quantity || 1}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-7 h-7 md:w-9 md:h-9 flex items-center justify-center hover:bg-white rounded-full transition-all"
                          >
                            <FiPlus size={12} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-zinc-300 hover:text-red-500 transition-colors"
                          title="Remove item"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-32 flex flex-col items-center justify-center text-zinc-300 space-y-4"
                >
                  <FiPackage size={48} strokeWidth={1} />
                  <p className="italic uppercase text-[10px] tracking-[0.4em] font-black">
                    Inventory_is_Empty
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* SUMMARY SIDEBAR (RIGHT) */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-black text-white p-8 md:p-10 rounded-3xl md:rounded-[3rem] lg:sticky lg:top-28 shadow-2xl shadow-black/20">
              <div className="space-y-10">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 italic">
                    Checkout_Valuation
                  </p>
                  <h2 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
                    Total<span className="text-zinc-800">.</span>
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-zinc-800 pb-6">
                    <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest italic">
                      Subtotal
                    </span>
                    <p className="text-3xl md:text-4xl font-black italic tracking-tighter leading-none">
                      <span className="text-[10px] align-top mr-1 opacity-40 font-bold">
                        IDR
                      </span>
                      {totalPrice.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-zinc-500">
                    <span className="text-[10px] uppercase font-bold tracking-widest italic">
                      Shipping
                    </span>
                    <span className="text-[10px] font-black uppercase italic tracking-widest">
                      Calculated_at_Step_2
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={selectedIds.length === 0}
                  className="group relative w-full py-5 md:py-6 bg-white text-black rounded-full font-black uppercase tracking-[0.3em] text-[11px] hover:bg-zinc-200 active:scale-[0.98] transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  Execute_Purchase ({selectedIds.length})
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-center text-[8px] text-zinc-600 uppercase tracking-widest font-bold italic">
                  * All transactions are encrypted and secure
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
