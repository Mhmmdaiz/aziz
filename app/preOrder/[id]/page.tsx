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
      price: product.price,
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
      price: product.price,
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

  const images = product.image_urls?.length
    ? product.image_urls
    : [product.image_url];

  return (
    <div className="min-h-screen  pt-24 pb-20 selection:bg-fuchsia-500 relative overflow-hidden mt-5">
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-fuchsia-500/5 blur-[120px] rounded-full -mr-64 -mt-32 pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-7">
            <ProductGallery images={images} productName={product.name} />
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-28 space-y-8">
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                  {campaign?.badge || "Protocol V4"}
                </span>
              </div>

              <div>
                <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-none mb-4">
                  {product.name}
                </h1>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
                  {product.description}
                </p>
              </div>

              <div className="p-8 bg-zinc-900/5 border border-white/5 rounded-[2.5rem] backdrop-blur-xl space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-fuchsia-500/10 rounded-2xl">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">
                      Est. Deployment
                    </p>
                    <p className="font-bold text-lg">
                      {campaign?.estimation || "14 Days"}
                    </p>
                  </div>
                </div>

                {timeLeft && (
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "D", val: timeLeft.d },
                      { label: "H", val: timeLeft.h },
                      { label: "M", val: timeLeft.m },
                      { label: "S", val: timeLeft.s },
                    ].map((u, i) => (
                      <div
                        key={i}
                        className="bg-white/5 p-3 rounded-xl text-center"
                      >
                        <p className="text-xl font-black italic leading-none">
                          {u.val.toString().padStart(2, "0")}
                        </p>
                        <p className="text-[8px] font-black text-zinc-600 mt-1">
                          {u.label}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t border-white/5">
                  <p className="text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    {campaign?.urgency || "Allocation limited"}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <SizeSelector
                  sizes={campaign?.sizes || product.sizes || []}
                  selectedSize={selectedSize}
                  onSelectSize={setSelectedSize}
                />
                <AddToCart
                  onAdd={handleAddToCart}
                  onBuyNow={handleBuyNow}
                  disabled={!selectedSize}
                  price={product.price}
                />
              </div>

              <TrustBadges />

              <ProductAccordion
                description={product.description}
                specifications={product.specifications}
              />
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
