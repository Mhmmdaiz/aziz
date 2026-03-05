"use client";

import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  FiShoppingBag,
  FiMenu,
  FiX,
  FiChevronRight,
  FiLogOut,
  FiSearch,
  FiGrid,
  FiBookOpen,
  FiHome,
  FiZap,
  FiPlusCircle,
  FiClipboard,
  FiSettings,
  FiUser,
} from "react-icons/fi";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [user, setUser] = useState<any>(null);

  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScrollY.current;
    if (latest > previous && latest > 150) {
      setHidden(true);
      setIsOpen(false);
    } else if (previous - latest > 20) {
      setHidden(false);
    }
    setScrolled(latest > 30);
    lastScrollY.current = latest;
  });

  useEffect(() => {
    setMounted(true);
    const checkAuth = () => {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, [pathname]);

  if (!mounted) return null;

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setIsOpen(false);
    router.replace("/login");
  };

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const isSuperAdmin = user?.role === "superadmin";

  const userLinks = [
    { href: "/", label: "Home", icon: <FiHome /> },
    { href: "/shop", label: "Shop", icon: <FiGrid /> },
    { href: "/journal", label: "Journal", icon: <FiBookOpen /> },
    { href: "/dashboard", label: "Profil", icon: <FiUser /> },
  ];

  const adminLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: <FiZap /> },
    { href: "/admin/orders", label: "Orders", icon: <FiClipboard /> },
    { href: "/admin/journal", label: "Journal", icon: <FiPlusCircle /> },
    { href: "/admin/users", label: "user", icon: <FiClipboard /> },
  ];

  if (isSuperAdmin) {
    adminLinks.push({
      href: "/admin/settings",
      label: "Settings",
      icon: <FiSettings />,
    });
  }

  const activeLinks = isAdmin ? adminLinks : userLinks;

  return (
    <>
      {!isAdmin && (
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white/80 backdrop-blur-2xl z-[200] flex flex-col items-center justify-start pt-[15vh] px-6"
            >
              <button
                onClick={() => setIsSearchOpen(false)}
                className="absolute top-10 right-10 p-4 hover:rotate-90 transition-all"
              >
                <FiX size={32} />
              </button>
              <div className="w-full max-w-2xl">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    router.push(`/shop?search=${searchQuery}`);
                    setIsSearchOpen(false);
                  }}
                >
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search artifacts..."
                    className="w-full text-4xl md:text-6xl font-black italic tracking-tighter bg-transparent border-b-4 border-black pb-4 outline-none uppercase"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <motion.nav
        variants={{ visible: { y: 0 }, hidden: { y: "-110%" } }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="fixed top-0 left-0 right-0 z-[100] py-3 md:py-6"
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className={`relative flex items-center justify-between px-5 md:px-8 h-16 md:h-20 rounded-[1.5rem] md:rounded-[2.5rem] border transition-all duration-500 ${
              scrolled || isAdmin
                ? "bg-white/90 backdrop-blur-xl border-zinc-200/50 shadow-xl shadow-black/5"
                : "bg-white/50 backdrop-blur-md border-white/30 shadow-sm"
            }`}
          >
            {/* BRAND */}
            <div className="flex items-center gap-6 lg:gap-10">
              <Link
                href={isAdmin ? "/admin/dashboard" : "/"}
                className="group shrink-0"
              >
                <div className="text-xl font-black tracking-tighter uppercase italic text-zinc-900">
                  {isAdmin ? "ADMIN" : "CHCKT"}
                  <span className="text-blue-600">.</span>
                </div>
              </Link>

              {/* DESKTOP MENU */}
              <div className="hidden lg:flex items-center gap-1 p-1 rounded-2xl bg-zinc-950/5">
                {activeLinks.map((link) => (
                  <NavLink
                    key={link.href}
                    href={link.href}
                    active={pathname === link.href}
                    label={link.label}
                  />
                ))}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex items-center gap-2 md:gap-4">
              {!isAdmin && (
                <div className="flex items-center border-r border-zinc-200 pr-3 md:pr-4 mr-1">
                  <Link
                    href="/cart"
                    className="relative p-2.5 hover:bg-zinc-100 rounded-full transition-all"
                  >
                    <FiShoppingBag size={19} className="text-zinc-900" />
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-blue-600 text-white text-[8px] font-black flex items-center justify-center rounded-full ring-2 ring-white">
                      0
                    </span>
                  </Link>
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2.5 hover:bg-zinc-100 rounded-full text-zinc-900"
                  >
                    <FiSearch size={19} />
                  </button>
                </div>
              )}

              {user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-[7px] font-black uppercase tracking-[0.2em] text-zinc-400">
                      {user.role}
                    </span>
                    <span className="text-[10px] font-black uppercase italic text-zinc-900">
                      {user.name}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2.5 rounded-full text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    <FiLogOut size={18} />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-6 py-2.5 bg-black text-white rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all"
                >
                  Access
                </Link>
              )}

              <button
                className="lg:hidden w-10 h-10 flex items-center justify-center bg-black text-white rounded-full"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <FiX size={18} /> : <FiMenu size={18} />}
              </button>
            </div>
          </motion.div>
        </div>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {isOpen && (
            <div className="absolute top-full left-0 right-0 px-4 mt-2 lg:hidden z-[101]">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="bg-white border border-zinc-200 rounded-[2rem] p-6 shadow-2xl overflow-y-auto max-h-[80vh]"
              >
                <div className="flex flex-col gap-1">
                  {activeLinks.map((link) => (
                    <MobileLink
                      key={link.href}
                      href={link.href}
                      label={link.label}
                      onClick={() => setIsOpen(false)}
                      icon={link.icon}
                    />
                  ))}
                  <hr className="my-4 border-zinc-50" />
                  <button
                    onClick={handleLogout}
                    className="w-full p-4 bg-red-50 text-red-500 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 italic"
                  >
                    <FiLogOut /> Secure_Logout
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}

function NavLink({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  const isAddButton = label.toLowerCase() === "add";

  return (
    <Link href={href} className="relative px-5 py-2 group">
      <div
        className={`relative z-10 text-[9px] font-black uppercase tracking-widest transition-all duration-300 
        ${isAddButton ? "text-blue-600" : active ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-900"}`}
      >
        {label}
      </div>
      {active && (
        <motion.div
          layoutId="nav-pill"
          className="absolute inset-0 bg-white shadow-sm ring-1 ring-zinc-200/50 rounded-xl z-0"
          transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
        />
      )}
    </Link>
  );
}

function MobileLink({ href, label, onClick, icon }: any) {
  const isAddButton = label.toLowerCase() === "add";

  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-50 transition-colors group"
    >
      <div className="flex items-center gap-4">
        <span
          className={`${isAddButton ? "text-blue-600" : "text-zinc-300 group-hover:text-blue-600"}`}
        >
          {icon}
        </span>
        <span
          className={`text-lg font-black uppercase italic tracking-tighter ${isAddButton ? "text-blue-600" : "text-zinc-900"}`}
        >
          {label}
        </span>
      </div>
      <FiChevronRight className="text-zinc-200" />
    </Link>
  );
}
