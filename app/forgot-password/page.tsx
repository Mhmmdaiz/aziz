"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiLoader, FiCheckCircle, FiAlertCircle, FiChevronLeft } from "react-icons/fi";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "error" | "success" } | null>(null);

  const showToast = (msg: string, type: "error" | "success" = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      return showToast("Masukkan format email yang valid.");
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });
    setLoading(false);

    if (error) {
      // Untuk keamanan: jangan beri tahu jika email tidak ada di database secara eksplisit jika perlu,
      // tapi biasanya resetPasswordForEmail selalu return success (untuk pencegahan enumerasi email).
      // Kita hanya tampilkan error jika ada masalah koneksi/rate limit.
      return showToast(error.message);
    }

    setSubmitted(true);
  };

  return (
    <main className="min-h-screen w-full bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      {/* Ambient Glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-15%] left-[-15%] w-[55%] h-[55%] rounded-full bg-indigo-900/20 blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[-15%] w-[55%] h-[55%] rounded-full bg-zinc-800/30 blur-[120px]" />
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -60, scale: 0.95 }}
            className={`fixed top-8 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-full px-6 py-3 shadow-2xl font-bold text-xs tracking-wide text-white ${
              toast.type === "error" ? "bg-red-500" : "bg-emerald-500"
            }`}
          >
            {toast.type === "error" ? <FiAlertCircle size={15} /> : <FiCheckCircle size={15} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[460px]"
      >
        <div className="overflow-hidden rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 shadow-2xl backdrop-blur-2xl p-8 md:p-12">
          
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="request-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-8"
              >
                <div className="space-y-3">
                  <Link 
                    href="/auth" 
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black dark:hover:text-white transition-colors mb-4 group"
                  >
                    <FiChevronLeft className="group-hover:-translate-x-1 transition-transform" /> Kembali Ke Login
                  </Link>
                  <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
                    Lock_Recover<span className="text-indigo-500">.</span>
                  </h1>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400 leading-relaxed">
                    KEHILANGAN AKSES? MASUKKAN EMAIL UNTUK MEMULIHKAN IDENTITAS ANDA.
                  </p>
                </div>

                <form onSubmit={handleResetRequest} className="space-y-6">
                  <div className="group relative">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
                      <FiMail />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="Email Gateway"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-black/40 p-6 pl-16 text-xs font-bold tracking-tight text-zinc-900 dark:text-white outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-black/60 transition-all disabled:opacity-50"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-16 rounded-full bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.4em] text-[10px] italic hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {loading ? <FiLoader className="animate-spin text-lg" /> : "Kirim Tautan →"}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success-state"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8 py-4"
              >
                <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiCheckCircle size={40} />
                </div>
                <div className="space-y-4">
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter">
                    Dispatch_Success (200)
                  </h2>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 leading-relaxed px-4">
                    Jika email terdaftar, instruksi pemulihan telah dikirim ke <span className="text-indigo-500">{email}</span>. Silakan periksa inbox (atau spam) Anda.
                  </p>
                </div>
                <Link 
                  href="/auth"
                  className="inline-block mt-8 text-[10px] font-black uppercase tracking-[0.3em] bg-black dark:bg-white text-white dark:text-black px-8 py-5 rounded-full hover:scale-105 transition-all"
                >
                  Dimengerti, Ke Login
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Decor */}
          {!submitted && (
            <div className="mt-12 flex justify-between items-center opacity-20 touch-none select-none border-t border-zinc-100 dark:border-zinc-800/50 pt-6">
              <span className="text-[8px] font-black tracking-[0.5em] uppercase">SECURE_RECOVERY</span>
              <span className="text-[8px] font-black tracking-[0.5em] uppercase">V02.SSL</span>
            </div>
          )}
        </div>
      </motion.div>
    </main>
  );
}
