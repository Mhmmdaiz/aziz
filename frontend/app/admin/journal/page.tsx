"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
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
import Swal from "sweetalert2";

export default function JournalList() {
  // FIX: Menggunakan any[] untuk menghindari error "Type any is not assignable to type never"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [posts, setPosts] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);

  // Ambil URL API dari env atau fallback ke railway
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://chckt-api.railway.app";

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const res = await axios.get(`${API_URL}/api/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const dataResult = res.data?.data || res.data;
      setPosts(Array.isArray(dataResult) ? dataResult : []);
    } catch (err: unknown) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "ARE YOU SURE?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#000",
      customClass: { popup: "rounded-[2.5rem]" },
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_URL}/api/posts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchPosts();
        Swal.fire("DELETED", "Record has been erased.", "success");
      } catch (err) {
        Swal.fire("ERROR", "Delete failed", "error");
      }
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafa] pt-24 md:pt-32 pb-20 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="w-full md:w-auto">
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-black uppercase leading-tight">
              Archives_
            </h1>
            <p className="text-[9px] uppercase tracking-[0.4em] text-gray-400 mt-2 font-bold">
              Managing digital brand records
            </p>
          </div>
          <Link
            href="/admin/journal/add"
            className="w-full md:w-auto bg-black text-white px-10 py-5 rounded-full text-[10px] font-black uppercase tracking-widest flex justify-center items-center gap-3 hover:bg-blue-600 transition-all shadow-xl"
          >
            Create_New <FiPlus className="text-lg" />
          </Link>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-3 gap-2 md:gap-6 mb-12">
          <StatCard
            label="01 / Journal"
            value={posts.length}
            unit="Entries"
            icon={<FiHash />}
          />
          <StatCard
            label="02 / Database"
            value="Stable"
            unit="Sync"
            color="text-blue-600"
            icon={<FiCreditCard />}
          />
          <StatCard
            label="03 / Status"
            value="Active"
            unit="2026"
            icon={<FiCalendar />}
          />
        </div>

        {/* CONTENT AREA */}
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-[0_40px_100px_rgba(0,0,0,0.03)] overflow-hidden">
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
                    <th className="text-left px-6 md:px-12 py-10 font-black">
                      Ref_Image
                    </th>
                    <th className="text-left px-6 py-10 font-black">
                      Narrative_Details
                    </th>
                    <th className="text-left px-6 py-10 font-black hidden md:table-cell">
                      Status
                    </th>
                    <th className="text-right px-6 md:px-12 py-10 font-black">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {posts.map((post: any) => (
                    <tr
                      key={post.id}
                      className="group hover:bg-gray-50/50 transition-all duration-500"
                    >
                      <td className="px-6 md:px-12 py-6">
                        <div className="w-14 h-14 md:w-20 md:h-20 bg-gray-50 rounded-[1rem] md:rounded-[1.5rem] overflow-hidden border border-gray-100">
                          <img
                            src={`${API_URL}/storage/${post.image}`}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                            alt="thumb"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className="text-[7px] md:text-[8px] font-black text-blue-600 uppercase mb-1 block tracking-widest">
                          {post.category || "General"}
                        </span>
                        <h3 className="text-sm md:text-lg font-black uppercase italic tracking-tighter leading-none group-hover:text-blue-600 transition-colors">
                          {post.title}
                        </h3>
                      </td>
                      <td className="px-6 py-6 hidden md:table-cell">
                        <span className="text-[9px] font-black uppercase tracking-widest px-4 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                          {post.status || "PUBLISHED"}
                        </span>
                      </td>
                      <td className="px-6 md:px-12 py-6 text-right">
                        <div className="flex justify-end gap-1 md:gap-2">
                          <Link
                            href={`/journal/${post.id}`}
                            className="p-2 md:p-3.5 bg-white border border-gray-100 rounded-xl hover:bg-black hover:text-white transition-all"
                          >
                            <FiEye size={14} />
                          </Link>
                          <Link
                            href={`/admin/journal/edit/${post.id}`}
                            className="p-2 md:p-3.5 bg-white border border-gray-100 rounded-xl hover:bg-black hover:text-white transition-all"
                          >
                            <FiEdit2 size={14} />
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="p-2 md:p-3.5 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"
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

function StatCard({ label, value, unit, icon, color = "text-black" }: any) {
  return (
    <div className="bg-white p-4 md:p-10 rounded-[1.2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-700">
      <div className="hidden md:block absolute top-8 right-8 text-gray-100 group-hover:text-blue-100 transition-colors text-3xl">
        {icon}
      </div>
      <p className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1 md:mb-2">
        {label}
      </p>
      <div className="flex flex-col md:flex-row items-baseline gap-1 md:gap-3">
        <h2
          className={`text-xl md:text-5xl font-black italic uppercase tracking-tighter ${color} leading-none`}
        >
          {value}
        </h2>
        <span className="text-[6px] md:text-[9px] font-black text-gray-300 uppercase tracking-widest leading-none">
          {unit}
        </span>
      </div>
      <div className="absolute bottom-0 left-0 w-0 h-1 bg-blue-600 group-hover:w-full transition-all duration-1000"></div>
    </div>
  );
}
