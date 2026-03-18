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

  const {
    cart,
    cartCount,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
  } = useCart();
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
    localStorage.setItem("checkout_items", JSON.stringify(cart));
    setIsCartOpen(false);
    router.push("/checkout");
  };

  const isAdmin =
    user?.role?.toLowerCase() === "admin" ||
    user?.role?.toLowerCase() === "superadmin";

  const activeLinks = isAdmin
    ? [
        { href: "/admin/dashboard", label: "Dashboard", icon: <FiZap /> },
        { href: "/admin/settings", label: "Settings", icon: <FiSettings /> },
        { href: "/admin/landing", label: "Landing", icon: <FiEdit /> },
      ]
    : [
        { href: "/", label: "Home", icon: <FiHome /> },
        { href: "/shop", label: "Shop", icon: <FiGrid /> },
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
              scrolled || isAdmin || isCartOpen
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
                <button
                  onClick={() => setIsCartOpen(true)}
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
                </button>
              )}

              {user ? (
                <div className="flex items-center gap-3 ml-1 md:ml-2">
                  <div className="hidden md:flex flex-col items-end leading-none">
                    <span className="text-[7px] font-black uppercase tracking-[0.2em] text-blue-600 mb-0.5">
                      {user.role}
                    </span>
                    <span className="text-[10px] font-black uppercase italic text-zinc-900 dark:text-zinc-100">
                      {user.full_name || "Auth_User"}
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
                  TERMINATE_SESSION{" "}
                  <FiLogOut className="text-zinc-200 dark:text-zinc-700" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* CART DRAWER OVERLAY */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-card z-[210] shadow-2xl flex flex-col border-l border-border"
            >
              {/* Drawer Header */}
              <div className="p-6 md:p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-900 dark:text-white">
                    Vault_Cart
                  </h3>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 mt-1">
                    {cartCount} Items_Encoded
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 transition-all"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-5 md:p-8 no-scrollbar">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-16 md:w-20 h-16 md:h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
                      <FiShoppingBag
                        size={28}
                        className="text-zinc-200 md:w-[32px]"
                      />
                    </div>
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-zinc-300 italic">
                      Empty_Archive_Vault
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 md:space-y-6">
                    {cart.map((item) => (
                      <div
                        key={item.cartId}
                        className="flex gap-4 md:gap-6 p-3 md:p-4 rounded-2xl md:rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 group"
                      >
                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white dark:bg-zinc-800 shrink-0 shadow-sm">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-[13px] font-black italic uppercase tracking-tight text-zinc-900 dark:text-zinc-100 line-clamp-1">
                                {item.name}
                              </h4>
                              <button
                                onClick={() => removeItem(item.cartId)}
                                className="text-zinc-300 hover:text-red-500 transition-colors"
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mt-1">
                              Size: {item.size || "Default"}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-100 dark:border-zinc-700 shadow-sm">
                              <button
                                onClick={() => updateQuantity(item.cartId, -1)}
                                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                              >
                                <FiMinus size={12} />
                              </button>
                              <span className="text-xs font-black w-4 text-center text-zinc-900 dark:text-zinc-100">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.cartId, 1)}
                                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                              >
                                <FiPlus size={12} />
                              </button>
                            </div>
                            <span className="text-[12px] font-black text-zinc-900 dark:text-zinc-100">
                              IDR{" "}
                              {(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              {cart.length > 0 && (
                <div className="p-6 md:p-8 border-t border-border space-y-5 md:space-y-6 bg-card">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-zinc-400">
                      Total_Valuation
                    </span>
                    <span className="text-xl md:text-2xl font-black italic tracking-tighter text-zinc-900 dark:text-zinc-100 leading-none">
                      IDR {cartTotal.toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full py-5 md:py-6 bg-zinc-950 text-white rounded-[1.5rem] md:rounded-[2rem] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-[10px] md:text-[11px] shadow-2xl shadow-black/10 hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 md:gap-4 group"
                  >
                    Initiate_Deployment{" "}
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
