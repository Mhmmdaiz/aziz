"use client";

import { useState, useEffect, useMemo } from "react";

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
  const [fetchError, setFetchError] = useState<string | null>(null);

  
  const campaignPrice = useMemo(() => {
    if (campaign?.price > 0) return campaign.price;
    return campaign?.price_override || product?.price || 0;
  }, [campaign, product]);


  const isUuid =
    id && id !== "default" && id !== "preorder" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const init = async () => {
      try {
        setLoading(true);
        let currentCampaign = null;

        if (id && isUuid) {
          const { data, error } = await supabase
            .from("po_campaigns")
            .select("*")
            .eq("id", id)
            .single();
          if (data) currentCampaign = data;
          else if (error) setFetchError(error.message);
        } else {
          const { data: setting } = await supabase
            .from("site_settings")
            .select("*")
            .eq("key", "landing_content")
            .single();
          if (setting?.value?.sections) {
            const poSection = setting.value.sections.find((s: any) => s.type === 'preorder');
            if (poSection) {
              currentCampaign = { 
                ...poSection.content,
                id: "preorder", // alias id
                visible: poSection.visible 
              };
            }
          }
        }


        if (currentCampaign) {
          setCampaign(currentCampaign);
          if (currentCampaign.product_id) {
            const { data: pData, error: pError } = await supabase
              .from("products")
              .select("*")
              .eq("id", currentCampaign.product_id);
              
            if (pData && pData.length > 0) {
              setProduct(pData[0]);
              if (pData.length > 1) {
                console.warn(`Multiple products found for ID: ${currentCampaign.product_id}`);
              }
            } else if (pError) {
              setFetchError(pError.message);
            } else {
              setFetchError(`PRODUCT_NOT_FOUND_IN_DB (ID: ${currentCampaign.product_id})`);
            }
          } else {

            setFetchError("NO_PRODUCT_ID_IN_CAMPAIGN");
          }
        } else if (!fetchError) {
          setFetchError("CAMPAIGN_NOT_FOUND");
        }
      } catch (err: any) {
        setFetchError(err.message);
      } finally {
        setLoading(false);
      }
    };

    init();

    // Setup Campaign Realtime
    let campaignChannel: any;
    const setupCampaignRealtime = async () => {
      const { data: currentSetting } = await supabase
        .from("site_settings")
        .select("id")
        .eq(
          id && id !== "default" && isUuid ? "id" : "key",
          id && id !== "default" && isUuid ? id : "landing_content",
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
              if (p.new.key === "landing_content") {
                const poSection = p.new.value.sections.find((s: any) => s.type === 'preorder');
                if (poSection) setCampaign({ ...poSection.content, id: "preorder", visible: poSection.visible });
              } else {
                setCampaign(p.new.value);
              }
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

    const fetchCurrentProduct = async () => {
      const { data: pData } = await supabase
        .from("products")
        .select("*")
        .eq("id", campaign.product_id);
      if (pData && pData.length > 0) setProduct(pData[0]);
    };


    fetchCurrentProduct();

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

  const isExpired = !timeLeft && campaign?.countdown_target && new Date(campaign.countdown_target).getTime() < new Date().getTime();

  const campaignSizes = campaign?.sizes 
    ? (typeof campaign.sizes === 'string' 
        ? campaign.sizes.split(',').map((s: string) => s.trim()).filter(Boolean) 
        : campaign.sizes)
    : (product?.sizes || []);


  const handleAddToCart = () => {
    if (!product || isExpired) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: campaignPrice,
      image: product.image_url,
      size: selectedSize || "Default",
      quantity: 1,
      is_preorder: true,
    });
    localStorage.setItem("is_preorder_session", "true");
  };

  const handleBuyNow = () => {
    if (!product || isExpired) return;

    const checkoutItem = {
      id: product.id,
      name: product.name,
      price: campaignPrice,
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
    return <NotFound 
      campaignStatus={!!campaign} 
      productStatus={!!product} 
      productId={campaign?.product_id}
      errorMessage={fetchError || undefined}
    />;

  const images = campaign?.carousel_images?.length 
    ? campaign.carousel_images 
    : (product.image_urls?.length ? product.image_urls : [product.image_url]);




  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#0B0B0B] text-zinc-900 dark:text-white pt-24 pb-32 md:pb-24 selection:bg-red-600 selection:text-white relative overflow-hidden transition-colors duration-500">
      {/* Brutalist Noise Texture Override */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-50 dark:opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 mt-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 xl:gap-24 uppercase">
          
          {/* LEFT: GALLERY */}
          <div className="lg:col-span-7 relative z-10 w-full">
             <motion.div
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.6, ease: "easeOut" }}
             >
               <ProductGallery images={images} productName={product.name} />
               {isExpired && (
                 <div className="absolute inset-0 z-20 bg-black/40 flex items-center justify-center rounded-[3rem]">
                   <div className="border-8 border-white px-8 py-4 rotate-[-15deg]">
                     <span className="text-white text-5xl md:text-8xl font-black uppercase italic tracking-tighter">EXPIRED</span>
                   </div>
                 </div>
               )}
             </motion.div>
          </div>

          {/* RIGHT: INFO & ACTIONS */}
          <div className="lg:col-span-5 flex flex-col">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, delay: 0.2, ease: "circOut" }}
               className="sticky top-28 h-fit pb-10 space-y-12"
            >
              
              {/* Header Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 rounded-full bg-fuchsia-100 dark:bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 text-[9px] font-black uppercase tracking-widest border border-fuchsia-200 dark:border-fuchsia-500/20">
                    {isExpired ? "CAMPAIGN ENDED" : (campaign?.badge || "LTD EDITION")}
                  </span>
                  <span className="w-12 h-px bg-zinc-200 dark:bg-zinc-800" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">
                    {campaign?.headline || "PRE-ORDER PROTOCOL"}
                  </h2>
                  <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none text-zinc-900 dark:text-white">
                    {product.name}
                  </h1>
                </div>

                <div className="flex items-baseline gap-4 pt-2">
                   <p className="text-4xl font-black italic tracking-tight text-fuchsia-600 dark:text-fuchsia-400">
                     Rp {campaignPrice?.toLocaleString()}
                   </p>
                   {campaign?.urgency && (
                     <span className="text-[10px] font-bold text-red-500 uppercase animate-pulse">
                       {campaign.urgency}
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
                      <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Estimated Shipping</p>
                      <p className="text-xl font-black italic uppercase">{campaign?.estimation || "14 Days"}</p>
                    </div>
                  </div>
                  <Zap className="text-amber-500 animate-pulse" size={20} />
                </div>

                {timeLeft ? (
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: "DAYS", val: timeLeft.d },
                      { label: "HRS", val: timeLeft.h },
                      { label: "MIN", val: timeLeft.m },
                      { label: "SEC", val: timeLeft.s },
                    ].map((unit, i) => (
                      <div key={i} className="flex flex-col items-center p-3 rounded-2xl bg-zinc-50 dark:bg-black/40 border border-zinc-100 dark:border-white/5">
                        <span className="text-2xl font-black italic tracking-tighter tabular-nums">{unit.val?.toString().padStart(2, "0")}</span>
                        <span className="text-[7px] font-black text-zinc-500 tracking-[0.2em]">{unit.label}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-center text-red-500 font-bold uppercase tracking-widest text-[10px]">
                     BATCH CLOSED
                  </div>
                )}
              </div>

              {/* Selection Area */}
              <div className="space-y-8 p-1">
                <SizeSelector
                  sizes={campaignSizes}
                  selectedSize={selectedSize}
                  onSelectSize={setSelectedSize}
                />

                <div className="grid grid-cols-1 gap-4">
                  <AddToCart
                    onAdd={handleAddToCart}
                    onBuyNow={handleBuyNow}
                    disabled={!selectedSize || isExpired}
                    price={campaignPrice}
                    isExpired={isExpired}
                  />
                </div>

              </div>

              {/* Metadata Details */}
              <div className="pt-12 border-t border-zinc-100 dark:border-zinc-900">
                {/* Campaign Accordion Override */}
              <ProductAccordion
                description={campaign?.description || product.description}
                specifications={campaign?.details || product.specifications}
              />
              </div>

              {/* Trust & Policy */}
              <div className="grid grid-cols-2 gap-4 text-center">
                 <div className="flex items-center justify-center gap-3 p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                    <Shield size={16} className="text-zinc-400" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 italic">Authentic Registry</span>
                 </div>
                 <div className="flex items-center justify-center gap-3 p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                    <Truck size={16} className="text-zinc-400" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 italic">Global Fulfillment</span>
                 </div>
              </div>

            </motion.div>
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
        Initializing...
      </p>
    </div>
  );
}

