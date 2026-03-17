"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function JournalModal({ isOpen, onClose, title, children, maxWidth = "max-w-4xl" }: JournalModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-white/80 dark:bg-black/90 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full ${maxWidth} bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-[2.5rem] shadow-2xl shadow-black/5 overflow-hidden flex flex-col max-h-[90vh]`}
          >
            {/* Modal Header */}
            <div className="p-8 border-b border-zinc-50 dark:border-zinc-900 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-zinc-900 dark:text-white">
                  {title}
                </h3>
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400 mt-1">
                  Registry_Interface // v1.0
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-3 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
