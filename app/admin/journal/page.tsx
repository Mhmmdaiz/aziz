"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiClock,
  FiSearch,
  FiX,
  FiCheck,
  FiRefreshCw,
  FiArrowLeft,
  FiImage,
  FiZap,
} from "react-icons/fi";
import Link from "next/link";
import Swal from "sweetalert2";
import { saveArticleAction, deleteArticleAction } from "./actions";

const CATEGORIES = [
  "Style",
  "Culture",
  "Horror Inspiration",
  "Behind The Design",
];

export default function AdminJournal() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    image_url: "",
    category: "Style",
    read_time: "5 min read",
    author: "Daemonium Editorial",
    related_products: [],
  });

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    fetchArticles();

    const channel = supabase
      .channel("admin_journal")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "articles" },
        () => fetchArticles(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setArticles(data);
    setLoading(false);
  };

  const handleOpenModal = (article: any = null) => {
    if (article) {
      setEditingArticle(article);
      setFormData({
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt || "",
        content: article.content,
        image_url: article.image_url || "",
        category: article.category,
        read_time: article.read_time,
        author: article.author || "Daemonium Editorial",
        related_products: article.related_products || [],
      });
      // Parse image_url just in case it's comma separated
      const existingImages = article.image_url ? article.image_url.split(',') : [];
      setPreviews(existingImages);
      setImages([]); // Existing images are just URLs, we don't have Files. We'll handle preserving them.
    } else {
      setEditingArticle(null);
      setFormData({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        image_url: "",
        category: "Style",
        read_time: "5 min read",
        author: "Daemonium Editorial",
        related_products: [],
      });
      setPreviews([]);
      setImages([]);
    }
    setIsModalOpen(true);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const uploadedUrls: string[] = [];
      const preservedUrls = previews.filter(p => p.startsWith('http'));

      // Upload new images
      for (const file of images) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `articles/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("products")
          .getPublicUrl(filePath);
        
        uploadedUrls.push(publicUrl);
      }

      const finalImageUrls = [...preservedUrls, ...uploadedUrls].join(',');

      const dataToSave = {
        ...formData,
        image_url: finalImageUrls || formData.image_url,
        slug: formData.slug || generateSlug(formData.title),
      };

      const result = await saveArticleAction(dataToSave, editingArticle ? editingArticle.id : null);

      if (!result.success) {
        Swal.fire("SYNC_FAILED", result.error, "error");
      } else {
        setIsModalOpen(false);
        Swal.fire({
          title: "ARTICLE_SYNCED",
          text: editingArticle
            ? "The story has been recalibrated."
            : "New story added to the void.",
          icon: "success",
          background: "#000",
          color: "#fff",
          confirmButtonColor: "#EF4444",
        });
      }
    } catch (err: any) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (previews.length + selectedFiles.length > 6) {
        return Swal.fire("LIMIT_EXCEEDED", "Maximum 6 visual assets allowed.", "warning");
      }
      
      setImages(prev => [...prev, ...selectedFiles]);
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    // If it's a blob url, we also remove it from the File array
    const targetPreview = previews[index];
    if (targetPreview.startsWith('blob:')) {
      const blobIndex = previews.filter(p => p.startsWith('blob:')).indexOf(targetPreview);
      setImages(prev => prev.filter((_, i) => i !== blobIndex));
      URL.revokeObjectURL(targetPreview);
    }
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "TERMINATE_STORY?",
      text: "This artifact will be permanently erased from the archive.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ERASE",
      cancelButtonText: "BACK",
      background: "#000",
      color: "#fff",
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#27272a",
    });

    if (result.isConfirmed) {
      const res = await deleteArticleAction(id);
      if (!res.success) Swal.fire("Error", res.error, "error");
    }
  };

  const filteredArticles = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-[#0B0B0B] pt-24 pb-12 px-6 lg:px-12 font-mono transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto">
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.8] text-zinc-900 dark:text-white">
              Editorial <br />{" "}
              <span className="text-zinc-200 dark:text-zinc-800">Archive.</span>
            </h1>
          </motion.div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="SEARCH_REGISTRY..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 p-6 pl-16 rounded-full text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-red-600 transition-all text-zinc-900 dark:text-white"
              />
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-3 bg-red-600 text-white px-10 py-6 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-xl active:scale-95"
            >
              <FiPlus /> CREATE_STORY
            </button>
          </div>
        </header>

        {/* --- ARTICLES GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading && articles.length === 0
            ? [...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-64 bg-zinc-100 dark:bg-zinc-900 rounded-[2.5rem] animate-pulse"
                />
              ))
            : filteredArticles.map((article) => (
                <motion.div
                  key={article.id}
                  layout
                  className="group relative bg-white dark:bg-zinc-900/50 rounded-[2.5rem] p-8 border border-zinc-200 dark:border-white/5 hover:border-red-500 transition-all duration-500 hover:shadow-2xl"
                >
                  <div className="space-y-6">
                    <div className="aspect-video rounded-3xl overflow-hidden bg-zinc-100 dark:bg-black border border-white/5 relative">
                      <img
                        src={
                          (article.image_url && article.image_url.split(',')[0]) ||
                          "https://via.placeholder.com/800x450?text=NO_IMAGE"
                        }
                        alt={article.title}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                      />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button
                          onClick={() => handleOpenModal(article)}
                          className="p-3 bg-white text-black rounded-full shadow-xl hover:bg-red-600 hover:text-white transition-all transform hover:scale-110"
                        >
                          <FiEdit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="p-3 bg-white text-black rounded-full shadow-xl hover:bg-black hover:text-red-500 transition-all transform hover:scale-110"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-500">
                        {article.category}
                      </span>
                      <h3 className="text-xl font-black italic uppercase italic leading-tight text-zinc-900 dark:text-white line-clamp-2">
                        {article.title}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-zinc-100 dark:border-white/5">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        <FiClock /> {article.read_time}
                      </div>
                      <Link
                        href={`/journal/${article.slug}`}
                        target="_blank"
                        className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
                      >
                        View_Live <FiZap size={10} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
        </div>

        {/* --- NO ARTICLES EMPTY STATE --- */}
        {!loading && filteredArticles.length === 0 && (
          <div className="py-40 text-center">
            <h2 className="text-6xl font-black italic opacity-10 uppercase tracking-tighter mb-4 text-zinc-300 dark:text-zinc-700">
              VOID_EMPTY
            </h2>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.5em]">
              No archival records detected.
            </p>
          </div>
        )}
      </div>

      {/* --- CREATE/EDIT MODAL --- */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-6 inset-y-12 lg:inset-24 bg-white dark:bg-zinc-900 rounded-[3rem] z-[210] shadow-3xl overflow-hidden border border-zinc-200 dark:border-white/5 flex flex-col"
            >
              <div className="p-8 md:p-12 flex items-center justify-between border-b border-zinc-100 dark:border-white/5">
                <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter text-zinc-900 dark:text-white">
                  {editingArticle ? "Update_Registry" : "New Journal"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-red-600 hover:text-white transition-all"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 md:p-12 no-scrollbar">
                <form
                  id="article-form"
                  onSubmit={handleSave}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-12"
                >
                  <div className="space-y-8">
                    <Input
                      label="STORY_TITLE"
                      value={formData.title}
                      onChange={(v: string) =>
                        setFormData({
                          ...formData,
                          title: v,
                          slug: editingArticle
                            ? formData.slug
                            : generateSlug(v),
                        })
                      }
                      placeholder="E.g. Shadows in the Threads"
                    />
                    <Input
                      label="STORY_SLUG"
                      value={formData.slug}
                      onChange={(v: string) =>
                        setFormData({ ...formData, slug: v })
                      }
                      placeholder="auto-generated-slug"
                    />

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-4 mb-4 block">
                        CATEGORY_DOMAIN
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, category: cat })
                            }
                            className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${formData.category === cat ? "bg-red-600 text-white" : "bg-zinc-100 dark:bg-black text-zinc-500 border border-transparent dark:border-zinc-800 hover:border-red-500"}`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="READ_TIME"
                        value={formData.read_time}
                        onChange={(v: string) =>
                          setFormData({ ...formData, read_time: v })
                        }
                        placeholder="5 min read"
                      />
                      <Input
                        label="AUTHOR_CREDIT"
                        value={formData.author}
                        onChange={(v: string) =>
                          setFormData({ ...formData, author: v })
                        }
                        placeholder="Daemonium Editorial"
                      />
                    </div>

                    <Input
                      label="EXCERPT_PREVIEW"
                      value={formData.excerpt}
                      onChange={(v: string) =>
                        setFormData({ ...formData, excerpt: v })
                      }
                      placeholder="Short description for listing..."
                      area
                    />
                  </div>

                  <div className="space-y-8">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-4 mb-4 block">
                        Visual_Gallery ({previews.length}/6)
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        <AnimatePresence>
                          {previews.map((src, i) => (
                            <motion.div
                              key={src}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="aspect-square rounded-[1.5rem] overflow-hidden relative border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 group"
                            >
                              <img 
                                src={src} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                alt="Gallery preview"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(i)}
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                              >
                                <FiX className="text-white" size={24} />
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>

                        {previews.length < 6 && (
                          <label 
                            className="aspect-square rounded-[1.5rem] bg-zinc-50 dark:bg-black border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center cursor-pointer hover:border-red-500 transition-all group"
                          >
                            <input type="file" multiple onChange={handleImageChange} className="hidden" accept="image/*" />
                            <FiPlus size={24} className="text-zinc-300 group-hover:text-red-500 transition-all group-hover:-translate-y-1" />
                            <span className="text-[8px] font-black uppercase text-zinc-400 mt-2 tracking-widest group-hover:text-zinc-600 transition-colors">Add_Media</span>
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-4">
                        MAIN_CONTENT_HTML
                      </label>
                      <textarea
                        value={formData.content}
                        onChange={(e) =>
                          setFormData({ ...formData, content: e.target.value })
                        }
                        placeholder="HTML content allowed..."
                        className="w-full h-[400px] bg-zinc-50 dark:bg-black p-8 rounded-[2rem] font-medium text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all resize-none border border-zinc-100 dark:border-zinc-800"
                      />
                    </div>
                  </div>
                </form>
              </div>

              <div className="pl-1 pb-5 md:p-12 border-t border-zinc-100 dark:border-white/5 flex justify-end gap-6 bg-zinc-50/50 dark:bg-black/20 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-12 py-5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-full font-black uppercase text-[10px] tracking-widest hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  form="article-form"
                  type="submit"
                  disabled={loading}
                  className="px-12 py-5 bg-red-600 text-white rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <FiRefreshCw className="animate-spin" />
                  ) : (
                    <FiCheck />
                  )}
                  {editingArticle ? "UPLOAD" : "UPLOAD"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  icon,
  area = false,
}: any) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 ml-4">
        {icon && <span className="text-zinc-500">{icon}</span>}
        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
          {label}
        </label>
      </div>
      {area ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full bg-zinc-50 dark:bg-black p-6 rounded-[2rem] font-bold italic focus:ring-2 focus:ring-red-600 outline-none transition-all resize-none border border-zinc-100 dark:border-zinc-800"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-zinc-50 dark:bg-black p-6 rounded-full font-bold italic focus:ring-2 focus:ring-red-500 outline-none transition-all border border-zinc-100 dark:border-zinc-800"
        />
      )}
    </div>
  );
}
