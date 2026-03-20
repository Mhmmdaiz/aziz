"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiLock, FiLoader, FiCheckCircle, FiAlertCircle, FiEye, FiEyeOff } from "react-icons/fi";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "error" | "success" } | null>(null);
  const router = useRouter();

  const showToast = (msg: string, type: "error" | "success" = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Validasi: Minimal 8 karakter, ada huruf dan angka
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isValid = hasMinLength && hasLetter && hasNumber;
  const isMatch = password === confirm && password !== "";

  // Password Strength Score
  const getStrength = () => {
    let score = 0;
    if (hasMinLength) score += 1;
    if (hasLetter) score += 1;
    if (hasNumber) score += 1;
    if (password.length > 12) score += 1;
    return score;
  };
  const strength = getStrength();

  useEffect(() => {
    // Cek apakah ada session (user harus login via link recovery)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Jika tidak ada session, mungkin token invalid atau expired
        // Kita beri waktu sebentar untuk memastikan session terdeteksi
        setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          if (!retrySession) {
            showToast("Session tidak ditemukan atau token kedaluwarsa. Mengalihkan...", "error");
            setTimeout(() => router.push("/forgot-password"), 3000);
          }
        }, 1000);
      }
    };
    checkSession();
  }, [router]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return showToast("Password harus minimal 8 karakter dengan huruf dan angka.");
    if (!isMatch) return showToast("Konfirmasi password tidak cocok.");

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) return showToast(error.message);
    
    setSuccess(true);
    showToast("Password berhasil diperbarui!", "success");
    
    // Auto redirect setelah 3 detik
    setTimeout(() => {
      router.push("/auth");
    }, 3500);
  };

  return (
    <main className="min-h-screen w-full bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      {/* Ambient Glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-15%] left-[-15%] w-[55%] h-[55%] rounded-full bg-emerald-900/10 blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[-15%] w-[55%] h-[55%] rounded-full bg-zinc-800/20 blur-[120px]" />
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
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-[460px]"
      >
        <div className="overflow-hidden rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 shadow-2xl backdrop-blur-2xl p-8 md:p-12">
          
          <div className="space-y-8">
            <header className="space-y-3">
              <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
                Update_Access<span className="text-emerald-500">.</span>
              </h1>
              <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-[0.2em] leading-relaxed">
                BERHASIL TERVERIFIKASI. SILAKAN TENTUKAN KATA SANDI BARU ANDA.
              </p>
            </header>

            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="space-y-5">
                {/* Password Input */}
                <div className="group relative">
                  <FiLock className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors z-10" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="New Secret Key"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-black/40 p-6 pl-16 pr-14 text-xs font-bold tracking-tight text-zinc-900 dark:text-white outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-black/60 transition-all disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black dark:hover:text-white transition-colors z-10"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>

                {/* Strength Meter */}
                <div className="px-2 space-y-2">
                  <div className="flex gap-1 h-1.5 w-full">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-full flex-1 rounded-full transition-all duration-500 ${
                          strength >= i
                            ? strength <= 1 ? "bg-red-500" : strength === 2 ? "bg-orange-500" : strength === 3 ? "bg-yellow-500" : "bg-emerald-500"
                            : "bg-zinc-100 dark:bg-zinc-800"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-zinc-400 italic">
                    <span>Complexity: {strength < 2 ? 'Low' : strength < 4 ? 'Moderate' : 'Optimal'}</span>
                    <span>{password.length} Chars</span>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="group relative">
                  <FiLock className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors z-10" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Synchronize Key"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-black/40 p-6 pl-16 text-xs font-bold tracking-tight text-zinc-900 dark:text-white outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-black/60 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <button
                  type="submit"
                  disabled={loading || !isValid || !isMatch || success}
                  className="w-full h-16 rounded-full bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.4em] text-[10px] italic hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-3"
                >
                  {loading ? <FiLoader className="animate-spin text-lg" /> : success ? "Identitas Diperbarui ✓" : "Sychronize Key →"}
                </button>
                
                {success && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-[9px] font-black uppercase tracking-widest text-emerald-500 animate-pulse"
                  >
                    Redirecting to auth_gate in 3s...
                  </motion.p>
                )}
              </div>
            </form>

            {/* Constraints Info */}
            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/50 space-y-3">
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 italic">Security_Constraints:</span>
              <ul className="grid grid-cols-2 gap-2">
                {[
                  { label: "8+ Char", ok: hasMinLength },
                  { label: "Alpha", ok: hasLetter },
                  { label: "Numeric", ok: hasNumber },
                  { label: "Match", ok: isMatch },
                ].map((c) => (
                  <li key={c.label} className={`flex items-center gap-2 text-[8px] font-bold uppercase tracking-wider ${c.ok ? 'text-emerald-500' : 'text-zinc-300 dark:text-zinc-700'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${c.ok ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
                    {c.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
