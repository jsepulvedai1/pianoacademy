"use client";

import { useState, useMemo } from "react";
import { 
  ClipboardList, Search, Plus, MoreVertical, CheckCircle2, 
  Clock, User, AlertCircle, Info, History, Trash2, X,
  Loader2, Filter, CheckSquare, Square, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@apollo/client/react/index.js";
import { GET_ACADEMY_TASKS, CREATE_ACADEMY_TASK, UPDATE_ACADEMY_TASK, DELETE_ACADEMY_TASK } from "@/graphql/mutations/academy-tasks";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  URGENTE:     { label: 'Urgente',     color: 'text-rose-700',   bg: 'bg-rose-50',     icon: AlertCircle },
  IMPORTANTE:  { label: 'Importante',  color: 'text-amber-700',  bg: 'bg-amber-50',    icon: Info },
  RECORDATORIO: { label: 'Recordatorio', color: 'text-sky-700',    bg: 'bg-sky-50',      icon: Clock },
  INFORMATIVO: { label: 'Informativo', color: 'text-slate-600',  bg: 'bg-slate-100',   icon: Info },
};

const ROLE_LABELS: Record<string, string> = {
  VENTAS: 'Ventas',
  RECEPCION: 'Recepción',
  ADMINISTRACION: 'Administración'
};

