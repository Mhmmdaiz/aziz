"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { useCart } from "@/components/providers/CartProvider";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Clock, Zap, Shield, Truck } from "lucide-react";
import Link from "next/link";

// Components
import { ProductGallery } from "../../product/[id]/components/ProductGallery";
import { ProductInfo } from "../../product/[id]/components/ProductInfo";
import { SizeSelector } from "../../product/[id]/components/SizeSelector";
import { AddToCart } from "../../product/[id]/components/AddToCart";
import { TrustBadges } from "../../product/[id]/components/TrustBadges";
import { ProductAccordion } from "../../product/[id]/components/ProductAccordion";

export default function PreOrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { addToCart } = useCart();

  const [campaign, setCampaign] = useState<any>(null);
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [timeLeft, setTimeLeft] = useState<any>(null);

  const isUuid =
    id &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);

      // Safety timeout: jika fetch > 8 detik, stop loading spinner
      const timeout = setTimeout(() => setLoading(false), 8000);

      try {
        let setting: any = null;

        if (isUuid) {
          const { data } = await supabase
            .from("site_settings")
            .select("*")
            .eq("id", id)
            .single();
          setting = data;
        }

        if (!setting) {
          const { data: fallback } = await supabase
            .from("site_settings")
            .select("*")
            .eq("key", "preorder")
            .single();
          setting = fallback;
        }

        if (setting) {
          setCampaign(setting.value);
          if (setting.value?.product_id) {
            const { data: pData } = await supabase
              .from("products")
              .select("*")
              .eq("id", setting.value.product_id)
              .single();
            if (pData) setProduct(pData);
          }
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    };

    fetchData();

    // Setup Campaign Realtime
    let campaignChannel: any;
    const setupCampaignRealtime = async () => {
      const { data: currentSetting } = await supabase
        .from("site_settings")
        .select("id")
        .eq(
          id && id !== "default" && isUuid ? "id" : "key",
          id && id !== "default" && isUuid ? id : "preorder",
        )
        .single();

      if (currentSetting) {
        campaignChannel = supabase
          .channel(`preorder_campaign_${currentSetting.id}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "site_settings",
              filter: `id=eq.${currentSetting.id}`,
            },
            (p) => {
              setCampaign(p.new.value);
            },
          )
          .subscribe();
      }
    };

    setupCampaignRealtime();

    return () => {
      if (campaignChannel) supabase.removeChannel(campaignChannel);
    };
  }, [id, isUuid]);

  // Separate Product Realtime to react to product_id changes
  useEffect(() => {
    if (!campaign?.product_id) return;

    const productChannel = supabase
      .channel(`preorder_product_${campaign.product_id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "products",
          filter: `id=eq.${campaign.product_id}`,
        },
        (p) => {
          setProduct((prev: any) => ({ ...prev, ...p.new }));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(productChannel);
    };
  }, [campaign?.product_id]);

  // Countdown Logic
  useEffect(() => {
    if (!campaign?.countdown_target) return;

    const calculate = () => {
      const target = new Date(campaign.countdown_target).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft(null);
        return false;
      }

      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((diff % (1000 * 60)) / 1000),
      });
      return true;
    };

    calculate();
    const timer = setInterval(() => {
      calculate();
    }, 1000);
    return () => clearInterval(timer);
  }, [campaign?.countdown_target]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: campaign.price_override || product.price,
      image: product.image_url,
      size: selectedSize || "Default",
      quantity: 1,
      is_preorder: true,
    });
    localStorage.setItem("is_preorder_session", "true");
  };

  const handleBuyNow = () => {
    if (!product) return;

    const checkoutItem = {
      id: product.id,
      name: product.name,
      price: campaign.price_override || product.price,
      image: product.image_url,
      size: selectedSize || "Default",
      quantity: 1,
      is_preorder: true,
    };

    localStorage.setItem("checkout_items", JSON.stringify([checkoutItem]));
    localStorage.setItem("is_preorder_session", "true");
    router.push("/checkout");
  };

  if (loading) return <LoadingSequence />;

  if (!product)
    return <NotFound campaignStatus={!!campaign} productStatus={!!product} />;

  const images = campaign?.carousel_images?.length 
    ? campaign.carousel_images 
    : (product.image_urls?.length ? product.image_urls : [product.image_url]);

  return (
    <div className="min-h-screen pt-24 pb-20 selection:bg-fuchsia-500 relative overflow-hidden bg-white dark:bg-[#030303] transition-colors duration-500">
      {/* Decorative Elements */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-fuchsia-500/5 blur-[120px] rounded-full -mr-64 -mt-32 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full -ml-64 -mb-32 pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20">
          
          {/* LEFT: GALLERY */}
          <div className="lg:col-span-7">
            <div className="sticky top-28">
               <ProductGallery images={images} productName={product.name} />
               
               {/* Campaign Highlight (Deskripsi Tambahan dari CMS) */}
               {campaign?.description && (
                 <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   className="mt-12 p-10 rounded-[3rem] bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800"
                 >
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-6">Campaign_Manifesto</h4>
                    <p className="text-lg md:text-2xl font-medium leading-relaxed italic text-zinc-600 dark:text-zinc-300">
                      "{campaign.description}"
                    </p>
                 </motion.div>
               )}
            </div>
          </div>

          {/* RIGHT: CONTENT */}
          <div className="lg:col-span-5">
            <div className="space-y-12">
              
              {/* Header Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 rounded-full bg-fuchsia-100 dark:bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 text-[9px] font-black uppercase tracking-widest border border-fuchsia-200 dark:border-fuchsia-500/20">
                    {campaign?.badge || "LTD EDITION"}
                  </span>
                  <span className="w-12 h-px bg-zinc-200 dark:bg-zinc-800" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">
                    {campaign?.headline || "PRE-ORDER_PROTOCOL"}
                  </h2>
                  <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none text-zinc-900 dark:text-white">
                    {product.name}
                  </h1>
                </div>

                <div className="flex items-baseline gap-4 pt-2">
                   <p className="text-4xl font-black italic tracking-tight text-fuchsia-600 dark:text-fuchsia-400">
                     Rp {(campaign.price_override || product.price)?.toLocaleString()}
                   </p>
                   {(product.stock <= 5 || campaign.urgency) && (
                     <span className="text-[10px] font-bold text-red-500 uppercase animate-pulse">
                       {campaign.urgency || "Low Stock Alert"}
                     </span>
                   )}
                </div>
              </div>

              {/* Deployment & Countdown Card */}
              <div className="p-10 rounded-[3rem] bg-white dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 shadow-xl shadow-black/5 backdrop-blur-3xl space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-500">
                      <Clock size={24} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Est. Deployment</p>
                      <p className="text-xl font-black italic uppercase">{campaign?.estimation || "14 Days"}</p>
                    </div>
                  </div>
                  <Zap className="text-amber-500 animate-pulse" size={20} />
                </div>

                {timeLeft && (
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: "DAYS", val: timeLeft.d },
                      { label: "HOURS", val: timeLeft.h },
                      { label: "MINS", val: timeLeft.m },
                      { label: "SECS", val: timeLeft.s },
                    ].map((u, i) => (
                      <div key={i} className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl text-center border border-zinc-100 dark:border-zinc-700/30">
                        <p className="text-2xl md:text-3xl font-black italic leading-none tracking-tighter">{u.val.toString().padStart(2, "0")}</p>
                        <p className="text-[7px] font-black text-zinc-400 mt-2 tracking-widest">{u.label}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                   <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                        {campaign?.urgency || "ALOCATED_SLOTS_AVAILABLE"}
                      </p>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Beta_v.4</span>
                   </div>
                </div>
              </div>

              {/* Purchase Section */}
              <div className="space-y-8">
                <SizeSelector
                  sizes={campaign?.sizes || product.sizes || []}
                  selectedSize={selectedSize}
                  onSelectSize={setSelectedSize}
                />
                
                <div className="pt-2">
                  <AddToCart
                    onAdd={handleAddToCart}
                    onBuyNow={handleBuyNow}
                    disabled={!selectedSize}
                    price={product.price}
                  />
                </div>
              </div>

              {/* Metadata Details */}
              <div className="pt-12 border-t border-zinc-100 dark:border-zinc-900">
                <ProductAccordion
                  description={product.description}
                  specifications={product.specifications}
                />
              </div>

              {/* Trust & Policy */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                    <Shield size={16} className="text-zinc-400" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400">Authentic_Registry</span>
                 </div>
                 <div className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                    <Truck size={16} className="text-zinc-400" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400">Global_Fulfillment</span>
                 </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function LoadingSequence() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono gap-6">
      <div className="w-16 h-16 border-2 border-fuchsia-500/20 border-t-fuchsia-500 rounded-full animate-spin" />
      <p className="text-[10px] text-fuchsia-500 font-black uppercase tracking-[0.5em] animate-pulse">
        Syncing Vault...
      </p>
    </div>
  );
}

function NotFound({
  campaignStatus,
  productStatus,
}: {
  campaignStatus: boolean;
  productStatus: boolean;
}) {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono gap-4">
      <h1 className="text-4xl font-black uppercase italic tracking-tighter text-red-600">
        404 // Archive Missing
      </h1>
      <div className="text-[10px] text-zinc-500 uppercase tracking-widest space-y-1 text-center">
        <p>Campaign Loaded: {campaignStatus ? "YES" : "NO"}</p>
        <p>Product Linked: {productStatus ? "YES" : "NO"}</p>
        <p className="mt-4 text-zinc-600 italic">
          Please initialize campaign settings in Admin CMS
        </p>
      </div>
      <Link
        href="/"
        className="mt-8 px-6 py-3 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
      >
        Return to Portal
      </Link>
    </div>
  );
}
