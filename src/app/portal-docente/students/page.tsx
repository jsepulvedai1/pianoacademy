"use client";

import { Users, Search, ChevronRight, GraduationCap, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@apollo/client/react/index.js";
import { MY_LESSONS, MY_STUDENTS } from "@/graphql/queries/portal-queries";

export default function TeacherStudentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: studentsData, loading: loadingStudents } = useQuery<any>(MY_STUDENTS);
  const { data: lessonsData, loading: loadingLessons } = useQuery<any>(MY_LESSONS);

  const loading = loadingStudents && loadingLessons;
  const rawStudents = studentsData?.myStudents || [];
  const lessons = lessonsData?.myLessons || [];

  const students = useMemo(() => {
    const studentMap: Record<string, any> = {};

    // 1. Add directly assigned students
    rawStudents.forEach((s: any) => {
      studentMap[s.id] = {
        id: s.id,
        name: s.name,
        level: s.level || "Básico",
        lastClass: "Sin clases aún"
      };
    });

    // 2. Augment with lessons (and find latest class date)
    lessons.forEach((l: any) => {
      const s = l.student;
      if (!s) return;
      if (!studentMap[s.id]) {
        studentMap[s.id] = {
          id: s.id,
          name: s.name,
          level: s.level || "Básico",
          lastClass: l.date
        };
      } else {
        if (studentMap[s.id].lastClass === "Sin clases aún" || l.date > studentMap[s.id].lastClass) {
          studentMap[s.id].lastClass = l.date;
        }
      }
    });

    return Object.values(studentMap);
  }, [rawStudents, lessons]);

  const filteredStudents = useMemo(() => {
    return students.filter((s: any) => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [students, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 text-[#70125F] animate-spin" />
        <p className="text-slate-400 text-xs italic">Cargando lista de alumnos...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 lg:p-12 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
            <Users className="h-3.5 w-3.5" /> Comunidad
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-slate-900">Mis Alumnos</h1>
          <p className="text-xs sm:text-sm text-slate-500 italic">Haz seguimiento al progreso y comparte material de estudio.</p>
        </div>
      </header>

      <div className="flex bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar alumno..." 
            className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-slate-50 border-none rounded-xl text-sm outline-none" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
      </div>

      {/* ── Mobile Card View (< sm) ── */}
      <div className="grid grid-cols-1 gap-3 sm:hidden">
        {filteredStudents.map((student: any) => (
          <Link
            key={student.id}
            href={`/portal-docente/students/${student.id}`}
            className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-primary/30 transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">{student.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="text-[9px] uppercase font-bold text-slate-500 border-slate-200 px-1.5 py-0">
                    {student.level}
                  </Badge>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {student.lastClass !== "Sin clases aún" ? student.lastClass : 'Nueva'}
                  </span>
                </div>
              </div>
            </div>
            <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
              <ChevronRight className="h-4 w-4" />
            </div>
          </Link>
        ))}
        {filteredStudents.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 text-slate-400 text-xs italic">
            No se encontraron alumnos.
          </div>
        )}
      </div>

      {/* ── Desktop Table View (>= sm) ── */}
      <div className="hidden sm:block bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                     <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Alumno</th>
                     <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Nivel</th>
                     <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Última Clase</th>
                     <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Acciones</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {filteredStudents.map((student: any) => (
                     <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                                 <GraduationCap className="h-5 w-5" />
                              </div>
                              <span className="font-bold text-slate-900 group-hover:text-primary transition-colors">{student.name}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-400 border-slate-200">{student.level}</Badge>
                        </td>
                        <td className="px-8 py-6 font-mono text-xs text-slate-400">{student.lastClass}</td>
                        <td className="px-8 py-6 text-right">
                           <Link href={`/portal-docente/students/${student.id}`} className="inline-flex items-center justify-center h-10 w-10 rounded-xl text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors">
                              <ChevronRight className="h-5 w-5" />
                           </Link>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
