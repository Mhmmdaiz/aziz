"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiClock,
  FiShoppingBag,
  FiUsers,
  FiSettings,
  FiRefreshCw,
  FiCheckCircle,
  FiArrowRight,
  FiBox,
  FiZap,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import { 
  Plus, 
  Trash2, 
  LayoutDashboard, 
  Zap, 
  Target, 
  Upload, 
  Image as ImageIcon, 
  LayoutGrid, 
  Clock, 
  Users, 
  Activity,
  PlusCircle,
  Save,
  Check,
  X
} from "lucide-react";
import { useSettings } from "@/components/providers/SettingsProvider";
import Swal from "sweetalert2";

// --- TYPES & INTERFACES ---
interface SectionConfig {
  id: string;
  label: string;
  visible: boolean;
  theme?: "dark" | "light" | "auto";
}

interface LandingData {
  hero?: {
    badge?: string;
    headline?: string;
    subheadline?: string;
    cta_primary?: string;
    cta_secondary?: string;
    image_url?: string;
    image_urls?: string[];
  };
  lookbook?: {
    image_1?: string;
    image_2?: string;
  };
  preorder?: {
    badge?: string;
    headline?: string;
    description?: string;
    estimation?: string;
    urgency?: string;
    cta?: string;
    image_url?: string;
    product_id?: string;
    countdown_target?: string;
    featured_badge?: string;
    cta_secondary?: string;
    sizes?: string[];
    steps?: Array<{ title: string; desc: string }>;
  };
  value_props?: {
    title?: string;
    items?: Array<{ icon: string; title: string; desc: string }>;
  };
  categories?: Array<{ name: string; count: string; img: string }>;
  faqs?: Array<{ q: string; a: string }>;
  featured_products?: string[];
  sections?: SectionConfig[];
  appearance?: {
    colors?: {
      primary: string;
      secondary: string;
      accent: string;
    };
  };
}

// --- HELPER COMPONENTS ---
function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1.5">
      {children}
    </label>
  );
}

function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-fuchsia-500/60 transition-all ${className}`}
    />
  );
}

function Textarea({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-fuchsia-500/60 transition-all resize-none ${className}`}
    />
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-2xl p-6 shadow-sm">
      {children}
    </div>
  );
}

function UploadBox({ label, accept = "image/*", value, onChange }: { label: string; accept?: string; value?: string | null; onChange?: (file: File) => void; }) {
  const ref = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  useEffect(() => { if (value) setPreview(value); }, [value]);

  return (
    <div>
      <Label>{label}</Label>
      <div
        onClick={() => ref.current?.click()}
        className="relative group border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-fuchsia-500/50 transition-all duration-200 bg-zinc-50 dark:bg-zinc-950 overflow-hidden"
      >
        {preview ? (
          <img src={preview} alt="preview" className="w-full h-24 object-cover rounded-lg" />
        ) : (
          <>
            <Upload size={20} className="text-zinc-600 group-hover:text-fuchsia-500 transition-colors" />
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400 transition-colors">Click to upload</span>
          </>
        )}
        <input
          ref={ref}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              setPreview(URL.createObjectURL(f));
              if (onChange) onChange(f);
            }
          }}
        />
      </div>
    </div>
  );
}

function TagInput({ label, tags, onChange }: { label: string; tags: string[]; onChange: (tags: string[]) => void }) {
  const [inputValue, setInputValue] = useState("");

  const addTag = () => {
    const val = inputValue.trim();
    if (val && !tags.includes(val)) {
      onChange([...tags, val]);
      setInputValue("");
    }
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, idx) => (
          <div key={idx} className="flex items-center gap-2 bg-zinc-100 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-white/10 group transition-all hover:border-fuchsia-500/30">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 group-hover:text-fuchsia-500">{tag}</span>
            <button
              type="button"
              onClick={() => onChange(tags.filter((_, i) => i !== idx))}
              className="text-zinc-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={10} />
            </button>
          </div>
        ))}
        {tags.length === 0 && <span className="text-[9px] font-bold text-zinc-500 italic uppercase">No sizes defined</span>}
      </div>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="New value (e.g. XXL)"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          className="flex-1"
        />
        <button
          type="button"
          onClick={addTag}
          className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-zinc-500/10"
        >
          Add
        </button>
      </div>
    </div>
  );
}

function ProductSelector({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("products").select("id, name").order("name");
      setProducts(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-6 py-4 text-xs font-bold text-zinc-900 dark:text-white outline-none focus:border-fuchsia-500/50 transition-all shadow-sm appearance-none cursor-pointer"
    >
      <option value="">Select a Product</option>
      {loading ? (
        <option disabled>Loading products...</option>
      ) : (
        products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))
      )}
    </select>
  );
}

