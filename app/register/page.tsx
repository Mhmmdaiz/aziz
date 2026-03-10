"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUser,
  FiMail,
  FiLock,
  FiMapPin,
  FiPhone,
  FiArrowRight,
  FiArrowLeft,
  FiCheckCircle,
  FiShield,
  FiLoader,
} from "react-icons/fi";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [agreed, setAgreed] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    city: "",
  });

  const passwordRules = useMemo(
    () => ({
      length: form.password.length >= 8,
      match: form.password === form.confirmPassword && form.password !== "",
    }),
    [form.password, form.confirmPassword],
  );

  const isStep1Valid =
    form.name && form.email && passwordRules.length && passwordRules.match;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrorMessage("");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    setLoading(true);
    try {
      await axios.post("http://127.0.0.1:8000/api/register", form);
      router.push("/login?registered=true");
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || "Protocol_Error: Registration Failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    // FIX 1: Hapus items-center di level paling atas untuk mencegah 'centering push' yang memotong konten
    <main className="min-h-screen w-full bg-[#fafafa] overflow-y-auto overflow-x-hidden">
      {/* FIX 2: Container dengan padding top & bottom yang luas (pt-24 pb-20) 
          agar konten tidak menempel ke pinggir layar/navbar */}
      <div className="flex justify-center items-start md:items-center min-h-screen p-4 pt-24 pb-20">
        {/* Background Text (Stay Fixed/Absolute) */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none select-none">
          <div className="absolute top-5 left-[-5%] text-[15vw] font-black italic text-zinc-200/40 uppercase tracking-tighter">
            Archive_
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl bg-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl shadow-zinc-200/50 border border-zinc-100 relative z-10 overflow-hidden"
        >
          {/* Progress Bar */}
          <div className="flex h-1.5 w-full bg-zinc-100">
            <motion.div
              animate={{ width: step === 1 ? "50%" : "100%" }}
              className="bg-black transition-all duration-500"
            />
          </div>

          <div className="p-8 md:p-14">
            <header className="mb-10">
              <div className="flex justify-between items-center mb-8">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-black italic text-sm">
                  A
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors border-b border-transparent hover:border-black"
                >
                  Sign_In_Instead
                </button>
              </div>
              <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none mb-3">
                {step === 1 ? "Initialize" : "Finalize"}
                <br />
                <span className="text-zinc-300">New_Identity.</span>
              </h1>
            </header>

            <AnimatePresence mode="wait">
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-600 text-[10px] font-black uppercase italic tracking-widest"
                >
                  Error: {errorMessage}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleRegister}>
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-5"
                >
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">
                      Legal_Name
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300" />
                      <input
                        required
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={handleInputChange}
                        placeholder="NAME"
                        className="w-full p-5 pl-14 rounded-2xl bg-zinc-50 border-2 border-transparent focus:border-black focus:bg-white outline-none transition-all font-bold italic text-xs uppercase"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">
                      Communication_Email
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300" />
                      <input
                        required
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleInputChange}
                        placeholder="NAME@DOMAIN.COM"
                        className="w-full p-5 pl-14 rounded-2xl bg-zinc-50 border-2 border-transparent focus:border-black focus:bg-white outline-none transition-all font-bold italic text-xs uppercase"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">
                        Access_Key
                      </label>
                      <input
                        required
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className="w-full p-5 rounded-2xl bg-zinc-50 border-2 border-transparent focus:border-black focus:bg-white outline-none transition-all font-bold italic text-xs tracking-widest"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">
                        Verify_Key
                      </label>
                      <input
                        required
                        name="confirmPassword"
                        type="password"
                        value={form.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className="w-full p-5 rounded-2xl bg-zinc-50 border-2 border-transparent focus:border-black focus:bg-white outline-none transition-all font-bold italic text-xs tracking-widest"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!isStep1Valid}
                    onClick={() => setStep(2)}
                    className="w-full bg-black text-white py-6 rounded-full font-black uppercase text-[10px] tracking-[0.4em] hover:bg-zinc-800 disabled:opacity-10 transition-all flex items-center justify-center gap-4 group mt-4"
                  >
                    Proceed_to_Logistics{" "}
                    <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-5"
                >
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">
                      Contact_Phone
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300" />
                      <input
                        required
                        name="phone"
                        type="text"
                        value={form.phone}
                        onChange={handleInputChange}
                        placeholder="+62"
                        className="w-full p-5 pl-14 rounded-2xl bg-zinc-50 border-2 border-transparent focus:border-black focus:bg-white outline-none transition-all font-bold italic text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">
                        City
                      </label>
                      <input
                        required
                        name="city"
                        type="text"
                        value={form.city}
                        onChange={handleInputChange}
                        placeholder="CITY"
                        className="w-full p-5 rounded-2xl bg-zinc-50 border-2 border-transparent focus:border-black focus:bg-white outline-none transition-all font-bold italic text-xs uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">
                        Address
                      </label>
                      <input
                        required
                        name="address"
                        type="text"
                        value={form.address}
                        onChange={handleInputChange}
                        placeholder="STREET NAME"
                        className="w-full p-5 rounded-2xl bg-zinc-50 border-2 border-transparent focus:border-black focus:bg-white outline-none transition-all font-bold italic text-xs uppercase"
                      />
                    </div>
                  </div>

                  <div className="py-4">
                    <label className="flex items-center gap-4 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="hidden"
                      />
                      <div
                        className={`w-5 h-5 border-2 rounded-lg flex items-center justify-center transition-all ${agreed ? "bg-black border-black" : "border-zinc-200"}`}
                      >
                        {agreed && (
                          <FiCheckCircle className="text-white text-xs" />
                        )}
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-black italic">
                        I_Accept_Privacy_Protocol
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="py-6 rounded-full border-2 border-zinc-100 font-black uppercase text-[10px] tracking-widest hover:bg-zinc-50 transition-all flex items-center justify-center gap-3"
                    >
                      <FiArrowLeft /> Back
                    </button>
                    <button
                      disabled={loading || !agreed}
                      className="bg-black text-white py-6 rounded-full font-black uppercase text-[10px] tracking-[0.4em] hover:bg-zinc-800 disabled:opacity-10 transition-all flex items-center justify-center gap-4 relative"
                    >
                      {loading ? (
                        <FiLoader className="animate-spin" />
                      ) : (
                        "Authorize_ID"
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </form>

            <footer className="mt-12 text-center">
              <p className="text-[9px] font-bold text-zinc-200 uppercase tracking-widest flex items-center justify-center gap-2 italic">
                <FiShield /> Session_Encrypted_AES_256
              </p>
            </footer>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
