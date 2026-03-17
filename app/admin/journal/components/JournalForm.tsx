"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css"; 
import { Upload, X, Globe, EyeOff, Link as LinkIcon, FileText } from "lucide-react";

// Standard react-quill usually has issues with Next.js SSR, use dynamic import
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

import { Journal } from "../page";

interface JournalFormProps {
  initialData?: Journal | null;
  onSubmit: (data: JournalFormData) => void;
  loading: boolean;
}

export interface JournalFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  status: 'draft' | 'published';
  imageFile?: File;
}

export default function JournalForm({ initialData, onSubmit, loading }: JournalFormProps) {
  const [formData, setFormData] = useState<JournalFormData>({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    excerpt: initialData?.excerpt || "",
    content: initialData?.content || "",
    cover_image: initialData?.cover_image || "",
    status: (initialData?.status as 'draft' | 'published') || "draft",
  });
  
  const [preview, setPreview] = useState<string | null>(initialData?.cover_image || null);
  const fileRef = useRef<HTMLInputElement>(null);

  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "title" && !initialData) {
      setFormData(prev => ({ ...prev, [name]: value, slug: generateSlug(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleQuillChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      setFormData(prev => ({ ...prev, imageFile: file }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputClass = "w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-6 py-4 text-xs font-bold text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700 outline-none focus:border-cyan-500/50 focus:bg-white dark:focus:bg-zinc-900 transition-all shadow-sm";
  const labelClass = "block text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-2 italic";

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Essential Info */}
        <div className="lg:col-span-12 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Artifact_Title</label>
              <input 
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter_Magnificent_Title"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Registry_Slug</label>
              <div className="relative">
                <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300" size={14} />
                <input 
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="manifest-url-slug"
                  className={`${inputClass} pl-14`}
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>Abstract_Excerpt</label>
            <textarea 
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows={2}
              placeholder="Provide_Brief_Contextual_Abstract"
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        {/* Full Width: Content Editor */}
        <div className="lg:col-span-12">
          <label className={labelClass}>Manifest_Content</label>
          <div className="rounded-[2rem] border border-zinc-100 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/30">
            <ReactQuill 
              theme="snow"
              value={formData.content}
              onChange={handleQuillChange}
              placeholder="Compose_Grand_Narrative..."
              className="quill-selinear-style"
            />
          </div>
          <style jsx global>{`
            .quill-selinear-style .ql-toolbar {
              border: none !important;
              border-bottom: 1px solid rgba(0,0,0,0.05) !important;
              padding: 1.5rem !important;
              background: rgba(0,0,0,0.02);
            }
            .dark .quill-selinear-style .ql-toolbar {
              background: rgba(255,255,255,0.02);
              border-bottom: 1px solid rgba(255,255,255,0.05) !important;
            }
            .quill-selinear-style .ql-container {
              border: none !important;
              min-height: 300px;
              font-family: inherit;
              font-size: 0.9rem;
              font-weight: 500;
              padding: 1rem;
            }
            .quill-selinear-style .ql-editor {
              padding: 2rem !important;
              color: inherit;
            }
            .dark .quill-selinear-style .ql-stroke {
              stroke: #71717a !important;
            }
            .dark .quill-selinear-style .ql-fill {
              fill: #71717a !important;
            }
            .dark .quill-selinear-style .ql-picker {
              color: #71717a !important;
            }
          `}</style>
        </div>

        {/* Right Column: Visuals & Status */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <label className={labelClass}>Cover_Visual_Identity</label>
            <div 
              onClick={() => fileRef.current?.click()}
              className="relative group h-48 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-[2rem] flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-cyan-500/50 transition-all duration-300 bg-zinc-50 dark:bg-zinc-900/50 overflow-hidden"
            >
              {preview ? (
                <div className="absolute inset-0 group">
                  <img src={preview} alt="Form visual preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-[9px] font-black uppercase tracking-widest">Replace_Artifact</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm text-zinc-400 group-hover:text-cyan-500 transition-colors">
                    <Upload size={24} />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 group-hover:text-zinc-600 transition-colors">
                    Click_To_Inject_Image
                  </span>
                </>
              )}
              <input 
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <label className={labelClass}>Visibility_Protocol</label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: "published" as const, label: "Live_Active", icon: <Globe size={14} />, color: "border-emerald-500/20 bg-emerald-500/5 text-emerald-600" },
                  { id: "draft" as const, label: "Hidden_Draft", icon: <EyeOff size={14} />, color: "border-zinc-200 bg-zinc-100 text-zinc-500" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, status: s.id }))}
                    className={`flex items-center justify-center gap-3 py-5 rounded-[2rem] border-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                      formData.status === s.id 
                        ? s.color + " shadow-sm scale-[1.02]" 
                        : "border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:text-zinc-600 grayscale bg-zinc-50 dark:bg-zinc-900/30"
                    }`}
                  >
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-[2rem] font-black uppercase tracking-[0.4em] text-[11px] hover:shadow-2xl hover:shadow-black/20 dark:hover:shadow-white/10 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
            >
              <FileText size={16} />
              {loading ? "PROXIED_SYNCING..." : "COMMIT_CHANGES_NOW"}
            </button>
          </div>
        </div>

      </div>
    </form>
  );
}