export default function AdminTasksPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "RECEPCION",
    priority: "RECORDATORIO",
    log: ""
  });

  const { data, loading, refetch } = useQuery(GET_ACADEMY_TASKS);
  const tasks = data?.allAcademyTasks || [];

  const [createTask, { loading: creating }] = useMutation(CREATE_ACADEMY_TASK, {
    onCompleted: () => {
      toast.success("Tarea creada ✅");
      setIsNewOpen(false);
      setFormData({ title: "", description: "", assignedTo: "RECEPCION", priority: "RECORDATORIO", log: "" });
      refetch();
    },
    onError: (err) => toast.error(err.message)
  });

  const [updateTask] = useMutation(UPDATE_ACADEMY_TASK, {
    onCompleted: () => refetch(),
    onError: (err) => toast.error(err.message)
  });

  const [deleteTask] = useMutation(DELETE_ACADEMY_TASK, {
    onCompleted: () => {
      toast.success("Tarea eliminada");
      setSelectedTask(null);
      refetch();
    },
    onError: (err) => toast.error(err.message)
  });

  const filtered = useMemo(() => {
    return tasks.filter((t: any) => 
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tasks, searchTerm]);

  const activeTasks = filtered.filter((t: any) => !t.isCompleted);
  const completedTasks = filtered.filter((t: any) => t.isCompleted);

  const handleToggleComplete = (task: any) => {
    updateTask({ variables: { id: parseInt(task.id), isCompleted: !task.isCompleted } });
    if (!task.isCompleted) toast.success("Tarea completada ✨");
  };

  const handleUpdateLog = (task: any, newLog: string) => {
    updateTask({ variables: { id: parseInt(task.id), log: newLog } });
  };

  return (
    <div className="p-8 lg:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
            <ClipboardList className="h-3 w-3" /> Gestión de Operaciones
          </div>
          <h1 className="text-3xl font-bold font-serif tracking-tight text-slate-900">Tareas y Bitácora</h1>
          <p className="text-slate-500 italic text-sm">Organiza las tareas diarias del equipo Détaché.</p>
        </div>
        <Button onClick={() => setIsNewOpen(true)} size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-lg h-12 px-8 font-bold uppercase tracking-[0.1em] rounded-2xl">
          <Plus className="mr-2 h-5 w-5" /> Nueva Tarea
        </Button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Active Tasks */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="border-none shadow-sm bg-white rounded-[2rem] overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between gap-4">
               <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input type="text" placeholder="Buscar en tareas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
               </div>
               <Badge variant="outline" className="border-slate-100 text-slate-400 text-[10px] px-3 py-1 font-bold">{activeTasks.length} Pendientes</Badge>
            </div>
            
            <CardContent className="p-0">
               <div className="divide-y divide-slate-50">
                  {loading ? (
                    <div className="p-20 text-center text-slate-400 italic">Sincronizando bitácora...</div>
                  ) : activeTasks.length === 0 ? (
                    <div className="p-20 text-center space-y-4">
                       <CheckCircle2 className="h-12 w-12 text-emerald-100 mx-auto" />
                       <p className="text-slate-400 italic text-sm">No hay tareas pendientes por ahora.</p>
                    </div>
                  ) : activeTasks.map((task: any) => {
                    const prio = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.INFORMATIVO;
                    return (
                      <div key={task.id} className="p-6 hover:bg-slate-50/50 transition-all group flex gap-6 items-start cursor-pointer" onClick={() => setSelectedTask(task)}>
                         <button onClick={(e) => { e.stopPropagation(); handleToggleComplete(task); }} className="mt-1 transition-transform active:scale-90 text-slate-200 hover:text-emerald-500">
                            <Square className="h-6 w-6" />
                         </button>
                         <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                               <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{task.title}</h3>
                               <Badge className={`border-0 text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 shadow-sm ${prio.bg} ${prio.color}`}>
                                  {prio.label}
                               </Badge>
                            </div>
                            <p className="text-sm text-slate-500 line-clamp-1">{task.description || "Sin descripción adicional"}</p>
                            <div className="flex items-center gap-4 pt-1">
                               <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  <User className="h-3 w-3" /> {ROLE_LABELS[task.assignedTo]}
                               </div>
                               <div className="flex items-center gap-1 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                  <History className="h-3 w-3" /> {format(new Date(task.createdAt), "dd MMM HH:mm", { locale: es })}
                               </div>
                            </div>
                         </div>
                         <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-primary">
                            <ChevronDown className="h-5 w-5" />
                         </button>
                      </div>
                    );
                  })}
               </div>
            </CardContent>
          </Card>

          {/* Completed Section (Collapsed by default) */}
          {completedTasks.length > 0 && (
             <div className="space-y-4">
                <h4 className="px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Tareas Listas</h4>
                <div className="bg-slate-100/50 rounded-[2rem] border border-slate-100 overflow-hidden divide-y divide-slate-100/50 grayscale-[0.8] opacity-60">
                   {completedTasks.map((task: any) => (
                     <div key={task.id} className="p-5 flex gap-4 items-center">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        <span className="text-sm font-medium text-slate-500 line-through">{task.title}</span>
                     </div>
                   ))}
                </div>
             </div>
          )}
        </div>

        {/* Right Column: Detailed View / Log */}
        <div className="space-y-6">
           {selectedTask ? (
             <div className="sticky top-8 animate-in slide-in-from-right-4 duration-500">
                <Card className="border-none shadow-xl bg-slate-900 text-white rounded-[2.5rem] overflow-hidden">
                   <div className="p-10 space-y-8">
                      <div className="flex justify-between items-start">
                         <Badge className="bg-primary/20 text-primary border-primary/20 font-black text-[9px] uppercase tracking-widest px-3 py-1">
                            Bitácora Activa
                         </Badge>
                         <button onClick={() => setSelectedTask(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                            <X className="h-5 w-5 text-slate-400" />
                         </button>
                      </div>

                      <div className="space-y-2">
                         <h2 className="text-2xl font-bold font-serif leading-tight">{selectedTask.title}</h2>
                         <p className="text-slate-400 text-sm leading-relaxed">{selectedTask.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Encargado</p>
                            <p className="text-xs font-bold text-slate-200">{ROLE_LABELS[selectedTask.assignedTo]}</p>
                         </div>
                         <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Prioridad</p>
                            <p className="text-xs font-bold text-primary italic">[{selectedTask.priority}]</p>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Registro de Acciones</label>
                            <span className="text-[9px] text-slate-600 italic">Actualización automática</span>
                         </div>
                         <textarea 
                            rows={6} 
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-slate-300 outline-none focus:ring-1 focus:ring-primary/40 font-medium leading-relaxed" 
                            placeholder="Escribe lo que has hecho para solucionar esto..."
                            value={selectedTask.log || ""}
                            onChange={(e) => handleUpdateLog(selectedTask, e.target.value)}
                         />
                      </div>

                      <div className="flex gap-4 pt-4">
                         <Button onClick={() => handleToggleComplete(selectedTask)} className="flex-1 bg-white text-slate-900 hover:bg-white/90 h-12 rounded-2xl font-bold uppercase text-[10px] tracking-widest">
                            Completar Tarea
                         </Button>
                         <Button variant="ghost" onClick={() => { if(confirm("¿Eliminar tarea permanentemente?")) deleteTask({ variables: { id: parseInt(selectedTask.id) } }) }} className="h-12 w-12 rounded-2xl text-rose-400 hover:bg-rose-400/10 transition-colors">
                            <Trash2 className="h-5 w-5" />
                         </Button>
                      </div>
                   </div>
                </Card>
             </div>
           ) : (
             <div className="h-[400px] bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-8">
                <div className="h-16 w-16 rounded-3xl bg-white flex items-center justify-center text-slate-200 shadow-sm border border-slate-100 mb-6 group-hover:rotate-6 transition-transform">
                   <ClipboardList className="h-8 w-8" />
                </div>
                <h4 className="text-slate-400 font-bold text-sm">Sin tarea seleccionada</h4>
                <p className="text-slate-300 text-xs mt-2 italic">Haz clic en una tarea para ver su bitácora y administrarla.</p>
             </div>
           )}
        </div>
      </div>

      {/* New Task Modal */}
      {isNewOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
           <Card className="w-full max-w-lg bg-white rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-bold font-serif">Nueva Tarea</h3>
                  <p className="text-slate-400 text-xs italic">Define la operación y prioridad.</p>
                </div>
                <button onClick={() => setIsNewOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="h-6 w-6 text-slate-400" />
                </button>
              </div>

              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Título de la Tarea</label>
                    <input type="text" placeholder="Ej: Llamar a los interesados en el pack de 12 clases" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Encargado</label>
                       <select value={formData.assignedTo} onChange={(e) => setFormData({...formData, assignedTo: e.target.value})} className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-bold outline-none">
                          <option value="VENTAS">Ventas</option>
                          <option value="RECEPCION">Recepción</option>
                          <option value="ADMINISTRACION">Administración</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Prioridad</label>
                       <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-bold outline-none">
                          <option value="URGENTE">Urgente</option>
                          <option value="IMPORTANTE">Importante</option>
                          <option value="RECORDATORIO">Recordatorio</option>
                          <option value="INFORMATIVO">Informativo</option>
                       </select>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Descripción (Opcional)</label>
                    <textarea rows={2} placeholder="Detalles extra sobre lo que hay que hacer..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                 </div>
              </div>

              <div className="flex gap-4 mt-10">
                 <Button variant="ghost" className="flex-1 h-12 rounded-2xl font-bold uppercase text-[10px] tracking-widest" onClick={() => setIsNewOpen(false)}>Cancelar</Button>
                 <Button disabled={!formData.title.trim() || creating} className="flex-1 h-12 bg-slate-900 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest shadow-xl shadow-slate-900/20" onClick={() => createTask({ variables: formData })}>
                   {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear Tarea"}
                 </Button>
              </div>
           </Card>
        </div>
      )}
    </div>
  );
}
