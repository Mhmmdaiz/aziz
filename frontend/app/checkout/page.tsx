"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMapPin,
  FiShield,
  FiChevronLeft,
  FiSmartphone,
  FiHome,
  FiCheckCircle,
  FiLock,
  FiPackage,
  FiArrowRight,
} from "react-icons/fi";

const BASE_URL = "http://127.0.0.1:8000";

export default function CheckoutPage() {
  const router = useRouter();

  // --- STATES ---
  const [fetchingUser, setFetchingUser] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<any[]>([]);
  const [selectedPayment, setSelectedPayment] = useState("midtrans");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    notes: "",
  });

  // --- INITIALIZATION ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedItems = JSON.parse(
      localStorage.getItem("checkout_items") || "[]",
    );

    if (savedItems.length === 0) {
      router.push("/cart");
      return;
    }

    setCheckoutItems(savedItems);

    if (!token) {
      router.push("/login");
    } else {
      fetchUserProfile(token);
    }
  }, [router]);

  const fetchUserProfile = async (token: string) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData((prev) => ({
        ...prev,
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
      }));
    } catch (err) {
      console.error("Identity_Fetch_Failed");
    } finally {
      setFetchingUser(false);
    }
  };

  // --- CALCULATIONS ---
  const subtotal = useMemo(() => {
    return checkoutItems.reduce(
      (acc, item) => acc + Number(item.price) * (item.quantity || 1),
      0,
    );
  }, [checkoutItems]);

  const grandTotal = subtotal; // Bisa ditambahkan logic shipping fee di sini

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFinalCheckout = async () => {
    if (!agreedToTerms) {
      Swal.fire(
        "Protocol_Error",
        "Please accept the Terms & Conditions",
        "warning",
      );
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    Swal.fire({
      title: "Executing_Protocol",
      text: "Securing transaction path...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const { data } = await axios.post(
        `${BASE_URL}/api/checkout`,
        {
          items: checkoutItems.map((item) => ({
            id: item.id,
            qty: item.quantity || 1,
          })),
          payment_type: selectedPayment,
          customer_details: formData,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      Swal.close();
      if (data.snap_token) {
        // @ts-ignore
        window.snap.pay(data.snap_token, {
          onSuccess: () => {
            localStorage.removeItem("cart");
            localStorage.removeItem("checkout_items");
            router.push("/orders/success");
          },
          onPending: () => router.push("/orders/pending"),
          onError: () => Swal.fire("Error", "Transaction Refused", "error"),
        });
      }
    } catch (err) {
      Swal.fire("Error", "Transaction Refused", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafa] text-black selection:bg-black selection:text-white pb-24">
      {/* PENTING: pt-24 di mobile dan pt-40 di desktop untuk memastikan 
          konten tidak tertutup Navbar Fixed 
      */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 lg:pt-40">
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <button
              onClick={() => router.back()}
              className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-black transition-all"
            >
              <FiChevronLeft className="group-hover:-translate-x-1 transition-transform" />
              Return_to_Bag
            </button>
            <h1 className="text-[clamp(3.5rem,12vw,8rem)] font-black italic uppercase tracking-tighter leading-[0.8] mb-0">
              Review<span className="text-zinc-200">.</span>
            </h1>
          </motion.div>

          <div className="hidden md:block text-right pb-2">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 italic mb-1">
              Status_Check
            </p>
            <p className="text-sm font-bold italic uppercase tracking-tighter">
              Secure_Tunnel_Active
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* --- LEFT: FORM DATA --- */}
          <div className="lg:col-span-7 space-y-20">
            {/* SECTION 1: IDENTITY */}
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <span className="flex-none w-10 h-10 bg-black text-white rounded-full flex items-center justify-center text-[10px] font-black italic">
                  01
                </span>
                <h3 className="font-black uppercase tracking-[0.3em] text-[10px] italic text-zinc-400">
                  Identity_Auth
                </h3>
                <div className="h-px bg-zinc-200 flex-grow" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">
                    Legal_Name
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-5 bg-white border border-zinc-100 rounded-2xl focus:border-black outline-none transition-all font-bold italic"
                    placeholder="ENTER_NAME"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">
                    Communication_Email
                  </label>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-5 bg-white border border-zinc-100 rounded-2xl focus:border-black outline-none transition-all font-bold italic"
                    placeholder="EMAIL_ADDRESS"
                  />
                </div>
              </div>
            </section>

            {/* SECTION 2: DELIVERY */}
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <span className="flex-none w-10 h-10 bg-black text-white rounded-full flex items-center justify-center text-[10px] font-black italic">
                  02
                </span>
                <h3 className="font-black uppercase tracking-[0.3em] text-[10px] italic text-zinc-400">
                  Distribution_Point
                </h3>
                <div className="h-px bg-zinc-200 flex-grow" />
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">
                    Physical_Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-6 bg-white border border-zinc-100 rounded-[2.5rem] focus:border-black outline-none transition-all font-bold italic resize-none"
                    placeholder="COORDINATES_STREET_NUMBER"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    name="city"
                    placeholder="CITY_LOCATION"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full p-5 bg-white border border-zinc-100 rounded-2xl focus:border-black outline-none transition-all font-bold italic uppercase"
                  />
                  <input
                    name="postalCode"
                    placeholder="POST_CODE"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full p-5 bg-white border border-zinc-100 rounded-2xl focus:border-black outline-none transition-all font-bold italic uppercase"
                  />
                </div>
              </div>
            </section>

            {/* SECTION 3: PAYMENT */}
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <span className="flex-none w-10 h-10 bg-black text-white rounded-full flex items-center justify-center text-[10px] font-black italic">
                  03
                </span>
                <h3 className="font-black uppercase tracking-[0.3em] text-[10px] italic text-zinc-400">
                  Gateway_Protocol
                </h3>
                <div className="h-px bg-zinc-200 flex-grow" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    id: "midtrans",
                    name: "SNAP_VA",
                    icon: <FiShield />,
                    desc: "Secured_Auth",
                  },
                  {
                    id: "e-wallet",
                    name: "DIGITAL_PAY",
                    icon: <FiSmartphone />,
                    desc: "Instant_Sync",
                  },
                  {
                    id: "bank",
                    name: "BANK_TRANSFER",
                    icon: <FiHome />,
                    desc: "Manual_Verify",
                  },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`p-6 rounded-[2.5rem] border-2 text-left transition-all relative ${
                      selectedPayment === method.id
                        ? "border-black bg-white shadow-xl"
                        : "border-transparent bg-white opacity-40 grayscale"
                    }`}
                  >
                    <div
                      className={`mb-4 w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${selectedPayment === method.id ? "bg-black text-white" : "bg-zinc-100 text-zinc-300"}`}
                    >
                      {method.icon}
                    </div>
                    <p className="text-[10px] font-black uppercase italic leading-none mb-1 tracking-tighter">
                      {method.name}
                    </p>
                    <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">
                      {method.desc}
                    </p>
                    {selectedPayment === method.id && (
                      <FiCheckCircle
                        className="absolute top-6 right-6 text-black"
                        size={16}
                      />
                    )}
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* --- RIGHT: SUMMARY --- */}
          <aside className="lg:col-span-5">
            <div className="bg-black text-white p-8 md:p-12 rounded-[3.5rem] lg:sticky lg:top-32 shadow-2xl">
              <div className="space-y-10">
                <header>
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-700 italic mb-2">
                    Manifest_Archive
                  </p>
                  <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
                    Checkout<span className="text-zinc-800">.</span>
                  </h2>
                </header>

                {/* ITEM LIST */}
                <div className="space-y-4 max-h-[250px] overflow-y-auto pr-4 custom-scrollbar border-b border-zinc-900 pb-8">
                  {checkoutItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-14 h-14 shrink-0 bg-white rounded-xl overflow-hidden p-0.5">
                        <img
                          src={`${BASE_URL}/storage/${item.image}`}
                          className="w-full h-full object-cover grayscale"
                          alt={item.name}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black italic uppercase text-[10px] truncate">
                          {item.name}
                        </h4>
                        <p className="text-[9px] font-bold text-zinc-500 italic">
                          QTY: {item.quantity} // IDR{" "}
                          {Number(item.price).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* PRICING TABLE */}
                <div className="space-y-4 pt-4">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-600">
                    <span>Subtotal_Valuation</span>
                    <span className="text-white">
                      Rp {subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-600">
                    <span>Shipping_Cost</span>
                    <span className="text-green-500 italic">
                      FREE_DISTRIBUTION
                    </span>
                  </div>

                  <div className="pt-8 border-t border-zinc-900">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 italic mb-3">
                      Grand_Total_Due
                    </p>
                    <p className="text-6xl font-black italic tracking-tighter leading-none">
                      <span className="text-[10px] align-top mr-2 opacity-30 italic">
                        IDR
                      </span>
                      {grandTotal.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="space-y-6">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center mt-1">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="peer appearance-none w-4 h-4 border border-zinc-800 rounded checked:bg-white transition-all cursor-pointer"
                      />
                      <FiCheckCircle className="absolute text-black opacity-0 peer-checked:opacity-100 pointer-events-none p-0.5" />
                    </div>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase leading-relaxed group-hover:text-zinc-300 transition-colors">
                      Accepting_Terms_and_Privacy_Archive_Protocols
                    </span>
                  </label>

                  <button
                    onClick={handleFinalCheckout}
                    disabled={
                      fetchingUser || checkoutItems.length === 0 || isSubmitting
                    }
                    className="group w-full py-8 bg-white text-black rounded-full font-black uppercase tracking-[0.4em] text-[11px] hover:bg-zinc-200 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-20 shadow-xl shadow-white/5"
                  >
                    {isSubmitting ? "Processing..." : "Execute_Purchase"}
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
