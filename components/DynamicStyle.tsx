"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";

export default function DynamicStyle() {
  const [styles, setStyles] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data: settings } = await supabase.from("site_settings").select("*");
      if (settings) {
        const appearance = settings.find(s => s.key === "appearance")?.value || {};
        const colors = appearance.colors || {};
        const store = settings.find(s => s.key === "store")?.value || {};

        let css = `
          :root {
            ${colors.primary ? `--color-primary-accent: ${colors.primary};` : ""}
            ${colors.secondary ? `--color-secondary-accent: ${colors.secondary};` : ""}
            ${colors.accent ? `--color-rose-glow: ${colors.accent};` : ""}
            ${appearance.typography ? `--font-sans: "${appearance.typography}", var(--font-geist-sans);` : ""}
          }
        `;
        setStyles(css);
        if (store.logo_url) setLogoUrl(store.logo_url);
      }
    };

    fetchSettings();
  }, []);

  return (
    <>
      {logoUrl && <link rel="icon" href={logoUrl} />}
      <style dangerouslySetInnerHTML={{ __html: styles }} />
    </>
  );
}
