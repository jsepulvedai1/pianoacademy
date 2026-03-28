"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, Calendar, TrendingUp, LayoutDashboard, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const stats = [
    { title: "Total Profesores", value: "12", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Reservas Semanales", value: "48", icon: Calendar, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Ingresos Estimados", value: "$4,250", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Nuevos Alumnos", value: "8", icon: UserCheck, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="p-8 lg:p-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-serif tracking-tight">Buenas tardes, Administrador</h1>
          <p className="text-slate-500 italic">Hoy es {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-10 px-6 font-bold uppercase tracking-[0.1em]">
          Exportar Reporte
        </Button>
      </header>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between relative z-10">
                <div className="space-y-1">
                  <p className="text-slate-500 text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold font-serif">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} ring-1 ring-inset ring-black/5 group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-black/[0.02] -translate-y-1/2 translate-x-1/2 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm bg-white p-8 space-y-8 min-h-[400px]">
          <div className="flex items-center justify-between border-b border-slate-50 pb-6">
            <h2 className="text-xl font-bold font-serif">Actividad Reciente</h2>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 font-bold uppercase text-[10px] tracking-widest">Ver todo</Button>
          </div>
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
            <div className="p-4 rounded-full bg-slate-100">
              <LayoutDashboard className="h-10 w-10 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium italic">Gráficos de rendimiento en desarrollo...</p>
          </div>
        </Card>

        <Card className="border-none shadow-sm bg-white p-8 min-h-[400px]">
          <div className="flex items-center justify-between border-b border-slate-50 pb-6 mb-8">
            <h2 className="text-xl font-bold font-serif">Avisos del Sistema</h2>
          </div>
          <div className="space-y-6">
            {[
              { type: "info", text: "Nueva actualización de plataforma v1.2", date: "Hace 2h" },
              { type: "warning", text: "3 solicitudes de reserva pendientes", date: "Hace 5h" },
              { type: "success", text: "Pago procesado exitosamente: Alumno#45", date: "Ayer" },
            ].map((note, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  note.type === 'warning' ? 'bg-amber-500' : 
                  note.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                }`} />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-700 leading-snug">{note.text}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{note.date}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
