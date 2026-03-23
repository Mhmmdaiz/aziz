require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const defaultLegalContent = {
  terms: [
    { title: "A. Pendahuluan", content: "Selamat datang di DAEMONIUM. Dengan mengakses dan menggunakan situs web ini, Anda dianggap telah membaca, memahami, dan menyetujui untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak menyetujui bagian apa pun dari ketentuan ini, mohon untuk tidak menggunakan layanan kami." },
    { title: "B. Definisi", content: "Website: Merujuk pada situs resmi DAEMONIUM.\nPengguna/User: Pihak yang mengakses atau menggunakan layanan Website.\nProduk: Barang fashion atau merchandise yang ditawarkan oleh DAEMONIUM.\nTransaksi: Proses pembelian produk yang dilakukan melalui sistem Website." },
    { title: "C. Akun Pengguna", content: "Anda wajib memberikan data diri yang akurat, lengkap, dan terbaru saat melakukan registrasi.\nKeamanan kata sandi dan aktivitas akun sepenuhnya merupakan tanggung jawab Anda.\nKami berhak menangguhkan (suspend) atau menghapus akun jika ditemukan pelanggaran atau aktivitas mencurigakan secara sepihak." },
    { title: "D. Produk & Transaksi", content: "Kami menawarkan sistem Ready Stock dan Pre-Order (PO). Penjelasan estimasi waktu PO tercantum pada detail setiap produk.\nHarga dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya.\nKetersediaan stok pada website mungkin tidak selalu real-time karena sinkronisasi teknis.\nKami berhak membatalkan pesanan jika terjadi kesalahan harga atau kesalahan sistem lainnya." },
    { title: "E. Pembayaran", content: "Pembayaran dilakukan melalui Payment Gateway resmi yang kami sediakan (Pilihan: QRIS, VA, Kartu Kredit).\nPesanan akan diproses hanya setelah pembayaran terkonfirmasi oleh sistem kami.\nSegala bentuk kegagalan pembayaran yang disebabkan oleh kesalahan pihak ketiga (Bank/Payment Gateway) bukan merupakan tanggung jawab Website." },
    { title: "F. Pengiriman", content: "Pengiriman dilakukan melalui jasa kurir pihak ketiga (JNE, J&T, dll).\nEstimasi waktu sampai bergantung pada lokasi dan efisiensi pihak kurir.\nKeterlambatan atau kerusakan yang terjadi selama proses transit oleh kurir berada di luar kendali dan tanggung jawab langsung DAEMONIUM." },
    { title: "G. Refund & Retur", content: "Retur atau pengembalian produk hanya berlaku untuk kondisi barang rusak (cacat produksi) atau salah kirim.\nBatas waktu komplain adalah 2x24 jam sejak barang diterima berdasarkan status pelacakan kurir.\nProduk harus dalam kondisi asli, belum digunakan, tag masih terpasang, dan lengkap dengan kemasan aslinya.\nWajib menyertakan video unboxing tanpa jeda sebagai bukti pendukung komplain." },
    { title: "H. Larangan Penggunaan", content: "Dilarang menggunakan website untuk aktivitas ilegal atau melanggar hukum.\nDilarang melakukan tindakan merusak sistem (hacking, scraping, serangan malware).\nDilarang meniru identitas orang lain atau memberikan informasi palsu." },
    { title: "I. Hak Kekayaan Intelektual", content: "Semua konten yang ada di website ini, termasuk namun tidak terbatas pada logo, desain produk, foto, teks, dan kode program adalah milik sah DAEMONIUM dan dilindungi oleh undang-undang hak cipta." },
    { title: "J. Batasan Tanggung Jawab", content: "DAEMONIUM tidak bertanggung jawab atas kerugian tidak langsung, insidental, atau konsekuensial yang muncul dari penggunaan atau ketidakmampuan menggunakan Website kami." },
    { title: "K. Perubahan Syarat", content: "Kami berhak untuk mengubah, memodifikasi, menambah, atau menghapus bagian-bagian dari Syarat dan Ketentuan ini kapan saja tanpa pemberitahuan terlebih dahulu. Anda disarankan untuk memeriksa halaman ini secara berkala." }
  ],
  privacy: [
    { title: "A. Pendahuluan", content: "Kami di DAEMONIUM berkomitmen penuh untuk menjaga keamanan dan kerahasiaan data pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi Anda saat Anda menggunakan layanan e-commerce kami." },
    { title: "B. Data yang Dikumpulkan", content: "Data Identitas: Nama lengkap, tanggal lahir, jenis kelamin.\nData Kontak: Alamat email, nomor telepon (WhatsApp), alamat pengiriman lengkap.\nData Transaksi: Riwayat pembelian, nomor pesanan, detail pembayaran (melalui payment gateway).\nData Teknis: Alamat IP, jenis peramban (browser), lokasi geografis, dan data kunjungan halaman." },
    { title: "C. Cara Mengumpulkan Data", content: "Kami mengumpulkan data Anda melalui beberapa cara:\nProses registrasi akun baru.\nProses pengisian data saat Checkout pesanan.\nPenggunaan kuki (cookies) dan teknologi pelacakan serupa saat Anda menelusuri situs kami." },
    { title: "D. Penggunaan Data", content: "Memproses, memvalidasi, dan mengirimkan pesanan Anda.\nMemberikan notifikasi status pengiriman atau pembaruan sistem Pre-order.\nMeningkatkan layanan pelanggan dan pengalaman berbelanja Anda di website kami.\nKeperluan pemasaran (seperti newsletter) jika Anda memberikan persetujuan eksplisit." },
    { title: "E. Penyimpanan & Keamanan", content: "Data Anda disimpan menggunakan enkripsi standar industri pada server yang aman.\nKami menjamin bahwa Data Anda tidak akan dijual, disewakan, atau dibagikan kepada pihak lain untuk tujuan komersial di luar operasional DAEMONIUM.\nKami hanya memberikan data minimal yang diperlukan kepada mitra operasional agar pesanan Anda sampai dengan selamat." },
    { title: "F. Pihak Ketiga", content: "Kami bekerja sama dengan pihak ketiga terpercaya untuk menunjang layanan kami:\nPayment Gateway: Untuk memproses pembayaran secara aman (Midtrans/Duitku/sejenisnya).\nLayanan Kurir: Untuk keperluan pengiriman barang (JNE, J&T, Sicepat, dll).\nLayanan Analitik: Untuk memahami perilaku pengguna di website guna perbaikan fitur." },
    { title: "G. Hak Pengguna", content: "Hak untuk mengakses dan meminta salinan data pribadi Anda yang kami simpan.\nHak untuk memperbarui atau mengoreksi data Anda melalui halaman Dashboard User.\nHak untuk meminta penutupan akun secara permanen." },
    { title: "H. Cookies", content: "Situs kami menggunakan cookies untuk menyimpan sesi login Anda, mengingat isi keranjang belanja, dan memahami preferensi navigasi Anda. Anda dapat menonaktifkan cookies melalui pengaturan browser Anda, namun beberapa fungsi website mungkin tidak akan berjalan maksimal." },
    { title: "I. Perubahan Kebijakan", content: "Kebijakan Privasi ini dapat kami perbarui sewaktu-waktu tanpa pemberitahuan sebelumnya. Perubahan akan berlaku segera setelah dipublikasikan di halaman ini. Penggunaan berkelanjutan atas layanan kami dianggap sebagai persetujuan Anda atas kebijakan terbaru." }
  ]
};

async function migrate() {
  console.log("Checking if legal_content exists...");
  const { data: existing } = await supabase.from('site_settings').select('key').eq('key', 'legal_content').single();

  if (existing) {
    console.log("legal_content already exists. Skipping insertion.");
    return;
  }

  console.log("Inserting default legal_content...");
  const { error } = await supabase.from('site_settings').insert([
    { key: 'legal_content', value: defaultLegalContent }
  ]);

  if (error) {
    console.error("Migration failed:", error.message);
  } else {
    console.log("Migration successful!");
  }
}

migrate();
