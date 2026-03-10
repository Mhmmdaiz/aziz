"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Shield,
  Settings,
  Activity,
  Edit3,
  Mail,
  Phone,
  Globe,
  Lock,
  Smartphone,
  LogOut,
  Camera,
  Save,
  RefreshCcw,
  CheckCircle,
  ChevronRight,
  Key,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import Swal from "sweetalert2";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const profileSchema = z.object({
  name: z.string().min(3, "Minimal 3 karakter"),
  username: z.string().min(3, "Minimal 3 karakter"),
  phone: z.string().min(10, "Nomor telepon tidak valid"),
  bio: z.string().max(160, "Maksimal 160 karakter").optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchProfile(token);
  }, []);

  const fetchProfile = async (token: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      setUser(res.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.clear();
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Terminate_Session?",
      text: "You will be disconnected from the archive.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#000",
      confirmButtonText: "LOGOUT",
      cancelButtonText: "STAY",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        router.push("/login");
      }
    });
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center font-black uppercase tracking-[0.4em] italic opacity-20 bg-white text-black">
        Syncing_Data_Stream...
      </div>
    );

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-black font-sans pt-32 md:pt-44 pb-20 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* PROFILE HEADER - Anti Overflow */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative shrink-0"
          >
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[3.5rem] bg-black p-1.5 shadow-2xl overflow-hidden transform hover:rotate-3 transition-transform duration-500">
              <img
                src={`https://ui-avatars.com/api/?name=${user?.name}&background=000&color=fff&bold=true&font-size=0.3`}
                alt="Avatar"
                className="w-full h-full object-cover rounded-[3.2rem]"
              />
            </div>
            <label className="absolute bottom-1 right-1 p-3 bg-white border-4 border-[#FAFAFA] rounded-2xl cursor-pointer hover:scale-110 shadow-xl transition-all">
              <Camera size={18} />
              <input type="file" className="hidden" />
            </label>
          </motion.div>

          <div className="text-center md:text-left space-y-2 min-w-0 flex-1">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-600 block">
              Identity_Record_01
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black italic uppercase tracking-tighter leading-none break-words">
              {user?.name}
              <span className="text-zinc-200">.</span>
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="px-3 py-1 bg-zinc-900 text-white text-[8px] font-black uppercase tracking-widest rounded-full shrink-0">
                {user?.role || "Collector"}
              </span>
              <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-[0.2em] truncate max-w-full">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* SIDEBAR NAVIGATION */}
          <nav className="lg:col-span-3 flex lg:flex-col overflow-x-auto lg:overflow-visible no-scrollbar gap-3 lg:sticky lg:top-44 z-20 pb-4">
            {[
              { id: "overview", label: "Overview", icon: User },
              { id: "edit", label: "Edit_Profile", icon: Edit3 },
              { id: "security", label: "Security", icon: Shield },
              { id: "activity", label: "Activity", icon: Activity },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center justify-between px-8 py-5 rounded-[2.2rem] font-black transition-all border-2 ${
                  activeTab === tab.id
                    ? "bg-black text-white border-black shadow-lg scale-[1.02]"
                    : "bg-white text-zinc-400 border-zinc-50 hover:border-zinc-200"
                }`}
              >
                <div className="flex items-center gap-4">
                  <tab.icon size={18} />
                  <span className="uppercase tracking-[0.2em] text-[10px] italic">
                    {tab.label}
                  </span>
                </div>
                {activeTab === tab.id && (
                  <ChevronRight size={14} className="hidden lg:block" />
                )}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="flex-shrink-0 flex items-center gap-4 px-8 py-5 rounded-[2.2rem] font-black text-red-500 bg-red-50/30 border-2 border-transparent hover:bg-red-500 hover:text-white transition-all mt-4 lg:mt-10"
            >
              <LogOut size={18} />
              <span className="uppercase tracking-[0.2em] text-[10px] italic">
                Term_Session
              </span>
            </button>
          </nav>

          {/* CONTENT PANEL */}
          <section className="lg:col-span-9 min-h-[500px] min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white border-2 border-zinc-50 rounded-[3rem] md:rounded-[4rem] p-6 md:p-16 shadow-sm overflow-hidden"
              >
                {activeTab === "overview" && <OverviewTab user={user} />}
                {activeTab === "edit" && (
                  <EditProfileTab
                    user={user}
                    refresh={() => fetchProfile(localStorage.getItem("token")!)}
                  />
                )}
                {activeTab === "security" && <SecurityTab />}
                {activeTab === "activity" && <ActivityTab />}
              </motion.div>
            </AnimatePresence>
          </section>
        </div>
      </div>
    </main>
  );
}

function OverviewTab({ user }: { user: any }) {
  const data = [
    { label: "Account_Name", value: user?.name, icon: User },
    { label: "Email_Protocol", value: user?.email, icon: Mail },
    {
      label: "Handle_Alias",
      value: `@${user?.name?.toLowerCase().replace(/\s/g, "_")}`,
      icon: Globe,
    },
    {
      label: "Security_Status",
      value: "Verified_Collector",
      icon: CheckCircle,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {data.map((item, i) => (
        <div
          key={i}
          className="p-8 md:p-10 bg-zinc-50 rounded-[3rem] border border-transparent hover:border-zinc-200 transition-all group overflow-hidden"
        >
          <div className="p-4 bg-white rounded-2xl w-fit mb-6 shadow-sm text-zinc-300 group-hover:text-black transition-colors">
            <item.icon size={24} />
          </div>
          <p className="text-[9px] font-black uppercase text-zinc-300 tracking-[0.3em] mb-2">
            {item.label}
          </p>
          <p className="font-black uppercase italic text-lg md:text-xl tracking-tighter break-all lg:break-words leading-tight">
            {item.value || "Not_Set"}
          </p>
        </div>
      ))}
    </div>
  );
}

function EditProfileTab({ user, refresh }: { user: any; refresh: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name,
      username: user?.name?.toLowerCase().replace(/\s/g, ""),
      phone: "08123456789",
      bio: user?.bio || "",
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/user/update`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire({
        icon: "success",
        title: "DATA_SYNCED",
        text: "Profile updated.",
        background: "#fff",
        color: "#000",
        confirmButtonColor: "#000",
      });
      refresh();
    } catch (err) {
      Swal.fire({ icon: "error", title: "SYNC_FAILED" });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300 ml-4">
            Subject_Name
          </label>
          <input
            {...register("name")}
            className="w-full px-8 py-6 bg-zinc-50 border-2 border-transparent focus:border-black rounded-[2.5rem] outline-none font-black italic transition-all text-lg"
          />
          {errors.name && (
            <p className="text-red-500 text-[8px] font-black uppercase ml-4">
              {errors.name.message}
            </p>
          )}
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300 ml-4">
            Contact_Line
          </label>
          <input
            {...register("phone")}
            className="w-full px-8 py-6 bg-zinc-50 border-2 border-transparent focus:border-black rounded-[2.5rem] outline-none font-black italic transition-all text-lg"
          />
        </div>
      </div>
      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300 ml-4">
          Subject_Biography
        </label>
        <textarea
          {...register("bio")}
          rows={4}
          className="w-full px-8 py-6 bg-zinc-50 border-2 border-transparent focus:border-black rounded-[2.5rem] outline-none font-black italic transition-all text-lg resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full md:w-fit px-14 py-6 bg-black text-white rounded-full font-black uppercase tracking-[0.4em] text-[11px] flex items-center justify-center gap-4 active:scale-95 shadow-2xl transition-all"
      >
        <Save size={18} /> {isSubmitting ? "SYNCING..." : "COMMIT_CHANGES"}
      </button>
    </form>
  );
}

