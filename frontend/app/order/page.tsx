"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";
import Swal from "sweetalert2";

interface Post {
  id: number;
  title: string;
  price: number;
}

function OrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [item, setItem] = useState<Post | null>(null);
  const [trxId, setTrxId] = useState("");

  useEffect(() => {
    const fetchItemData = async () => {
      if (!serviceId) return;
      try {
        setFetching(true);
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "https://chckt-api.railway.app";
        const response = await axios.get(`${apiUrl}/api/posts/${serviceId}`);
        setItem(response.data);
      } catch (err) {
        console.error("Gagal sinkronisasi data:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchItemData();
    setTrxId(Math.floor(100000 + Math.random() * 900000).toString());
  }, [serviceId]);

  const handleProceed = () => {
    setLoading(true);
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    setTimeout(() => {
      if (!token) {
        Swal.fire({
          title: "AUTH_REQUIRED",
          text: "You must be identified to proceed.",
          icon: "info",
          confirmButtonColor: "#000",
        }).then(() => {
          router.push(`/login?callback=/order?id=${serviceId}`);
        });
      } else {
        router.push(`/checkout?id=${serviceId}`);
      }
      setLoading(false);
    }, 800);
  };

  if (fetching) {
    return (
      <div className="bg-white rounded-[3rem] p-20 shadow-sm border border-gray-100 flex flex-col items-center justify-center notranslate">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          Syncing_Data...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[3rem] p-10 md:p-16 shadow-sm border border-gray-100"
    >
      <header className="mb-12 border-b border-gray-50 pb-10">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-4 notranslate">
          Review_Order
        </h1>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] notranslate">
          Transaction ID: #TRX-{trxId}
        </p>
      </header>

      <div className="flex flex-col gap-8 mb-16">
        <div className="flex justify-between items-end bg-gray-50 p-8 rounded-[2rem]">
          <div className="notranslate">
            <p className="text-[9px] font-black uppercase tracking-widest text-blue-600 mb-2">
              Service_Selected
            </p>
            <h3 className="text-2xl font-black italic uppercase">
              {item ? item.title : `Artifact #${serviceId}`}
            </h3>
          </div>
          <p className="text-xl font-black italic text-black">
            {item ? `Rp ${item.price.toLocaleString("id-ID")}` : "Rp 0"}
          </p>
        </div>
      </div>

      <button
        onClick={handleProceed}
        disabled={loading || !item}
        className="w-full bg-black text-white p-8 rounded-[2.5rem] font-black uppercase text-xs hover:bg-blue-600 transition-all flex items-center justify-center gap-4 disabled:bg-gray-400"
      >
        {loading ? "CHECKING_AUTH..." : "Validate & Proceed"}
      </button>
    </motion.div>
  );
}

export default function OrderPage() {
  return (
    <main className="min-h-screen pt-40 pb-20 px-6 md:px-12 bg-[#FBFBFD]">
      <div className="max-w-3xl mx-auto">
        <Suspense
          fallback={
            <div className="text-center p-20 font-black opacity-20">
              SYSTEM_BOOTING...
            </div>
          }
        >
          <OrderContent />
        </Suspense>
      </div>
    </main>
  );
}
