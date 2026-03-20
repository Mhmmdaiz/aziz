"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiShield,
  FiChevronLeft,
  FiSmartphone,
  FiHome,
  FiCheckCircle,
  FiArrowRight,
  FiLock,
  FiPackage,
  FiCreditCard,
  FiExternalLink,
} from "react-icons/fi";
import { supabase } from "@/utils/supabase/client";
import { useSettings } from "@/components/providers/SettingsProvider";
import Script from "next/script";
import QRISModal from "@/components/checkout/QRISModal";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

export default function CheckoutPage() {
  const router = useRouter();
  const { settings } = useSettings();

  // --- STATES ---
  const [fetchingUser, setFetchingUser] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<any[]>([]);
  const [selectedPayment, setSelectedPayment] = useState("pakasir");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    notes: "",
  });

  const [qrisData, setQrisData] = useState({
    isOpen: false,
    qrData: "",
    orderId: "",
    amount: 0,
  });

  const isFormValid = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (
      formData.name.trim().length >= 3 &&
      emailRegex.test(formData.email) &&
      formData.phone.trim().length >= 10 &&
      formData.address.trim().length >= 10 &&
      formData.city.trim() !== "" &&
      formData.postalCode.trim() !== "" &&
      agreedToTerms
    );
  }, [formData, agreedToTerms]);

  // --- INITIALIZATION ---
  useEffect(() => {
    const initCheckout = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const savedItems = JSON.parse(
        localStorage.getItem("checkout_items") || "[]",
      );

      if (savedItems.length === 0) {
        router.push("/shop");
        return;
      }

      setCheckoutItems(savedItems);

      if (!session) {
        router.push("/auth?redirect=/checkout");
      } else {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setUser(profile);
          setFormData((prev) => ({
            ...prev,
            name: profile.name || "",
            email: session.user.email || "",
            phone: profile.phone || "",
            address: profile.address || "",
          }));
        }
      }
      setFetchingUser(false);
    };

    initCheckout();
  }, [router]);

  // --- CALCULATIONS ---
  const subtotal = useMemo(() => {
    return checkoutItems.reduce(
      (acc, item) => acc + Number(item.price) * (item.quantity || 1),
      0,
    );
  }, [checkoutItems]);

  const grandTotal = subtotal;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFinalCheckout = async () => {
    if (!isFormValid) {
      Swal.fire({
        title: "Incomplete Data",
        text: "Please complete all identity and logistics fields (Real Name, Email, Phone, and Address) to proceed with your acquisition.",
        icon: "warning",
        confirmButtonColor: "#000",
        customClass: {
          popup: "rounded-[2rem] font-mono border border-zinc-800",
        },
      });
      return;
    }

    setIsSubmitting(true);

    Swal.fire({
      title: "Initializing Bridge",
      text: "Securing transaction tunnel...",
      allowOutsideClick: false,
      background: "#000",
      color: "#fff",
      didOpen: () => Swal.showLoading(),
      customClass: { popup: "rounded-[2rem] font-mono border border-zinc-800" },
    });

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch("/api/checkout/pakasir", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          items: checkoutItems,
          customer_details: formData,
          is_preorder: localStorage.getItem("is_preorder_session") === "true",
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Deployment failed.");

      Swal.close();

      // CUSTOM QRIS UI MODAL
      if (data.qrData) {
        setQrisData({
          isOpen: true,
          qrData: data.qrData,
          orderId: data.orderId,
          amount: grandTotal,
        });
      } else if (data.paymentUrl) {
          // Fallback to redirect if no raw QR data
          localStorage.removeItem("cart");
          localStorage.removeItem("checkout_items");
          window.location.href = data.paymentUrl;
      } else {
          throw new Error("Payment data not generated by aggregator.");
      }
    } catch (err: any) {
      Swal.fire({
        title: "System Error",
        text: err.message || "Unknown error in payment bridge.",
        icon: "error",
        background: "#000",
        color: "#fff",
        customClass: {
          popup: "rounded-[2rem] font-mono border border-zinc-800",
        },
      });
      setIsSubmitting(false);
    }
  };

  if (fetchingUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono">
        <div className="text-white text-xs tracking-[0.5em] animate-pulse">
          SYNCHRONIZING...
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-500 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-24 md:pt-32 pb-24 w-full">
        {/* --- HEADER --- */}
        <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-[clamp(2.5rem,10vw,7rem)] font-black uppercase tracking-tighter leading-[0.9] md:leading-[0.85] italic break-words">
              Checkout
            </h1>
          </motion.div>

          <div className="hidden lg:flex items-center gap-12 border-l border-zinc-100 dark:border-zinc-900 pl-12">
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                Security Level
              </p>
              <div className="flex items-center gap-2 text-xs font-bold italic">
                <FiLock className="text-emerald-500" />
                ENCRYPTED
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                Node Location
              </p>
              <div className="flex items-center gap-2 text-xs font-bold italic">
                <FiExternalLink className="text-blue-500" />
                SECURE GATEWAY
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* --- LEFT: INFRASTRUCTURE --- */}
          <div className="lg:col-span-7 space-y-24">
            {/* 01. IDENTITY */}
            <section className="space-y-10">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-black italic opacity-10">
                  01
                </span>
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">
                  Identity Verification
                </h3>
                <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-900" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="group space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-4">
                    Full Identity Name{" "}
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="ENTER REAL NAME"
                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 p-6 rounded-[2rem] font-bold italic focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                  />
                </div>
                <div className="group space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-4">
                    Communication Hub{" "}
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="GMAIL / PRIMARY EMAIL"
                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 p-6 rounded-[2rem] font-bold italic focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                  />
                </div>
              </div>

              <div className="group space-y-3 pt-4">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-4">
                  Hotline Number{" "}
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="ACTIVE PHONE NUMBER"
                  className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 p-6 rounded-[2rem] font-bold italic focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                />
              </div>
            </section>

            {/* 02. LOGISTICS */}
            <section className="space-y-10">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-black italic opacity-10">
                  02
                </span>
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">
                  Logistics Coordination
                </h3>
                <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-900" />
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-4">
                    Strategic Delivery Address{" "}
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="FULL_STREET_LOCATION"
                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] font-bold italic focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all resize-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <input
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="CITY_ID"
                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 p-6 rounded-[2rem] font-bold italic focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                  />
                  <input
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="ZIP_PROTOCOL"
                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 p-6 rounded-[2rem] font-bold italic focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                  />
                </div>
              </div>
            </section>

                      </div>

          {/* --- RIGHT: MANIFEST --- */}
          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-32 space-y-8">
              <div className="bg-black dark:bg-zinc-900 text-white rounded-[3rem] p-10 md:p-12 shadow-2xl space-y-12 border border-zinc-800">
                <header className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.6em] text-zinc-500 italic">
                    Order Manifest
                  </p>
                  <h2 className="text-4xl font-black italic uppercase tracking-tighter">
                    Summary<span className="text-zinc-700">.</span>
                  </h2>
                </header>

                <div className="space-y-6 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                  {checkoutItems.map((item, idx) => (
                    <div key={idx} className="flex gap-6 group">
                      <div className="w-16 h-16 shrink-0 bg-zinc-800 rounded-2xl overflow-hidden p-1 border border-zinc-700 group-hover:border-zinc-500 transition-colors">
                        <img
                          src={
                            item.image?.startsWith("http")
                              ? item.image
                              : `${supabaseUrl}/storage/v1/object/public/products/${item.image}`
                          }
                          className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-500"
                          alt={item.name}
                        />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1 pt-1">
                        <h4 className="font-black italic uppercase text-[10px] tracking-tight truncate group-hover:text-emerald-400 transition-colors">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-3 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                          <span>QTY: {item.quantity}</span>
                          <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                          <span>IDR {Number(item.price).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-10 border-t border-zinc-800 space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      <span>Subtotal Amount</span>
                      <span className="text-white">
                        Rp {subtotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      <span>Delivery Fee</span>
                      <span className="text-emerald-500 italic tracking-tighter">
                        FREE DELIVERY
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600 italic">
                      Total Amount
                    </p>
                    <p className="text-6xl font-black italic tracking-tighter flex items-start">
                      <span className="text-xs opacity-20 mr-2 pt-2">IDR</span>
                      {grandTotal.toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-6">
                    <label className="flex items-center gap-4 cursor-pointer group bg-white/5 p-4 rounded-[1.5rem] border border-zinc-800 hover:border-zinc-700 transition-all">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                          className="peer appearance-none w-6 h-6 border-2 border-zinc-700 rounded-lg checked:bg-white checked:border-white transition-all"
                        />
                        <FiCheckCircle
                          className="absolute text-black opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
                          size={14}
                        />
                      </div>
                      <span className="text-[9px] font-bold text-zinc-500 group-hover:text-zinc-300 uppercase tracking-widest leading-tight transition-colors">
                        I AGREE TO THE TERMS AND PRIVACY POLICY
                      </span>
                    </label>

                    <button
                      onClick={handleFinalCheckout}
                      disabled={
                        fetchingUser ||
                        checkoutItems.length === 0 ||
                        isSubmitting ||
                        !isFormValid
                      }
                      className="group relative w-full py-8 bg-white text-black rounded-full font-black uppercase tracking-[0.5em] text-xs hover:bg-zinc-200 transition-all active:scale-[0.98] disabled:opacity-20 disabled:grayscale flex items-center justify-center gap-3 overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        {isSubmitting
                          ? "PROCESSING..."
                          : !isFormValid
                            ? "FORM INCOMPLETE"
                            : "PLACE ORDER"}
                        <FiArrowRight className="group-hover:translate-x-2 transition-transform duration-500" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <QRISModal
        isOpen={qrisData.isOpen}
        onClose={() => setQrisData((prev) => ({ ...prev, isOpen: false }))}
        qrData={qrisData.qrData}
        orderId={qrisData.orderId}
        amount={qrisData.amount}
        onSuccess={() => {
          localStorage.removeItem("cart");
          localStorage.removeItem("checkout_items");
          setQrisData((prev) => ({ ...prev, isOpen: false }));
          Swal.fire({
            title: "Success",
            text: "Payment verified. Initializing delivery logistics.",
            icon: "success",
            background: "#000",
            color: "#fff",
            confirmButtonColor: "#fff",
            confirmButtonText: "View Orders",
            customClass: {
              popup: "rounded-[2rem] font-mono border border-zinc-800",
              confirmButton: "text-black font-black",
            },
          }).then(() => router.push(`/admin/orders?order_id=${qrisData.orderId}`));
        }}
      />
    </main>
  );
}
