"use client";

import Hero from "@/components/landing/Hero";
import TrustBadges from "@/components/landing/TrustBadges";
import FeaturedProducts from "@/components/landing/FeaturedProducts";
import ValueProp from "@/components/landing/ValueProp";
import CategoryGrid from "@/components/landing/CategoryGrid";
import Lookbook from "@/components/landing/Lookbook";
import Testimonials from "@/components/landing/Testimonials";
import ScarcityBanner from "@/components/landing/ScarcityBanner";
import FAQSection from "@/components/landing/FAQSection";
import Newsletter from "@/components/landing/Newsletter";
import Footer from "@/components/landing/Footer";
import RecentPurchase from "@/components/landing/RecentPurchase";
import { Toaster } from "react-hot-toast";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function FashionLandingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  useEffect(() => {
    if (code) {
      router.replace(`/auth/callback?code=${code}`);
    }
  }, [code, router]);

  return (
    <main className="bg-[#0B0B0B] text-white selection:bg-red-500 selection:text-white overflow-x-hidden">
      <Toaster position="bottom-right" />
      <RecentPurchase />
      
      {/* 1. HERO */}
      <Hero />

      {/* 2. TRUST BADGES */}
      <TrustBadges />

      {/* 3. FEATURED PRODUCTS */}
      <FeaturedProducts />

      {/* 4. VALUE PROPOSITION */}
      <ValueProp />

      {/* 5. COLLECTION CATEGORIES */}
      <CategoryGrid />

      {/* 6. LOOKBOOK SHOWCASE */}
      <Lookbook />

      {/* 7. TESTIMONIALS */}
      <Testimonials />

      {/* 8. SCARCITY PROMO */}
      <ScarcityBanner />

      {/* 9. FAQ SECTION */}
      <FAQSection />

      {/* 10. NEWSLETTER */}
      <Newsletter />

      {/* 11. FOOTER */}
      <Footer />
    </main>
  );
}
