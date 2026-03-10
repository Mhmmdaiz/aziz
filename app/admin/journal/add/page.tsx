"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft,
  FiUploadCloud,
  FiCheckCircle,
  FiLoader,
  FiX,
} from "react-icons/fi";
import Swal from "sweetalert2";

export default function AddJournal() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  // State untuk form
  const [formData, setFormData] = useState({
    title: "",
    category: "Branding",
    content: "",
    status: "published",
  });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    // Proteksi Role Simple
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role !== "admin" && user.role !== "superadmin") {
      router.push("/");
    }
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validasi Tipe File
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire("Format Error", "Please upload JPG, PNG, or WEBP", "error");
        return;
      }

      // Validasi Ukuran (2MB)
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire("Large File", "Image must be less than 2MB", "warning");
        return;
      }

      setImage(file);
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("category", formData.category);
    data.append("content", formData.content);
    data.append("status", formData.status);
    if (image) data.append("image", image);

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://127.0.0.1:8000/api/posts", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      await Swal.fire({
        title: "STORY PUBLISHED!",
        text: "Your brand narrative has been recorded.",
        icon: "success",
        confirmButtonColor: "#2563eb", // Blue accent
        customClass: { popup: "rounded-[2rem]", title: "font-black italic" },
      });

      router.push("/admin/journal");
      router.refresh();
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Check your server connection.";
      Swal.fire({
        title: "UPLOAD ERROR",
        text: message,
        icon: "error",
        confirmButtonColor: "#000000",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#FBFBFB] pt-32 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* BREADCRUMB / BACK */}
        <Link
          href="/admin/journal"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-blue-600 transition-all mb-12 group"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          Back to Journal Records
        </Link>

        {/* TITLE SECTION */}
        <div className="mb-16">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-600 mb-4">
            Editorial_Console / v1.0
          </p>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-zinc-900 uppercase leading-[0.85]">
            New{" "}
            <span className="text-zinc-300 text-4xl md:text-6xl block md:inline">
              Narrative.
            </span>
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-16"
        >
          {/* LEFT: MEDIA CONTROL */}
          <div className="lg:col-span-5">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4 block italic">
              01_Visual_Artifact
            </label>

            <div className="relative aspect-square md:aspect-[4/5] rounded-[2.5rem] bg-white border border-zinc-100 shadow-xl shadow-zinc-200/50 overflow-hidden group">
              {preview ? (
                <>
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-4 right-4 p-3 bg-black/50 backdrop-blur-md text-white rounded-full hover:bg-red-500 transition-colors z-20"
                  >
                    <FiX size={16} />
                  </button>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-50 transition-all duration-500">
                    <FiUploadCloud
                      size={32}
                      className="text-zinc-300 group-hover:text-blue-500"
                    />
                  </div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-900 mb-2">
                    Select Cover Image
                  </h4>
                  <p className="text-[9px] text-zinc-400 uppercase tracking-tighter leading-relaxed">
                    Drop your artifact here <br /> Max size 2.0MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: CONTENT CONTROL */}
          <div className="lg:col-span-7 flex flex-col gap-10">
            {/* INPUT TITLE */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 italic">
                02_Header_Data
              </label>
              <input
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Title of the narrative..."
                className="w-full text-3xl font-black italic tracking-tighter uppercase border-b-2 border-zinc-100 pb-4 focus:border-blue-600 outline-none transition-all placeholder:text-zinc-200 bg-transparent text-zinc-900"
              />
            </div>

            {/* METADATA DROPDOWNS */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 italic">
                  03_Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full font-bold text-xs uppercase tracking-widest border-b-2 border-zinc-100 pb-4 outline-none focus:border-blue-600 bg-transparent text-zinc-900 cursor-pointer"
                >
                  {["Branding", "Product", "Event", "Culture"].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 italic">
                  04_Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full font-bold text-xs uppercase tracking-widest border-b-2 border-zinc-100 pb-4 outline-none focus:border-blue-600 bg-transparent text-zinc-900 cursor-pointer"
                >
                  <option value="published">Ready to Publish</option>
                  <option value="draft">Save as Draft</option>
                </select>
              </div>
            </div>

            {/* CONTENT AREA */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 italic">
                05_Body_Narration
              </label>
              <textarea
                required
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={8}
                placeholder="Start weaving the story here..."
                className="w-full text-base leading-relaxed border border-zinc-100 bg-white rounded-[2rem] p-8 shadow-inner shadow-zinc-50 focus:border-blue-600 outline-none transition-all text-zinc-700 font-medium"
              ></textarea>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="group relative overflow-hidden bg-zinc-900 text-white w-full py-6 rounded-full font-black uppercase tracking-[0.4em] text-[11px] flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-2xl shadow-blue-200/20 disabled:bg-zinc-200 disabled:shadow-none disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin text-lg" /> Synchronizing...
                </>
              ) : (
                <>
                  Transmit_Narrative{" "}
                  <FiCheckCircle className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
