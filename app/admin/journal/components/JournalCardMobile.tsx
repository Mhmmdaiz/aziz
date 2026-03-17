"use client";

import { motion } from "framer-motion";
import { Edit3, Trash2, Calendar } from "lucide-react";

import { Journal } from "../page";

interface JournalCardMobileProps {
  journals: Journal[];
  onEdit: (journal: Journal) => void;
  onDelete: (id: string, title: string) => void;
}

export default function JournalCardMobile({ journals, onEdit, onDelete }: JournalCardMobileProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:hidden">
      {journals.length > 0 ? (
        journals.map((j, i) => (
          <motion.div
            key={j.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-[2rem] overflow-hidden shadow-sm p-6"
          >
            <div className="flex gap-4">
              <div className="w-24 h-24 rounded-2xl border border-zinc-100 dark:border-zinc-900 overflow-hidden shrink-0">
                <img src={j.cover_image || "/placeholder.jpg"} className="w-full h-full object-cover" alt={j.title} />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className={`px-2 py-0.5 text-[7px] font-black border rounded-full uppercase tracking-widest ${
                      j.status === "published" 
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                      : "bg-zinc-100 text-zinc-400 border-zinc-200"
                    }`}>
                      {j.status}
                    </span>
                    <span className="text-[8px] font-bold text-zinc-400 uppercase flex items-center gap-1">
                      <Calendar size={10} /> {new Date(j.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-sm font-black uppercase italic dark:text-white truncate">{j.title}</h3>
                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter mt-1">slug://{j.slug}</p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => onEdit(j)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-white transition-all"
                  >
                    <Edit3 size={12} /> Edit
                  </button>
                  <button 
                    onClick={() => onDelete(j.id, j.title)}
                    className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl text-zinc-400 hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))
      ) : (
        <div className="py-20 text-center italic font-black uppercase tracking-[0.3em] text-zinc-200">
          Empty_Registry
        </div>
      )}
    </div>
  );
}
