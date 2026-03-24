"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
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
      selectedPayment !== ""
    );
  }, [formData, agreedToTerms, selectedPayment]);

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

  const shippingCost = 0; // Free for now
  const grandTotal = subtotal + shippingCost;

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
            is_preorder: localStorage.getItem("is_preorder_session") === "true",
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Payment failed.");

        Swal.close();

        if (data.paymentUrl) {
          localStorage.removeItem("cart");
          localStorage.removeItem("checkout_items");
          window.location.href = data.paymentUrl;
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
      <div className="min-h-screen bg-white flex items-center justify-center font-sans">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col md:flex-row pt-20 md:pt-0">
      <div className="w-full md:w-[55%] xl:w-[60%] order-2 md:order-1 flex justify-end bg-white">
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
                <h2 className="text-xl font-medium text-black">Contact</h2>
                <div className="text-sm">
                  <span className="text-zinc-500 mr-2">Account email</span>
                </div>
              </div>
              <div className="p-4 border border-zinc-300 bg-zinc-50 rounded-lg flex flex-col gap-1">
                <span className="text-sm font-medium">{formData.email}</span>
                <span className="text-xs text-zinc-500">You are securely logged in.</span>
              </div>
            </section>

            {/* Billing / Shipping Address */}
            <section className="space-y-4">
              <h2 className="text-xl font-medium text-black">Delivery</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <div className="relative border border-zinc-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-600 transition-shadow">
                    <label className="text-[11px] text-zinc-500 font-medium absolute top-1.5 left-3">Country/Region</label>
                    <select disabled className="w-full pt-6 pb-2 px-3 text-sm bg-transparent outline-none appearance-none cursor-not-allowed text-zinc-700">
                      <option>Indonesia</option>
                    </select>
                  </div>
                </div>

                <div className="relative border border-zinc-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-600 transition-shadow">
                  <label className="text-[11px] text-zinc-500 font-medium absolute top-1.5 left-3">First & Last name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pt-6 pb-2 px-3 text-sm bg-transparent outline-none"
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

                <div className="md:col-span-2 relative border border-zinc-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-600 transition-shadow">
                  <label className="text-[11px] text-zinc-500 font-medium absolute top-1.5 left-3">Address</label>
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full pt-6 pb-2 px-3 text-sm bg-transparent outline-none"
                    placeholder="Street name, building, apartment"
                  />
                </div>

                <div className="relative border border-zinc-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-600 transition-shadow">
                  <label className="text-[11px] text-zinc-500 font-medium absolute top-1.5 left-3">City</label>
                  <input
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full pt-6 pb-2 px-3 text-sm bg-transparent outline-none"
                    placeholder="City"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative border border-zinc-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-600 transition-shadow">
                    <label className="text-[11px] text-zinc-500 font-medium absolute top-1.5 left-3">Province</label>
                    <select
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
                      className="w-full pt-6 pb-2 px-3 text-sm bg-transparent outline-none appearance-none"
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
                  <div className="relative border border-zinc-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-600 transition-shadow">
                    <label className="text-[11px] text-zinc-500 font-medium absolute top-1.5 left-3">Postal code</label>
                    <input
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full pt-6 pb-2 px-3 text-sm bg-transparent outline-none"
                      placeholder="12345"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Shipping Method */}
            <section className="space-y-4">
              <h2 className="text-xl font-medium text-black">Shipping method</h2>
              <div className="border border-zinc-300 rounded-lg bg-zinc-50 p-4 flex justify-between items-center cursor-pointer hover:border-blue-600 transition-colors">
                <div className="space-y-1">
                  <p className="font-medium text-sm text-black">JNE REGULER (Default)</p>
                  <p className="text-xs text-zinc-500">2 to 5 business days</p>
                </div>
                <span className="font-medium text-sm text-black">FREE</span>
              </div>
            </section>

            {/* Payment Method */}
            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-medium text-black inline-block">Payment</h2>
                <p className="text-xs text-zinc-500 mt-1">All transactions are secure and encrypted.</p>
              </div>

              <div className="border border-zinc-300 rounded-lg overflow-hidden bg-white">
                
                {/* DOKU Information */}
                {dokuEnabled ? (
                  <div className="p-8 text-center flex flex-col items-center justify-center gap-4 bg-zinc-50/50">
                    <div className="flex items-center gap-4 text-zinc-400">
                      <FiCreditCard className="w-8 h-8" />
                      <div className="h-8 w-px bg-zinc-300"></div>
                      <div className="flex gap-2">
                        <div className="px-2 py-1 border border-zinc-200 bg-white rounded text-[9px] font-bold text-zinc-500 tracking-wide uppercase">QRIS</div>
                        <div className="px-2 py-1 border border-zinc-200 bg-white rounded text-[9px] font-bold text-zinc-500 tracking-wide uppercase">Virtual Acct</div>
                        <div className="px-2 py-1 border border-zinc-200 bg-white rounded text-[9px] font-bold text-zinc-500 tracking-wide uppercase">Cards</div>
                      </div>
                    </div>
                    <div className="space-y-1 mt-2 max-w-sm">
                       <p className="font-medium text-black text-sm">Online Payment via DOKU</p>
                       <p className="text-sm text-zinc-500">Setelah menekan "Pay now", Anda akan diarahkan ke halaman DOKU untuk menyelesaikan pembayaran dengan aman.</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-sm text-red-500 font-medium">Gateway pembayaran sedang tidak tersedia.</p>
                  </div>
                )}

              </div>
            </section>

            {/* Action Buttons */}
            <div className="pt-6">
              <button
                onClick={handleFinalCheckout}
                disabled={isSubmitting || !isFormValid}
                className="w-full h-14 bg-[#1d4ed8] hover:bg-blue-800 disabled:bg-blue-300 disabled:cursor-not-allowed text-white rounded-lg font-medium text-lg transition-colors flex items-center justify-center"
              >
                {isSubmitting ? "Processing..." : "Pay now"}
              </button>
            </div>

            <div className="flex justify-start gap-4 text-xs text-blue-600 pt-4 border-t border-zinc-200">
              <a href="/faq" className="hover:underline">Refund policy</a>
              <a href="/privacy" className="hover:underline">Privacy policy</a>
              <a href="/terms" className="hover:underline">Terms of service</a>
            </div>

          </form>
        </div>
      </div>

      {/* Right Column: Order Summary */}
      <div className="w-full md:w-[45%] xl:w-[40%] bg-zinc-50 border-l border-zinc-200 order-1 md:order-2">
        <div className="w-full max-w-lg px-6 lg:px-12 pt-10 pb-10 md:pt-32 lg:pb-16 sticky top-20 md:top-28">
          
          <div className="space-y-6">
            {checkoutItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-white border border-zinc-200 rounded-lg overflow-hidden flex items-center justify-center">
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
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-zinc-500 text-white rounded-full text-[11px] font-medium flex items-center justify-center">
                    {item.quantity || 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-black truncate">{item.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{item.size !== "null" ? item.size : ""}</p>
                </div>
                <div className="text-sm font-medium text-black">
                  Rp {(item.price * (item.quantity || 1)).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex justify-between items-center text-sm text-zinc-600">
              <p>Subtotal</p>
              <p className="font-medium">Rp {subtotal.toLocaleString()}</p>
            </div>
            <div className="flex justify-between items-center text-sm text-zinc-600">
              <p>Shipping</p>
              <p className="font-medium text-xs">FREE</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-zinc-200">
            <div className="flex justify-between items-center">
              <p className="text-base text-zinc-900">Total</p>
              <p className="flex items-baseline gap-2">
                <span className="text-xs text-zinc-500">IDR</span>
                <span className="text-2xl font-semibold text-black">Rp {grandTotal.toLocaleString()}</span>
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
