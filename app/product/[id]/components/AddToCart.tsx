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
        className={`relative flex-1 py-5 flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-500 overflow-hidden group rounded-full
          ${(disabled || isSoldOut)
            ? "bg-zinc-100 dark:bg-[#111] text-zinc-400 dark:text-zinc-700 cursor-not-allowed border border-zinc-200 dark:border-white/5" 
            : "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-white/10 shadow-sm"
          }
        `}
      >
        {loadingCart ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <ShoppingBag size={18} className={(disabled || isSoldOut) ? "opacity-30" : ""} />
        )}
        <span className="relative z-10">
          {loadingCart ? "LOADING_VAULT..." : isSoldOut ? "SOLD OUT" : disabled ? "SELECT_SIZE" : "ADD_TO_BAG"}
        </span>
      </button>

      {/* BUY NOW BUTTON */}
      <button
        onClick={handleBuyClick}
        className={`relative flex-1 py-5 flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-500 overflow-hidden group rounded-full
          ${(disabled || isSoldOut)
            ? "bg-zinc-100 dark:bg-[#111] text-zinc-400 dark:text-zinc-700 cursor-not-allowed border border-zinc-200 dark:border-white/5" 
            : "bg-red-600 text-white hover:bg-red-500 border border-red-500 shadow-xl"
          }
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1.5s]" />
        
        {loadingBuy ? (
          <Loader2 size={18} className="animate-spin" />
        ) : isSoldOut ? null : (
          <span className="font-mono font-bold text-lg">⚡</span>
        )}
        
        <span className="relative z-10">
          {loadingBuy ? "EXECUTING..." : isSoldOut ? "SOLD OUT" : disabled ? "SELECT_SIZE" : "BUY_INSTANT"}
        </span>

        {!(disabled || isSoldOut) && (
          <div className="absolute top-0 right-0 p-1 opacity-20">
             <div className="w-1 h-1 bg-white rounded-full" />
          </div>
        )}
      </button>
    </div>
  );
}
