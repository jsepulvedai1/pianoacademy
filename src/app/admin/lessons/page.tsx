"use client";

import { useState, useEffect } from "react";
import { 
  Calendar, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  Clock,
  User,
  Music,
  ChevronRight,
  GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MOCK_TEACHERS = [
  {
    id: "T1",
    name: "Sofía Martínez",
    instrument: "Piano",
    availabilities: [
      { day: "Lunes", startTime: "10:00", endTime: "14:00" },
      { day: "Miércoles", startTime: "15:00", endTime: "19:00" },
      { day: "Viernes", startTime: "09:00", endTime: "13:00" }
    ]
  },
  {
    id: "T2",
    name: "Carlos Ruiz",
    instrument: "Violín",
    availabilities: [
      { day: "Martes", startTime: "11:00", endTime: "15:00" },
      { day: "Jueves", startTime: "16:00", endTime: "20:00" }
    ]
  },
  {
    id: "T3",
    name: "Ana Belén",
    instrument: "Canto",
    availabilities: [
      { day: "Lunes", startTime: "08:00", endTime: "12:00" },
      { day: "Miércoles", startTime: "14:00", endTime: "18:00" },
      { day: "Sábado", startTime: "10:00", endTime: "14:00" }
    ]
  }
];

const MOCK_LESSONS = [
  {
    id: "L1",
    teacher: { name: "Sofía Martínez", photo: null, instrument: "Piano" },
    student: { name: "Lucas Gómez", photo: null, level: "Principiante" },
    date: "2026-03-23", // Lunes
    time: "10:00 - 11:00",
    status: "PENDING",
    type: "Individual"
  },
  {
    id: "L2",
    teacher: { name: "Carlos Ruiz", photo: null, instrument: "Violín" },
    student: { name: "Elena Pérez", photo: null, level: "Intermedio" },
    date: "2026-03-23", // Lunes (OVERLAP)
    time: "11:30 - 12:30",
    status: "COMPLETED",
    type: "Individual"
  },
  {
    id: "L7",
    teacher: { name: "Ana Belén", photo: null, instrument: "Canto" },
    student: { name: "Pedro Páramo", photo: null, level: "Principiante" },
    date: "2026-03-23", // Lunes (OVERLAP)
    time: "11:30 - 12:30",
    status: "PENDING",
    type: "Individual"
  },
  {
    id: "L3",
    teacher: { name: "Sofía Martínez", photo: null, instrument: "Piano" },
    student: { name: "Mateo Rodríguez", photo: null, level: "Avanzado" },
    date: "2026-03-24", // Martes
    time: "15:00 - 16:00",
    status: "CANCELLED",
    type: "Masterclass"
  },
  {
    id: "L8",
    teacher: { name: "Carlos Ruiz", photo: null, instrument: "Violín" },
    student: { name: "Clara Luna", photo: null, level: "Intermedio" },
    date: "2026-03-24", // Martes (OVERLAP 2)
    time: "15:00 - 16:00",
    status: "PENDING",
    type: "Individual"
  },
  {
    id: "L9",
    teacher: { name: "Ana Belén", photo: null, instrument: "Guitarra" },
    student: { name: "Juan Rulfo", photo: null, level: "Avanzado" },
    date: "2026-03-24", // Martes (OVERLAP 3)
    time: "15:00 - 16:00",
    status: "PENDING",
    type: "Individual"
  },
  {
    id: "L4",
    teacher: { name: "Ana Belén", photo: null, instrument: "Canto" },
    student: { name: "Isabel Torres", photo: null, level: "Principiante" },
    date: "2026-03-24", // Martes
    time: "09:00 - 10:00",
    status: "PENDING",
    type: "Individual"
  },
  {
    id: "L6",
    teacher: { name: "Sofía Martínez", photo: null, instrument: "Piano" },
    student: { name: "DanielaSosa", photo: null, level: "Intermedio" },
    date: "2026-03-26", // Jueves
    time: "12:00 - 13:00",
    status: "PENDING",
    type: "Individual"
  }
];

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState(MOCK_LESSONS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<'TABLE' | 'CALENDAR'>('CALENDAR');
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Class State
  const [isNewClassOpen, setIsNewClassOpen] = useState(false);
  const [newClassTeacher, setNewClassTeacher] = useState("");
  const [newClassDate, setNewClassDate] = useState("");
  const [newClassTime, setNewClassTime] = useState("");

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = 
      lesson.teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.student.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || lesson.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const daysLabels = ["Dom 22", "Lun 23", "Mar 24", "Mié 25", "Jue 26", "Vie 27", "Sáb 28"];
  const hours = Array.from({ length: 14 }, (_, i) => i + 8);

  const getDayName = (dateStr: string) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const d = new Date(dateStr);
    return days[d.getDay()];
  };

  const getAvailableSlots = () => {
    if (!newClassTeacher || !newClassDate) return [];
    const teacher = MOCK_TEACHERS.find(t => t.id === newClassTeacher);
    if (!teacher) return [];
    
    const dayName = getDayName(newClassDate);
    const availability = teacher.availabilities.find(a => a.day === dayName);
    if (!availability) return [];

    const start = parseInt(availability.startTime.split(':')[0]);
    const end = parseInt(availability.endTime.split(':')[0]);
    
    const slots = [];
    for (let h = start; h < end; h++) {
      slots.push(`${h}:00 - ${h+1}:00`);
    }
    return slots;
  };

  const handleLessonClick = (lesson: any) => {
    setSelectedLesson(lesson);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 font-bold uppercase text-[9px] tracking-widest px-3 py-1"><CheckCircle2 className="mr-1.5 h-3 w-3" /> Completada</Badge>;
      case "CANCELLED":
        return <Badge className="bg-rose-50 text-rose-700 ring-1 ring-rose-600/20 font-bold uppercase text-[9px] tracking-widest px-3 py-1"><XCircle className="mr-1.5 h-3 w-3" /> Cancelada</Badge>;
      default:
        return <Badge className="bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 font-bold uppercase text-[9px] tracking-widest px-3 py-1"><Clock className="mr-1.5 h-3 w-3" /> Pendiente</Badge>;
    }
  };

  return (
    <div className="p-8 lg:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
            <Calendar className="h-3 w-3" /> Agenda Académica
          </div>
          <h1 className="text-3xl font-bold font-serif tracking-tight">Clases Agendadas</h1>
          <p className="text-slate-500 italic">Gestión de traslapes y coordinación semanal.</p>
        </div>
        <div className="flex gap-3 bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
          <Button variant={viewMode === 'TABLE' ? 'default' : 'ghost'} onClick={() => setViewMode('TABLE')} className={`h-11 px-6 font-bold uppercase text-[10px] tracking-widest transition-all rounded-xl ${viewMode === 'TABLE' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>Lista</Button>
          <Button variant={viewMode === 'CALENDAR' ? 'default' : 'ghost'} onClick={() => setViewMode('CALENDAR')} className={`h-11 px-6 font-bold uppercase text-[10px] tracking-widest transition-all rounded-xl ${viewMode === 'CALENDAR' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>Calendario</Button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         <div className="lg:col-span-3 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input type="text" placeholder="Buscar por profesor o alumno..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select className="flex-1 sm:flex-none h-11 px-4 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600 outline-none cursor-pointer" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">Todos los Estados</option>
            <option value="PENDING">Pendientes</option>
            <option value="COMPLETED">Completadas</option>
            <option value="CANCELLED">Canceladas</option>
          </select>
        </div>
        <Button onClick={() => setIsNewClassOpen(true)} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 h-full font-bold uppercase tracking-[0.1em] rounded-2xl group"><Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" /> Nueva Clase</Button>
      </div>

      {viewMode === 'TABLE' ? (
        <Card className="border-none shadow-sm overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-slate-50/50 border-b border-slate-100 italic"><th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Profesor / Alumno</th><th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Instrumento</th><th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Fecha y Hora</th><th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Estado</th><th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Acciones</th></tr></thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLessons.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => handleLessonClick(l)}>
                    <td className="px-8 py-6"><div className="flex items-center gap-6"><div className="flex -space-x-3 shrink-0"><div className="h-10 w-10 rounded-full border-2 border-white bg-primary/10 flex items-center justify-center text-primary shadow-sm ring-1 ring-slate-100"><User className="h-5 w-5" /></div><div className="h-10 w-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-slate-400 shadow-sm ring-1 ring-slate-100"><GraduationCap className="h-5 w-5" /></div></div><div className="space-y-1"><div className="flex items-center gap-2"><span className="font-bold text-slate-900 text-sm leading-none">{l.teacher.name}</span><ChevronRight className="h-3 w-3 text-slate-300" /><span className="font-medium text-slate-600 text-sm leading-none">{l.student.name}</span></div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{l.type} • {l.student.level}</p></div></div></td>
                    <td className="px-8 py-6"><Badge variant="outline" className="border-slate-100 bg-white text-slate-600 font-bold uppercase text-[9px] tracking-widest py-1 px-3"><Music className="mr-1.5 h-3 w-3 text-primary" /> {l.teacher.instrument}</Badge></td>
                    <td className="px-8 py-6 font-bold text-slate-900 text-xs">{l.date} <span className="block font-medium text-slate-400 italic mt-1">{l.time}</span></td>
                    <td className="px-8 py-6">{getStatusBadge(l.status)}</td>
                    <td className="px-8 py-6 text-right"><Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400"><MoreVertical className="h-5 w-5" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          <div className="grid grid-cols-8 divide-x divide-slate-100 border-b border-slate-100">
            <div className="p-4 bg-slate-50/50 flex items-center justify-center"><span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Hora</span></div>
            {daysLabels.map((day, i) => (
              <div key={day} className={`p-4 text-center ${i === 2 || i === 3 ? 'bg-primary/5' : 'bg-white'}`}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{day.split(' ')[0]}</p>
                <p className={`text-sm font-bold font-serif ${i === 2 || i === 3 ? 'text-primary' : 'text-slate-900'}`}>{day.split(' ')[1]}</p>
              </div>
            ))}
          </div>
          
          <div className="relative h-[800px] overflow-y-auto">
            <div className="absolute inset-0 grid grid-rows-14 divide-y divide-slate-50 pointer-events-none">
              {hours.map((hour) => (
                <div key={hour} className="grid grid-cols-8 divide-x divide-slate-50 h-full">
                  <div className="flex items-start justify-center p-2"><span className="text-[10px] font-bold text-slate-300">{hour}:00</span></div>
                  {Array.from({ length: 7 }).map((_, i) => (<div key={i} className={`h-full ${i === 2 || i === 3 ? 'bg-primary/[0.01]' : ''}`} />))}
                </div>
              ))}
            </div>

            <div className="absolute inset-0 grid grid-cols-8 pointer-events-none pr-4">
              <div className="col-span-1" />
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const dayLessons = filteredLessons.filter(l => new Date(l.date).getDay() === dayIndex);
                
                const groups: { [key: string]: any[] } = {};
                dayLessons.forEach(l => {
                  const timeKey = l.time.split(' - ')[0];
                  if (!groups[timeKey]) groups[timeKey] = [];
                  groups[timeKey].push(l);
                });

                return (
                  <div key={dayIndex} className="relative h-full">
                    {Object.values(groups).map((groupLessons) => (
                      groupLessons.map((l, lIndex) => {
                        const startHour = parseInt(l.time.split(':')[0]);
                        const startMin = parseInt(l.time.split(':')[1].split(' ')[0]);
                        const top = ((startHour - 8) * (800 / 14)) + ((startMin / 60) * (800 / 14));
                        const height = (800 / 14) * 1.2;
                        
                        const widthIdx = 100 / groupLessons.length;
                        const leftOffset = lIndex * widthIdx;

                        return (
                          <div key={l.id} 
                            onClick={() => handleLessonClick(l)}
                            className="absolute p-1.5 rounded-xl shadow-lg border border-white flex flex-col justify-between pointer-events-auto cursor-pointer hover:scale-[1.05] hover:z-50 transition-all ring-1 ring-inset"
                            style={{ 
                              top: `${top}px`, height: `${height}px`, left: `${leftOffset}%`, width: `${widthIdx}%`,
                              backgroundColor: l.status === 'CANCELLED' ? '#fff1f2' : l.status === 'COMPLETED' ? '#f0fdf4' : '#f0f9ff',
                              borderColor: l.status === 'CANCELLED' ? '#fda4af' : l.status === 'COMPLETED' ? '#86efac' : '#7dd3fc',
                              color: l.status === 'CANCELLED' ? '#9f1239' : l.status === 'COMPLETED' ? '#166534' : '#075985'
                            }}
                          >
                            <div className="space-y-0.5">
                              <p className="text-[8px] font-bold uppercase tracking-tight opacity-60 flex items-center gap-1"><Clock className="h-2 w-2" /> {l.time.split(' - ')[0]}</p>
                              <p className="text-[10px] font-bold line-clamp-1 leading-tight">{l.teacher.name}</p>
                            </div>
                            <div className="flex items-center justify-between gap-1 overflow-hidden opacity-80">
                              <p className="text-[9px] font-medium truncate italic">{l.student.name}</p>
                              <ChevronRight className="h-2 w-2 shrink-0" />
                            </div>
                          </div>
                        );
                      })
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Lesson Detail Modal */}
      {isModalOpen && selectedLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <Card className="w-full max-w-lg bg-white border-none shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 rounded-3xl">
            <header className="p-8 bg-slate-900 text-white relative">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Detalles de la Sesión</p>
                <h2 className="text-3xl font-bold font-serif">{selectedLesson.teacher.name}</h2>
                <div className="flex items-center gap-2 text-slate-400 mt-2">
                  <Badge variant="outline" className="bg-white/5 border-white/20 text-white font-bold uppercase text-[9px] tracking-widest px-3 py-1">
                    <Music className="mr-1.5 h-3 w-3 text-primary" /> {selectedLesson.teacher.instrument}
                  </Badge>
                  <span className="text-xs italic">• {selectedLesson.type}</span>
                </div>
              </div>
            </header>
            
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-400">
                    <User className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Alumno</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {selectedLesson.student.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{selectedLesson.student.name}</p>
                      <p className="text-xs text-slate-500 italic">{selectedLesson.student.level}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-400">
                    <Calendar className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Horario</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{selectedLesson.date}</p>
                    <p className="text-xs text-slate-500 italic flex items-center gap-1.5 mt-1">
                      <Clock className="h-3 w-3" /> {selectedLesson.time}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estado Actual</p>
                  <p className="text-sm font-medium text-slate-700">La clase está marcada como:</p>
                </div>
                {getStatusBadge(selectedLesson.status)}
              </div>

              <footer className="flex gap-4 pt-4">
                <Button variant="outline" className="flex-1 h-12 rounded-xl text-slate-600 border-slate-200 font-bold uppercase text-[10px] tracking-widest">Reprogramar</Button>
                <Button className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 text-center">Ver Perfil Alumno</Button>
              </footer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* New Class Modal */}
      {isNewClassOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <Card className="w-full max-w-xl bg-white border-none shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 rounded-[2.5rem]">
            <header className="p-10 bg-primary text-white relative">
              <button 
                onClick={() => setIsNewClassOpen(false)}
                className="absolute top-8 right-8 p-3 rounded-full hover:bg-white/10 transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Operaciones de Agenda</p>
                <h3 className="text-3xl font-bold font-serif whitespace-nowrap">Agendar Nueva Clase</h3>
                <p className="text-white/70 italic text-sm mt-2">Completa los datos para crear una nueva sesión académica.</p>
              </div>
            </header>
            
            <CardContent className="p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Step 1: Teacher Selection */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <User className="h-3 w-3" /> Seleccionar Profesor
                  </label>
                  <select 
                    className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-700 appearance-none shadow-sm"
                    value={newClassTeacher}
                    onChange={(e) => { setNewClassTeacher(e.target.value); setNewClassTime(""); }}
                  >
                    <option value="">Elige un profesor...</option>
                    {MOCK_TEACHERS.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.instrument})</option>
                    ))}
                  </select>
                </div>

                {/* Step 2: Date Selection */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <Calendar className="h-3 w-3" /> Fecha de Clase
                  </label>
                  <input 
                    type="date"
                    className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-700 shadow-sm"
                    value={newClassDate}
                    onChange={(e) => { setNewClassDate(e.target.value); setNewClassTime(""); }}
                  />
                </div>
              </div>

              {/* Step 3: Available Hours */}
              {newClassTeacher && newClassDate && (
                <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                  <header className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                      <Clock className="h-3 w-3" /> Horas Disponibles para {getDayName(newClassDate)}
                    </label>
                    <Badge variant="outline" className="text-[10px] font-bold uppercase text-primary border-primary/20">
                      {MOCK_TEACHERS.find(t => t.id === newClassTeacher)?.availabilities.find(a => a.day === getDayName(newClassDate)) ? 'Disponible' : 'Sin Horarios'}
                    </Badge>
                  </header>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {getAvailableSlots().length > 0 ? getAvailableSlots().map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setNewClassTime(slot)}
                        className={`p-4 rounded-2xl border transition-all text-xs font-bold uppercase tracking-widest ${newClassTime === slot 
                          ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105' 
                          : 'bg-white border-slate-100 text-slate-400 hover:border-primary/40 hover:text-primary hover:bg-primary/[0.02]'}`}
                      >
                        {slot.split(' - ')[0]}
                      </button>
                    )) : (
                      <div className="col-span-full py-8 text-center text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        El profesor no tiene disponibilidad configurada para este día.
                      </div>
                    )}
                  </div>
                </div>
              )}

              <footer className="flex gap-4 pt-6 border-t border-slate-100 mt-10">
                <Button variant="outline" className="flex-1 h-14 rounded-2xl border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-widest" onClick={() => setIsNewClassOpen(false)}>Cancelar</Button>
                <Button 
                  disabled={!newClassTime}
                  className="flex-1 h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase text-[10px] tracking-widest shadow-xl shadow-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Confirmar Agendamiento
                </Button>
              </footer>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-10">
        <div className="h-20 w-20 rounded-3xl bg-white shadow-xl flex items-center justify-center text-primary shrink-0"><Calendar className="h-10 w-10" /></div>
        <div className="flex-1 text-center md:text-left"><h4 className="font-bold text-xl font-serif">Algoritmo de Disponibilidad</h4><p className="text-slate-600 text-sm italic leading-relaxed">Al agendar una nueva clase, el sistema cruza los datos del profesor seleccionado con sus horarios de disponibilidad configurados en el módulo de staff para ofrecerte solo las opciones válidas.</p></div>
        <Button className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 font-bold uppercase tracking-widest text-[10px] h-14 px-10 rounded-2xl shadow-sm">Configurar Reglas</Button>
      </div>
    </div>
  );
}
