"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/utils/supabase/client";
import { FiLoader, FiLogOut, FiArrowLeft } from "react-icons/fi";
import toast from "react-hot-toast";

// Components
import ProfileHeader from "./components/ProfileHeader";
import ProfileTabs from "./components/ProfileTabs";
import ProfileOverview from "./components/ProfileOverview";
import ProfileEditForm from "./components/ProfileEditForm";
import ProfileOrders from "./components/ProfileOrders";
import ProfileAddress from "./components/ProfileAddress";
import UpdatePasswordModal from "./components/UpdatePasswordModal";

export default function UserDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/auth?redirect=/dashboard");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Profile fetch error:", error);
        setUser({ ...session.user, full_name: session.user.user_metadata?.full_name || "User" });
      } else {
        setUser({ ...session.user, ...profile });
      }
    } catch (error) {
      console.error("Dashboard init error:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUser();

    // Subscribe to profile changes
    const channel = supabase
      .channel('profile_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          if (payload.new.id === user?.id) {
            fetchUser();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchUser, user?.id]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Logout failed: " + error.message);
    } else {
      toast.success("Logged out successfully");
      router.push("/auth");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center gap-6 transition-colors duration-500">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="w-12 h-12 border-4 border-zinc-100 dark:border-white/5 border-t-red-600 rounded-full"
        />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 dark:text-zinc-500 animate-pulse font-sans">
          Loading Dashboard...
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white font-sans selection:bg-red-600 selection:text-white transition-colors duration-500">
      {/* Back to Shop Navigation */}
      

      <ProfileHeader user={user} onUpdate={fetchUser} />
      
      <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="container mx-auto px-6 py-12 md:py-20">
        <AnimatePresence mode="wait">
          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="max-w-5xl mx-auto"
            >
              {isEditing ? (
                <ProfileEditForm 
                  user={user} 
                  onCancel={() => setIsEditing(false)} 
                  onSuccess={() => {
                    setIsEditing(false);
                    fetchUser();
                  }}
                />
              ) : (
                <ProfileOverview 
                  user={user} 
                  onEdit={() => setIsEditing(true)} 
                  onChangePassword={() => setIsPasswordModalOpen(true)}
                />
              )}
            </motion.div>
          )}

          {activeTab === "orders" && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="max-w-4xl mx-auto"
            >
              <ProfileOrders userId={user?.id} />
            </motion.div>
          )}

          {activeTab === "address" && (
            <motion.div
              key="address"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="max-w-4xl mx-auto"
            >
              <ProfileAddress user={user} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Logout for Mobile */}
        <div className="mt-20 flex justify-center">
          <button 
            onClick={handleLogout}
            className="px-10 py-5 bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white border border-red-600/20 rounded-full text-[10px] font-black uppercase tracking-[0.4em] transition-all active:scale-95 flex items-center gap-3"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </div>

      <UpdatePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </main>
  );
}
