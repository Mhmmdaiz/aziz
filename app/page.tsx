"use client";

import Hero from "@/components/landing/Hero";
import TrustBadges from "@/components/landing/TrustBadges";
import FeaturedProducts from "@/components/landing/FeaturedProducts";
import ValueProp from "@/components/landing/ValueProp";
import CategoryGrid from "@/components/landing/CategoryGrid";
import Lookbook from "@/components/landing/Lookbook";
import Testimonials from "@/components/landing/Testimonials";
import Newsletter from "@/components/landing/Newsletter";
import PreOrderSystem from "@/components/landing/PreOrderSystem";
import FAQSection from "@/components/landing/FAQSection";
import ContactSection from "@/components/landing/ContactSection";
import RecentPurchase from "@/components/landing/RecentPurchase";
import { Toaster } from "react-hot-toast";
import { useSettings } from "@/components/providers/SettingsProvider";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense, useState } from "react";
import { useTheme } from "next-themes";

function AuthRedirectHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeFromNext = searchParams.get("code");

  useEffect(() => {
    // Coba ambil code dari useSearchParams dulu, kalau gagal coba ambil manual dari URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = codeFromNext || urlParams.get("code");

    if (code) {
      console.log(
        "AuthRedirectHandler: OAuth code detected, redirecting to callback...",
      );
      // Jangan pakai router.push karena terkadang masalah di middleware, force full reload ke callback
      window.location.href = `/auth/callback?code=${code}`;
    }
  }, [codeFromNext]);

  return null;
}

export default function FashionLandingPage() {
  const { settings, loading } = useSettings();
  
  // Default sections order if not defined in settings
  const defaultSections = [
    { id: "hero", visible: true, theme: "auto" },
    { id: "featured_products", visible: true, theme: "auto" },
    { id: "value_props", visible: true, theme: "auto" },
    { id: "categories", visible: true, theme: "auto" },
    { id: "lookbook", visible: true, theme: "auto" },
    { id: "preorder", visible: true, theme: "auto" },
    { id: "testimonials", visible: true, theme: "auto" },
    { id: "faq", visible: true, theme: "auto" },
    { id: "contact", visible: true, theme: "auto" },
  ];

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const cmsSections = settings?.landing_content?.sections;
  const sections = cmsSections 
    ? [...cmsSections, ...defaultSections.filter(ds => !cmsSections.some((s: any) => s.id === ds.id))]
    : defaultSections;

  const visibleSections = sections.filter((s: any) => s.visible !== false);
  
  // Logic theme selang-seling (alternating)
  let trackingTheme: "dark" | "light" = (resolvedTheme as any) || "dark";
  
  const processedSections = visibleSections.map((section: any) => {
    let theme: "dark" | "light";
    
    if (section.theme && section.theme !== "auto") {
      theme = section.theme as "dark" | "light";
    } else {
      theme = trackingTheme === "dark" ? "light" : "dark";
    }
    
    trackingTheme = theme;
    return { ...section, calculatedTheme: theme };
  });

  const newsletterSection = sections.find((s: any) => s.id === "newsletter");
  const newsletterTheme = newsletterSection?.theme && newsletterSection.theme !== "auto" 
    ? newsletterSection.theme 
    : (trackingTheme === "dark" ? "light" : "dark");

  if (!mounted) return null;

  return (
    <main className="selection:bg-[var(--color-primary-accent)] selection:text-white overflow-x-hidden">
      <Suspense fallback={null}>
        <AuthRedirectHandler />
      </Suspense>
      <Toaster position="bottom-right" />
      <RecentPurchase />

      {processedSections.map((section: any) => {
        const theme = section.calculatedTheme;

        switch (section.id) {
          case "hero":
            return <Hero key="hero" theme={theme} />;
          case "featured_products":
            return <FeaturedProducts key="featured_products" theme={theme} />;
          case "value_props":
            return (
              <div key="value_props_group">
                <TrustBadges theme={theme} />
                <ValueProp theme={theme} />
              </div>
            );
          case "categories":
            return <CategoryGrid key="categories" theme={theme} />;
          case "lookbook":
            return <Lookbook key="lookbook" theme={theme} />;
          case "preorder":
            return <PreOrderSystem key="preorder" theme={theme} />;
          case "testimonials":
            return <Testimonials key="testimonials" />;
          default:
            return null;
        }
      })}

      <Newsletter theme={newsletterTheme} />
    </main>
  );
}
