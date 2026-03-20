"use client";

import React, { useState, useEffect } from "react";
import {
  FiMail,
  FiLock,
  FiUser,
  FiArrowRight,
  FiLoader,
  FiAlertCircle,
  FiCheckCircle,
  FiSmartphone,
} from "react-icons/fi";
import { FaGoogle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

/* ─── Types ─────────────────────────────────────────────── */
type ToastType = "error" | "success";
type ToastData = { msg: string; type: ToastType };
type Toast = ToastData | null;
type FormMode = "login" | "register";

/* ─── Helpers ─────────────────────────────────────────────── */
async function getRedirectPath(userId: string): Promise<string> {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  return data?.role?.toLowerCase() === "admin" ? "/admin/dashboard" : "/";
}

/* ─── Root Page ─────────────────────────────────────────────── */
export default function AuthPage() {
  const router = useRouter();
  const [toast, setToast] = useState<Toast>(null);
  const [mode, setMode] = useState<FormMode>("login");

  const showToast = (msg: string, type: ToastType = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5500);
  };

  const handleRedirect = async (userId: string) => {
    const path = await getRedirectPath(userId);
    router.push(path);
  };

  useEffect(() => {
    const run = async () => {
      if (!window.location.hash.includes("access_token")) return;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        showToast("OAuth berhasil! Mengalihkan...", "success");
        await handleRedirect(session.user.id);
      }
    };
    run();
  }, []);

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
            key="toast"
            initial={{ opacity: 0, y: -60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -60, scale: 0.95 }}
            className={`fixed top-8 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-full px-6 py-3 shadow-2xl font-bold text-xs tracking-wide text-white ${
              toast.type === "error" ? "bg-red-500" : "bg-emerald-500"
            }`}
          >
            {toast.type === "error" ? (
              <FiAlertCircle size={15} />
            ) : (
              <FiCheckCircle size={15} />
            )}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[460px]  mt-15"
      >
        {/* Brand */}
        <div className="mb-10 flex justify-center"></div>

        <div className="overflow-hidden rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 shadow-2xl backdrop-blur-2xl">
          {/* Tabs */}
          <div className="flex border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-black/40 p-2">
            {(["login", "register"] as FormMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className="relative flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em]"
              >
                <span
                  className={`relative z-10 transition-colors ${mode === m ? "text-white dark:text-black" : "text-zinc-400 dark:text-zinc-500"}`}
                >
                  {m}
                </span>
                {mode === m && (
                  <motion.div
                    layoutId="mode-pill"
                    className="absolute inset-0 z-0 rounded-2xl bg-black dark:bg-white"
                    transition={{
                      type: "spring",
                      bounce: 0.18,
                      duration: 0.55,
                    }}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="p-8 md:p-10">
            <AnimatePresence mode="wait">
              <EmailForm
                key={`email-${mode}`}
                mode={mode}
                onToast={showToast}
                onRedirect={handleRedirect}
                onSwitchToLogin={() => setMode("login")}
              />
            </AnimatePresence>

            {/* Social Auth */}
            <div className="mt-8">
              <div className="relative mb-7 flex items-center justify-center">
                <span className="absolute w-full border-t border-zinc-100 dark:border-zinc-800/50" />
                <span className="relative bg-white dark:bg-zinc-900 px-4 text-[8px] font-black uppercase tracking-[0.25em] text-zinc-400">
                  OAuth_Gateway
                </span>
              </div>
              <OAuthButton
                icon={<FaGoogle />}
                label="Continue with Google"
                provider="google"
                onToast={showToast}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}

/* ─── Sub-Components ────────────────────────────────────────── */

function EmailForm({ mode, onToast, onRedirect, onSwitchToLogin }: any) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (mode === "register") {
      if (!fullName.trim()) return onToast("Nama lengkap wajib diisi.");
      if (password !== confirm) return onToast("Password tidak cocok.");
      if (password.length < 6) return onToast("Password minimal 6 karakter.");
    }
    if (!cleanEmail) return onToast("Email wajib diisi.");
    if (!password) return onToast("Password wajib diisi.");

    setLoading(true);

    if (mode === "login") {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      setLoading(false);
      if (error)
        return onToast(
          error.message === "Invalid login credentials"
            ? "Email atau password salah."
            : error.message,
        );
      if (data.user) {
        onToast("Login berhasil!", "success");
        await onRedirect(data.user.id);
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: { data: { full_name: fullName, role: "customer" } },
      });
      setLoading(false);
      if (error) return onToast(error.message);

      const userId = data.session?.user?.id || data.user?.id;
      if (userId) {
        await supabase.from("profiles").upsert(
          {
            id: userId,
            email: cleanEmail,
            full_name: fullName,
            role: "customer",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        );
      }

      if (data.session) {
        onToast("Akun berhasil dibuat!", "success");
        await onRedirect(data.session.user.id);
      } else {
        onToast("Cek email kamu untuk verifikasi.", "success");
        onSwitchToLogin();
      }
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      className="space-y-4"
    >
      {mode === "register" && (
        <Field
          icon={<FiUser />}
          placeholder="Nama Lengkap"
          value={fullName}
          onChange={setFullName}
          disabled={loading}
        />
      )}
      <Field
        icon={<FiMail />}
        placeholder="Alamat Email"
        type="email"
        value={email}
        onChange={setEmail}
        disabled={loading}
      />
      <div className="space-y-2">
        <Field
          icon={<FiLock />}
          placeholder="Password"
          type="password"
          value={password}
          onChange={setPassword}
          disabled={loading}
        />
        {mode === "login" && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => onToast("Fitur reset password menyusul.")}
              className="text-[9px] font-bold uppercase text-zinc-400 hover:text-black dark:hover:text-white"
            >
              Lupa_Password?
            </button>
          </div>
        )}
      </div>
      {mode === "register" && (
        <Field
          icon={<FiLock />}
          placeholder="Konfirmasi Password"
          type="password"
          value={confirm}
          onChange={setConfirm}
          disabled={loading}
        />
      )}
      <SubmitBtn
        loading={loading}
        label={mode === "login" ? "Masuk →" : "Buat_Akun →"}
      />
    </motion.form>
  );
}

function Field({ icon, onChange, value, ...rest }: any) {
  return (
    <div className="group relative">
      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
        {icon}
      </div>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        // CLASS 'uppercase' DIHAPUS BIAR GAK KAPITAL SEMUA
        className="w-full rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-black/40 p-5 pl-14 text-xs font-bold tracking-tight text-zinc-900 dark:text-white outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-black/60 transition-all disabled:opacity-50"
      />
    </div>
  );
}

function OAuthButton({ icon, label, provider, onToast }: any) {
  const [loading, setLoading] = useState(false);
  const handleClick = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setLoading(false);
      onToast(error.message);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex w-full items-center justify-center gap-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-black/20 py-4 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-black dark:hover:text-white transition-all"
    >
      {loading ? (
        <FiLoader className="animate-spin" />
      ) : (
        <span className="text-sm">{icon}</span>
      )}
      {label}
    </button>
  );
}

function SubmitBtn({ loading, label }: any) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-2 flex w-full items-center justify-center gap-3 rounded-full bg-black dark:bg-white py-5 text-[10px] font-black italic uppercase tracking-[0.4em] text-white dark:text-black transition-all hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-95 disabled:opacity-50"
    >
      {loading ? (
        <FiLoader className="animate-spin" />
      ) : (
        <>
          <span className="ml-4">{label}</span>
        </>
      )}
    </button>
  );
}
