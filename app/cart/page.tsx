"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/components/providers/CartProvider";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import CartEmpty from "@/components/cart/CartEmpty";
import { FiArrowRight, FiShield } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CartPage() {
  const { cart, cartCount, cartTotal } = useCart();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-black text-white pt-24 md:pt-36 pb-32">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        {/* Header Section */}
        <header className="mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
              <h1 className="text-[clamp(3rem,10vw,8rem)] font-black italic uppercase tracking-tighter leading-[0.8]">
                Cart<span className="text-indigo-500">.</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-zinc-500 border-l border-white/10 pl-8 h-fit">
               
               <div>
                  <span className="block text-white mb-1">Rp {cartTotal.toLocaleString()}</span>
                  TOTAL VALUATION
               </div>
            </div>
          </motion.div>
          <div className="h-px w-full bg-gradient-to-r from-white/10 via-white/5 to-transparent mt-12" />
        </header>

        {cart.length === 0 ? (
          <CartEmpty />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20 items-start">
            {/* LEFT: Cart Items */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                            
              <AnimatePresence mode="popLayout" initial={false}>
                {cart.map((item) => (
                  <CartItem key={item.cartId} item={item} />
                ))}
              </AnimatePresence>

              {/* Security Badge (Mobile only shows below items) */}
              
            </div>

            {/* RIGHT: Summary (Sticky) */}
            <aside className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-36 pb-12">
               <CartSummary total={cartTotal} count={cartCount} />
                              
            </aside>
          </div>
        )}
      </div>

      {/* MOBILE STICKY CTA */}
      {cart.length > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:hidden bg-black/80 backdrop-blur-xl border-t border-white/5"
        >
          <button
            onClick={() => router.push("/checkout")}
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl flex items-center justify-center gap-3"
          >
            Checkout_Now (Rp {cartTotal.toLocaleString()})
            <FiArrowRight />
          </button>
        </motion.div>
      )}
    </main>
  );
}
