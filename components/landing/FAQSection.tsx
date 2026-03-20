import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiMinus } from "react-icons/fi";
import { useSettings } from "@/components/providers/SettingsProvider";

const defaultFaqs = [
  { q: "How long is the dispatch protocol?", a: "Standard deployment takes 2-4 cycles (days). International synchronization may vary." },
  { q: "Can I return an artifact?", a: "We offer 30-day vault returns for unworn pieces in original modular packaging." },
  { q: "Where can I find the size chart?", a: "Detailed dimensions are available on each unit detail page under 'Technical Data'." },
  { q: "What secure gateways are accepted?", a: "We accept Pakasir (QRIS & VA), Bank Vault Transfer, and major Credit Nodes." }
];

export default function FAQSection({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const { settings } = useSettings();
  const faqs = settings?.landing_content?.faqs || defaultFaqs;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className={`py-32 transition-colors duration-500 ${theme === "dark" ? "bg-[#0B0B0B] text-white" : "bg-white text-black"}`}>
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-24 space-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-400 italic block">Information_vault</span>
          <h2 className={`text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-none ${theme === "dark" ? "text-white" : "text-black"}`}>FAQS.</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((f: { q: string; a: string }, i: number) => (
            <div 
              key={i} 
              className={`border-b overflow-hidden transition-colors duration-500 ${theme === "dark" ? "border-zinc-900" : "border-zinc-100"}`}
            >
              <button 
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full py-10 flex items-center justify-between text-left group"
              >
                <span className={`text-lg md:text-2xl font-black italic uppercase tracking-tighter group-hover:text-[var(--color-primary-accent)] transition-colors ${theme === "dark" ? "text-white" : "text-black"}`}>
                  {f.q}
                </span>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${open === i ? 'rotate-45 bg-[var(--color-primary-accent)] text-white' : (theme === "dark" ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-black')}`}>
                  <FiPlus size={20} />
                </div>
              </button>
              
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <p className={`pb-10 text-sm md:text-lg italic font-medium leading-relaxed max-w-2xl ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}>
                      {f.a}
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
