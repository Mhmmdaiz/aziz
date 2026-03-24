"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-full bg-zinc-100/80 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white transition-all duration-500 hover:scale-110 active:scale-90 shadow-sm overflow-hidden group outline-none"
      title="Toggle Theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme === "dark" ? "dark" : "light"}
          initial={{ y: 30, opacity: 0, rotate: -45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -30, opacity: 0, rotate: 45 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20,
            duration: 0.2
          }}
          className="relative z-10"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-600 drop-shadow-[0_0_8px_rgba(79,70,229,0.3)]" />
          )}
        </motion.div>
      </AnimatePresence>
      
      {/* Subtle background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-zinc-200/20 to-transparent dark:via-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </button>
  );
}
