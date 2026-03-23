"use client";

import FAQSection from "@/components/landing/FAQSection";
import { motion } from "framer-motion";
import { useSettings } from "@/components/providers/SettingsProvider";

export default function FAQPage() {
  const { settings } = useSettings();
  const faqSection = settings?.landing_content?.sections?.find((s: any) => s.id === "faq");
  const theme = faqSection?.theme && faqSection.theme !== "auto" ? faqSection.theme : "dark";

  return (
    <main className={`min-h-screen transition-colors duration-500 ${theme === "dark" ? "bg-[#0B0B0B]" : "bg-white"}`}>
      {/* Hero-like Header for the Page */}
      

      <FAQSection theme={theme as "dark" | "light"} />
      
      {/* Optional: Add a call to action back to shop */}
      
    </main>
  );
}
