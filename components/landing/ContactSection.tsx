import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiPhone, FiMapPin, FiSend, FiCheckCircle, FiLoader } from "react-icons/fi";
import { useSettings } from "@/components/providers/SettingsProvider";

export default function ContactSection({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const { settings } = useSettings();
  const store = settings?.store || {};
  const contact = settings?.landing_content?.contact || {};

  // Form States
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Terjadi kesalahan saat mengirim pesan.");
      }

      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
      
      // Reset success message after 5 seconds
      setTimeout(() => setStatus("idle"), 5000);
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message);
    }
  };

  return (
    <section 
      id="contact" 
      data-theme={theme}
      className={`py-32 overflow-hidden transition-colors duration-500 ${theme === "dark" ? "bg-[#0B0B0B] text-white" : "!bg-white !text-zinc-900"}`}
    >
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          
          {/* Left: Info */}
          <div className="space-y-12">
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-400 italic block">Hubungi Kami</span>
              <h2 className={`text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.85] ${theme === "dark" ? "text-white" : "!text-zinc-900"}`}>
                {contact.title?.split("<br />").map((text: string, i: number) => (
                  <span key={i}>
                    {text}
                    {i === 0 && <br />}
                  </span>
                )) || (
                  <>GET IN <br /> <span className="text-[var(--color-primary-accent)]">TOUCH.</span></>
                )}
              </h2>
              <p className={`text-sm md:text-lg italic font-medium max-w-md ${theme === "dark" ? "text-zinc-500" : "text-zinc-600"}`}>
                {contact.description || "Have questions about your order or our latest drops? Our team is ready to assist you."}
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-6 group">
                <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${theme === "dark" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-900 shadow-sm"}`}>
                  <FiMail size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-1">{contact.email_label || "Email Protocol"}</p>
                  <p className="text-sm md:text-lg font-black italic uppercase tracking-tight break-all">{store.store_email || "support@daemonium.com"}</p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${theme === "dark" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-900 shadow-sm"}`}>
                  <FiPhone size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-1">{contact.phone_label || "Secure Line"}</p>
                  <p className="text-sm md:text-lg font-black italic uppercase tracking-tight break-all">{store.store_phone || "+62 812 3456 7890"}</p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${theme === "dark" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-900 shadow-sm"}`}>
                  <FiMapPin size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-1">{contact.address_label || "Base HQ"}</p>
                  <p className="text-sm md:text-lg font-black italic uppercase tracking-tight break-all overflow-hidden">{store.store_address || "Jakarta, Indonesia"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Simple Form CTA */}
          <div className={`p-8 md:p-12 rounded-[3rem] border transition-all duration-500 ${theme === "dark" ? "bg-zinc-900/40 border-white/5" : "bg-zinc-50 border-zinc-100 shadow-xl"}`}>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[8px] font-black uppercase tracking-widest text-zinc-500 ml-4">Identity</label>
                      <input 
                        required
                        type="text" 
                        placeholder="NAME"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full p-5 rounded-full text-[10px] font-black tracking-widest outline-none transition-all uppercase ${theme === "dark" ? "bg-black border-white/10 text-white placeholder:text-zinc-800" : "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-300"}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] font-black uppercase tracking-widest text-zinc-500 ml-4">Frequency</label>
                      <input 
                        required
                        type="email" 
                        placeholder="EMAIL"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full p-5 rounded-full text-[10px] font-black tracking-widest outline-none transition-all uppercase ${theme === "dark" ? "bg-black border-white/10 text-white placeholder:text-zinc-800" : "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-300"}`}
                      />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest text-zinc-500 ml-4">Transmission</label>
                    <textarea 
                      required
                      rows={4}
                      placeholder="YOUR MESSAGE"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className={`w-full p-6 rounded-[2rem] text-[10px] font-black tracking-widest outline-none transition-all uppercase resize-none ${theme === "dark" ? "bg-black border-white/10 text-white placeholder:text-zinc-800" : "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-300"}`}
                    />
                 </div>
              </div>

              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="w-full py-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                  >
                    <FiCheckCircle size={16} /> Pesan Terkirim!
                  </motion.div>
                ) : (
                  <button 
                    disabled={status === "loading"}
                    className={`w-full py-6 rounded-full flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] transition-all disabled:opacity-50 disabled:cursor-not-allowed ${theme === "dark" ? "bg-white text-black hover:bg-[var(--color-primary-accent)] hover:text-white" : "bg-black text-white hover:bg-[var(--color-primary-accent)]"}`}
                  >
                    {status === "loading" ? (
                      <FiLoader className="animate-spin" size={14} />
                    ) : (
                      <FiSend size={14} />
                    )}
                    {status === "loading" ? "TRANSMITTING..." : "Send Message"}
                  </button>
                )}
              </AnimatePresence>

              {status === "error" && (
                <p className="text-[10px] font-bold text-rose-500 text-center uppercase tracking-widest italic">
                  Error: {errorMessage}
                </p>
              )}
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}
