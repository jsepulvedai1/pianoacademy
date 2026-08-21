"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@apollo/client/react/index.js";
import { MY_STUDENT_PROFILE, MY_LESSONS, MY_PACKS } from "@/graphql/queries/portal-queries";
import { 
  Calendar, 
  Clock, 
  CreditCard, 
  Music, 
  GraduationCap, 
  AlertCircle, 
  ArrowRight, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
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
import AnnouncementsWidget from "@/components/widgets/announcements-widget";

export default function StudentDashboardPage() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [viewMode, setViewMode] = useState<'LIST' | 'CALENDAR'>('LIST');

  // GraphQL hooks
  const { data: profileData, loading: profileLoading } = useQuery<any>(MY_STUDENT_PROFILE);
  const { data: packsData, loading: packsLoading } = useQuery<any>(MY_PACKS);
  const { data: lessonsData, loading: lessonsLoading } = useQuery<any>(MY_LESSONS);

  const studentProfile = profileData?.myStudentProfile;
  const packs = packsData?.myPacks || [];
  const lessons = lessonsData?.myLessons || [];

  const activePack = packs.find((p: any) => p.isActive) || packs[0];

  const student = useMemo(() => {
    return {
      name: studentProfile?.name || "Alumno",
      plan: {
        name: activePack?.plan?.name || "Sin Plan Activo",
        status: activePack?.isActive ? (activePack.remainingClasses <= 1 ? "EXPIRING" : "ACTIVE") : "EXPIRED",
        classesRemaining: activePack?.remainingClasses ?? 0,
        totalClasses: activePack?.totalClasses ?? 0,
        expirationDate: activePack?.expirationDate ? format(parseISO(activePack.expirationDate), "d 'de' MMMM, yyyy", { locale: es }) : "Sin expirar",
        paymentLink: "https://api.detache.cl/payments"
      }
    };
  }, [studentProfile, activePack]);

  if (profileLoading || packsLoading || lessonsLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-slate-400 text-xs italic">Cargando tu resumen académico...</p>
      </div>
    );
  }

  const nextWeek = () => setCurrentWeekStart(prev => addWeeks(prev, 1));
  const prevWeek = () => setCurrentWeekStart(prev => subWeeks(prev, 1));
  const goToToday = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  const hours = Array.from({ length: 14 }, (_, i) => i + 8);

  const isExpiring = student.plan.classesRemaining <= 1 || student.plan.status === "EXPIRING";

  const nextClass = useMemo(() => {
     return lessons.find((l: any) => parseISO(l.date) >= new Date()) || lessons[0];
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
          <GraduationCap className="h-3.5 w-3.5" /> Portal Alumno
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-slate-900">Hola, {student.name.split(' ')[0]}</h1>
        <p className="text-xs sm:text-sm text-slate-500 italic">Aquí está el resumen de tus clases y estado actual.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Main Content: List or Calendar */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
             <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100 w-full sm:w-fit">
                <button 
                  onClick={() => setViewMode('LIST')} 
                  className={cn(
                    "flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 sm:py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer",
                    viewMode === 'LIST' ? "bg-slate-900 text-white shadow-md" : "text-slate-400 hover:text-slate-900"
                  )}
                >
                  Próxima Clase
                </button>
                <button 
                  onClick={() => setViewMode('CALENDAR')} 
                  className={cn(
                    "flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 sm:py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer",
                    viewMode === 'CALENDAR' ? "bg-slate-900 text-white shadow-md" : "text-slate-400 hover:text-slate-900"
                  )}
                >
                  Calendario
                </button>
             </div>

             {viewMode === 'CALENDAR' && (
                <div className="flex items-center justify-between sm:justify-start gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
                   <button onClick={prevWeek} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-900 cursor-pointer"><ChevronLeft className="h-4 w-4" /></button>
                   <span className="text-[10px] font-bold uppercase tracking-widest px-2 flex-1 sm:min-w-[120px] text-center">
                     {format(currentWeekStart, "MMMM", { locale: es })}
                   </span>
                   <button onClick={nextWeek} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-900 cursor-pointer"><ChevronRight className="h-4 w-4" /></button>
                   <div className="w-[1px] h-4 bg-slate-100 mx-1" />
                   <button onClick={goToToday} className="px-3 sm:px-4 py-2 hover:bg-slate-50 rounded-xl transition-colors text-[10px] font-bold uppercase tracking-widest text-primary cursor-pointer">Hoy</button>
                </div>
             )}
          </div>

          {viewMode === 'LIST' ? (
            <Card className="rounded-3xl sm:rounded-[2.5rem] border-none shadow-xl bg-slate-900 text-white overflow-hidden relative group animate-in fade-in slide-in-from-left-4 duration-500">
               <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-colors duration-700 pointer-events-none" />
               <CardContent className="p-6 sm:p-10 relative z-10">
                  {nextClass ? (
                    <>
                      <div className="flex items-center gap-3 mb-6 sm:mb-8">
                        <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                          <Calendar className="h-5 sm:h-6 w-5 sm:w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Tu Siguiente Sesión</p>
                          <h2 className="text-lg sm:text-xl font-bold font-serif text-white">{isToday(parseISO(nextClass.date)) ? "Hoy" : format(parseISO(nextClass.date), "EEEE d 'de' MMMM", { locale: es })}</h2>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
                        <div className="space-y-1 bg-white/5 p-3.5 rounded-2xl sm:bg-transparent sm:p-0">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><Clock className="h-3 w-3" /> Horario</p>
                          <p className="text-base sm:text-lg font-bold">{nextClass.startTime.substring(0, 5)} - {nextClass.endTime.substring(0, 5)}</p>
                        </div>
                        <div className="space-y-1 bg-white/5 p-3.5 rounded-2xl sm:bg-transparent sm:p-0">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><Music className="h-3 w-3" /> Sala</p>
                          <p className="text-base sm:text-lg font-bold truncate">{nextClass.room?.name || "No asignada"}</p>
                        </div>
                      </div>

                      <div className="pt-6 sm:pt-8 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Profesor</p>
                          <p className="font-medium text-slate-200 text-sm sm:text-base">{nextClass.teacher?.name || "No asignado"}</p>
                        </div>
                        <Link href="/portal-alumno/wall" className="w-full sm:w-auto">
                          <Button className="w-full sm:w-auto rounded-xl bg-primary hover:bg-primary/90 text-white font-bold uppercase text-[10px] tracking-widest h-11 sm:h-10 px-6 shadow-lg shadow-primary/20 transition-transform cursor-pointer">
                            Ver Muro <ArrowRight className="h-3 w-3 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="p-4 rounded-full bg-white/5 mb-4">
                        <Calendar className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="text-lg font-serif font-bold text-white mb-1">No hay próximas clases</p>
                      <p className="text-sm text-slate-400">No tienes sesiones programadas en este momento.</p>
                    </div>
                  )}
               </CardContent>
            </Card>
          ) : (
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col h-[600px] animate-in fade-in zoom-in-95 duration-500">
               <div className="flex-1 overflow-auto relative">
                 <div className="min-w-[700px] grid grid-cols-[70px_repeat(7,1fr)] relative">
                    {/* Day Headers */}
                    <div className="h-12 border-b border-slate-100 bg-slate-50/30 sticky top-0 z-20"></div>
                    {weekDays.map((day) => (
                      <div key={day.toString()} className={cn(
                        "h-12 border-b border-l border-slate-100 flex flex-col items-center justify-center sticky top-0 z-20 bg-slate-50/30 backdrop-blur-sm",
                        isToday(day) && "bg-primary/5 border-l-primary/10"
                      )}>
                        <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-1">
                          {format(day, "eee", { locale: es })}
                        </span>
                        <span className={cn(
                          "text-xs font-bold",
                          isToday(day) ? "text-primary" : "text-slate-900"
                        )}>
                          {format(day, "d")}
                        </span>
                      </div>
                    ))}

                    {/* Time Grid */}
                    {hours.map((hour) => (
                      <React.Fragment key={hour}>
                        <div className="h-16 border-b border-slate-50 flex items-start justify-end pr-3 pt-1.5 group">
                          <span className="text-[9px] font-bold text-slate-200 group-hover:text-slate-400 transition-colors">
                            {hour}:00
                          </span>
                        </div>
                        {weekDays.map((day) => (
                          <div 
                            key={`${day}-${hour}`} 
                            className={cn(
                              "h-16 border-b border-l border-slate-50 relative",
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

                        const colWidth = `(100% - 70px) / 7 - 4px`;
                        const lessonWidth = `calc((${colWidth}) / ${lesson.totalCols})`;
                        const lessonLeft = `calc(70px + ${dayIndex} * (100% - 70px) / 7 + 2px + (${lesson.colIndex} * (${colWidth}) / ${lesson.totalCols}))`;
                        
                        return (
                          <div
                            key={lesson.id}
                            className={cn(
                              "absolute z-10 pointer-events-auto cursor-pointer p-2 transition-all hover:scale-[1.02] hover:z-20 overflow-hidden",
                              "rounded-lg shadow-sm border-l-4 flex flex-col gap-0.5",
                              lesson.status === 'COMPLETED' ? "bg-emerald-50 border-emerald-500 text-emerald-900" :
                              lesson.status === 'CANCELLED' ? "bg-rose-50 border-rose-500 text-rose-900" :
                              "bg-indigo-50 border-indigo-500 text-indigo-900"
                            )}
                            style={{
                              top: `${48 + startOffset * 64}px`, 
                              left: lessonLeft,
                              width: lessonWidth,
                              height: `${duration * 64 - 1}px`,
                            }}
                          >
                            <span className="text-[7px] font-bold uppercase opacity-60">
                              {lesson.startTime.substring(0, 5)}
                            </span>
                            <p className="text-[9px] font-bold leading-tight truncate">
                              {lesson.teacher.name}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                 </div>
               </div>
            </div>
          )}
        </div>

        {/* Plan Status & Billing */}
        <div className="md:col-span-1 space-y-6">
          <Card className="rounded-[2.5rem] border border-slate-100 shadow-sm bg-white overflow-hidden">
             <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Tu Plan Actual</p>
                  <Badge variant="outline" className="border-slate-200 text-slate-600 font-bold uppercase text-[9px] tracking-widest">
                    {student.plan.name}
                  </Badge>
                </div>

                <div className="space-y-6">
                  <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-4xl font-black font-serif text-slate-900 mb-1">{student.plan.classesRemaining}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Clases Restantes</p>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full mt-4 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${isExpiring ? 'bg-amber-500' : 'bg-primary'}`} 
                        style={{ width: `${(student.plan.classesRemaining / student.plan.totalClasses) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Vencimiento</p>
                    <p className="font-medium text-slate-900">{student.plan.expirationDate}</p>
                  </div>
                </div>
             </CardContent>
          </Card>

          {/* Payment CTA */}
          {isExpiring && (
            <Card className="rounded-[2rem] border border-amber-200 shadow-sm bg-amber-50 overflow-hidden relative">
               <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-amber-900 mb-1">Renueva tu plan</h3>
                      <p className="text-xs text-amber-700/80 font-medium mb-4 leading-relaxed">
                        Te quedan pocas clases. Puedes renovar ahora para asegurar tu cupo y horario actual.
                      </p>
                      <a href={student.plan.paymentLink} target="_blank" rel="noopener noreferrer">
                        <Button className="w-full rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold uppercase text-[10px] tracking-widest h-10 shadow-lg shadow-amber-600/20">
                          Pagar Mensualidad <ExternalLink className="h-3 w-3 ml-2" />
                        </Button>
                      </a>
                    </div>
                  </div>
               </CardContent>
            </Card>
          )}

          <AnnouncementsWidget targetAudience="STUDENTS" />

        </div>
      </div>
    </div>
  );
}
