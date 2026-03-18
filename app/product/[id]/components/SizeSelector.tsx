"use client";

import { Info } from "lucide-react";

interface SizeSelectorProps {
  sizes: string[];
  selectedSize: string;
  onSelectSize: (size: string) => void;
  // In a real app, this would be an object/map of stock per size
  // For now, we simulate out of stock if sizes[x] === "L" randomly or just trust user props
}

export function SizeSelector({
  sizes,
  selectedSize,
  onSelectSize,
}: SizeSelectorProps) {
  if (!sizes || sizes.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2 transition-colors duration-500">
          Dimension_Select
        </label>
        <button className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white uppercase tracking-widest border-b border-zinc-300 dark:border-zinc-700 pb-0.5 transition-all flex items-center gap-1">
          <Info size={10} /> Size_Guide
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        {sizes.map((s) => {
          // Dummy simulation: let's pretend one size is almost always out of stock to show brutalist disabled state
          const isOutOfStock = false; // We can set this dynamically if data allows

          return (
            <button
              key={s}
              onClick={() => !isOutOfStock && onSelectSize(s)}
              disabled={isOutOfStock}
              className={`
                relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center font-black text-sm md:text-base border-2 transition-all duration-300
                ${isOutOfStock ? "opacity-30 border-red-900 cursor-not-allowed text-red-900 line-through" : ""}
                ${
                  selectedSize === s
                    ? "bg-red-600 text-white border-red-500 shadow-[0_0_10px_rgba(220,38,38,0.2)] dark:shadow-[0_0_15px_rgba(220,38,38,0.3)] scale-110 z-10"
                    : "bg-white dark:bg-[#111] text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-[#333] hover:border-zinc-400 dark:hover:border-zinc-500 hover:text-zinc-900 dark:hover:text-white shadow-sm dark:shadow-none"
                }
              `}
            >
              {s}
              {/* Corner accent for selected */}
              {selectedSize === s && (
                <div className="absolute top-0 right-0 w-2 h-2 bg-white" />
              )}
            </button>
          );
        })}
      </div>
      
      {!selectedSize && (
        <p className="text-[10px] text-red-500 font-mono italic animate-pulse">
          * Awaiting dimension input...
        </p>
      )}
    </div>
  );
}
