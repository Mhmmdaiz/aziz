"use client";

import { Search, Filter } from "lucide-react";

interface JournalSearchProps {
  search: string;
  setSearch: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
}

export default function JournalSearch({ search, setSearch, status, setStatus }: JournalSearchProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      <div className="relative flex-1">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
        <input 
          type="text"
          placeholder="Search_By_Title_Or_Slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-[2rem] pl-16 pr-8 py-5 text-sm font-bold placeholder:text-zinc-300 dark:placeholder:text-zinc-800 outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-sm"
        />
      </div>
      
      <div className="relative">
        <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-[2rem] pl-14 pr-10 py-5 text-[10px] font-black uppercase tracking-widest appearance-none outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-sm cursor-pointer text-zinc-600 dark:text-zinc-400"
        >
          <option value="all">Every_Status</option>
          <option value="published">Status_Published</option>
          <option value="draft">Status_Draft</option>
        </select>
      </div>
    </div>
  );
}
