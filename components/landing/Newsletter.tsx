"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { FiArrowRight, FiShield } from "react-icons/fi";
import { toast } from "react-hot-toast";

export default function Newsletter({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Berhasil Bergabung // Kode Diskon 10% Telah Dikirim", {
        style: {
          background: theme === "dark" ? '#000' : '#fff',
          color: theme === "dark" ? '#fff' : '#000',
          borderRadius: '2rem',
          fontSize: '10px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          border: theme === "dark" ? '1px solid #333' : '1px solid #eee'
        }
      });
      setEmail("");
    }
  };

  return (
    <section className={`py-32 transition-colors duration-500 ${theme === "dark" ? "bg-[#0B0B0B] text-white" : "bg-white text-black"}`}>
      <div className="container mx-auto px-6">
        <div className={`max-w-5xl mx-auto p-12 md:p-24 rounded-[4rem] border relative overflow-hidden text-center space-y-12 transition-all duration-500 ${theme === "dark" ? "bg-zinc-900 border-white/5" : "bg-zinc-50 border-zinc-100 shadow-sm"}`}>
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-indigo-500 to-red-600" />
           <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-500 italic block">Daftar Sekarang</span>
               <h2 className={`text-4xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.8] ${theme === "dark" ? "text-white" : "text-black"}`}>
                  Get 10% <br /> <span className={theme === "dark" ? "text-zinc-800" : "text-zinc-200"}>Off-Grid.</span>
               </h2>
              <p className="text-zinc-500 text-xs md:text-lg italic font-medium max-w-md mx-auto">
                 Secure your place in the archive. Early access to drops and exclusive technical data.
              </p>
           </div>

           <form onSubmit={handleSubmit} className="max-w-md mx-auto relative group">
               <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className={`w-full border p-6 rounded-full text-[10px] font-black tracking-widest outline-none transition-all uppercase ${theme === "dark" ? "bg-black border-white/10 placeholder:text-zinc-800 focus:border-[var(--color-primary-accent)]/50 text-white" : "bg-white border-zinc-200 placeholder:text-zinc-300 focus:border-[var(--color-primary-accent)]/50 text-black shadow-inner"}`}
              />
              <button 
                type="submit"
                className={`absolute top-1.5 right-1.5 bottom-1.5 px-8 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${theme === "dark" ? "bg-white text-black hover:bg-[var(--color-primary-accent)] hover:text-white" : "bg-black text-white hover:bg-[var(--color-primary-accent)]"}`}
              >
                 Join
              </button>
           </form>

           <div className="flex items-center justify-center gap-2 text-[8px] font-black uppercase tracking-widest text-zinc-700">
              Data Anda Aman // Tanpa Spam
           </div>
        </div>
      </div>
    </section>
  );
}
