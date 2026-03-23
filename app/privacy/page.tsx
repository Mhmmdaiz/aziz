"use client";

import { useSettings } from "@/components/providers/SettingsProvider";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";

export default function PrivacyPage() {
  const { settings } = useSettings();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [legalData, setLegalData] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    const fetchLegal = async () => {
      const { data } = await supabase.from("site_settings").select("value").eq("key", "legal_content").single();
      if (data) setLegalData(data.value);
    };
    fetchLegal();
  }, []);

  if (!mounted) return null;

  const theme = resolvedTheme === "light" ? "light" : "dark";
  const storeName = settings?.store?.store_name || "DAEMONIUM";
  const storeEmail = settings?.store?.store_email || "[Email Kontak]";

  const privacy = legalData?.privacy || [
    { title: "A. Informasi yang Kami Kumpulkan", content: `Kami mengumpulkan informasi pribadi yang Anda berikan secara langsung demi memuluskan jalannya operasional E-commerce. Informasi ini dipetik ketika Anda mendaftar akun, berselancar, melakukan checkout transaksi, maupun berkomunikasi pada pusat bantuan. Variabel tersebut meliputi:\n- Nama lengkap\n- Alamat pengiriman & Alamat Surel (Email)\n- Nomor seluler dan rincian transaksi.` },
    { title: "B. Penggunaan Informasi Pribadi", content: `Kami berpegang teguh pada pendirian untuk hanya menggunakan data Anda ketika secara logis diperlukan, yaitu:\n1. Memproses transaksi pembelian reguler (Ready Stock) maupun pemesanan terbatas (Pre-order) secara presisi.\n2. Sinkronisasi data ke sistem manajemen inventaris serta portal logistik agar paket meluncur tepat ke depan pintu Anda.\n3. Berkomunikasi proaktif dengan Pengguna bila terjadi perselisihan klaim atau pembaruan status.\n4. Mencegah ancaman deteksi penipuan online dan peretasan akun.` },
    { title: "C. Perlindungan Data Rahasia", content: `Protokol keamanan web diimplementasikan secara berkesinambungan melalui sambungan enkripsi aman (SSL). Nomor instrumen pembayaran kredit Anda tidak pernah disimpan di dalam repositori data server ${storeName}, melainkan ditangani dalam lingkungan tersertifikasi oleh gateway pembayaran eksternal rekanan.` },
    { title: "D. Pembagian Informasi Ke Pihak Ketiga", content: `Kebijakan kami adalah "Anti Jual Data". Kami TIDAK mengembangkan unit bisnis untuk memonetisasi detail Pengguna kami. Beberapa kondisi logis transmisi data eksternal hanya berlaku kepada:\n- Vendor Ekspedisi / Kurir untuk keperluan pengantaran paket logistik.\n- Pihak Gateway Pembayaran dalam rangka otentikasi tagihan.\n- Pihak Berwenang apabila dituntut dalam surat perintah resmi sesuai undang-undang domisili bisnis kami.` },
    { title: "E. Hak Eksklusif Pengguna", content: `1. Pengguna memegang kuasa mandiri untuk memanipulasi, melihat ulang, atau merevisi rekam jejak identitas masing-masing di Panel Akun secara Real-time.\n2. Opsi "Opt-out" atau berhenti berlangganan publikasi promosi senantiasa disematkan di setiap kaki surat elektronik (email) yang dihembuskan oleh algoritma kami.` },
    { title: "F. Amandemen Kebijakan", content: `Halaman Privacy Policy ini berstatus dinamis dan hidup. Kebijakan ini dapat diamandemen kapanpun tanpa sosialisasi publik, menyesuaikan dinamika birokrasi, iklim industri internet, maupun model bisnis masa depan. Namun, amandemen kritikal lazimnya akan disertai pemberitahuan elektronik ke basis data anggota.` }
  ];

  return (
    <main className={`min-h-screen pt-40 pb-32 transition-colors duration-500 ${theme === "dark" ? "bg-[#0B0B0B] text-white" : "bg-white text-zinc-900"}`}>
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-16"
        >
          {/* Header */}
          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-500 italic block">Legal Document</span>
            <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">
              Privacy <br /> <span className="text-[var(--color-primary-accent)]">Policy.</span>
            </h1>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest italic">Terakhir Diperbarui: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          {/* Content */}
          <div className="space-y-12 text-sm md:text-base leading-relaxed font-medium">
            {privacy.map((section: any, i: number) => (
              <section key={i} className="space-y-4">
                <h2 className={`text-xl md:text-2xl font-black uppercase tracking-tight italic border-b border-zinc-500/20 pb-2 ${theme === "dark" ? "text-white" : "text-zinc-900"}`}>
                  {section.title}
                </h2>
                <div className={`whitespace-pre-line ${theme === "dark" ? "text-zinc-400" : "text-zinc-600"}`}>
                  {section.content}
                </div>
              </section>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="pt-12 border-t border-zinc-500/20">
            <h3 className="text-lg font-black uppercase italic tracking-widest mb-4">Privasi Anda Prioritas Kami.</h3>
            <p className="text-zinc-500 text-sm mb-6">Jika Anda memiliki pertanyaan mengenai penggunaan data pribadi Anda di platform kami, silakan hubungi tim keamanan data kami melalui:</p>
            <div className="flex flex-col md:flex-row gap-8">
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-1">Email Privasi</p>
                <p className="text-sm font-black italic uppercase tracking-tight">{storeEmail}</p>
              </div>
            </div>
          </div>

        </motion.div>
      </div>
    </main>
  );
}
