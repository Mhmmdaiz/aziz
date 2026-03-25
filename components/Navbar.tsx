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
   FiSearch,
   FiZap,
   FiUser,
   FiArrowRight,
 } from "react-icons/fi";
import { useSettings } from "@/components/providers/SettingsProvider";
import { useCart } from "@/components/providers/CartProvider";
import { ThemeToggle } from "./ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, setIsCartOpen, setIsSearchOpen } = useCart();
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
            className={`relative flex items-center justify-between px-6 md:px-10 h-16 md:h-20 rounded-full transition-all duration-700
              ${isScrolled
                ? "border border-zinc-200/20 dark:border-white/20 bg-white dark:bg-[#030303] backdrop-blur-xl scale-[0.98] md:scale-100 shadow-2xl glass"
                : "border-transparent bg-transparent backdrop-blur-none shadow-none"
              }
            `}
          >
            {/* LOGO */}
             <div className="flex items-center gap-8">
               <Link href={isAdmin ? "/admin/dashboard" : "/"} className="group outline-none">
                 <div className="flex items-center gap-2">
                   <span className={`text-base md:text-xl font-black tracking-tighter uppercase italic flex items-center gap-2 transition-colors duration-500
                     ${isScrolled ? "text-zinc-900 dark:text-white" : "text-white"}
                   `}>
                     {isAdmin ? "DAEMON ADMIN" : storeName}
                   </span>
                   <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                 </div>
               </Link>

              {/* DESKTOP NAV */}
              <div className={`hidden lg:flex items-center gap-1 p-1 rounded-full border transition-all duration-500
                ${isScrolled 
                  ? "bg-zinc-900/5 dark:bg-white/5 border-zinc-200/10 dark:border-white/5" 
                  : "bg-white/5 border-white/5"}
              `}>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="relative px-6 py-2 group overflow-hidden rounded-full"
                  >
                    <span className={`relative z-10 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500
                      ${!isScrolled 
                        ? (pathname === link.href ? "text-white" : "text-white/60 group-hover:text-white")
                        : (pathname === link.href ? "text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-200")
                      }
                    `}>
                      {link.label}
                    </span>
                    {pathname === link.href && (
                      <motion.div
                        layoutId="nav-pill-premium"
                        className="absolute inset-0 bg-zinc-800 dark:bg-zinc-100 shadow-sm z-0"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* RIGHT ACTIONS (Desktop) */}
             <div className="flex items-center gap-5">
               <div className="hidden lg:flex items-center gap-6">
                 {/* SEARCH */}
                 <button 
                   onClick={() => setIsSearchOpen(true)}
                   className={`p-1 transition-colors duration-500 ${isScrolled ? "text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white" : "text-white/60 hover:text-white"}`}
                 >
                   <FiSearch size={20} />
                 </button>
 
                 {/* CART (Simplified) */}
                 <div 
                   onClick={() => setIsCartOpen(true)}
                     className={`relative p-1 transition-colors duration-500 cursor-pointer group ${isScrolled ? "text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white" : "text-white/60 hover:text-white"}`}
                   >
                     <FiShoppingBag size={20} />
                     {cartCount > 0 && (
                       <span className="absolute -top-1 -right-2 w-4 h-4 bg-red-600 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900">
                         {cartCount}
                       </span>
                     )}
                   </div>
                 
                 <ThemeToggle isTransparent={!isScrolled} />
 
                 {user ? (
                   <div className="flex items-center gap-5 ml-2">
                     <Link 
                       href="/dashboard" 
                       className="group/profile relative flex items-center transition-all duration-500"
                     >
                       <div className="w-9 h-9 rounded-full border border-zinc-200/20 dark:border-white/10 overflow-hidden group-hover/profile:border-red-600 transition-all bg-white/10 dark:bg-zinc-100 flex items-center justify-center p-0.5">
                          {user.user_metadata?.avatar_url || user.avatar_url ? (
                            <img 
                             src={user.user_metadata?.avatar_url || user.avatar_url} 
                             alt="Profile" 
                             className="w-full h-full object-cover rounded-full"
                           />
                          ) : (
                            <FiZap size={16} className="text-zinc-400 dark:text-zinc-500" />
                          )}
                       </div>
                     </Link>
                     
                       <button
                         onClick={handleLogout}
                         className="p-1 text-zinc-400 dark:text-zinc-500 hover:text-red-500 transition-all"
                         title="Logout"
                       >
                       <FiLogOut size={18} />
                     </button>
                   </div>
                 ) : (
                     <Link
                       href="/auth"
                       className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-lg
                         ${isScrolled
                           ? "bg-zinc-900 dark:bg-white text-white dark:text-black"
                           : "bg-white text-black"
                         }
                       `}
                     >
                     LOGIN
                   </Link>
                 )}
               </div>

              {/* MOBILE BUTTONS */}
               <div className="flex lg:hidden items-center gap-4 mr-2">
                 <button 
                   onClick={() => setIsSearchOpen(true)}
                   className={isScrolled ? "text-zinc-900 dark:text-white" : "text-white"}
                 >
                   <FiSearch size={20} />
                 </button>
                 <div 
                   onClick={() => setIsCartOpen(true)}
                   className={`relative cursor-pointer ${isScrolled ? "text-zinc-900 dark:text-white" : "text-white"}`}
                 >
                     <FiShoppingBag size={20} />
                     {cartCount > 0 && (
                       <span className="absolute -top-1 -right-2 w-4 h-4 bg-red-600 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900">
                         {cartCount}
                       </span>
                     )}
                   </div>
               </div>

              <button
                className={`lg:hidden w-12 h-12 flex items-center justify-center rounded-full transition-all active:scale-90
                  ${isScrolled
                    ? "bg-white dark:bg-[#030303] text-zinc-900 dark:text-white border border-zinc-200/10 dark:border-white/5 shadow-xl"
                    : "bg-transparent text-white"
                  }
                `}
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <FiX size={22} /> : <FiMenu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE DRAWER */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 bg-[#0B0B0B] dark:bg-white z-[160] p-8 lg:hidden flex flex-col pointer-events-auto"
            >
              <div className="flex items-center justify-between mb-8 border-b border-zinc-100/10 dark:border-black/5 pb-6">
                <Link href="/" onClick={() => setIsOpen(false)}>
                  <span className="text-xl font-black tracking-tighter uppercase italic text-white dark:text-black">
                    {storeName}
                  </span>
                </Link>
                <div className="flex items-center gap-4">
                  <ThemeToggle />
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-white dark:text-black hover:bg-white/5 dark:hover:bg-black/5 rounded-full transition-colors"
                  >
                    <FiX size={28} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col justify-center space-y-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-5xl font-black italic uppercase tracking-tighter flex justify-between items-center text-white dark:text-black hover:text-red-600 transition-colors group"
                  >
                    {link.label}
                    <FiZap size={32} className="text-zinc-800 dark:text-zinc-200 group-hover:text-red-600 transition-colors" />
                  </Link>
                ))}

                {user && (
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="text-5xl font-black italic uppercase tracking-tighter flex justify-between items-center text-red-600 hover:text-white dark:hover:text-black transition-colors group"
                  >
                    ACCOUNT
                    <FiUser size={32} className="text-red-500/30 group-hover:text-red-600" />
                  </Link>
                )}
              </div>
              
              <div className="mt-auto pt-8 border-t border-white/10 dark:border-black/10">
                {!user ? (
                   <Link
                    href="/auth"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-6 bg-white dark:bg-zinc-900 text-black dark:text-white rounded-2xl text-center text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3"
                  >
                    LOGIN TO DAEMONIUM
                    <FiArrowRight />
                  </Link>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="w-full py-6 border border-red-600/30 text-red-600 rounded-2xl text-center text-sm font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                  >
                    LOGOUT FROM SESSION
                  </button>
                )}
                <p className="text-center text-[10px] text-zinc-500 mt-6 uppercase tracking-[0.4em]">
                  Architectural Precision • Brutalist Aesthetic
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
