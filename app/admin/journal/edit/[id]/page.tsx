"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { FiChevronLeft, FiSave, FiLoader, FiCamera } from "react-icons/fi";
import Swal from "sweetalert2";

export default function EditJournal() {
  const { id } = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    status: "draft",
    content: "", // TAMBAHKAN INI agar Laravel tidak protes
    image: null as File | null,
  });

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://127.0.0.1:8000/api/posts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Pastikan mengambil dari res.data.data sesuai struktur controller lo
        const item = res.data?.data || res.data;
        if (item) {
          setFormData({
            title: item.title || "",
            category: item.category || "",
            status: item.status || "draft",
            content: item.content || "", // SIMPAN content lama di state
            image: null,
          });
          if (item.image) {
            setPreview(`http://127.0.0.1:8000/storage/${item.image}`);
          }
        }
      } catch (err: any) {
        console.error("Sync Error:", err);
        router.push("/admin/journal");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");

      const data = new FormData();
      data.append("title", formData.title);
      data.append("category", formData.category);
      data.append("status", formData.status);
      data.append("content", formData.content); // KIRIM BALIK content-nya
      data.append("_method", "PUT");

      if (formData.image) {
        data.append("image", formData.image);
      }

      await axios.post(`http://127.0.0.1:8000/api/posts/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        title: "ARCHIVE UPDATED",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: "rounded-[2rem]" },
      });
      router.push("/admin/journal");
    } catch (err: any) {
      // DEBUG: Lihat pesan error asli dari Laravel di console
      console.log("Error Detail:", err.response?.data);
      Swal.fire(
        "UPDATE FAILED",
        err.response?.data?.message || "Check file size or connection.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center italic font-black uppercase tracking-widest text-gray-300">
        Syncing_Database...
      </div>
    );

  return (
    <main className="min-h-screen bg-[#fafafa] pt-24 pb-20 px-4 md:px-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <Link
            href="/admin/journal"
            className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-gray-400 hover:text-black transition-colors"
          >
            <FiChevronLeft /> Back_To_Archives
          </Link>
        </div>

        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mb-12 leading-none">
          Edit_Narrative.
        </h1>

        <form
          onSubmit={handleUpdate}
          className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)]"
        >
          <div className="space-y-10">
            <div className="flex flex-col items-center gap-4">
              <label className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-400">
                Cover_Image
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative w-44 h-44 bg-gray-50 rounded-[2.5rem] overflow-hidden cursor-pointer group border-2 border-dashed border-gray-100 hover:border-blue-200 transition-all"
              >
                {preview ? (
                  <img
                    src={preview}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    alt="preview"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-200">
                    <FiCamera size={30} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[8px] text-white font-black uppercase tracking-widest">
                    Change_Image
                  </span>
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
              />
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-400 block mb-3">
                  Narrative_Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full bg-gray-50 border-none rounded-2xl p-5 text-lg font-bold italic uppercase focus:ring-2 focus:ring-blue-100 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-400 block mb-3">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full bg-gray-50 border-none rounded-2xl p-5 text-sm font-bold uppercase tracking-widest focus:ring-2 focus:ring-blue-100 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-400 block mb-3">
                    Archive_Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full bg-gray-50 border-none rounded-2xl p-5 text-sm font-bold uppercase tracking-widest focus:ring-2 focus:ring-blue-100 transition-all appearance-none cursor-pointer"
                  >
                    <option value="draft">DRAFT</option>
                    <option value="published">PUBLISHED</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-black text-white p-6 rounded-full font-black uppercase tracking-[0.3em] text-[10px] flex justify-center items-center gap-3 hover:bg-blue-600 transition-all shadow-xl shadow-blue-50/50 disabled:bg-gray-200"
            >
              {submitting ? (
                <FiLoader className="animate-spin" />
              ) : (
                <>
                  <FiSave size={16} /> Save_Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
