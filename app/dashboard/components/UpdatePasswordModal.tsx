"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiLock, FiX, FiCheckCircle } from "react-icons/fi";
import { supabase } from "@/utils/supabase/client";
import toast from "react-hot-toast";

interface UpdatePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpdatePasswordModal({ isOpen, onClose }: UpdatePasswordModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    if (newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated successfully");
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-[450px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-10 rounded-[3rem] shadow-2xl overflow-hidden transition-colors duration-500"
          >
             {/* Background Decoration */}
            <div className="absolute top-0 right-0 -mr-10 -mt-10 opacity-5 text-zinc-900 dark:text-white">
              <FiLock size={200} />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-zinc-900 dark:text-white">Security Update</h3>
                <button onClick={onClose} className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 ml-4 italic">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-6 py-4 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-white/10 focus:border-red-600 rounded-2xl outline-none text-zinc-900 dark:text-white font-bold transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 ml-4 italic">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-6 py-4 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-white/10 focus:border-red-600 rounded-2xl outline-none text-zinc-900 dark:text-white font-bold transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full font-black uppercase text-[10px] tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-black dark:hover:bg-zinc-200 transition-all active:scale-95 shadow-xl disabled:opacity-50"
                >
                  {loading ? "PROCESSING..." : "UPDATE PASSWORD"}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
