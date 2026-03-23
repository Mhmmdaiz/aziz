"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FiSave, FiX, FiUser, FiPhone } from "react-icons/fi";
import { supabase } from "@/utils/supabase/client";
import toast from "react-hot-toast";

interface ProfileEditFormProps {
  user: any;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function ProfileEditForm({ user, onCancel, onSuccess }: ProfileEditFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile updated successfully");
      onSuccess();
    } catch (error: any) {
      console.error("Supabase Profile Update Error:", error);
      toast.error("Failed to update profile: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 md:p-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-[4rem] shadow-2xl transition-colors duration-500"
    >
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-900 dark:text-white">
          Edit Profile
        </h2>
        <button
          onClick={onCancel}
          className="p-3 rounded-full hover:bg-white/10 text-zinc-500 transition-all"
        >
          <FiX size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 ml-6 italic">
              Full Name
            </label>
            <div className="relative">
               <FiUser className="absolute left-8 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600" />
               <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full pl-16 pr-8 py-6 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-white/10 focus:border-red-600 rounded-full outline-none font-bold text-zinc-900 dark:text-white transition-all text-sm tracking-tight"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 ml-6 italic">
              Phone Number
            </label>
            <div className="relative">
               <FiPhone className="absolute left-8 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600" />
               <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-16 pr-8 py-6 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-white/10 focus:border-red-600 rounded-full outline-none font-bold text-zinc-900 dark:text-white transition-all text-sm tracking-tight"
                placeholder="+62 8xx..."
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 ml-6 italic">
            Delivery Address
          </label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            rows={3}
            className="w-full px-8 py-6 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-white/10 focus:border-red-600 rounded-[2.5rem] outline-none font-bold text-zinc-900 dark:text-white transition-all text-sm tracking-tight resize-none"
            placeholder="Enter your shipping address..."
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-6 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full font-black uppercase text-[11px] tracking-[0.5em] flex items-center justify-center gap-4 hover:bg-black dark:hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent animate-spin rounded-full" />
            ) : (
              <>
                <FiSave size={18} /> SAVE CHANGES
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-12 py-6 border border-zinc-200 dark:border-white/10 hover:border-zinc-900 dark:hover:border-white/30 text-zinc-400 dark:text-zinc-500 rounded-full font-black uppercase text-[11px] tracking-[0.5em] transition-all"
          >
            CANCEL
          </button>
        </div>
      </form>
    </motion.div>
  );
}
