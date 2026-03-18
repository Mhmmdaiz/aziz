"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductAccordionProps {
  description: string;
  specifications?: { key: string; value: string }[];
}

export function ProductAccordion({ description, specifications }: ProductAccordionProps) {
  const [openSection, setOpenSection] = useState<string>("description");

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? "" : section);
  };

  const sections = [
    {
      id: "description",
      title: "DESCRIPTION",
      content: description || "Detailed schematic data unavailable. Subject is composed of high-grade materials structurally reinforced for optimal durability.",
    },
    ...(specifications?.map((spec, index) => ({
      id: `spec-${index}`,
      title: spec.key.toUpperCase().replace(/\s+/g, '_'),
      content: spec.value,
    })) || []),
  ];

  return (
    <div className="w-full flex flex-col gap-2 mt-8">
      {sections.map((sec) => (
        <div 
          key={sec.id} 
          className="border border-zinc-200 dark:border-[#222] bg-white dark:bg-[#111] rounded-xl overflow-hidden transition-colors hover:border-zinc-300 dark:hover:border-[#444] shadow-sm dark:shadow-none"
        >
          <button
            onClick={() => toggleSection(sec.id)}
            className="w-full flex items-center justify-between p-5 text-left"
          >
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white transition-colors">
              {sec.title}
            </span>
            <motion.div
              animate={{ rotate: openSection === sec.id ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="text-zinc-400 dark:text-zinc-500 transition-colors"
            >
              <ChevronDown size={16} />
            </motion.div>
          </button>
          
          <AnimatePresence>
            {openSection === sec.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-5 pt-0 text-sm font-mono text-zinc-500 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-[#222] transition-colors">
                  {sec.content}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
