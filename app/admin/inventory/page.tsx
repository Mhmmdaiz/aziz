"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { FiBox, FiPlus, FiEdit3, FiTrash2, FiSearch, FiAlertCircle } from "react-icons/fi";
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
      title: "Delete_Artifact?",
      text: `Are you sure you want to delete ${name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#000",
      confirmButtonText: "DELETE_NOW",
    });

    if (result.isConfirmed) {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (!error) {
        Swal.fire("Deleted!", "Product has been removed.", "success");
        fetchProducts();
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-[0.5em]">Syncing_Inventory...</div>;

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black pt-24 pb-12 px-6 lg:px-12 font-mono transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-4 italic">Artifact_Repository // v2.0</p>
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-[0.8] text-zinc-900 dark:text-white">
              Inventory <br /> <span className="text-zinc-200 dark:text-zinc-800">Registry.</span>
            </h1>
          </motion.div>
          
          <Link
            href="/admin/add-product"
            className="flex items-center gap-3 bg-blue-600 text-white px-8 py-5 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <FiPlus size={16} /> New_Product
          </Link>
        </header>

        {/* SEARCH & FILTERS */}
        <div className="relative">
          <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text"
            placeholder="Search_By_Name_Or_Category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] pl-16 pr-8 py-6 text-sm font-bold placeholder:text-zinc-300 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
          />
        </div>

        {/* TABLE WRAPPER */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-[2.5rem] shadow-sm dark:shadow-none overflow-hidden">
          <div className="overflow-x-auto">
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
                  <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                    <td className="p-8">
                      <div className="w-16 h-16 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                        <img src={p.image_url || "/placeholder.jpg"} className="w-full h-full object-cover" alt="" />
                      </div>
                    </td>
                    <td className="p-8">
                      <p className="text-xs font-black uppercase italic dark:text-white">{p.name}</p>
                      <p className="text-[9px] font-bold text-zinc-400 uppercase mt-1">Category: {p.category || "UNIDENTIFIED"}</p>
                    </td>
                    <td className="p-8 text-sm">
                      <div className="flex items-center gap-3">
                        <span className={`font-black ${p.stock < 10 ? "text-red-500" : "dark:text-white"}`}>{p.stock}</span>
                        {p.stock < 5 && <FiAlertCircle className="text-red-500 animate-pulse" />}
                      </div>
                      <div className="w-20 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full mt-2 overflow-hidden">
                        <div className={`h-full ${p.stock < 10 ? "bg-red-500" : "bg-emerald-500"}`} style={{ width: `${Math.min((p.stock/20)*100, 100)}%` }} />
                      </div>
                    </td>
                    <td className="p-8 font-black text-sm italic dark:text-zinc-200">
                      Rp {p.price?.toLocaleString()}
                    </td>
                    <td className="p-8 text-right">
                      <div className="flex justify-end gap-2">
                        <Link 
                          href={`/admin/edit-product/${p.id}`}
                          className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl hover:bg-blue-500 hover:text-white transition-all border border-zinc-200 dark:border-zinc-800"
                        >
                          <FiEdit3 size={14} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl hover:bg-red-500 dark:hover:bg-red-600 hover:text-white transition-all border border-zinc-200 dark:border-zinc-800"
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

      </div>
    </main>
  );
}
