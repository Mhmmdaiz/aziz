"use client";

import React from "react";
import { FiSmartphone } from "react-icons/fi";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import {
  FiMail,
  FiLock,
  FiUser,
  FiArrowRight,
  FiLoader,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";
import { FaGoogle } from "react-icons/fa";

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
  return data?.role?.toLowerCase() === "admin" ? "/admin/dashboard" : "/shop";
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

  // Handle Implicit OAuth hash (#access_token=...)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen w-full bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      {/* Ambient Glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-15%] left-[-15%] w-[55%] h-[55%] rounded-full bg-indigo-900/20 blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[-15%] w-[55%] h-[55%] rounded-full bg-zinc-800/30 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full bg-white/[0.03] blur-[80px]" />
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -60, scale: 0.95 }}
            className={`fixed top-8 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-full px-6 py-3 shadow-2xl font-bold text-xs tracking-wide ${
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

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[460px]"
      >
        {/* Brand */}
        <div className="mb-10 flex justify-center">
          <span className="text-3xl font-black italic tracking-tighter uppercase text-zinc-950 dark:text-white mt-30">
            CHCKT<span className="text-zinc-600">.</span>SYSTEM
          </span>
        </div>

        <div className="overflow-hidden rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 shadow-2xl backdrop-blur-2xl transition-colors duration-300">
          {/* ── Mode Tabs: Login / Register ── */}
          <div className="flex border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-black/40 p-2">
            {(["login", "register"] as FormMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                }}
                className="relative flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em]"
              >
                <span
                  className={`relative z-10 transition-colors ${mode === m ? "text-white dark:text-black" : "text-zinc-400 dark:text-zinc-500 hover:text-black dark:hover:text-zinc-300"}`}
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
            {/* ── Forms ── */}
            <AnimatePresence mode="wait">
              <EmailForm
                key={`email-${mode}`}
                mode={mode}
                onToast={showToast}
                onRedirect={handleRedirect}
                onSwitchToLogin={() => setMode("login")}
              />
            </AnimatePresence>

            {/* ── Social / OAuth ── */}
            <div className="mt-8">
              <div className="relative mb-7 flex items-center justify-center">
                <span className="absolute w-full border-t border-zinc-100 dark:border-zinc-800/50" />
                <span className="relative bg-white dark:bg-zinc-900 px-4 text-[8px] font-black uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-600">
                  OAuth_Gateway
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <OAuthButton
                  icon={<FaGoogle />}
                  label="Continue with Google"
                  provider="google"
                  onToast={showToast}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}

/* ─────────────────────────────────────────────────────────────
   Email Form (Login + Register)
───────────────────────────────────────────────────────────── */
function EmailForm({
  mode,
  onToast,
  onRedirect,
  onSwitchToLogin,
}: {
  mode: FormMode;
  onToast: (msg: string, type?: ToastType) => void;
  onRedirect: (uid: string) => void;
  onSwitchToLogin: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "register") {
      if (!fullName.trim()) return onToast("Nama lengkap wajib diisi.");
      if (password !== confirm) return onToast("Password tidak cocok.");
      if (password.length < 6) return onToast("Password minimal 6 karakter.");
    }
    if (!email) return onToast("Email wajib diisi.");
    if (!password) return onToast("Password wajib diisi.");

    setLoading(true);

    if (mode === "login") {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
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
        onToast("Login berhasil! Mengalihkan...", "success");
        await onRedirect(data.user.id);
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role: "customer" } },
      });
      setLoading(false);
      if (error) return onToast(error.message);

      const userId = data.session?.user?.id || data.user?.id;
      if (userId) {
        await supabase.from("profiles").upsert({
          id: userId,
          email: email,
          full_name: fullName,
          role: "customer",
          updated_at: new Date().toISOString()
        }, { onConflict: "id" });
      }

      if (data.session) {
        // Auto session — email confirmation disabled
        onToast("Akun berhasil dibuat!", "success");
        await onRedirect(data.session.user.id);
      } else {
        // Email confirmation required
        onToast("Cek email kamu untuk verifikasi akun.", "success");
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
          placeholder="NAMA_LENGKAP"
          value={fullName}
          onChange={setFullName}
          disabled={loading}
        />
      )}
      <Field
        icon={<FiMail />}
        placeholder="EMAIL_ADDRESS"
        type="email"
        value={email}
        onChange={setEmail}
        disabled={loading}
      />
      <div className="space-y-2">
        <Field
          icon={<FiLock />}
          placeholder="PASSWORD"
          type="password"
          value={password}
          onChange={setPassword}
          disabled={loading}
        />
        {mode === "login" && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={async () => {
                if (!email)
                  return onToast("Masukkan email dulu untuk reset password.");
                const { error } = await supabase.auth.resetPasswordForEmail(
                  email,
                  {
                    redirectTo: `${window.location.origin}/auth/reset`,
                  },
                );
                if (error) onToast(error.message);
                else onToast("Link reset dikirim ke email kamu.", "success");
              }}
              className="text-[9px] font-bold uppercase tracking-tight text-zinc-400 dark:text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
            >
              Lupa_Password?
            </button>
          </div>
        )}
      </div>
      {mode === "register" && (
        <Field
          icon={<FiLock />}
          placeholder="KONFIRMASI_PASSWORD"
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

/* ─────────────────────────────────────────────────────────────
   Phone OTP Form
───────────────────────────────────────────────────────────── */
function PhoneForm({
  onToast,
  onRedirect,
}: {
  onToast: (msg: string, type?: ToastType) => void;
  onRedirect: (uid: string) => void;
}) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"input" | "verify">("input");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const startCountdown = () => {
    setCountdown(60);
    const iv = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(iv);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const formatPhone = (raw: string) => {
    // Normalise: +62 prefix, strip leading 0
    let p = raw.replace(/\s+/g, "");
    if (p.startsWith("0")) p = "+62" + p.slice(1);
    if (!p.startsWith("+")) p = "+" + p;
    return p;
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return onToast("Nomor telepon wajib diisi.");
    setLoading(true);
    const formatted = formatPhone(phone);
    const { error } = await supabase.auth.signInWithOtp({ phone: formatted });
    setLoading(false);
    if (error) return onToast(error.message);
    onToast("Kode OTP dikirim ke " + formatted, "success");
    setStep("verify");
    startCountdown();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return onToast("OTP harus 6 angka.");
    setLoading(true);
    const formatted = formatPhone(phone);
    const { data, error } = await supabase.auth.verifyOtp({
      phone: formatted,
      token: otp,
      type: "sms",
    });
    setLoading(false);
    if (error) return onToast(error.message);
    if (data.session) {
      onToast("Login berhasil!", "success");
      await onRedirect(data.session.user.id);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {step === "input" ? (
        <motion.form
          key="phone-input"
          onSubmit={handleSendOTP}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 8 }}
          className="space-y-4"
        >
          <p className="text-center text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Masukkan nomor HP kamu (format: 08xxx)
          </p>
          <Field
            icon={<FiSmartphone />}
            placeholder="NOMOR_TELEPON"
            type="tel"
            value={phone}
            onChange={setPhone}
            disabled={loading}
          />
          <SubmitBtn loading={loading} label="Kirim_OTP →" />
        </motion.form>
      ) : (
        <motion.form
          key="otp-verify"
          onSubmit={handleVerify}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          className="space-y-5"
        >
          <p className="text-center text-[9px] font-black uppercase tracking-widest text-zinc-500">
            Masukkan 6 digit kode OTP yang dikirim ke&nbsp;
            <span className="text-white">{formatPhone(phone)}</span>
          </p>
          <Field
            icon={<FiSmartphone />}
            placeholder="000000"
            type="text"
            maxLength={6}
            value={otp}
            onChange={setOtp}
            disabled={loading}
          />
          <SubmitBtn loading={loading} label="Verifikasi →" />
          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-[9px] text-zinc-600 font-bold">
                Kirim ulang dalam {countdown}s
              </p>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setStep("input");
                  setOtp("");
                }}
                className="text-[9px] font-bold uppercase tracking-tight text-zinc-400 dark:text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
              >
                Kirim_Ulang_OTP
              </button>
            )}
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────────
   OAuth Button
───────────────────────────────────────────────────────────── */
function OAuthButton({
  icon,
  label,
  provider,
  onToast,
}: {
  icon: React.ReactNode;
  label: string;
  provider: "google" | "github";
  onToast: (msg: string, type?: ToastType) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const origin = window.location.origin;
    const redirectTo = `${origin}/auth/callback`;
    console.log("OAuth Redirecting to:", redirectTo);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
    if (error) {
      setLoading(false);
      onToast(error.message);
    }
    // Browser will redirect, no need to reset loading
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="flex w-full items-center justify-center gap-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-black/20 py-4 text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 transition-all hover:border-black dark:hover:border-zinc-500 hover:text-black dark:hover:text-white disabled:opacity-50 group"
    >
      {loading ? (
        <FiLoader className="animate-spin" size={14} />
      ) : (
        <span className="text-sm group-hover:text-black dark:group-hover:text-white transition-colors">
          {icon}
        </span>
      )}
      {label}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   Reusable Field
───────────────────────────────────────────────────────────── */
function Field({
  icon,
  onChange,
  value,
  ...rest
}: {
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  [k: string]: any;
}) {
  return (
    <div className="group relative">
      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600 transition-colors group-focus-within:text-black dark:group-focus-within:text-white">
        {icon}
      </div>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-black/40 p-5 pl-14 text-xs font-bold uppercase tracking-tight text-zinc-900 dark:text-white outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700 transition-all focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-black/60 disabled:opacity-50"
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Submit Button
───────────────────────────────────────────────────────────── */
function SubmitBtn({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-2 flex w-full items-center justify-center gap-3 rounded-full bg-black dark:bg-white py-5 text-[10px] font-black italic uppercase tracking-[0.4em] text-white dark:text-black shadow-[0_0_20px_rgba(0,0,0,0.08)] dark:shadow-[0_0_20px_rgba(255,255,255,0.08)] transition-all hover:bg-zinc-800 dark:hover:bg-zinc-200 hover:shadow-[0_0_30px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:opacity-50 active:scale-95"
    >
      {loading ? (
        <FiLoader className="animate-spin text-base" />
      ) : (
        <>
          <span>{label}</span>
          <FiArrowRight size={14} />
        </>
      )}
    </button>
  );
}
