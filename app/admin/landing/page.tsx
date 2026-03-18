"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { useSettings } from "@/components/providers/SettingsProvider";
import { motion } from "framer-motion";
import { FiSave, FiRefreshCw, FiPlus, FiTrash2, FiEdit3 } from "react-icons/fi";
import Swal from "sweetalert2";

export default function AdminLandingEditor() {
  const { settings, refreshSettings, loading: settingsLoading } = useSettings();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!settingsLoading) {
      if (settings?.landing_content) {
        setContent(settings.landing_content);
      } else {
        // Fallback to initial structure if missing
        setContent({
          hero: {
            badge: "New Drop",
            headline: "Title",
            subheadline: "Desc",
            cta_primary: "Shop",
            cta_secondary: "All",
          },
          trust_badges: [],
          value_props: { title: "", items: [] },
          scarcity: { title: "", sub: "", hours: 12 },
          faqs: [],
          testimonials: [],
        });
      }
      setLoading(false);
    }
  }, [settings, settingsLoading]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("site_settings").upsert(
      {
        key: "landing_content",
        value: content,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    );

    if (error) {
      Swal.fire("Error", error.message, "error");
    } else {
      await refreshSettings();
      Swal.fire({
        title: "SUCCESS",
        text: "Landing configuration synchronized.",
        icon: "success",
        background: "#000",
        color: "#fff",
        confirmButtonColor: "#fff",
        customClass: {
          popup: "rounded-[2rem] font-mono border border-zinc-800",
          confirmButton: "text-black font-black",
        },
      });
    }
    setSaving(false);
  };

  const updateHero = (key: string, val: string) => {
    setContent({ ...content, hero: { ...content.hero, [key]: val } });
  };

  if (loading || !content)
    return (
      <div className="p-20 text-center font-black animate-pulse">
        BOOTING_CMS...
      </div>
    );

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black pt-24 pb-12 px-4 md:px-12 font-mono transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="mt-5 text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-[0.8] text-zinc-900 dark:text-white">
              Landing <br />{" "}
              <span className="text-zinc-200 dark:text-zinc-800">
                Architect.
              </span>
            </h1>
          </motion.div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-3 bg-red-600 text-white px-10 py-5 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 active:scale-95 disabled:opacity-50"
          >
            {saving ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
            {saving ? "SYNCING..." : "DEPLOY_CHANGES"}
          </button>
        </header>

        {/* --- HERO SECTION --- */}
        <section className="bg-white dark:bg-zinc-900 rounded-[3rem] p-10 border border-zinc-100 dark:border-zinc-800 shadow-xl space-y-8">
          <div className="flex items-center gap-4">
            <span className="text-3xl font-black italic opacity-10 uppercase">
              HRO
            </span>
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">
              Hero_Module_Config
            </h2>
            <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Input
              label="Badge_Label"
              value={content.hero.badge}
              onChange={(v) => updateHero("badge", v)}
            />
            <Input
              label="Headline_Text"
              value={content.hero.headline}
              onChange={(v) => updateHero("headline", v)}
            />
            <Input
              label="Sub_Headline"
              value={content.hero.subheadline}
              onChange={(v) => updateHero("subheadline", v)}
              area
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="CTA_Primary"
                value={content.hero.cta_primary}
                onChange={(v) => updateHero("cta_primary", v)}
              />
              <Input
                label="CTA_Secondary"
                value={content.hero.cta_secondary}
                onChange={(v) => updateHero("cta_secondary", v)}
              />
            </div>
          </div>
        </section>

        {/* --- SCARCITY SECTION --- */}
        <section className="bg-white dark:bg-zinc-900 rounded-[3rem] p-10 border border-zinc-100 dark:border-zinc-800 shadow-xl space-y-8">
          <div className="flex items-center gap-4">
            <span className="text-3xl font-black italic opacity-10 uppercase">
              SCR
            </span>
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">
              Scarcity_Protocol
            </h2>
            <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Input
              label="Main_Title"
              value={content.scarcity.title}
              onChange={(v) =>
                setContent({
                  ...content,
                  scarcity: { ...content.scarcity, title: v },
                })
              }
            />
            <Input
              label="Urgency_Sub"
              value={content.scarcity.sub}
              onChange={(v) =>
                setContent({
                  ...content,
                  scarcity: { ...content.scarcity, sub: v },
                })
              }
            />
          </div>
        </section>

        {/* --- FAQ SECTION --- */}
        <section className="bg-white dark:bg-zinc-900 rounded-[3rem] p-10 border border-zinc-100 dark:border-zinc-800 shadow-xl space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-3xl font-black italic opacity-10 uppercase">
                FAQ
              </span>
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">
                Information_Vault
              </h2>
            </div>
            <button
              onClick={() =>
                setContent({
                  ...content,
                  faqs: [
                    ...content.faqs,
                    { q: "New Question", a: "New Answer" },
                  ],
                })
              }
              className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
            >
              <FiPlus />
            </button>
          </div>

          <div className="space-y-6">
            {content.faqs.map((faq: any, i: number) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={`Q${i + 1}`}
                    value={faq.q}
                    onChange={(v) => {
                      const newFaqs = [...content.faqs];
                      newFaqs[i].q = v;
                      setContent({ ...content, faqs: newFaqs });
                    }}
                  />
                  <Input
                    label={`A${i + 1}`}
                    value={faq.a}
                    onChange={(v) => {
                      const newFaqs = [...content.faqs];
                      newFaqs[i].a = v;
                      setContent({ ...content, faqs: newFaqs });
                    }}
                    area
                  />
                </div>
                <button
                  onClick={() =>
                    setContent({
                      ...content,
                      faqs: content.faqs.filter(
                        (_: any, idx: number) => idx !== i,
                      ),
                    })
                  }
                  className="mt-8 p-3 text-zinc-400 hover:text-red-500 transition-all"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Input({ label, value, onChange, area = false }: any) {
  return (
    <div className="space-y-3">
      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-4">
        {label}
      </label>
      {area ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full bg-zinc-50 dark:bg-black p-6 rounded-[2rem] font-bold italic focus:ring-2 focus:ring-red-500 outline-none transition-all resize-none border border-zinc-100 dark:border-zinc-800"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-zinc-50 dark:bg-black p-6 rounded-full font-bold italic focus:ring-2 focus:ring-red-500 outline-none transition-all border border-zinc-100 dark:border-zinc-800"
        />
      )}
    </div>
  );
}
