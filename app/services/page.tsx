"use client";
import Link from "next/link";
import { motion } from "framer-motion";

const SERVICES = [
  { id: 1, name: "Web Engineering", price: "5.000.000" },
  { id: 2, name: "Visual Identity", price: "3.500.000" },
  { id: 3, name: "Motion Design", price: "4.200.000" },
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen pt-32 px-6 md:px-12 bg-[#FBFBFD]">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-black italic uppercase mb-16 tracking-tighter">
          Current_Services
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SERVICES.map((s) => (
            <Link key={s.id} href={`/services/${s.id}`}>
              <motion.div
                whileHover={{ y: -10 }}
                className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group"
              >
                <span className="text-[10px] font-black text-gray-300 mb-4 block">
                  SRV-00{s.id}
                </span>
                <h3 className="text-2xl font-black italic uppercase mb-8 group-hover:text-blue-600 transition-colors">
                  {s.name}
                </h3>
                <p className="text-xl font-black tracking-tighter">
                  Rp {s.price}
                </p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
