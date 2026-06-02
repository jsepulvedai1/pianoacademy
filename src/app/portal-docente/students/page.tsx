"use client";

import { Users, Search, ChevronRight, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export default function TeacherStudentsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Simulated data
  const students = [
    { id: "1", name: "Ana Martínez", age: 14, lastClass: "2024-05-01", pack: "Piano Básico 4 Clases" },
    { id: "2", name: "Carlos Soto", age: 25, lastClass: "2024-05-02", pack: "Piano Avanzado 12 Clases" },
    { id: "3", name: "Sofía Vergara", age: 9, lastClass: "2024-05-04", pack: "Iniciación Musical" },
  ];

  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-8 lg:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
            <Users className="h-3 w-3" /> Comunidad
          </div>
          <h1 className="text-3xl font-bold font-serif tracking-tight text-slate-900">Mis Alumnos</h1>
          <p className="text-slate-500 italic">Haz seguimiento al progreso y comparte material de estudio.</p>
        </div>
      </header>

      <div className="flex bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar alumno..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm outline-none" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                     <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Alumno</th>
                     <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Edad</th>
                     <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Programa</th>
                     <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Última Clase</th>
                     <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Acciones</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {filteredStudents.map(student => (
                     <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                                 <GraduationCap className="h-5 w-5" />
                              </div>
                              <span className="font-bold text-slate-900 group-hover:text-primary transition-colors">{student.name}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6 font-medium text-slate-500">{student.age} años</td>
                        <td className="px-8 py-6">
                           <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-400 border-slate-200">{student.pack}</Badge>
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
