"use client";

import ContactSection from "@/components/landing/ContactSection";
import { useSettings } from "@/components/providers/SettingsProvider";

export default function ContactPage() {
  const { settings } = useSettings();
  const contactSection = settings?.landing_content?.sections?.find((s: any) => s.id === "contact");
  const theme = contactSection?.theme && contactSection.theme !== "auto" ? contactSection.theme : "dark";

  return (
    <main className={`min-h-screen transition-colors duration-500 ${theme === "dark" ? "bg-[#0B0B0B]" : "bg-white"}`}>
       {/* Hero-like Header for the Page */}
       

      <ContactSection theme={theme as "dark" | "light"} />

      {/* Optional: Add a call to action back to shop */}
      
    </main>
  );
}
