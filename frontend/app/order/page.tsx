"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

// 1. Komponen Internal yang menggunakan searchParams
function OrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [trxId, setTrxId] = useState("");

  useEffect(() => {
    setTrxId(Math.floor(100000 + Math.random() * 900000).toString());
  }, []);

  const handleProceed = () => {
    setLoading(true);
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    setTimeout(() => {
      if (!token) {
        Swal.fire({
          title: "AUTH_REQUIRED",
          text: "You must be identified to proceed to checkout.",
          icon: "info",
          confirmButtonColor: "#000",
          customClass: {
            popup: "rounded-[2rem]",
          },
        }).then(() => {
          // Arahkan ke login dengan callback balik ke sini
          router.push(`/login?callback=/order?id=${serviceId}`);
        });
      } else {
        router.push(`/checkout?id=${serviceId}`);
      }
      setLoading(false);
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[3rem] p-10 md:p-16 shadow-sm border border-gray-100"
    >
      <header className="mb-12 border-b border-gray-50 pb-10">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-4">
          Review_Order
        </h1>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em]">
          Transaction ID: #TRX-{trxId || "------"}
        </p>
      </header>

      <div className="flex flex-col gap-8 mb-16">
        <div className="flex justify-between items-end bg-gray-50 p-8 rounded-[2rem]">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-blue-600 mb-2">
              Service_Selected
            </p>
            <h3 className="text-2xl font-black italic uppercase">
              Artifact #{serviceId || "0"}
            </h3>
          </div>
          <p className="text-xl font-black italic text-black">Rp 5.000.000</p>
        </div>
      </div>

      <button
        onClick={handleProceed}
        disabled={loading}
        className="w-full bg-black text-white p-8 rounded-[2.5rem] font-black uppercase text-xs hover:bg-blue-600 transition-all flex items-center justify-center gap-4 disabled:bg-gray-400"
      >
        {loading ? "CHECKING_AUTH..." : "Validate & Proceed"}
      </button>
    </motion.div>
  );
}

// 2. Komponen Page Utama (Wrapper Suspense)
export default function OrderPage() {
  return (
    <main className="min-h-screen pt-40 pb-20 px-6 md:px-12 bg-[#FBFBFD]">
      <div className="max-w-3xl mx-auto">
        {/* Suspense Boundary wajib ada untuk useSearchParams di App Router */}
        <Suspense
          fallback={
            <div className="bg-white rounded-[3rem] p-20 shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300">
                Loading_Secure_Vault...
              </p>
            </div>
          }
        >
          <OrderContent />
        </Suspense>
      </div>
    </main>
  );
}
