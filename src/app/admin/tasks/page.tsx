"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  ClipboardList, Search, Plus, CheckCircle2, 
  Clock, User, AlertCircle, Info, History, Trash2, X,
  Loader2, CheckSquare, Square, Calendar, Kanban, List,
  ChevronLeft, ChevronRight, Edit3, Save, Hourglass, ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@apollo/client/react/index.js";
import { GET_ACADEMY_TASKS, CREATE_ACADEMY_TASK, UPDATE_ACADEMY_TASK, DELETE_ACADEMY_TASK } from "@/graphql/mutations/academy-tasks";
import { GET_ADMIN_ACCOUNTS } from "@/graphql/queries/admin-queries";
import { toast } from "sonner";
import { format, startOfWeek, addDays, differenceInDays, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  URGENTE:     { label: 'Urgente',     color: 'text-rose-700 border-rose-200',   bg: 'bg-rose-50',     icon: AlertCircle },
  IMPORTANTE:  { label: 'Importante',  color: 'text-amber-700 border-amber-200',  bg: 'bg-amber-50',    icon: Info },
  RECORDATORIO: { label: 'Recordatorio', color: 'text-sky-700 border-sky-200',    bg: 'bg-sky-50',      icon: Clock },
  INFORMATIVO: { label: 'Informativo', color: 'text-slate-600 border-slate-200',  bg: 'bg-slate-50',   icon: Info },
};

const ROLE_LABELS: Record<string, string> = {
  VENTAS: 'Ventas',
  RECEPCION: 'Recepción',
  ADMINISTRACION: 'Administración'
};

