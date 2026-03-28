"use client";

import { useState } from "react";
import { 
  GraduationCap, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Calendar, 
  Clock,
  User,
  Music,
  ChevronRight,
  CheckCircle2,
  XCircle,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// 🎻 Mock Data for Teachers (Shared Logic)
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

const MOCK_STUDENTS = [
  {
    id: "S1",
    name: "Lucas Gómez",
    instrument: "Piano",
    level: "Principiante",
    status: "ACTIVE",
    joinDate: "2024-01-15",
    photo: null
  },
  {
    id: "S2",
    name: "Elena Pérez",
    instrument: "Violín",
    level: "Intermedio",
    status: "ACTIVE",
    joinDate: "2023-11-20",
    photo: null
  },
  {
    id: "S3",
    name: "Mateo Rodríguez",
    instrument: "Guitarra",
    level: "Avanzado",
    status: "ACTIVE",
    joinDate: "2024-02-10",
    photo: null
  },
  {
    id: "S4",
    name: "Isabel Torres",
    instrument: "Canto",
    level: "Principiante",
    status: "INACTIVE",
    joinDate: "2023-09-05",
    photo: null
  }
];

export default function AdminStudentsPage() {
  const [students, setStudents] = useState(MOCK_STUDENTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Assignment Modal State
  const [assignTeacher, setAssignTeacher] = useState("");
  const [assignDate, setAssignDate] = useState("");
  const [assignTime, setAssignTime] = useState("");
  const [assignRoom, setAssignRoom] = useState("");
  const [assignType, setAssignType] = useState("");

  const MOCK_ROOMS = ["Sala de Piano", "Sala de Ensayo", "Cabina A", "Cabina B"];
  const MOCK_TYPES = ["Clase Individual", "Masterclass", "Teoría Musical", "Ensamble"];

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDayName = (dateStr: string) => {
    if (!dateStr) return "";
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const d = new Date(dateStr);
    return days[d.getDay()];
  };

  const getAvailableSlots = () => {
    if (!assignTeacher || !assignDate) return [];
    const teacher = MOCK_TEACHERS.find(t => t.id === assignTeacher);
    if (!teacher) return [];
    
    const dayName = getDayName(assignDate);
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

  const handleAssignClick = (student: any) => {
    setSelectedStudent(student);
    setIsAssignModalOpen(true);
    // Reset assignment state
    setAssignTeacher("");
    setAssignDate("");
    setAssignTime("");
  };

  return (
    <div className="p-8 lg:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
            <GraduationCap className="h-3 w-3" /> Comunidad Estudiantil
          </div>
          <h1 className="text-3xl font-bold font-serif tracking-tight">Gestión de Estudiantes</h1>
          <p className="text-slate-500 italic">Centraliza el progreso y agendamiento de tus alumnos.</p>
        </div>
        <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-12 px-8 font-bold uppercase tracking-[0.1em] group rounded-2xl">
          <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" /> Registrar Alumno
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

      {/* Students Table */}
      <Card className="border-none shadow-sm overflow-hidden bg-white rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 italic">
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Estudiante</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Nivel / Instrumento</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Fecha de Ingreso</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Estado</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center text-slate-300 border border-slate-100 shadow-sm">
                        <User className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-none mb-1">{student.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Matrícula: #{student.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary font-bold uppercase text-[9px] tracking-widest px-3 py-1 ring-1 ring-primary/20">
                        {student.level}
                      </Badge>
                      <Badge variant="outline" className="border-slate-100 text-slate-500 font-bold text-[9px] tracking-widest uppercase">
                        <Music className="h-3 w-3 mr-1" /> {student.instrument}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-medium text-slate-600 italic">
                    {student.joinDate}
                  </td>
                  <td className="px-8 py-6">
                    <Badge className={`font-bold uppercase text-[9px] tracking-widest px-3 py-1 ${student.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20' : 'bg-slate-100 text-slate-500'}`}>
                      {student.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        onClick={() => handleAssignClick(student)}
                        variant="ghost" size="sm" className="h-10 px-4 rounded-xl hover:bg-primary/10 hover:text-primary transition-all font-bold uppercase text-[9px] tracking-widest shadow-sm border border-slate-100"
                      >
                        <Calendar className="h-4 w-4 mr-2" /> Asignar Clase
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400">
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

      {/* Assign Class Modal */}
      {isAssignModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <Card className="w-full max-w-xl bg-white border-none shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 rounded-[2.5rem]">
            <header className="p-10 bg-slate-900 text-white relative">
              <button 
                onClick={() => setIsAssignModalOpen(false)}
                className="absolute top-8 right-8 p-3 rounded-full hover:bg-white/10 transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Agendamiento Directo</p>
                <h3 className="text-3xl font-bold font-serif whitespace-nowrap">Asignar Clase a Alumno</h3>
                <div className="flex items-center gap-2 text-white/70 italic text-sm mt-2">
                  <User className="h-3 w-3 text-primary" />
                  <span>Configurando sesión para <strong>{selectedStudent.name}</strong></span>
                </div>
              </div>
            </header>

            <CardContent className="p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Step 1: Teacher Selection */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <BookOpen className="h-3 w-3" /> Seleccionar Profesor
                  </label>
                  <select 
                    className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-700 appearance-none shadow-sm"
                    value={assignTeacher}
                    onChange={(e) => { setAssignTeacher(e.target.value); setAssignTime(""); }}
                  >
                    <option value="">Buscar docente...</option>
                    {MOCK_TEACHERS.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.instrument})</option>
                    ))}
                  </select>
                </div>

                {/* Step 2: Date Selection */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <Calendar className="h-3 w-3" /> Fecha de Sesión
                  </label>
                  <input 
                    type="date"
                    className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-700 shadow-sm"
                    value={assignDate}
                    onChange={(e) => { setAssignDate(e.target.value); setAssignTime(""); }}
                  />
                </div>

                {/* Step 3: Room Selection */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <Music className="h-3 w-3" /> Seleccionar Sala
                  </label>
                  <select 
                    className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-700 appearance-none shadow-sm"
                    value={assignRoom}
                    onChange={(e) => setAssignRoom(e.target.value)}
                  >
                    <option value="">Elige una sala...</option>
                    {MOCK_ROOMS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* Step 4: Class Type Selection */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <BookOpen className="h-3 w-3" /> Tipo de Clase
                  </label>
                  <select 
                    className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-700 appearance-none shadow-sm"
                    value={assignType}
                    onChange={(e) => setAssignType(e.target.value)}
                  >
                    <option value="">Elige un tipo...</option>
                    {MOCK_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Step 3: Available Hours */}
              {assignTeacher && assignDate && (
                <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                  <header className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                      <Clock className="h-3 w-3" /> Horarios Autorizados ({getDayName(assignDate)})
                    </label>
                    <Badge variant="outline" className="text-[10px] font-bold uppercase text-primary border-primary/20">
                      Smart Check OK
                    </Badge>
                  </header>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {getAvailableSlots().length > 0 ? getAvailableSlots().map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setAssignTime(slot)}
                        className={`p-4 rounded-2xl border transition-all text-xs font-bold uppercase tracking-widest ${assignTime === slot 
                          ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105' 
                          : 'bg-white border-slate-100 text-slate-400 hover:border-primary/40 hover:text-primary hover:bg-primary/[0.02]'}`}
                      >
                        {slot.split(' - ')[0]}
                      </button>
                    )) : (
                      <div className="col-span-full py-8 text-center text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        No hay disponibilidad permitida para este día.
                      </div>
                    )}
                  </div>
                </div>
              )}

              <footer className="flex gap-4 pt-6 border-t border-slate-100 mt-10">
                <Button variant="outline" className="flex-1 h-14 rounded-2xl border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-widest" onClick={() => setIsAssignModalOpen(false)}>Cerrar</Button>
                <Button 
                  disabled={!assignTime}
                  className="flex-1 h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase text-[10px] tracking-widest shadow-xl shadow-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Agendar Sesión
                </Button>
              </footer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-10 shadow-sm group">
        <div className="h-20 w-20 rounded-3xl bg-primary shadow-2xl flex items-center justify-center text-white shrink-0 group-hover:rotate-12 transition-transform duration-500">
          <BookOpen className="h-10 w-10" />
        </div>
        <div className="space-y-2 flex-1 text-center md:text-left">
          <h4 className="font-bold text-xl font-serif">Integración Alumno-Docente</h4>
          <p className="text-slate-500 text-sm italic leading-relaxed max-w-2xl">
            Desde este listado puedes orquestar el agendamiento directo. Al asignar una clase, el sistema valida la disponibilidad técnica del profesor, garantizando que no existan conflictos de agenda.
          </p>
        </div>
        <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-widest text-[10px] h-14 px-10 rounded-2xl shadow-xl transition-all hover:-translate-y-1">
          Ver Reportes
        </Button>
      </div>
    </div>
  );
}
