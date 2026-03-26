"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { FiCheckCircle, FiArrowRight, FiPackage, FiZap } from "react-icons/fi";
import confetti from "canvas-confetti";
import { supabase } from "@/utils/supabase/client";


function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id") || "CHCKT-XXXXX";

  useEffect(() => {
    // Premium celebration
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const [status, setStatus] = useState<string | null>(null);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("status, payment_payload")
        .eq("order_id", orderId)
        .single();
      
      if (!error && data) {
        setStatus(data.status);
        setPaymentLink(data.payment_payload);
      }
      setLoadingStatus(false);
    };

    if (orderId) fetchStatus();
  }, [orderId]);

  return (
    <main className="min-h-screen bg-white dark:bg-[#030303] text-black dark:text-white flex flex-col items-center justify-center px-6 py-20 font-mono overflow-hidden transition-colors duration-500">
      {/* Noise Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-50 dark:opacity-[0.05]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      <div className="max-w-3xl w-full text-center space-y-12 relative z-10">
        {/* Animated Badge */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 12 }}
          className={`inline-flex items-center gap-3 px-6 py-2 ${status === 'paid' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-amber-500 shadow-amber-500/20'} text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl`}
        >
          <FiZap className="animate-pulse" /> {status === 'paid' ? 'Transaction Successful' : 'Order Secured'}
        </motion.div>

        {/* Hero Text */}
        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter leading-[0.8] mb-8"
          >
            Order <br /> <span className="text-zinc-300 dark:text-zinc-800">Secured.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[11px] md:text-xs font-black uppercase tracking-[0.5em] text-zinc-500 max-w-lg mx-auto leading-relaxed"
          >
            Your items have been secured. {status === 'paid' ? 'We are now preparing them for shipment.' : 'Please complete your payment to process the shipment.'}
          </motion.p>
        </div>

        {/* Order Details Board */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-[3rem] p-10 md:p-16 space-y-8 backdrop-blur-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Order ID</p>
              <p className="text-xl font-black italic text-red-600">{orderId}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</p>
              <div className={`flex items-center gap-2 ${status === 'paid' ? 'text-emerald-500' : 'text-amber-500'} font-black italic`}>
                {loadingStatus ? (
                   <span className="animate-pulse opacity-50">VERIFYING STATUS...</span>
                ) : (
                  <>
                    <FiCheckCircle className={status === 'paid' ? 'text-emerald-500' : 'text-amber-500 animate-pulse'} /> 
                    {status === 'paid' ? 'PAID & VERIFIED' : 'AWAITING PAYMENT'}
                  </>
                )}
              </div>
            </div>
          </div>


          <div className="pt-8 border-t border-zinc-200 dark:border-white/5">
             <div className="flex flex-col md:flex-row gap-4">
                {status !== 'paid' && paymentLink && (
                  <a 
                    href={paymentLink}
                    className="flex-1 px-8 py-5 bg-red-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-red-500/20"
                  >
                    <FiZap className="animate-bounce" /> PAY NOW
                  </a>
                )}
                <Link 
                  href="/orders" 
                  className="flex-1 px-8 py-5 bg-black dark:bg-white text-white dark:text-black rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all flex items-center justify-center gap-3"
                >
                  <FiPackage /> Track Order <FiArrowRight />
                </Link>
                <Link 
                  href="/shop" 
                  className="flex-1 px-8 py-5 border-2 border-zinc-200 dark:border-zinc-800 text-zinc-500 rounded-full text-[10px] font-black uppercase tracking-widest hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-all flex items-center justify-center"
                >
                  Continue Shopping
                </Link>
             </div>
          </div>


        </motion.div>

        {/* Footer Credit */}
        <div className="pt-10 opacity-20">
          <p className="text-[9px] font-black uppercase tracking-[0.4em]">Proprietary Technology by CHCKT-STORE</p>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}
