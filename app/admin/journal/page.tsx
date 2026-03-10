"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiLoader,
  FiHash,
  FiCreditCard,
  FiCalendar,
} from "react-icons/fi";
import { ReactNode } from "react";
import Swal from "sweetalert2";

// --- 1. DEFINISI INTERFACE (Mencegah Error TypeScript) ---
interface Post {
  id: number;
  title: string;
  slug: string;
  category: string;
  image: string | null;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface StatCardProps {
  label: string;
  value: string | number;
  unit: string;
  icon: ReactNode;
  color?: string;
}

export default function JournalList() {
  // Menggunakan tipe Post[] bukan any[] agar lolos build Vercel
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://chckt-api.railway.app";

  // --- 2. FUNGSI FETCH DATA ---
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);

      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const res = await axios.get(`${API_URL}/api/posts`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 10000, // Timeout 10 detik untuk mencegah hang
      });

      // Mapping data dari struktur Laravel
      const dataResult = res.data?.data?.data || res.data?.data || res.data;
      setPosts(Array.isArray(dataResult) ? dataResult : []);
    } catch (err: unknown) {
      // Penanganan error tanpa menggunakan 'any'
      if (axios.isAxiosError(err)) {
        console.error("Network Error Details:", err.message);
        if (err.message === "Network Error") {
          Swal.fire(
            "Koneksi Gagal",
            "Periksa koneksi internet atau CORS di Backend.",
            "error",
          );
        }
      }
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // --- 3. FUNGSI DELETE ---
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "ARE YOU SURE?",
      text: "Data yang dihapus tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#000",
      confirmButtonText: "YA, HAPUS",
      customClass: { popup: "rounded-[2.5rem]" },
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_URL}/api/posts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchPosts();
        Swal.fire("BERHASIL", "Data telah dihapus.", "success");
      } catch {
        Swal.fire("ERROR", "Gagal menghapus data.", "error");
      }
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafa] pt-24 md:pt-32 pb-20 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-black uppercase leading-tight">
              Archives_
            </h1>
            <p className="text-[9px] uppercase tracking-[0.4em] text-gray-400 mt-2 font-bold">
              Database Journal v1.0
            </p>
          </div>
          <Link
            href="/admin/journal/add"
            className="w-full md:w-auto bg-black text-white px-10 py-5 rounded-full text-[10px] font-black uppercase tracking-widest flex justify-center items-center gap-3 hover:bg-blue-600 transition-all shadow-xl"
          >
            Create_New <FiPlus className="text-lg" />
          </Link>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard
            label="01 / Total"
            value={posts.length}
            unit="Entries"
            icon={<FiHash />}
          />
          <StatCard
            label="02 / Server"
            value="Stable"
            unit="Sync"
            color="text-blue-600"
            icon={<FiCreditCard />}
          />
          <StatCard
            label="03 / Year"
            value="2026"
            unit="Active"
            icon={<FiCalendar />}
          />
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-32 text-center flex flex-col items-center gap-4">
              <FiLoader className="animate-spin text-3xl text-blue-600" />
              <span className="text-[10px] font-black uppercase tracking-[1em] text-gray-300">
                Syncing_Vault...
              </span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-50 text-[8px] uppercase tracking-[0.4em] text-gray-400">
                    <th className="text-left px-12 py-10 font-black">Image</th>
                    <th className="text-left px-6 py-10 font-black">Title</th>
                    <th className="text-left px-6 py-10 font-black hidden md:table-cell">
                      Status
                    </th>
                    <th className="text-right px-12 py-10 font-black">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {posts.map((post) => (
                    <tr
                      key={post.id}
                      className="group hover:bg-gray-50/50 transition-all duration-500"
                    >
                      <td className="px-12 py-6">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 relative">
                          <Image
                            src={
                              post.image
                                ? `${API_URL}/storage/posts/${post.image}`
                                : "/placeholder.jpg"
                            }
                            alt="thumb"
                            fill
                            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                            unoptimized // Penting untuk domain Railway agar tidak error build
                          />
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className="text-[7px] font-black text-blue-600 uppercase mb-1 block tracking-widest">
                          {post.category || "General"}
                        </span>
                        <h3 className="text-sm md:text-lg font-black uppercase italic tracking-tighter leading-none group-hover:text-blue-600">
                          {post.title}
                        </h3>
                      </td>
                      <td className="px-6 py-6 hidden md:table-cell">
                        <span className="text-[9px] font-black uppercase tracking-widest px-4 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                          {post.status || "PUBLISHED"}
                        </span>
                      </td>
                      <td className="px-12 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/journal/${post.slug}`}
                            className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-black hover:text-white transition-all"
                          >
                            <FiEye size={14} />
                          </Link>
                          <Link
                            href={`/admin/journal/edit/${post.id}`}
                            className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-black hover:text-white transition-all"
                          >
                            <FiEdit2 size={14} />
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// --- SUB-COMPONENT ---
function StatCard({
  label,
  value,
  unit,
  icon,
  color = "text-black",
}: StatCardProps) {
  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-700">
      <div className="absolute top-8 right-8 text-gray-100 group-hover:text-blue-100 text-3xl transition-colors">
        {icon}
      </div>
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">
        {label}
      </p>
      <div className="flex items-baseline gap-3">
        <h2
          className={`text-5xl font-black italic uppercase tracking-tighter ${color} leading-none`}
        >
          {value}
        </h2>
        <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
          {unit}
        </span>
      </div>
      <div className="absolute bottom-0 left-0 w-0 h-1 bg-blue-600 group-hover:w-full transition-all duration-1000"></div>
    </div>
  );
}
