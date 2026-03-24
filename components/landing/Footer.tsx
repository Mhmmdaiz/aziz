"use client";

import React from "react";
import Link from "next/link";
import { FiInstagram } from "react-icons/fi";
import { FaTiktok } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full bg-white dark:bg-black text-black dark:text-white py-12 transition-colors duration-300 border-t border-zinc-100 dark:border-zinc-900">
      {/* Container Compact - max-w-5xl agar tidak terlalu lebar */}
      <div className="container mx-auto px-6 max-w-5xl">
        {/* Layout: flex-col (mobile) -> 4 baris, md:flex-row (desktop) -> 1 baris */}
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between md:gap-0">
          {/* BARIS 1: Navigasi Utama */}
          <div className="flex items-center gap-6 text-[11px] font-black uppercase tracking-widest order-1">
            <Link href="/faq" className="hover:opacity-50 transition-opacity">
              Faq
            </Link>
            <Link
              href="/contact"
              className="hover:opacity-50 transition-opacity"
            >
              Contact Us
            </Link>
          </div>

          {/* BARIS 2: Legal Links */}
          <div className="flex items-center gap-4 text-[10px] text-zinc-400 font-medium order-2">
            <Link
              href="/terms"
              className="hover:text-black dark:hover:text-white transition-colors"
            >
              Terms & Conditions
            </Link>
            <Link
              href="/privacy"
              className="hover:text-black dark:hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
          </div>

          {/* BARIS 3: Copyright & Credit */}
          <div className="flex items-center gap-1 text-[10px] text-zinc-400 order-3">
            <span>© {new Date().getFullYear()} DAEMONIUM®.</span>
            <span className="ml-1">Site by</span>
            <a
              href="#"
              className="hover:text-black dark:hover:text-white transition-colors underline underline-offset-2"
            >
              AZ
            </a>
          </div>

          {/* BARIS 4: Social Icons (Bulat Hitam sesuai contoh) */}
          <div className="flex items-center gap-3 order-4">
            <a
              href="https://www.instagram.com/daemoniumm__/"
              target="_blank"
              className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center hover:scale-110 transition-transform"
            >
              <FiInstagram size={14} />
            </a>
            <a
              href="#"
              className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center hover:scale-110 transition-transform"
            >
              <FaTiktok size={12} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
