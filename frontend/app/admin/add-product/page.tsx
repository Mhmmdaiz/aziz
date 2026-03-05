"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft,
  FiPlus,
  FiX,
  FiSave,
  FiImage,
  FiRefreshCw,
} from "react-icons/fi";
import Swal from "sweetalert2";

export default function AddProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
  });
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role !== "admin") {
      router.push("/");
    }
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      if (images.length + selected.length > 7) {
        return Swal.fire("LIMIT", "Maksimal 7 foto!", "warning");
      }
      setImages((prev) => [...prev, ...selected]);
      const newPreviews = selected.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    URL.revokeObjectURL(previews[index]);
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0)
      return Swal.fire("ERROR", "Visual asset required!", "error");

    setLoading(true);
    const token = localStorage.getItem("token");
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("stock", formData.stock);
    images.forEach((file) => {
      data.append("images[]", file);
    });

    try {
      // Endpoint sesuai instruksi tersimpan
      await axios.post("http://127.0.0.1:8000/api/products", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      await Swal.fire({
        title: "SUCCESS",
        text: "Artifact stored in vault.",
        icon: "success",
        confirmButtonColor: "#000",
      });
      router.push("/admin/dashboard");
    } catch (err: any) {
      Swal.fire("FAILED", "Sync error.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    // PT-20 agar konten tidak mepet ke status bar/top browser
    <main className="min-h-screen bg-[#f8f9fa] pt-20 pb-20 px-4 md:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 overflow-visible">
        {/* HEADER - Dibuat lebih plong agar teks tidak terpotong */}
        <div className="px-8 py-10 md:px-12 md:py-14 flex flex-col items-center gap-6 relative">
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-black leading-tight">
              New Product<span className="text-blue-600">.</span>
            </h1>
            <p className="text-[10px] tracking-[0.4em] text-gray-400 font-bold uppercase mt-2">
              Secure_Archive_Unit
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-12 md:px-16 md:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* GALLERY - Grid lebih rapi */}
            <div className="space-y-6">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block px-1">
                Visual_Assets ({images.length}/7)
              </label>

              <div className="grid grid-cols-4 gap-3">
                {previews.map((src, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-2xl overflow-hidden relative border border-gray-100 bg-gray-50 group"
                  >
                    <img
                      src={src}
                      className="w-full h-full object-cover"
                      alt="preview"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <FiX className="text-white" size={20} />
                    </button>
                  </div>
                ))}

                {images.length < 7 && (
                  <label className="aspect-square rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-black transition-all group">
                    <input
                      type="file"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                      accept="image/*"
                    />
                    <FiPlus
                      size={24}
                      className="text-gray-300 group-hover:text-black transition-transform group-hover:scale-110"
                    />
                  </label>
                )}
              </div>

              {images.length === 0 && (
                <div className="h-40 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300">
                  <FiImage size={32} strokeWidth={1} />
                  <span className="text-[9px] font-black uppercase mt-2">
                    No Media Attached
                  </span>
                </div>
              )}
            </div>

            {/* INPUTS - Dibuat lebih clean */}
            <div className="space-y-8">
              <div className="relative border-b-2 border-gray-100 focus-within:border-black transition-colors py-2">
                <label className="text-[9px] font-black uppercase text-gray-400 block tracking-widest mb-1">
                  Model_Name
                </label>
                <input
                  required
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full text-xl md:text-2xl font-black outline-none bg-transparent placeholder:text-gray-200 uppercase italic"
                  placeholder="EX: CORE_UNIT_01"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-gray-400 block tracking-widest">
                  Description
                </label>
                <textarea
                  required
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full p-5 bg-gray-50 rounded-2xl outline-none focus:ring-1 focus:ring-black text-sm transition-all"
                  placeholder="Specs & details..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <label className="text-[9px] font-black uppercase text-gray-400 block mb-1">
                    Valuation
                  </label>
                  <input
                    type="number"
                    required
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full bg-transparent font-black text-lg outline-none"
                    placeholder="0"
                  />
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <label className="text-[9px] font-black uppercase text-gray-400 block mb-1">
                    Vault_Stock
                  </label>
                  <input
                    type="number"
                    required
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    className="w-full bg-transparent font-black text-lg outline-none"
                    placeholder="0"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-6 rounded-2xl font-black uppercase tracking-[0.4em] text-[11px] flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-xl active:scale-95 disabled:bg-gray-300"
              >
                {loading ? (
                  <FiRefreshCw className="animate-spin" />
                ) : (
                  "SYNCHRONIZE"
                )}
                <FiSave size={16} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
