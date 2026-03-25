"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiArrowRight } from "react-icons/fi";
import { useCart } from "@/components/providers/CartProvider";
import Link from "next/link";

export default function SideCart() {
  const { cart, cartTotal, isCartOpen, setIsCartOpen, updateQuantity, removeItem } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-[#0A0A0A] z-[160] shadow-2xl flex flex-col border-l border-zinc-200 dark:border-white/5"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiShoppingBag className="text-zinc-400" size={20} />
                <h2 className="text-xl font-black italic uppercase tracking-tighter">Your Bag</h2>
                <span className="bg-zinc-100 dark:bg-white/5 px-2 py-0.5 rounded text-[10px] font-bold">
                  {cart.length} ITEMS
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-full transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-zinc-50 dark:bg-white/5 rounded-full flex items-center justify-center">
                    <FiShoppingBag size={32} className="text-zinc-300" />
                  </div>
                  <div>
                    <p className="font-bold uppercase tracking-widest text-xs">Your bag is empty</p>
                    <p className="text-zinc-400 text-sm mt-1">Add some pieces to start your collection.</p>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-4 px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.cartId} className="flex gap-4 group">
                    <div className="w-24 h-32 bg-zinc-50 dark:bg-zinc-900 rounded-xl overflow-hidden flex-shrink-0 border border-zinc-100 dark:border-white/5">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-sm uppercase tracking-tight">{item.name}</h3>
                          <button
                            onClick={() => removeItem(item.cartId)}
                            className="text-zinc-300 hover:text-red-500 transition-colors"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1 uppercase tracking-widest">Size: {item.size}</p>
                      </div>

                      <div className="flex justify-between items-end">
                        <div className="flex items-center border border-zinc-100 dark:border-white/5 rounded-lg bg-zinc-50 dark:bg-white/5">
                          <button
                            onClick={() => updateQuantity(item.cartId, -1)}
                            className="p-1.5 hover:text-red-500 transition-colors"
                          >
                            <FiMinus size={14} />
                          </button>
                          <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.cartId, 1)}
                            className="p-1.5 hover:text-red-500 transition-colors"
                          >
                            <FiPlus size={14} />
                          </button>
                        </div>
                        <p className="font-black text-sm italic">
                          ${(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-6 bg-zinc-50 dark:bg-[#0D0D0D] border-t border-zinc-200 dark:border-white/5">
                <div className="flex justify-between items-center mb-6">
                  <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Subtotal</p>
                  <p className="text-2xl font-black italic">${cartTotal.toLocaleString()}</p>
                </div>
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs hover:gap-5 transition-all group"
                >
                  Checkout Now
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <p className="text-center text-[10px] text-zinc-400 mt-4 uppercase tracking-[0.2em]">
                  Shipping & taxes calculated at checkout
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
