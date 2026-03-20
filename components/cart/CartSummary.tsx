"use client";

import { motion } from "framer-motion";
import { FiArrowRight, FiLock, FiShield, FiZap } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/providers/CartProvider";

interface CartSummaryProps {
  total: number;
  count: number;
}

export default function CartSummary({ total, count }: CartSummaryProps) {
  const router = useRouter();
  const { cart } = useCart();
  const freeShippingThreshold = 500000;
  const progress = Math.min((total / freeShippingThreshold) * 100, 100);
  const remaining = freeShippingThreshold - total;

  const handleCheckout = () => {
    localStorage.setItem("checkout_items", JSON.stringify(cart));
    router.push("/checkout");
  };

  return (
    <div className="space-y-6">
      {/* Summary Box */}
      <div className="bg-zinc-900/60 p-8 md:p-10 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[80px] -mr-16 -mt-16 rounded-full" />
        
        

        {/* Free Shipping Progress */}
        

        <div className="space-y-4 border-t border-white/5 pt-8 mb-10">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Subtotal</span>
            <span className="text-lg font-black italic text-zinc-300">Rp {total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Shipping</span>
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                {progress >= 100 ? "COMPLIMENTARY" : "TBD ON CHECKOUT"}
            </span>
          </div>
          <div className="h-px w-full bg-white/5 my-4" />
          <div className="flex justify-between items-end">
             <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 block mb-1">Total Amount</span>
                <span className="text-4xl font-black italic uppercase text-white tracking-tighter leading-none">Total</span>
             </div>
             <div className="text-right">
                <span className="text-4xl font-black italic text-white tracking-tighter leading-none">
                  Rp {total.toLocaleString()}
                </span>
             </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleCheckout}
          className="w-full group relative py-6 bg-indigo-600 hover:bg-white text-white hover:text-black rounded-[2rem] font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-4 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          Checkout
          <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
        </button>

        {/* Urgency Message */}
        
      </div>

      
    </div>
  );
}
