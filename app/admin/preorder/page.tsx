"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/utils/supabase/client";
import { updateSiteSettingsAction } from "../settings/actions";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiLayout,
  FiEye,
  FiEyeOff,
  FiMove,
  FiSave,
  FiZap,
  FiEdit,
  FiClock,
  FiImage,
  FiPlus,
  FiTrash2,
  FiUploadCloud,
  FiLoader,
  FiChevronRight,
  FiArrowLeft,
  FiType,
  FiLink,
  FiGrid,
  FiCamera,
} from "react-icons/fi";
import Swal from "sweetalert2";

// --- DEFAULT SCHEMAS ---
const DEFAULT_SECTIONS = [
  { 
    id: "hero", 
    type: "hero",
    label: "Hero_Section", 
    visible: true, 
    theme: "dark",
    content: {
      title: "CRAFTING THE FUTURE.",
      subtitle: "The ultimate destination for premium digital artifacts and physical collectibles.",
      cta_text: "EXPLORE COLLECTION",
      cta_link: "/shop",
      media_url: "https://v1.coveredby.id/chckt/hero-v1.mp4"
    }
  },
  { 
    id: "preorder", 
    type: "preorder",
    label: "Pre_Order_System", 
    visible: true, 
    theme: "light",
    content: {
      badge: "PRE-ORDER",
      headline: "CRITICAL BATCH.",
      description: "Architected specifically for its owner.",
      sizes: "S, M, L, XL, XXL",
      details: "Premium tactical fabric, water-resistant finish, modular pockets.",
      estimation: "14 Days",
      price: 0,
      countdown_target: new Date(Date.now() + 7 * 86400000).toISOString(),
      cta: "AMANKAN SLOT",
      product_id: "",
      carousel_images: []
    }
  },
  { 
    id: "featured_products", 
    type: "featured_products",
    label: "Featured_Artifacts", 
    visible: true, 
    theme: "dark",
    content: {
      title: "Featured_Artifacts",
      subtitle: "Curated selections from our latest drop.",
      product_ids: []
    }
  },
  { 
    id: "categories", 
    type: "categories",
    label: "Category_Grid", 
    visible: true, 
    theme: "light", 
    content: {
      items: [
        { title: "Apparel", slug: "apparel", image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=800" },
        { title: "Accessories", slug: "accessories", image: "https://images.unsplash.com/photo-1553531384-cc64ac80f931?q=80&w=800" }
      ]
    }
  },
  { 
    id: "lookbook", 
    type: "lookbook",
    label: "Lookbook_Archive", 
    visible: true, 
    theme: "dark",
    content: {
      title: "Lookbook Archive",
      badge: "VISUAL MANIFESTO",
      subtitle: "Every shadow tells a story of rebellion and refined silence. Architected for those who walk the void.",
      cta_text: "WATCH FILM",
      video_url: "",
      images: []
    }
  },
];

export default function LandingCMS() {
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data: landingData } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "landing_content")
        .single();
      
      if (landingData?.value?.sections) {
        // Merge with defaults to ensure all fields exist
        const merged = landingData.value.sections.map((s: any) => ({
          ...DEFAULT_SECTIONS.find(ds => ds.id === s.id || ds.type === s.type),
          ...s
        }));
        setSections(merged);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateSiteSettingsAction({
      landing_content: { sections }
    });
    setSaving(false);

    if (result.success) {
      Swal.fire({
        title: "SYSTEM_SYNCED",
        text: "Landing configuration synchronized.",
        icon: "success",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        background: "#000",
        color: "#fff",
      });
    } else {
      Swal.fire("Error", result.error, "error");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center font-mono">
      <div className="text-zinc-500 animate-pulse text-[10px] tracking-[0.5em] uppercase">Syncing_Vault...</div>
    </div>
  );

  const activeSection = sections.find(s => s.id === editingSectionId);

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black pt-32 pb-20 px-6 md:px-12 font-mono text-zinc-900 dark:text-white transition-colors duration-500">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-12">
          <div>
            <h1 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 mb-2">Editor_v4.5_ULTIMATE</h1>
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter">
              Landing <br /> <span className="text-zinc-300 dark:text-zinc-800">Architect.</span>
            </h2>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
             <a 
               href="/" 
               target="_blank"
               className="px-8 py-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-zinc-100 transition-all flex items-center justify-center gap-2"
             >
               <FiEye /> View_Live
             </a>
             <button 
               onClick={handleSave}
               disabled={saving}
               className="flex-1 md:flex-none px-12 py-5 bg-emerald-500 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-2xl shadow-emerald-500/20"
             >
               {saving ? <FiLoader className="animate-spin" /> : <FiSave />} 
               {saving ? "Saving..." : "Sync_Live"}
             </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {!editingSectionId ? (
            <motion.div 
              key="layout" 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">
                  <FiLayout /> Sequence_Manifest
                </div>
                <button 
                  onClick={() => {/* Impl. Add Section if needed */}}
                  className="px-6 py-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full text-[8px] font-black uppercase tracking-widest hover:bg-blue-500/20 transition-all"
                >
                  <FiPlus /> New_Section
                </button>
              </div>
              <LayoutList sections={sections} setSections={setSections} onEdit={setEditingSectionId} />
            </motion.div>
          ) : (
            <motion.div 
              key="editor" 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <button 
                onClick={() => setEditingSectionId(null)}
                className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors group"
              >
                <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Back_to_Manifest</span>
              </button>
              
              <div className="p-8 md:p-12 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-[3rem] space-y-10">
                <header className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-2xl">
                    {activeSection?.type === 'hero' && <FiZap />}
                    {activeSection?.type === 'preorder' && <FiClock />}
                    {activeSection?.type === 'featured_products' && <FiGrid />}
                    {activeSection?.type === 'categories' && <FiLayout />}
                    {activeSection?.type === 'lookbook' && <FiCamera />}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase italic italic tracking-tight">{activeSection?.label}</h3>
                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Editing_Section_Context</p>
                  </div>
                </header>
                
                <ContentRouter section={activeSection} setSections={setSections} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-8 bg-zinc-100 dark:bg-zinc-900/30 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 flex items-start gap-6">
          <FiZap className="text-amber-500 text-3xl shrink-0 animate-pulse" />
          <div className="space-y-1">
            <p className="text-xs font-black uppercase tracking-widest">Unified_Sync_Engine</p>
            <p className="text-[10px] text-zinc-500 leading-relaxed uppercase font-medium">
              Eksperimen dengan konten multimedia dan struktur landing page. Semua perubahan disimpan dalam manifest tunggal untuk performa maksimal.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function LayoutList({ sections, setSections, onEdit }: any) {
  const toggleVisibility = (id: string) => {
    setSections((prev: any) => prev.map((s: any) => s.id === id ? { ...s, visible: !s.visible } : s));
  };
  const updateTheme = (id: string, theme: string) => {
    setSections((prev: any) => prev.map((s: any) => s.id === id ? { ...s, theme } : s));
  };
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    setSections(newSections);
  };
  const deleteSection = (id: string) => {
    Swal.fire({
      title: "ERASE_SECTION?",
      text: "Data konten akan hilang secara permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444"
    }).then(r => { if(r.isConfirmed) setSections((prev:any) => prev.filter((s:any) => s.id !== id)); });
  };

  return (
    <div className="space-y-3">
      {sections.map((section: any, index: number) => (
        <motion.div
           key={section.id}
           layout
           className={`flex items-center gap-4 p-6 rounded-[2.5rem] border transition-all duration-300 ${section.visible ? "bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800" : "bg-zinc-100 dark:bg-zinc-900/10 border-dashed border-zinc-300 dark:border-zinc-800 opacity-50 grayscale"}`}
        >
          <div className="flex flex-col gap-1">
            <button onClick={() => moveSection(index, 'up')} className="p-1 hover:text-emerald-500 disabled:opacity-0" disabled={index === 0}><FiMove /></button>
            <button onClick={() => moveSection(index, 'down')} className="p-1 hover:text-emerald-500 disabled:opacity-0" disabled={index === sections.length - 1}><FiMove className="rotate-180" /></button>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-black uppercase tracking-tight italic truncate">{section.label}</h3>
            <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Type: {section.type}</p>
          </div>
          <div className="hidden md:flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 shrink-0">
             {["dark", "light", "auto"].map(t => (
               <button key={t} onClick={() => updateTheme(section.id, t)} className={`px-2.5 py-1.5 rounded-lg text-[7px] font-black uppercase tracking-widest ${section.theme === t ? "bg-white dark:bg-zinc-700 shadow-sm text-emerald-500" : "text-zinc-500"}`}>{t}</button>
             ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onEdit(section.id)} className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-500/10 hover:text-emerald-500 transition-all">
              <FiEdit />
            </button>
            <button onClick={() => toggleVisibility(section.id)} className={`p-4 rounded-2xl border transition-all ${section.visible ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-200 text-zinc-500"}`}>
               {section.visible ? <FiEye /> : <FiEyeOff />}
            </button>
            <button onClick={() => deleteSection(section.id)} className="p-4 rounded-2xl bg-red-500/5 text-red-500 hover:bg-red-500 transition-all hover:text-white border border-red-500/10">
              <FiTrash2 />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// --- CONTENT ROUTER ---
function ContentRouter({ section, setSections }: any) {
  const updateContent = (newContent: any) => {
    setSections((prev: any) => prev.map((s: any) => s.id === section.id ? { ...s, content: newContent } : s));
  };

  switch (section.type) {
    case "hero": return <HeroEditor content={section.content} onUpdate={updateContent} />;
    case "preorder": return <PreOrderEditor content={section.content} onUpdate={updateContent} />;
    case "featured_products": return <ProductsEditor content={section.content} onUpdate={updateContent} />;
    case "categories": return <CategoriesEditor content={section.content} onUpdate={updateContent} />;
    case "lookbook": return <LookbookEditor content={section.content} onUpdate={updateContent} />;
    default: return <div className="p-10 text-center font-black uppercase text-zinc-300">Editor_Generic_Fallback</div>;
  }
}

// --- SPECIFIC EDITORS ---

function HeroEditor({ content, onUpdate }: any) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const update = (key: string, val: any) => onUpdate({ ...content, [key]: val });

  const mediaList = content.media_list || (content.media_url ? [{ url: content.media_url }] : []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    setUploading(true);
    const nextMedia = [...mediaList];

    for (const file of files) {
      if (nextMedia.length >= 6) break;
      const fileName = `hero-${Math.random()}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from("products").upload(`hero/${fileName}`, file);
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from("products").getPublicUrl(`hero/${fileName}`);
        nextMedia.push({ url: publicUrl });
      }
    }

    onUpdate({ ...content, media_list: nextMedia, media_url: nextMedia[0]?.url || "" });
    setUploading(false);
  };

  const removeMedia = (index: number) => {
    const next = mediaList.filter((_: any, i: number) => i !== index);
    onUpdate({ ...content, media_list: next, media_url: next[0]?.url || "" });
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="label-style flex items-center gap-2"><FiType /> Title_Large</label>
          <input className="input-style font-black italic uppercase text-xl" value={content.title} onChange={e => update("title", e.target.value)} />
        </div>
        <div className="space-y-4">
          <label className="label-style flex items-center gap-2"><FiEdit /> Subtitle_Manifest</label>
          <textarea className="input-style h-24 resize-none pt-4" value={content.subtitle} onChange={e => update("subtitle", e.target.value)} />
        </div>
        <div className="space-y-4">
          <label className="label-style">CTA_Label</label>
          <input className="input-style" value={content.cta_text} onChange={e => update("cta_text", e.target.value)} />
        </div>
        <div className="space-y-4">
          <label className="label-style">CTA_Link</label>
          <input className="input-style" value={content.cta_link} onChange={e => update("cta_link", e.target.value)} />
        </div>

        <div className="md:col-span-2 space-y-6 p-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800">
          <div className="flex justify-between items-center mb-4">
            <div className="space-y-1">
               <label className="label-style flex items-center gap-2 m-0"><FiImage /> Hero_Media_Archive ({mediaList.length}/6)</label>
               <p className="text-[7px] text-zinc-400 uppercase tracking-widest">Supports image & video carousel</p>
            </div>
            <button 
              disabled={mediaList.length >= 6 || uploading}
              onClick={() => fileInputRef.current?.click()} 
              className="px-6 py-3 bg-white dark:bg-zinc-800 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm disabled:opacity-30 transition-all"
            >
              {uploading ? <FiLoader className="animate-spin" /> : <FiUploadCloud />} Append_Visual
            </button>
            <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleUpload} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {mediaList.map((item: any, i: number) => {
               const isVid = item.url?.includes(".mp4") || item.url?.includes("video");
               return (
                  <div key={i} className="group relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/5 shadow-2xl">
                    {isVid ? (
                      <video src={item.url} className="w-full h-full object-cover opacity-60" muted />
                    ) : (
                      <img src={item.url} className="w-full h-full object-cover opacity-60" alt="" />
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                       <button onClick={() => removeMedia(i)} className="p-3 bg-red-500 rounded-full text-white hover:scale-110 transition"><FiTrash2 size={14}/></button>
                    </div>
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-white/10 backdrop-blur-md rounded text-[6px] font-black italic">RANK_#{i+1}</div>
                  </div>
               );
            })}
            {mediaList.length === 0 && (
              <div className="col-span-full h-32 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 text-[10px] font-black uppercase">
                Empty_Archive
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PreOrderEditor({ content, onUpdate }: any) {
  // Existing logic for PreOrder Editor (Restored and Integrated)
  const [uploading, setUploading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from("products").select("id, name").then(({data}) => data && setProducts(data));
  }, []);

  const update = (key: string, val: any) => onUpdate({ ...content, [key]: val });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    const newUrls = [...(content.carousel_images || [])];
    for (const file of Array.from(files)) {
      const fileName = `po-${Math.random()}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from("products").upload(`preorder/${fileName}`, file);
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from("products").getPublicUrl(`preorder/${fileName}`);
        newUrls.push(publicUrl);
      }
    }
    update("carousel_images", newUrls);
    setUploading(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
      <div className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-3xl space-y-4">
          <label className="label-style text-blue-500 flex items-center gap-2 italic"><FiZap /> Linked_Product</label>
          <select className="input-style bg-white dark:bg-zinc-900 border-blue-500/20" value={content.product_id || ""} onChange={e => update("product_id", e.target.value)}>
            <option value="">SELECT_FROM_GALLERY</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {content.product_id && (
            <p className="text-[8px] font-mono text-zinc-400 mt-2 uppercase tracking-widest">Linked_UID: {content.product_id}</p>
          )}

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2"><label className="label-style">Badge</label><input className="input-style" value={content.badge || ""} onChange={e => update("badge", e.target.value)} /></div>
        <div className="space-y-2"><label className="label-style">CTA Button Text</label><input className="input-style" value={content.cta || ""} onChange={e => update("cta", e.target.value)} /></div>
        <div className="md:col-span-2 space-y-2"><label className="label-style">Headline</label><input className="input-style font-black italic uppercase" value={content.headline || ""} onChange={e => update("headline", e.target.value)} /></div>
        <div className="md:col-span-2 space-y-2"><label className="label-style text-fuchsia-500">Deskripsi Ringkas</label><textarea className="input-style h-20 resize-none pt-4" value={content.description || ""} onChange={e => update("description", e.target.value)} /></div>
        <div className="space-y-2"><label className="label-style text-fuchsia-500">Ukuran (Pisahkan dengan koma)</label><input className="input-style" value={content.sizes || ""} onChange={e => update("sizes", e.target.value)} placeholder="S, M, L, XL" /></div>
        <div className="space-y-2"><label className="label-style text-fuchsia-500">Estimasi Pengiriman (ETA)</label><input className="input-style" value={content.estimation || ""} onChange={e => update("estimation", e.target.value)} /></div>
        <div className="space-y-2"><label className="label-style text-emerald-500">Harga Khusus (Opsional)</label><input type="number" className="input-style font-mono" placeholder="Kosongkan untuk pakai harga asli" value={content.price || ""} onChange={e => update("price", e.target.value ? parseInt(e.target.value) : 0)} /></div>
        <div className="md:col-span-2 space-y-2"><label className="label-style text-fuchsia-500">Detail Produk / Spesifikasi</label><textarea className="input-style h-32 resize-none pt-4" value={content.details || ""} onChange={e => update("details", e.target.value)} /></div>
        <div className="md:col-span-2 space-y-2">
          <label className="label-style">Countdown Target (Waktu Berakhir)</label>
          <input 
            type="datetime-local" 
            className="input-style" 
            value={content.countdown_target?.slice(0, 16) || ""} 
            onChange={e => {
              if (!e.target.value) return;
              const date = new Date(e.target.value);
              if (!isNaN(date.getTime())) {
                update("countdown_target", date.toISOString());
              }
            }} 
          />
        </div>

      </div>

      <div className="space-y-6 pt-10 border-t border-zinc-100 dark:border-zinc-900">
        <div className="flex justify-between items-center">
          <label className="label-style flex items-center gap-2"><FiImage /> Carousel_Archives ({content.carousel_images?.length}/6)</label>
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="px-6 py-3 bg-zinc-100 dark:bg-zinc-900 rounded-2xl text-[8px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-500/10 hover:text-emerald-500 transition-all">
            {uploading ? <FiLoader className="animate-spin" /> : <FiUploadCloud />} Sync_Media
          </button>
          <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileUpload} />
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {content.carousel_images?.map((img:string, i:number) => (
            <div key={i} className="group relative aspect-[4/5] rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100">
              <img src={img} className="w-full h-full object-cover" alt="" />
              <button 
                onClick={() => update("carousel_images", content.carousel_images.filter((_:any,idx:number)=>idx!==i))}
                className="absolute inset-0 bg-red-600/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductsEditor({ content, onUpdate }: any) {
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("products").select("id, name, image_url").then(({data}) => data && setAvailableProducts(data));
  }, []);

  const toggleProduct = (id: string) => {
    const current = content.product_ids || [];
    const next = current.includes(id) ? current.filter((pid:string) => pid !== id) : [...current, id];
    onUpdate({ ...content, product_ids: next });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2"><label className="label-style">Section_Title</label><input className="input-style font-black italic uppercase" value={content.title} onChange={e => onUpdate({...content, title: e.target.value})} /></div>
        <div className="space-y-2"><label className="label-style">Section_Subtitle</label><input className="input-style" value={content.subtitle} onChange={e => onUpdate({...content, subtitle: e.target.value})} /></div>
      </div>
      <div className="space-y-4">
        <label className="label-style flex items-center gap-2"><FiGrid /> Artifact_Selection_Matrix</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {availableProducts.map(p => (
            <button 
              key={p.id} 
              onClick={() => toggleProduct(p.id)}
              className={`p-3 rounded-3xl border-2 transition-all text-left space-y-3 ${content.product_ids?.includes(p.id) ? "border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/10" : "border-zinc-100 dark:border-zinc-900 grayscale opacity-50 hover:grayscale-0 hover:opacity-100"}`}
            >
              <div className="aspect-square rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                <img src={p.image_url} className="w-full h-full object-cover" alt="" />
              </div>
              <p className="text-[8px] font-black uppercase italic leading-tight">{p.name}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoriesEditor({ content, onUpdate }: any) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const updateItem = (index: number, key: string, val: any) => {
    const nextItems = [...content.items];
    nextItems[index] = { ...nextItems[index], [key]: val };
    onUpdate({ ...content, items: nextItems });
  };

  const handleUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIndex(index);
    const fileName = `cat-${Math.random()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from("products").upload(`categories/${fileName}`, file);
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from("products").getPublicUrl(`categories/${fileName}`);
      updateItem(index, "image", publicUrl);
    }
    setUploadingIndex(null);
  };

  const addItem = () => onUpdate({ ...content, items: [...content.items, { title: "NEW_CAT", slug: "new", image: "" }] });
  const removeItem = (index: number) => onUpdate({ ...content, items: content.items.filter((_:any,i:number)=>i!==index) });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {content.items?.map((item:any, i:number) => {
          const fileRef = useRef<HTMLInputElement>(null);
          return (
            <div key={i} className="group p-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 space-y-6 relative overflow-hidden transition-all hover:bg-white dark:hover:bg-zinc-900 hover:shadow-2xl hover:shadow-black/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[9px] font-black text-zinc-400 tracking-widest italic">CATEGORY_#{i+1}</span>
                <button onClick={()=>removeItem(i)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors"><FiTrash2 /></button>
              </div>

              <div className="aspect-video relative rounded-2xl overflow-hidden bg-zinc-200 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 mb-4 group-hover:scale-[1.02] transition-transform">
                {item.image ? (
                  <img src={item.image} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400 font-black text-[10px]">NO_VISUAL_ASSET</div>
                )}
                <button 
                  onClick={() => fileRef.current?.click()}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2"
                >
                  {uploadingIndex === i ? <FiLoader className="animate-spin" /> : <FiUploadCloud size={24} />}
                  <span className="text-[8px] font-black uppercase">Replace_Visual</span>
                </button>
                <input type="file" ref={fileRef} className="hidden" onChange={(e) => handleUpload(i, e)} />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="label-style m-0">Label_Title</label>
                  <input className="input-style text-lg font-black italic uppercase bg-white dark:bg-zinc-950" value={item.title} onChange={e => updateItem(i, "title", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="label-style m-0">Path_Slug</label>
                      <input className="input-style text-[10px] font-mono bg-white dark:bg-zinc-950" value={item.slug} onChange={e => updateItem(i, "slug", e.target.value)} />
                   </div>
                   <div className="space-y-2">
                      <label className="label-style m-0">Direct_URL</label>
                      <input className="input-style text-[8px] font-mono bg-white dark:bg-zinc-950" value={item.image} onChange={e => updateItem(i, "image", e.target.value)} />
                   </div>
                </div>
              </div>
            </div>
          );
        })}
        <button onClick={addItem} className="min-h-[400px] border-4 border-dashed border-zinc-100 dark:border-zinc-900 rounded-[3rem] flex flex-col items-center justify-center text-zinc-300 hover:text-emerald-500 hover:border-emerald-500/20 transition-all group">
          <FiPlus size={48} className="group-hover:rotate-90 transition-transform duration-500" />
          <span className="text-sm font-black uppercase mt-4 tracking-[0.3em]">Append_Category_Entry</span>
        </button>
      </div>
    </div>
  );
}

function LookbookEditor({ content, onUpdate }: any) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if(!files) return;
    setUploading(true);
    const nextImages = [...(content.images || [])];
    for (const file of Array.from(files)) {
      const fileName = `lb-${Math.random()}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from("products").upload(`lookbook/${fileName}`, file);
      if(!error) {
        const { data: { publicUrl } } = supabase.storage.from("products").getPublicUrl(`lookbook/${fileName}`);
        nextImages.push({ url: publicUrl, caption: "" });
      }
    }
    onUpdate({ ...content, images: nextImages });
    setUploading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="label-style">Badge (Atas)</label>
          <input className="input-style uppercase" value={content.badge || ""} onChange={e => onUpdate({...content, badge: e.target.value})} placeholder="VISUAL MANIFESTO" />
        </div>
        <div className="space-y-2">
          <label className="label-style">Judul Utama</label>
          <input className="input-style font-black italic uppercase" value={content.title || ""} onChange={e => onUpdate({...content, title: e.target.value})} placeholder="LOOKBOOK ARCHIVE" />
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="label-style">Deskripsi / Subjudul</label>
          <textarea className="input-style h-24 resize-none pt-4" value={content.subtitle || ""} onChange={e => onUpdate({...content, subtitle: e.target.value})} placeholder="Every shadow tells a story..." />
        </div>
        <div className="space-y-2">
          <label className="label-style">Teks Tombol (CTA)</label>
          <input className="input-style uppercase" value={content.cta_text || ""} onChange={e => onUpdate({...content, cta_text: e.target.value})} placeholder="WATCH FILM" />
        </div>
        <div className="space-y-2">
          <label className="label-style">URL Video / Film</label>
          <input className="input-style font-mono text-[10px]" value={content.video_url || ""} onChange={e => onUpdate({...content, video_url: e.target.value})} placeholder="https://..." />
        </div>
      </div>

      <div className="pt-8 border-t border-zinc-100 dark:border-zinc-900 flex justify-between items-center">
        <div>
          <label className="label-style">Lookbook_Frames ({content.images?.length})</label>
          <p className="text-[7px] text-zinc-500 uppercase mt-1">Editorial-style visual grid matrix</p>
        </div>
        <button onClick={()=>fileInputRef.current?.click()} className="px-8 py-4 bg-emerald-500 text-white rounded-2xl text-[9px] font-black uppercase flex items-center gap-3">
          {uploading ? <FiLoader className="animate-spin" /> : <FiUploadCloud />} Sync_Archive
        </button>
        <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleUpload} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {content.images?.map((img:any, i:number) => (
          <div key={i} className="group relative aspect-square rounded-[2rem] overflow-hidden bg-zinc-100 border border-zinc-200 dark:border-zinc-800">
            <img src={img.url} className="w-full h-full object-cover" alt="" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
              <button onClick={() => onUpdate({...content, images: content.images.filter((_:any,idx:number)=>idx!==i)})} className="self-end text-white hover:text-red-500 transition-colors"><FiTrash2 /></button>
              <input 
                className="bg-zinc-900/80 border-b border-white/20 text-[8px] text-white p-2 font-bold focus:outline-none" 
                placeholder="Caption..." 
                value={img.caption} 
                onChange={e => {
                  const n = [...content.images];
                  n[i].caption = e.target.value;
                  onUpdate({...content, images: n});
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- UTILS & TYPOGRAPHY ---
const labelStyle = "block text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-2 italic";
const inputStyle = "w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 px-6 py-4 rounded-2xl text-xs font-bold text-zinc-900 dark:text-white outline-none focus:border-emerald-500 transition-all placeholder:text-zinc-300";

// SCSS-like styles for reuse in JSX (since I can't use real classes easily)
const style = `
  .input-style {
    width: 100%;
    background: #f9f9f9;
    border: 1px solid #eee;
    padding: 1rem 1.5rem;
    border-radius: 1.25rem;
    font-size: 0.75rem;
    font-weight: 700;
    outline: none;
    transition: all 0.3s;
  }
  .dark .input-style {
    background: #111;
    border-color: #222;
    color: white;
  }
  .input-style:focus {
    border-color: #10b981;
  }
  .label-style {
    display: block;
    font-size: 9px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.3em;
    color: #a1a1aa;
    margin-bottom: 0.5rem;
    font-style: italic;
  }
`;
