"use client";

import { useState, useEffect, useCallback } from "react";
// Update: Menggunakan client utilitas terbaru
import { supabase } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiSearch,
  FiEdit3,
  FiShield,
  FiTrash2,
  FiArrowUpRight,
  FiMail,
  FiLoader,
  FiPhone,
  FiMapPin,
  FiX,
  FiPlus,
  FiSave,
} from "react-icons/fi";
import Link from "next/link";
import Swal from "sweetalert2";

export default function UserManagement() {

  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    suspended: 0,
    growth: "0%",
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "customer",
  });

  // 1. FETCH DATA
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (search) {
        // Sesuaikan kolom pencarian, ganti 'name' menjadi 'full_name' jika di DB kamu namanya itu
        query = query.ilike("full_name", `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (data) {
        setUsers(data);
        setStats({
          total: data.length,
          active: data.filter((u) => u.status === "active" || !u.status).length,
          suspended: data.filter((u) => u.status === "suspended").length,
          growth: "+12%",
        });
      }
    } catch (err: any) {
      console.error("Fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [search, supabase]);

  useEffect(() => {
    fetchUsers();

    // Realtime subscription
    const channel = supabase
      .channel("realtime-profiles")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => fetchUsers(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchUsers, supabase]);

  // 2. HANDLE CREATE / UPDATE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        full_name: formData.name, // Pastikan nama kolom sesuai tabel DB (full_name)
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        role: formData.role,
        updated_at: new Date().toISOString(),
      };

      if (formData.id) {
        const { error } = await supabase
          .from("profiles")
          .update(payload)
          .eq("id", formData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("profiles").insert([payload]);
        if (error) throw error;
      }

      Swal.fire("SUCCESS", "Database synchronized.", "success");
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      Swal.fire("Error", err.message, "error");
    }
  };

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    const result = await Swal.fire({
      title: `${newStatus.toUpperCase()} USER?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#000",
      confirmButtonText: "Update Status",
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ status: newStatus })
          .eq("id", id);
        if (error) throw error;
        fetchUsers();
        setSelectedUser(null);
      } catch (err) {
        Swal.fire("Error", "Action failed.", "error");
      }
    }
  };

  const handleUpdateRole = async (id: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      
      // Update local state for immediate feedback if selected
      if (selectedUser?.id === id) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
      
      Swal.fire({
        title: "ROLE UPDATED",
        text: `Identity access level adjusted to ${newRole.toUpperCase()}.`,
        icon: "success",
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } catch (err: any) {
      Swal.fire("Error", err.message, "error");
    }
  };

  const confirmDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: "PURGE DATA?",
      text: `Deleting ${name} is permanent.`,
      icon: "error",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase.from("profiles").delete().eq("id", id);
        if (error) throw error;
        fetchUsers();
      } catch (err) {
        Swal.fire("Error", "Action failed.", "error");
      }
    }
  };

  const openModal = (user: any = null) => {
    if (user) {
      setFormData({
        id: user.id,
        name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        role: user.role || "customer",
      });
    } else {
      setFormData({
        id: "",
        name: "",
        email: "",
        phone: "",
        address: "",
        role: "customer",
      });
    }
    setIsModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black pt-32 pb-20 px-6 relative overflow-x-hidden text-zinc-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div>
            
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-[0.9] md:leading-[0.85]">
              Management <br /> <span className="text-zinc-300 dark:text-zinc-700">Console.</span>
            </h1>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative group flex-1 md:w-80">
              <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300" />
              <input
                type="text"
                placeholder="Search Identity..."
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 pl-14 rounded-2xl text-[11px] font-bold outline-none focus:border-zinc-500 transition-all dark:text-white"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => openModal()}
              className="bg-black dark:bg-white text-white dark:text-black p-4 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-xl shadow-blue-100 dark:shadow-none"
            >
              <FiPlus size={18} /> New_User
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <KPICard
            label="Total_Database"
            value={stats.total}
            trend={stats.growth}
            icon={<FiUsers />}
            color="text-blue-600"
          />
          <KPICard
            label="Active"
            value={stats.active}
            icon={<FiUserCheck />}
            color="text-emerald-500"
          />
          <KPICard
            label="Suspended"
            value={stats.suspended}
            icon={<FiUserX />}
            color="text-red-500"
          />
          <KPICard
            label="Security"
            value="Active"
            icon={<FiShield />}
            color="text-zinc-900 dark:text-zinc-400"
          />
        </div>

        <div className="bg-white dark:bg-zinc-950 rounded-[3rem] border border-zinc-100 dark:border-zinc-900 shadow-xl shadow-zinc-200/40 dark:shadow-none overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600 bg-zinc-50/50 dark:bg-zinc-900/50">
                  <th className="p-8 italic">Identification</th>
                  <th className="p-8 italic">Status</th>
                  <th className="p-8 italic">Contact_Data</th>
                  <th className="p-8 text-right italic">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-20 text-center">
                      <FiLoader
                        className="animate-spin mx-auto text-zinc-200"
                        size={40}
                      />
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer"
                    >
                      <td className="p-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center font-black text-zinc-400 italic border border-zinc-200/50 dark:border-zinc-800 uppercase">
                            {(u.full_name || u.email)?.charAt(0) || "?"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-black italic uppercase leading-none">
                                {u.full_name || "No Name"}
                              </p>
                              {u.role === "admin" && (
                                <span className="bg-blue-500/10 text-blue-500 text-[7px] font-black px-1.5 py-0.5 rounded border border-blue-500/20 uppercase">
                                  Admin
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] font-bold text-zinc-400">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-8">
                        <span
                          className={`px-4 py-1 rounded-full text-[9px] font-black uppercase italic ${u.status === "suspended" ? "bg-red-50 dark:bg-red-950/20 text-red-500" : "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500"}`}
                        >
                          ● {u.status || "active"}
                        </span>
                      </td>
                      <td className="p-8 text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                        <div className="flex items-center gap-2">
                          <FiPhone size={10} /> {u.phone || "---"}
                        </div>
                        <div className="flex items-center gap-2 truncate max-w-[150px]">
                          <FiMapPin size={10} /> {u.address || "---"}
                        </div>
                      </td>
                      <td className="p-8 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal(u);
                            }}
                            className="p-3 bg-zinc-100 dark:bg-zinc-900 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black rounded-xl text-zinc-400 transition-all"
                          >
                            <FiEdit3 size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDelete(u.id, u.full_name);
                            }}
                            className="p-3 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL & PANEL (Tetap Sama Seperti Logika Kamu) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-zinc-950 w-full max-w-lg rounded-[3rem] p-12 shadow-2xl border border-zinc-100 dark:border-zinc-900 overflow-hidden"
            >
              <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-8">
                {formData.id ? "Modify" : "Create"} <br />{" "}
                <span className="text-zinc-300">Identity.</span>
              </h2>
              <form
                onSubmit={handleSubmit}
                className="space-y-4 text-[11px] font-bold uppercase italic"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label>Full Name</label>
                    <input
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-4 rounded-2xl outline-none focus:ring-2 ring-black dark:ring-white transition-all dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label>Email Address</label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-4 rounded-2xl outline-none focus:ring-2 ring-black dark:ring-white transition-all dark:text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label>Phone Number</label>
                  <input
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-4 rounded-2xl outline-none focus:ring-2 ring-black dark:ring-white transition-all dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label>Home Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-4 rounded-2xl outline-none focus:ring-2 ring-black dark:ring-white h-24 transition-all dark:text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <label>Access Level (Role)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["customer", "admin"].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setFormData({ ...formData, role: r })}
                        className={`p-4 rounded-2xl border text-[9px] font-black uppercase tracking-widest transition-all ${
                          formData.role === r
                            ? "bg-black dark:bg-white text-white dark:text-black border-transparent"
                            : "bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-400"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                  <button
                    type="submit"
                    className="w-full bg-black dark:bg-white text-white dark:text-black p-5 rounded-2xl flex items-center justify-center gap-3 mt-4 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all font-black italic tracking-widest uppercase shadow-xl"
                  >
                  <FiSave size={18} />{" "}
                  {formData.id ? "Sync_Update" : "Register_System"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedUser && !isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-zinc-950 shadow-2xl z-[70] p-12 overflow-y-auto border-l border-zinc-100 dark:border-zinc-900 transition-colors duration-300"
            >
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-8 right-8 p-3 hover:bg-zinc-100 rounded-full"
              >
                <FiX />
              </button>
              <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-[0.8] mb-12">
                User <br /> <span className="text-zinc-300">File.</span>
              </h2>
              <div className="space-y-8">
                <div className="flex items-center gap-6 p-6 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                  <div className="w-16 h-16 bg-white dark:bg-zinc-950 rounded-2xl flex items-center justify-center text-2xl font-black italic text-zinc-300 border border-zinc-100 dark:border-zinc-900">
                    {selectedUser.full_name?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black italic uppercase">
                      {selectedUser.full_name}
                    </h4>
                    <p className="text-[10px] font-black text-blue-600 uppercase italic">
                      {selectedUser.role}
                    </p>
                  </div>
                </div>
                <DetailRow
                  icon={<FiMail />}
                  label="Communication"
                  value={selectedUser.email}
                />
                <DetailRow
                  icon={<FiPhone />}
                  label="Hotline"
                  value={selectedUser.phone || "N/A"}
                />
                <DetailRow
                  icon={<FiMapPin />}
                  label="Location"
                  value={selectedUser.address || "N/A"}
                />
                
                <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                  <p className="text-[9px] font-black text-zinc-400 uppercase italic mb-4">Elevate / Restrict Access</p>
                  <div className="flex gap-2 bg-zinc-50 dark:bg-zinc-900 p-1 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    {["customer", "admin"].map((r) => (
                      <button
                        key={r}
                        onClick={() => handleUpdateRole(selectedUser.id, r)}
                        className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all ${
                          selectedUser.role === r
                            ? "bg-white dark:bg-zinc-800 text-blue-600 shadow-sm border border-zinc-100 dark:border-zinc-700"
                            : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="pt-10 grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      openModal(selectedUser);
                    }}
                    className="py-4 rounded-2xl bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all italic shadow-lg"
                  >
                    Modify_File
                  </button>
                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedUser.id, selectedUser.status)
                    }
                    className="py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-red-500 text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all italic"
                  >
                    Suspend_Unit
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}

function KPICard({ label, value, trend, icon, color }: any) {
  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm transition-colors duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${color} bg-opacity-10 dark:bg-opacity-20 text-xl`}>
          {icon}
        </div>
        {trend && (
          <span className="text-[10px] font-black italic text-emerald-500">
            {trend} <FiArrowUpRight className="inline" />
          </span>
        )}
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">
        {label}
      </p>
      <h3 className="text-3xl font-black italic tracking-tighter text-zinc-900 dark:text-white">
        {value}
      </h3>
    </div>
  );
}

function DetailRow({ icon, label, value }: any) {
  return (
    <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
      <div className="flex items-center gap-2 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase italic tracking-widest mb-1">
        {icon} {label}
      </div>
      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 transition-colors">{value}</p>
    </div>
  );
}
