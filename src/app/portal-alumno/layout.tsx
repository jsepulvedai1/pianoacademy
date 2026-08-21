"use client";

import { Music, LayoutDashboard, MessageCircle, LogOut, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@apollo/client/react/index.js";
import { MY_STUDENT_PROFILE } from "@/graphql/queries/portal-queries";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data } = useQuery<any>(MY_STUDENT_PROFILE);
  const student = data?.myStudentProfile;

  const navItems = [
    { href: "/portal-alumno/dashboard", label: "Resumen", icon: LayoutDashboard },
    { href: "/portal-alumno/wall", label: "Muro", icon: MessageCircle },
    { href: "/portal-alumno/shop", label: "Planes", icon: ShoppingBag },
  ];

  const handleLogout = () => {
    document.cookie = "detache_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "detache_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "detache_portal_type=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "detache_allowed_sections=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "detache_username=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  };

  return (
    <div className="flex min-h-screen bg-slate-50/50 flex-col lg:flex-row">
      
      {/* ── Mobile Top Header ── */}
      <header className="lg:hidden sticky top-0 z-40 bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shadow-md border-b border-white/10 backdrop-blur-md">
        <Link href="/portal-alumno/dashboard" className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#70125F] text-white">
            <Music className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-base font-serif tracking-tight text-white block leading-none">Détaché</span>
            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Portal Alumno</span>
          </div>
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="text-right">
            <p className="text-xs font-bold text-white leading-tight">{student?.name?.split(' ')[0] || 'Alumno'}</p>
            <p className="text-[9px] text-[#DCA060] font-medium">Activo</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#70125F]/30 border border-[#70125F]/60 flex items-center justify-center text-xs font-bold text-white">
            {student?.name ? student.name[0] : 'A'}
          </div>
        </div>
      </header>

      {/* ── Desktop Sidebar Navigation ── */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-8 border-b border-slate-100 mb-8 bg-slate-900">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-white text-slate-900 group-hover:rotate-12 transition-transform duration-500">
              <Music className="h-5 w-5" />
            </div>
            <div>
               <span className="font-bold text-xl font-serif tracking-tight text-white block">Détaché</span>
               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Portal Alumno</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : ''}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <Link href="/login" onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/5 transition-all font-medium">
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </Link>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto pb-24 lg:pb-0">
        <div className="flex-1">
          {children}
        </div>
      </main>

      {/* ── Mobile Bottom Navigation Bar (App Dock) ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-3 py-2 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
                isActive 
                  ? 'text-[#70125F] font-bold scale-105' 
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-[#70125F]/10 text-[#70125F]' : ''}`}>
                <item.icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
        <Link 
          href="/login" 
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-2xl text-slate-400 hover:text-rose-600 transition-all"
        >
          <div className="p-1.5 rounded-xl">
            <LogOut className="h-5 w-5" />
          </div>
          <span className="text-[10px] tracking-tight">Salir</span>
        </Link>
      </nav>

    </div>
  );
}
