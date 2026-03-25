"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  image_url: string;
}

interface RelatedProductsProps {
  products: RelatedProduct[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (!products || products.length === 0) return null;

  return (
    <div className="w-full mt-24 mb-12 border-t border-zinc-200 dark:border-white/10 pt-16 transition-colors">
      <div className="flex items-end justify-between mb-8 px-1">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white leading-none italic">
            Recommendations<span className="text-blue-600">.</span>
          </h1>
        </div>

        <Link
          href="/shop"
          className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          View Archive <ArrowRight size={14} />
        </Link>
      </div>

      {/* MOBILE: Flex Row + Horizontal Scroll 
          DESKTOP: Grid 4 Columns
      */}
      <div className="flex md:grid md:grid-cols-4 overflow-x-auto md:overflow-visible pb-8 md:pb-0 gap-5 md:gap-6 snap-x snap-mandatory scrollbar-hide">
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/product/${p.id}`}
            className="group flex flex-col gap-4 min-w-[75vw] md:min-w-0 snap-start active:scale-[0.98] transition-transform"
          >
            <div className="relative aspect-[4/5] bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 group-hover:border-zinc-400 dark:group-hover:border-zinc-600 transition-all shadow-sm">
              <Image
                src={p.image_url || "/placeholder.jpg"}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0 opacity-90 group-hover:opacity-100"
                alt={p.name}
              />

              {/* Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                <span className="text-[9px] font-black text-white tracking-widest uppercase italic">
                  View_Artifact // 001
                </span>
              </div>
            </div>

            <div className="px-1">
              <h3 className="text-xs md:text-sm font-black uppercase tracking-tight text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors truncate">
                {p.name}
              </h3>
              <div className="flex items-center justify-between mt-1">
                <p className="text-[11px] font-mono font-bold text-zinc-500 dark:text-zinc-500">
                  IDR {Number(p.price).toLocaleString()}
                </p>
                <div className="h-[1px] flex-1 bg-zinc-100 dark:bg-zinc-900 mx-3 hidden md:block" />
                <ArrowRight
                  size={12}
                  className="text-zinc-300 dark:text-zinc-700 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0"
                />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile-only Link at bottom for better UX */}
      <div className="mt-8 md:hidden">
        <Link
          href="/shop"
          className="flex items-center justify-center w-full py-4 border border-zinc-200 dark:border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500"
        >
          View Archive <ArrowRight size={14} className="ml-2" />
        </Link>
      </div>
    </div>
  );
}
