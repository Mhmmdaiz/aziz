"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { supabase } from "@/utils/supabase/client";
import {
  FiClock,
  FiUser,
  FiCalendar,
  FiArrowLeft,
  FiShoppingBag,
  FiArrowRight,
  FiMaximize2,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCart } from "@/components/providers/CartProvider";
import { toast } from "react-hot-toast";

export default function ArticleDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const { addToCart } = useCart();
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    fetchArticle();

    const channel = supabase
      .channel(`article_${slug}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "articles",
          filter: `slug=eq.${slug}`,
        },
        () => fetchArticle(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [slug]);

  const fetchArticle = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .single();

    if (data) {
      setArticle(data);
      if (data.related_products && data.related_products.length > 0) {
        fetchRelatedProducts(data.related_products);
      }
    } else {
      // Mock data for fallback/dev
      const mock = {
        title: "Shadows in the Threads: The Brutalist Aesthetic",
        excerpt:
          "Exploring the intersection of raw architecture and streetwear silhouettes in our latest dark drop.",
        content: `
          <h2>The Foundation of Silence</h2>
          <p>Brutalism isn't just about concrete; it's about transparency. It's about showing the structure as it is, without the mask of decorative pretense. In our latest collection, we've translated this philosophy into garments that emphasize form over ornament.</p>
          <blockquote>"Architecture is the learned game, correct and magnificent, of forms assembled in the light." - Le Corbusier</blockquote>
          <h2>Materiality & Texture</h2>
          <p>The choice of heavy-weight cotton was deliberate. It has a structural integrity that reminds us of the raw surfaces of the Barbican or the Hayward Gallery. When you wear these pieces, you feel the weight of the design.</p>
          <img src="https://images.unsplash.com/photo-1518005020250-ee2b99d4fb1c?q=80&w=2000&auto=format&fit=crop" alt="Brutalist Architecture" />
          <h2>The Dark Palette</h2>
          <p>Color is kept to a minimum. We work in the shades of shadows—charcoal, obsidian, and deep slate. This allows the silhouette to speak louder than the hue. It creates a silhouette that is both mysterious and undeniably present.</p>
        `,
        image_url:
          "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop",
        category: "Style",
        read_time: "5 min read",
        author: "Archivist_01",
        created_at: new Date().toISOString(),
        related_products: [],
      };
      setArticle(mock);
    }
    setLoading(false);
  };

  const fetchRelatedProducts = async (ids: string[]) => {
    const { data } = await supabase.from("products").select("*").in("id", ids);
    if (data) setRelatedProducts(data);
  };

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
      size: "M", // Default for journal add
      quantity: 1,
    });
    toast.success(`${product.name} added to vault`, {
      style: {
        background: "#000",
        color: "#fff",
        borderRadius: "2rem",
        fontSize: "10px",
        fontWeight: "bold",
      },
    });
  };

  const images = article?.image_url ? article.image_url.split(",").slice(1) : [];

  useEffect(() => {
    if (images.length <= 1 || isFullscreen) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 4000); // 4 seconds auto-slide
    return () => clearInterval(interval);
  }, [images.length, isFullscreen]);

  if (loading)
    return (
      <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#0B0B0B] flex items-center justify-center transition-colors duration-500">
        <div className="w-12 h-12 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <main className="min-h-screen bg-[#FBFBFD] dark:bg-[#0B0B0B] text-zinc-900 dark:text-zinc-100 pb-32 transition-colors duration-500">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-red-600 z-[100] origin-left"
        style={{ scaleX }}
      />

      {/* Header / Hero Section */}
      <header className="relative h-[80vh] w-full overflow-hidden">
        <img
          src={article.image_url?.split(",")[0]}
          alt={article.title}
          className="w-full h-full object-cover opacity-50 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FBFBFD] dark:from-[#0B0B0B] via-[#FBFBFD]/40 dark:via-[#0B0B0B]/40 to-transparent transition-colors duration-500" />

        <div className="absolute inset-0 flex flex-col justify-end container mx-auto px-6 pb-20">
          <Link
            href="/journal"
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors mb-8 group"
          >
            <FiArrowLeft className="group-hover:-translate-x-2 transition-transform" />{" "}
            Back To Journal
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl space-y-6"
          >
            <span className="px-4 py-1.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
              {article.category}
            </span>
            <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.9]">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-8 text-[10px] font-bold text-zinc-500 uppercase tracking-widest pt-4">
              <div className="flex items-center gap-2">
                <FiUser className="text-red-500" /> {article.author}
              </div>
              <div className="flex items-center gap-2">
                <FiCalendar className="text-red-500" />{" "}
                {new Date(article.created_at).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                <FiClock className="text-red-500" /> {article.read_time}
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Content Area */}
      <article className="container mx-auto px-6 mt-20 max-w-3xl">
        <div
          className="prose dark:prose-invert prose-red max-w-none transition-colors duration-500
          prose-h2:text-3xl prose-h2:text-zinc-900 dark:prose-h2:text-white prose-h2:font-black prose-h2:uppercase prose-h2:italic prose-h2:tracking-tighter prose-h2:mt-12 prose-h2:mb-6
          prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-p:text-lg prose-p:leading-relaxed prose-p:mb-8 prose-p:italic
          prose-blockquote:border-l-4 prose-blockquote:border-red-600 prose-blockquote:bg-zinc-100 dark:prose-blockquote:bg-zinc-900/50 prose-blockquote:p-8 prose-blockquote:rounded-r-2xl prose-blockquote:italic prose-blockquote:text-zinc-700 dark:prose-blockquote:text-zinc-300
          prose-img:rounded-[2.5rem] prose-img:border prose-img:border-black/5 dark:prose-img:border-white/5 prose-img:my-16"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* VISUAL GALLERY (SLIDER) */}
        {images.length > 0 && (
          <section className="mt-20 border-t border-black/5 dark:border-white/5 pt-16">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-black dark:text-white transition-colors duration-500 mb-10">
              Visual Artifacts<span className="text-red-600">.</span>
            </h3>
            
            <div className="relative aspect-[16/9] w-full rounded-[2rem] overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-black/5 dark:border-white/5 group">
              <img
                src={images[currentSlide]}
                onClick={() => setIsFullscreen(true)}
                alt={`Gallery asset ${currentSlide + 1}`}
                className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[1s] cursor-pointer"
              />
              
              {/* Overlay button full screen */}
              <div 
                className="absolute top-4 right-4 p-3 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-red-600"
                onClick={() => setIsFullscreen(true)}
              >
                <FiMaximize2 size={20} />
              </div>

              {/* Navigation dots */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === currentSlide ? "w-8 bg-red-600" : "w-1.5 bg-white/50 hover:bg-white"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* RELATED PRODUCTS - Shop This Look */}
        <section className="mt-32 p-10 border border-black/5 dark:border-white/5 bg-zinc-100/50 dark:bg-zinc-900/30 rounded-[3rem] backdrop-blur-xl transition-colors duration-500">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter text-black dark:text-white transition-colors duration-500">
              Shop This Look<span className="text-red-600">.</span>
            </h2>
            <FiShoppingBag className="text-zinc-500 dark:text-zinc-700" size={32} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {relatedProducts.length > 0 ? (
              relatedProducts.map((p) => (
                <div
                  key={p.id}
                  className="group flex items-center gap-6 bg-white/60 dark:bg-black/40 p-4 rounded-3xl border border-black/5 dark:border-white/5 hover:border-red-500/30 dark:hover:border-red-500/30 transition-all"
                >
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 shrink-0">
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black uppercase text-black dark:text-white truncate transition-colors duration-500">
                      {p.name}
                    </h4>
                    <p className="text-[10px] font-bold text-zinc-500 mt-1">
                      IDR {Number(p.price).toLocaleString()}
                    </p>
                    <button
                      onClick={() => handleAddToCart(p)}
                      className="mt-3 text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-white flex items-center gap-2 group/btn"
                    >
                      Add_To_Vault{" "}
                      <FiArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 py-10 text-center border-2 border-dashed border-black/10 dark:border-white/5 rounded-3xl">
                <p className="text-zinc-500 dark:text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em]">
                  No Artifacts Linked Yet
                </p>
                <Link
                  href="/shop"
                  className="inline-block mt-4 text-[9px] font-black uppercase tracking-[0.2em] bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-full hover:bg-red-600 dark:hover:bg-red-600 hover:text-white transition-colors"
                >
                  Browse Archive
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Bottom Navigation */}
        <div className="mt-32 pt-20 border-t border-black/5 dark:border-white/5 flex flex-col items-center gap-10">
          <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 dark:text-zinc-600">
            You Reached The Void
          </h3>
          <Link
            href="/journal"
            className="group relative px-20 py-8 bg-black dark:bg-white text-white dark:text-black rounded-full font-black uppercase text-[12px] tracking-widest hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-xl dark:shadow-2xl"
          >
            Return To Timeline
          </Link>
        </div>
      </article>

      {/* FULLSCREEN LIGHTBOX */}
      {isFullscreen && images.length > 0 && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 md:p-12">
          {/* Close Button */}
          <button 
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 right-6 p-4 text-white hover:text-red-500 transition-colors z-50 bg-black/50 rounded-full"
          >
            <FiX size={24} />
          </button>
          
          {/* Navigation Prev */}
          {images.length > 1 && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
              }}
              className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 p-4 text-white hover:text-red-500 transition-colors z-50 bg-black/50 rounded-full"
            >
              <FiChevronLeft size={32} />
            </button>
          )}

          <img 
            src={images[currentSlide]}
            alt={`Fullscreen Asset ${currentSlide + 1}`}
            className="max-w-full max-h-full object-contain rounded-lg"
          />

          {/* Navigation Next */}
          {images.length > 1 && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide((prev) => (prev + 1) % images.length);
              }}
              className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 p-4 text-white hover:text-red-500 transition-colors z-50 bg-black/50 rounded-full"
            >
              <FiChevronRight size={32} />
            </button>
          )}
          
          <div className="absolute bottom-10 left-0 right-0 text-center">
            <span className="text-white/50 text-xs font-black tracking-[0.5em] uppercase">
              {currentSlide + 1} / {images.length}
            </span>
          </div>
        </div>
      )}
    </main>
  );
}
