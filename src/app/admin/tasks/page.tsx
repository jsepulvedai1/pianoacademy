"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  ClipboardList, Search, Plus, CheckCircle2, 
  Clock, User, AlertCircle, Info, History, Trash2, X,
  Loader2, CheckSquare, Square, Calendar, Kanban, List,
  ChevronLeft, ChevronRight, Edit3, Save, Hourglass, ArrowRight,
  ArrowLeft, Check, Sparkles, UserCheck, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@apollo/client/react/index.js";
import { GET_ACADEMY_TASKS, CREATE_ACADEMY_TASK, UPDATE_ACADEMY_TASK, DELETE_ACADEMY_TASK } from "@/graphql/mutations/academy-tasks";
import { GET_ADMIN_ACCOUNTS, ME_QUERY } from "@/graphql/queries/admin-queries";
import { toast } from "sonner";
import { format, startOfWeek, addDays, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string; icon: any }> = {
  URGENTE:      { label: 'Urgente',     color: 'text-rose-700 border-rose-200',   bg: 'bg-rose-50',    dot: '#f43f5e', icon: AlertCircle },
  IMPORTANTE:   { label: 'Importante',  color: 'text-amber-700 border-amber-200', bg: 'bg-amber-50',   dot: '#f59e0b', icon: Info },
  RECORDATORIO: { label: 'Recordatorio', color: 'text-sky-700 border-sky-200',   bg: 'bg-sky-50',     dot: '#38bdf8', icon: Clock },
  INFORMATIVO:  { label: 'Informativo', color: 'text-slate-600 border-slate-200', bg: 'bg-slate-50',  dot: '#94a3b8', icon: Info },
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  VENTAS: 'Ventas',
  RECEPCION: 'Recepción',
  ADMINISTRACION: 'Administración',
  STAFF: 'Staff',
  COLLABORATOR: 'Colaborador',
};

const getTaskStatus = (task: any): 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' => {
  if (task.status === 'COMPLETED' || task.status === 'IN_PROGRESS' || task.status === 'PENDING') {
    return task.status;
  }
  if (task.isCompleted) return 'COMPLETED';
  return 'PENDING';
};

