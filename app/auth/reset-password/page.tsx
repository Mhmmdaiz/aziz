"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiLock, FiLoader, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "error" | "success" } | null>(null);
  const router = useRouter();

  const showToast = (msg: string, type: "error" | "success" = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5500);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) return showToast("Password minimal 6 karakter.");
    if (password !== confirm) return showToast("Password tidak cocok.");

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) return showToast(error.message);
    
    showToast("Password berhasil diperbarui! Mengalihkan...", "success");
    setTimeout(() => {
      router.push("/auth");
    }, 2000);
  };

  return (
    <main className="min-h-screen w-full bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      {/* Ambient Glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-15%] left-[-15%] w-[55%] h-[55%] rounded-full bg-indigo-900/20 blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[-15%] w-[55%] h-[55%] rounded-full bg-zinc-800/30 blur-[120px]" />
      </div>

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
        className="relative z-10 w-full max-w-[460px]"
      >
        <div className="overflow-hidden rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 shadow-2xl backdrop-blur-2xl p-8 md:p-10">
          <div className="space-y-8">
            <header className="space-y-3">
              <h1 className="text-3xl font-black uppercase italic tracking-tighter">New_Password<span className="text-emerald-500">.</span></h1>
              <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-[0.2em]">Masukkan kata sandi baru untuk akun Anda.</p>
            </header>

            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="space-y-4">
                <div className="group relative">
                  <FiLock className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
                  <input
                    type="password"
                    placeholder="Password Baru"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-black/40 p-5 pl-14 text-xs font-bold tracking-tight text-zinc-900 dark:text-white outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-black/60 transition-all disabled:opacity-50"
                  />
                </div>
                <div className="group relative">
                  <FiLock className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
                  <input
                    type="password"
                    placeholder="Konfirmasi Password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-black/40 p-5 pl-14 text-xs font-bold tracking-tight text-zinc-900 dark:text-white outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-black/60 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-3 rounded-full bg-black dark:bg-white py-5 text-[10px] font-black italic uppercase tracking-[0.4em] text-white dark:text-black transition-all hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-95 disabled:opacity-50"
              >
                {loading ? <FiLoader className="animate-spin" /> : "Perbarui Password →"}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
