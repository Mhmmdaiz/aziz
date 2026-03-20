"use client";

import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/utils/supabase/client";
import {
  FiMenu,
  FiX,
  FiLogOut,
  FiZap,
  FiHome,
  FiGrid,
  FiBookOpen,
  FiSettings,
  FiUser,
  FiSun,
  FiMoon,
  FiShoppingBag,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiClock,
  FiArrowRight,
  FiEdit,
} from "react-icons/fi";
import { ThemeToggle } from "./ThemeToggle";
import { useSettings } from "@/components/providers/SettingsProvider";
import { useCart } from "@/components/providers/CartProvider";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);

  const { cart, cartCount, cartTotal } = useCart();
  const { theme, setTheme } = useTheme();
  const { settings } = useSettings();

  const [storeName, setStoreName] = useState("DAEMONIUM");

  useEffect(() => {
    if (settings?.store?.store_name) {
      setStoreName(settings.store.store_name);
    }
  }, [settings]);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 30);
  });

  const fetchUserAndRole = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      setUser(profile ? { ...session.user, ...profile } : session.user);
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchUserAndRole();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") fetchUserAndRole();
      if (event === "SIGNED_OUT") {
        setUser(null);
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  if (!mounted) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    setUser(null);
    window.location.href = "/auth";
  };

  const handleCheckout = () => {
    router.push("/cart");
  };

  const isAdmin =
    user?.role?.toLowerCase() === "admin" ||
    user?.role?.toLowerCase() === "superadmin";

  const activeLinks = isAdmin
    ? [
        { href: "/admin/dashboard", label: "Dashboard", icon: <FiZap /> },
        { href: "/admin/settings", label: "Settings", icon: <FiSettings /> },
      ]
    : [
        { href: "/", label: "Home", icon: <FiHome /> },
        { href: "/shop", label: "Shop", icon: <FiGrid /> },
        { href: "/orders", label: "Orders", icon: <FiClock /> },
        { href: "/journal", label: "Journal", icon: <FiBookOpen /> },
      ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-[100] py-4 md:py-6"
      >
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div
            className={`relative flex items-center justify-between px-4 md:px-10 h-14 md:h-20 rounded-full border transition-all duration-700 glass shadow-2xl ${
              scrolled || isAdmin
                ? "shadow-indigo-500/10 border-indigo-500/20"
                : "border-white/20 shadow-black/5"
            }`}
          >
            {/* LEFT: LOGO & DESKTOP NAV */}
            <div className="flex items-center gap-4 md:gap-8 min-w-0">
              <Link
                href={isAdmin ? "/admin/dashboard" : "/"}
                className="group shrink-0"
              >
                <div className="text-sm md:text-xl font-black tracking-tighter uppercase italic text-zinc-900 dark:text-white flex items-center gap-1.5">
                  {isAdmin ? "ADMIN" : storeName}
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_indigo]" />
                </div>
              </Link>

              <div className="hidden lg:flex items-center gap-1 p-1 rounded-2xl bg-zinc-500/10 dark:bg-zinc-800/50">
                {activeLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="relative px-5 py-2 group"
                  >
                    <div
                      className={`relative z-10 text-[9px] font-black uppercase tracking-widest transition-all ${
                        pathname === link.href
                          ? "text-zinc-900 dark:text-white"
                          : "text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white"
                      }`}
                    >
                      {link.label}
                    </div>
                    {pathname === link.href && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-white/80 dark:bg-zinc-700/80 backdrop-blur-md shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/20 rounded-xl z-0"
                        transition={{
                          type: "spring",
                          bounce: 0.15,
                          duration: 0.5,
                        }}
                      />
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* RIGHT: ACTIONS */}
            <div className="flex items-center gap-1.5 md:gap-3">
              {/* Cart Button */}
              {!isAdmin && (
                <Link
                  href="/cart"
                  className="relative p-2.5 md:p-3 rounded-full bg-zinc-100/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all group"
                >
                  <FiShoppingBag size={18} className="relative z-10" />
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-zinc-900"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </Link>
              )}

              {user ? (
                <div className="flex items-center gap-3 ml-1 md:ml-2">
                  <div className="hidden md:flex flex-col items-end leading-none">
                    <span className="text-[7px] font-black uppercase tracking-[0.2em] text-blue-600 mb-0.5">
                      {user.role}
                    </span>
                    <span className="text-[10px] font-black uppercase italic text-zinc-900 dark:text-zinc-100">
                      {user.full_name || "Guest"}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2.5 md:p-3 rounded-full text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all bg-zinc-100/50 dark:bg-zinc-800/50"
                  >
                    <FiLogOut size={18} />
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth"
                  className="hidden md:flex p-2.5 md:px-6 md:py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg items-center justify-center"
                >
                  <span className="hidden md:inline">LOGIN</span>
                </Link>
              )}

              <ThemeToggle />

              <button
                className="lg:hidden w-10 h-10 flex items-center justify-center bg-zinc-100/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-white rounded-full transition-all active:scale-90"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU OVERLAY */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-24 left-4 right-4 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 shadow-2xl border border-zinc-100 dark:border-zinc-800 lg:hidden flex flex-col gap-3 md:gap-4"
            >
              {activeLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-xl md:text-2xl font-black italic uppercase tracking-tighter border-b border-zinc-50 dark:border-zinc-800 pb-3 md:pb-4 flex justify-between items-center text-zinc-900 dark:text-white transition-colors"
                >
                  {link.label}{" "}
                  <FiZap className="text-zinc-200 dark:text-zinc-700" />
                </Link>
              ))}

              {!user && (
                <Link
                  href="/auth"
                  onClick={() => setIsOpen(false)}
                  className="mt-4 text-xl md:text-2xl font-black italic uppercase tracking-tighter border-b border-zinc-50 dark:border-zinc-800 pb-3 md:pb-4 flex justify-between items-center text-indigo-500 transition-colors"
                >
                  LOGIN <FiUser className="text-zinc-200 dark:text-zinc-700" />
                </Link>
              )}

              {user && (
                <button
                  onClick={handleLogout}
                  className="text-xl md:text-2xl font-black italic uppercase tracking-tighter border-b border-zinc-50 dark:border-zinc-800 pb-3 md:pb-4 flex justify-between items-center text-rose-500 transition-colors text-left"
                >
                  Logout{" "}
                  <FiLogOut className="text-zinc-200 dark:text-zinc-700" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
