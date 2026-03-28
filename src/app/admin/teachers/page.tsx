"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Search,
  Plus,
  MoreVertical,
  Calendar,
  BookOpen,
  CheckCircle2,
  XCircle,
  Filter,
  User,
  Clock
} from "lucide-react";
import { useQuery } from "@apollo/client/react/index.js";
import { GET_TEACHERS } from "@/graphql/queries/get-teachers";

// 🎻 Mock Data for Teachers with Availability
const MOCK_TEACHERS = [
  {
    id: "T1",
    name: "Sofía Martínez",
    photo: null,
    status: "ACTIVE",
    specialties: [{ id: "S1", name: "Piano" }, { id: "S2", name: "Teoría" }],
    availabilities: [
      { day: "Lunes", startTime: "10:00:00", endTime: "14:00:00" },
      { day: "Miércoles", startTime: "15:00:00", endTime: "19:00:00" },
      { day: "Viernes", startTime: "09:00:00", endTime: "13:00:00" }
    ]
  },
  {
    id: "T2",
    name: "Carlos Ruiz",
    photo: null,
    status: "ACTIVE",
    specialties: [{ id: "S3", name: "Violín" }, { id: "S4", name: "Ensamble" }],
    availabilities: [
      { day: "Martes", startTime: "11:00:00", endTime: "15:00:00" },
      { day: "Jueves", startTime: "16:00:00", endTime: "20:00:00" }
    ]
  },
  {
    id: "T3",
    name: "Ana Belén",
    photo: null,
    status: "INACTIVE",
    specialties: [{ id: "S5", name: "Canto" }, { id: "S6", name: "Guitarra" }],
    availabilities: [
      { day: "Lunes", startTime: "08:00:00", endTime: "12:00:00" },
      { day: "Miércoles", startTime: "14:00:00", endTime: "18:00:00" },
      { day: "Sábado", startTime: "10:00:00", endTime: "14:00:00" }
    ]
  }
];

