"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { 
  Users, Search, Plus, Calendar, Clock, User, Music,
  ChevronRight, CheckCircle2, XCircle, GraduationCap,
  Activity, Mail, Phone, MapPin, CalendarDays, Award,
  FileText, X, Loader2, Filter, Download, Edit2, TrendingUp,
  History, CalendarCheck
} from "lucide-react";
import { format, parseISO, isAfter, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@apollo/client/react/index.js";
import { GET_TEACHERS } from "@/graphql/queries/get-teachers";
import { GET_STUDENTS_LIST } from "@/graphql/queries/get-students";
import { GET_LESSONS } from "@/graphql/queries/get-lessons";
import { GET_INSTRUMENTS } from "@/graphql/queries/get-instruments";
import { CREATE_TEACHER, UPDATE_TEACHER } from "@/graphql/mutations/create-teacher";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE:   { label: 'Activo',     color: 'text-emerald-700', bg: 'bg-emerald-50' },
  INACTIVE: { label: 'Inactivo',   color: 'text-slate-500',   bg: 'bg-slate-100' },
  PENDING:  { label: 'Pendiente',  color: 'text-amber-700',   bg: 'bg-amber-50' }
};

export default function AdminTeachersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'PERFIL' | 'AGENDA' | 'ALUMNOS' | 'STATS'>('PERFIL');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "ACTIVE",
    phoneNumber: "",
    specialtyIds: [] as number[]
  });

  // ── GraphQL Hooks ───────────────────────────────────────────
  const { data: teachersData, loading: teachersLoading, refetch: refetchTeachers } = useQuery<any>(GET_TEACHERS);
  const { data: studentsData } = useQuery<any>(GET_STUDENTS_LIST);
  const { data: lessonsData } = useQuery<any>(GET_LESSONS);
  const { data: instrumentsData } = useQuery<any>(GET_INSTRUMENTS);
  
  const [createTeacher, { loading: creating }] = useMutation(CREATE_TEACHER, {
    onCompleted: () => {
      toast.success("Profesor registrado exitosamente ✅");
      closeModal();
      refetchTeachers();
    },
    onError: (err: any) => toast.error(err.message)
  });

  const [updateTeacher, { loading: updating }] = useMutation(UPDATE_TEACHER, {
    onCompleted: () => {
      toast.success("Profesor actualizado exitosamente ✅");
      closeModal();
      refetchTeachers();
    },
    onError: (err: any) => toast.error(err.message)
  });

  const teachers = teachersData?.allTeachers || [];
  const lessons = lessonsData?.allLessons || [];
  const studentPacks = studentsData?.allStudentPacks || [];
  const instruments = instrumentsData?.allInstruments || [];

  const filteredTeachers = teachers.filter((t: any) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const teacherLessons = useMemo(() => {
    if (!selectedTeacher) return [];
    const filtered = lessons.filter((l: any) => l.teacher?.id === selectedTeacher.id);
    return [...filtered].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateB.getTime() - dateA.getTime(); // More recent first
    });
  }, [selectedTeacher, lessons]);

  const teacherPacks = useMemo(() => 
    selectedTeacher ? studentPacks.filter((p: any) => p.student?.teacher?.id === selectedTeacher.id) : [], 
  [selectedTeacher, studentPacks]);

  const openModal = (teacher: any = null) => {
    if (teacher) {
      setEditingTeacher(teacher);
      setFormData({
        name: teacher.name,
        description: teacher.description || "",
        status: teacher.status,
        phoneNumber: teacher.phoneNumber || "",
        specialtyIds: teacher.specialties?.map((s: any) => parseInt(s.id)) || []
      });
    } else {
      setEditingTeacher(null);
      setFormData({ name: "", description: "", status: "ACTIVE", phoneNumber: "", specialtyIds: [] });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTeacher(null);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;
    const { __typename, specialtyIds, ...rest } = formData as any;
    const variables = { 
      ...rest, 
      specialtyIds: specialtyIds.map((id: any) => parseInt(id.toString())) 
    };
    
    if (editingTeacher) {
      updateTeacher({ variables: { id: parseInt(editingTeacher.id), ...variables } });
    } else {
      createTeacher({ variables });
    }
  };

  const toggleSpecialty = (id: number) => {
    setFormData(prev => ({
      ...prev,
      specialtyIds: prev.specialtyIds.includes(id) 
        ? prev.specialtyIds.filter(sid => sid !== id) 
        : [...prev.specialtyIds, id]
    }));
  };

  return (
    <div className="p-8 lg:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
            <Users className="h-3 w-3" /> Staff Détaché
          </div>
          <h1 className="text-3xl font-bold font-serif tracking-tight">Gestión de Profesores</h1>
          <p className="text-slate-500 italic text-sm">Control de disponibilidad y carga académica.</p>
        </div>
        <Button onClick={() => openModal()} size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-lg h-12 px-8 font-bold uppercase tracking-[0.1em] rounded-2xl">
          <Plus className="mr-2 h-5 w-5" /> Añadir Profesor
        </Button>
      </header>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <Card className="w-full max-w-2xl bg-white border-none shadow-2xl overflow-hidden rounded-[2.5rem] my-8">
            <div className="p-10 space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold font-serif">{editingTeacher ? 'Editar Profesor' : 'Nuevo Registro'}</h3>
                  <p className="text-slate-400 text-xs italic">Completa el perfil del docente.</p>
                </div>
                <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="h-6 w-6 text-slate-400" /></button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nombre Completo *</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full h-12 bg-slate-50 rounded-2xl px-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" placeholder="Ej: Roberto instrumentista" />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Teléfono</label>
                    <input type="text" value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} className="w-full h-12 bg-slate-50 rounded-2xl px-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" placeholder="+56 9..." />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Estado</label>
                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full h-12 bg-slate-50 rounded-2xl px-4 outline-none font-bold">
                       <option value="ACTIVE">Activo</option>
                       <option value="INACTIVE">Inactivo</option>
                    </select>
                 </div>

                 <div className="col-span-2 space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Instrumentos que imparte</label>
                    <div className="flex flex-wrap gap-2">
                       {instruments.map((inst: any) => {
                         const isSelected = formData.specialtyIds.includes(parseInt(inst.id));
                         return (
                           <button key={inst.id} onClick={() => toggleSpecialty(parseInt(inst.id))} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${isSelected ? 'bg-primary text-white border-primary shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-primary/40'}`}>
                             {inst.name}
                           </button>
                         );
                       })}
                    </div>
                 </div>

                 <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Biografía / Descripción</label>
                    <textarea rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm" placeholder="Reseña del profesor..." />
                 </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button variant="ghost" className="flex-1 h-12 rounded-2xl font-bold uppercase text-[10px] tracking-widest" onClick={closeModal}>Cancelar</Button>
                <Button disabled={!formData.name.trim() || creating || updating} className="flex-1 h-12 bg-slate-900 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest shadow-xl shadow-slate-900/20" onClick={handleSubmit}>
                  {creating || updating ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingTeacher ? "Guardar Cambios" : "Confirmar Staff")}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Card className="border-none shadow-sm overflow-hidden bg-white rounded-3xl">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
           <div className="relative w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input type="text" placeholder="Buscar profesor..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
           </div>
           <Badge variant="outline" className="border-slate-100 text-slate-400 text-[10px] px-3 py-1 font-bold">{filteredTeachers.length} Staff</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Profesor</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Instrumentos</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Estado</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {teachersLoading ? (
                <tr><td colSpan={4} className="py-20 text-center text-slate-400 italic">Sincronizando staff...</td></tr>
              ) : filteredTeachers.map((teacher: any) => {
                const cfg = statusConfig[teacher.status] || statusConfig.PENDING;
                return (
                  <tr key={teacher.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => { setSelectedTeacher(teacher); setIsDetailOpen(true); setActiveTab('PERFIL'); }}>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
                          <User className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-none group-hover:text-primary transition-colors">{teacher.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-1">{teacher.phoneNumber || 'Sin teléfono'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-wrap gap-1">
                          {teacher.specialties?.map((s: any) => (
                             <Badge key={s.id} className="bg-slate-50 text-slate-500 border-0 text-[8px] font-black">{s.name}</Badge>
                          ))}
                          {teacher.specialties?.length === 0 && <span className="text-[10px] text-slate-300 italic">No asignado</span>}
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <Badge className={`font-bold uppercase text-[9px] tracking-widest px-3 py-1 border-0 ${cfg.bg} ${cfg.color}`}>{cfg.label}</Badge>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <button onClick={(e) => { e.stopPropagation(); openModal(teacher); }} className="p-2 hover:bg-slate-100 rounded-xl text-slate-300 hover:text-primary transition-all mr-2">
                          <Edit2 className="h-4 w-4" />
                       </button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 group-hover:text-primary"><ChevronRight className="h-5 w-5" /></Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {isDetailOpen && selectedTeacher && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-white h-full overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-right-10 duration-500">
            <header className="bg-slate-900 text-white p-10 relative">
              <button onClick={() => setIsDetailOpen(false)} className="absolute top-8 right-8 p-3 hover:bg-white/10 rounded-full transition-colors"><X className="h-6 w-6" /></button>
              <div className="flex items-center gap-6">
                 <div className="h-20 w-20 rounded-[2rem] bg-white/5 flex items-center justify-center border border-white/10">
                    <User className="h-10 w-10 text-primary" />
                 </div>
                 <div>
                    <h2 className="text-3xl font-bold font-serif">{selectedTeacher.name}</h2>
                    <p className="text-slate-400 font-mono text-xs mt-1">{selectedTeacher.phoneNumber || 'Sin contacto identificado'}</p>
                 </div>
              </div>
              <div className="flex gap-8 mt-12 border-b border-white/5">
                {['PERFIL', 'AGENDA', 'ALUMNOS', 'STATS'].map((t: any) => (
                  <button key={t} onClick={() => setActiveTab(t)} className={`pb-4 text-[10px] font-bold uppercase tracking-[0.2em] relative transition-colors ${activeTab === t ? 'text-primary' : 'text-white/40 hover:text-white/60'}`}>
                    {t}
                    {activeTab === t && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
                  </button>
                ))}
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-slate-50/30">
              {activeTab === 'PERFIL' && (
                 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4">Especialidades</p>
                       <div className="flex flex-wrap gap-2">
                          {selectedTeacher.specialties?.map((s: any) => (
                             <Badge key={s.id} className="bg-indigo-50 text-indigo-700 border-0 text-[10px] font-bold px-4 py-2">{s.name}</Badge>
                          ))}
                       </div>
                    </div>
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4">Biografía</p>
                       <p className="text-slate-600 italic text-sm leading-relaxed">{selectedTeacher.description || "Docente activo de la academia con compromiso en la formación musical."}</p>
                    </div>
                 </div>
              )}
              {activeTab === 'AGENDA' && (
                 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                    {/* Sección de Clases Agendadas */}
                    <div className="space-y-4">
                       <div className="flex items-center justify-between px-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                             <CalendarCheck className="h-3 w-3" /> Próximas Clases
                          </p>
                          <Badge variant="outline" className="text-[8px] border-slate-200 text-slate-400 font-bold uppercase">{teacherLessons.length} Registros</Badge>
                       </div>
                       
                       {teacherLessons.length > 0 ? (
                          <div className="space-y-3">
                             {teacherLessons.map((l: any) => {
                                const isPast = !isAfter(new Date(`${l.date}T${l.startTime}`), startOfDay(new Date()));
                                return (
                                   <div key={l.id} className={cn(
                                      "bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col gap-4",
                                      isPast && "opacity-60"
                                   )}>
                                      <div className="flex items-center justify-between">
                                         <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-2xl bg-slate-50 flex flex-col items-center justify-center border border-slate-100 shrink-0">
                                               <span className="text-[8px] font-black uppercase text-slate-400 leading-none">{format(parseISO(l.date), "MMM", { locale: es })}</span>
                                               <span className="text-sm font-bold text-slate-900 leading-none mt-1">{format(parseISO(l.date), "dd")}</span>
                                            </div>
                                            <div>
                                               <p className="text-xs font-bold text-slate-900">{l.student?.name}</p>
                                               <div className="flex items-center gap-2 mt-0.5">
                                                  <span className="text-[10px] font-medium text-slate-400 italic capitalize">{format(parseISO(l.date), "EEEE", { locale: es })}</span>
                                                  <span className="text-[10px] text-slate-300">•</span>
                                                  <span className="text-[10px] font-bold text-slate-500">{l.startTime.substring(0, 5)} - {l.endTime?.substring(0, 5)}</span>
                                               </div>
                                            </div>
                                         </div>
                                         {l.status === 'COMPLETED' ? (
                                            <Badge className="bg-emerald-50 text-emerald-600 border-0 text-[8px] font-black uppercase px-2 py-0.5 rounded-lg"><CheckCircle2 className="h-2.5 w-2.5 mr-1" /> OK</Badge>
                                         ) : l.status === 'CANCELLED' ? (
                                            <Badge className="bg-rose-50 text-rose-600 border-0 text-[8px] font-black uppercase px-2 py-0.5 rounded-lg"><XCircle className="h-2.5 w-2.5 mr-1" /> NO</Badge>
                                         ) : (
                                            <Badge className="bg-amber-50 text-amber-600 border-0 text-[8px] font-black uppercase px-2 py-0.5 rounded-lg"><Clock className="h-2.5 w-2.5 mr-1" /> PEND</Badge>
                                         )}
                                      </div>
                                   </div>
                                );
                             })}
                          </div>
                       ) : (
                          <div className="text-center py-12 bg-white rounded-[2.5rem] border border-dashed text-slate-300">
                             <History className="h-8 w-8 mx-auto opacity-20 mb-3" />
                             <p className="text-xs italic">No hay clases registradas aún</p>
                          </div>
                       )}
                    </div>

                    {/* Sección de Disponibilidad */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 px-2">
                          <Activity className="h-3 w-3" /> Disponibilidad Base
                       </p>
                       <div className="grid grid-cols-1 gap-3">
                          {selectedTeacher.availabilities?.map((d: any) => (
                             <div key={d.id} className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                   <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                                   <span className="text-xs font-bold text-slate-700">{d.day}</span>
                                </div>
                                <span className="text-[10px] font-mono font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100">{d.startTime} - {d.endTime}</span>
                             </div>
                          ))}
                          {selectedTeacher.availabilities?.length === 0 && (
                            <div className="text-center py-8 bg-slate-50/30 rounded-2xl border border-dashed border-slate-200 text-slate-300">
                               <p className="text-[10px] italic">Sin horario base configurado</p>
                            </div>
                          )}
                       </div>
                    </div>
                 </div>
              )}
              {activeTab === 'ALUMNOS' && (
                 <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    {teacherPacks.map((p: any) => (
                       <div key={p.id} className="bg-white rounded-3xl p-6 border border-slate-100 flex items-center justify-between shadow-sm hover:border-primary/20 transition-colors">
                          <div className="flex items-center gap-3">
                             <div className="h-10 w-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                                <GraduationCap className="h-5 w-5" />
                             </div>
                             <span className="font-bold text-slate-800">{p.student?.name}</span>
                          </div>
                          <Badge variant="outline" className="text-[9px] border-slate-100 font-bold text-slate-400">{p.plan?.name}</Badge>
                       </div>
                    ))}
                    {teacherPacks.length === 0 && (
                      <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed text-slate-300">
                        <Users className="h-10 w-10 mx-auto opacity-20 mb-3" />
                        <p className="text-sm italic">No tiene alumnos asignados actualmente</p>
                      </div>
                    )}
                 </div>
              )}
              {activeTab === 'STATS' && (
                 <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
                       <TrendingUp className="absolute top-[-10px] right-[-10px] h-32 w-32 text-white/5 group-hover:scale-110 transition-transform duration-700" />
                       <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2">Impacto Académico</p>
                       <p className="text-5xl font-black font-serif">{teacherLessons.length}</p>
                       <p className="text-xs text-slate-400 mt-2">Clases realizadas este ciclo</p>
                    </div>
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm text-center flex flex-col justify-center">
                       <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Comunidad</p>
                       <p className="text-5xl font-black text-slate-900 font-serif">{teacherPacks.length}</p>
                       <p className="text-xs text-slate-500 mt-2">Alumnos activos</p>
                    </div>
                 </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
