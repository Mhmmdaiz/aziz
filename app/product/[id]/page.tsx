"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Star,
  Truck,
  RotateCcw,
  ShieldCheck,
  Plus,
  Minus,
  Maximize2,
  ChevronLeft,
  Share2,
  Zap,
  Ruler,
  Info,
  X
} from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import Image from "next/image";
import Swal from "sweetalert2";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [addingToCart, setAddingToCart] = useState(false);
  
  // Gallery State
  const [activeImage, setActiveImage] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      console.log("INITIALIZING_FETCH_FOR_ID:", id);
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("SUPABASE_FETCH_ERROR:", error);
          throw error;
        }

        if (!data) {
          console.warn("FETCH_RETURNED_NO_DATA");
          setProduct(null);
        } else {
          console.log("FETCH_SUCCESSFUL_DATA_FOUND");
          setProduct(data);
          
          if (data.sizes && data.sizes.length > 0) {
            setSelectedSize(data.sizes[0]);
          }
          
          // Initialize Gallery Image
          const initialImg = (data.image_urls && data.image_urls.length > 0) 
            ? data.image_urls[0] 
            : (data.image_url || "/placeholder.jpg");
          setActiveImage(initialImg);
        }
      } catch (err: any) {
        console.error("DEBUG_FETCH_ERROR_CATCH:", {
          message: err.message,
          code: err.code,
          details: err.details,
          id: id
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAction = async (isBuyNow = false) => {
    if (!product) return;
    
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      return Swal.fire({
        title: "SELECT_SIZE",
        text: "Please select a dimension artifact before proceeding.",
        icon: "warning",
        confirmButtonColor: "#000",
        customClass: { popup: "rounded-[2rem] font-mono" }
      });
    }

    setAddingToCart(true);
    await new Promise(r => setTimeout(r, 600));

    const currentCart: any[] = JSON.parse(localStorage.getItem("cart") || "[]");
    const cartItem: any = {
      cartId: `${product.id}-${selectedSize || 'default'}`,
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
      size: selectedSize,
      quantity: quantity,
    };

    const existingIndex = currentCart.findIndex((item: any) => item.cartId === cartItem.cartId);
    if (existingIndex > -1) {
      currentCart[existingIndex].quantity += quantity;
    } else {
      currentCart.push(cartItem);
    }

    localStorage.setItem("cart", JSON.stringify(currentCart));
    window.dispatchEvent(new Event("storage"));
    setAddingToCart(false);

    if (isBuyNow) {
      localStorage.setItem("checkout_items", JSON.stringify([cartItem]));
      router.push("/checkout");
    }
 else {
      Swal.fire({
        title: "STASHED",
        text: `Unit ${product.name} successfully pushed to archive.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: "rounded-[2.5rem] font-mono" }
      });
    }
  };

  if (loading) return <SkeletonLoader />;

  if (!product)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBFBFD] dark:bg-black font-mono p-10 text-center">
        <h1 className="text-8xl font-black text-zinc-200 dark:text-zinc-900 mb-4 tracking-tighter italic">404</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 dark:text-zinc-600 mb-8">Artifact_Not_Found_In_Vault</p>
        <button onClick={() => router.push("/")} className="px-10 py-4 bg-zinc-950 dark:bg-white text-white dark:text-black rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">Back_To_Home</button>
      </div>
    );

  const images = (product.image_urls && product.image_urls.length > 0) ? product.image_urls : [product.image_url];

  return (
    <div className="min-h-screen bg-white dark:bg-[#030303] text-zinc-950 dark:text-white font-mono selection:bg-indigo-500 selection:text-white pb-24 pt-28 md:pt-40 transition-colors duration-500 relative overflow-hidden mesh-gradient">
      <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-[0.03] pointer-events-none" />
      
      {/* Full Screen Lightbox */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/95 dark:bg-black/98 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
            onClick={() => setIsFullscreen(false)}
          >
            <motion.div
              layoutId="main-image"
              className="relative w-full h-full"
            >
              <Image
                src={activeImage}
                fill
                className="object-contain"
                alt="Fullscreen artifact"
                unoptimized
              />
            </motion.div>
            <button className="absolute top-10 right-10 w-16 h-16 rounded-full bg-white/10 dark:bg-zinc-900/50 text-white flex items-center justify-center hover:bg-white/20 dark:hover:bg-white/10 transition-all border border-white/20 dark:border-zinc-800">
              <X size={32} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient Background Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-100/20 dark:bg-indigo-900/10 blur-[120px] rounded-full -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-[500px] h-[500px] bg-rose-500/5 dark:bg-rose-900/5 blur-[120px] rounded-full -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-3 text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-all group"
          >
            <div className="w-8 h-8 rounded-full border border-zinc-100 dark:border-zinc-800 flex items-center justify-center group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900 transition-colors">
              <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em]">Archive_Return</span>
          </button>
          
          <div className="flex items-center gap-2 md:gap-3">
            <span className="hidden sm:block text-[8px] font-black uppercase tracking-[0.4em] text-zinc-300 dark:text-zinc-800">Selinear_Protocols // Unit_Detail</span>
            <button className="p-2.5 md:p-3 rounded-full border border-zinc-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:shadow-xl transition-all">
              <Share2 size={15} className="md:w-[16px]" />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-20">
          
          {/* LEFT: GALLERY */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Main Image Container */}
            <motion.div
              layoutId="main-image"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative w-full aspect-[4/5] md:aspect-auto md:h-[calc(100vh-300px)] bg-white dark:bg-zinc-950 rounded-[2rem] md:rounded-[3.5rem] overflow-hidden border border-zinc-100 dark:border-zinc-900 group shadow-2xl shadow-zinc-200/50 dark:shadow-none"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={activeImage || "/placeholder.jpg"}
                    fill
                    className="object-cover transition-transform duration-[2s] group-hover:scale-105 ease-out-expo"
                    alt={product.name}
                    priority
                    unoptimized
                  />
                </motion.div>
              </AnimatePresence>

              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <button 
                onClick={() => setIsFullscreen(true)}
                className="absolute bottom-8 right-8 p-5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-zinc-100/50 dark:border-zinc-800/50 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all text-zinc-900 dark:text-zinc-100 z-10"
              >
                <Maximize2 size={24} />
              </button>
              
              <div className="absolute top-6 left-6 md:top-8 md:left-8 flex flex-col gap-3">
                <div className="px-3 md:px-4 py-1.5 md:py-2 bg-indigo-600/90 dark:bg-indigo-500/90 backdrop-blur-md text-white rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 md:gap-3 shadow-2xl">
                  <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_white]" />
                  Inventory_Drop_SS26
                </div>
              </div>
            </motion.div>

            {/* Thumbnails at Bottom */}
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 scroll-smooth">
                {images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`relative w-20 h-20 md:w-32 md:h-32 rounded-2xl md:rounded-3xl overflow-hidden border-2 shrink-0 transition-all duration-500
                      ${activeImage === img 
                        ? "border-cyan-500 shadow-xl scale-105" 
                        : "border-transparent opacity-60 hover:opacity-100 bg-white dark:bg-zinc-900 shadow-sm"}`}
                  >
                    <Image src={img} fill className="object-cover" alt={`Artifact view ${i}`} unoptimized />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: CONFIGURATION */}
          <div className="lg:col-span-5 flex flex-col pt-4 md:sticky md:top-32 h-fit">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
            >
              {/* Product Info */}
              <div className="space-y-6 mb-12">
                <div className="flex items-center flex-wrap gap-3 md:gap-4">
                  <span className="px-2.5 py-1 bg-cyan-500/10 dark:bg-cyan-400/5 text-cyan-600 dark:text-cyan-400 rounded-lg text-[8px] md:text-[9px] font-black tracking-[0.2em] uppercase italic border border-cyan-500/20 shrink-0">
                    {product.category || "General_Artifact"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="flex text-indigo-500 gap-0.5">
                      {[...Array(5)].map((_, i) => <Star key={i} size={10} fill="currentColor" className="stroke-none" />)}
                    </div>
                    <span className="text-[9px] md:text-[10px] font-black text-zinc-300 dark:text-zinc-700">(ARC.RATING_4.9)</span>
                  </div>
                </div>

                <h1 className="text-2xl md:text-5xl lg:text-6xl font-black italic uppercase tracking-tighter text-zinc-950 dark:text-white mb-2 leading-[1.1] md:leading-[0.9] break-words">
                  {product.name}
                </h1>
                
                <p className="text-[10px] font-black text-zinc-300 dark:text-zinc-800 uppercase tracking-[0.5em] flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-zinc-200 dark:bg-zinc-800" /> 
                  Unit_ID: {product.id?.slice(0, 16)}
                </p>

                <div className="flex items-baseline flex-wrap gap-4 pt-4">
                  <span className="text-3xl md:text-5xl font-black text-zinc-950 dark:text-white tracking-tighter">
                    IDR {Number(product.price).toLocaleString()}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-zinc-300 dark:text-zinc-800 uppercase line-through leading-none">
                      IDR {(Number(product.price) * 1.25).toLocaleString()}
                    </span>
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1 italic">
                      SAVINGS_25%
                    </span>
                  </div>
                </div>
              </div>

              {/* SELECTORS */}
              <div className="space-y-8 mb-10 p-6 md:p-8 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-2xl border border-zinc-100 dark:border-zinc-900 rounded-[2.5rem] md:rounded-[3rem] shadow-sm">
                {product.sizes && product.sizes.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-6 px-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 italic flex items-center gap-3">
                        <Ruler size={14} className="text-zinc-300" /> Select_Dimension
                      </label>
                      <button className="text-[9px] font-black text-zinc-900 dark:text-white uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800 pb-0.5 hover:border-zinc-950 dark:hover:border-white transition-all">Size_Guide</button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {product.sizes.map((s: string) => (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(s)}
                          className={`w-14 h-14 rounded-2xl border-2 font-black transition-all duration-500 flex flex-col items-center justify-center text-[12px]
                            ${selectedSize === s 
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-500/20 scale-110" 
                              : "bg-white/50 dark:bg-black/50 border-white/20 dark:border-white/5 text-zinc-400 hover:border-indigo-500/30"}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="px-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 italic block mb-6">Manifest_Quantity</label>
                  <div className="flex items-center gap-6 md:gap-10 bg-zinc-50 dark:bg-zinc-900 w-full md:w-max px-6 md:px-8 py-4 md:py-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 justify-between">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                      className="p-1 text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-all hover:scale-125"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="font-black text-2xl w-8 text-center text-zinc-950 dark:text-white">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)} 
                      className="p-1 text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-all hover:scale-125"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="space-y-4">
                <button
                  onClick={() => handleAction(false)}
                  disabled={addingToCart}
                  className="group relative w-full py-5 md:py-7 bg-indigo-600 text-white rounded-[1.25rem] md:rounded-[2rem] font-black uppercase tracking-[0.2em] md:tracking-[0.6em] text-[10px] md:text-[11px] overflow-hidden transition-all duration-500 hover:bg-indigo-500 active:scale-[0.97] disabled:opacity-50 shadow-2xl shadow-indigo-500/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <span className="relative z-10 flex items-center justify-center gap-4">
                    {addingToCart ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                        <RotateCcw size={18} />
                      </motion.div>
                    ) : (
                      <ShoppingBag size={18} />
                    )}
                    {addingToCart ? "SYNCING_ARTIFACT..." : "PUSH_TO_STASH"}
                  </span>
                </button>
                
                <button
                  onClick={() => handleAction(true)}
                  className="w-full py-6 md:py-7 border border-zinc-100 dark:border-zinc-800/50 rounded-[1.25rem] md:rounded-[2rem] font-black uppercase tracking-[0.15em] md:tracking-[0.6em] text-[10px] md:text-[11px] bg-white dark:bg-zinc-900/50 backdrop-blur-xl hover:border-zinc-950 dark:hover:border-white hover:bg-zinc-950 dark:hover:bg-white hover:text-white dark:hover:text-zinc-950 transition-all duration-500 active:scale-[0.97] group flex items-center justify-center gap-3 md:gap-4"
                >
                  <Zap size={18} className="group-hover:text-cyan-400 transition-colors" /> Express_Deployment
                </button>
              </div>

              {/* FEATURES */}
              <div className="mt-12 md:mt-16 pt-8 md:pt-12 border-t border-zinc-100 dark:border-zinc-900 grid grid-cols-3 gap-2 md:gap-8">
                <FeatureCard icon={<Truck className="text-cyan-500" size={18} />} label="Global_Sync" />
                <FeatureCard icon={<RotateCcw className="text-emerald-500" size={18} />} label="Refund_Proto" />
                <FeatureCard icon={<ShieldCheck className="text-blue-500" size={18} />} label="Auth_Vault" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* DETAILS TABS */}
        <div className="mt-20 md:mt-32 max-w-5xl mx-auto">
          <div className="flex gap-4 md:gap-16 border-b border-zinc-100 dark:border-zinc-900 mb-8 md:mb-12 overflow-x-auto no-scrollbar pb-1 px-4">
            {["Description", "Technical_Data"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase().includes('data') ? 'specifications' : 'description')}
                className={`pb-6 md:pb-8 text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] transition-all relative group shrink-0
                ${(activeTab === "description" && tab === "Description") || (activeTab === "specifications" && tab === "Technical_Data") 
                  ? "text-zinc-950 dark:text-white" 
                  : "text-zinc-200 dark:text-zinc-800 hover:text-zinc-400"}`}
              >
                {tab}
                {((activeTab === "description" && tab === "Description") || (activeTab === "specifications" && tab === "Technical_Data")) && (
                  <motion.div layoutId="activeTabLine" className="absolute bottom-[-1px] left-0 right-0 h-1 bg-zinc-950 dark:bg-white rounded-full shadow-xl" />
                )}
              </button>
            ))}
          </div>

          <div className="min-h-[300px] py-10 px-4">
            <AnimatePresence mode="wait">
              {activeTab === "description" ? (
                <motion.div
                  key="desc"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-4xl"
                >
                  <p className="text-lg md:text-2xl leading-[1.6] text-zinc-600 dark:text-zinc-400 font-bold italic tracking-tight
                    first-letter:text-5xl md:first-letter:text-7xl first-letter:font-black first-letter:mr-3 md:first-letter:mr-4 first-letter:float-left first-letter:text-zinc-950 dark:first-letter:text-white first-letter:leading-none
                  ">
                    {product.description || "Experimental artifact designed for the elite collection. High-frequency silhouette combined with archival craftsmanship and architectural precision."}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="specs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {product.specifications && product.specifications.length > 0 ? (
                    product.specifications.map((spec: any, i: number) => (
                      <SpecItem key={i} label={spec.key} value={spec.value} />
                    ))
                  ) : (
                    <div className="col-span-full py-24 flex flex-col items-center justify-center border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-[4rem] text-zinc-300 dark:text-zinc-800">
                      <div className="w-16 h-16 rounded-full border-2 border-zinc-100 dark:border-zinc-900 flex items-center justify-center mb-6">
                        <Info size={32} strokeWidth={1} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.5em] italic">NO_TECHNICAL_DATA_ARCHIVED_YET</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---
function FeatureCard({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="text-center group cursor-default">
      <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:shadow-2xl transition-all duration-500">
        {icon}
      </div>
      <p className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-colors break-words">
        {label}
      </p>
    </div>
  );
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-5 md:p-8 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[1.5rem] md:rounded-[2.5rem] hover:border-zinc-300 dark:hover:border-white transition-all duration-500 shadow-sm group">
      <div className="text-[9px] font-black text-cyan-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full group-hover:scale-150 transition-transform" /> {label}
      </div>
      <p className="text-lg font-black text-zinc-950 dark:text-white uppercase italic leading-tight group-hover:translate-x-1 transition-transform">{value}</p>
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-black pt-24 md:pt-32 px-4 md:px-12 animate-pulse transition-colors duration-500">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-8 md:gap-12">
          <div className="lg:col-span-6 aspect-[4/5] md:aspect-auto md:h-[calc(100vh-300px)] bg-zinc-200 dark:bg-zinc-900 rounded-[2rem] md:rounded-[3rem]" />
          <div className="lg:col-span-6 space-y-8 md:space-y-10 pt-4">
            <div className="h-16 md:h-20 bg-zinc-200 dark:bg-zinc-900 rounded-2xl md:rounded-3xl w-3/4" />
            <div className="h-4 md:h-5 bg-zinc-100 dark:bg-zinc-950 rounded-md w-1/4" />
            <div className="h-32 md:h-40 bg-zinc-100 dark:bg-zinc-950 rounded-[2rem] md:rounded-[3rem]" />
            <div className="h-16 md:h-20 bg-zinc-950 dark:bg-zinc-200 rounded-2xl md:rounded-3xl w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
