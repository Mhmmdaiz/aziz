"use client";

import Link from "next/link";
import { FiInstagram, FiTwitter, FiFacebook, FiChevronRight } from "react-icons/fi";
import { FaTiktok } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#050505] text-black dark:text-white pt-24 pb-12 transition-colors duration-500 border-t border-zinc-100 dark:border-zinc-900">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          
          {/* Brand Info */}
          <div className="space-y-8">
            <div className="text-3xl font-black tracking-tighter uppercase italic">
              Daemonium<span className="text-red-600">.</span>
            </div>
            <p className="text-zinc-500 text-sm italic font-medium leading-relaxed max-w-xs">
              Architectural precision in streetwear. Elevating everyday utility with avant-garde aesthetics since SS/24. 
            </p>
            <div className="flex gap-4">
              {[
                { icon: <FiInstagram />, href: "#" },
                { icon: <FaTiktok />, href: "#" },
                { icon: <FiTwitter />, href: "#" }
              ].map((social, i) => (
                <a 
                  key={i} 
                  href={social.href} 
                  className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all border border-zinc-100 dark:border-white/5"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-8">
            <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic">Navigation</h5>
            <ul className="space-y-4">
              {["Shop All", "New Arrivals", "Featured", "Archive", "Journal"].map((item) => (
                <li key={item}>
                  <Link href="/shop" className="text-sm font-bold uppercase tracking-widest text-zinc-400 hover:text-red-500 transition-colors flex items-center gap-2 group">
                    <FiChevronRight className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-8">
            <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic">Support</h5>
            <ul className="space-y-4">
              {["Contact Us", "Shipping Info", "Return Policy", "Size Guide", "FAQS"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm font-bold uppercase tracking-widest text-zinc-400 hover:text-red-500 transition-colors flex items-center gap-2 group">
                    <FiChevronRight className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-8">
            <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic">Vault_Node</h5>
            <div className="space-y-6">
              <div className="space-y-1">
                <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Dispatch_Hub</p>
                <p className="text-sm font-bold italic">Jakarta, Ind. [Node_ID: 8080]</p>
              </div>
              <div className="space-y-1">
                <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Communication</p>
                <p className="text-sm font-bold italic">dispatch@daemonium.archive</p>
              </div>
            </div>
          </div>

        </div>

        <div className="pt-12 border-t border-zinc-100 dark:border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">
          <p>© {new Date().getFullYear()} DAEMONIUM_ARCHIVE SYSTEM. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-red-500 transition-colors">Privacy_Protocol</a>
            <a href="#" className="hover:text-red-500 transition-colors">Terms_of_Sync</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
