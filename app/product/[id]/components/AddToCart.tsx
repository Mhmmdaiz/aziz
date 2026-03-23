"use client";

import { ShoppingBag, Loader2 } from "lucide-react";
import { useState } from "react";
import Swal from "sweetalert2";

interface AddToCartProps {
  onAdd: () => void;
  onBuyNow: () => void;
  disabled: boolean;
  price: number;
  isSoldOut?: boolean;
}

export function AddToCart({ onAdd, onBuyNow, disabled, price, isSoldOut }: AddToCartProps) {
  const [loadingCart, setLoadingCart] = useState(false);
  const [loadingBuy, setLoadingBuy] = useState(false);

  const showError = () => {
    Swal.fire({
      title: "Akses Ditolak",
      text: "Silakan pilih ukuran terlebih dahulu sebelum melanjutkan.",
      icon: "error",
      background: "#FBFBFD", // Will be overridden in actual DOM via theme but setting base
      color: "#1D1D1F",
      confirmButtonColor: "#dc2626",
      customClass: { popup: "rounded-[1rem] font-mono border border-red-200 dark:border-red-900 bg-white dark:bg-[#111] text-zinc-900 dark:text-white" }
    });
  };

  const handleCartClick = async () => {
    if (disabled || isSoldOut) return showError();
    setLoadingCart(true);
    await new Promise((r) => setTimeout(r, 600));
    onAdd();
    setLoadingCart(false);
  };

  const handleBuyClick = async () => {
    if (disabled || isSoldOut) return showError();
    setLoadingBuy(true);
    await new Promise((r) => setTimeout(r, 600));
    onBuyNow();
    setLoadingBuy(false);
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-3">
      {/* ADD TO CART BUTTON */}
      <button
        onClick={handleCartClick}
        className={`relative flex-1 py-4 md:py-5 flex items-center justify-center gap-3 text-xs md:text-sm font-black uppercase tracking-[0.2em] transition-all duration-300 overflow-hidden group
          ${(disabled || isSoldOut)
            ? "bg-zinc-100 dark:bg-[#222] text-zinc-400 dark:text-zinc-600 cursor-not-allowed border border-zinc-200 dark:border-[#333]" 
            : "bg-white dark:bg-[#111] text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-[#222] border border-zinc-300 dark:border-[#444] shadow-sm"
          }
        `}
      >
        {loadingCart ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <ShoppingBag size={20} className={(disabled || isSoldOut) ? "opacity-50" : ""} />
        )}
        <span className="relative z-10 mt-0.5">
          {loadingCart ? "MEMUAT..." : isSoldOut ? "SOLD OUT" : disabled ? "PILIH UKURAN" : `TAMBAH [ ${Number(price).toLocaleString()} ]`}
        </span>
      </button>

      {/* BUY NOW BUTTON */}
      <button
        onClick={handleBuyClick}
        className={`relative flex-1 py-4 md:py-5 flex items-center justify-center gap-3 text-xs md:text-sm font-black uppercase tracking-[0.2em] transition-all duration-300 overflow-hidden group
          ${(disabled || isSoldOut)
            ? "bg-zinc-100 dark:bg-[#222] text-zinc-400 dark:text-zinc-600 cursor-not-allowed border border-zinc-200 dark:border-[#333]" 
            : "bg-red-600 text-white hover:bg-red-500 border border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.15)] dark:shadow-[0_0_30px_rgba(220,38,38,0.2)] hover:shadow-[0_0_30px_rgba(220,38,38,0.25)] dark:hover:shadow-[0_0_50px_rgba(220,38,38,0.4)]"
          }
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        
        {loadingBuy ? (
          <Loader2 size={20} className="animate-spin" />
        ) : isSoldOut ? null : (
          <span className="font-mono font-bold">⚡</span>
        )}
        
        <span className="relative z-10 mt-0.5">
          {loadingBuy ? "MEMPROSES..." : isSoldOut ? "SOLD OUT" : disabled ? "PILIH UKURAN" : "BELI SEKARANG"}
        </span>

        {!(disabled || isSoldOut) && (
          <>
            <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-white/50" />
            <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-white/50" />
          </>
        )}
      </button>
    </div>
  );
}
