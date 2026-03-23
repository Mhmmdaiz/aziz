"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { useCart } from "@/components/providers/CartProvider";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";

// Components
import { ProductGallery } from "./components/ProductGallery";
import { ProductInfo } from "./components/ProductInfo";
import { SizeSelector } from "./components/SizeSelector";
import { AddToCart } from "./components/AddToCart";
import { TrustBadges } from "./components/TrustBadges";
import { ProductAccordion } from "./components/ProductAccordion";
import { RelatedProducts } from "./components/RelatedProducts";

export default function DaemoniumProductPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<any | null>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection State
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setProduct(data);

        // Fetch related products
        const { data: relData } = await supabase
          .from("products")
          .select("*")
          .neq("id", id)
          .limit(4);

        if (relData) setRelated(relData);

        // REALTIME SUBSCRIPTION
        const channel = supabase
          .channel(`product_updates_${id}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "products",
              filter: `id=eq.${id}`,
            },
            (payload) => {
              console.log("Realtime product update received:", payload);
              if (payload.new) {
                // Determine the new sizes array
                const newSizes = payload.new.sizes || [];

                setProduct((prev: any) => ({ ...prev, ...payload.new }));

                // If the currently selected size is no longer available in the new sizes list
                // (e.g., admin removed it), deselect it.
                setSelectedSize((currentSelected) => {
                  if (currentSelected && !newSizes.includes(currentSelected)) {
                    return "";
                  }
                  return currentSelected;
                });
              }
            },
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
      size: selectedSize || "Default", // In a real scenario we enforce this
      quantity: 1,
    });
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
    };

    localStorage.setItem("checkout_items", JSON.stringify([checkoutItem]));
    router.push("/checkout");
  };

  if (loading) return <LoadingSequence />;

  if (!product)
    return (
      <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#0B0B0B] flex items-center justify-center font-mono transition-colors duration-500">
        <h1 className="text-4xl text-red-600 font-black animate-pulse">
          404 // PRODUK TIDAK DITEMUKAN
        </h1>
      </div>
    );

  const images =
    product.image_urls && product.image_urls.length > 0
      ? product.image_urls
      : [product.image_url];

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
        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 xl:gap-24">
          {/* LEFT: GALLERY */}
          <div className="lg:col-span-7 relative z-10 w-full">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <ProductGallery images={images} productName={product.name} />
            </motion.div>
          </div>

          {/* RIGHT: INFO & ACTIONS */}
          <div className="lg:col-span-5 flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "circOut" }}
              className="sticky top-28 h-fit pb-10"
            >
              <ProductInfo
                id={product.id}
                name={product.name}
                price={product.price}
                category={product.category}
                stock={product.stock}
                is_high_demand={product.is_high_demand}
                sold_today={product.sold_today}
                rating={product.rating}
                short_description={product.short_description}
              />

              <div className="my-8 h-px bg-zinc-200 dark:bg-[#222] w-full" />

              <div className="space-y-8">
                <SizeSelector
                  sizes={product.sizes || []}
                  selectedSize={selectedSize}
                  onSelectSize={setSelectedSize}
                />

                {/* CTA Container */}
                <div className="w-full mt-6 md:mt-0 transition-colors duration-500">
                  <AddToCart
                    onAdd={handleAddToCart}
                    onBuyNow={handleBuyNow}
                    disabled={!selectedSize}
                    price={product.price}
                    isSoldOut={product.stock <= 0}
                  />
                </div>
              </div>

              <TrustBadges />

              <ProductAccordion
                description={product.description}
                specifications={product.specifications}
              />
            </motion.div>
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <RelatedProducts products={related} />
        </motion.div>
      </div>
    </div>
  );
}

// Brutalist Loader
function LoadingSequence() {
  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#0B0B0B] flex flex-col items-center justify-center font-mono gap-6 transition-colors duration-500">
      <div className="relative w-24 h-24 border border-zinc-200 dark:border-[#333] flex items-center justify-center bg-white dark:bg-transparent shadow-sm">
        <div className="absolute inset-0 border-t-2 border-red-600 animate-spin" />
        <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase animate-pulse">
          Mohon Tunggu
        </span>
      </div>
      <p className="text-[10px] text-red-600 font-black uppercase tracking-[0.5em] animate-pulse">
        Menyiapkan Data...
      </p>
    </div>
  );
}