function NotFound({
  campaignStatus,
  productStatus,
  productId,
  errorMessage,
}: {
  campaignStatus: boolean;
  productStatus: boolean;
  productId?: string;
  errorMessage?: string;
}) {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono gap-4 text-center px-4">
      <h1 className="text-4xl font-black uppercase italic tracking-tighter text-red-600">
        404 // Item Not Found
      </h1>
      <div className="text-[10px] text-zinc-500 uppercase tracking-widest space-y-1">
        <p>Campaign Status: {campaignStatus ? "ACTIVE" : "MISSING"}</p>
        <p>Product Link: {productStatus ? "LINKED" : "UNLINKED"}</p>
        {campaignStatus && (
          <p className="mt-2 text-[8px] text-zinc-700">Ref ID: {productId || "EMPTY"}</p>
        )}
        {errorMessage && (
          <p className="mt-2 text-[8px] text-red-500 font-mono italic uppercase bg-red-500/10 px-4 py-2 rounded-lg">Log: {errorMessage}</p>
        )}
        <p className="mt-8 text-zinc-600 italic">
          Please initialize campaign settings in the Admin CMS to proceed.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-12">
        <Link
          href="/"
          className="px-8 py-4 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all text-center"
        >
          Return to Portal
        </Link>
        <Link
          href="/admin/preorder"
          className="px-8 py-4 bg-fuchsia-600 border border-fuchsia-500 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-fuchsia-700 transition-all text-center"
        >
          Configure in Admin CMS
        </Link>
      </div>

    </div>
  );
}
