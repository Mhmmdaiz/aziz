import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FiArrowRight, FiClock } from "react-icons/fi";
import { useSettings } from "@/components/providers/SettingsProvider";

export default function ScarcityBanner() {
  const { settings } = useSettings();
  const content = settings?.landing_content?.scarcity || {
    title: "Only 50 Pieces.",
    sub: "No restocks. Once it's gone, it's archived.",
    hours: 12
  };

  const [timeLeft, setTimeLeft] = useState({ h: content.hours, m: 45, s: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { h, m, s } = prev;
        if (s > 0) s--;
        else if (m > 0) { m--; s = 59; }
        else if (h > 0) { h--; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const format = (n: number) => n.toString().padStart(2, '0');

  return (
    <section className="py-24 bg-red-600 text-white overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20rem] font-black italic opacity-10 whitespace-nowrap pointer-events-none tracking-tighter">
        LIMITED DROP LIMITED DROP
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 text-center lg:text-left">
           <div className="space-y-6">
              <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.8] whitespace-pre-line">
                 {content.title}
              </h2>
              <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.5em] italic">{content.sub}</p>
           </div>

           <div className="flex flex-col items-center gap-8">
              <div className="flex items-center gap-4 bg-black/20 p-8 rounded-[3rem] backdrop-blur-xl border border-white/10">
                 <div className="flex flex-col items-center">
                    <span className="text-5xl md:text-7xl font-black italic tracking-tighter">{format(timeLeft.h)}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Hours</span>
                 </div>
                 <span className="text-4xl font-black opacity-40 mb-6">:</span>
                 <div className="flex flex-col items-center">
                    <span className="text-5xl md:text-7xl font-black italic tracking-tighter">{format(timeLeft.m)}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Mins</span>
                 </div>
                 <span className="text-4xl font-black opacity-40 mb-6">:</span>
                 <div className="flex flex-col items-center">
                    <span className="text-5xl md:text-7xl font-black italic tracking-tighter">{format(timeLeft.s)}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Secs</span>
                 </div>
              </div>

              <Link 
                href="/shop"
                className="group px-12 py-5 bg-white text-black font-black uppercase text-[10px] tracking-[0.4em] rounded-full hover:scale-110 active:scale-95 transition-all flex items-center gap-3 shadow-2xl"
              >
                Get Yours Now <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
           </div>
        </div>
      </div>
    </section>
  );
}
