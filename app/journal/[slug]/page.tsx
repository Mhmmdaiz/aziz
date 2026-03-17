"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  Calendar, 
  Tag, 
  Clock, 
  Share2, 
  User,
  Zap,
  ArrowRight
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function JournalDetail() {
  const { slug } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from("journals")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (!data) {
          setError("MANIFEST_NOT_FOUND");
        } else {
          setPost(data);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchPost();
  }, [slug]);

  if (loading)
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FBFBFD] dark:bg-black font-mono">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-zinc-100 dark:border-zinc-900 border-t-zinc-950 dark:border-t-white rounded-full mb-6"
        />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse dark:text-white">Registry_Syncing...</p>
      </div>
    );

  if (error || !post)
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#FBFBFD] dark:bg-black p-6 text-center font-mono">
        <div className="w-20 h-20 bg-red-500/10 rounded-[2rem] flex items-center justify-center text-red-500 mb-8">
          <Zap size={32} />
        </div>
        <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter mb-4 dark:text-white">
          Registry_Failure<span className="text-red-500">.</span>
        </h1>
        <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mb-10">{error || "The artifact you seek is lost in the void."}</p>
        <Link
          href="/journal"
          className="px-10 py-5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-full font-black uppercase tracking-widest text-[10px] hover:shadow-2xl transition-all"
        >
          Return_to_Archives
        </Link>
      </div>
    );

  const formattedDate = post.created_at 
    ? new Date(post.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })
    : "Recently_Recorded";

  return (
    <main className="min-h-screen bg-[#FBFBFD] dark:bg-black selection:bg-zinc-950 selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-500 font-sans relative overflow-hidden">
      
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-zinc-200/20 dark:bg-zinc-800/10 blur-[120px] rounded-full -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-zinc-100/30 dark:bg-zinc-900/10 blur-[120px] rounded-full -z-10 pointer-events-none" />

      {/* NAVIGATION BAR (Floating Style) */}
      <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-7xl">
        <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl border border-zinc-100 dark:border-zinc-800/50 p-3 rounded-full flex items-center justify-between shadow-sm">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-3 pl-4 pr-6 py-3 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white">Back_Archive</span>
          </button>
          
          <div className="hidden md:flex items-center gap-8">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-300">Selinear_Protocols // 0.4.1</span>
          </div>

          <div className="flex gap-2 pr-2">
            <button className="p-3 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-zinc-400 hover:text-zinc-950 dark:hover:text-white">
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-40 md:pt-56 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center gap-4 mb-8"
          >
            <div className="px-4 py-2 bg-zinc-950 dark:bg-white rounded-full flex items-center gap-2">
              <Tag size={12} className="text-white dark:text-zinc-950" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white dark:text-zinc-950">
                {post.category || "General_Artifact"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <Calendar size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest">{formattedDate}</span>
            </div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(2.5rem,8vw,6rem)] font-black italic uppercase tracking-tighter leading-[0.85] mb-12 dark:text-white"
          >
            {post.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative aspect-[16/8] rounded-[3rem] md:rounded-[5rem] overflow-hidden border border-zinc-100 dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-950 shadow-2xl shadow-zinc-200/50 dark:shadow-none mb-20 group"
          >
            <Image 
              src={post.cover_image || "/placeholder.jpg"} 
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-[2s] ease-out-expo"
              priority
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
          </motion.div>

          {/* ARTICLE CONTENT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Sidebar Meta */}
            <aside className="lg:col-span-3 space-y-12">
              <div className="p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900/30 border border-zinc-50 dark:border-zinc-800/50 shadow-sm">
                <div className="space-y-6">
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400 mb-2 italic">Recorded_By</p>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white">
                        <User size={14} />
                      </div>
                      <p className="text-[10px] font-black uppercase text-zinc-900 dark:text-white">CHCKT_Admin</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400 mb-2 italic">Read_Duration</p>
                    <div className="flex items-center gap-3 text-zinc-900 dark:text-white">
                      <Clock size={14} />
                      <p className="text-[10px] font-black uppercase">~ 4 MIN_READ</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="h-px bg-zinc-100 dark:bg-zinc-900 mb-8" />
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-300 leading-relaxed italic">
                  THIS_ARTIFACT_IS_PART_OF_THE_ARCHIVE_PROTOCOL_SS26. REPRODUCTION_UNAUTHORIZED.
                </p>
              </div>
            </aside>

            {/* Main Content */}
            <article className="lg:col-span-9">
              <div 
                className="prose prose-zinc dark:prose-invert prose-2xl max-w-none 
                  prose-headings:font-black prose-headings:italic prose-headings:uppercase prose-headings:tracking-tighter prose-headings:leading-none
                  prose-headings:mt-[2.5em] prose-headings:mb-[1em]
                  prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-p:leading-relaxed prose-p:font-medium
                  prose-p:mb-[1.8em]
                  prose-strong:text-zinc-950 dark:prose-strong:text-white prose-strong:font-black
                  prose-img:rounded-[2.5rem] prose-img:border prose-img:border-zinc-100 dark:prose-img:border-zinc-800
                  prose-blockquote:border-l-4 prose-blockquote:border-zinc-950 dark:prose-blockquote:border-white prose-blockquote:pl-10 prose-blockquote:italic prose-blockquote:text-zinc-500
                "
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* ENDING PROTOCOL */}
              <div className="mt-24 pt-16 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Status_Update</p>
                  <p className="text-sm font-black italic uppercase dark:text-white">EndOf_Submission.</p>
                </div>
                <Link 
                  href="/journal"
                  className="flex items-center gap-4 text-xs font-black uppercase tracking-widest group dark:text-white"
                >
                  Return_Archive
                  <div className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center group-hover:bg-zinc-950 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-zinc-950 transition-all">
                    <ArrowRight size={16} />
                  </div>
                </Link>
              </div>
            </article>

          </div>
        </div>
      </section>

      {/* FOOTER SPACING */}
      <div className="h-32" />
    </main>
  );
}
