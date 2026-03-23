"use client";

import { motion } from "framer-motion";
import { FiCamera, FiEdit3 } from "react-icons/fi";
import { supabase } from "@/utils/supabase/client";
import { useState } from "react";
import toast from "react-hot-toast";

interface ProfileHeaderProps {
  user: any;
  onUpdate?: () => void;
}

export default function ProfileHeader({ user, onUpdate }: ProfileHeaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("assets")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("assets")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) {
        console.error("Profile Update Error:", updateError);
        // Special message if column is missing
        if (updateError.message.includes("column") || updateError.code === "PGRST204") {
          toast.error("Column 'avatar_url' not found in profiles table. Run SQL: `ALTER TABLE profiles ADD COLUMN avatar_url TEXT;` in Supabase Dashboard.");
          return;
        }
        throw updateError;
      }

      toast.success("Profile picture updated");
      if (onUpdate) onUpdate();
    } catch (error: any) {
      console.error("Supabase Avatar Upload/Update Error:", error);
      toast.error("Upload failed: " + (error.message || "Unknown error"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="relative w-full min-h-[480px] md:h-[550px] overflow-hidden bg-zinc-100 dark:bg-zinc-900 transition-colors duration-500">
      {/* Background Image (Campaign Visual) */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2000&auto=format&fit=crop"
          alt="Campaign"
          className="w-full h-full object-cover opacity-60 dark:opacity-40 grayscale scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent dark:from-black dark:via-black/40 dark:to-transparent" />
        <div className="absolute inset-0 bg-white/20 dark:bg-black/40 md:bg-transparent" />
      </div>

      <div className="container mx-auto px-6 h-full flex flex-col justify-end pt-32 pb-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10"
        >
          {/* Avatar Container */}
          <div className="relative group shrink-0">
            <div className="w-28 h-28 md:w-44 md:h-44 rounded-[2.2rem] md:rounded-[2.5rem] bg-white dark:bg-black p-1.5 shadow-2xl overflow-hidden border border-zinc-200 dark:border-white/10 ring-1 ring-zinc-100 dark:ring-white/5 transition-transform duration-500 group-hover:scale-[1.02]">
              <img
                src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.full_name || "User"}&background=000&color=fff&bold=true`}
                alt="Avatar"
                className="w-full h-full object-cover rounded-[2.2rem]"
              />
            </div>

            <label className="absolute bottom-2 right-2 p-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl cursor-pointer hover:bg-red-600 hover:text-white shadow-xl transition-all active:scale-90 group/btn border border-white/20">
              {uploading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent animate-spin rounded-full" />
              ) : (
                <FiCamera size={20} />
              )}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploading}
              />
            </label>
          </div>

          {/* User Info */}
          <div className="text-center md:text-left flex-1 min-w-0">
            
            <h1 className="text-4xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.85] text-zinc-900 dark:text-white">
              {user?.full_name?.split(" ")[0]} <br />
              <span className="text-zinc-400 dark:text-zinc-500">{user?.full_name?.split(" ").slice(1).join(" ") || "ACCOUNT"}</span>
            </h1>
            <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-4">
              <div className="px-4 py-1.5 bg-zinc-900/5 dark:bg-white/5 backdrop-blur-md border border-zinc-200 dark:border-white/10 rounded-full flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  {user?.role || "MEMBER"}
                </span>
              </div>
              <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                {user?.email}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
