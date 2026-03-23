"use client";

import React from "react";
import Link from "next/link";
import { FiInstagram } from "react-icons/fi";
import { FaTiktok } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full bg-white dark:bg-black text-black dark:text-white py-10 transition-colors duration-300">
      <div className="container mx-auto px-6 mt-0 mb-0">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Left Side: Navigation */}
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 md:gap-10 text-[11px] font-black uppercase tracking-widest">
            
            <Link href="/faq" className="hover:opacity-50 transition-opacity">
              Faq
            </Link>
            <Link href="/contact" className="hover:opacity-50 transition-opacity">
              Contact Us
            </Link>
          </div>

          {/* Right Side: Legal & Socials */}
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
            {/* Legal */}
            <div className="flex items-center gap-4 text-[10px] text-zinc-400 font-medium tracking-tight">
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

              
              <span className="cursor-default">
                © {new Date().getFullYear()} DAEMONIUM.
              </span>

              <div className="flex items-center gap-1">
                <p className="text-zinc-400">Site By</p>
                <a
                  href="#"
                  className="hover:text-black dark:hover:text-white transition-colors underline underline-offset-2"
                >
                  AZ
                </a>
              </div>
            </div>

            {/* Social Icons (Minimal Circles) */}
            <div className="flex items-center gap-3">
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
      </div>
    </footer>
  );
}