function SecurityTab() {
  return (
    <div className="space-y-12">
      <div className="p-10 md:p-12 bg-zinc-950 text-white rounded-[3.5rem] relative overflow-hidden shadow-2xl">
        <Shield
          className="absolute right-[-40px] top-[-40px] opacity-10"
          size={250}
        />
        <div className="relative z-10">
          <h4 className="text-3xl font-black uppercase italic tracking-tighter mb-4 text-blue-500">
            Security_Level_01
          </h4>
          <p className="text-zinc-500 text-[10px] font-bold tracking-[0.4em] uppercase mb-10">
            AES_Standard_Encryption
          </p>
          <button className="px-10 py-5 bg-white text-black rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-zinc-200 transition-all flex items-center gap-3">
            <Key size={16} /> REFRESH_KEY
          </button>
        </div>
      </div>
      <div className="p-6 md:p-8 border-2 border-zinc-50 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-zinc-200 transition-all overflow-hidden">
        <div className="flex items-center gap-6 min-w-0 w-full md:w-auto">
          <div className="p-4 bg-zinc-50 rounded-2xl text-zinc-400 shrink-0">
            <Smartphone size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-black text-lg uppercase italic tracking-tighter truncate">
              Desktop_Client (MacOS)
            </p>
            <p className="text-[10px] text-zinc-400 font-bold tracking-[0.2em] truncate">
              IP: 182.253.xx.xx • JAKARTA, ID
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
          <span className="text-[9px] font-black uppercase text-green-500 tracking-widest">
            Active_Now
          </span>
          <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
        </div>
      </div>
    </div>
  );
}

function ActivityTab() {
  return (
    <div className="py-20 text-center space-y-6">
      <div className="relative w-20 h-20 mx-auto">
        <RefreshCcw size={60} className="text-zinc-100 animate-spin-slow" />
        <Activity
          size={24}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-200"
        />
      </div>
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.5em] text-zinc-300 italic">
          Syncing_Historical_Logs...
        </p>
      </div>
    </div>
  );
}
