"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiLock,
  FiChevronLeft,
  FiCheckCircle,
  FiCreditCard,
  FiArrowRight,
} from "react-icons/fi";
import { supabase } from "@/utils/supabase/client";
import { useSettings } from "@/components/providers/SettingsProvider";
import { validatePreOrderEligibility } from "@/utils/preorder";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

export default function CheckoutPage() {
  const router = useRouter();
  const { settings } = useSettings();

  // --- SETTINGS DATA ---
  const paymentSettings = settings?.payment;
  const dokuConfig = paymentSettings?.gateways?.doku;
  const dokuEnabled = dokuConfig?.enabled;

  // --- STATES ---
  const [fetchingUser, setFetchingUser] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<any[]>([]);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(true); // Default to true for smoother UX
  const [user, setUser] = useState<any>(null);
  const [selectedShipping, setSelectedShipping] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    province: "West Java",
  });

  const isFormValid = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (
      formData.name.trim().length >= 3 &&
      emailRegex.test(formData.email) &&
      formData.phone.trim().length >= 8 &&
      formData.address.trim().length >= 10 &&
      formData.city.trim() !== "" &&
      formData.postalCode.trim() !== "" &&
      agreedToTerms &&
      selectedPayment !== "" &&
      selectedShipping !== null
    );
  }, [formData, agreedToTerms, selectedPayment, selectedShipping]);

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

      // --- VALIDATE PO ELIGIBILITY ---
      for (const item of savedItems) {
        if (item.is_preorder) {
          const check = await validatePreOrderEligibility(item.id);
          if (!check.valid) {
            Swal.fire({
              title: "Pre-Order Unavailable",
              text: check.message || "This product is no longer available for Pre-Order.",
              icon: "error",
              confirmButtonColor: "#1d4ed8"
            }).then(() => {
              router.push("/shop");
            });
            return;
          }
        }
      }

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

  // Set default shipping when settings load
  useEffect(() => {
    if (settings?.shipping && !selectedShipping) {
      const s = settings.shipping;
      if (s.fee_mode === "flat") {
        setSelectedShipping({ name: "Flat Rate Shipping", price: Number(s.flat_rate || 0), eta: "Regular" });
      } else if (s.fee_mode === "custom" && s.custom_methods?.length > 0) {
        setSelectedShipping(s.custom_methods[0]);
      }
    }
  }, [settings, selectedShipping]);

  useEffect(() => {
    if (!selectedPayment) {
      if (dokuEnabled) setSelectedPayment("doku");
    }
  }, [dokuEnabled, selectedPayment]);

  // --- CALCULATIONS ---
  const subtotal = useMemo(() => {
    return checkoutItems.reduce(
      (acc, item) => acc + Number(item.price) * (item.quantity || 1),
      0,
    );
  }, [checkoutItems]);

  const shippingCost = selectedShipping?.price || 0;
  const grandTotal = subtotal + Number(shippingCost);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFinalCheckout = async () => {
    if (!isFormValid) {
      Swal.fire({
        title: "Incomplete Data",
        text: "Please complete all fields to proceed with your order.",
        icon: "warning",
        confirmButtonColor: "#1d4ed8",
      });
      return;
    }

    setIsSubmitting(true);

    Swal.fire({
      title: "Processing Order",
      text: "Securing your transaction...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    // RE-VALIDATE ELIGIBILITY BEFORE PAYMENT
    for (const item of checkoutItems) {
      if (item.is_preorder) {
        const check = await validatePreOrderEligibility(item.id);
        if (!check.valid) {
          Swal.fire({
            title: "Pre-Order expired/Sold out",
            text: `Sorry, the stock or time for ${item.name} just expired.`,
            icon: "error"
          });
          setIsSubmitting(false);
          return;
        }
      }
    }


    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (selectedPayment === "doku") {
        // DOKU CHECKOUT
        const response = await fetch("/api/checkout/doku", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          credentials: "include",
          body: JSON.stringify({
            items: checkoutItems,
            customer_details: formData,
            shipping_cost: shippingCost,
            shipping_method: selectedShipping?.name,
            is_preorder: localStorage.getItem("is_preorder_session") === "true",
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Payment failed.");

        Swal.close();

        if (data.paymentUrl) {
          localStorage.removeItem("cart");
          localStorage.removeItem("checkout_items");
          
          // Trigger DOKU Modal
          if ((window as any).loadJokulCheckout) {
            (window as any).loadJokulCheckout(data.paymentUrl);
          } else {
            // Fallback to redirect if script failed to load
            window.location.href = data.paymentUrl;
          }
        } else {
          throw new Error("Payment link not generated.");
        }
      }

    } catch (err: any) {
      Swal.fire({
        title: "System Error",
        text: err.message || "Unknown error occurred.",
        icon: "error",
      });
      setIsSubmitting(false);
    }
  };

  if (fetchingUser) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#030303] flex items-center justify-center font-sans transition-colors duration-500">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      {/* Load DOKU Modal Script */}
      <Script 
        src="https://connect.doku.com/jokul-checkout-js/v1/jokul-checkout-1.0.0.js"
        strategy="afterInteractive"
      />

      <main className="min-h-screen bg-white dark:bg-[#030303] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col md:flex-row pt-20 md:pt-0 transition-colors duration-500">
      <div className="w-full md:w-[55%] xl:w-[60%] order-2 md:order-1 flex justify-end bg-white dark:bg-[#030303] transition-colors duration-500">
        <div className="w-full max-w-2xl px-6 lg:px-12 pt-10 pb-10 md:pt-32 lg:pb-16">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-black transition-colors mb-10"
          >
            <FiChevronLeft /> Return to store
          </button>

          <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
            
            {/* Contact Section */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium text-black dark:text-white">Contact</h2>
                <div className="text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400 mr-2">Account email</span>
                </div>
              </div>
              <div className="p-4 border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl flex flex-col gap-1">
                <span className="text-sm font-medium text-zinc-900 dark:text-white">{formData.email}</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">You are securely logged in.</span>
              </div>
            </section>

            {/* Billing / Shipping Address */}
            <section className="space-y-4">
              <h2 className="text-xl font-medium text-black dark:text-white">Delivery</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <div className="relative border border-zinc-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 focus-within:ring-2 focus-within:ring-blue-600 transition-all">
                    <label className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium absolute top-1.5 left-4">Country/Region</label>
                    <select disabled className="w-full pt-6 pb-2 px-4 text-sm bg-transparent outline-none appearance-none cursor-not-allowed text-zinc-700 dark:text-zinc-300">
                      <option>Indonesia</option>
                    </select>
                  </div>
                </div>

                <div className="relative border border-zinc-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 focus-within:ring-2 focus-within:ring-blue-600 transition-all">
                  <label className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium absolute top-1.5 left-4">First & Last name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pt-6 pb-2 px-4 text-sm bg-transparent outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                    placeholder="John Doe"
                  />
                </div>

                <div className="relative border border-zinc-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-600 transition-shadow">
                  <label className="text-[11px] text-zinc-500 font-medium absolute top-1.5 left-3">Phone</label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pt-6 pb-2 px-3 text-sm bg-transparent outline-none"
                    placeholder="0812345678"
                  />
                </div>

                <div className="md:col-span-2 relative border border-zinc-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 focus-within:ring-2 focus-within:ring-blue-600 transition-all">
                  <label className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium absolute top-1.5 left-4">Address</label>
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full pt-6 pb-2 px-4 text-sm bg-transparent outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                    placeholder="Street name, building, apartment"
                  />
                </div>

                <div className="relative border border-zinc-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 focus-within:ring-2 focus-within:ring-blue-600 transition-all">
                  <label className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium absolute top-1.5 left-4">City</label>
                  <input
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full pt-6 pb-2 px-4 text-sm bg-transparent outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                    placeholder="City"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative border border-zinc-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 focus-within:ring-2 focus-within:ring-blue-600 transition-all">
                    <label className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium absolute top-1.5 left-4">Province</label>
                    <select
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
                      className="w-full pt-6 pb-2 px-4 text-sm bg-transparent outline-none appearance-none text-zinc-900 dark:text-white"
                    >
                      <option value="West Java">West Java</option>
                      <option value="Jakarta">Jakarta</option>
                      <option value="Central Java">Central Java</option>
                      <option value="East Java">East Java</option>
                      <option value="Banten">Banten</option>
                      <option value="Bali">Bali</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="relative border border-zinc-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 focus-within:ring-2 focus-within:ring-blue-600 transition-all">
                    <label className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium absolute top-1.5 left-4">Postal code</label>
                    <input
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full pt-6 pb-2 px-4 text-sm bg-transparent outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                      placeholder="12345"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Shipping Method */}
            <section className="space-y-4">
              <h2 className="text-xl font-medium text-black dark:text-white">Shipping method</h2>
              <div className="space-y-2">
                {settings?.shipping?.fee_mode === "custom" && settings.shipping.custom_methods?.map((method: any) => (
                   <div 
                  key={method.id}
                  onClick={() => setSelectedShipping(method)}
                  className={`border rounded-xl p-4 flex justify-between items-center cursor-pointer transition-all duration-300 ${
                    selectedShipping?.id === method.id 
                      ? "border-blue-600 bg-blue-50/50 dark:bg-blue-900/10 ring-1 ring-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.1)]" 
                      : "border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-white/20"
                  }`}
                >
                  <div className="space-y-0.5">
                    <p className="font-medium text-sm text-black dark:text-white transition-colors">{method.name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 transition-colors">{method.eta}</p>
                  </div>
                  <span className="font-medium text-sm text-black dark:text-white transition-colors">
                    {method.price > 0 ? `Rp ${Number(method.price).toLocaleString()}` : "FREE"}
                  </span>
                </div>
                ))}

                {settings?.shipping?.fee_mode === "flat" && (
                  <div 
                    className="border border-blue-600 bg-blue-50/50 dark:bg-blue-900/10 ring-1 ring-blue-600 rounded-xl p-4 flex justify-between items-center cursor-default transition-all duration-300 shadow-[0_0_15px_rgba(37,99,235,0.1)]"
                  >
                    <div className="space-y-0.5">
                      <p className="font-medium text-sm text-black dark:text-white">Flat Rate Shipping</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Regular Shipping</p>
                    </div>
                    <span className="font-medium text-sm text-black dark:text-white">
                      Rp {Number(settings.shipping.flat_rate || 0).toLocaleString()}
                    </span>
                  </div>
                )}

                {!settings?.shipping && (
                    <div className="animate-pulse border border-zinc-200 rounded-lg p-4 bg-zinc-50 flex justify-between items-center">
                        <div className="h-4 w-32 bg-zinc-200 rounded"></div>
                        <div className="h-4 w-12 bg-zinc-200 rounded"></div>
                    </div>
                )}
              </div>
            </section>

            {/* Payment Method */}
            <div className="pt-2 border-t border-zinc-100 italic mb-[-20px]">
               <p className="text-[10px] text-zinc-400 text-center">All transactions are processed securely via DOKU encryption.</p>
            </div>

            {/* Action Buttons */}
            <div className="pt-6">
              <button
                onClick={handleFinalCheckout}
                disabled={isSubmitting || !isFormValid}
                className="w-full h-16 bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-red-600 dark:hover:bg-red-600 hover:text-white disabled:bg-zinc-200 dark:disabled:bg-white/5 disabled:text-zinc-400 disabled:cursor-not-allowed rounded-full font-black uppercase text-[11px] tracking-[0.3em] transition-all duration-500 flex items-center justify-center gap-3 shadow-2xl group active:scale-[0.98]"
              >
                {isSubmitting ? "PROCESSING ENGINE..." : (
                  <>
                    PAY AND SECURE ORDER <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>

            <div className="flex justify-start gap-6 text-xs text-blue-600 dark:text-blue-400 pt-6 border-t border-zinc-200 dark:border-white/10">
              <a href="/faq" className="hover:text-blue-800 dark:hover:text-blue-200 transition-colors uppercase tracking-widest font-black text-[9px]">Refund policy</a>
              <a href="/privacy" className="hover:text-blue-800 dark:hover:text-blue-200 transition-colors uppercase tracking-widest font-black text-[9px]">Privacy policy</a>
              <a href="/terms" className="hover:text-blue-800 dark:hover:text-blue-200 transition-colors uppercase tracking-widest font-black text-[9px]">Terms of service</a>
            </div>

          </form>
        </div>
      </div>

      {/* Right Column: Order Summary */}
      <div className="w-full md:w-[45%] xl:w-[40%] bg-zinc-50 dark:bg-[#070707] border-l border-zinc-200 dark:border-white/10 order-1 md:order-2 transition-colors duration-500">
        <div className="w-full max-w-lg px-6 lg:px-12 pt-10 pb-10 md:pt-32 lg:pb-16 sticky top-20 md:top-28">
          
          <div className="space-y-6">
            {checkoutItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-lg overflow-hidden flex items-center justify-center">
                    <img
                      src={
                        item.image?.startsWith("http")
                          ? item.image
                          : `${supabaseUrl}/storage/v1/object/public/products/${item.image}`
                      }
                      className="w-full h-full object-cover"
                      alt={item.name}
                    />
                  </div>
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-zinc-500 dark:bg-zinc-700 text-white rounded-full text-[11px] font-medium flex items-center justify-center">
                    {item.quantity || 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-black dark:text-white truncate">{item.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{item.size !== "null" ? item.size : ""}</p>
                </div>
                <div className="text-sm font-medium text-black dark:text-white">
                  Rp {(item.price * (item.quantity || 1)).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 space-y-4 border-t border-zinc-200 dark:border-white/10 pt-8">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
              <p>Subtotal Vault</p>
              <p className="text-zinc-900 dark:text-white">Rp {subtotal.toLocaleString()}</p>
            </div>
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
              <p>Shipping Protocol ({selectedShipping?.name || "Regular"})</p>
              <p className="text-zinc-900 dark:text-white">
                {shippingCost > 0 ? `Rp ${Number(shippingCost).toLocaleString()}` : "FREE"}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-white/10">
            <div className="flex justify-between items-center">
              <p className="text-base text-zinc-900 dark:text-white">Total</p>
              <p className="flex items-baseline gap-2">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">IDR</span>
                <span className="text-2xl font-semibold text-black dark:text-white">Rp {grandTotal.toLocaleString()}</span>
              </p>
            </div>
          </div>

        </div>
      </div>
      </main>
    </>
  );
}