// --- UPLOAD HELPER ---
async function uploadGeneralImage(file: File, pathPrefix: string): Promise<string | null> {
  const ext = file.name.split('.').pop();
  const fileName = `landing/${pathPrefix}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("assets").upload(fileName, file);
  if (error) {
    Swal.fire("Upload Failed", error.message, "error");
    return null;
  }
  const { data: { publicUrl } } = supabase.storage.from("assets").getPublicUrl(fileName);
  return publicUrl;
}

// --- CMS COMPONENT ---
function LandingCMS({ data, onSave, preorderOnly = false }: { data?: LandingData; onSave?: (d: any) => void; preorderOnly?: boolean }) {
  const [allProducts, setAllProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      const { data: pData } = await supabase
        .from("products")
        .select("id, name, image_url, price")
        .eq("show_in_shop", true)
        .order("created_at", { ascending: false });
      setAllProducts(pData || []);
    };
    fetchAll();
  }, []);

  const defaultData: LandingData = {
    hero: {
      badge: "TERMINAL ACTIVATED // 2024",
      headline: "ENGINEERED\nSILHOUETTE.",
      subheadline: "Raw industrial textures fused with high-end structural integrity. A new protocol for the aesthetic fringe.",
      cta_primary: "SEARCH ARCHIVE",
      cta_secondary: "VIEW MANIFESTO",
      image_url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200",
      image_urls: ["https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200"]
    },
    lookbook: {
      image_1: "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800",
      image_2: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800",
    },
    value_props: {
        title: "Why be anything but elite?",
        items: [
          { icon: "FiZap", title: "Premium Material", desc: "Heavyweight 100% Cotton" },
          { icon: "FiHexagon", title: "Limited Drop", desc: "No restocks, ever." },
          { icon: "FiTarget", title: "Unique Design", desc: "Brutalist aesthetics." },
          { icon: "FiBox", title: "Eco Packaging", desc: "Sustainable unboxing." },
        ],
    },
    categories: [
      { name: "Oversize", count: "12 Artifacts", img: "https://images.unsplash.com/photo-1571945153237-4929e783ee4a?q=80&w=800" },
      { name: "Graphic", count: "08 Artifacts", img: "https://images.unsplash.com/photo-1554568218-0f1715e72254?q=80&w=800" },
      { name: "Minimal", count: "05 Artifacts", img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800" },
      { name: "Dark Series", count: "07 Artifacts", img: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800" }
    ],
    faqs: [
      { q: "How long is dispatch?", a: "Standard deployment takes 2-4 days." }
    ],
    featured_products: [],
    sections: [
      { id: "hero", label: "Hero Section", visible: true, theme: "auto" },
      { id: "featured_products", label: "Featured Products", visible: true, theme: "auto" },
      { id: "value_props", label: "Value Propositions", visible: true, theme: "auto" },
      { id: "categories", label: "Category Grid", visible: true, theme: "auto" },
      { id: "lookbook", label: "Lookbook Showcase", visible: true, theme: "auto" },
      { id: "preorder", label: "Pre-Order System", visible: true, theme: "auto" },
      { id: "faq", label: "FAQ Section", visible: true, theme: "auto" },
    ],
    preorder: {
      badge: "PROTOCOL V4: PRE-ORDER SYSTEM",
      headline: "CRITICAL BATCH: THE LOGIC",
      description: "We reject mass-production. Every piece is architected specifically for its owner.",
      estimation: "14 Days to Arrival",
      urgency: "Batch 04: 12 Slots Remaining",
      cta: "Amankan Slot Kamu",
      image_url: "https://images.unsplash.com/photo-1554568218-0f1715e72254?q=80&w=800",
      product_id: "",
      countdown_target: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      sizes: ["S", "M", "L", "XL"],
      steps: [
        { title: "01 SECURE", desc: "Place your order to secure your allocation." },
        { title: "02 ARCHITECT", desc: "Your artifact enters the production phase." },
        { title: "03 DEPLOYMENT", desc: "Your order is dispatched directly from our archive." }
      ]
    },
    appearance: {
      colors: {
        primary: "#f43f5e", // Rose 500
        secondary: "#a855f7", // Purple 500
        accent: "#fbbf24", // Amber 400
      }
    }
  };

  const [formData, setFormData] = useState<LandingData>(
    { 
      ...defaultData, 
      ...data, 
      hero: { 
        ...defaultData.hero, 
        ...data?.hero,
        image_urls: data?.hero?.image_urls?.length ? data.hero.image_urls : defaultData.hero?.image_urls || []
      }, 
      lookbook: { ...defaultData.lookbook, ...data?.lookbook }, 
      preorder: { ...defaultData.preorder, ...data?.preorder },
      categories: data?.categories?.length ? data.categories : defaultData.categories,
      featured_products: data?.featured_products || [],
      sections: data?.sections || defaultData.sections,
      appearance: data?.appearance || defaultData.appearance
    }
  );

  const handleChange = (key: string, value: any) => {
    const next = { ...formData, [key]: value };
    setFormData(next);
    if (onSave) onSave(next);
  };

  const toggleVisibility = (id: string) => {
    const next = formData.sections?.map(s => s.id === id ? { ...s, visible: !s.visible } : s);
    handleChange("sections", next);
  };

  const setSectionTheme = (id: string, theme: "dark" | "light" | "auto") => {
    const next = formData.sections?.map(s => s.id === id ? { ...s, theme } : s);
    handleChange("sections", next);
  };

  const moveSection = (id: string, dir: 'up' | 'down') => {
    const sections = [...(formData.sections || [])];
    const idx = sections.findIndex(s => s.id === id);
    if (idx === -1) return;
    const nextIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (nextIdx < 0 || nextIdx >= sections.length) return;
    [sections[idx], sections[nextIdx]] = [sections[nextIdx], sections[idx]];
    handleChange("sections", sections);
  };

  return (
    <div className="space-y-8">
      {!preorderOnly && (
        <>
          {/* THEME CONFIGURATION */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-to-br from-fuchsia-500 to-indigo-500 text-white shadow-lg shadow-fuchsia-500/20">
                <FiSettings size={14} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                  Theme Customization
                </h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase italic mt-0.5">Control the visual essence of your terminal.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Primary Brand</Label>
                  <div className="w-4 h-4 rounded-full border border-zinc-200 dark:border-zinc-800" style={{ backgroundColor: formData.appearance?.colors?.primary }} />
                </div>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.appearance?.colors?.primary || "#f43f5e"}
                    onChange={(e) => {
                      const next = { ...formData.appearance, colors: { ...formData.appearance?.colors, primary: e.target.value } };
                      handleChange("appearance", next as any);
                    }}
                    className="w-12 h-12 rounded-xl cursor-pointer bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1"
                  />
                  <Input 
                    value={formData.appearance?.colors?.primary || "#f43f5e"}
                    onChange={(e) => {
                      const next = { ...formData.appearance, colors: { ...formData.appearance?.colors, primary: e.target.value } };
                      handleChange("appearance", next as any);
                    }}
                    className="flex-1 font-mono uppercase"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Secondary Flow</Label>
                  <div className="w-4 h-4 rounded-full border border-zinc-200 dark:border-zinc-800" style={{ backgroundColor: formData.appearance?.colors?.secondary }} />
                </div>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.appearance?.colors?.secondary || "#a855f7"}
                    onChange={(e) => {
                      const next = { ...formData.appearance, colors: { ...formData.appearance?.colors, secondary: e.target.value } };
                      handleChange("appearance", next as any);
                    }}
                    className="w-12 h-12 rounded-xl cursor-pointer bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1"
                  />
                  <Input 
                    value={formData.appearance?.colors?.secondary || "#a855f7"}
                    onChange={(e) => {
                      const next = { ...formData.appearance, colors: { ...formData.appearance?.colors, secondary: e.target.value } };
                      handleChange("appearance", next as any);
                    }}
                    className="flex-1 font-mono uppercase"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Accent Glow</Label>
                  <div className="w-4 h-4 rounded-full border border-zinc-200 dark:border-zinc-800" style={{ backgroundColor: formData.appearance?.colors?.accent }} />
                </div>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.appearance?.colors?.accent || "#fbbf24"}
                    onChange={(e) => {
                      const next = { ...formData.appearance, colors: { ...formData.appearance?.colors, accent: e.target.value } };
                      handleChange("appearance", next as any);
                    }}
                    className="w-12 h-12 rounded-xl cursor-pointer bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1"
                  />
                  <Input 
                    value={formData.appearance?.colors?.accent || "#fbbf24"}
                    onChange={(e) => {
                      const next = { ...formData.appearance, colors: { ...formData.appearance?.colors, accent: e.target.value } };
                      handleChange("appearance", next as any);
                    }}
                    className="flex-1 font-mono uppercase"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900">
               <p className="text-[10px] font-bold text-zinc-500 leading-relaxed italic">
                 Note: Colors are injected as CSS variables throughout the application. Use curated HSL values for best results with dark mode filters.
               </p>
            </div>
          </Card>
          {/* LAYOUT MANAGER */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-zinc-900 text-white">
                <Activity size={14} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                Layout & Visibility Manager
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {formData.sections?.map((s, i) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/40">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-zinc-400">0{i+1}</span>
                    <span className="text-[10px] font-black uppercase tracking-wider">{s.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 focus-within:ring-0">
                    <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 mr-1">
                      {(['auto', 'dark', 'light'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setSectionTheme(s.id, t)}
                          className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase transition-all ${
                            (s.theme || 'auto') === t 
                              ? 'bg-white dark:bg-zinc-700 text-fuchsia-500 shadow-sm' 
                              : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    <button onClick={() => toggleVisibility(s.id)} className={`p-1.5 rounded-lg transition-colors ${s.visible ? 'text-fuchsia-500 bg-fuchsia-500/10' : 'text-zinc-400 bg-zinc-100 dark:bg-zinc-800'}`}>
                      {s.visible ? <FiCheckCircle size={12}/> : <X size={12}/>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* RENDERING SECTIONS BASED ON ORDER */}
      {formData.sections?.map((section) => {
          if (preorderOnly && section.id !== "preorder") return null;

          if (section.id === "hero") return (
              <Card key="hero">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white">
                      <LayoutDashboard size={14} />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                      Hero Section
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => moveSection(section.id, "up")} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500"><FiPlus className="rotate-45" size={14}/></button>
                    <button onClick={() => moveSection(section.id, "down")} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500"><FiPlus className="-rotate-[135deg]" size={14}/></button>
                    
                    <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 mx-2">
                      {(['auto', 'dark', 'light'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setSectionTheme(section.id, t)}
                          className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${
                            (section.theme || 'auto') === t 
                              ? 'bg-white dark:bg-zinc-700 text-fuchsia-500 shadow-md' 
                              : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    <button onClick={() => toggleVisibility(section.id)} className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${section.visible ? "bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20" : "bg-zinc-100 text-zinc-400 border-zinc-200"}`}>
                      {section.visible ? "VISIBLE" : "HIDDEN"}
                    </button>
                  </div>
                </div>

                <div className="mb-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Hero Background Carousel (Max 6)</Label>
                    <span className="text-[10px] font-black text-fuchsia-500 bg-fuchsia-500/10 px-2 py-0.5 rounded-full border border-fuchsia-500/20">
                      {formData.hero?.image_urls?.length || 0} / 6 SLOTS
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {formData.hero?.image_urls?.map((url, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/40">
                        <img src={url} alt={`Hero ${idx + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            onClick={() => {
                              const nextUrls = formData.hero?.image_urls?.filter((_, i) => i !== idx);
                              handleChange("hero", { ...formData.hero, image_urls: nextUrls });
                            }}
                            className="p-2 bg-red-500 text-white rounded-xl hover:scale-110 transition-transform"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/40 backdrop-blur-md rounded text-[8px] font-black text-white/70">
                          {idx + 1}
                        </div>
                      </div>
                    ))}
                    
                    {(formData.hero?.image_urls?.length || 0) < 6 && (
                      <div className="relative aspect-square">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await uploadGeneralImage(file, "hero");
                              if (url) {
                                const nextUrls = [...(formData.hero?.image_urls || []), url];
                                handleChange("hero", { ...formData.hero, image_urls: nextUrls });
                              }
                            }
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20 hover:bg-zinc-100 dark:hover:bg-zinc-900/40 transition-colors gap-2">
                           <PlusCircle size={20} className="text-zinc-400" />
                           <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Add Image</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label>Top Badge Indicator</Label>
                    <Input
                      value={formData.hero?.badge || ""}
                      onChange={(e) => handleChange("hero", { ...formData.hero, badge: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Main Headline</Label>
                    <Textarea
                      rows={2}
                      value={formData.hero?.headline || ""}
                      onChange={(e) => handleChange("hero", { ...formData.hero, headline: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Subheadline Text</Label>
                    <Textarea
                      rows={2}
                      value={formData.hero?.subheadline || ""}
                      onChange={(e) => handleChange("hero", { ...formData.hero, subheadline: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Primary CTA</Label>
                    <Input
                      value={formData.hero?.cta_primary || ""}
                      onChange={(e) => handleChange("hero", { ...formData.hero, cta_primary: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Secondary CTA</Label>
                    <Input
                      value={formData.hero?.cta_secondary || ""}
                      onChange={(e) => handleChange("hero", { ...formData.hero, cta_secondary: e.target.value })}
                    />
                  </div>
                </div>
              </Card>
          );

              if (section.id === "featured_products") return (
                  /* FEATURED PRODUCTS CONFIG */
                  <Card key="featured_products">
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white">
                          <LayoutGrid size={14} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                          Featured Products
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-[10px] font-black text-fuchsia-600 bg-fuchsia-50 dark:bg-fuchsia-950/30 px-3 py-1 rounded-full border border-fuchsia-100 dark:border-fuchsia-900/50 mr-2">
                          {formData.featured_products?.length || 0} SELECTED
                        </div>
                        <button onClick={() => moveSection("featured_products", "up")} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500"><FiPlus className="rotate-45" size={14}/></button>
                        <button onClick={() => moveSection("featured_products", "down")} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500"><FiPlus className="-rotate-[135deg]" size={14}/></button>
                        
                        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 mx-2">
                          {(['auto', 'dark', 'light'] as const).map((t) => (
                            <button
                              key={t}
                              onClick={() => setSectionTheme("featured_products", t)}
                              className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${
                                (section.theme || 'auto') === t 
                                  ? 'bg-white dark:bg-zinc-700 text-fuchsia-500 shadow-md' 
                                  : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>

                        <button onClick={() => toggleVisibility("featured_products")} className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${section.visible ? "bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20" : "bg-zinc-100 text-zinc-400 border-zinc-200"}`}>
                          {section.visible ? "VISIBLE" : "HIDDEN"}
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-[10px] text-zinc-500 font-bold uppercase italic">Select artifacts to display in "The New Season" vault.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {allProducts.map((p) => {
                        const isSelected = formData.featured_products?.includes(p.id);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              const current = formData.featured_products || [];
                              const next = isSelected
                                ? current.filter((id) => id !== p.id)
                                : [...current, p.id];
                              handleChange("featured_products", next);
                            }}
                            className={`relative aspect-[4/5] rounded-2xl overflow-hidden border-2 transition-all duration-300 group ${
                              isSelected
                                ? "border-fuchsia-500 scale-[0.98] shadow-lg shadow-fuchsia-500/10"
                                : "border-zinc-100 dark:border-zinc-900 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 hover:border-zinc-300 dark:hover:border-zinc-800"
                            }`}
                          >
                            <img
                              src={p.image_url}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-left">
                              <p className="text-[8px] font-black uppercase text-white truncate leading-tight">
                                {p.name}
                              </p>
                              <p className="text-[7px] font-mono text-zinc-400 mt-0.5">
                                {Number(p.price).toLocaleString()}
                              </p>
                            </div>
                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-fuchsia-500 text-white p-1.5 rounded-full shadow-lg">
                                <Check size={10} strokeWidth={4} />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </Card>
              );

              if (section.id === "value_props") return (
                  /* VALUE PROPS */
                  <Card key="value_props">
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white">
                          <Target size={14} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                          Value Propositions
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => moveSection("value_props", "up")} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500"><FiPlus className="rotate-45" size={14}/></button>
                        <button onClick={() => moveSection("value_props", "down")} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500"><FiPlus className="-rotate-[135deg]" size={14}/></button>
                        
                        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 mx-2">
                          {(['auto', 'dark', 'light'] as const).map((t) => (
                            <button
                              key={t}
                              onClick={() => setSectionTheme("value_props", t)}
                              className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${
                                (section.theme || 'auto') === t 
                                  ? 'bg-white dark:bg-zinc-700 text-fuchsia-500 shadow-md' 
                                  : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>

                        <button onClick={() => toggleVisibility("value_props")} className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${section.visible ? "bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20" : "bg-zinc-100 text-zinc-400 border-zinc-200"}`}>
                          {section.visible ? "VISIBLE" : "HIDDEN"}
                        </button>
                      </div>
                    </div>
            <div className="mb-4">
              <Label>Title Section</Label>
              <Input
                value={formData.value_props?.title || ""}
                onChange={(e) => handleChange("value_props", { ...formData.value_props, title: e.target.value })}
              />
            </div>

            <div className="space-y-3">
              {formData.value_props?.items?.map((vp: any, idx: number) => (
                <div key={idx} className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/40">
                  <span className="text-[9px] font-black uppercase text-zinc-500 block mb-2">Item 0{idx + 1}</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={vp.title}
                        onChange={(e) => {
                          const newItems = [...(formData.value_props?.items || [])];
                          newItems[idx] = { ...newItems[idx], title: e.target.value };
                          handleChange("value_props", { ...formData.value_props, items: newItems });
                        }}
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={vp.desc}
                        onChange={(e) => {
                          const newItems = [...(formData.value_props?.items || [])];
                          newItems[idx] = { ...newItems[idx], desc: e.target.value };
                          handleChange("value_props", { ...formData.value_props, items: newItems });
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
              );

              if (section.id === "categories") return (
                  /* CATEGORY GRID CONFIG */
                  <Card key="categories">
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white">
                          <LayoutGrid size={14} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                          Category Grid
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const newCats = [...(formData.categories || []), { name: "", count: "", img: "" }];
                            handleChange("categories", newCats);
                          }}
                          className="flex w-fit items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all"
                        >
                          <PlusCircle size={11} /> Add Category
                        </button>
                        <button onClick={() => moveSection("categories", "up")} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500"><FiPlus className="rotate-45" size={14}/></button>
                        <button onClick={() => moveSection("categories", "down")} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500"><FiPlus className="-rotate-[135deg]" size={14}/></button>
                        
                        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 mx-2">
                          {(['auto', 'dark', 'light'] as const).map((t) => (
                            <button
                              key={t}
                              onClick={() => setSectionTheme("categories", t)}
                              className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${
                                (section.theme || 'auto') === t 
                                  ? 'bg-white dark:bg-zinc-700 text-fuchsia-500 shadow-md' 
                                  : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>

                        <button onClick={() => toggleVisibility("categories")} className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${section.visible ? "bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20" : "bg-zinc-100 text-zinc-400 border-zinc-200"}`}>
                          {section.visible ? "VISIBLE" : "HIDDEN"}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {formData.categories?.map((cat: any, i: number) => (
                        <div key={i} className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 relative">
                          <button
                            type="button"
                            onClick={() => {
                              const newCats = formData.categories?.filter((_, idx) => idx !== i);
                              handleChange("categories", newCats);
                            }}
                            className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 z-10"
                          >
                            <Trash2 size={14} />
                          </button>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1">
                              <UploadBox
                                label={`Category ${i + 1} Image`}
                                value={cat.img}
                                onChange={async (f) => {
                                  const url = await uploadGeneralImage(f, `category_${i}`);
                                  if (url) {
                                    const newCats = [...(formData.categories || [])];
                                    newCats[i].img = url;
                                    handleChange("categories", newCats);
                                  }
                                }}
                              />
                            </div>
                            <div className="md:col-span-2 space-y-3">
                              <div>
                                <Label>Category Title</Label>
                                <Input
                                  value={cat.name}
                                  onChange={(e) => {
                                    const newCats = [...(formData.categories || [])];
                                    newCats[i] = { ...newCats[i], name: e.target.value };
                                    handleChange("categories", newCats);
                                  }}
                                />
                              </div>
                              <div>
                                <Label>Subtext / Count</Label>
                                <Input
                                  value={cat.count}
                                  onChange={(e) => {
                                    const newCats = [...(formData.categories || [])];
                                    newCats[i] = { ...newCats[i], count: e.target.value };
                                    handleChange("categories", newCats);
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
              );

              if (section.id === "lookbook") return (
                  /* LOOKBOOK CONFIG */
                  <Card key="lookbook">
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white">
                          <ImageIcon size={14} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                          Lookbook Images
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => moveSection("lookbook", "up")} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500"><FiPlus className="rotate-45" size={14}/></button>
                        <button onClick={() => moveSection("lookbook", "down")} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500"><FiPlus className="-rotate-[135deg]" size={14}/></button>
                        
                        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 mx-2">
                          {(['auto', 'dark', 'light'] as const).map((t) => (
                            <button
                              key={t}
                              onClick={() => setSectionTheme("lookbook", t)}
                              className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${
                                (section.theme || 'auto') === t 
                                  ? 'bg-white dark:bg-zinc-700 text-fuchsia-500 shadow-md' 
                                  : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>

                        <button onClick={() => toggleVisibility("lookbook")} className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${section.visible ? "bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20" : "bg-zinc-100 text-zinc-400 border-zinc-200"}`}>
                          {section.visible ? "VISIBLE" : "HIDDEN"}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <UploadBox
                        label="Lookbook Image 1 (Left/Main)"
                        value={formData.lookbook?.image_1}
                        onChange={async (f) => {
                          const url = await uploadGeneralImage(f, "lookbook1");
                          if (url) handleChange("lookbook", { ...formData.lookbook, image_1: url });
                        }}
                      />
                      <UploadBox
                        label="Lookbook Image 2 (Right/Side)"
                        value={formData.lookbook?.image_2}
                        onChange={async (f) => {
                          const url = await uploadGeneralImage(f, "lookbook2");
                          if (url) handleChange("lookbook", { ...formData.lookbook, image_2: url });
                        }}
                      />
                    </div>
                  </Card>
              );

              if (section.id === "preorder") return (
                  /* PRE-ORDER CONFIG */
                  <Card key="preorder">
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white">
                          <Clock size={14} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                          Pre-Order System
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => moveSection("preorder", "up")} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500"><FiPlus className="rotate-45" size={14}/></button>
                        <button onClick={() => moveSection("preorder", "down")} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500"><FiPlus className="-rotate-[135deg]" size={14}/></button>
                        
                        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 mx-2">
                          {(['auto', 'dark', 'light'] as const).map((t) => (
                            <button
                              key={t}
                              onClick={() => setSectionTheme("preorder", t)}
                              className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${
                                (section.theme || 'auto') === t 
                                  ? 'bg-white dark:bg-zinc-700 text-fuchsia-500 shadow-md' 
                                  : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>

                        <button onClick={() => toggleVisibility("preorder")} className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${section.visible ? "bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20" : "bg-zinc-100 text-zinc-400 border-zinc-200"}`}>
                          {section.visible ? "VISIBLE" : "HIDDEN"}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      <div>
                        <Label>Top Badge</Label>
                        <Input
                          value={formData.preorder?.badge || ""}
                          onChange={(e) => handleChange("preorder", { ...formData.preorder, badge: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Headline</Label>
                        <Input
                          value={formData.preorder?.headline || ""}
                          onChange={(e) => handleChange("preorder", { ...formData.preorder, headline: e.target.value })}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Main Description</Label>
                        <Textarea
                          rows={2}
                          value={formData.preorder?.description || ""}
                          onChange={(e) => handleChange("preorder", { ...formData.preorder, description: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Estimation Text</Label>
                        <Input
                          value={formData.preorder?.estimation || ""}
                          onChange={(e) => handleChange("preorder", { ...formData.preorder, estimation: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Urgency / Batch Info</Label>
                        <Input
                          value={formData.preorder?.urgency || ""}
                          onChange={(e) => handleChange("preorder", { ...formData.preorder, urgency: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>CTA Label</Label>
                        <Input
                          value={formData.preorder?.cta || ""}
                          onChange={(e) => handleChange("preorder", { ...formData.preorder, cta: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Target Product (Campaign Focus)</Label>
                        <ProductSelector
                          value={formData.preorder?.product_id || ""}
                          onChange={(id) => handleChange("preorder", { ...formData.preorder, product_id: id })}
                        />
                      </div>
                      <div>
                        <Label>Countdown Target</Label>
                        <Input
                          type="datetime-local"
                          value={(() => {
                            if (!formData.preorder?.countdown_target) return "";
                            const d = new Date(formData.preorder.countdown_target);
                            if (isNaN(d.getTime())) return "";
                            // Adjust for local timezone to show correct time in datetime-local input
                            const localDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
                            return localDate.toISOString().slice(0, 16);
                          })()}
                          onChange={(e) => {
                            if (!e.target.value) {
                              handleChange("preorder", { ...formData.preorder, countdown_target: undefined });
                              return;
                            }
                            const date = new Date(e.target.value);
                            if (!isNaN(date.getTime())) {
                              handleChange("preorder", { ...formData.preorder, countdown_target: date.toISOString() });
                            }
                          }}
                        />
                      </div>
                      <div>
                        <Label>Featured Overlay Badge</Label>
                        <Input
                          value={formData.preorder?.featured_badge || ""}
                          onChange={(e) => handleChange("preorder", { ...formData.preorder, featured_badge: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Secondary CTA (Hover)</Label>
                        <Input
                          value={formData.preorder?.cta_secondary || ""}
                          onChange={(e) => handleChange("preorder", { ...formData.preorder, cta_secondary: e.target.value })}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <TagInput
                          label="Available Sizes"
                          tags={formData.preorder?.sizes || []}
                          onChange={(sizes) => handleChange("preorder", { ...formData.preorder, sizes })}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <UploadBox
                          label="Featured Product Image (PO)"
                          value={formData.preorder?.image_url}
                          onChange={async (f) => {
                            const url = await uploadGeneralImage(f, "preorder_product");
                            if (url) handleChange("preorder", { ...formData.preorder, image_url: url });
                          }}
                        />
                      </div>
                    </div>
                  </Card>
              );

              if (section.id === "faq") return (
                  /* FAQ CONFIG */
                  <Card key="faq">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white">
                          <Zap size={14} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                          FAQ Section
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const newFaqs = [...(formData.faqs || []), { q: "", a: "" }];
                            handleChange("faqs", newFaqs);
                          }}
                          className="flex w-fit items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all"
                        >
                          <PlusCircle size={11} /> Add FAQ
                        </button>
                        <button onClick={() => moveSection("faq", "up")} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500"><FiPlus className="rotate-45" size={14}/></button>
                        <button onClick={() => moveSection("faq", "down")} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500"><FiPlus className="-rotate-[135deg]" size={14}/></button>
                        
                        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 mx-2">
                          {(['auto', 'dark', 'light'] as const).map((t) => (
                            <button
                              key={t}
                              onClick={() => setSectionTheme("faq", t)}
                              className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${
                                (section.theme || 'auto') === t 
                                  ? 'bg-white dark:bg-zinc-700 text-fuchsia-500 shadow-md' 
                                  : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>

                        <button onClick={() => toggleVisibility("faq")} className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${section.visible ? "bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20" : "bg-zinc-100 text-zinc-400 border-zinc-200"}`}>
                          {section.visible ? "VISIBLE" : "HIDDEN"}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {formData.faqs?.map((faq: any, i: number) => (
                        <div key={i} className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 relative">
                          <button
                            type="button"
                            onClick={() => {
                              const newFaqs = formData.faqs?.filter((_, idx) => idx !== i);
                              handleChange("faqs", newFaqs);
                            }}
                            className="absolute top-4 right-4 text-zinc-400 hover:text-red-500"
                          >
                            <Trash2 size={14} />
                          </button>
                          <div className="grid grid-cols-1 gap-3 w-[90%]">
                            <div>
                              <Label>Question</Label>
                              <Input
                                value={faq.q}
                                onChange={(e) => {
                                  const newFaqs = [...(formData.faqs || [])];
                                  newFaqs[i] = { ...newFaqs[i], q: e.target.value };
                                  handleChange("faqs", newFaqs);
                                }}
                              />
                            </div>
                            <div>
                              <Label>Answer</Label>
                              <Textarea
                                rows={2}
                                value={faq.a}
                                onChange={(e) => {
                                  const newFaqs = [...(formData.faqs || [])];
                                  newFaqs[i] = { ...newFaqs[i], a: e.target.value };
                                  handleChange("faqs", newFaqs);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
              );

              return null;
          })}
    </div>
  );
}

// --- MAIN PAGE ---
export default function AdminPreorder() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"landing" | "orders" | "product">("landing");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [landingData, setLandingData] = useState<LandingData | null>(null);
  const [product, setProduct] = useState<any>(null);
  const [productLoading, setProductLoading] = useState(false);

  // Auth Check
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (profile?.role !== "admin") { router.push("/"); return; }
      setAuthLoading(false);
    };
    checkAdmin();
  }, [router]);

  // Combined Data Fetching
  const fetchData = useCallback(async () => {
    if (authLoading) return;
    setLoading(true);

    // Fetch site settings (landing_content & preorder)
    const { data: settings } = await supabase.from("site_settings").select("*").in("key", ["landing_content", "preorder"]);
    
    const settingsMap = settings?.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {}) || {};

    const fullLanding = {
        ...(settingsMap.landing_content || {}),
        preorder: settingsMap.preorder || {}
    };
    
    setLandingData(fullLanding);

    // Fetch orders
    const { data: pOrders } = await supabase.from("orders").select("*, items:order_items(*)").eq("is_preorder", true).order("created_at", { ascending: false });
    setOrders(pOrders || []);

    // Fetch current PO product if product_id exists
    if (fullLanding.preorder?.product_id) {
        fetchProduct(fullLanding.preorder.product_id, fullLanding.preorder);
    }

    setLoading(false);
  }, [authLoading]);

  const fetchProduct = async (id: string, campaignData: any) => {
    setProductLoading(true);
    const { data: p } = await supabase.from("products").select("*").eq("id", id).single();
    if (p) {
      setProduct({
        ...p,
        featured_badge: campaignData.featured_badge || "",
        cta_secondary: campaignData.cta_secondary || "",
        show_in_shop: p.show_in_shop ?? true,
      });
    }
    setProductLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setProductLoading(true);

    try {
        // 1. Update Product Table
        const { error: pError } = await supabase.from("products").update({
            name: product.name,
            price: product.price,
            stock: product.stock,
            description: product.description,
            image_url: product.image_url,
            image_urls: product.image_urls || [product.image_url],
            show_in_shop: product.show_in_shop,
            sizes: product.sizes || [],
        }).eq("id", product.id);

        // 2. Update Site Settings (Overlay Texts & Image sync)
        const newPreorder = {
            ...landingData?.preorder,
            featured_badge: product.featured_badge,
            cta_secondary: product.cta_secondary,
            image_url: product.image_url,
        };
        const { error: sError } = await supabase.from("site_settings").update({ value: newPreorder }).eq("key", "preorder");

        if (pError || sError) throw pError || sError;
        
        Swal.fire("Success", "Product & Visuals synchronized", "success");
        fetchData();
    } catch (err: any) {
        Swal.fire("Error", err.message, "error");
    } finally {
        setProductLoading(false);
    }
  };

  const uploadProductImage = async (file: File) => {
    const ext = file.name.split(".").pop();
    const fileName = `preorder/prod-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("assets").upload(fileName, file);
    if (error) { Swal.fire("Upload Failed", error.message, "error"); return null; }
    const { data: { publicUrl } } = supabase.storage.from("assets").getPublicUrl(fileName);
    return publicUrl;
  };

  const handleSaveLanding = async (newData: LandingData) => {
    try {
        // Update local parent state immediately for tab switching sync
        setLandingData(newData);

        // Split data into landing_content, preorder, and appearance
        const { preorder, appearance, ...rest } = newData;
        
        const updates = [
            { key: "landing_content", value: rest },
            { key: "preorder", value: preorder },
            { key: "appearance", value: appearance }
        ];

        const { error } = await supabase.from("site_settings").upsert(updates, { onConflict: "key" });
        if (error) throw error;

        Swal.fire({
            title: "SYSTEM SYNCED",
            text: "Landing Configuration Updated",
            icon: "success",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
        });
        
        // No need to fetchData again as local state is already updated (if managed by LandingCMS)
        // actually LandingCMS manages local formData. 
    } catch (err: any) {
        Swal.fire("Sync Error", err.message, "error");
    }
  };

  if (authLoading) return null;

  return (
    <main className="min-h-screen bg-[#FBFBFD] dark:bg-black pt-24 pb-20 px-4 md:px-8 font-mono text-zinc-900 dark:text-white">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic">
              Terminal<span className="text-fuchsia-500">_CMS</span>
            </h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-2 px-1">Unified Control Interface</p>
          </div>

          <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            {[
                { id: "landing", label: "Landing Page", icon: <LayoutGrid size={12}/> },
                { id: "product", label: "New Product", icon: <Plus size={12}/> },
                { id: "orders", label: "Live Orders", icon: <Clock size={12}/> }
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
                >
                    {tab.icon} {tab.label}
                </button>
            ))}
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === "landing" ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {landingData ? (
                  <LandingCMS 
                    data={landingData}
                    onSave={handleSaveLanding}
                  />
              ) : (
                  <div className="py-20 flex justify-center"><FiRefreshCw className="animate-spin" /></div>
              )}
            </motion.div>
          ) : activeTab === "product" ? (
            <motion.div
              key="product"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto"
            >
              {productLoading && !product ? (
                <div className="py-20 flex justify-center"><FiRefreshCw className="animate-spin" /></div>
              ) : !product ? (
                <div className="py-32 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[3rem] bg-white dark:bg-zinc-950 shadow-sm">
                  <div className="w-20 h-20 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mx-auto mb-6">
                    <FiBox size={32} className="text-zinc-300" />
                  </div>
                  <h3 className="text-lg font-black uppercase italic mb-2">No Product Linked</h3>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-8">This campaign currently has no associated product artifact.</p>
                  <div className="flex flex-col md:flex-row items-center justify-center gap-4 px-10">
                    <button onClick={async () => {
                        setProductLoading(true);
                        const { data, error } = await supabase.from("products").insert({
                            name: "New Pre-Order Product",
                            price: 0,
                            stock: 100,
                            description: "New limited edition artifact...",
                            category: "APPAREL",
                            show_in_shop: false,
                            image_url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800",
                        }).select().single();

                        if (data) {
                          const newPreorder = { ...landingData?.preorder, product_id: data.id };
                          await supabase.from("site_settings").upsert({ key: "preorder", value: newPreorder }, { onConflict: "key" });
                          fetchData();
                          Swal.fire("Success", "New product placeholder created and linked", "success");
                        }
                        setProductLoading(false);
                      }}
                      className="px-8 py-4 bg-fuchsia-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-fuchsia-700 transition-all shadow-lg shadow-fuchsia-500/20 w-full md:w-auto"
                    >
                      Create New Product
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateProduct} className="bg-white dark:bg-zinc-900 p-10 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-8">
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-6 mb-2">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/10 flex items-center justify-center"><FiBox size={24} className="text-fuchsia-500" /></div>
                      <div>
                        <h2 className="text-xl font-black uppercase italic leading-none">Pre Order Product</h2>
                        <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mt-1">Direct Vault Synchronization</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        {[0, 1, 2, 3, 4, 5].map((idx) => {
                          const url = product.image_urls?.[idx] || (idx === 0 ? product.image_url : null);
                          return (
                            <div key={idx} className="aspect-square bg-zinc-50 dark:bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 relative group">
                              {url ? (
                                <>
                                  <img src={url} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                                    <button type="button" onClick={() => {
                                        const newUrls = [...(product.image_urls || [product.image_url])];
                                        newUrls.splice(idx, 1);
                                        setProduct({ ...product, image_urls: newUrls, image_url: newUrls[0] || "" });
                                      }}
                                      className="p-2 bg-red-500 text-white rounded-full hover:scale-110 transition-all"
                                    ><FiTrash2 /></button>
                                  </div>
                                </>
                              ) : (
                                <label className="inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                                  <FiPlus size={20} className="text-zinc-300 mb-2" />
                                  <span className="text-[8px] font-black uppercase text-zinc-400 text-center block w-full">Add Slot {idx + 1}</span>
                                  <input type="file" className="hidden" onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const url = await uploadProductImage(file);
                                        if (url) {
                                          const currentUrls = [...(product.image_urls || (product.image_url ? [product.image_url] : []))];
                                          currentUrls[idx] = url;
                                          setProduct({ ...product, image_urls: currentUrls.filter(Boolean), image_url: currentUrls[0] || url });
                                        }
                                      }
                                    }}
                                  />
                                </label>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-[8px] font-black uppercase text-zinc-500 mb-1 block">Artifact Name</label>
                          <input value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 px-4 py-3 rounded-xl text-xs font-bold outline-none focus:border-fuchsia-500/50" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[8px] font-black uppercase text-zinc-500 mb-1 block">Price (IDR)</label>
                            <input type="number" value={product.price} onChange={(e) => setProduct({ ...product, price: e.target.value })} className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 px-4 py-3 rounded-xl text-xs font-bold font-mono" />
                          </div>
                          <div>
                            <label className="text-[8px] font-black uppercase text-zinc-500 mb-1 block">Stock</label>
                            <input type="number" value={product.stock} onChange={(e) => setProduct({ ...product, stock: e.target.value })} className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 px-4 py-3 rounded-xl text-xs font-bold font-mono" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[8px] font-black uppercase text-zinc-500 mb-1 block">Description</label>
                          <textarea value={product.description} onChange={(e) => setProduct({ ...product, description: e.target.value })} rows={3} className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 px-4 py-3 rounded-xl text-xs font-bold outline-none focus:border-fuchsia-500/50 resize-none" />
                        </div>
                        <TagInput
                           label="Available Sizes"
                           tags={product.sizes || []}
                           onChange={(sizes) => setProduct({ ...product, sizes })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <button type="submit" disabled={productLoading} className="w-full py-5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                      {productLoading ? <FiRefreshCw className="animate-spin" /> : <FiZap />}
                      {productLoading ? "Synchronizing Archive..." : "Save Product Configuration"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <FiUsers className="text-fuchsia-500 mb-4" size={24} />
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Total Pre-Orderers</p>
                  <p className="text-4xl font-black italic">{orders.length}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <FiZap className="text-amber-500 mb-4" size={24} />
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Pending Payment</p>
                  <p className="text-4xl font-black italic">{orders.filter((o) => o.status === "pending").length}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <FiCheckCircle className="text-emerald-500 mb-4" size={24} />
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Verified Orders</p>
                  <p className="text-4xl font-black italic">{orders.filter((o) => o.status === "paid" || o.status === "processing").length}</p>
                </div>
              </div>

              <div className="space-y-4">
                {loading && orders.length === 0 ? (
                  <div className="py-20 flex justify-center"><FiRefreshCw className="animate-spin" /></div>
                ) : orders.length === 0 ? (
                  <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[3rem]">
                    <FiBox size={40} className="mb-4 opacity-10" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">No Pre-Orders Yet</p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 flex items-center justify-between group hover:border-fuchsia-500/30 transition-all shadow-sm">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center"><FiShoppingBag className="text-fuchsia-500" /></div>
                        <div>
                          <p className="text-[11px] font-black uppercase truncate max-w-[150px]">{order.customer_name}</p>
                          <p className="text-[9px] font-bold text-zinc-500">{order.customer_email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black italic mb-1">IDR {Number(order.total_price).toLocaleString()}</p>
                        <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full border ${order.status === "paid" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"}`}>{order.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
