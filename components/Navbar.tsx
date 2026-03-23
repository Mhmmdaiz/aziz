"use client";

import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  useSpring,
} from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/utils/supabase/client";
import {
  FiMenu,
  FiX,
  FiLogOut,
  FiShoppingBag,
  FiZap,
  FiUser,
} from "react-icons/fi";
import { useSettings } from "@/components/providers/SettingsProvider";
import { useCart } from "@/components/providers/CartProvider";
import { ThemeToggle } from "./ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount } = useCart();
  const { settings } = useSettings();

  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Logo & Content Settings
  const storeName = settings?.store?.store_name || "DAEMONIUM";
  const logoUrl = settings?.store?.logo_url;

  const { scrollY, scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const lastScrollY = useRef(0);
  const SCROLL_THRESHOLD = 10;

  useMotionValueEvent(scrollY, "change", (latest) => {
    const direction = latest > lastScrollY.current ? "down" : "up";
    const diff = Math.abs(latest - lastScrollY.current);

    if (diff > SCROLL_THRESHOLD) {
      if (direction === "down" && latest > 150) {
        setHidden(true);
      } else {
        setHidden(false);
      }
    }

    setIsScrolled(latest > 30);
    lastScrollY.current = latest;
  });

  const fetchUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
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
    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") fetchUser();
      if (event === "SIGNED_OUT") {
        setUser(null);
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (!mounted) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    setUser(null);
    window.location.href = "/auth";
  };

  const isAdmin = user?.role?.toLowerCase() === "admin" || user?.role?.toLowerCase() === "superadmin";

  const navLinks = isAdmin
    ? [
        { href: "/admin/dashboard", label: "DASHBOARD" },
        { href: "/admin/settings", label: "SETTINGS" },
      ]
    : [
        { href: "/", label: "HOME" },
        { href: "/shop", label: "SHOP" },
        { href: "/journal", label: "JOURNAL" },
      ];

  return (
    <>
      <motion.nav
        variants={{
          visible: { y: 0, opacity: 1 },
          hidden: { y: -100, opacity: 0 },
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-[100] py-4 md:py-6 pointer-events-none"
      >
        {/* PROGRESS BAR */}
        <div className="absolute top-0 left-0 right-0 px-4 md:px-12 pointer-events-none">
           <motion.div
            className="h-[2px] bg-red-600 origin-left rounded-full"
            style={{ scaleX }}
          />
        </div>

        <div className="w-full px-4 md:px-8 lg:px-12 pointer-events-auto">
          <div
            className={`relative flex items-center justify-between px-6 md:px-10 h-16 md:h-20 rounded-full border transition-all duration-700 shadow-2xl glass
              ${isScrolled
                ? "border-zinc-200/20 dark:border-white/20 bg-white/40 dark:bg-black/40 backdrop-blur-xl scale-[0.98] md:scale-100"
                : "border-zinc-200/10 dark:border-white/10 bg-white/20 dark:bg-black/20 backdrop-blur-md"
              }
            `}
          >
            {/* LOGO */}
            <div className="flex items-center gap-8">
              <Link href={isAdmin ? "/admin/dashboard" : "/"} className="group">
                <div className="flex items-center gap-2">
                  {logoUrl ? (
                    <img src={logoUrl} alt={storeName} className="h-6 md:h-8 w-auto object-contain" />
                  ) : (
                    <span className="text-sm md:text-xl font-black tracking-tighter uppercase italic text-zinc-900 dark:text-white flex items-center gap-2">
                      {isAdmin ? "DAEMON ADMIN" : storeName}
                    </span>
                  )}
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                </div>
              </Link>

              {/* DESKTOP NAV */}
              <div className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/5">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="relative px-6 py-2 group"
                  >
                    <span className={`relative z-10 text-[10px] font-black uppercase tracking-widest transition-colors
                      ${pathname === link.href ? "text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-200"}
                    `}>
                      {link.label}
                    </span>
                    {pathname === link.href && (
                      <motion.div
                        layoutId="nav-pill-premium"
                        className="absolute inset-0 bg-white/10 rounded-full z-0 border border-white/10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* RIGHT ACTIONS (Desktop) */}
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-3">
                 <ThemeToggle />
                 {!isAdmin && (
                  <Link
                    href="/cart"
                    className="relative p-3 rounded-full bg-zinc-900/5 dark:bg-white/5 hover:bg-zinc-900/10 dark:hover:bg-white/10 text-zinc-900 dark:text-white transition-all group border border-zinc-200 dark:border-white/5 shadow-xl"
                  >
                    <FiShoppingBag size={18} />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                )}
                {user ? (
                  <div className="flex items-center gap-3 ml-2">
                    <Link 
                      href="/dashboard" 
                      className="group/profile relative flex items-center transition-all duration-500"
                    >
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-zinc-200 dark:border-white/10 overflow-hidden group-hover/profile:border-red-600 group-hover/profile:scale-105 transition-all bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center p-0.5 shadow-lg">
                         {user.user_metadata?.avatar_url || user.avatar_url ? (
                           <img 
                            src={user.user_metadata?.avatar_url || user.avatar_url} 
                            alt="Profile" 
                            className="w-full h-full object-cover rounded-full"
                          />
                         ) : (
                           <FiZap size={18} className="text-zinc-400 dark:text-zinc-500 group-hover/profile:text-zinc-900 dark:group-hover/profile:text-white" />
                         )}
                      </div>
                      
                      {/* Tooltip Badge Desktop */}
                      <div className="hidden lg:block absolute left-full ml-3 opacity-0 group-hover/profile:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-black text-[8px] font-black uppercase tracking-[0.3em] text-white px-3 py-1.5 rounded-lg border border-white/10 whitespace-nowrap shadow-2xl">
                          {user.full_name || "DASHBOARD"}
                        </div>
                      </div>
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-zinc-900/5 dark:bg-zinc-900/50 hover:bg-red-600/10 text-zinc-400 dark:text-zinc-500 hover:text-red-500 transition-all border border-zinc-200 dark:border-white/5"
                      title="Logout"
                    >
                      <FiLogOut size={16} />
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/auth"
                    className="px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-lg"
                  >
                    LOGIN
                  </Link>
                )}
              </div>

              {/* MOBILE BUTTONS (Bag always visible on mobile too maybe?) */}
              {!isAdmin && (
                <Link
                  href="/cart"
                  className="lg:hidden relative p-3 rounded-full bg-zinc-900/5 dark:bg-white/10 text-zinc-900 dark:text-white transition-all border border-zinc-200 dark:border-white/5 shadow-xl"
                >
                  <FiShoppingBag size={18} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              )}

              <button
                className="lg:hidden w-12 h-12 flex items-center justify-center bg-zinc-900 dark:bg-white/10 text-white dark:text-white bg-zinc-900 rounded-full transition-all active:scale-90 shadow-xl"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <FiX size={22} className="text-white" /> : <FiMenu size={22} className="text-white" />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE DRAWER */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="absolute top-28 left-4 right-4 bg-white dark:bg-[#0B0B0B] rounded-[2.5rem] p-8 shadow-2xl border border-zinc-200 dark:border-white/10 lg:hidden flex flex-col gap-4 pointer-events-auto"
            >
              <div className="flex items-center justify-between mb-4 border-b border-zinc-100 dark:border-white/5 pb-4">
                 <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.5em]">
                    MENU
                 </span>
                 <ThemeToggle />
              </div>
              
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-3xl font-black italic uppercase tracking-tighter pb-4 border-b border-zinc-50 dark:border-white/5 flex justify-between items-center text-zinc-900 dark:text-white hover:text-red-600 transition-colors"
                >
                  {link.label}
                  <FiZap className="text-zinc-200 dark:text-zinc-800" />
                </Link>
              ))}

              {user && (
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="text-3xl font-black italic uppercase tracking-tighter pb-4 border-b border-zinc-50 dark:border-white/5 flex justify-between items-center text-red-600 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  ACCOUNT
                  <FiUser className="text-red-500/30" />
                </Link>
              )}
              
              {!user ? (
                 <Link
                  href="/auth"
                  onClick={() => setIsOpen(false)}
                  className="mt-4 py-6 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full text-center text-sm font-black uppercase tracking-widest"
                >
                  LOGIN
                </Link>
              ) : (
                <button
                  onClick={handleLogout}
                  className="mt-4 py-6 border border-red-600/30 text-red-600 rounded-full text-center text-sm font-black uppercase tracking-widest"
                >
                  LOGOUT
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
