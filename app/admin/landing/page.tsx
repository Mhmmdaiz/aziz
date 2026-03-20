"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function RedirectToSettings() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/preorder");
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-fuchsia-500" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">
          Redirecting to Centralized Settings...
        </p>
      </div>
    </div>
  );
}
