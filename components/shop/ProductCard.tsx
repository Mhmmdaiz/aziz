"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiShoppingBag, FiZap, FiInfo } from "react-icons/fi";
import { useCart } from "@/components/providers/CartProvider";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface ProductCardProps {
  product: any;
}

const SIZES = ["S", "M", "L", "XL"];

export default function ProductCard({ product }: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!selectedSize) {
      toast.error("Silakan pilih ukuran terlebih dahulu", {
        style: { background: '#000', color: '#fff', borderRadius: '2rem', fontSize: '10px', fontWeight: 'bold' }
      });
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
      size: selectedSize,
      quantity: 1
    });

    toast.success(`${product.name} [${selectedSize}] ditambahkan ke keranjang`, {
      style: {
        background: "#000",
        color: "#fff",
        borderRadius: "2rem",
        fontSize: "10px",
        fontWeight: "bold",
        textTransform: "uppercase",
        letterSpacing: "0.1em"
      }
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col h-full bg-zinc-50 dark:bg-zinc-900 rounded-[2rem] overflow-hidden border border-zinc-100 dark:border-white/5 hover:border-red-500/30 transition-all duration-500 shadow-xl"
    >
      {/* --- IMAGE SECTION --- */}
      <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100 dark:bg-zinc-900 group">
        <Link 
          href={`/product/${product.id}`}
          className="block w-full h-full"
        >
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-[1.5s] ease-out"
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {product.stock > 0 && product.stock <= 10 && (
            <div className="px-2 md:px-3 py-1 bg-red-600 text-white text-[7px] md:text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg flex items-center gap-1">
              <FiZap className="animate-pulse" /> Stock: {product.stock}
            </div>
          )}
          {product.stock === 0 && (
            <div className="px-2 md:px-3 py-1 bg-zinc-800 text-zinc-400 text-[7px] md:text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg">
              SOLD OUT
            </div>
          )}
          {/* Label "Hot/Popular" berdasarkan ID (deterministik 30% produk) */}
          {parseInt(product.id.slice(0, 2), 16) % 10 < 3 && (
            <div className="px-2 md:px-3 py-1 bg-indigo-600 text-white text-[7px] md:text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg flex items-center gap-1">
              🔥 HIGHEST DEMAND
            </div>
          )}
          {new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
            <div className="px-2 md:px-3 py-1 bg-zinc-900 dark:bg-white text-white dark:text-black text-[7px] md:text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg">
              New Arrival
            </div>
          )}
        </div>

        {/* Quick Add Overlay (Desktop) */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6 gap-4">
           {/* Invisible Link for the rest of overlay area */}
           <Link href={`/product/${product.id}`} className="absolute inset-0 z-0" />
           
           <div className="relative z-10 space-y-3">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 text-center">Select Size</p>
              <div className="flex justify-center gap-2">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedSize(size);
                    }}
                    className={`w-10 h-10 rounded-xl font-black text-[10px] transition-all border ${
                      selectedSize === size 
                      ? "bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white" 
                      : "bg-black/40 text-white border-white/10 hover:border-white/40"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
           </div>
           
           <button
             onClick={(e) => {
               e.stopPropagation();
               handleAddToCart(e);
             }}
             disabled={!selectedSize || product.stock <= 0}
             className="relative z-10 w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full font-black uppercase text-[10px] tracking-[0.2em] hover:bg-red-600 dark:hover:bg-red-600 hover:text-white transition-all active:scale-95 disabled:opacity-20 flex items-center justify-center gap-2 shadow-2xl"
           >
             <FiShoppingBag size={14} /> {product.stock <= 0 ? "SOLD OUT" : "Beli Sekarang"}
           </button>
        </div>
      </div>

       {/* --- INFO SECTION --- */}
      <div className="p-4 md:p-6 flex flex-col flex-1 gap-3 md:gap-4">
        <div className="space-y-1">
          <div className="flex justify-between items-start gap-2 md:gap-4">
            <Link href={`/product/${product.id}`} className="flex-1 min-w-0">
              <h3 className="text-[11px] md:text-sm font-black uppercase italic tracking-tight text-zinc-900 dark:text-white group-hover:text-red-500 transition-colors truncate">
                {product.name}
              </h3>
            </Link>
            <span className="text-[10px] md:text-[12px] font-black text-zinc-900 dark:text-white shrink-0">
              IDR {Number(product.price).toLocaleString()}
            </span>
          </div>
          <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-zinc-400 dark:text-zinc-600">
            {product.category} // KOLEKSI 01
          </p>
        </div>

        {/* Scarcity Info / High Demand UI */}
        <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-white/5 space-y-4">
          {product.is_high_demand ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[8px] md:text-[9px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-2 text-red-600">
                   <div className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
                   STOK TERBATAS
                </div>
                <div className={`flex items-center gap-1 ${product.stock > 0 ? "text-emerald-500" : "text-zinc-500"}`}>
                   {product.stock > 0 ? "TERSEDIA" : "HABIS"}
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-medium text-zinc-500">
                <span className="text-orange-500">🔥</span> {product.sold_today || 0} units claimed today
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-zinc-100 dark:bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: `${Math.min(((product.sold_today || 0) / 100) * 100, 100)}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-red-600"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-[8px] md:text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                  {product.sold_today || 0} TERJUAL HARI INI
               </div>
               <Link href={`/product/${product.id}`} className="text-zinc-700 hover:text-white transition-colors">
                  <FiInfo size={14} />
               </Link>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
