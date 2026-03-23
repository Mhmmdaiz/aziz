"use client";

import { motion } from "framer-motion";
import { FiMapPin, FiPlus, FiTrash2, FiEdit2 } from "react-icons/fi";

interface ProfileAddressProps {
  user: any;
}

export default function ProfileAddress({ user }: ProfileAddressProps) {
  // Normally we would fetch this from an 'addresses' table
  // For now, let's show the default address from the profile or a placeholder
  const addresses = [
    {
      id: "1",
      label: "Main HQ",
      address: user?.address || "Jl. Sudirman No. 1, Jakarta Pusat, DKI Jakarta",
      phone: user?.phone || "+62 812 3456 7890",
      default: true,
    }
  ];

  return (
    <div className="space-y-6 transition-colors duration-500">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 dark:text-zinc-500 italic">Saved Addresses</h3>
        <button className="flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white/5 hover:bg-black dark:hover:bg-white text-white dark:text-zinc-400 hover:text-white dark:hover:text-black border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest transition-all">
          <FiPlus size={14} /> New Address
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map((addr) => (
          <motion.div
            key={addr.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-[3rem] group hover:border-red-600/30 transition-all relative overflow-hidden shadow-sm dark:shadow-none"
          >
            {addr.default && (
              <div className="absolute top-0 right-0 px-6 py-2 bg-red-600 text-white text-[8px] font-black uppercase tracking-widest rounded-bl-3xl">
                Default
              </div>
            )}

            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-zinc-100 dark:bg-white/5 rounded-2xl text-zinc-400 dark:text-zinc-500 group-hover:text-red-500 transition-colors">
                <FiMapPin size={18} />
              </div>
              <h4 className="text-sm font-black uppercase italic text-zinc-900 dark:text-white tracking-widest">
                {addr.label}
              </h4>
            </div>

            <div className="space-y-4">
              <p className="text-zinc-500 dark:text-zinc-400 text-[12px] font-medium leading-relaxed">
                {addr.address}
              </p>
              <p className="text-zinc-400 dark:text-zinc-600 text-[10px] font-black tracking-widest">
                TEL: {addr.phone}
              </p>
            </div>

            <div className="mt-10 flex items-center gap-4 border-t border-zinc-100 dark:border-white/5 pt-6">
               <button className="flex-1 py-3 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-900 dark:text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                  <FiEdit2 size={12} /> Edit
               </button>
               <button className="p-3 bg-red-500/5 hover:bg-red-500/20 text-red-500 rounded-xl transition-all">
                  <FiTrash2 size={14} />
               </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
