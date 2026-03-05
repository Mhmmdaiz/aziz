"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft, FiMaximize2, FiLoader } from "react-icons/fi";

const BASE_URL = "http://127.0.0.1:8000";

/**
 * Helper: Normalisasi URL Image dari Laravel Storage
 */
const getStorageImg = (path: string | null) => {
  if (!path) return "/placeholder-journal.jpg";
  if (path.startsWith("http")) return path;
  const fileName = path.replace(/^(public\/|storage\/|posts\/)/, "");
  return `${BASE_URL}/storage/posts/${fileName}`;
};

export default function JournalDetail() {
  const params = useParams();
  const slug = params?.slug;
  const router = useRouter();

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/api/posts/${slug}`);
        const data = res.data.data || res.data;
        setPost(data);
      } catch (err) {
        console.error("Narrative not found:", err);
        router.push("/journal");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [slug, router]);

  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white text-black">
        <FiLoader className="animate-spin text-zinc-200 mb-4" size={32} />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">
          Synchronizing_Archive...
        </span>
      </div>
    );

  if (!post) return null;

  return (
    <main className="min-h-screen bg-white selection:bg-black selection:text-white overflow-x-hidden">
      {/* 1. CINEMATIC HERO SECTION */}
      <header className="relative min-h-[70vh] md:min-h-[85vh] lg:h-[95vh] w-full bg-zinc-900 overflow-hidden">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src={getStorageImg(post.image)}
            className="w-full h-full object-cover grayscale opacity-60"
            alt={post.title}
          />
        </motion.div>

        {/* Navigation Overlay */}
        <div className="absolute top-0 w-full z-20">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center">
            <Link
              href="/journal"
              className="text-white mix-blend-difference flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] group"
            >
              <FiArrowLeft
                className="group-hover:-translate-x-2 transition-transform"
                size={16}
              />
              Exit_Archive
            </Link>
          </div>
        </div>

        {/* Title Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end pb-12 md:pb-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-screen-xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="max-w-5xl"
            >
              <div className="flex flex-wrap items-center gap-4 md:gap-8 mb-6 md:mb-10">
                <span className="px-4 py-1.5 bg-white text-black text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-full">
                  {post.category || "General"}
                </span>
                <span className="text-white/50 text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em]">
                  VOL. {new Date(post.created_at).getFullYear()} — ISSUE_01
                </span>
              </div>
              <h1 className="text-[clamp(2.5rem,9vw,10rem)] font-black italic text-white leading-[0.85] tracking-tighter uppercase break-words">
                {post.title}
              </h1>
            </motion.div>
          </div>
        </div>

        {/* Subtle Gradient Cover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
      </header>

      {/* 2. EDITORIAL GRID LAYOUT */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          {/* Sidebar: Info Chronicle */}
          <aside className="lg:col-span-4 order-2 lg:order-1">
            <div className="lg:sticky lg:top-32 space-y-12">
              <div className="pt-8 border-t-2 border-black">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 mb-8">
                  Chronicle_Metadata
                </h4>
                <div className="space-y-6">
                  <div className="flex justify-between items-end border-b border-zinc-100 pb-4">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      Architect
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                      Archive_System
                    </span>
                  </div>
                  <div className="flex justify-between items-end border-b border-zinc-100 pb-4">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      Released
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                      {new Date(post.created_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-8 md:p-10 bg-zinc-50 rounded-[2rem] md:rounded-[3rem] border border-zinc-100">
                <p className="italic text-sm leading-relaxed text-zinc-500 font-medium">
                  "This narrative explores the intersection of architectural
                  precision, material culture, and the evolving identity of
                  modern garments."
                </p>
              </div>
            </div>
          </aside>

          {/* Main Article Content */}
          <article className="lg:col-span-8 order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="prose prose-zinc prose-base md:prose-lg lg:prose-xl max-w-none"
            >
              {/* Responsive Dropcap & Content */}
              <div className="text-zinc-900 leading-[1.6] whitespace-pre-line break-words font-medium">
                <span className="block first-letter:text-7xl md:first-letter:text-8xl lg:first-letter:text-9xl first-letter:font-black first-letter:float-left first-letter:mr-4 first-letter:mt-2 first-letter:leading-none">
                  {post.content}
                </span>
              </div>
            </motion.div>

            {/* Pagination / Footer of Narrative */}
            <div className="mt-20 md:mt-32 pt-12 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-10">
              <div className="flex flex-col sm:flex-row gap-8 md:gap-16 w-full md:w-auto">
                <Link href="#" className="group">
                  <p className="text-[9px] font-black uppercase text-zinc-300 tracking-[0.3em] mb-2">
                    Previous_Story
                  </p>
                  <p className="font-black italic uppercase text-xs group-hover:text-blue-600 transition-colors tracking-tighter">
                    The Identity Shift —
                  </p>
                </Link>
                <Link href="#" className="group">
                  <p className="text-[9px] font-black uppercase text-zinc-300 tracking-[0.3em] mb-2">
                    Next_Story
                  </p>
                  <p className="font-black italic uppercase text-xs group-hover:text-blue-600 transition-colors tracking-tighter">
                    Digital Fabric —
                  </p>
                </Link>
              </div>
              <button className="h-14 w-14 bg-black text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shrink-0 shadow-xl">
                <FiMaximize2 size={20} />
              </button>
            </div>
          </article>
        </div>
      </div>

      {/* SUBTLE FOOTER */}
      <footer className="py-20 border-t border-zinc-50 text-center">
        <div className="text-xl font-black italic uppercase tracking-tighter mb-4">
          Archive.
        </div>
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-300 italic">
          © 2026 Global_Editorial_Collective
        </p>
      </footer>
    </main>
  );
}
