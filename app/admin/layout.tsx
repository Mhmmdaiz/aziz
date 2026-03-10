"use client";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Kita hapus navbar manual di sini supaya gak double sama Navbar global
  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F]">
      {/* Cukup render children saja, Navbar sudah ada di RootLayout */}
      <div className="max-w-7xl mx-auto px-6 md:px-12">{children}</div>
    </div>
  );
}
