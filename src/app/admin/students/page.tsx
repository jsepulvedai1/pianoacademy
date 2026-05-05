"use client";

import { useState, useMemo } from "react";
import { 
  GraduationCap, Search, Plus, Calendar, User, Music,
  ChevronRight, Activity, Phone, Mail, MapPin, X, CreditCard,
  History, TrendingUp, BookOpen, AlertCircle, Shield, DollarSign,
  CheckCircle2, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@apollo/client/react/index.js";
import { GET_STUDENTS_LIST } from "@/graphql/queries/get-students";
import { GET_LESSONS } from "@/graphql/queries/get-lessons";
import { GET_INSTRUMENTS } from "@/graphql/queries/get-instruments";
import { CREATE_STUDENT } from "@/graphql/mutations/student-mutations";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE:   { label: 'Activo',     color: 'text-emerald-700', bg: 'bg-emerald-50' },
  INACTIVE: { label: 'Inactivo',   color: 'text-slate-500',   bg: 'bg-slate-100' },
  ON_HOLD:  { label: 'En Pausa',   color: 'text-amber-700',   bg: 'bg-amber-50' }
};

export default function AdminStudentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'ACADEMICO' | 'PAGOS' | 'ASISTENCIA'>('GENERAL');
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    rut: '',
    birthDate: '',
    guardianName: '',
    guardianPhone: '',
    phoneNumber: '',
    level: 'BEGINNER',
    primaryInstrumentId: ''
  });

  // ── GraphQL Hooks ───────────────────────────────────────────
  const { data, loading, refetch } = useQuery<any>(GET_STUDENTS_LIST);
  const { data: lessonsData } = useQuery<any>(GET_LESSONS);
  const { data: instrumentsData } = useQuery<any>(GET_INSTRUMENTS);
  
  const [createStudent, { loading: isCreating }] = useMutation(CREATE_STUDENT, {
    onCompleted: () => {
      toast.success("Alumno registrado exitosamente ✅");
      setIsAddingStudent(false);
      setFormData({
        name: '',
        rut: '',
        birthDate: '',
        guardianName: '',
        guardianPhone: '',
        phoneNumber: '',
        level: 'BEGINNER',
        primaryInstrumentId: ''
      });
      refetch();
    },
    onError: (err: any) => toast.error(err.message)
  });

  const students = data?.allStudents || [];
  const allPacks = data?.allStudentPacks || [];
  const allPayments = data?.allPayments || [];
  const allLessons = lessonsData?.allLessons || [];
  const instruments = instrumentsData?.allInstruments || [];

  const filteredStudents = useMemo(() => 
    students.filter((s: any) => s.name.toLowerCase().includes(searchTerm.toLowerCase())),
  [students, searchTerm]);

  const studentPacks = useMemo(() => 
    selectedStudent ? allPacks.filter((p: any) => p.student?.id === selectedStudent.id) : [], 
  [selectedStudent, allPacks]);

  const studentPayments = useMemo(() => 
    selectedStudent ? allPayments.filter((p: any) => p.student?.id === selectedStudent.id) : [], 
  [selectedStudent, allPayments]);

  const studentLessons = useMemo(() => 
    selectedStudent ? allLessons.filter((l: any) => l.student?.id === selectedStudent.id) : [], 
  [selectedStudent, allLessons]);

  const handleCreate = () => {
    if (!formData.name) return;
    createStudent({
      variables: {
        ...formData,
        primaryInstrumentId: formData.primaryInstrumentId ? parseInt(formData.primaryInstrumentId) : null
      }
    });
  };

  const formatCLP = (n: number) => `$${n.toLocaleString('es-CL')}`;

  return (
    <div className="p-8 lg:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
            <GraduationCap className="h-3 w-3" /> Comunidad Estudiantil
          </div>
          <h1 className="text-3xl font-bold font-serif tracking-tight text-slate-900">Gestión de Estudiantes</h1>
          <p className="text-slate-500 italic text-sm">Control total de la ficha del alumno.</p>
        </div>
        <Button onClick={() => setIsAddingStudent(true)} size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-lg h-12 px-8 font-bold uppercase tracking-[0.1em] rounded-2xl">
          <Plus className="mr-2 h-5 w-5" /> Registrar Alumno
        </Button>
      </header>

      {isAddingStudent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
           <Card className="w-full max-w-2xl bg-white rounded-[2.5rem] p-10 my-8 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-bold font-serif">Nuevo Alumno</h3>
                  <p className="text-slate-400 text-xs italic">Completa la ficha de ingreso.</p>
                </div>
                <button onClick={() => setIsAddingStudent(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="h-6 w-6 text-slate-400" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nombre Completo *</label>
                   <input type="text" placeholder="Ej: Juan Pérez" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                
                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">RUT</label>
                   <input type="text" placeholder="12.345.678-9" value={formData.rut} onChange={(e) => setFormData({...formData, rut: e.target.value})} className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Fecha de Nacimiento</label>
                   <input type="date" value={formData.birthDate} onChange={(e) => setFormData({...formData, birthDate: e.target.value})} className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>

                <div className="col-span-2 grid grid-cols-2 gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="col-span-2 flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Información del Apoderado (Opcional)</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nombre Apoderado</label>
                    <input type="text" placeholder="Papá / Mamá" value={formData.guardianName} onChange={(e) => setFormData({...formData, guardianName: e.target.value})} className="w-full h-12 bg-white border-none rounded-2xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Teléfono Apoderado</label>
                    <input type="text" placeholder="+56 9..." value={formData.guardianPhone} onChange={(e) => setFormData({...formData, guardianPhone: e.target.value})} className="w-full h-12 bg-white border-none rounded-2xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                  </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Teléfono Alumno</label>
                   <input type="text" placeholder="+56 9..." value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nivel Inicial</label>
                   <select value={formData.level} onChange={(e) => setFormData({...formData, level: e.target.value})} className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-bold outline-none">
                      <option value="BEGINNER">Principiante</option>
                      <option value="INTERMEDIATE">Intermedio</option>
                      <option value="ADVANCED">Avanzado</option>
                   </select>
                </div>

                <div className="col-span-2 space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Instrumento Principal</label>
                   <select value={formData.primaryInstrumentId} onChange={(e) => setFormData({...formData, primaryInstrumentId: e.target.value})} className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-bold outline-none">
                      <option value="">Seleccionar instrumento...</option>
                      {instruments.map((i: any) => <option key={i.id} value={i.id}>{i.name}</option>)}
                   </select>
                </div>
              </div>

              <div className="flex gap-4 mt-10 pt-6 border-t border-slate-50">
                 <Button variant="ghost" className="flex-1 h-12 rounded-2xl font-bold uppercase text-[10px] tracking-widest" onClick={() => setIsAddingStudent(false)}>Cancelar</Button>
                 <Button disabled={!formData.name.trim() || isCreating} className="flex-1 h-12 bg-slate-900 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest shadow-xl shadow-slate-900/20" onClick={handleCreate}>
                   {isCreating ? 'Registrando...' : 'Confirmar Ingreso'}
                 </Button>
              </div>
           </Card>
        </div>
      )}

      <Card className="border-none shadow-sm overflow-hidden bg-white rounded-3xl">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
           <div className="relative w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input type="text" placeholder="Buscar por nombre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
           </div>
           <Badge variant="outline" className="border-slate-100 text-slate-400 text-[10px] px-3 py-1 font-bold">{filteredStudents.length} Alumnos</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 font-bold text-xs uppercase tracking-widest text-slate-400">
                <th className="px-8 py-5">Estudiante</th>
                <th className="px-8 py-5">Instrumento</th>
                <th className="px-8 py-5">Nivel</th>
                <th className="px-8 py-5">Sincronización</th>
                <th className="px-8 py-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center italic text-slate-400">Sincronizando comunidad...</td></tr>
              ) : filteredStudents.map((student: any) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => { setSelectedStudent(student); setIsDetailOpen(true); setActiveTab('GENERAL'); }}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-300">
                         <User className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-primary transition-colors">{student.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">#{student.id} · {student.rut || 'Sin RUT'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-600 font-medium">{student.primaryInstrument?.name || "Sin definir"}</td>
                  <td className="px-8 py-6">
                    <Badge className="bg-slate-100 text-slate-600 border-0 text-[10px] font-bold">{student.level || 'BEGINNER'}</Badge>
                  </td>
                  <td className="px-8 py-6">
                     <Badge className="bg-emerald-50 text-emerald-700 text-[8px] border-0 font-black">ACTIVO</Badge>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 group-hover:text-primary bg-slate-50/0 group-hover:bg-slate-100"><ChevronRight className="h-5 w-5" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {isDetailOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="w-full max-w-2xl bg-white h-full overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-right-10 duration-500">
              <header className="bg-slate-900 text-white p-10 relative">
                 <button onClick={() => setIsDetailOpen(false)} className="absolute top-8 right-8 p-3 hover:bg-white/10 rounded-full transition-colors"><X className="h-6 w-6" /></button>
                 <div className="flex items-center gap-6">
                    <div className="h-20 w-20 bg-white/5 rounded-[2rem] flex items-center justify-center border border-white/10 shadow-2xl">
                      <User className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold font-serif">{selectedStudent.name}</h2>
                      <p className="text-slate-400 text-xs mt-1 font-mono">{selectedStudent.rut || 'RUT no registrado'} · Iniciado {selectedStudent.startDate}</p>
                    </div>
                 </div>
                 <div className="flex gap-8 mt-12 border-b border-white/5">
                    {['GENERAL', 'ACADEMICO', 'PAGOS', 'ASISTENCIA'].map((t: any) => (
                       <button key={t} onClick={() => setActiveTab(t)} className={`pb-4 text-[10px] font-bold uppercase tracking-[0.2em] relative transition-colors ${activeTab === t ? 'text-primary' : 'text-white/40 hover:text-white/60'}`}>
                          {t}
                          {activeTab === t && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
                       </button>
                    ))}
                 </div>
              </header>

              <div className="flex-1 overflow-y-auto p-10 space-y-10 bg-slate-50/30">
                 {activeTab === 'GENERAL' && (
                    <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2">
                       <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Información Personal</p>
                          <div className="space-y-4">
                             {[
                               { label: 'RUT', val: selectedStudent.rut, icon: CreditCard },
                               { label: 'Fecha Nacimiento', val: selectedStudent.birthDate, icon: Calendar },
                               { label: 'Instrumento', val: selectedStudent.primaryInstrument?.name, icon: Music },
                               { label: 'Nivel', val: selectedStudent.level, icon: Activity },
                             ].map(item => (
                               <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-50">
                                 <div className="flex items-center gap-2 text-slate-400">
                                   <item.icon className="h-3.5 w-3.5" />
                                   <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                                 </div>
                                 <span className="font-bold text-slate-700 text-sm">{item.val || '---'}</span>
                               </div>
                             ))}
                          </div>
                       </div>

                       <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Contacto y Apoderado</p>
                          <div className="space-y-4">
                             {[
                               { label: 'Teléfono', val: selectedStudent.phoneNumber, icon: Phone },
                               { label: 'Apoderado', val: selectedStudent.guardianName, icon: User },
                               { label: 'Teléfono Apoderado', val: selectedStudent.guardianPhone, icon: Phone },
                             ].map(item => (
                               <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-50">
                                 <div className="flex items-center gap-2 text-slate-400">
                                   <item.icon className="h-3.5 w-3.5" />
                                   <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                                 </div>
                                 <span className="font-bold text-slate-700 text-sm">{item.val || '---'}</span>
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>
                 )}

                 {activeTab === 'ACADEMICO' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2">Packs Contratados</p>
                       {studentPacks.map((pack: any) => (
                          <div key={pack.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
                             <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black font-serif">
                                  {pack.totalClasses}
                                </div>
                                <div>
                                   <p className="font-bold text-slate-900">{pack.plan?.name || "Pack Clases"}</p>
                                   <p className="text-[10px] font-bold uppercase text-slate-400 mt-1">{pack.remainingClasses} clases restantes de {pack.totalClasses}</p>
                                </div>
                             </div>
                             <Badge className={`border-0 font-black text-[9px] px-3 py-1 ${pack.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                                {pack.isActive ? "ACTIVO" : "INACTIVO"}
                             </Badge>
                          </div>
                       ))}
                       {studentPacks.length === 0 && (
                         <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed text-slate-300">
                           <BookOpen className="h-10 w-10 mx-auto opacity-20 mb-3" />
                           <p className="text-xs italic">No hay packs activos</p>
                         </div>
                       )}
                    </div>
                 )}

                 {activeTab === 'PAGOS' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2">Historial de Transacciones</p>
                       {studentPayments.map((p: any) => (
                          <div key={p.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between hover:border-emerald-100 transition-colors">
                             <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                  <DollarSign className="h-5 w-5" />
                                </div>
                                <div>
                                   <span className="font-bold text-slate-800 text-sm">{p.description || "Pago Recibido"}</span>
                                   <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-1">{p.paymentDate} · {p.method}</p>
                                </div>
                             </div>
                             <span className="font-black text-slate-900 font-serif text-lg">{formatCLP(p.amount)}</span>
                          </div>
                       ))}
                    </div>
                 )}

                 {activeTab === 'ASISTENCIA' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2">Bitácora de Clases</p>
                       {studentLessons.map((l: any) => (
                          <div key={l.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between hover:border-indigo-100 transition-colors">
                             <div className="flex items-center gap-4">
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${l.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                  {l.status === 'COMPLETED' ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                                </div>
                                <div>
                                   <p className="text-sm font-bold text-slate-800">{l.teacher?.name}</p>
                                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{l.date} · {l.lessonType}</p>
                                </div>
                             </div>
                             <Badge className="bg-slate-50 text-slate-400 border-0 text-[8px] font-black tracking-widest">{l.status}</Badge>
                          </div>
                       ))}
                       {studentLessons.length === 0 && (
                         <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed text-slate-300">
                           <History className="h-10 w-10 mx-auto opacity-20 mb-3" />
                           <p className="text-xs italic">Sin historial de asistencia aún.</p>
                         </div>
                       )}
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