export default function AdminTasksPage() {
  const [activeTab, setActiveTab] = useState<"calendar" | "kanban" | "list">("calendar");
  const [searchTerm, setSearchTerm] = useState("");
  const [collaboratorFilter, setCollaboratorFilter] = useState("ALL");
  const [weekOffset, setWeekOffset] = useState(0);

  const [isNewOpen, setIsNewOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [localLog, setLocalLog] = useState("");

  // Create form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "RECEPCION",
    assignedUserId: "" as string | number,
    priority: "RECORDATORIO",
    dueDate: "",
    duration: 30,
    log: ""
  });

  // Queries
  const { data: tasksData, loading: tasksLoading, refetch: refetchTasks } = useQuery<any>(GET_ACADEMY_TASKS);
  const { data: accountsData } = useQuery<any>(GET_ADMIN_ACCOUNTS);

  const tasks = tasksData?.allAcademyTasks || [];
  const collaborators = accountsData?.allAdminAccounts || [];

  // Mutations
  const [createTask, { loading: creating }] = useMutation(CREATE_ACADEMY_TASK, {
    onCompleted: () => {
      toast.success("Tarea creada ✅");
      setIsNewOpen(false);
      setFormData({
        title: "",
        description: "",
        assignedTo: "RECEPCION",
        assignedUserId: "",
        priority: "RECORDATORIO",
        dueDate: "",
        duration: 30,
        log: ""
      });
      refetchTasks();
    },
    onError: (err) => toast.error(err.message)
  });

  const [updateTask, { loading: updating }] = useMutation(UPDATE_ACADEMY_TASK, {
    onCompleted: () => refetchTasks(),
    onError: (err) => toast.error(err.message)
  });

  const [deleteTask] = useMutation(DELETE_ACADEMY_TASK, {
    onCompleted: () => {
      toast.success("Tarea eliminada permanentemente 🗑️");
      setSelectedTask(null);
      refetchTasks();
    },
    onError: (err) => toast.error(err.message)
  });

  // Active task tracker
  const activeTask = useMemo(() => {
    return tasks.find((t: any) => t.id === selectedTask?.id) || selectedTask;
  }, [tasks, selectedTask]);

  useEffect(() => {
    if (activeTask) {
      setLocalLog(activeTask.log || "");
    } else {
      setLocalLog("");
    }
  }, [activeTask?.id]);

  // Date and Weekly calculations
  const currentWeekDays = useMemo(() => {
    const today = new Date();
    const start = startOfWeek(addDays(today, weekOffset * 7), { weekStartsOn: 1 }); // 1 = Monday
    return Array.from({ length: 7 }).map((_, i) => {
      const dayDate = addDays(start, i);
      return {
        date: dayDate,
        dateString: format(dayDate, "yyyy-MM-dd"),
        dayLabel: format(dayDate, "EEEE d", { locale: es }),
        shortLabel: format(dayDate, "EEEE", { locale: es }),
        numLabel: format(dayDate, "d"),
      };
    });
  }, [weekOffset]);

  // Filtered Tasks list
  const filteredTasks = useMemo(() => {
    return tasks.filter((t: any) => {
      // 1. Search term check
      const matchesSearch = 
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      // 2. Collaborator check
      if (collaboratorFilter === "ALL") return true;
      if (collaboratorFilter === "UNASSIGNED") return !t.assignedUser;
      return t.assignedUser?.id === collaboratorFilter;
    });
  }, [tasks, searchTerm, collaboratorFilter]);

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropDate = (e: React.DragEvent, dateString: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (!taskId) return;
    updateTask({
      variables: {
        id: parseInt(taskId),
        dueDate: dateString
      }
    });
    toast.success(`Tarea reprogramada para el ${format(parseISO(dateString), "dd 'de' MMMM", { locale: es })} 📅`);
  };

  const handleDropStatus = (e: React.DragEvent, isCompleted: boolean) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (!taskId) return;
    updateTask({
      variables: {
        id: parseInt(taskId),
        isCompleted
      }
    });
    toast.success(isCompleted ? "Tarea marcada como Completada ✨" : "Tarea reabierta 📂");
  };

  const handleToggleComplete = (task: any) => {
    updateTask({ variables: { id: parseInt(task.id), isCompleted: !task.isCompleted } });
    toast.success(!task.isCompleted ? "Tarea completada ✨" : "Tarea reabierta 📂");
  };

  const handleUpdateLog = (task: any, newLog: string) => {
    updateTask({ variables: { id: parseInt(task.id), log: newLog } });
    toast.success("Bitácora de tarea guardada ✅");
  };

  const handleUpdateDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    updateTask({
      variables: {
        id: parseInt(editingTask.id),
        title: editingTask.title,
        description: editingTask.description,
        assignedTo: editingTask.assignedTo,
        assignedUserId: editingTask.assignedUserId ? parseInt(editingTask.assignedUserId) : 0,
        priority: editingTask.priority,
        dueDate: editingTask.dueDate || null,
        duration: parseInt(editingTask.duration) || 30
      }
    });
    toast.success("Detalles de la tarea actualizados");
    setEditingTask(null);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 md:px-8 text-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-slate-900 font-serif tracking-tight flex items-center gap-2">
              <ClipboardList className="h-8 w-8 text-[#70125F]" /> Tareas y Calendario
            </h1>
            <p className="text-slate-400 text-xs italic">
              Asigna tareas a tu equipo, realiza seguimiento de tiempos y arrastra actividades para reprogramarlas.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Tab Selector */}
            <div className="bg-slate-200/60 p-1.5 rounded-2xl flex items-center gap-1">
              <button 
                onClick={() => setActiveTab("calendar")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "calendar" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                <Calendar className="h-4 w-4" /> Semanal
              </button>
              <button 
                onClick={() => setActiveTab("kanban")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "kanban" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                <Kanban className="h-4 w-4" /> Kanban
              </button>
              <button 
                onClick={() => setActiveTab("list")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                <List className="h-4 w-4" /> Completa
              </button>
            </div>

            <Button 
              onClick={() => setIsNewOpen(true)}
              className="bg-[#70125F] hover:bg-[#590e4b] text-white rounded-2xl h-12 px-6 font-bold uppercase tracking-wider text-xs shadow-lg shadow-[#70125F]/20 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Plus className="h-4 w-4" /> Nueva Tarea
            </Button>
          </div>
        </header>

        {/* Filters and Utilities Toolbar */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar tareas..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
              />
            </div>

            {/* Collaborator Filter */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Asignado a:</span>
              <select 
                value={collaboratorFilter} 
                onChange={(e) => setCollaboratorFilter(e.target.value)}
                className="h-10 bg-slate-50 border-none rounded-xl px-3 text-xs font-bold outline-none cursor-pointer"
              >
                <option value="ALL">Cualquiera</option>
                <option value="UNASSIGNED">Sin Asignar</option>
                {collaborators.map((user: any) => (
                  <option key={user.id} value={user.id}>{user.username}</option>
                ))}
              </select>
            </div>
          </div>

          {activeTab === "calendar" && (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setWeekOffset(weekOffset - 1)}
                className="h-10 w-10 rounded-xl cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setWeekOffset(0)}
                className="h-10 px-4 rounded-xl text-xs font-bold uppercase cursor-pointer"
              >
                Esta Semana
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setWeekOffset(weekOffset + 1)}
                className="h-10 w-10 rounded-xl cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Tab content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Area based on Tab */}
          <div className="lg:col-span-8 space-y-6">
            
            {tasksLoading ? (
              <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 text-[#70125F] animate-spin" />
                <p className="text-slate-400 text-xs italic">Cargando tareas...</p>
              </div>
            ) : activeTab === "calendar" ? (
              
              /* WEEKLY CALENDAR VIEW */
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {currentWeekDays.map((day) => {
                  const dayTasks = filteredTasks.filter((t: any) => t.dueDate === day.dateString);
                  return (
                    <div 
                      key={day.dateString}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDropDate(e, day.dateString)}
                      className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm min-h-[400px] flex flex-col space-y-4 transition-colors hover:bg-slate-50/40"
                    >
                      <div className="border-b pb-2 text-center">
                        <p className="text-[10px] font-black text-[#70125F] uppercase tracking-widest leading-none">
                          {day.shortLabel}
                        </p>
                        <p className="text-lg font-extrabold text-slate-800 mt-1">
                          {day.numLabel}
                        </p>
                      </div>

                      <div className="flex-1 space-y-3 overflow-y-auto max-h-[400px] pr-1">
                        {dayTasks.map((task: any) => {
                          const prio = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.INFORMATIVO;
                          return (
                            <div 
                              key={task.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, task.id)}
                              onClick={() => setSelectedTask(task)}
                              className={`p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 flex flex-col gap-2 cursor-pointer transition-all shadow-sm ${task.isCompleted ? 'opacity-50 line-through' : ''}`}
                            >
                              <div className="flex items-start justify-between gap-1">
                                <p className="font-bold text-xs text-slate-800 line-clamp-2 leading-snug">{task.title}</p>
                                <span className={`h-2 w-2 rounded-full shrink-0 ${prio.bg.replace('bg-', 'bg-').split(' ')[0]}`} style={{ backgroundColor: task.priority === 'URGENTE' ? '#f43f5e' : task.priority === 'IMPORTANTE' ? '#f59e0b' : '#38bdf8' }} />
                              </div>

                              <div className="flex items-center justify-between gap-1 flex-wrap pt-1 border-t border-slate-100/50">
                                <span className="text-[9px] text-slate-400 font-bold uppercase truncate max-w-[80px]">
                                  👤 {task.assignedUser?.username || "Sin Asignar"}
                                </span>
                                <span className="text-[9px] text-[#70125F] font-bold">
                                  ⏱️ {task.duration || 30} min
                                </span>
                              </div>
                            </div>
                          );
                        })}

                        {dayTasks.length === 0 && (
                          <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-10">
                            <span className="text-[10px] font-bold text-slate-400 italic">Sin tareas</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            ) : activeTab === "kanban" ? (
              
              /* KANBAN BOARD VIEW */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Pending Column */}
                <div 
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropStatus(e, false)}
                  className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm min-h-[500px] flex flex-col space-y-4"
                >
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="font-extrabold text-slate-800 text-sm tracking-widest uppercase flex items-center gap-2">
                      📂 Pendientes
                    </h3>
                    <Badge className="bg-sky-50 text-sky-700 border-none rounded-lg text-xs">
                      {filteredTasks.filter((t: any) => !t.isCompleted).length}
                    </Badge>
                  </div>

                  <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px] pr-1">
                    {filteredTasks.filter((t: any) => !t.isCompleted).map((task: any) => {
                      const prio = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.INFORMATIVO;
                      return (
                        <div 
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onClick={() => setSelectedTask(task)}
                          className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 cursor-grab active:cursor-grabbing transition-all flex flex-col gap-2"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <p className="font-bold text-slate-800 text-sm leading-snug">{task.title}</p>
                            <Badge className={`border-0 text-[8px] font-black uppercase tracking-widest shrink-0 ${prio.bg} ${prio.color}`}>
                              {prio.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-1">{task.description}</p>
                          <div className="flex items-center justify-between border-t border-slate-200/50 pt-2 text-[10px] text-slate-400 font-bold uppercase">
                            <span>👤 {task.assignedUser?.username || "Sin Asignar"}</span>
                            <span className="text-[#70125F]">⏱️ {task.duration || 30} min</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Completed Column */}
                <div 
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropStatus(e, true)}
                  className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm min-h-[500px] flex flex-col space-y-4"
                >
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="font-extrabold text-slate-800 text-sm tracking-widest uppercase flex items-center gap-2">
                      ✅ Completadas
                    </h3>
                    <Badge className="bg-emerald-50 text-emerald-700 border-none rounded-lg text-xs">
                      {filteredTasks.filter((t: any) => t.isCompleted).length}
                    </Badge>
                  </div>

                  <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px] pr-1">
                    {filteredTasks.filter((t: any) => t.isCompleted).map((task: any) => {
                      const prio = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.INFORMATIVO;
                      return (
                        <div 
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onClick={() => setSelectedTask(task)}
                          className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 cursor-grab active:cursor-grabbing transition-all flex flex-col gap-2 opacity-60 line-through"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <p className="font-bold text-slate-800 text-sm leading-snug">{task.title}</p>
                            <Badge className={`border-0 text-[8px] font-black uppercase tracking-widest shrink-0 ${prio.bg} ${prio.color}`}>
                              {prio.label}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between border-t border-slate-200/50 pt-2 text-[10px] text-slate-400 font-bold uppercase">
                            <span>👤 {task.assignedUser?.username || "Sin Asignar"}</span>
                            <span className="text-[#70125F]">⏱️ {task.duration || 30} min</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            ) : (
              
              /* SIMPLE LIST VIEW */
              <Card className="border-none shadow-sm bg-white rounded-[2rem] overflow-hidden">
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-50">
                    {filteredTasks.length === 0 ? (
                      <div className="p-20 text-center italic text-slate-400">No se encontraron tareas.</div>
                    ) : filteredTasks.map((task: any) => {
                      const prio = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.INFORMATIVO;
                      return (
                        <div 
                          key={task.id} 
                          onClick={() => setSelectedTask(task)}
                          className="p-6 hover:bg-slate-50/50 transition-all flex items-center justify-between gap-6 cursor-pointer group"
                        >
                          <div className="flex gap-4 items-start">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleToggleComplete(task); }} 
                              className="mt-1 transition-transform active:scale-90 text-slate-300 hover:text-emerald-500"
                            >
                              {task.isCompleted ? <CheckSquare className="h-5 w-5 text-emerald-500" /> : <Square className="h-5 w-5" />}
                            </button>
                            <div className="space-y-1">
                              <p className={`font-bold text-slate-800 ${task.isCompleted ? 'line-through text-slate-400' : 'group-hover:text-primary transition-colors'}`}>{task.title}</p>
                              <p className="text-xs text-slate-500 line-clamp-1">{task.description}</p>
                              
                              <div className="flex items-center gap-3 flex-wrap text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-1">
                                <Badge className={`border-none text-[8px] font-black uppercase tracking-widest ${prio.bg} ${prio.color}`}>
                                  {prio.label}
                                </Badge>
                                <span>👤 {task.assignedUser?.username || "Sin Asignar"}</span>
                                {task.dueDate && <span>📅 {format(parseISO(task.dueDate), "dd MMM yyyy", { locale: es })}</span>}
                                <span className="text-[#70125F]">⏱️ {task.duration || 30} min</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

          </div>

          {/* Right Column: Detailed View / Log */}
          <div className="lg:col-span-4 space-y-6">
            {activeTask ? (
              <div className="sticky top-8 animate-in slide-in-from-right-4 duration-500">
                
                {editingTask ? (
                  /* EDITING FORM DRIVER */
                  <Card className="border-none shadow-xl bg-white rounded-[2.5rem] p-8 border border-slate-100 space-y-6">
                    <div className="flex justify-between items-center border-b pb-4">
                      <h3 className="text-lg font-extrabold text-slate-900 font-serif">Editar Tarea</h3>
                      <button onClick={() => setEditingTask(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
                        <X className="h-5 w-5 text-slate-400" />
                      </button>
                    </div>

                    <form onSubmit={handleUpdateDetails} className="space-y-4 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold uppercase tracking-widest text-[#70125F]">Título de la Tarea</label>
                        <input 
                          required
                          type="text" 
                          value={editingTask.title} 
                          onChange={(e) => setEditingTask({...editingTask, title: e.target.value})} 
                          className="w-full h-11 bg-slate-50 border-none rounded-xl px-3 outline-none font-bold" 
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold uppercase tracking-widest text-[#70125F]">Descripción</label>
                        <textarea 
                          rows={3} 
                          value={editingTask.description || ""} 
                          onChange={(e) => setEditingTask({...editingTask, description: e.target.value})} 
                          className="w-full bg-slate-50 border-none rounded-xl p-3 outline-none" 
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="font-bold uppercase tracking-widest text-[#70125F]">Prioridad</label>
                          <select 
                            value={editingTask.priority} 
                            onChange={(e) => setEditingTask({...editingTask, priority: e.target.value})}
                            className="w-full h-11 bg-slate-50 border-none rounded-xl px-2 outline-none font-semibold"
                          >
                            <option value="URGENTE">Urgente</option>
                            <option value="IMPORTANTE">Importante</option>
                            <option value="RECORDATORIO">Recordatorio</option>
                            <option value="INFORMATIVO">Informativo</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold uppercase tracking-widest text-[#70125F]">Colaborador</label>
                          <select 
                            value={editingTask.assignedUserId || ""} 
                            onChange={(e) => setEditingTask({...editingTask, assignedUserId: e.target.value})}
                            className="w-full h-11 bg-slate-50 border-none rounded-xl px-2 outline-none font-semibold"
                          >
                            <option value="">Sin Asignar</option>
                            {collaborators.map((user: any) => (
                              <option key={user.id} value={user.id}>{user.username}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="font-bold uppercase tracking-widest text-[#70125F]">Vencimiento</label>
                          <input 
                            type="date" 
                            value={editingTask.dueDate || ""} 
                            onChange={(e) => setEditingTask({...editingTask, dueDate: e.target.value})} 
                            className="w-full h-11 bg-slate-50 border-none rounded-xl px-2 outline-none font-semibold" 
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold uppercase tracking-widest text-[#70125F]">Tiempo (Minutos)</label>
                          <input 
                            type="number" 
                            value={editingTask.duration || 30} 
                            onChange={(e) => setEditingTask({...editingTask, duration: parseInt(e.target.value) || 0})} 
                            className="w-full h-11 bg-slate-50 border-none rounded-xl px-2 outline-none font-semibold" 
                          />
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        disabled={updating}
                        className="w-full bg-[#70125F] hover:bg-[#590e4b] text-white rounded-2xl h-11 font-bold uppercase tracking-wider text-xs shadow-lg shadow-[#70125F]/20 cursor-pointer mt-4"
                      >
                        {updating ? "Guardando..." : "Guardar Cambios"}
                      </Button>
                    </form>
                  </Card>
                ) : (
                  /* DETAILED STATIC CARD */
                  <Card className="border-none shadow-xl bg-slate-900 text-white rounded-[2.5rem] overflow-hidden">
                    <div className="p-8 space-y-8">
                      <div className="flex justify-between items-start">
                        <Badge className="bg-primary/20 text-primary border-primary/20 font-black text-[9px] uppercase tracking-widest px-3 py-1">
                          {activeTask.isCompleted ? "Tarea Completada" : "Detalle de Tarea"}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => setEditingTask({
                              id: activeTask.id,
                              title: activeTask.title,
                              description: activeTask.description,
                              assignedTo: activeTask.assignedTo,
                              assignedUserId: activeTask.assignedUser?.id || "",
                              priority: activeTask.priority,
                              dueDate: activeTask.dueDate,
                              duration: activeTask.duration
                            })}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-slate-400"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button onClick={() => setSelectedTask(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-slate-400">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h2 className="text-xl font-bold font-serif leading-tight">{activeTask.title}</h2>
                        <p className="text-slate-400 text-xs leading-relaxed">{activeTask.description || "Sin descripción"}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Responsable</p>
                          <p className="font-bold text-slate-200">{activeTask.assignedUser?.username || "Sin Asignar"}</p>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Duración</p>
                          <p className="font-bold text-primary italic">{activeTask.duration || 30} minutos</p>
                        </div>
                      </div>

                      {activeTask.dueDate && (
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-xs">
                          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Fecha Límite</p>
                          <p className="font-bold text-slate-200">
                            {format(parseISO(activeTask.dueDate), "eeee dd 'de' MMMM, yyyy", { locale: es })}
                          </p>
                        </div>
                      )}

                      {activeTask.isCompleted && activeTask.completedAt && (
                        <div className="bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 shrink-0" />
                          <div>
                            <p className="text-[8px] font-black uppercase tracking-widest mb-1">Completada el</p>
                            <p className="font-bold">{new Date(activeTask.completedAt).toLocaleString("es-CL")}</p>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Registro y Notas</label>
                          <button
                            type="button"
                            onClick={() => handleUpdateLog(activeTask, localLog)}
                            className="text-[10px] font-bold bg-[#70125F] hover:bg-[#590e4b] text-white uppercase tracking-widest px-3 py-1.5 rounded-xl transition-all shadow-sm cursor-pointer"
                          >
                            Guardar Notas
                          </button>
                        </div>
                        <textarea 
                          rows={5} 
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-xs text-slate-300 outline-none focus:ring-1 focus:ring-primary/40 font-medium" 
                          placeholder="Registra avances, tiempos dedicados, etc..."
                          value={localLog}
                          onChange={(e) => setLocalLog(e.target.value)}
                        />
                      </div>

                      <div className="flex gap-4 pt-4">
                        <Button 
                          onClick={() => handleToggleComplete(activeTask)} 
                          className="flex-1 bg-white hover:bg-white/95 text-slate-900 h-12 rounded-2xl font-bold uppercase text-[10px] tracking-widest cursor-pointer"
                        >
                          {activeTask.isCompleted ? "Reabrir Tarea" : "Marcar Realizada"}
                        </Button>
                        <Button 
                          variant="ghost" 
                          onClick={() => { if(confirm("¿Eliminar tarea permanentemente?")) deleteTask({ variables: { id: parseInt(activeTask.id) } }) }} 
                          className="h-12 w-12 rounded-2xl text-rose-400 hover:bg-rose-400/10 cursor-pointer"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}

              </div>
            ) : (
              <div className="h-[300px] bg-white rounded-[2.5rem] border border-slate-100 flex flex-col items-center justify-center text-center p-8 shadow-sm">
                <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 shadow-sm border border-slate-100 mb-4">
                  <ClipboardList className="h-6 w-6 text-[#70125F]" />
                </div>
                <h4 className="text-slate-400 font-bold text-sm">Sin tarea seleccionada</h4>
                <p className="text-slate-300 text-xs mt-1 italic">Haz clic en una tarea para ver su bitácora e ingresar tiempos.</p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* NEW TASK MODAL */}
      {isNewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto border border-slate-100">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="text-2xl font-bold font-serif">Nueva Tarea</h3>
                <p className="text-slate-400 text-xs italic">Define la operación, el responsable y el calendario.</p>
              </div>
              <button onClick={() => setIsNewOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
                <X className="h-6 w-6 text-slate-400" />
              </button>
            </div>

            <div className="space-y-5 text-xs">
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-widest text-[#70125F]">Título de la Tarea *</label>
                <input 
                  required
                  type="text" 
                  placeholder="Ej: Conciliar transferencias bancarias del día" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 font-bold outline-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-widest text-[#70125F]">Prioridad</label>
                  <select 
                    value={formData.priority} 
                    onChange={(e) => setFormData({...formData, priority: e.target.value})} 
                    className="w-full h-11 bg-slate-50 border-none rounded-xl px-3 font-semibold outline-none"
                  >
                    <option value="URGENTE">Urgente 🔥</option>
                    <option value="IMPORTANTE">Importante 🌟</option>
                    <option value="RECORDATORIO">Recordatorio ⏱️</option>
                    <option value="INFORMATIVO">Informativo 📝</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-widest text-[#70125F]">Colaborador Asignado</label>
                  <select 
                    value={formData.assignedUserId} 
                    onChange={(e) => setFormData({...formData, assignedUserId: e.target.value})} 
                    className="w-full h-11 bg-slate-50 border-none rounded-xl px-3 font-semibold outline-none"
                  >
                    <option value="">Sin Asignar</option>
                    {collaborators.map((user: any) => (
                      <option key={user.id} value={user.id}>{user.username}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-widest text-[#70125F]">Fecha de Vencimiento</label>
                  <input 
                    type="date" 
                    value={formData.dueDate} 
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})} 
                    className="w-full h-11 bg-slate-50 border-none rounded-xl px-3 font-semibold outline-none" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-widest text-[#70125F]">Duración Estimada (Minutos)</label>
                  <input 
                    type="number" 
                    value={formData.duration} 
                    onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 30})} 
                    className="w-full h-11 bg-slate-50 border-none rounded-xl px-3 font-semibold outline-none" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase tracking-widest text-[#70125F]">Descripción / Indicaciones</label>
                <textarea 
                  rows={3} 
                  placeholder="Detalles sobre lo que hay que hacer..." 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  className="w-full bg-slate-50 border-none rounded-xl p-3 outline-none" 
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <Button variant="ghost" className="flex-1 h-12 rounded-2xl font-bold uppercase text-[10px] tracking-widest cursor-pointer" onClick={() => setIsNewOpen(false)}>
                Cancelar
              </Button>
              <Button 
                disabled={!formData.title.trim() || creating} 
                className="flex-1 h-12 bg-[#70125F] hover:bg-[#590e4b] text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest shadow-xl shadow-[#70125F]/20 cursor-pointer" 
                onClick={() => createTask({
                  variables: {
                    title: formData.title,
                    description: formData.description,
                    assignedTo: formData.assignedTo,
                    assignedUserId: formData.assignedUserId ? parseInt(formData.assignedUserId as string) : null,
                    priority: formData.priority,
                    dueDate: formData.dueDate || null,
                    duration: formData.duration,
                    log: formData.log
                  }
                })}
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear Tarea"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
