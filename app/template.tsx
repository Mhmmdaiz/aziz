"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, filter: "blur(10px)", y: 15 }}
        animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
        exit={{ opacity: 0, filter: "blur(10px)", y: -15 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          mass: 0.5,
        }}
        className="w-full min-h-screen flex flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
