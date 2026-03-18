"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import {
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiSearch,
  FiAlertCircle,
} from "react-icons/fi";
import Link from "next/link";
import Swal from "sweetalert2";

interface Product {
  id: string;
  name: string;
  stock: number;
  price: number;
  category: string;
  image_url: string;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error("Error fetching products:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: "DELETE_ARTIFACT?",
      text: `Are you sure you want to delete ${name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#000",
      confirmButtonText: "DELETE_NOW",
      background: "#000",
      color: "#fff",
    });

    if (result.isConfirmed) {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (!error) {
        Swal.fire("DELETED!", "Product removed.", "success");
        fetchProducts();
      }
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center text-center font-black animate-pulse uppercase tracking-[0.5em] text-zinc-400">
        Syncing_Inventory...
      </div>
    );

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black pt-20 pb-12 px-5 md:px-12 font-mono transition-colors duration-300 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mt-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="pl-1 md:pl-0" // Menjaga teks tidak menempel ke tepi layar mobile
          >
            <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase leading-[0.85] text-zinc-900 dark:text-white">
              Inventory <br />{" "}
              <span className="text-zinc-300 dark:text-zinc-800">
                Registry.
              </span>
            </h1>
          </motion.div>

          <Link
            href="/admin/add-product"
            className="w-full md:w-auto flex items-center justify-center gap-3 bg-blue-600 text-white px-8 py-5 rounded-2xl md:rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all active:scale-95"
          >
            <FiPlus size={16} /> New_Product
          </Link>
        </header>

        {/* SEARCH */}
        <div className="relative group">
          <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="SEARCH_MANIFEST..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl md:rounded-[2rem] pl-16 pr-8 py-5 md:py-6 text-xs md:text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
          />
        </div>

        {/* CONTENT AREA */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-[2rem] md:rounded-[2.5rem] shadow-sm overflow-hidden">
          {/* MOBILE VIEW (Card List) */}
          <div className="md:hidden divide-y divide-zinc-100 dark:divide-zinc-900">
            {filteredProducts.map((p) => (
              <div key={p.id} className="p-5 space-y-4">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden bg-zinc-100 flex-shrink-0">
                    <img
                      src={p.image_url || "/placeholder.jpg"}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase italic truncate dark:text-white">
                      {p.name}
                    </p>
                    <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tight mt-0.5">
                      Cat: {p.category || "UNIDENTIFIED"}
                    </p>
                    <p className="text-xs font-black italic mt-2 text-blue-600 dark:text-blue-400">
                      Rp {p.price?.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black ${p.stock < 10 ? "text-red-500" : "dark:text-zinc-400"}`}
                      >
                        STOCK: {p.stock}
                      </span>
                      {p.stock < 5 && (
                        <FiAlertCircle className="text-red-500 text-xs animate-pulse" />
                      )}
                    </div>
                    <div className="w-24 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${p.stock < 10 ? "bg-red-500" : "bg-emerald-500"}`}
                        style={{
                          width: `${Math.min((p.stock / 20) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/admin/edit-product/${p.id}`}
                      className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl"
                    >
                      <FiEdit3 size={14} className="dark:text-white" />
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl active:bg-red-500 active:text-white transition-colors"
                    >
                      <FiTrash2 size={14} className="text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP VIEW (Table) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] font-black uppercase tracking-[0.3em] bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-400 dark:text-zinc-600 border-b border-zinc-100 dark:border-zinc-900">
                  <th className="p-8">Image</th>
                  <th className="p-8">Artifact_Details</th>
                  <th className="p-8">Stock_Level</th>
                  <th className="p-8">Valuation</th>
                  <th className="p-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900">
                {filteredProducts.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors group"
                  >
                    <td className="p-8">
                      <div className="w-16 h-16 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                        <img
                          src={p.image_url || "/placeholder.jpg"}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      </div>
                    </td>
                    <td className="p-8">
                      <p className="text-xs font-black uppercase italic dark:text-white">
                        {p.name}
                      </p>
                      <p className="text-[9px] font-bold text-zinc-400 uppercase mt-1">
                        Category: {p.category || "UNIDENTIFIED"}
                      </p>
                    </td>
                    <td className="p-8">
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-black ${p.stock < 10 ? "text-red-500" : "dark:text-white"}`}
                        >
                          {p.stock}
                        </span>
                        {p.stock < 5 && (
                          <FiAlertCircle className="text-red-500 animate-pulse" />
                        )}
                      </div>
                      <div className="w-20 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full mt-2 overflow-hidden">
                        <div
                          className={`h-full ${p.stock < 10 ? "bg-red-500" : "bg-emerald-500"}`}
                          style={{
                            width: `${Math.min((p.stock / 20) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </td>
                    <td className="p-8 font-black text-sm italic dark:text-zinc-200">
                      Rp {p.price?.toLocaleString()}
                    </td>
                    <td className="p-8 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/admin/edit-product/${p.id}`}
                          className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl hover:bg-blue-500 hover:text-white border border-zinc-200 dark:border-zinc-800"
                        >
                          <FiEdit3 size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl hover:bg-red-500 dark:hover:bg-red-600 hover:text-white border border-zinc-200 dark:border-zinc-800"
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
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-20 text-center italic font-black uppercase text-zinc-300 dark:text-zinc-800 tracking-[0.3em]">
            Zero_Artifacts_Found
          </div>
        )}
      </div>
    </main>
  );
}
