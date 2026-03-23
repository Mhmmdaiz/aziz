"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { 
  FiMail, 
  FiTrash2, 
  FiCheckCircle, 
  FiClock, 
  FiUser, 
  FiAtSign, 
  FiMessageSquare,
  FiArrowLeft,
  FiRotateCcw
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  status: "unread" | "read" | "archived";
  created_at: string;
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactSubmission | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching messages:", error);
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from("contact_submissions")
      .update({ status: "read" })
      .eq("id", id);

    if (error) {
      alert("Gagal memperbarui status.");
    } else {
      setMessages(messages.map(m => m.id === id ? { ...m, status: "read" } : m));
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, status: "read" });
      }
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Hapus pesan ini secara permanen?")) return;

    const { error } = await supabase
      .from("contact_submissions")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Gagal menghapus pesan.");
    } else {
      setMessages(messages.filter(m => m.id !== id));
      setSelectedMessage(null);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0B0B] text-zinc-900 dark:text-zinc-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            
            <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.8]">
              Kotak <br /> <span className="text-fuchsia-500">Masuk.</span>
            </h1>
            <p className="text-zinc-500 text-sm md:text-lg italic font-medium max-w-md">
              Manajemen pesan dan feedback dari pelanggan melalui formulir kontak.
            </p>
          </div>
          <button 
            onClick={fetchMessages}
            className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <FiRotateCcw className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* List Section */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Pesan Terbaru ({messages.length})
              </span>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 rounded-[2rem] bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="p-12 rounded-[2rem] border-2 border-dashed border-zinc-100 dark:border-zinc-900 flex flex-col items-center justify-center text-center space-y-4">
                 <FiMail size={48} className="text-zinc-200 dark:text-zinc-800" />
                 <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 italic">Belum ada pesan masuk.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                {messages.map((msg) => (
                  <motion.div
                    layoutId={msg.id}
                    key={msg.id}
                    onClick={() => {
                        setSelectedMessage(msg);
                        if (msg.status === "unread") markAsRead(msg.id);
                    }}
                    className={`p-6 rounded-[2rem] border cursor-pointer transition-all duration-300 group ${
                      selectedMessage?.id === msg.id 
                        ? "bg-fuchsia-500 border-fuchsia-500 text-white shadow-xl shadow-fuchsia-500/20" 
                        : msg.status === "unread" 
                          ? "bg-zinc-50 dark:bg-zinc-950 border-fuchsia-100 dark:border-fuchsia-900/10" 
                          : "bg-white dark:bg-zinc-900/40 border-zinc-100 dark:border-zinc-800 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                       <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                          selectedMessage?.id === msg.id 
                            ? "bg-white/20" 
                            : msg.status === "unread" 
                              ? "bg-fuchsia-500 text-white" 
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                       }`}>
                          {msg.status === "unread" ? "NEW" : "READ"}
                       </span>
                       <span className={`text-[8px] font-black uppercase tracking-widest ${selectedMessage?.id === msg.id ? "text-white/60" : "text-zinc-400"}`}>
                          {new Date(msg.created_at).toLocaleDateString()}
                       </span>
                    </div>
                    <h3 className="text-lg font-black italic uppercase tracking-tight truncate mb-1">
                      {msg.name}
                    </h3>
                    <p className={`text-[10px] font-medium truncate ${selectedMessage?.id === msg.id ? "text-white/80" : "text-zinc-500"}`}>
                      {msg.message}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Detail Section */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {selectedMessage ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-8 md:p-12 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/20 shadow-2xl space-y-12 min-h-[500px] relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/5 blur-[100px] pointer-events-none" />
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-12 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="space-y-2">
                       <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">
                          <FiUser /> Identitas Pengirim
                       </div>
                       <h2 className="text-3xl font-black italic uppercase tracking-tighter">
                          {selectedMessage.name}
                       </h2>
                       <div className="flex items-center gap-2 text-sm font-bold text-fuchsia-500">
                          <FiAtSign size={14} /> {selectedMessage.email}
                       </div>
                    </div>
                    <button 
                      onClick={() => deleteMessage(selectedMessage.id)}
                      className="p-4 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all group"
                    >
                      <FiTrash2 size={20} className="group-hover:scale-110 transition-transform" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">
                        <FiMessageSquare /> Transmisi Pesan
                    </div>
                    <div className="p-8 rounded-[2rem] bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
                      <p className="text-sm md:text-lg leading-relaxed font-medium whitespace-pre-wrap italic">
                        &quot;{selectedMessage.message}&quot;
                      </p>
                    </div>
                  </div>

                  <div className="pt-12 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">
                     <div className="flex items-center gap-2">
                        <FiClock /> Terkirim pada: {new Date(selectedMessage.created_at).toLocaleString('id-ID')}
                     </div>
                     {selectedMessage.status === "read" && (
                       <div className="flex items-center gap-2 text-emerald-500">
                         <FiCheckCircle /> Sudah Dibaca
                       </div>
                     )}
                  </div>
                </motion.div>
              ) : (
                <div className="h-full min-h-[500px] border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-[3rem] flex flex-col items-center justify-center text-center p-12 space-y-4">
                  <div className="w-24 h-24 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-200 dark:text-zinc-800 mb-4">
                    <FiMessageSquare size={40} />
                  </div>
                  <h3 className="text-xl font-black italic uppercase tracking-tighter text-zinc-400">
                    Pilih Pesan <br /> Untuk Melihat Detail
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 max-w-[200px]">
                    Klik pada salah satu kartu pesan di sebelah kiri.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e4e4e7;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
        }
      `}</style>
    </div>
  );
}
