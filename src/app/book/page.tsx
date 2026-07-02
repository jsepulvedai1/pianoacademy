"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BookPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/contact");
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-slate-800">
        <div className="w-10 h-10 border-4 border-[#70125F] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold uppercase tracking-wider">Redireccionando a Contacto...</p>
      </div>
    </div>
  );
}
