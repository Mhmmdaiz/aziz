"use client";

import { motion } from "framer-motion";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { useCart } from "@/components/providers/CartProvider";

interface CartItemProps {
  item: any;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50, filter: "blur(10px)" }}
      className="group relative flex flex-col md:flex-row gap-4 md:gap-8 p-6 md:p-8 bg-zinc-900/40 rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/5"
    >
      {/* Product Image */}
      <div className="relative w-full md:w-44 h-44 shrink-0 rounded-[2rem] overflow-hidden bg-zinc-800 border border-white/5">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col justify-between py-2">
        <div>
          <div className="flex justify-between items-start gap-4">
            <div>
              <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-white leading-tight">
                {item.name}
              </h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mt-1">
                Size: {item.size || "Default"}
              </p>
            </div>
            <button
              onClick={() => removeItem(item.cartId)}
              className="p-3 rounded-full bg-white/5 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
            >
              <FiTrash2 size={18} />
            </button>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
             <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[8px] font-black uppercase tracking-widest text-zinc-400">
                STREETWEAR ARTIFACT
             </span>
             {item.quantity > 5 && (
               <span className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[8px] font-black uppercase tracking-widest text-orange-500">
                  HIGH VOLUME ORDER
               </span>
             )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-8">
          {/* Quantity Controls */}
          <div className="flex items-center gap-6 bg-black/40 px-4 py-2 rounded-2xl border border-white/5">
            <button
              onClick={() => updateQuantity(item.cartId, -1)}
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <FiMinus size={14} />
            </button>
            <span className="text-xs font-black min-w-[20px] text-center text-white">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.cartId, 1)}
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <FiPlus size={14} />
            </button>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">
              Unit Valuation
            </p>
            <p className="text-xl font-black italic text-white tracking-tighter">
              Rp {(item.price * item.quantity).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