export default function AdminTeachersPage() {
  const { data, loading } = useQuery(GET_TEACHERS, {
    fetchPolicy: 'network-only'
  });

  const [teachers, setTeachers] = useState<any[]>(MOCK_TEACHERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [activeModal, setActiveModal] = useState<'NONE' | 'AVAILABILITY' | 'CLASSES'>('NONE');

  useEffect(() => {
    if (data?.allTeachers && data.allTeachers.length > 0) {
      setTeachers(data.allTeachers);
    }
  }, [data]);

  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStatus = (id: string) => {
    setTeachers(prev => prev.map(t =>
      t.id === id ? { ...t, status: t.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : t
    ));
  };

  return (
    <div className="p-8 lg:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
            <Users className="h-3 w-3" /> Administración de Staff
          </div>
          <h1 className="text-3xl font-bold font-serif tracking-tight">Gestión de Profesores</h1>
          <p className="text-slate-500 italic text-sm">Monitorea la disponibilidad y especialidades del equipo docente.</p>
        </div>
        <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-12 px-8 font-bold uppercase tracking-[0.1em] group rounded-2xl">
          <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" /> Añadir Profesor
        </Button>
      </header>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <div className="relative w-full sm:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-widest h-11 rounded-xl">
            <Filter className="mr-2 h-4 w-4" /> Filtros
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-widest h-11 rounded-xl">
            Exportar
          </Button>
        </div>
      </div>

      {/* Teachers List */}
      <Card className="border-none shadow-sm overflow-hidden bg-white rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 italic">
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Profesor</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Estado</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Especialidades</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && teachers.length === 0 ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-6"><div className="h-12 w-48 bg-slate-100 rounded-xl" /></td>
                    <td className="px-8 py-6"><div className="h-8 w-24 bg-slate-100 rounded-full" /></td>
                    <td className="px-8 py-6"><div className="h-8 w-32 bg-slate-100 rounded-full" /></td>
                    <td className="px-8 py-6"><div className="h-8 w-8 ml-auto bg-slate-100 rounded-lg" /></td>
                  </tr>
                ))
              ) : filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-slate-100/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl overflow-hidden bg-slate-100 shadow-sm shrink-0 border border-slate-100 flex items-center justify-center text-slate-300">
                        {teacher.photo ? <img src={teacher.photo} alt={teacher.name} className="h-full w-full object-cover" /> : <User className="h-6 w-6" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-none mb-1">{teacher.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: #{teacher.id.split('-')[0]}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <button onClick={() => toggleStatus(teacher.id)} className="transition-transform active:scale-95">
                      <Badge variant="secondary" className={`font-bold uppercase text-[9px] tracking-widest px-3 py-1 ring-1 ring-inset transition-all ${teacher.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 group-hover:bg-emerald-100' : 'bg-slate-100 text-slate-600 ring-slate-400/20'}`}>
                        {teacher.status === 'ACTIVE' ? <CheckCircle2 className="mr-1.5 h-3 w-3" /> : <XCircle className="mr-1.5 h-3 w-3" />} {teacher.status}
                      </Badge>
                    </button>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-wrap gap-1.5">
                      {teacher.specialties.map((s: any) => (
                        <Badge key={s.id} variant="outline" className="border-slate-100 text-slate-500 font-bold uppercase text-[9px] tracking-widest bg-white py-1 px-3">
                          {s.name}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 px-4">
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all shadow-sm" title="Disponibilidad Horaria" onClick={() => { setSelectedTeacher(teacher); setActiveModal('AVAILABILITY'); }}>
                        <Clock className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100 text-slate-400" title="Más opciones">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Availability Modal */}
      {activeModal === 'AVAILABILITY' && selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <Card className="w-full max-w-lg shadow-2xl border-none overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 rounded-[2.5rem] bg-white text-slate-900">
            <header className="p-10 bg-slate-900 text-white relative">
              <button onClick={() => { setActiveModal('NONE'); setSelectedTeacher(null); }} className="absolute top-8 right-8 p-3 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white">
                <XCircle className="h-6 w-6" />
              </button>
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Configuración Docente</p>
                <h3 className="text-3xl font-bold font-serif">Horarios Disponibles</h3>
                <p className="text-slate-400 flex items-center gap-2 italic text-sm mt-2 font-medium underline decoration-primary underline-offset-4">
                  <User className="h-3 w-3 text-primary" /> Prof. {selectedTeacher.name}
                </p>
              </div>
            </header>

            <CardContent className="p-10 space-y-8">
              <p className="text-sm text-slate-600 leading-relaxed italic border-l-4 border-primary/20 pl-4 py-2 bg-slate-50/50 rounded-r-xl">
                Define los intervalos semanales en los que el profesor puede impartir clases. Los cambios se sincronizan globalmente.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between px-6 py-3 bg-slate-900/5 rounded-2xl">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Día de la Semana</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Bloque Horario</span>
                </div>
                
                <div className="space-y-2">
                  {selectedTeacher.availabilities?.length > 0 ? selectedTeacher.availabilities.map((av: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm hover:shadow-md hover:border-primary/20 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold group-hover:scale-110 transition-transform">
                          {av.day[0]}
                        </div>
                        <span className="font-bold text-slate-800 text-sm tracking-tight">{av.day}</span>
                      </div>
                      <Badge className="bg-primary/5 text-primary border border-primary/20 font-mono py-1.5 px-4 rounded-xl text-xs font-bold">
                        {av.startTime.slice(0, 5)} - {av.endTime.slice(0, 5)}
                      </Badge>
                    </div>
                  )) : (
                    <div className="py-12 flex flex-col items-center gap-4 text-slate-300">
                      <Calendar className="h-12 w-12 opacity-20" />
                      <p className="text-sm italic font-medium">No se han definido horarios aún.</p>
                    </div>
                  )}
                </div>
              </div>

              <footer className="flex gap-4 pt-6">
                <Button variant="outline" className="flex-1 h-14 rounded-2xl border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-widest hover:bg-slate-50" onClick={() => setActiveModal('NONE')}>
                  Cerrar
                </Button>
                <Button className="flex-1 h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase text-[10px] tracking-widest shadow-xl shadow-slate-200">
                  <Plus className="mr-2 h-4 w-4" /> Añadir Bloque
                </Button>
              </footer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-indigo-900 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-10 text-white shadow-2xl overflow-hidden relative group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
         <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-[80px] -ml-24 -mb-24"></div>
         
         <div className="h-20 w-20 rounded-3xl bg-white shadow-2xl flex items-center justify-center text-indigo-900 group-hover:scale-110 transition-transform duration-500 shrink-0 z-10">
          <Calendar className="h-10 w-10" />
        </div>
        <div className="space-y-3 flex-1 text-center md:text-left z-10">
          <h4 className="font-bold text-2xl font-serif">Planificación Maestro de Staff</h4>
          <p className="text-indigo-200/80 text-sm italic max-w-2xl leading-relaxed">
            Hemos inyectado datos de prueba detallados para simular una agenda académica real. Puedes visualizar los bloques horarios de cada profesor haciendo clic en el icono del reloj.
          </p>
        </div>
        <Button size="lg" className="bg-primary hover:bg-primary/90 text-white border-none font-bold uppercase tracking-widest text-[11px] h-14 px-10 rounded-2xl shadow-xl z-10 transition-all hover:-translate-y-1">
          Optimizar Horarios
        </Button>
      </div>
    </div>
  );
}
