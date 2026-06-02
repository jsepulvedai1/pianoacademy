"use client";

import React, { useState, useMemo } from "react";
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
  ChevronRight
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

export default function StudentDashboardPage() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [viewMode, setViewMode] = useState<'LIST' | 'CALENDAR'>('LIST');

  // Simulated student data
  const student = {
    name: "Ana Martínez",
    plan: {
      name: "Piano Básico Mensual",
      status: "ACTIVE", // ACTIVE, EXPIRING, EXPIRED
      classesRemaining: 2,
      totalClasses: 4,
      expirationDate: "15 de Mayo, 2024",
      paymentLink: "https://flow.cl/payment/12345"
    }
  };

  // Simulated student classes for the week
  const lessons = [
    { id: 1, date: format(new Date(), "yyyy-MM-dd"), startTime: "15:00:00", endTime: "16:00:00", teacher: { name: "Profesor Roberto" }, status: "PENDING", room: { name: "Sala 1" } },
    { id: 2, date: format(addDays(new Date(), 2), "yyyy-MM-dd"), startTime: "11:00:00", endTime: "12:00:00", teacher: { name: "Profesor Roberto" }, status: "PENDING", room: { name: "Sala 2" } },
  ];

  const nextWeek = () => setCurrentWeekStart(prev => addWeeks(prev, 1));
  const prevWeek = () => setCurrentWeekStart(prev => subWeeks(prev, 1));
  const goToToday = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  const hours = Array.from({ length: 14 }, (_, i) => i + 8);

  const isExpiring = student.plan.classesRemaining <= 1 || student.plan.status === "EXPIRING";

  const nextClass = useMemo(() => {
     return lessons.find(l => parseISO(l.date) >= new Date()) || lessons[0];
  }, [lessons]);

  const positionedLessons = useMemo(() => {
    const result: any[] = [];
    const lessonsByDay: Record<string, any[]> = {};

    lessons.forEach(lesson => {
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
  }, [lessons]);

  return (
    <div className="p-8 lg:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">
      <header className="space-y-1">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
          <GraduationCap className="h-3 w-3" /> Portal Alumno
        </div>
        <h1 className="text-3xl font-bold font-serif tracking-tight text-slate-900">Hola, {student.name.split(' ')[0]}</h1>
        <p className="text-slate-500 italic">Aquí está el resumen de tus clases y estado actual.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Main Content: List or Calendar */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100 w-fit">
                <button 
                  onClick={() => setViewMode('LIST')} 
                  className={cn(
                    "px-6 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all",
                    viewMode === 'LIST' ? "bg-slate-900 text-white shadow-md" : "text-slate-400 hover:text-slate-900"
                  )}
                >
                  Próxima Clase
                </button>
                <button 
                  onClick={() => setViewMode('CALENDAR')} 
                  className={cn(
                    "px-6 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all",
                    viewMode === 'CALENDAR' ? "bg-slate-900 text-white shadow-md" : "text-slate-400 hover:text-slate-900"
                  )}
                >
                  Calendario
                </button>
             </div>

             {viewMode === 'CALENDAR' && (
                <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
                   <button onClick={prevWeek} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-900"><ChevronLeft className="h-4 w-4" /></button>
                   <span className="text-[10px] font-bold uppercase tracking-widest px-2 min-w-[120px] text-center">
                     {format(currentWeekStart, "MMMM", { locale: es })}
                   </span>
                   <button onClick={nextWeek} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-900"><ChevronRight className="h-4 w-4" /></button>
                   <div className="w-[1px] h-4 bg-slate-100 mx-1" />
                   <button onClick={goToToday} className="px-4 py-2 hover:bg-slate-50 rounded-xl transition-colors text-[10px] font-bold uppercase tracking-widest text-primary">Hoy</button>
                </div>
             )}
          </div>

          {viewMode === 'LIST' ? (
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-slate-900 text-white overflow-hidden relative group animate-in fade-in slide-in-from-left-4 duration-500">
               <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-colors duration-700 pointer-events-none" />
               <CardContent className="p-10 relative z-10">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Tu Siguiente Sesión</p>
                      <h2 className="text-xl font-bold font-serif text-white">{isToday(parseISO(nextClass.date)) ? "Hoy" : format(parseISO(nextClass.date), "EEEE d 'de' MMMM", { locale: es })}</h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><Clock className="h-3 w-3" /> Horario</p>
                      <p className="text-lg font-bold">{nextClass.startTime.substring(0, 5)} - {nextClass.endTime.substring(0, 5)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><Music className="h-3 w-3" /> Sala</p>
                      <p className="text-lg font-bold">{nextClass.room.name}</p>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Profesor</p>
                      <p className="font-medium text-slate-200">{nextClass.teacher.name}</p>
                    </div>
                    <Link href="/portal-alumno/wall">
                      <Button className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold uppercase text-[10px] tracking-widest h-10 px-6 shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                        Ver Muro <ArrowRight className="h-3 w-3 ml-2" />
                      </Button>
                    </Link>
                  </div>
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

        </div>
      </div>
    </div>
  );
}
