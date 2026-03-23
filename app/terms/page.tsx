"use client";

import { useSettings } from "@/components/providers/SettingsProvider";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";

export default function TermsPage() {
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
  const storeAddress = settings?.store?.store_address || "[Alamat Perusahaan]";

  const terms = legalData?.terms || [
    { title: "A. Pendahuluan", content: `Selamat datang di ${storeName}. Dengan mengakses dan menggunakan situs web ini, Anda dianggap telah membaca, memahami, dan menyetujui untuk terikat oleh Syarat dan Ketentuan ini.\n\nSyarat dan Ketentuan ini mengatur penggunaan platform layanan e-commerce kami. Jika Anda tidak menyetujui satu atau lebih bagian dari syarat ini, Anda disarankan untuk tidak melanjutkan penggunaan situs web kami.` },
    { title: "B. Definisi", content: `Dalam perjanjian ini, istilah-istilah berikut memiliki arti:\n1. "Website" merujuk pada platform online beralamat di bawah manajemen ${storeName}.\n2. "User" atau "Pengguna" adalah siapapun yang mengunjungi, mendaftar, atau melakukan transaksi di Website.\n3. "Produk" adalah barang berupa pakaian jadi, aksesoris fashion, dan perlengkapan lainnya yang dijual di Website, baik dengan sistem Pre-order (PO) maupun Ready Stock.` },
    { title: "C. Akun Pengguna", content: `1. Pengguna wajib memberikan data yang valid, akurat, dan terbaru saat melakukan registrasi demi kelancaran logistik.\n2. Menjaga kerahasiaan kredensial akun merupakan spesifik tanggung jawab Pengguna. Segala aktivitas yang mengatasnamakan akun Pengguna akan dianggap valid oleh sistem kami.\n3. Website memiliki otoritas absolut untuk membekukan (suspend) sementara maupun memblokir permanen akun Pengguna yang kedapatan melakukan kecurangan, penipuan, pelanggaran hak cipta, atau tindakan lain yang melanggar hukum.` },
    { title: "D. Produk", content: `1. Website menjual 2 tipe persediaan Produk:\n     a. Ready Stock: Produk tersedia untuk dikirimkan sesegera mungkin sesuai jadwal pengiriman regular.\n     b. Pre-order (PO): Produk harus diproduksi atau disediakan terlebih dahulu setelah batas waktu PO tertentu. Estimasi waktu penantian (waiting time) akan dicantumkan secara gamblang.\n2. Kesalahan estimasi waktu (delay) untuk produk PO bisa terjadi karena faktor eksternal (suplier bahan, cuaca, dll). Kami selalu berupaya menginformasikan kendala ini kepada Anda.\n3. Dimensi, potongan, dan warna yang tertera dalam layar perangkat (monitor/smartphone) Pengguna mungkin memiliki toleransi akurasi 5-10% terhadap produk fisik sesungguhnya.` },
    { title: "E. Pembayaran Transaksi", content: `1. Opsi Transmisi Pembayaran yang difasilitasi meliputi Transfer Bank Manual dan Gateway Pembayaran Terintegrasi (Pakasir / Midtrans / Duitku) yang mencakup QRIS, E-Wallet, dan Kartu Kredit.\n2. Batas waktu pelunasan adalah sesuai SLA masing-masing gerbang pembayaran; jika melebihi SLA pesanan otomatis dibatalkan dan inventori dilepas.\n3. Bagi pelanggan yang menggunakan fitur manual transfer, kewajiban untuk melampirkan bukti autentik secara mandiri dibebankan kepada pelanggan melalui kanal yang sesuai.` },
    { title: "F. Logistik dan Pengiriman", content: `1. Eksekusi pengiriman bermitra dengan penyedia layanan kurir pihak ketiga yang dapat dilacak (contoh: JNE, J&T).\n2. Hak kepemilikan dan Risiko kerugian berpindah setelah serah terima paket dari kami ke pihak ekspedisi.\n3. Keterlambatan barang sampai adalah mutlak tanggung jawab ekspedisi, namun tim pendukung kami akan berusaha menjembatani komplain Anda. Pastikan nama jalan, RT/RW, dan Kodepos yang diinput selalu tepat.` },
    { title: "G. Ketentuan Retur & Refund", content: `1. Kebijakan Refund (Pengembalian Dana) atau Retur (Tukar Produk) HARUS memenuhi prasyarat klaim:\n    - Cacat manufaktur atau kesalahan dimensi/ukuran yang secara sepihak disebabkan oleh kesalahan produksi.\n    - Produk belum pernah dikenakan untuk rutinitas harian (unworn) dan belum masuk proses pencucian (unwashed).\n    - Hangtag resmi ${storeName} masih menggantung utuh di produk.\n2. Ketentuan Klaim:\n    - Komplain maksimal terkirim dalam waktu 3x24 Jam dari status sistem kurir ("Delivered").\n    - Mengantarkan bukti Video Unboxing Paket yang solid (tanpa potongan klip / no cut).\n    - Jika menukar karena faktor pelanggan salah pilih ukuran, kami tidak bertanggung jawab menanggung biayanya.\n3. Khusus Produk yang berlabel Clearance Sale atau Pre-order (ukuran custom) tidak dapat dibatalkan (Cancel) maupun dikembalikan (No Return) pasca pembayaran usai.` }
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
              Terms & <br /> <span className="text-[var(--color-primary-accent)]">Conditions.</span>
            </h1>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest italic">Terakhir Diperbarui: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          {/* Content */}
          <div className="space-y-12 text-sm md:text-base leading-relaxed font-medium">
            {terms.map((section: any, i: number) => (
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
            <h3 className="text-lg font-black uppercase italic tracking-widest mb-4">Butuh Bantuan Hukum?</h3>
            <p className="text-zinc-500 text-sm mb-6">Hubungi departemen bantuan kami untuk klarifikasi lebih lanjut mengenai syarat dan ketentuan di atas.</p>
            <div className="flex flex-col md:flex-row gap-8">
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-1">Email Kueri</p>
                <p className="text-sm font-black italic uppercase tracking-tight">{storeEmail}</p>
              </div>
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-1">Kantor Pusat</p>
                <p className="text-sm font-black italic uppercase tracking-tight">{storeAddress}</p>
              </div>
            </div>
          </div>

        </motion.div>
      </div>
    </main>
  );
}
