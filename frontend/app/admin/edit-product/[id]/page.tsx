"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiPlus, FiX, FiSave, FiRefreshCw } from "react-icons/fi";
import Swal from "sweetalert2";

export default function EditProduct() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
  });
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<any[]>([]);

  // Baris 25: Fixed useEffect Dependency Array
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/products/${id}`);
        const product = res.data.data;
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
        });

        if (product.images) {
          const formatted = product.images.map((img: any) => ({
            id: img.id,
            url: `http://127.0.0.1:8000/storage/${img.image_path}`,
            isNew: false,
          }));
          setPreviews(formatted);
        }
      } catch (err) {
        router.push("/admin/dashboard");
      } finally {
        setFetching(false);
      }
    };
    if (id) fetchProduct();
  }, [id]); // Hanya ID agar tidak error "changed size between renders"

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      if (previews.length + selected.length > 7)
        return Swal.fire("Limit", "Maksimal 7 foto!", "warning");

      setNewImages((prev) => [...prev, ...selected]);
      const newPreviews = selected.map((file) => ({
        url: URL.createObjectURL(file),
        isNew: true,
        file: file,
      }));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = async (index: number) => {
    const target = previews[index];
    const res = await Swal.fire({
      title: "Hapus Foto?",
      text: target.isNew
        ? "Foto belum disimpan."
        : "Hapus permanen dari server?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#000",
    });

    if (res.isConfirmed) {
      if (!target.isNew) {
        try {
          await axios.delete(
            `http://127.0.0.1:8000/api/product-images/${target.id}`,
          );
          setPreviews((prev) => prev.filter((_, i) => i !== index));
          Swal.fire("Deleted", "Foto dihapus", "success");
        } catch (err) {
          Swal.fire("Error", "Gagal hapus", "error");
        }
      } else {
        setPreviews((prev) => prev.filter((_, i) => i !== index));
        setNewImages((prev) => prev.filter((f) => f !== target.file));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append("_method", "PUT");
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("stock", formData.stock);
    newImages.forEach((file) => data.append("images[]", file));

    try {
      await axios.post(`http://127.0.0.1:8000/api/products/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await Swal.fire("SUCCESS", "Product Updated!", "success");
      router.push("/admin/dashboard");
    } catch (err) {
      Swal.fire("FAILED", "Error", "error");
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div className="h-screen flex items-center justify-center font-black animate-pulse text-gray-400">
        SYNCING...
      </div>
    );

  return (
    <main className="min-h-screen bg-[#f3f4f6] p-8 pt-24">
      <div className="max-w-6xl mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        {/* LEFT: GALLERY AREA (Tombol X Muncul Saat Hover) */}
        <div className="p-10 bg-gray-50/50 border-r border-gray-100">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-8">
            Assets Gallery ({previews.length}/7)
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {previews.map((item, i) => (
              <div
                key={i}
                className="aspect-square rounded-[2rem] overflow-hidden relative group shadow-sm border-2 border-white"
              >
                <img
                  src={item.url}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  alt=""
                />

                {/* Tombol X (Hover) */}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-3 right-3 z-30 p-2 bg-white rounded-full text-red-500 shadow-xl opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all transform hover:rotate-90"
                >
                  <FiX size={16} />
                </button>
              </div>
            ))}

            {previews.length < 7 && (
              <label className="aspect-square rounded-[2rem] border-2 border-dashed border-gray-200 bg-white flex items-center justify-center cursor-pointer hover:border-black transition-all">
                <input
                  type="file"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  accept="image/*"
                />
                <FiPlus size={24} className="text-gray-300" />
              </label>
            )}
          </div>
        </div>

        {/* RIGHT: FORM AREA */}
        <form onSubmit={handleSubmit} className="p-10 md:p-16 space-y-10">
          <div className="flex justify-between items-center">
            <Link
              href="/admin/dashboard"
              className="p-4 bg-gray-50 rounded-full hover:bg-black hover:text-white transition-all"
            >
              <FiArrowLeft size={18} />
            </Link>
            <h1 className="text-4xl font-black italic uppercase">Edit.</h1>
          </div>

          <div className="space-y-6">
            <input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full text-2xl font-bold border-b-2 py-3 outline-none focus:border-black bg-transparent"
              placeholder="Name"
            />
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full p-6 bg-gray-50 rounded-[2rem] outline-none"
              placeholder="Details"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="p-5 bg-gray-50 rounded-2xl font-bold"
                placeholder="Price"
              />
              <input
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                className="p-5 bg-gray-50 rounded-2xl font-bold"
                placeholder="Stock"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-8 bg-black text-white rounded-[2.5rem] font-black tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-3"
          >
            {loading ? (
              <FiRefreshCw className="animate-spin" />
            ) : (
              "UPDATE & SYNC"
            )}{" "}
            <FiSave size={18} />
          </button>
        </form>
      </div>
    </main>
  );
}
