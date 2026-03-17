"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";

// Types
export interface Journal {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  status: 'draft' | 'published';
  author_id: string;
  created_at: string;
  published_at: string | null;
}

// Components
import JournalHeader from "./components/JournalHeader";
import JournalSearch from "./components/JournalSearch";
import JournalTable from "./components/JournalTable";
import JournalCardMobile from "./components/JournalCardMobile";
import JournalModal from "./components/JournalModal";
import JournalForm, { JournalFormData } from "./components/JournalForm";

export default function JournalManagement() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJournal, setEditingJournal] = useState<Journal | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchJournals = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("journals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJournals(data || []);
    } catch (err: any) {
      console.error("JOURNAL_FETCH_ERROR:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJournals();

    // REALTIME SUBSCRIPTION
    const channel = supabase
      .channel("journals-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "journals" }, () => {
        fetchJournals();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchJournals]);

  const handleCreate = () => {
    setEditingJournal(null);
    setIsModalOpen(true);
  };

  const handleEdit = (journal: any) => {
    setEditingJournal(journal);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    const result = await Swal.fire({
      title: "PURGE_ARTIFACT?",
      text: `Are you certain about deleting '${title}' from the registry?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#zinc-500",
      confirmButtonText: "YES_PURGE",
      background: "#fff",
      color: "#000",
      customClass: {
        popup: "rounded-[2rem] border border-zinc-100 font-mono",
        confirmButton: "rounded-full px-8 py-3 font-black uppercase tracking-widest text-[10px]",
        cancelButton: "rounded-full px-8 py-3 font-black uppercase tracking-widest text-[10px]",
      }
    });

    if (result.isConfirmed) {
      const { error } = await supabase.from("journals").delete().eq("id", id);
      if (!error) {
        Swal.fire({
          title: "PURGED",
          text: "Registry entry removed successfully.",
          icon: "success",
          confirmButtonColor: "#000",
          customClass: { popup: "rounded-[2rem] font-mono" }
        });
      }
    }
  };

  const handleFormSubmit = async (formData: JournalFormData) => {
    try {
      setModalLoading(true);
      
      let cover_image = formData.cover_image;
      
      // Handle Image Upload if file exists
      if (formData.imageFile) {
        const file = formData.imageFile;
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `journal-covers/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("products") // Re-using working 'products' bucket
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("products")
          .getPublicUrl(filePath);
          
        cover_image = publicUrl;
      }

      const payload = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        cover_image,
        status: formData.status,
        author_id: (await supabase.auth.getUser()).data.user?.id,
        published_at: formData.status === "published" ? new Date().toISOString() : (editingJournal?.published_at || null),
      };

      if (editingJournal) {
        const { error } = await supabase
          .from("journals")
          .update(payload)
          .eq("id", editingJournal.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("journals")
          .insert([payload]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      Swal.fire({
        title: "SYNCED",
        text: "Journal registry updated successfully.",
        icon: "success",
        confirmButtonColor: "#000",
        customClass: { popup: "rounded-[2rem] font-mono" }
      });
    } catch (err: any) {
      console.error("JOURNAL_SUBMIT_ERROR_DETAIL:", err);
      const errorMsg = err.message || err.error_description || "Undefined execution error.";
      Swal.fire("Registry_Failure", errorMsg, "error");
    } finally {
      setModalLoading(false);
    }
  };

  const filteredJournals = journals.filter(j => {
    const matchesSearch = j.title.toLowerCase().includes(search.toLowerCase()) || 
                         j.slug.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <main className="min-h-screen bg-[#FBFBFD] dark:bg-black pt-24 pb-20 px-6 lg:px-12 font-mono transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        
        <JournalHeader onNew={handleCreate} />
        
        <JournalSearch 
          search={search} 
          setSearch={setSearch} 
          status={statusFilter} 
          setStatus={setStatusFilter} 
        />

        {loading ? (
          <div className="py-40 flex flex-col items-center justify-center opacity-20 dark:opacity-40 animate-pulse">
            <div className="w-12 h-12 border-4 border-black dark:border-white border-t-transparent rounded-full animate-spin mb-6" />
            <p className="font-black uppercase tracking-[0.5em] text-xs font-mono text-zinc-900 dark:text-white">Registry_Syncing...</p>
          </div>
        ) : (
          <>
            <JournalTable 
              journals={filteredJournals} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
            />
            <JournalCardMobile 
              journals={filteredJournals} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
            />
            
            {filteredJournals.length === 0 && !loading && search === "" && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-32 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-[3rem] text-center"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-zinc-50 dark:bg-zinc-900 rounded-[2rem] text-zinc-300 mb-8">
                  <div className="w-8 h-8 border-4 border-zinc-200 dark:border-zinc-800 rounded-lg flex items-center justify-center">
                    <div className="w-3 h-1 bg-zinc-200 dark:border-zinc-800" />
                  </div>
                </div>
                <h2 className="text-xl font-black italic uppercase tracking-tighter dark:text-white">Registry_Empty</h2>
                <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mt-2 px-10">No artifacts detected in the current stream.</p>
                <button 
                  onClick={handleCreate}
                  className="mt-10 px-10 py-5 bg-cyan-600 text-white rounded-full font-black uppercase tracking-widest text-[9px] hover:shadow-xl hover:shadow-cyan-500/20 active:scale-95 transition-all"
                >
                  Create_Initial_Entry
                </button>
              </motion.div>
            )}
          </>
        )}

        <JournalModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          title={editingJournal ? "Modify_Manifest" : "Initiate_New_Artifact"}
        >
          <JournalForm 
            initialData={editingJournal} 
            loading={modalLoading} 
            onSubmit={handleFormSubmit} 
          />
        </JournalModal>

        <footer className="mt-20 pt-10 border-t border-zinc-100 dark:border-zinc-900 flex justify-between text-[8px] font-black uppercase tracking-[0.5em] text-zinc-300 dark:text-zinc-800">
          <span>Void_Labs_Journal_Engine // v4.1</span>
          <span>Timestamp: {new Date().getFullYear()} Registry</span>
        </footer>
      </div>
    </main>
  );
}
