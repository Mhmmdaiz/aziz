"use client";

import Hero from "@/components/landing/Hero";
import PreOrderSystem from "@/components/landing/PreOrderSystem";
import FeaturedProducts from "@/components/landing/FeaturedProducts";
import CategoryGrid from "@/components/landing/CategoryGrid";
import Lookbook from "@/components/landing/Lookbook";
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
    const urlParams = new URLSearchParams(window.location.search);
    const code = codeFromNext || urlParams.get("code");

    if (code) {
      console.log("AuthRedirectHandler: OAuth code detected, redirecting...");
      window.location.href = `/auth/callback?code=${code}`;
    }
  }, [codeFromNext]);

  return null;
}

export default function FashionLandingPage() {
  const { settings } = useSettings();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // 1. URUTAN LANDING PAGE SESUAI PERMINTAAN
  const defaultSections = [
    { id: "hero", visible: true, theme: "dark" },            // 1. Hero (Dark)
    { id: "preorder", visible: true, theme: "light" },       // 2. Pre-Order (Light)
    { id: "featured_products", visible: true, theme: "dark" },// 3. New Product (Dark)
    { id: "categories", visible: true, theme: "light" },     // 4. Category (Light)
    { id: "lookbook", visible: true, theme: "dark" },       // 5. Lookbook (Dark)
  ];

  // Logic menggabungkan dengan CMS jika ada
  const cmsSections = settings?.landing_content?.sections;
  const sections = cmsSections
    ? [...cmsSections, ...defaultSections.filter(ds => !cmsSections.some((s: any) => s.id === ds.id))]
    : defaultSections;

  // Pastikan urutan mengikuti array defaultSections jika tidak diatur manual di CMS
  const sortedSections = [...sections].sort((a, b) => {
    const order = ["hero", "preorder", "featured_products", "categories", "lookbook"];
    return order.indexOf(a.id) - order.indexOf(b.id);
  });

  const visibleSections = sortedSections.filter((s: any) => s.visible !== false);

  if (!mounted) return null;

  return (
    <main className="selection:bg-[var(--color-primary-accent)] selection:text-white overflow-x-hidden bg-black">
      <Suspense fallback={null}>
        <AuthRedirectHandler />
      </Suspense>
      <Toaster position="bottom-right" />

      {visibleSections.map((section: any, index: number) => {
        // Logika Tema Otomatis: Ganjil Dark, Genap Light (Selang-seling)
        const theme = section.theme && section.theme !== "auto" 
          ? section.theme 
          : (index % 2 === 0 ? "dark" : "light");

        switch (section.id) {
          case "hero":
            return <Hero key="hero" theme={theme} />;
          case "preorder":
            return <PreOrderSystem key="preorder" theme={theme} />;
          case "featured_products":
            return <FeaturedProducts key="featured_products" theme={theme} />;
          case "categories":
            return <CategoryGrid key="categories" theme={theme} />;
          case "lookbook":
            return <Lookbook key="lookbook" theme={theme} />;
          default:
            return null;
        }
      })}
    </main>
  );
}