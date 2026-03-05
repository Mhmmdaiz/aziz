"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  FiShoppingBag,
  FiArrowLeft,
  FiLoader,
  FiCheck,
  FiMaximize2,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiZap,
} from "react-icons/fi";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const autoSlideRef = useRef<NodeJS.Timeout | null>(null);

  const stopAutoSlide = () => {
    if (autoSlideRef.current) clearInterval(autoSlideRef.current);
  };

  const startAutoSlide = () => {
    stopAutoSlide();
    autoSlideRef.current = setInterval(() => {
      if (product?.images?.length > 1) {
        setActiveImg((prev) => (prev + 1) % product.images.length);
      }
    }, 5000);
  };

  const addToCart = () => {
    if (!product) return;
    const imagePath = product.images?.[0]?.image_path || "";

    const productToSave = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: imagePath,
      quantity: 1,
    };

    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const isExist = existingCart.find((item: any) => item.id === product.id);

    if (isExist) {
      const updatedCart = existingCart.map((item: any) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      );
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    } else {
      localStorage.setItem(
        "cart",
        JSON.stringify([...existingCart, productToSave]),
      );
    }

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/products/${id}`);
        setProduct(res.data.data);
      } catch (err) {
        console.error("Sync Error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setMousePos({ x, y });
  };

  if (loading)
    return (
      <div className="h-screen bg-white flex flex-col items-center justify-center gap-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <FiLoader className="text-4xl text-black" />
        </motion.div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-black italic animate-pulse">
          Syncing_Artifact_Data
        </p>
      </div>
    );

  if (!product)
    return (
      <div className="h-screen flex items-center justify-center font-black italic uppercase tracking-tighter text-2xl">
        404_NOT_FOUND
      </div>
    );

  return (
    <main className="min-h-screen bg-[#fafafa] text-black font-sans selection:bg-black selection:text-white">
      <div className="max-w-[1600px] mx-auto px-6 pt-32 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          {/* LEFT: VISUAL DISPLAY */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div
              className="relative aspect-[4/5] bg-zinc-100 overflow-hidden shadow-2xl group cursor-crosshair border border-zinc-200/50"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => {
                setIsZoomed(true);
                stopAutoSlide();
              }}
              onMouseLeave={() => {
                setIsZoomed(false);
                startAutoSlide();
              }}
              onClick={() => setIsLightboxOpen(true)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImg}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="w-full h-full"
                >
                  <img
                    src={`${API_BASE_URL}/storage/${product.images[activeImg]?.image_path}`}
                    alt={product.name}
                    className={`w-full h-full object-cover transition-all duration-700 ease-out grayscale group-hover:grayscale-0 ${isZoomed ? "scale-[1.6]" : "scale-100"}`}
                    style={
                      isZoomed
                        ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` }
                        : {}
                    }
                  />
                </motion.div>
              </AnimatePresence>

              <div className="absolute top-10 right-10 flex flex-col gap-2">
                <div className="p-4 bg-white/90 backdrop-blur-md rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <FiMaximize2 size={20} />
                </div>
              </div>

              <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                <div className="bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.3em] italic border border-white/20">
                  Shot_0{activeImg + 1} // {product.images.length}
                </div>
              </div>
            </motion.div>

            {/* Thumbnail Strip */}
            <div className="flex gap-4 overflow-x-auto no-scrollbar py-4 px-2">
              {product.images?.map((img: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveImg(idx);
                    stopAutoSlide();
                  }}
                  className={`relative shrink-0 w-24 h-24 rounded-[2rem] overflow-hidden border-2 transition-all duration-500 ${activeImg === idx ? "border-black scale-95 shadow-2xl" : "border-transparent opacity-30 hover:opacity-100"}`}
                >
                  <img
                    src={`${API_BASE_URL}/storage/${img.image_path}`}
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all"
                    alt="Thumb"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: DATA SPECIFICATION */}
          <div className="lg:col-span-5 flex flex-col justify-center sticky top-32">
            <div className="space-y-12">
              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="w-12 h-[1px] bg-zinc-300" />
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 italic">
                    Available_Now
                  </span>
                </div>
                <h1 className="text-7xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.8] break-words">
                  {product.name}
                  <span className="text-zinc-300">.</span>
                </h1>
                <p className="text-4xl md:text-5xl font-black italic tracking-tighter text-zinc-900">
                  Rp {Number(product.price).toLocaleString()}
                </p>
              </section>

              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                  Description_Log
                </p>
                <p className="text-sm font-bold uppercase leading-relaxed tracking-widest text-zinc-500 italic max-w-md border-l-2 border-zinc-100 pl-6">
                  {product.description ||
                    "The artifact narrative is currently encrypted within the archival system. High-grade materials and precision engineering guaranteed."}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-8">
                <button
                  onClick={() => {
                    addToCart();
                    router.push("/cart");
                  }}
                  className="group relative w-full py-10 rounded-full bg-black text-white font-black uppercase tracking-[0.4em] text-[10px] overflow-hidden transition-all hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] active:scale-95"
                >
                  <div className="relative z-10 flex items-center justify-center gap-4">
                    <FiZap
                      size={18}
                      className="text-zinc-500 group-hover:text-white transition-colors"
                    />
                    <span className="italic">Acquire_Artifact</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </button>

                <button
                  onClick={addToCart}
                  disabled={added}
                  className={`w-full py-10 rounded-full font-black uppercase tracking-[0.4em] text-[10px] border-2 transition-all flex items-center justify-center gap-4 active:scale-95 ${
                    added
                      ? "bg-zinc-100 border-zinc-100 text-zinc-400"
                      : "border-zinc-200 hover:border-black text-black"
                  }`}
                >
                  {added ? (
                    <>
                      <FiCheck size={18} /> Synced_To_Bag
                    </>
                  ) : (
                    <>
                      <FiShoppingBag size={18} /> Add_To_Collection
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-8 py-8 border-t border-zinc-100">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-300">
                    Stock_status
                  </p>
                  <p className="font-black italic uppercase text-lg">
                    {product.stock} UNITS
                  </p>
                </div>
                <div className="w-[1px] h-10 bg-zinc-100" />
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-300">
                    Category
                  </p>
                  <p className="font-black italic uppercase text-lg">
                    Essential
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LIGHTBOX (MODAL FULLSCREEN) */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white flex items-center justify-center p-4 md:p-20"
          >
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-10 right-10 p-6 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition-all z-[110]"
            >
              <FiX size={30} />
            </button>
            <div className="absolute inset-x-10 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-[110]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImg(
                    (prev) =>
                      (prev - 1 + product.images.length) %
                      product.images.length,
                  );
                }}
                className="p-8 bg-zinc-50/50 backdrop-blur-md rounded-full pointer-events-auto hover:bg-black hover:text-white transition-all"
              >
                <FiChevronLeft size={30} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImg((prev) => (prev + 1) % product.images.length);
                }}
                className="p-8 bg-zinc-50/50 backdrop-blur-md rounded-full pointer-events-auto hover:bg-black hover:text-white transition-all"
              >
                <FiChevronRight size={30} />
              </button>
            </div>
            <motion.img
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              src={`${API_BASE_URL}/storage/${product.images[activeImg]?.image_path}`}
              className="max-w-full max-h-full object-contain shadow-[0_50px_100px_rgba(0,0,0,0.1)] rounded-3xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </main>
  );
}
