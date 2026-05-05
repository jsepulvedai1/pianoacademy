"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Music,
  ChevronRight,
  GraduationCap,
  BookOpen,
  Copy,
  Plus,
  MoreVertical,
  ChevronLeft,
  CalendarDays
} from "lucide-react";
import { 
  format, 
  startOfWeek, 
  addDays, 
  isSameDay, 
  parseISO, 
  addWeeks, 
  subWeeks,
  isToday
} from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@apollo/client/react/index.js";
import { GET_LESSONS } from "@/graphql/queries/get-lessons";
import { GET_TEACHERS } from "@/graphql/queries/get-teachers";
import { GET_STUDENTS_LIST } from "@/graphql/queries/get-students";
import { GET_ROOMS } from "@/graphql/queries/get-rooms";
import { CREATE_LESSON, UPDATE_LESSON_STATUS } from "@/graphql/mutations/lesson-mutations";

export default function AdminLessonsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<'TABLE' | 'CALENDAR'>('CALENDAR');
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));

  // ── GraphQL Hooks ───────────────────────────────────────────
  const { data: lessonsData, loading: lessonsLoading, refetch: refetchLessons } = useQuery<{ allLessons: any[] }>(GET_LESSONS);
  const { data: teachersData } = useQuery<{ allTeachers: any[] }>(GET_TEACHERS);
  const { data: studentsData } = useQuery<{ allStudents: any[] }>(GET_STUDENTS_LIST);
  const { data: roomsData } = useQuery<{ allRooms: any[] }>(GET_ROOMS);

  const [updateStatus, { loading: isUpdating }] = useMutation(UPDATE_LESSON_STATUS, {
    onCompleted: () => {
      toast.success("Estado actualizado (y crédito descontado si aplica) 🎻");
      setIsModalOpen(false);
      refetchLessons();
    },
    onError: (err) => toast.error(err.message)
  });

  const [createLesson, { loading: isCreating }] = useMutation(CREATE_LESSON, {
    onCompleted: () => {
      toast.success("Clase agendada en Django ✅");
      setIsNewClassOpen(false);
      refetchLessons();
    },
    onError: (err) => toast.error(err.message)
  });

  const displayLessons = lessonsData?.allLessons || [];
  const currentTeachers = teachersData?.allTeachers || [];
  const currentStudents = studentsData?.allStudents || [];
  const currentRooms = roomsData?.allRooms || [];

  // New Class State
  const [isNewClassOpen, setIsNewClassOpen] = useState(false);
  const [newClassTeacher, setNewClassTeacher] = useState("");
  const [newClassStudent, setNewClassStudent] = useState("");
  const [newClassDate, setNewClassDate] = useState("");
  const [newClassTime, setNewClassTime] = useState("");
  const [newClassRoom, setNewClassRoom] = useState("");

  const filteredLessons = useMemo(() => {
    return displayLessons.filter((lesson: any) => {
      const teacherName = lesson.teacher?.name || "";
      const studentName = lesson.student?.name || "";
      const matchesSearch =
        teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        studentName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || lesson.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [displayLessons, searchTerm, statusFilter]);

  const handleStatusChange = (status: string) => {
    if (!selectedLesson) return;
    updateStatus({ variables: { lessonId: parseInt(selectedLesson.id), status } });
  };

  const handleCreateLesson = () => {
    if (!newClassTeacher || !newClassStudent || !newClassDate || !newClassTime || !newClassRoom) {
      toast.error("Por favor completa todos los campos");
      return;
    }
    
    const [start, end] = newClassTime.split(' - ');
    createLesson({
      variables: {
        teacherId: parseInt(newClassTeacher),
        studentId: parseInt(newClassStudent),
        roomId: parseInt(newClassRoom),
        date: newClassDate,
        startTime: start + ":00",
        endTime: end + ":00",
        lessonType: "INDIVIDUAL"
      }
    });
  };

  const handleLessonClick = (lesson: any) => {
    setSelectedLesson(lesson);
    setIsModalOpen(true);
  };

  const nextWeek = () => setCurrentWeekStart(prev => addWeeks(prev, 1));
  const prevWeek = () => setCurrentWeekStart(prev => subWeeks(prev, 1));
  const goToToday = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const handleGridClick = (day: Date, hour: number) => {
    setNewClassDate(format(day, "yyyy-MM-dd"));
    setNewClassTime(`${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`);
    setIsNewClassOpen(true);
  };

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  const positionedLessons = useMemo(() => {
    const result: any[] = [];
    const lessonsByDay: Record<string, any[]> = {};

    filteredLessons.forEach(lesson => {
      if (!lessonsByDay[lesson.date]) lessonsByDay[lesson.date] = [];
      lessonsByDay[lesson.date].push({ ...lesson });
    });

    Object.keys(lessonsByDay).forEach(date => {
      const dayLessons = lessonsByDay[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
      const columns: any[][] = [];

      dayLessons.forEach(lesson => {
        let placed = false;
        for (let i = 0; i < columns.length; i++) {
          const lastInCol = columns[i][columns[i].length - 1];
          if (lesson.startTime >= (lastInCol.endTime || lastInCol.startTime)) {
            columns[i].push(lesson);
            placed = true;
            break;
          }
        }
        if (!placed) columns.push([lesson]);
      });

      columns.forEach((col, colIndex) => {
        col.forEach(lesson => {
          lesson.colIndex = colIndex;
          lesson.totalCols = columns.length;
          result.push(lesson);
        });
      });
    });
    return result;
  }, [filteredLessons]);

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

  const daysLabels = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const hours = Array.from({ length: 14 }, (_, i) => i + 8);

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
        <div className="flex gap-4">
          <Button onClick={() => setIsNewClassOpen(true)} className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 h-full font-bold uppercase tracking-[0.1em] rounded-2xl group">
            <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" /> Nueva Clase
          </Button>
        </div>
      </div>

      {viewMode === 'TABLE' ? (
        <Card className="border-none shadow-sm overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-slate-50/50 border-b border-slate-100 italic"><th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Profesor / Alumno</th><th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Fecha</th><th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Hora</th><th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Estado</th><th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Acciones</th></tr></thead>
              <tbody className="divide-y divide-slate-50">
                {lessonsLoading ? (
                   <tr><td colSpan={5} className="py-20 text-center italic text-slate-400">Sincronizando agenda...</td></tr>
                ) : filteredLessons.map((l: any) => (
                  <tr key={l.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => handleLessonClick(l)}>
                    <td className="px-8 py-6"><div className="flex items-center gap-6"><div className="flex -space-x-3 shrink-0"><div className="h-10 w-10 rounded-full border-2 border-white bg-primary/10 flex items-center justify-center text-primary shadow-sm"><User className="h-5 w-5" /></div><div className="h-10 w-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-slate-400 shadow-sm"><GraduationCap className="h-5 w-5" /></div></div><div className="space-y-1"><div className="flex items-center gap-2"><span className="font-bold text-slate-900 text-sm">{l.teacher?.name}</span><ChevronRight className="h-3 w-3 text-slate-300" /><span className="font-medium text-slate-600 text-sm">{l.student?.name}</span></div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{l.lessonType || 'Individual'}</p></div></div></td>
                    <td className="px-8 py-6 font-bold text-slate-900 text-xs">{l.date}</td>
                    <td className="px-8 py-6 font-medium text-slate-500 italic text-xs">{l.startTime}</td>
                    <td className="px-8 py-6">{getStatusBadge(l.status)}</td>
                    <td className="px-8 py-6 text-right"><Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400"><MoreVertical className="h-5 w-5" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col min-h-[800px] animate-in fade-in zoom-in-95 duration-500">
          {/* Calendar Header / Navigation */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1">
                <Button variant="ghost" size="icon" onClick={prevWeek} className="h-9 w-9 rounded-lg hover:bg-slate-50"><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={nextWeek} className="h-9 w-9 rounded-lg hover:bg-slate-50"><ChevronRight className="h-4 w-4" /></Button>
              </div>
              <Button variant="outline" onClick={goToToday} className="h-11 px-6 font-bold uppercase text-[10px] tracking-widest rounded-xl bg-white shadow-sm hover:bg-slate-50 border-slate-200">Hoy</Button>
              <h2 className="text-xl font-bold font-serif ml-2">
                {format(currentWeekStart, "MMMM yyyy", { locale: es }).replace(/^\w/, (c) => c.toUpperCase())}
                <span className="text-slate-400 font-sans text-sm ml-3 font-normal italic">
                  Semana del {format(currentWeekStart, "d 'de' MMMM", { locale: es })}
                </span>
              </h2>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
              <CalendarDays className="h-3 w-3" /> {filteredLessons.length} Clases en Filtro
            </div>
          </div>

          <div className="flex-1 overflow-auto relative">
            {/* The Grid */}
            <div className="min-w-[1000px] grid grid-cols-[100px_repeat(7,1fr)]">
              {/* Day Headers */}
              <div className="h-16 border-b border-slate-100 bg-slate-50/30 sticky top-0 z-20"></div>
              {weekDays.map((day) => (
                <div key={day.toString()} className={cn(
                  "h-16 border-b border-l border-slate-100 flex flex-col items-center justify-center sticky top-0 z-20 bg-slate-50/30 backdrop-blur-sm",
                  isToday(day) && "bg-primary/5 border-l-primary/10"
                )}>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {format(day, "eee", { locale: es })}
                  </span>
                  <span className={cn(
                    "text-lg font-bold font-serif",
                    isToday(day) ? "text-primary" : "text-slate-900"
                  )}>
                    {format(day, "d")}
                  </span>
                  {isToday(day) && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary"></div>}
                </div>
              ))}

              {/* Time Slots */}
              {hours.map((hour) => (
                <React.Fragment key={hour}>
                  <div className="h-20 border-b border-slate-50 flex items-start justify-end pr-4 pt-2 group">
                    <span className="text-[10px] font-bold text-slate-300 group-hover:text-slate-500 transition-colors">
                      {hour}:00
                    </span>
                  </div>
                  {weekDays.map((day) => (
                    <div 
                      key={`${day}-${hour}`} 
                      onClick={() => handleGridClick(day, hour)}
                      className={cn(
                        "h-20 border-b border-l border-slate-50 relative group transition-colors hover:bg-slate-50/50 cursor-pointer",
                        isToday(day) && "bg-primary/[0.01]"
                      )}
                    >
                      {/* Grid line indicator on hover */}
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-primary/0 group-hover:bg-primary/10 transition-colors"></div>
                    </div>
                  ))}
                </React.Fragment>
              ))}

              {/* Current Time Indicator */}
              {weekDays.map((day, dayIdx) => isToday(day) && (
                <div 
                  key="time-indicator"
                  className="absolute left-0 right-0 border-t-2 border-rose-500 z-30 pointer-events-none flex items-center shadow-[0_0_8px_rgba(244,63,94,0.3)]"
                  style={{
                    top: `${64 + (new Date().getHours() - 8 + new Date().getMinutes() / 60) * 80}px`,
                    left: `calc(100px + ${dayIdx} * (100% - 100px) / 7)`,
                    width: `calc((100% - 100px) / 7)`,
                  }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white shadow-sm" style={{ marginLeft: '-5px' }}></div>
                  <div className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm ml-1 animate-pulse">
                    {format(new Date(), "HH:mm")}
                  </div>
                </div>
              ))}

              {/* Lessons Overlay */}
              <div className="contents pointer-events-none">
                {positionedLessons.map((lesson: any) => {
                  const lessonDate = parseISO(lesson.date);
                  const dayIndex = weekDays.findIndex(d => isSameDay(d, lessonDate));
                  
                  if (dayIndex === -1) return null;

                  // Parse time: "HH:MM:SS" -> HH.decimal
                  const [h, m] = lesson.startTime.split(':').map(Number);
                  const [eh, em] = (lesson.endTime || "00:00:00").split(':').map(Number);
                  
                  const startOffset = h - 8 + (m / 60);
                  const duration = eh ? (eh + em/60) - (h + m/60) : 1;

                  const colWidth = `(100% - 100px) / 7 - 8px`;
                  const lessonWidth = `calc((${colWidth}) / ${lesson.totalCols})`;
                  const lessonLeft = `calc(100px + ${dayIndex} * (100% - 100px) / 7 + 4px + (${lesson.colIndex} * (${colWidth}) / ${lesson.totalCols}))`;
                  
                  return (
                    <div
                      key={lesson.id}
                      onClick={() => handleLessonClick(lesson)}
                      className={cn(
                        "absolute z-10 pointer-events-auto cursor-pointer p-2 transition-all hover:scale-[1.02] hover:z-20 overflow-hidden",
                        "rounded-xl shadow-md border-l-4 flex flex-col gap-1",
                        lesson.status === 'COMPLETED' ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-emerald-200/50" :
                        lesson.status === 'CANCELLED' ? "bg-rose-50 border-rose-500 text-rose-900 shadow-rose-200/50" :
                        "bg-amber-50 border-amber-500 text-amber-900 shadow-amber-200/50"
                      )}
                      style={{
                        top: `${64 + startOffset * 80}px`, 
                        left: lessonLeft,
                        width: lessonWidth,
                        height: `${duration * 80 - 4}px`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase tracking-tight opacity-60">
                          {lesson.startTime.substring(0, 5)} - {lesson.endTime?.substring(0, 5)}
                        </span>
                        {lesson.status === 'COMPLETED' && <CheckCircle2 className="h-3 w-3" />}
                      </div>
                      <p className="text-[11px] font-bold leading-tight truncate">
                        {lesson.teacher?.name}
                      </p>
                      <p className="text-[10px] font-medium opacity-70 truncate italic">
                        {lesson.student?.name}
                      </p>
                      <div className="mt-auto flex items-center gap-1 opacity-50">
                        <Music className="h-2.5 w-2.5" />
                        <span className="text-[8px] font-bold uppercase tracking-widest">{lesson.room?.name || 'Sala'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && selectedLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <Card className="w-full max-w-lg bg-white border-none shadow-2xl overflow-hidden rounded-3xl">
            <header className="p-8 bg-slate-900 text-white relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10"><XCircle className="h-6 w-6" /></button>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Detalles de la Sesión</p>
                <h2 className="text-3xl font-bold font-serif">{selectedLesson.teacher?.name}</h2>
              </div>
            </header>
            <CardContent className="p-8 space-y-8">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estado Actual</p>
                  <p className="text-sm font-medium text-slate-700">{selectedLesson.status}</p>
                </div>
                {getStatusBadge(selectedLesson.status)}
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4">
                <Button disabled={isUpdating} onClick={() => handleStatusChange("CANCELLED")} variant="outline" className="h-12 rounded-xl text-rose-600 border-rose-100 font-bold uppercase text-[9px] tracking-widest">Cancelar</Button>
                <Button disabled={isUpdating} onClick={() => handleStatusChange("COMPLETED")} className="h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-[9px] tracking-widest shadow-lg">Asistencia</Button>
                <Button onClick={() => setIsModalOpen(false)} variant="ghost" className="h-12 rounded-xl text-slate-400 font-bold uppercase text-[9px] tracking-widest">Cerrar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isNewClassOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <Card className="w-full max-w-xl bg-white border-none shadow-2xl overflow-hidden rounded-[2.5rem]">
            <header className="p-10 bg-primary text-white relative">
              <button onClick={() => setIsNewClassOpen(false)} className="absolute top-8 right-8 p-3 rounded-full hover:bg-white/10"><XCircle className="h-6 w-6" /></button>
              <h3 className="text-3xl font-bold font-serif">Agendar Clase</h3>
            </header>
            <CardContent className="p-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <select className="w-full h-14 bg-slate-50 rounded-2xl px-6 outline-none" value={newClassTeacher} onChange={(e) => setNewClassTeacher(e.target.value)}>
                    <option value="">Profesor...</option>
                    {currentTeachers.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <select className="w-full h-14 bg-slate-50 rounded-2xl px-6 outline-none" value={newClassStudent} onChange={(e) => setNewClassStudent(e.target.value)}>
                    <option value="">Alumno...</option>
                    {currentStudents.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <input type="date" className="w-full h-14 bg-slate-50 rounded-2xl px-6 outline-none" value={newClassDate} onChange={(e) => setNewClassDate(e.target.value)} />
                <select className="w-full h-14 bg-slate-50 rounded-2xl px-6 outline-none" value={newClassRoom} onChange={(e) => setNewClassRoom(e.target.value)}>
                    <option value="">Sala...</option>
                    {currentRooms.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <select className="w-full h-14 bg-slate-50 rounded-2xl px-6 outline-none col-span-full" value={newClassTime} onChange={(e) => setNewClassTime(e.target.value)}>
                    <option value="">Horario...</option>
                    {hours.map(h => {
                      const slot = `${h.toString().padStart(2, '0')}:00 - ${(h + 1).toString().padStart(2, '0')}:00`;
                      return <option key={slot} value={slot}>{slot}</option>
                    })}
                </select>
              </div>
              <footer className="flex gap-4 pt-6 border-t">
                <Button variant="outline" className="flex-1 h-14 rounded-2xl" onClick={() => setIsNewClassOpen(false)}>Cancelar</Button>
                <Button disabled={isCreating} onClick={handleCreateLesson} className="flex-1 h-14 rounded-2xl bg-slate-900 text-white font-bold uppercase text-[10px] tracking-widest">
                  {isCreating ? "Agendando..." : "Confirmar"}
                </Button>
              </footer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
