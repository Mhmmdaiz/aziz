"use client";

import { motion } from "framer-motion";
import { Edit3, Trash2, Eye, Calendar } from "lucide-react";

import { Journal } from "../page";

interface JournalTableProps {
  journals: Journal[];
  onEdit: (journal: Journal) => void;
  onDelete: (id: string, title: string) => void;
}

export default function JournalTable({ journals, onEdit, onDelete }: JournalTableProps) {
  return (
    <div className="hidden md:block bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-[2.5rem] shadow-sm dark:shadow-none overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[9px] font-black uppercase tracking-[0.3em] bg-zinc-50/50 dark:bg-zinc-900/20 text-zinc-400 dark:text-zinc-600 border-b border-zinc-100 dark:border-zinc-900">
              <th className="p-8">Visual</th>
              <th className="p-8">Registry_Details</th>
              <th className="p-8">Status</th>
              <th className="p-8">Chronology</th>
              <th className="p-8 text-right">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900">
            {journals.length > 0 ? (
              journals.map((j) => (
                <tr key={j.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors group">
                  <td className="p-8">
                    <div className="relative w-20 h-14 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden bg-zinc-100 dark:bg-zinc-900 group-hover:scale-105 transition-transform duration-500">
                      <img src={j.cover_image || "/placeholder.jpg"} className="w-full h-full object-cover" alt={j.title} />
                    </div>
                  </td>
                  <td className="p-8">
                    <p className="text-xs font-black uppercase italic dark:text-white truncate max-w-[200px]">{j.title}</p>
                    <p className="text-[9px] font-bold text-zinc-400 uppercase mt-1 tracking-tighter truncate max-w-[150px]">slug://{j.slug}</p>
                  </td>
                  <td className="p-8">
                    <span className={`px-4 py-1.5 text-[8.5px] font-black border rounded-full uppercase italic transition-all ${
                      j.status === "published" 
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500 border-zinc-200 dark:border-zinc-700"
                    }`}>
                      {j.status === "published" ? "Live_Active" : "Registry_Draft"}
                    </span>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <Calendar size={12} className="opacity-50" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">
                        {new Date(j.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      <button 
                        onClick={() => onEdit(j)}
                        className="p-3 bg-white dark:bg-zinc-900 rounded-xl hover:bg-cyan-500 hover:text-white transition-all border border-zinc-100 dark:border-zinc-800 shadow-sm"
                        title="Edit_Manifest"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        onClick={() => onDelete(j.id, j.title)}
                        className="p-3 bg-white dark:bg-zinc-900 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-zinc-100 dark:border-zinc-800 shadow-sm"
                        title="Purge_Registry"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : null}
          </tbody>
        </table>
        {journals.length === 0 && (
          <div className="p-20 text-center italic font-black uppercase tracking-[0.4em] text-zinc-200 dark:text-zinc-800">
            Registry_Empty // No_Artifacts_Found
          </div>
        )}
      </div>
    </div>
  );
}
