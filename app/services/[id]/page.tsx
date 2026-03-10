"use client";
import { useRouter } from "next/navigation";

export default function ServiceDetail({ params }: { params: { id: string } }) {
  const router = useRouter();

  const handleOrderRedirect = () => {
    // Navigasi ke Order Page sesuai flowchart lo
    router.push(`/order?id=${params.id}`);
  };

  return (
    <main className="pt-40 px-10 max-w-4xl mx-auto">
      <h1 className="text-6xl font-black italic uppercase tracking-tighter mb-6">
        Detail_Service_{params.id}
      </h1>
      <p className="text-gray-500 font-medium leading-relaxed mb-12">
        Deskripsi mendalam tentang service ini. Kita jelaskan value-nya supaya
        user yakin buat klik tombol order di bawah.
      </p>

      <button
        onClick={handleOrderRedirect}
        className="w-full bg-black text-white p-8 rounded-[2rem] font-black uppercase tracking-[0.3em] text-sm hover:bg-blue-600 transition-all"
      >
        Select this service_
      </button>
    </main>
  );
}
