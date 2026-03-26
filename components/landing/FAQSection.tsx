"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiMinus } from "react-icons/fi";
import { useSettings } from "@/components/providers/SettingsProvider";

export default function FAQSection({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const { settings } = useSettings();
  const faqs: { q: string; a: string }[] = settings?.landing_content?.faqs || [
    { q: "How long does shipping take?", a: "Standard shipping takes 2–4 business days after the order is confirmed." },
    { q: "Can sizes be customized?", a: "For certain pre-order products, sizes can be adjusted. Check the product page for more information." },
    { q: "How do I track my order?", a: "Once the order is processed, we will send a tracking number via email or WhatsApp." },
    { q: "Is there a return policy?", a: "We accept returns within 7 days if the product is defective or does not match the order." },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const isDark = theme === "dark";

  return (
    <section
      className={`py-24 md:py-36 transition-colors duration-500 ${isDark ? "bg-black text-white" : "bg-white text-black"}`}
    >
      <div className="container mx-auto px-4 md:px-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-10 h-px bg-[var(--color-primary-accent)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--color-primary-accent)]">
            FAQ
          </span>
        </div>
        <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none mb-14">
          FREQUENTLY ASKED<br />QUESTIONS.
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`rounded-2xl border overflow-hidden transition-colors duration-300 ${
                isDark ? "border-white/10 bg-zinc-900/40" : "border-zinc-200 bg-zinc-50"
              }`}
            >
              <button
                className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className="text-sm font-black uppercase tracking-wide">{faq.q}</span>
                <span className={`shrink-0 transition-colors ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                  {openIndex === i ? <FiMinus size={16} /> : <FiPlus size={16} />}
                </span>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p
                      className={`px-6 pb-5 text-sm leading-relaxed font-medium ${
                        isDark ? "text-zinc-400" : "text-zinc-500"
                      }`}
                    >
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
