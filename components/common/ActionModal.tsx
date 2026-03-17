"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiAlertTriangle, FiCheck, FiX } from "react-icons/fi";

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  type: "confirm" | "success";
  title: string;
  message: string;
}

export default function ActionModal({
  isOpen,
  onClose,
  onConfirm,
  type,
  title,
  message,
}: ActionModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          {/* OVERLAY: Premium Glass Effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-white/40 backdrop-blur-2xl"
          />

          {/* BOX MODAL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className="relative glass-card bg-white rounded-[4rem] p-10 md:p-14 max-w-sm w-full shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] border border-white"
          >
            <div className="flex flex-col items-center text-center">
              {/* ICON DYNAMIC WITH ANIMATION */}
              <motion.div
                initial={{ rotate: -20, scale: 0 }}
                animate={{ rotate: type === "confirm" ? -10 : 12, scale: 1 }}
                className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mb-10 shadow-2xl ${
                  type === "confirm"
                    ? "bg-red-500 text-white shadow-red-200"
                    : "bg-blue-600 text-white shadow-blue-200"
                }`}
              >
                {type === "confirm" ? (
                  <FiAlertTriangle size={40} />
                ) : (
                  <FiCheck size={40} strokeWidth={3} />
                )}
              </motion.div>

              {/* TITLES & MESSAGE */}
              <h3 className="text-4xl font-black tracking-tighter italic mb-4">
                {title}
                <span
                  className={
                    type === "confirm" ? "text-red-500" : "text-blue-600"
                  }
                >
                  .
                </span>
              </h3>
              <p className="text-gray-400 font-medium text-base leading-relaxed mb-12">
                {message}
              </p>

              {/* BUTTON ACTIONS */}
              <div className="flex w-full gap-4">
                {type === "confirm" ? (
                  <>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={onClose}
                      className="flex-1 bg-gray-100 text-gray-500 py-6 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all"
                    >
                      Batal
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        onConfirm?.();
                        onClose();
                      }}
                      className="flex-[1.5] bg-red-600 text-white py-6 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-red-700 transition-all shadow-xl shadow-red-100"
                    >
                      Hapus Masterpiece
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="w-full bg-black text-white py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-blue-600 transition-all shadow-xl shadow-black/5"
                  >
                    Tutup Jurnal
                  </motion.button>
                )}
              </div>
            </div>

            {/* Close Icon Corner */}
            <button
              onClick={onClose}
              className="absolute top-8 right-8 text-gray-300 hover:text-black transition-colors"
            >
              <FiX size={24} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
