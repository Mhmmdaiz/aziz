"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
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
  const [roleFilter, setRoleFilter] = useState("all");

  // CRUD & VALIDATION STATES
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "customer",
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("http://127.0.0.1:8000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
        params: { search, role: roleFilter },
      });
      setUsers(response.data.data || []);
      setStats(
        response.data.meta?.stats || {
          total: 0,
          active: 0,
          suspended: 0,
          growth: "0%",
        },
      );
    } catch (err: any) {
      if (err.response?.status === 401) window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openModal = (user: any = null) => {
    setErrors({});
    if (user) {
      setFormData({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        address: user.address || "",
        role: user.role,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const token = localStorage.getItem("token");

    try {
      if (formData.id) {
        await axios.put(
          `http://127.0.0.1:8000/api/users/${formData.id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      } else {
        await axios.post("http://127.0.0.1:8000/api/users", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      Swal.fire({
        title: "SUCCESS",
        text: "Database synchronized.",
        icon: "success",
        confirmButtonColor: "#000",
      });
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      if (err.response && err.response.status === 422) {
        setErrors(err.response.data.errors);
      } else {
        Swal.fire("Error", "Check your database connection.", "error");
      }
    }
  };

  const handleUpdateStatus = async (id: number, currentStatus: string) => {
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
        const token = localStorage.getItem("token");
        await axios.patch(
          `http://127.0.0.1:8000/api/users/${id}/status`,
          { status: newStatus },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        fetchUsers();
        if (selectedUser?.id === id) setSelectedUser(null);
      } catch (err) {
        Swal.fire("Error", "Action failed.", "error");
      }
    }
  };

  const confirmDelete = async (id: number, name: string) => {
    const result = await Swal.fire({
      title: "PURGE DATA?",
      text: `Deleting ${name} is permanent.`,
      icon: "error",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://127.0.0.1:8000/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchUsers();
      } catch (err) {
        Swal.fire("Error", "Action failed.", "error");
      }
    }
  };

  return (
    <main className="min-h-screen bg-[#FBFBFB] pt-32 pb-20 px-6 relative overflow-x-hidden text-zinc-900">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div>
            <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4 italic">
              <Link href="/admin">Dashboard</Link> <span>/</span>{" "}
              <span className="text-blue-600">Personnel_Registry</span>
            </nav>
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-[0.9] md:leading-[0.85]">
              Management <br /> <span className="text-zinc-200">Console.</span>
            </h1>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative group flex-1 md:w-80">
              <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300" />
              <input
                type="text"
                placeholder="Search Identity..."
                className="w-full bg-white border border-zinc-100 p-4 pl-14 rounded-2xl text-[11px] font-bold outline-none focus:border-black transition-all"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => openModal()}
              className="bg-black text-white p-4 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-blue-100"
            >
              <FiPlus size={18} /> New_User
            </button>
          </div>
        </header>

        {/* KPI CARDS */}
        <div className="flex overflow-x-auto pb-4 gap-4 mb-12 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0 scrollbar-hide">
          {" "}
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
            color="text-zinc-900"
          />
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-[3rem] border border-zinc-100 shadow-xl shadow-zinc-200/40 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-300 bg-zinc-50/50">
                <th className="p-8 italic">Identification</th>
                <th className="p-8 italic">Status</th>
                <th className="p-8 italic">Contact_Data</th>
                <th className="p-8 text-right italic">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
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
                    className="group hover:bg-zinc-50/50 transition-colors cursor-pointer"
                  >
                    <td className="p-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center font-black text-zinc-400 italic border border-zinc-200/50 uppercase">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black italic uppercase leading-none mb-1">
                            {u.name}
                          </p>
                          <p className="text-[10px] font-bold text-zinc-400">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-8">
                      <span
                        className={`px-4 py-1 rounded-full text-[9px] font-black uppercase italic ${u.status === "active" ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500"}`}
                      >
                        ● {u.status}
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
                          className="p-3 bg-zinc-100 hover:bg-black hover:text-white rounded-xl text-zinc-400 transition-all"
                        >
                          <FiEdit3 size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete(u.id, u.name);
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

      {/* MODAL FORM */}
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
              className="relative bg-white w-full max-w-lg rounded-[3rem] p-12 shadow-2xl overflow-hidden"
            >
              <div className="mb-8 text-center sm:text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-2 italic">
                  Entry_Portal
                </p>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
                  {formData.id ? "Modify" : "Create"} <br />
                  <span className="text-zinc-300">Identity.</span>
                </h2>
              </div>
              <form
                onSubmit={handleSubmit}
                className="space-y-4 text-[11px] font-bold uppercase italic"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className={errors.name ? "text-red-500" : ""}>
                      Full Name
                    </label>
                    <input
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className={`w-full bg-zinc-50 border-none p-4 rounded-2xl outline-none focus:ring-2 ${errors.name ? "ring-red-500" : "ring-black"}`}
                    />
                    {errors.name && (
                      <p className="text-[9px] text-red-500 normal-case italic">
                        {errors.name[0]}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className={errors.email ? "text-red-500" : ""}>
                      Email Address
                    </label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className={`w-full bg-zinc-50 border-none p-4 rounded-2xl outline-none focus:ring-2 ${errors.email ? "ring-red-500" : "ring-black"}`}
                    />
                    {errors.email && (
                      <p className="text-[9px] text-red-500 normal-case italic">
                        {errors.email[0]}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label>Phone Number</label>
                  <input
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full bg-zinc-50 border-none p-4 rounded-2xl outline-none focus:ring-2 ring-black"
                  />
                </div>
                <div className="space-y-2">
                  <label>Home Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full bg-zinc-50 border-none p-4 rounded-2xl outline-none focus:ring-2 ring-black h-24"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-black text-white p-5 rounded-2xl flex items-center justify-center gap-3 mt-4 hover:bg-blue-600 transition-all font-black italic tracking-widest uppercase"
                >
                  <FiSave size={18} />{" "}
                  {formData.id ? "Sync_Update" : "Register_System"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAIL PANEL */}
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
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] p-12 overflow-y-auto"
            >
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-8 right-8 p-3 hover:bg-zinc-100 rounded-full"
              >
                <FiX />
              </button>
              <div className="mb-12">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-2 italic">
                  Intelligence_Brief
                </p>
                <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-[0.8]">
                  User <br /> <span className="text-zinc-300">File.</span>
                </h2>
              </div>
              <div className="space-y-8">
                <div className="flex items-center gap-6 p-6 bg-zinc-50 rounded-3xl border border-zinc-100 mb-10">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-2xl font-black italic text-zinc-300 border border-zinc-100">
                    {selectedUser.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black italic uppercase text-zinc-900">
                      {selectedUser.name}
                    </h4>
                    <p className="text-[10px] font-black text-blue-600 uppercase italic tracking-[0.2em]">
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
                <div className="pt-10 grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      openModal(selectedUser);
                    }}
                    className="py-4 rounded-2xl bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-blue-200/20 italic"
                  >
                    Modify_File
                  </button>
                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedUser.id, selectedUser.status)
                    }
                    className="py-4 rounded-2xl bg-zinc-50 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all italic"
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
    <div className="bg-white p-6 rounded-[2.5rem] border border-zinc-100 shadow-sm transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-xl`}>
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
      <h3 className="text-3xl font-black italic tracking-tighter text-zinc-900">
        {value}
      </h3>
    </div>
  );
}

function DetailRow({ icon, label, value }: any) {
  return (
    <div className="border-b border-zinc-50 pb-4">
      <div className="flex items-center gap-2 text-[9px] font-black text-zinc-300 uppercase italic tracking-widest mb-1">
        {icon} {label}
      </div>
      <p className="text-sm font-bold text-zinc-900">{value}</p>
    </div>
  );
}
