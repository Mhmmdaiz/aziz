"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheckCircle, FiLoader, FiSmartphone } from "react-icons/fi";
import { supabase } from "@/utils/supabase/client";

interface QRISModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrData: string;
  orderId: string;
  amount: number;
  onSuccess: () => void;
}

export default function QRISModal({
  isOpen,
  onClose,
  qrData,
  orderId,
  amount,
  onSuccess,
}: QRISModalProps) {
  const [status, setStatus] = useState<"pending" | "paid" | "expired">("pending");

  // POLING STATUS PESANAN
  useEffect(() => {
    if (!isOpen || status === "paid") return;

    const checkStatus = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("status")
        .eq("order_id", orderId)
        .single();

      if (data?.status === "paid") {
        setStatus("paid");
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    };

    const interval = setInterval(checkStatus, 5000); // Cek setiap 5 detik
    return () => clearInterval(interval);
  }, [isOpen, orderId, status, onSuccess]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-hidden">
          {/* OVERLAY */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={status === "pending" ? onClose : undefined}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          {/* MODAL CONTENT */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white text-black overflow-hidden border-[4px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
          >
            {/* CLOSE BUTTON */}
            {status === "pending" && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-zinc-100 transition-colors z-10"
              >
                <FiX size={24} />
              </button>
            )}

            <div className="p-8 space-y-8">
              {/* HEADER */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  <FiSmartphone size={12} />
                  Secure Node
                </div>
                <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">
                  QRIS Gateway<span className="text-emerald-500">.</span>
                </h2>
              </div>

              {/* QR CODE AREA */}
              <div className="relative aspect-square w-full bg-zinc-50 border-2 border-black flex items-center justify-center p-6 group">
                <AnimatePresence mode="wait">
                  {status === "pending" ? (
                    <motion.div
                      key="qr"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full h-full flex items-center justify-center"
                    >
                      <QRCodeSVG
                        value={qrData}
                        size={300}
                        level="H"
                        includeMargin={false}
                        className="w-full h-full"
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="success"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center gap-4 text-emerald-500"
                    >
                      <FiCheckCircle size={80} strokeWidth={3} />
                      <span className="text-xs font-black uppercase tracking-[0.3em]">
                        Verified
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* DECORATIVE CORNERS */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-black" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-black" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-black" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-black" />
              </div>

              {/* DETAILS */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                      Total Amount
                    </p>
                    <p className="text-xl font-black italic">
                      Rp {amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                      Order ID
                    </p>
                    <p className="text-xs font-bold font-mono truncate">
                      {orderId}
                    </p>
                  </div>
                </div>

                {/* FOOTER MESSAGE */}
                <div className="flex items-center gap-3 p-4 bg-zinc-100 border-l-4 border-black">
                  {status === "pending" ? (
                    <>
                      <FiLoader className="animate-spin text-zinc-400" size={16} />
                      <p className="text-[10px] font-bold uppercase tracking-wider leading-tight">
                        Waiting for payment confirmation from node...
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <p className="text-[10px] font-bold uppercase tracking-wider leading-tight">
                        Transaction cleared. Finalizing logistics...
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* BRANDING */}
              <div className="pt-4 border-t border-zinc-100 flex justify-between items-center opacity-30">
                <span className="text-[8px] font-black tracking-[0.5em] uppercase">
                  Daemonium.System
                </span>
                <span className="text-[8px] font-black tracking-[0.5em] uppercase">
                  v01.2026
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
