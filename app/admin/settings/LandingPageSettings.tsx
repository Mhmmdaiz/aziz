"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, LayoutDashboard, Zap, Target, Upload, Image as ImageIcon, LayoutGrid } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import Swal from "sweetalert2";

// Types
interface LandingData {
  hero?: {
    badge: string;
    headline: string;
    subheadline: string;
    cta_primary: string;
    cta_secondary: string;
    image_url?: string;
  };
  lookbook?: {
    image_1?: string;
    image_2?: string;
  };
  value_props?: {
    title: string;
    items: Array<{ icon: string; title: string; desc: string }>;
  };
  categories?: Array<{ name: string; count: string; img: string }>;
  faqs?: Array<{ q: string; a: string }>;
}

// Helpers
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

/** Upload Helper */
async function uploadImage(file: File, pathPrefix: string): Promise<string | null> {
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

export function LandingPageSettings({ data, onSave }: { data: LandingData; onSave: (d: any) => void }) {
  const defaultData: LandingData = {
    hero: {
      badge: "Limited Drop SS/26",
      headline: "Summon Your Darkest Style.",
      subheadline: "Architectural precision meets brutalist aesthetics.",
      cta_primary: "Shop Now",
      cta_secondary: "Explore Collection",
      image_url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2000"
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
    ]
  };

  const [formData, setFormData] = useState<LandingData>(
    { ...defaultData, ...data, hero: { ...defaultData.hero, ...data?.hero }, lookbook: { ...defaultData.lookbook, ...data?.lookbook }, categories: data?.categories?.length ? data.categories : defaultData.categories }
  );

  const handleChange = (key: keyof LandingData, value: any) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    onSave(updated);
  };

  return (
    <div className="space-y-5">
      {/* HERO CONFIG */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white">
            <LayoutDashboard size={14} />
          </div>
          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
            Hero Section
          </h3>
        </div>

        <div className="mb-6">
          <UploadBox
            label="Hero Background Image"
            value={formData.hero?.image_url}
            onChange={async (f) => {
              const url = await uploadImage(f, "hero");
              if (url) handleChange("hero", { ...formData.hero, image_url: url });
            }}
          />
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

      {/* LOOKBOOK CONFIG */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white">
            <ImageIcon size={14} />
          </div>
          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
            Lookbook Images
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UploadBox
            label="Lookbook Image 1 (Left/Main)"
            value={formData.lookbook?.image_1}
            onChange={async (f) => {
              const url = await uploadImage(f, "lookbook1");
              if (url) handleChange("lookbook", { ...formData.lookbook, image_1: url });
            }}
          />
          <UploadBox
            label="Lookbook Image 2 (Right/Side)"
            value={formData.lookbook?.image_2}
            onChange={async (f) => {
              const url = await uploadImage(f, "lookbook2");
              if (url) handleChange("lookbook", { ...formData.lookbook, image_2: url });
            }}
          />
        </div>
      </Card>

      {/* CATEGORY GRID CONFIG */}
      <Card>
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white">
              <LayoutGrid size={14} />
            </div>
            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
              Category Grid
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              const newCats = [...(formData.categories || []), { name: "", count: "", img: "" }];
              handleChange("categories", newCats);
            }}
            className="flex w-fit items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all"
          >
            <Plus size={11} /> Add Category
          </button>
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
                      const url = await uploadImage(f, `category_${i}`);
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
                    <Label>Category Title (e.g. Oversize)</Label>
                    <Input
                      value={cat.name}
                      onChange={(e) => {
                        const newCats = [...(formData.categories || [])];
                        newCats[i].name = e.target.value;
                        handleChange("categories", newCats);
                      }}
                    />
                  </div>
                  <div>
                    <Label>Subtext / Count (e.g. 12 Artifacts)</Label>
                    <Input
                      value={cat.count}
                      onChange={(e) => {
                        const newCats = [...(formData.categories || [])];
                        newCats[i].count = e.target.value;
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

      {/* VALUE PROPS */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white">
            <Target size={14} />
          </div>
          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
            Value Propositions
          </h3>
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
                      newItems[idx].title = e.target.value;
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
                      newItems[idx].desc = e.target.value;
                      handleChange("value_props", { ...formData.value_props, items: newItems });
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* FAQS  */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white">
              <Zap size={14} />
            </div>
            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
              FAQ Section
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              const newFaqs = [...(formData.faqs || []), { q: "", a: "" }];
              handleChange("faqs", newFaqs);
            }}
            className="flex w-fit items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all"
          >
            <Plus size={11} /> Add FAQ
          </button>
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
                      newFaqs[i].q = e.target.value;
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
                      newFaqs[i].a = e.target.value;
                      handleChange("faqs", newFaqs);
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
