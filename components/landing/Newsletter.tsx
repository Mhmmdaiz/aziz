"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { FiArrowRight, FiShield } from "react-icons/fi";
import { toast } from "react-hot-toast";

export default function Newsletter() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Identity Secured // 10% Discount Code Sent", {
        style: {
          background: '#000',
          color: '#fff',
          borderRadius: '2rem',
          fontSize: '10px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        }
      });
      setEmail("");
    }
  };

  return (
    <section className="py-32 bg-[#0B0B0B] text-white">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto p-12 md:p-24 rounded-[4rem] bg-zinc-900 border border-white/5 relative overflow-hidden text-center space-y-12">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-indigo-500 to-red-600" />
           <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-500 italic block">Transmission_entry</span>
              <h2 className="text-4xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.8]">
                 Get 10% <br /> <span className="text-zinc-800">Off-Grid.</span>
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
                placeholder="ENTER_IDENTITY_EMAIL"
                className="w-full bg-black border border-white/10 p-6 rounded-full text-[10px] font-black tracking-widest placeholder:text-zinc-800 outline-none focus:border-red-500/50 transition-all uppercase"
              />
              <button 
                type="submit"
                className="absolute top-1 right-1 bottom-1 px-8 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
              >
                 Join
              </button>
           </form>

           <div className="flex items-center justify-center gap-2 text-[8px] font-black uppercase tracking-widest text-zinc-700">
              <FiShield /> 256-Bit Identity Protocol // No Spam
           </div>
        </div>
      </div>
    </section>
  );
}
