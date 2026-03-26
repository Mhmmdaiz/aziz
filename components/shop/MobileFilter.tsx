"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiFilter } from "react-icons/fi";
import FilterSidebar from "./FilterSidebar";

interface MobileFilterProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  activeSize: string;
  setActiveSize: (size: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
}

export default function MobileFilter({
  isOpen,
  onClose,
  activeCategory,
  setActiveCategory,
  activeSize,
  setActiveSize,
  priceRange,
  setPriceRange
}: MobileFilterProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 bg-white dark:bg-[#0B0B0B] border-t border-zinc-200 dark:border-white/10 rounded-t-[3rem] z-[101] p-10 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-10">
               <h2 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-900 dark:text-white">Filter Vault.</h2>
               <button onClick={onClose} className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-full text-zinc-400 dark:text-white shadow-sm">
                 <FiX size={20} />
               </button>
            </div>
            
            <FilterSidebar 
              activeCategory={activeCategory}
              setActiveCategory={(cat) => {
                setActiveCategory(cat);
                onClose();
              }}
              activeSize={activeSize}
              setActiveSize={(s) => {
                setActiveSize(s);
                onClose();
              }}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