export default function AdminTasksPage() {
  const [activeTab, setActiveTab] = useState<"kanban" | "calendar" | "list">("kanban");
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
    status: "PENDING",
    dueDate: "",
    duration: 30,
    log: ""
  });

  // Queries
  const { data: tasksData, loading: tasksLoading, refetch: refetchTasks } = useQuery<any>(GET_ACADEMY_TASKS);
  const { data: accountsData } = useQuery<any>(GET_ADMIN_ACCOUNTS);
  const { data: meData } = useQuery<any>(ME_QUERY);

  const tasks = tasksData?.allAcademyTasks || [];
  const collaborators = accountsData?.allAdminAccounts || [];
  const currentUserId = meData?.me?.id;

  // Mutations
  const [createTask, { loading: creating }] = useMutation(CREATE_ACADEMY_TASK, {
    onCompleted: () => {
      toast.success("Tarea creada exitosamente ✅");
      setIsNewOpen(false);
      setFormData({
        title: "",
        description: "",
        assignedTo: "RECEPCION",
        assignedUserId: "",
        priority: "RECORDATORIO",
        status: "PENDING",
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
      if (collaboratorFilter === "MY_TASKS") return currentUserId && t.assignedUser?.id === currentUserId;
      if (collaboratorFilter === "UNASSIGNED") return !t.assignedUser;
      return t.assignedUser?.id === collaboratorFilter;
    });
  }, [tasks, searchTerm, collaboratorFilter, currentUserId]);

  // Grouped tasks by status
  const pendingTasks = useMemo(() => filteredTasks.filter((t: any) => getTaskStatus(t) === 'PENDING'), [filteredTasks]);
  const inProgressTasks = useMemo(() => filteredTasks.filter((t: any) => getTaskStatus(t) === 'IN_PROGRESS'), [filteredTasks]);
  const completedTasks = useMemo(() => filteredTasks.filter((t: any) => getTaskStatus(t) === 'COMPLETED'), [filteredTasks]);

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

  const handleDropStatus = (e: React.DragEvent, targetStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (!taskId) return;
    handleChangeStatus(taskId, targetStatus);
  };

  const handleChangeStatus = (taskId: string | number, newStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') => {
    updateTask({
      variables: {
        id: parseInt(taskId.toString()),
        status: newStatus,
        isCompleted: newStatus === 'COMPLETED'
      }
    });
    if (newStatus === 'COMPLETED') toast.success("Tarea completada ✨");
    else if (newStatus === 'IN_PROGRESS') toast.success("Tarea en proceso ⏳");
    else toast.success("Tarea movida a pendientes 📂");
  };

  const handleReassignUser = (taskId: string | number, userId: string | number | null) => {
    const assignedUserId = userId && userId !== "" ? parseInt(userId.toString()) : 0;
    updateTask({
      variables: {
        id: parseInt(taskId.toString()),
        assignedUserId: assignedUserId
      }
    });
    toast.success("Responsable asignado exitosamente 👤");
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
        status: editingTask.status,
        isCompleted: editingTask.status === 'COMPLETED',
        dueDate: editingTask.dueDate || null,
        duration: parseInt(editingTask.duration) || 30
      }
    });
    toast.success("Detalles de la tarea actualizados");
    setEditingTask(null);
  };

  const getCollaboratorName = (user: any) => {
    if (!user) return "Sin Asignar";
    const role = user.profile?.role ? ` (${ROLE_LABELS[user.profile.role] || user.profile.role})` : "";
    return `${user.username}${role}`;
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 md:px-8 text-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-slate-900 font-serif tracking-tight flex items-center gap-3">
              <ClipboardList className="h-8 w-8 text-[#70125F]" /> Tablero de Tareas y Operaciones
            </h1>
            <p className="text-slate-500 text-xs">
              Organiza flujos de trabajo, asigna colaboradores responsables y arrastra o mueve actividades entre estados.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher */}
            <div className="bg-slate-200/70 p-1.5 rounded-2xl flex items-center gap-1 shadow-inner">
              <button 
                onClick={() => setActiveTab("kanban")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "kanban" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
              >
                <Kanban className="h-4 w-4 text-[#70125F]" /> Kanban
              </button>
              <button 
                onClick={() => setActiveTab("calendar")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "calendar" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
              >
                <Calendar className="h-4 w-4" /> Semanal
              </button>
              <button 
                onClick={() => setActiveTab("list")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
              >
                <List className="h-4 w-4" /> Lista
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

        {/* Filters & Collaborators Toolbar */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap flex-1">
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar tareas por título o detalle..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
              />
            </div>

            {/* Collaborator Filter */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                <User className="h-3 w-3" /> Responsable:
              </span>
              <select 
                value={collaboratorFilter} 
                onChange={(e) => setCollaboratorFilter(e.target.value)}
                className="h-10 bg-slate-50 border-none rounded-xl px-3 text-xs font-bold outline-none cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <option value="ALL">Todos los Colaboradores</option>
                {currentUserId && <option value="MY_TASKS">⭐ Mis Tareas Asignadas</option>}
                <option value="UNASSIGNED">⚪ Sin Asignar</option>
                {collaborators.map((user: any) => (
                  <option key={user.id} value={user.id}>
                    {getCollaboratorName(user)}
                  </option>
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
                <p className="text-slate-400 text-xs italic">Sincronizando tareas operativas...</p>
              </div>
            ) : activeTab === "kanban" ? (
              
              /* ── 3-COLUMN KANBAN BOARD ── */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* 1. Pendientes Column */}
                <div 
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropStatus(e, 'PENDING')}
                  className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm min-h-[550px] flex flex-col space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                    <h3 className="font-extrabold text-slate-800 text-xs tracking-widest uppercase flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                      📂 Pendientes
                    </h3>
                    <Badge className="bg-sky-50 text-sky-700 border-none rounded-lg text-xs font-bold">
                      {pendingTasks.length}
                    </Badge>
                  </div>

                  <div className="flex-1 space-y-3 overflow-y-auto max-h-[550px] pr-1">
                    {pendingTasks.map((task: any) => {
                      const prio = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.INFORMATIVO;
                      return (
                        <div 
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onClick={() => setSelectedTask(task)}
                          className="p-4 bg-slate-50/80 hover:bg-white rounded-2xl border border-slate-100 hover:border-slate-200/80 cursor-grab active:cursor-grabbing transition-all flex flex-col gap-2.5 shadow-sm hover:shadow-md group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-bold text-slate-900 text-xs leading-snug group-hover:text-[#70125F] transition-colors">{task.title}</p>
                            <Badge className={`border-0 text-[8px] font-black uppercase tracking-widest shrink-0 ${prio.bg} ${prio.color}`}>
                              {prio.label}
                            </Badge>
                          </div>

                          {task.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{task.description}</p>
                          )}

                          {/* Collaborator Selector Dropdown */}
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                            <div className="flex items-center gap-1.5 max-w-[140px]" onClick={(e) => e.stopPropagation()}>
                              <User className="h-3 w-3 text-slate-400 shrink-0" />
                              <select
                                value={task.assignedUser?.id || ""}
                                onChange={(e) => handleReassignUser(task.id, e.target.value)}
                                className="bg-transparent border-none text-[10px] font-bold text-slate-600 outline-none cursor-pointer truncate hover:text-[#70125F]"
                              >
                                <option value="">Sin Asignar</option>
                                {collaborators.map((u: any) => (
                                  <option key={u.id} value={u.id}>{u.username}</option>
                                ))}
                              </select>
                            </div>

                            <span className="text-[9px] text-[#70125F] font-bold shrink-0">
                              ⏱️ {task.duration || 30}m
                            </span>
                          </div>

                          {/* Quick Action Move Button */}
                          <div className="flex items-center justify-end gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleChangeStatus(task.id, 'IN_PROGRESS')}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all flex items-center gap-1 cursor-pointer"
                              title="Mover a En Proceso"
                            >
                              <Hourglass className="h-3 w-3" /> Iniciar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleChangeStatus(task.id, 'COMPLETED')}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all flex items-center gap-1 cursor-pointer"
                              title="Marcar como Completada"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {pendingTasks.length === 0 && (
                      <div className="h-40 flex flex-col items-center justify-center text-center opacity-40">
                        <Clock className="h-6 w-6 text-slate-300 mb-1" />
                        <span className="text-[11px] font-bold text-slate-400 italic">No hay tareas pendientes</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. En Proceso Column */}
                <div 
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropStatus(e, 'IN_PROGRESS')}
                  className="bg-white rounded-[2rem] p-5 border border-amber-100/60 shadow-sm min-h-[550px] flex flex-col space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                    <h3 className="font-extrabold text-slate-800 text-xs tracking-widest uppercase flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
                      ⏳ En Proceso
                    </h3>
                    <Badge className="bg-amber-50 text-amber-700 border-none rounded-lg text-xs font-bold">
                      {inProgressTasks.length}
                    </Badge>
                  </div>

                  <div className="flex-1 space-y-3 overflow-y-auto max-h-[550px] pr-1">
                    {inProgressTasks.map((task: any) => {
                      const prio = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.INFORMATIVO;
                      return (
                        <div 
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onClick={() => setSelectedTask(task)}
                          className="p-4 bg-amber-50/20 hover:bg-white rounded-2xl border border-amber-200/50 hover:border-amber-300 cursor-grab active:cursor-grabbing transition-all flex flex-col gap-2.5 shadow-sm hover:shadow-md group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-bold text-slate-900 text-xs leading-snug group-hover:text-amber-700 transition-colors">{task.title}</p>
                            <Badge className={`border-0 text-[8px] font-black uppercase tracking-widest shrink-0 ${prio.bg} ${prio.color}`}>
                              {prio.label}
                            </Badge>
                          </div>

                          {task.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{task.description}</p>
                          )}

                          {/* Collaborator Selector */}
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                            <div className="flex items-center gap-1.5 max-w-[140px]" onClick={(e) => e.stopPropagation()}>
                              <User className="h-3 w-3 text-amber-600 shrink-0" />
                              <select
                                value={task.assignedUser?.id || ""}
                                onChange={(e) => handleReassignUser(task.id, e.target.value)}
                                className="bg-transparent border-none text-[10px] font-bold text-slate-700 outline-none cursor-pointer truncate hover:text-amber-700"
                              >
                                <option value="">Sin Asignar</option>
                                {collaborators.map((u: any) => (
                                  <option key={u.id} value={u.id}>{u.username}</option>
                                ))}
                              </select>
                            </div>

                            <span className="text-[9px] text-amber-700 font-bold shrink-0">
                              ⏱️ {task.duration || 30}m
                            </span>
                          </div>

                          {/* Quick Action Move Buttons */}
                          <div className="flex items-center justify-between gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleChangeStatus(task.id, 'PENDING')}
                              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all flex items-center gap-1 cursor-pointer"
                              title="Regresar a Pendientes"
                            >
                              <ArrowLeft className="h-3 w-3" /> Pendiente
                            </button>
                            <button
                              type="button"
                              onClick={() => handleChangeStatus(task.id, 'COMPLETED')}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all flex items-center gap-1 cursor-pointer"
                              title="Marcar como Completada"
                            >
                              <Check className="h-3 w-3" /> Completar
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {inProgressTasks.length === 0 && (
                      <div className="h-40 flex flex-col items-center justify-center text-center opacity-40">
                        <Hourglass className="h-6 w-6 text-slate-300 mb-1" />
                        <span className="text-[11px] font-bold text-slate-400 italic">Sin tareas en progreso</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Completadas Column */}
                <div 
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropStatus(e, 'COMPLETED')}
                  className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm min-h-[550px] flex flex-col space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                    <h3 className="font-extrabold text-slate-800 text-xs tracking-widest uppercase flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      ✅ Completadas
                    </h3>
                    <Badge className="bg-emerald-50 text-emerald-700 border-none rounded-lg text-xs font-bold">
                      {completedTasks.length}
                    </Badge>
                  </div>

                  <div className="flex-1 space-y-3 overflow-y-auto max-h-[550px] pr-1">
                    {completedTasks.map((task: any) => {
                      const prio = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.INFORMATIVO;
                      return (
                        <div 
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onClick={() => setSelectedTask(task)}
                          className="p-4 bg-slate-50/50 hover:bg-white rounded-2xl border border-slate-100 hover:border-slate-200 cursor-grab active:cursor-grabbing transition-all flex flex-col gap-2 opacity-75 hover:opacity-100 group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-bold text-slate-600 line-through text-xs leading-snug">{task.title}</p>
                            <Badge className={`border-0 text-[8px] font-black uppercase tracking-widest shrink-0 ${prio.bg} ${prio.color}`}>
                              {prio.label}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-bold">
                            <span>👤 {task.assignedUser?.username || "Sin Asignar"}</span>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleChangeStatus(task.id, 'IN_PROGRESS'); }}
                              className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all cursor-pointer"
                            >
                              ↩️ Reanudar
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {completedTasks.length === 0 && (
                      <div className="h-40 flex flex-col items-center justify-center text-center opacity-40">
                        <CheckCircle2 className="h-6 w-6 text-slate-300 mb-1" />
                        <span className="text-[11px] font-bold text-slate-400 italic">No hay tareas completadas</span>
                      </div>
                    )}
                  </div>
                </div>

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
                          const status = getTaskStatus(task);
                          const prio = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.INFORMATIVO;
                          return (
                            <div 
                              key={task.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, task.id)}
                              onClick={() => setSelectedTask(task)}
                              className={`p-3 rounded-2xl border flex flex-col gap-2 cursor-pointer transition-all shadow-sm ${
                                status === 'COMPLETED' ? 'bg-emerald-50/30 border-emerald-100 opacity-60 line-through' :
                                status === 'IN_PROGRESS' ? 'bg-amber-50/40 border-amber-200' :
                                'bg-slate-50 hover:bg-slate-100/80 border-slate-100'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1">
                                <p className="font-bold text-xs text-slate-800 line-clamp-2 leading-snug">{task.title}</p>
                                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: prio.dot }} />
                              </div>

                              <div className="flex items-center justify-between gap-1 flex-wrap pt-1 border-t border-slate-100/50">
                                <span className="text-[9px] text-slate-500 font-bold uppercase truncate max-w-[80px]">
                                  👤 {task.assignedUser?.username || "Sin Asignar"}
                                </span>
                                <span className="text-[9px] text-[#70125F] font-bold">
                                  ⏱️ {task.duration || 30}m
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

            ) : (
              
              /* SIMPLE LIST VIEW */
              <Card className="border-none shadow-sm bg-white rounded-[2rem] overflow-hidden">
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-50">
                    {filteredTasks.length === 0 ? (
                      <div className="p-20 text-center italic text-slate-400">No se encontraron tareas.</div>
                    ) : filteredTasks.map((task: any) => {
                      const status = getTaskStatus(task);
                      const prio = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.INFORMATIVO;
                      return (
                        <div 
                          key={task.id} 
                          onClick={() => setSelectedTask(task)}
                          className="p-6 hover:bg-slate-50/50 transition-all flex items-center justify-between gap-6 cursor-pointer group"
                        >
                          <div className="flex gap-4 items-start flex-1">
                            <div className="mt-1">
                              {status === 'COMPLETED' ? (
                                <button onClick={(e) => { e.stopPropagation(); handleChangeStatus(task.id, 'PENDING'); }} title="Reabrir">
                                  <CheckSquare className="h-5 w-5 text-emerald-500" />
                                </button>
                              ) : status === 'IN_PROGRESS' ? (
                                <button onClick={(e) => { e.stopPropagation(); handleChangeStatus(task.id, 'COMPLETED'); }} title="Completar">
                                  <Hourglass className="h-5 w-5 text-amber-500 animate-pulse" />
                                </button>
                              ) : (
                                <button onClick={(e) => { e.stopPropagation(); handleChangeStatus(task.id, 'IN_PROGRESS'); }} title="Iniciar">
                                  <Square className="h-5 w-5 text-slate-300 hover:text-amber-500" />
                                </button>
                              )}
                            </div>

                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-3">
                                <p className={`font-bold text-slate-800 text-sm ${status === 'COMPLETED' ? 'line-through text-slate-400' : 'group-hover:text-[#70125F] transition-colors'}`}>
                                  {task.title}
                                </p>
                                <Badge className={`border-none text-[8px] font-black uppercase tracking-widest ${
                                  status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' :
                                  status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-700' :
                                  'bg-sky-50 text-sky-700'
                                }`}>
                                  {status === 'COMPLETED' ? 'Completada' : status === 'IN_PROGRESS' ? 'En Proceso' : 'Pendiente'}
                                </Badge>
                              </div>
                              {task.description && <p className="text-xs text-slate-500 line-clamp-1">{task.description}</p>}
                              
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

          {/* Right Column: Detailed View / Log / Drawer */}
          <div className="lg:col-span-4 space-y-6">
            {activeTask ? (
              <div className="sticky top-8 animate-in slide-in-from-right-4 duration-500">
                
                {editingTask ? (
                  /* EDITING FORM */
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
                          <label className="font-bold uppercase tracking-widest text-[#70125F]">Estado</label>
                          <select 
                            value={editingTask.status} 
                            onChange={(e) => setEditingTask({...editingTask, status: e.target.value})}
                            className="w-full h-11 bg-slate-50 border-none rounded-xl px-2 outline-none font-semibold"
                          >
                            <option value="PENDING">📂 Pendiente</option>
                            <option value="IN_PROGRESS">⏳ En Proceso</option>
                            <option value="COMPLETED">✅ Completada</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold uppercase tracking-widest text-[#70125F]">Prioridad</label>
                          <select 
                            value={editingTask.priority} 
                            onChange={(e) => setEditingTask({...editingTask, priority: e.target.value})}
                            className="w-full h-11 bg-slate-50 border-none rounded-xl px-2 outline-none font-semibold"
                          >
                            <option value="URGENTE">Urgente 🔥</option>
                            <option value="IMPORTANTE">Importante 🌟</option>
                            <option value="RECORDATORIO">Recordatorio ⏱️</option>
                            <option value="INFORMATIVO">Informativo 📝</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold uppercase tracking-widest text-[#70125F]">Colaborador Responsable</label>
                        <select 
                          value={editingTask.assignedUserId || ""} 
                          onChange={(e) => setEditingTask({...editingTask, assignedUserId: e.target.value})}
                          className="w-full h-11 bg-slate-50 border-none rounded-xl px-3 outline-none font-semibold"
                        >
                          <option value="">Sin Asignar</option>
                          {collaborators.map((user: any) => (
                            <option key={user.id} value={user.id}>{getCollaboratorName(user)}</option>
                          ))}
                        </select>
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
                          <label className="font-bold uppercase tracking-widest text-[#70125F]">Tiempo (Min)</label>
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
                  /* DETAILED STATIC CARD WITH INTERACTIVE STATUS AND ASSIGNMENT */
                  <Card className="border-none shadow-xl bg-slate-900 text-white rounded-[2.5rem] overflow-hidden">
                    <div className="p-8 space-y-6">
                      <div className="flex justify-between items-start">
                        <Badge className={`border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 ${
                          getTaskStatus(activeTask) === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' :
                          getTaskStatus(activeTask) === 'IN_PROGRESS' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-sky-500/20 text-sky-300'
                        }`}>
                          {getTaskStatus(activeTask) === 'COMPLETED' ? '✅ Completada' :
                           getTaskStatus(activeTask) === 'IN_PROGRESS' ? '⏳ En Proceso' :
                           '📂 Pendiente'}
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
                              status: getTaskStatus(activeTask),
                              dueDate: activeTask.dueDate,
                              duration: activeTask.duration
                            })}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-slate-400"
                            title="Editar Tarea"
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

                      {/* State Action Selector */}
                      <div className="space-y-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cambiar Estado Rápido</p>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => handleChangeStatus(activeTask.id, 'PENDING')}
                            className={`py-2 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                              getTaskStatus(activeTask) === 'PENDING'
                                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                                : 'bg-white/5 text-slate-300 hover:bg-white/10'
                            }`}
                          >
                            <Clock className="h-3 w-3" /> Pendiente
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChangeStatus(activeTask.id, 'IN_PROGRESS')}
                            className={`py-2 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                              getTaskStatus(activeTask) === 'IN_PROGRESS'
                                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                                : 'bg-white/5 text-slate-300 hover:bg-white/10'
                            }`}
                          >
                            <Hourglass className="h-3 w-3" /> Proceso
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChangeStatus(activeTask.id, 'COMPLETED')}
                            className={`py-2 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                              getTaskStatus(activeTask) === 'COMPLETED'
                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                                : 'bg-white/5 text-slate-300 hover:bg-white/10'
                            }`}
                          >
                            <Check className="h-3 w-3" /> Hecho
                          </button>
                        </div>
                      </div>

                      {/* Quick Assign Collaborator */}
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Responsable Asignado</p>
                        <select
                          value={activeTask.assignedUser?.id || ""}
                          onChange={(e) => handleReassignUser(activeTask.id, e.target.value)}
                          className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 outline-none cursor-pointer"
                        >
                          <option value="" className="bg-slate-900 text-slate-300">⚪ Sin Asignar</option>
                          {collaborators.map((user: any) => (
                            <option key={user.id} value={user.id} className="bg-slate-900 text-slate-100">
                              👤 {getCollaboratorName(user)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Duración</p>
                          <p className="font-bold text-primary italic">{activeTask.duration || 30} minutos</p>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Prioridad</p>
                          <p className="font-bold text-slate-200">{PRIORITY_CONFIG[activeTask.priority]?.label || activeTask.priority}</p>
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

                      {/* Log / Notes Area */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Bitácora y Notas</label>
                          <button
                            type="button"
                            onClick={() => handleUpdateLog(activeTask, localLog)}
                            className="text-[10px] font-bold bg-[#70125F] hover:bg-[#590e4b] text-white uppercase tracking-widest px-3 py-1.5 rounded-xl transition-all shadow-sm cursor-pointer"
                          >
                            Guardar Notas
                          </button>
                        </div>
                        <textarea 
                          rows={4} 
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-xs text-slate-200 outline-none focus:ring-1 focus:ring-primary/40 font-medium" 
                          placeholder="Registra avances, tiempos dedicados, notas de gestión..."
                          value={localLog}
                          onChange={(e) => setLocalLog(e.target.value)}
                        />
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button 
                          variant="ghost" 
                          onClick={() => { if(confirm("¿Eliminar tarea permanentemente?")) deleteTask({ variables: { id: parseInt(activeTask.id) } }) }} 
                          className="w-full h-11 rounded-2xl text-rose-400 hover:bg-rose-400/10 text-xs font-bold uppercase tracking-wider cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Eliminar Tarea
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}

              </div>
            ) : (
              <div className="h-[320px] bg-white rounded-[2.5rem] border border-slate-100 flex flex-col items-center justify-center text-center p-8 shadow-sm">
                <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 shadow-sm border border-slate-100 mb-4">
                  <ClipboardList className="h-6 w-6 text-[#70125F]" />
                </div>
                <h4 className="text-slate-700 font-bold text-sm">Sin tarea seleccionada</h4>
                <p className="text-slate-400 text-xs mt-1 italic max-w-xs">
                  Haz clic en cualquier tarea del tablero para ver sus notas, reasignar responsable o cambiar su estado.
                </p>
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
                <h3 className="text-2xl font-bold font-serif">Nueva Tarea Operativa</h3>
                <p className="text-slate-400 text-xs italic">Define la actividad, el responsable y el estado inicial.</p>
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
                  placeholder="Ej: Confirmar salas para clases del sábado" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 font-bold outline-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-widest text-[#70125F]">Estado Inicial</label>
                  <select 
                    value={formData.status} 
                    onChange={(e) => setFormData({...formData, status: e.target.value})} 
                    className="w-full h-11 bg-slate-50 border-none rounded-xl px-3 font-semibold outline-none"
                  >
                    <option value="PENDING">📂 Pendiente</option>
                    <option value="IN_PROGRESS">⏳ En Proceso</option>
                    <option value="COMPLETED">✅ Completada</option>
                  </select>
                </div>

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
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase tracking-widest text-[#70125F]">Colaborador Responsable</label>
                <select 
                  value={formData.assignedUserId} 
                  onChange={(e) => setFormData({...formData, assignedUserId: e.target.value})} 
                  className="w-full h-11 bg-slate-50 border-none rounded-xl px-3 font-semibold outline-none"
                >
                  <option value="">Sin Asignar</option>
                  {collaborators.map((user: any) => (
                    <option key={user.id} value={user.id}>{getCollaboratorName(user)}</option>
                  ))}
                </select>
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
                    status: formData.status,
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
