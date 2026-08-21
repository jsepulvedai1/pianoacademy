"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { 
  GraduationCap, Search, Plus, Calendar, User, Music,
  ChevronRight, Activity, Phone, Mail, MapPin, X, CreditCard,
  History, TrendingUp, BookOpen, AlertCircle, Shield, DollarSign,
  CheckCircle2, Clock, Edit3, MessageSquare, MessageCircle, Send,
  RefreshCw, Loader2, ExternalLink, Sparkles, CheckCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client/react/index.js";
import { GET_STUDENTS_LIST } from "@/graphql/queries/get-students";
import { GET_LESSONS } from "@/graphql/queries/get-lessons";
import { GET_INSTRUMENTS } from "@/graphql/queries/get-instruments";
import { GET_TEACHERS } from "@/graphql/queries/get-teachers";
import { CREATE_STUDENT, UPDATE_STUDENT, SEND_WHATSAPP_MUTATION } from "@/graphql/mutations/student-mutations";
import { GET_CHAT_MESSAGES } from "@/graphql/queries/admin-queries";
import { normalizePhoneNumber } from "@/lib/utils";
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
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'ACADEMICO' | 'PAGOS' | 'ASISTENCIA' | 'WHATSAPP'>('GENERAL');
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isEditingStudent, setIsEditingStudent] = useState(false);

  // ── WhatsApp State ──────────────────────────────────────────
  const [chatRecipientType, setChatRecipientType] = useState<'STUDENT' | 'GUARDIAN'>('STUDENT');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rut: '',
    birthDate: '',
    guardianName: '',
    guardianPhone: '',
    phoneNumber: '',
    level: 'BEGINNER',
    primaryInstrumentId: '',
    assignedTeacherIds: [] as number[]
  });

  const [editFormData, setEditFormData] = useState({
    id: "",
    name: "",
    email: "",
    rut: "",
    birthDate: "",
    guardianName: "",
    guardianPhone: "",
    status: "ACTIVE",
    phoneNumber: "",
    level: "BEGINNER",
    primaryInstrumentId: "",
    assignedTeacherIds: [] as number[]
  });

  // ── GraphQL Hooks ───────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'ON_HOLD'>('ALL');
  const { data, loading, refetch } = useQuery<any>(GET_STUDENTS_LIST, {
    fetchPolicy: 'network-only'
  });
  const { data: lessonsData } = useQuery<any>(GET_LESSONS);
  const { data: instrumentsData } = useQuery<any>(GET_INSTRUMENTS);
  const { data: teachersData } = useQuery<any>(GET_TEACHERS);
  
  const [updateStudent, { loading: isUpdating }] = useMutation(UPDATE_STUDENT, {
    refetchQueries: [{ query: GET_STUDENTS_LIST }],
    onCompleted: (res: any) => {
      refetch();
      if (res.updateStudent?.student) {
        setSelectedStudent(res.updateStudent.student);
      }
      setIsEditingStudent(false);
      toast.success("Ficha de estudiante actualizada exitosamente ✅");
    },
    onError: (err: any) => toast.error(err.message)
  });
  
  const [createStudent, { loading: isCreating }] = useMutation(CREATE_STUDENT, {
    refetchQueries: [{ query: GET_STUDENTS_LIST }],
    onCompleted: () => {
      toast.success("Alumno registrado exitosamente ✅");
      setIsAddingStudent(false);
      setFormData({
        name: '',
        email: '',
        rut: '',
        birthDate: '',
        guardianName: '',
        guardianPhone: '',
        phoneNumber: '',
        level: 'BEGINNER',
        primaryInstrumentId: '',
        assignedTeacherIds: []
      });
      refetch();
    },
    onError: (err: any) => toast.error(err.message)
  });

  // ── Active Chat Phone Calculation ─────────────────────────
  const activeChatPhone = useMemo(() => {
    if (!selectedStudent) return "";
    if (chatRecipientType === 'GUARDIAN') {
      return selectedStudent.guardianPhone || "";
    }
    return selectedStudent.phoneNumber || selectedStudent.guardianPhone || "";
  }, [selectedStudent, chatRecipientType]);

  const [loadChat, { data: chatQueryData, error: chatQueryError }] = useLazyQuery<any>(GET_CHAT_MESSAGES, {
    fetchPolicy: 'network-only'
  });

  const [sendWA, { loading: isSendingMessage }] = useMutation<any>(SEND_WHATSAPP_MUTATION);

  useEffect(() => {
    if (chatQueryData?.chatMessages) {
      setChatMessages(chatQueryData.chatMessages);
      setIsLoadingChat(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [chatQueryData]);

  useEffect(() => {
    if (chatQueryError) {
      console.error("Error loading student chat:", chatQueryError);
      setIsLoadingChat(false);
    }
  }, [chatQueryError]);

  const fetchChatHistory = (phone: string) => {
    if (!phone) return;
    setIsLoadingChat(true);
    loadChat({ variables: { phone } });
  };

  useEffect(() => {
    if (isDetailOpen && activeTab === 'WHATSAPP' && activeChatPhone) {
      fetchChatHistory(activeChatPhone);
      const interval = setInterval(() => {
        loadChat({ variables: { phone: activeChatPhone } });
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isDetailOpen, activeTab, activeChatPhone]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || chatInput;
    if (!textToSend.trim() || !activeChatPhone) {
      if (!activeChatPhone) toast.error("El alumno o apoderado no tiene un número telefónico registrado.");
      return;
    }

    try {
      const normalized = normalizePhoneNumber(activeChatPhone);
      const res = await sendWA({
        variables: {
          phoneNumber: normalized,
          message: textToSend
        }
      });

      if (res.data?.sendWhatsapp?.success) {
        toast.success("Mensaje enviado por WhatsApp ✅");
        setChatInput("");
        fetchChatHistory(activeChatPhone);
      } else {
        toast.error("Error al enviar mensaje: " + (res.data?.sendWhatsapp?.response || "Error en el servidor"));
      }
    } catch (err: any) {
      toast.error(err.message || "Error de comunicación con WhatsApp");
    }
  };

  const applyTemplate = (type: 'RECORDATORIO' | 'PAGO' | 'MATERIAL' | 'SALUDO') => {
    if (!selectedStudent) return;
    const name = selectedStudent.name?.split(' ')[0] || selectedStudent.name || 'Estudiante';
    let text = "";
    if (type === 'RECORDATORIO') {
      text = `Hola ${name} 🎵, te saludamos de Academia Détaché para recordarte tu próxima clase de música. ¡Te esperamos!`;
    } else if (type === 'PAGO') {
      text = `Hola ${name} 💳, te escribimos desde Academia Détaché para coordinar la renovación de tu plan de clases. Si tienes dudas avísanos con gusto.`;
    } else if (type === 'MATERIAL') {
      text = `Hola ${name} 🎼, tu profesor te ha compartido nuevo material de estudio en la plataforma de Academia Détaché 📖.`;
    } else if (type === 'SALUDO') {
      text = `Hola ${name} 👋, ¿cómo estás? Te escribimos de la administración de Academia Détaché para saber cómo van tus clases.`;
    }
    setChatInput(text);
  };

  const students = data?.allStudents || [];
  const allPacks = data?.allStudentPacks || [];
  const allPayments = data?.allPayments || [];
  const allLessons = lessonsData?.allLessons || [];
  const instruments = instrumentsData?.allInstruments || [];
  const teachers = teachersData?.allTeachers || [];

  const filteredStudents = useMemo(() => {
    return students.filter((s: any) => {
      const matchSearch = (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.rut || '').includes(searchTerm) ||
        (s.phoneNumber || '').includes(searchTerm);
      const sStatus = s.status || 'ACTIVE';
      const matchStatus = statusFilter === 'ALL' || sStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [students, searchTerm, statusFilter]);

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
        primaryInstrumentId: formData.primaryInstrumentId ? parseInt(formData.primaryInstrumentId) : null,
        assignedTeacherIds: formData.assignedTeacherIds
      }
    });
  };

  const handleStartEdit = () => {
    setEditFormData({
      id: selectedStudent?.id || "",
      name: selectedStudent?.name || "",
      email: selectedStudent?.email || "",
      rut: selectedStudent?.rut || "",
      birthDate: selectedStudent?.birthDate || "",
      guardianName: selectedStudent?.guardianName || "",
      guardianPhone: selectedStudent?.guardianPhone || "",
      status: selectedStudent?.status || "ACTIVE",
      phoneNumber: selectedStudent?.phoneNumber || "",
      level: selectedStudent?.level || "BEGINNER",
      primaryInstrumentId: selectedStudent?.primaryInstrument?.id || "",
      assignedTeacherIds: (selectedStudent?.assignedTeachers || []).map((t: any) => parseInt(t.id))
    });
    setIsEditingStudent(true);
  };

  const handleUpdate = () => {
    if (!editFormData.name) return;
    updateStudent({
      variables: {
        id: parseInt(editFormData.id),
        name: editFormData.name,
        email: editFormData.email || null,
        rut: editFormData.rut || null,
        birthDate: editFormData.birthDate || null,
        guardianName: editFormData.guardianName || null,
        guardianPhone: editFormData.guardianPhone || null,
        status: editFormData.status,
        phoneNumber: editFormData.phoneNumber || null,
        level: editFormData.level,
        primaryInstrumentId: editFormData.primaryInstrumentId ? parseInt(editFormData.primaryInstrumentId) : null,
        assignedTeacherIds: editFormData.assignedTeacherIds
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

                 <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Correo Electrónico</label>
                    <input type="email" placeholder="estudiante@correo.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
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

                <div className="col-span-2 space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Profesores Asignados (Puedes seleccionar varios)</label>
                   <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 min-h-[48px] items-center">
                      {teachers.map((t: any) => {
                         const tId = parseInt(t.id);
                         const isSelected = formData.assignedTeacherIds.includes(tId);
                         return (
                            <button
                               key={t.id}
                               type="button"
                               onClick={() => {
                                  if (isSelected) {
                                     setFormData({...formData, assignedTeacherIds: formData.assignedTeacherIds.filter(id => id !== tId)});
                                  } else {
                                     setFormData({...formData, assignedTeacherIds: [...formData.assignedTeacherIds, tId]});
                                  }
                               }}
                               className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                  isSelected 
                                  ? 'bg-[#70125F] text-white shadow-md shadow-[#70125F]/20' 
                                  : 'bg-white text-slate-600 border border-slate-200 hover:border-[#70125F]/40'
                               }`}
                            >
                               <User className="h-3.5 w-3.5" />
                               {t.name}
                            </button>
                         );
                      })}
                      {teachers.length === 0 && <span className="text-xs text-slate-400 italic">No hay profesores registrados.</span>}
                   </div>
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
        <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
           <div className="relative w-full sm:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input type="text" placeholder="Buscar por nombre, RUT o teléfono..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
           </div>
           
           <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 overflow-x-auto">
              {[
                { key: 'ALL', label: 'Todos', count: students.length },
                { key: 'ACTIVE', label: 'Activos', count: students.filter((s: any) => (s.status || 'ACTIVE') === 'ACTIVE').length },
                { key: 'INACTIVE', label: 'Inactivos', count: students.filter((s: any) => s.status === 'INACTIVE').length },
                { key: 'ON_HOLD', label: 'En Pausa', count: students.filter((s: any) => s.status === 'ON_HOLD').length },
              ].map(tab => (
                <button
                   key={tab.key}
                   onClick={() => setStatusFilter(tab.key as any)}
                   className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                     statusFilter === tab.key 
                       ? 'bg-white text-slate-900 shadow-sm' 
                       : 'text-slate-400 hover:text-slate-600'
                   }`}
                >
                   <span>{tab.label}</span>
                   <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${statusFilter === tab.key ? 'bg-primary/10 text-primary font-black' : 'bg-slate-200/60 text-slate-500'}`}>
                     {tab.count}
                   </span>
                </button>
              ))}
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 font-bold text-xs uppercase tracking-widest text-slate-400">
                <th className="px-8 py-5">Estudiante</th>
                <th className="px-8 py-5">Instrumento</th>
                <th className="px-8 py-5">Profesor(es)</th>
                <th className="px-8 py-5">Nivel</th>
                <th className="px-8 py-5">Estado</th>
                <th className="px-8 py-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="py-20 text-center italic text-slate-400">Sincronizando comunidad...</td></tr>
              ) : filteredStudents.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center italic text-slate-400">No se encontraron estudiantes con este criterio.</td></tr>
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
                  <td className="px-8 py-6 text-sm font-bold">
                    {student.assignedTeachers && student.assignedTeachers.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {student.assignedTeachers.map((t: any) => (
                          <span key={t.id} className="text-[#70125F] bg-[#70125F]/5 border border-[#70125F]/10 px-2.5 py-0.5 rounded-lg text-xs font-bold whitespace-nowrap">
                            {t.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 font-normal italic text-xs">Sin asignar</span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <Badge className="bg-slate-100 text-slate-600 border-0 text-[10px] font-bold">{student.level || 'BEGINNER'}</Badge>
                  </td>
                  <td className="px-8 py-6">
                     <Badge className={`${statusConfig[student.status || 'ACTIVE']?.bg || 'bg-emerald-50'} ${statusConfig[student.status || 'ACTIVE']?.color || 'text-emerald-700'} text-[10px] border-0 font-bold px-2.5 py-0.5`}>
                        {statusConfig[student.status || 'ACTIVE']?.label || 'Activo'}
                     </Badge>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStudent(student);
                          setIsDetailOpen(true);
                          setActiveTab('WHATSAPP');
                        }}
                        className="h-9 w-9 rounded-xl flex items-center justify-center text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all cursor-pointer shadow-2xs"
                        title="Abrir Chat WhatsApp con el Estudiante"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 text-slate-300 group-hover:text-primary bg-slate-50/0 group-hover:bg-slate-100 cursor-pointer"
                        onClick={() => {
                          setSelectedStudent(student);
                          setIsDetailOpen(true);
                          setActiveTab('GENERAL');
                        }}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {isDetailOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="w-full max-w-3xl lg:max-w-4xl bg-white h-full overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-right-10 duration-500">
              <header className="bg-slate-900 text-white p-10 relative">
                 <div className="absolute top-8 right-8 flex items-center gap-2">
                    {!isEditingStudent && (
                       <button onClick={handleStartEdit} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-xs font-bold flex items-center gap-1.5 text-white cursor-pointer">
                          <Edit3 className="h-3.5 w-3.5 text-primary" /> Editar Ficha
                       </button>
                    )}
                    <button onClick={() => { setIsDetailOpen(false); setIsEditingStudent(false); }} className="p-3 hover:bg-white/10 rounded-full transition-colors cursor-pointer"><X className="h-6 w-6 text-slate-400" /></button>
                 </div>
                 <div className="flex items-center gap-6">
                    <div className="h-20 w-20 bg-white/5 rounded-[2rem] flex items-center justify-center border border-white/10 shadow-2xl">
                      <User className="h-10 w-10 text-[#70125F]" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                         <h2 className="text-3xl font-bold font-serif">{selectedStudent?.name}</h2>
                         <Badge className={`${statusConfig[selectedStudent?.status]?.bg || 'bg-slate-100'} ${statusConfig[selectedStudent?.status]?.color || 'text-slate-500'} border-0 font-bold text-xs uppercase px-3 py-1`}>
                           {statusConfig[selectedStudent?.status]?.label || selectedStudent?.status}
                         </Badge>
                      </div>
                      <p className="text-slate-400 text-xs font-mono">{selectedStudent?.rut || 'RUT no registrado'} · Iniciado {selectedStudent?.startDate}</p>
                    </div>
                 </div>
                 <div className="flex gap-8 mt-12 border-b border-white/5 overflow-x-auto">
                    {[
                      { key: 'GENERAL', label: 'GENERAL' },
                      { key: 'ACADEMICO', label: 'ACADÉMICO' },
                      { key: 'PAGOS', label: 'PAGOS' },
                      { key: 'ASISTENCIA', label: 'ASISTENCIA' },
                      { key: 'WHATSAPP', label: '💬 WHATSAPP' }
                    ].map((tab: any) => (
                       <button 
                         key={tab.key} 
                         onClick={() => setActiveTab(tab.key)} 
                         className={`pb-4 text-[10px] font-bold uppercase tracking-[0.2em] relative transition-colors whitespace-nowrap cursor-pointer ${
                           activeTab === tab.key 
                             ? (tab.key === 'WHATSAPP' ? 'text-emerald-400 font-black' : 'text-primary') 
                             : 'text-white/40 hover:text-white/60'
                         }`}
                       >
                          {tab.label}
                          {activeTab === tab.key && (
                            <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-t-full ${tab.key === 'WHATSAPP' ? 'bg-emerald-400' : 'bg-primary'}`} />
                          )}
                       </button>
                    ))}
                 </div>
              </header>
              <div className="flex-1 overflow-y-auto p-10 space-y-10 bg-slate-50/30">
                 {isEditingStudent ? (
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6 text-left animate-in fade-in duration-300">
                       <h3 className="text-lg font-bold text-slate-800 border-b pb-3 flex items-center gap-2">
                          <Edit3 className="h-5 w-5 text-primary" /> Editar Perfil Estudiante
                       </h3>
                       
                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                           <div className="sm:col-span-2 space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-[#70125F]">Nombre Completo</label>
                              <input 
                                 type="text"
                                 value={editFormData.name}
                                 onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                                 className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-[#70125F]">Estado del Alumno</label>
                              <select
                                 value={editFormData.status}
                                 onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                                 className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                              >
                                 <option value="ACTIVE">Activo 🟢</option>
                                 <option value="INACTIVE">Inactivo ⚪</option>
                                 <option value="ON_HOLD">En Pausa 🟡</option>
                              </select>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-[#70125F]">RUT</label>
                              <input 
                                 type="text"
                                 value={editFormData.rut}
                                 onChange={(e) => setEditFormData({...editFormData, rut: e.target.value})}
                                 className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-[#70125F]">Correo Electrónico</label>
                              <input 
                                 type="email"
                                 value={editFormData.email}
                                 onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                                 className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                              />
                           </div>
                        </div>

                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold uppercase tracking-widest text-[#70125F]">Fecha de Nacimiento</label>
                             <input 
                                type="date"
                                value={editFormData.birthDate}
                                onChange={(e) => setEditFormData({...editFormData, birthDate: e.target.value})}
                                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold uppercase tracking-widest text-[#70125F]">Teléfono Celular</label>
                             <input 
                                type="text"
                                value={editFormData.phoneNumber}
                                onChange={(e) => setEditFormData({...editFormData, phoneNumber: e.target.value})}
                                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                             />
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold uppercase tracking-widest text-[#70125F]">Nombre Apoderado</label>
                             <input 
                                type="text"
                                value={editFormData.guardianName}
                                onChange={(e) => setEditFormData({...editFormData, guardianName: e.target.value})}
                                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold uppercase tracking-widest text-[#70125F]">Teléfono Apoderado</label>
                             <input 
                                type="text"
                                value={editFormData.guardianPhone}
                                onChange={(e) => setEditFormData({...editFormData, guardianPhone: e.target.value})}
                                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                             />
                          </div>
                       </div>

                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold uppercase tracking-widest text-[#70125F]">Nivel</label>
                             <select 
                                value={editFormData.level}
                                onChange={(e) => setEditFormData({...editFormData, level: e.target.value})}
                                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                             >
                                <option value="BEGINNER">Principiante</option>
                                <option value="INTERMEDIATE">Intermedio</option>
                                <option value="ADVANCED">Avanzado</option>
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold uppercase tracking-widest text-[#70125F]">Instrumento Principal</label>
                             <select 
                                value={editFormData.primaryInstrumentId}
                                onChange={(e) => setEditFormData({...editFormData, primaryInstrumentId: e.target.value})}
                                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                             >
                                <option value="">Sin definir</option>
                                {instruments.map((ins: any) => (
                                   <option key={ins.id} value={ins.id}>{ins.name}</option>
                                ))}
                             </select>
                          </div>
                          <div className="col-span-2 space-y-2">
                             <label className="text-[10px] font-bold uppercase tracking-widest text-[#70125F]">Profesores Asignados (Selecciona uno o más)</label>
                             <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 min-h-[48px] items-center">
                                {teachers.map((t: any) => {
                                   const tId = parseInt(t.id);
                                   const isSelected = editFormData.assignedTeacherIds.includes(tId);
                                   return (
                                      <button
                                         key={t.id}
                                         type="button"
                                         onClick={() => {
                                            if (isSelected) {
                                               setEditFormData({...editFormData, assignedTeacherIds: editFormData.assignedTeacherIds.filter(id => id !== tId)});
                                            } else {
                                               setEditFormData({...editFormData, assignedTeacherIds: [...editFormData.assignedTeacherIds, tId]});
                                            }
                                         }}
                                         className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                            isSelected 
                                            ? 'bg-[#70125F] text-white shadow-md shadow-[#70125F]/20' 
                                            : 'bg-white text-slate-600 border border-slate-200 hover:border-[#70125F]/40'
                                         }`}
                                      >
                                         <User className="h-3.5 w-3.5" />
                                         {t.name}
                                      </button>
                                   );
                                })}
                                {teachers.length === 0 && <span className="text-xs text-slate-400 italic">No hay profesores registrados.</span>}
                             </div>
                          </div>
                       </div>

                       <div className="flex gap-4 pt-6 border-t border-slate-100">
                          <Button variant="outline" className="flex-1 h-11 rounded-xl text-xs font-bold uppercase tracking-wider" onClick={() => setIsEditingStudent(false)}>Cancelar</Button>
                          <Button disabled={isUpdating || !editFormData.name} className="flex-1 h-11 bg-[#70125F] hover:bg-[#590e4b] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#70125F]/20 cursor-pointer" onClick={handleUpdate}>
                             {isUpdating ? "Guardando..." : "Guardar Cambios"}
                          </Button>
                       </div>
                    </div>
                 ) : (
                    <>
                       {activeTab === 'GENERAL' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2">
                       <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Información Personal</p>
                          <div className="space-y-4">
                             {[
                               { 
                                 label: 'Profesor(es)', 
                                 val: selectedStudent?.assignedTeachers?.length > 0 
                                   ? selectedStudent.assignedTeachers.map((t: any) => t.name).join(', ') 
                                   : 'Sin asignar', 
                                 icon: GraduationCap 
                               },
                               { label: 'Correo', val: selectedStudent?.email, icon: Mail },
                               { label: 'RUT', val: selectedStudent?.rut, icon: CreditCard },
                               { label: 'Fecha Nacimiento', val: selectedStudent?.birthDate, icon: Calendar },
                               { label: 'Instrumento', val: selectedStudent?.primaryInstrument?.name, icon: Music },
                               { label: 'Nivel', val: selectedStudent?.level, icon: Activity },
                             ].map(item => (
                               <div key={item.label} className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 border-b border-slate-50 gap-1 sm:gap-4 min-w-0">
                                 <div className="flex items-center gap-2 text-slate-400 shrink-0">
                                   <item.icon className="h-3.5 w-3.5 shrink-0" />
                                   <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                                 </div>
                                 <span className="font-bold text-slate-700 text-sm break-all text-left sm:text-right min-w-0" title={item.val}>{item.val || '---'}</span>
                               </div>
                             ))}
                          </div>
                       </div>

                       <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Contacto y Apoderado</p>
                          <div className="space-y-4">
                             {[
                               { label: 'Teléfono', val: selectedStudent?.phoneNumber, icon: Phone },
                               { label: 'Apoderado', val: selectedStudent?.guardianName, icon: User },
                               { label: 'Teléfono Apoderado', val: selectedStudent?.guardianPhone, icon: Phone },
                             ].map(item => (
                               <div key={item.label} className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 border-b border-slate-50 gap-1 sm:gap-4 min-w-0">
                                 <div className="flex items-center gap-2 text-slate-400 shrink-0">
                                   <item.icon className="h-3.5 w-3.5 shrink-0" />
                                   <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                                 </div>
                                 <span className="font-bold text-slate-700 text-sm break-all text-left sm:text-right min-w-0" title={item.val}>{item.val || '---'}</span>
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
                  </>
                 )}
               </div>
           </div>
        </div>
      )}
    </div>
  );
}
