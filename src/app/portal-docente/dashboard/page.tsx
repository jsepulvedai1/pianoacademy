"use client";

import React, { useState, useMemo } from "react";
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  Clock, 
  TrendingUp, 
  Users, 
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Music,
  CalendarDays,
  Loader2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import { useQuery } from "@apollo/client/react/index.js";
import { MY_TEACHER_PROFILE, MY_LESSONS } from "@/graphql/queries/portal-queries";
import AnnouncementsWidget from "@/components/widgets/announcements-widget";

export default function TeacherDashboardPage() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [viewMode, setViewMode] = useState<'CALENDAR' | 'LIST'>('CALENDAR');

  const { data: profileData, loading: profileLoading } = useQuery<any>(MY_TEACHER_PROFILE);
  const { data: lessonsData, loading: lessonsLoading } = useQuery<any>(MY_LESSONS);

  const teacherProfile = profileData?.myTeacherProfile;
  const lessons = lessonsData?.myLessons || [];

  if (profileLoading || lessonsLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 text-[#70125F] animate-spin" />
        <p className="text-slate-400 text-xs italic">Cargando tu agenda docente...</p>
      </div>
    );
  }

  const stats = useMemo(() => {
    const totalWeeklyMinutes = lessons.reduce((acc: number, l: any) => {
      if (!l.startTime || !l.endTime) return acc;
      const [sh, sm] = l.startTime.split(":");
      const [eh, em] = l.endTime.split(":");
      const startMin = parseInt(sh, 10) * 60 + parseInt(sm, 10);
      const endMin = parseInt(eh, 10) * 60 + parseInt(em, 10);
      return acc + (endMin - startMin);
    }, 0);

    const uniqueStudents = new Set(lessons.map((l: any) => l.student?.id).filter(Boolean));
    const completed = lessons.filter((l: any) => l.status === "COMPLETED").length;
    const pending = lessons.filter((l: any) => l.status === "PENDING").length;

    return {
      weeklyHours: Math.round((totalWeeklyMinutes / 60) * 10) / 10,
      studentsCount: uniqueStudents.size,
      completedLessons: completed,
      pendingLessons: pending
    };
  }, [lessons]);

  const nextWeek = () => setCurrentWeekStart(prev => addWeeks(prev, 1));
  const prevWeek = () => setCurrentWeekStart(prev => subWeeks(prev, 1));
  const goToToday = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  const hours = Array.from({ length: 14 }, (_, i) => i + 8);

  const todayLessons = useMemo(() => {
    return lessons.filter((l: any) => isSameDay(parseISO(l.date), new Date()));
  }, [lessons]);

  const positionedLessons = useMemo(() => {
    const result: any[] = [];
    const lessonsByDay: Record<string, any[]> = {};

    lessons.forEach((lesson: any) => {
      if (!lessonsByDay[lesson.date]) lessonsByDay[lesson.date] = [];
      lessonsByDay[lesson.date].push({ ...lesson });
    });

    Object.keys(lessonsByDay).forEach(date => {
      const dayLessons = lessonsByDay[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
      const columns: any[][] = [];

      dayLessons.forEach((lesson: any) => {
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

      columns.forEach((col: any[], colIndex: number) => {
        col.forEach((lesson: any) => {
          lesson.colIndex = colIndex;
          lesson.totalCols = columns.length;
          result.push(lesson);
        });
      });
    });
    return result;
  }, [lessons]);

  return (
    <div className="p-4 sm:p-8 lg:p-12 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">
      <header className="space-y-1">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
          <LayoutDashboard className="h-3.5 w-3.5" /> Resumen Docente
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-slate-900">
          {teacherProfile?.name ? `Bienvenido, ${teacherProfile.name}` : 'Bienvenido a tu Portal'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 italic">Aquí tienes un resumen de tu semana académica.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
         <Card className="bg-slate-900 text-white rounded-3xl sm:rounded-[2rem] border-none shadow-xl relative overflow-hidden group">
            <TrendingUp className="absolute top-[-10px] right-[-10px] h-24 sm:h-32 w-24 sm:w-32 text-white/5 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
            <CardContent className="p-4 sm:p-8 relative z-10">
               <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#DCA060] mb-1 sm:mb-2">Horas Semana</p>
               <p className="text-3xl sm:text-5xl font-black font-serif">{stats.weeklyHours}</p>
            </CardContent>
         </Card>

         <Card className="bg-white rounded-3xl sm:rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center">
            <CardContent className="p-4 sm:p-8">
               <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1 sm:mb-2">Alumnos</p>
               <div className="flex items-end justify-between sm:justify-start gap-2 sm:gap-3">
                  <p className="text-2xl sm:text-4xl font-black font-serif text-slate-900">{stats.studentsCount}</p>
                  <Users className="h-5 sm:h-6 w-5 sm:w-6 text-slate-300 mb-0.5 sm:mb-1" />
               </div>
            </CardContent>
         </Card>

         <Card className="bg-white rounded-3xl sm:rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center">
            <CardContent className="p-4 sm:p-8">
               <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1 sm:mb-2">Realizadas</p>
               <div className="flex items-end justify-between sm:justify-start gap-2 sm:gap-3">
                  <p className="text-2xl sm:text-4xl font-black font-serif text-emerald-600">{stats.completedLessons}</p>
                  <CheckCircle2 className="h-5 sm:h-6 w-5 sm:w-6 text-emerald-300 mb-0.5 sm:mb-1" />
               </div>
            </CardContent>
         </Card>

         <Card className="bg-white rounded-3xl sm:rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center">
            <CardContent className="p-4 sm:p-8">
               <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1 sm:mb-2">Por Realizar</p>
               <div className="flex items-end justify-between sm:justify-start gap-2 sm:gap-3">
                  <p className="text-2xl sm:text-4xl font-black font-serif text-amber-500">{stats.pendingLessons}</p>
                  <Clock className="h-5 sm:h-6 w-5 sm:w-6 text-amber-300 mb-0.5 sm:mb-1" />
               </div>
            </CardContent>
         </Card>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg sm:text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
             <CalendarIcon className="h-5 w-5 text-primary" /> {viewMode === 'CALENDAR' ? 'Horario Semanal' : 'Clases de Hoy'}
          </h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
            <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100 w-full sm:w-fit">
              <button 
                onClick={() => setViewMode('LIST')} 
                className={cn(
                  "flex-1 sm:flex-initial px-4 sm:px-6 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer",
                  viewMode === 'LIST' ? "bg-slate-900 text-white shadow-md" : "text-slate-400 hover:text-slate-900"
                )}
              >
                Hoy ({todayLessons.length})
              </button>
              <button 
                onClick={() => setViewMode('CALENDAR')} 
                className={cn(
                  "flex-1 sm:flex-initial px-4 sm:px-6 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer",
                  viewMode === 'CALENDAR' ? "bg-slate-900 text-white shadow-md" : "text-slate-400 hover:text-slate-900"
                )}
              >
                Calendario
              </button>
            </div>

            {viewMode === 'CALENDAR' && (
              <div className="flex items-center justify-between sm:justify-start gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
                <button onClick={prevWeek} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-900 cursor-pointer"><ChevronLeft className="h-4 w-4" /></button>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 flex-1 sm:min-w-[140px] text-center">
                  {format(currentWeekStart, "MMMM yyyy", { locale: es })}
                </span>
                <button onClick={nextWeek} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-900 cursor-pointer"><ChevronRight className="h-4 w-4" /></button>
                <div className="w-[1px] h-4 bg-slate-100 mx-1" />
                <button onClick={goToToday} className="px-3 sm:px-4 py-2 hover:bg-slate-50 rounded-xl transition-colors text-[10px] font-bold uppercase tracking-widest text-primary cursor-pointer">Hoy</button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {viewMode === 'CALENDAR' ? (
              <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col h-[700px] animate-in fade-in zoom-in-95 duration-500">
                <div className="flex-1 overflow-auto relative">
                  <div className="min-w-[800px] grid grid-cols-[80px_repeat(7,1fr)] relative">
                    {/* Day Headers */}
                    <div className="h-14 border-b border-slate-100 bg-slate-50/30 sticky top-0 z-20"></div>
                    {weekDays.map((day) => (
                      <div key={day.toString()} className={cn(
                        "h-14 border-b border-l border-slate-100 flex flex-col items-center justify-center sticky top-0 z-20 bg-slate-50/30 backdrop-blur-sm",
                        isToday(day) && "bg-primary/5 border-l-primary/10"
                      )}>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-1">
                          {format(day, "eee", { locale: es })}
                        </span>
                        <span className={cn(
                          "text-sm font-bold",
                          isToday(day) ? "text-primary" : "text-slate-900"
                        )}>
                          {format(day, "d")}
                        </span>
                      </div>
                    ))}

                    {/* Time Grid */}
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
                            className={cn(
                              "h-20 border-b border-l border-slate-50 relative group transition-colors hover:bg-slate-50/50",
                              isToday(day) && "bg-primary/[0.01]"
                            )}
                          />
                        ))}
                      </React.Fragment>
                    ))}

                    {/* Lessons Overlay */}
                    <div className="contents pointer-events-none">
                      {positionedLessons.map((lesson: any) => {
                        const lessonDate = parseISO(lesson.date);
                        const dayIndex = weekDays.findIndex(d => isSameDay(d, lessonDate));
                        if (dayIndex === -1) return null;

                        const [h, m] = lesson.startTime.split(':').map(Number);
                        const [eh, em] = (lesson.endTime || "00:00:00").split(':').map(Number);
                        const startOffset = h - 8 + (m / 60);
                        const duration = eh ? (eh + em/60) - (h + m/60) : 1;

                        const colWidth = `(100% - 80px) / 7 - 6px`;
                        const lessonWidth = `calc((${colWidth}) / ${lesson.totalCols})`;
                        const lessonLeft = `calc(80px + ${dayIndex} * (100% - 80px) / 7 + 3px + (${lesson.colIndex} * (${colWidth}) / ${lesson.totalCols}))`;
                        
                        return (
                          <div
                            key={lesson.id}
                            className={cn(
                              "absolute z-10 pointer-events-auto cursor-pointer p-2 transition-all hover:scale-[1.02] hover:z-20 overflow-hidden",
                              "rounded-xl shadow-sm border-l-4 flex flex-col gap-0.5",
                              lesson.status === 'COMPLETED' ? "bg-emerald-50 border-emerald-500 text-emerald-900" :
                              lesson.status === 'CANCELLED' ? "bg-rose-50 border-rose-500 text-rose-900" :
                              "bg-amber-50 border-amber-500 text-amber-900"
                            )}
                            style={{
                              top: `${56 + startOffset * 80}px`, 
                              left: lessonLeft,
                              width: lessonWidth,
                              height: `${duration * 80 - 2}px`,
                            }}
                          >
                            <span className="text-[8px] font-bold uppercase opacity-60">
                              {lesson.startTime.substring(0, 5)}
                            </span>
                            <p className="text-[10px] font-bold leading-tight truncate">
                              {lesson.student?.name}
                            </p>
                            <div className="mt-auto flex items-center gap-1 opacity-40">
                              <Music className="h-2 w-2" />
                              <span className="text-[7px] font-bold uppercase truncate">{lesson.room?.name}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Current Time Indicator */}
                    {weekDays.map((day, dayIdx) => isToday(day) && (
                      <div 
                        key="time-indicator"
                        className="absolute border-t-2 border-rose-500 z-30 pointer-events-none flex items-center"
                        style={{
                          top: `${56 + (new Date().getHours() - 8 + new Date().getMinutes() / 60) * 80}px`,
                          left: `calc(80px + ${dayIdx} * (100% - 80px) / 7)`,
                          width: `calc((100% - 80px) / 7)`,
                        }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-sm" style={{ marginLeft: '-3px' }}></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 space-y-4 min-h-[400px]">
                  {todayLessons.map((lesson: any) => (
                    <div key={lesson.id} className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 hover:border-primary/20 transition-colors bg-slate-50/50">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 flex flex-col items-center justify-center text-primary">
                              <span className="text-[10px] font-bold uppercase">{format(parseISO(lesson.date), "EEE", { locale: es })}</span>
                          </div>
                          <div>
                              <p className="font-bold text-slate-900">{lesson.student?.name || "Pre-reserva/Lead"}</p>
                              <p className="text-xs font-mono font-bold text-slate-500 mt-0.5">
                                {lesson.startTime.substring(0, 5)} - {lesson.endTime.substring(0, 5)} 
                                <span className="text-slate-300 mx-2">•</span> 
                                {lesson.room?.name || "Sin Sala"}
                              </p>
                          </div>
                        </div>
                        {lesson.status === 'COMPLETED' ? (
                          <Badge className="bg-emerald-50 text-emerald-600 border-0 text-[10px] font-black uppercase px-4 py-1.5 rounded-xl">Completada</Badge>
                        ) : (
                          <Badge className="bg-amber-50 text-amber-600 border-0 text-[10px] font-black uppercase px-4 py-1.5 rounded-xl">Pendiente</Badge>
                        )}
                    </div>
                  ))}
                  {todayLessons.length === 0 && (
                    <div className="text-center py-24 flex flex-col items-center justify-center">
                        <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-4">
                          <CalendarDays className="h-8 w-8" />
                        </div>
                        <p className="text-slate-400 italic text-sm">No tienes clases agendadas para hoy.</p>
                        <button onClick={() => setViewMode('CALENDAR')} className="mt-4 text-xs font-bold text-primary hover:underline uppercase tracking-widest">Ver calendario completo</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Area (Avisos) */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold font-serif text-slate-900">Avisos</h2>
            <AnnouncementsWidget targetAudience="TEACHERS" />
          </div>
        </div>
      </div>
    </div>
  );
}
