"use client";

import { Music, LayoutDashboard, Users, BookOpen, Settings, LogOut, FileText } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/portal-docente/dashboard", label: "Mi Horario", icon: LayoutDashboard },
    { href: "/portal-docente/students", label: "Mis Alumnos", icon: Users },
    { href: "/portal-docente/materials", label: "Materiales y Ejercicios", icon: BookOpen },
    { href: "/portal-docente/profile", label: "Mi Cuenta", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-8 border-b border-slate-100 mb-8 bg-slate-900">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-white text-slate-900 group-hover:rotate-12 transition-transform duration-500">
              <Music className="h-5 w-5" />
            </div>
            <div>
               <span className="font-bold text-xl font-serif tracking-tight text-white block">Détaché</span>
               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Portal Docente</span>
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
          <Link href="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/5 transition-all font-medium">
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
