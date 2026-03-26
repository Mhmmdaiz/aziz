"use client";

import { useSettings } from "@/components/providers/SettingsProvider";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";

export default function ContactSection({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const { settings } = useSettings();
  const storeSettings = settings?.store || {};
  const contactContent = settings?.landing_content?.contact || {};

  const isDark = theme === "dark";

  const info = [
    {
      icon: <FiMail className="w-5 h-5" />,
      label: contactContent.email_label || "Email Protocol",
      value: storeSettings.store_email || "hello@chckt.store",
    },
    {
      icon: <FiPhone className="w-5 h-5" />,
      label: contactContent.phone_label || "Secure Line",
      value: storeSettings.store_phone || "+62 812 3456 7890",
    },
    {
      icon: <FiMapPin className="w-5 h-5" />,
      label: contactContent.address_label || "Base HQ",
      value: storeSettings.store_address || "Jakarta, Indonesia",
    },
  ];

  return (
    <section
      className={`py-24 md:py-36 transition-colors duration-500 ${isDark ? "bg-black text-white" : "bg-white text-black"}`}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-10 h-px bg-[var(--color-primary-accent)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--color-primary-accent)]">
            Contact
          </span>
        </div>
        <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none mb-4">
          {contactContent.title || "GET IN TOUCH."}
        </h2>
        <p className={`text-sm md:text-base font-medium mb-14 max-w-xl leading-relaxed ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
          {contactContent.description || "Have questions about your order or our latest drops? Our team is ready to assist you."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {info.map((item, i) => (
            <div
              key={i}
              className={`p-6 rounded-2xl border flex flex-col gap-4 ${isDark ? "bg-zinc-900/40 border-white/5" : "bg-zinc-50 border-zinc-200"}`}
            >
              <div className={`p-3 w-fit rounded-xl ${isDark ? "bg-white/5" : "bg-zinc-100"} text-[var(--color-primary-accent)]`}>
                {item.icon}
              </div>
              <div>
                <p className={`text-[9px] font-black uppercase tracking-[0.3em] mb-1 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                  {item.label}
                </p>
                <p className="text-sm font-black">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
