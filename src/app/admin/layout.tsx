"use client";

import { Music, LayoutDashboard, Users, Calendar, BookOpen, Settings, LogOut, GraduationCap, Warehouse } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/teachers", label: "Profesores", icon: Users },
    { href: "/admin/students", label: "Estudiantes", icon: GraduationCap },
    { href: "/admin/rooms", label: "Salas", icon: Warehouse },
    { href: "/admin/lessons", label: "Clases", icon: Calendar },
  ];

  const secondaryItems = [
    { href: "#", label: "Programas", icon: BookOpen },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-8 border-b border-slate-100 mb-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-primary text-white group-hover:rotate-12 transition-transform duration-500">
              <Music className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl font-serif tracking-tight">Détaché</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-bold shadow-sm ring-1 ring-primary/5' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
                {item.label}
              </Link>
            );
          })}
          
          {secondaryItems.map((item) => (
            <button key={item.label} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all opacity-60">
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          ))}

          <div className="pt-8 pb-4">
            <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Sistema</p>
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all">
            <Settings className="h-5 w-5" />
            Configuración
          </button>
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
