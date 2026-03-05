"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import {
  FiEye,
  FiEyeOff,
  FiArrowLeft,
  FiShield,
  FiLoader,
  FiLogIn,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

function LoginModule() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- STATES ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const callback = searchParams.get("callback") || "/";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/login", {
        email,
        password,
      });
      const { token, user } = res.data;

      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Redirect logic berdasarkan role atau callback
        const redirectPath =
          callback !== "/"
            ? callback
            : user.role === "admin"
              ? "/admin/dashboard"
              : "/";
        router.push(redirectPath);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || "Invalid_Credentials_Access_Denied",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px] mx-auto flex flex-col min-h-full py-6">
      {/* HEADER */}
      <div className="mb-10">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-black transition-all mb-12"
        >
          <FiArrowLeft /> Return_Home
        </button>
        <h1 className="text-6xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.8] mb-4">
          Access<span className="text-zinc-200">_</span>
          <br />
          Portal
        </h1>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 italic leading-relaxed">
          Authorized Personnel Only
          <br />
          Secure_Session_Initialization
        </p>
      </div>

      {/* ERROR FEEDBACK */}
      <AnimatePresence mode="wait">
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-black text-white text-[10px] font-black uppercase italic tracking-widest flex items-center gap-3"
          >
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Error: {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOGIN FORM */}
      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">
            Identity_Email
          </label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-5 bg-zinc-50 border-2 border-transparent focus:border-black focus:bg-white rounded-2xl outline-none transition-all font-bold italic text-sm"
            placeholder="NAME@DOMAIN.COM"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-end">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">
              Access_Key
            </label>
          </div>
          <div className="relative">
            <input
              required
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-5 bg-zinc-50 border-2 border-transparent focus:border-black focus:bg-white rounded-2xl outline-none transition-all font-bold italic text-sm tracking-widest"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-black transition-colors"
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        </div>

        <button
          disabled={isLoading}
          className="relative w-full py-7 bg-black text-white rounded-full font-black uppercase tracking-[0.4em] text-[11px] italic hover:bg-zinc-800 transition-all active:scale-[0.97] disabled:bg-zinc-200 mt-4 group overflow-hidden"
        >
          <div
            className={`flex items-center justify-center gap-3 transition-transform ${isLoading ? "translate-y-20" : "translate-y-0"}`}
          >
            Authorize_Entry <FiLogIn />
          </div>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <FiLoader className="animate-spin text-lg" />
            </div>
          )}
        </button>
      </form>

      {/* REGISTER REDIRECT */}
      <div className="mt-8 text-center">
        <button
          onClick={() => router.push("/register")}
          className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors py-2 border-b border-transparent hover:border-black"
        >
          Don't have an ID? Create_New_Archive
        </button>
      </div>

      {/* FOOTER */}
      <div className="mt-auto pt-16 flex flex-col gap-6">
        <div className="h-px bg-zinc-100 w-full" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest italic flex items-center gap-2">
            <FiShield /> Encrypted_Connect_V2.06
          </p>
          <div className="flex gap-4">
            <button className="text-[9px] font-black uppercase text-zinc-400 hover:text-black italic">
              Terms_
            </button>
            <button className="text-[9px] font-black uppercase text-zinc-400 hover:text-black italic">
              Privacy_
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full bg-[#fafafa] flex flex-col lg:flex-row overflow-x-hidden">
      {/* LEFT: VISUAL (DESKTOP) */}
      <section className="hidden lg:flex lg:w-5/12 bg-black p-16 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50" />
        <div className="relative z-10 text-white text-[10vw] font-black italic uppercase leading-[0.75] tracking-tighter opacity-10 select-none">
          Archive
          <br />
          System
        </div>
        <div className="relative z-10">
          <h2 className="text-white text-5xl font-black italic uppercase leading-none tracking-tighter">
            Security
            <br />
            <span className="text-zinc-700">Protocol.</span>
          </h2>
          <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-[0.5em] mt-8">
            Internal_Use_Only
          </p>
        </div>
      </section>

      {/* RIGHT: FORM */}
      <section className="flex-1 flex flex-col bg-white overflow-y-auto">
        <div className="flex-1 px-6 py-12 md:px-20 lg:px-24 flex items-center">
          <Suspense
            fallback={
              <div className="font-black italic uppercase animate-pulse tracking-[0.5em] text-[10px]">
                Loading_Archive_Module...
              </div>
            }
          >
            <LoginModule />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
