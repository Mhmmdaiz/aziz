"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiMinus } from "react-icons/fi";
import { useSettings } from "@/components/providers/SettingsProvider";

export default function FAQSection({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const { settings } = useSettings();
  const faqs: { q: string; a: string }[] = settings?.landing_content?.faqs || [
    { q: "Berapa lama waktu pengiriman?", a: "Estimasi pengiriman standar 2–4 hari kerja setelah pesanan dikonfirmasi." },
    { q: "Apakah ukuran bisa dikustomisasi?", a: "Untuk produk pre-order tertentu, ukuran dapat disesuaikan. Cek halaman pre-order untuk info lebih lanjut." },
    { q: "Bagaimana cara melacak pesanan saya?", a: "Setelah pesanan diproses, kami akan mengirimkan nomor resi melalui email atau WhatsApp." },
    { q: "Apakah ada kebijakan pengembalian?", a: "Kami menerima pengembalian dalam 7 hari jika produk cacat atau tidak sesuai pesanan." },
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
          PERTANYAAN<br />UMUM.
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
