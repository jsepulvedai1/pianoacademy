"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client/react/index.js";
import { GET_ADMIN_ACCOUNTS, GET_AUDIT_LOGS } from "@/graphql/queries/admin-queries";
import { CREATE_ADMIN_ACCOUNT, UPDATE_ADMIN_ACCOUNT, DELETE_ADMIN_ACCOUNT } from "@/graphql/mutations/student-mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Shield, Eye, Trash2, Edit3, Plus, X, Lock, Mail, User, Check,
  Activity, Calendar, ShieldCheck, Database, Search, ArrowRight, Key
} from "lucide-react";
import { toast } from "sonner";

const ROLE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  ADMIN: { label: 'Admin Supremo', color: 'text-rose-700 border-rose-200', bg: 'bg-rose-50' },
  VENTAS: { label: 'Ventas', color: 'text-indigo-700 border-indigo-200', bg: 'bg-indigo-50' },
  RECEPCION: { label: 'Recepción', color: 'text-sky-700 border-sky-200', bg: 'bg-sky-50' },
  STAFF: { label: 'Staff', color: 'text-slate-600 border-slate-200', bg: 'bg-slate-50' },
};

const SECTIONS_CONFIG = [
  { id: 'leads', label: 'Prospectos / Leads' },
  { id: 'students', label: 'Fichas de Alumnos' },
  { id: 'payments', label: 'Registro de Pagos' },
  { id: 'teachers', label: 'Profesores' },
  { id: 'lessons', label: 'Calendario y Clases' },
  { id: 'plans', label: 'Planes / Programas' },
  { id: 'rooms', label: 'Salas de Clases' },
  { id: 'instruments', label: 'Instrumentos' },
  { id: 'tasks', label: 'Tareas de Academia' },
  { id: 'settings', label: 'Configuración Global' },
];

export default function UsersAdminPage() {
  const { data: accountsData, refetch: refetchAccounts } = useQuery<any>(GET_ADMIN_ACCOUNTS);
  const { data: logsData, refetch: refetchLogs } = useQuery<any>(GET_AUDIT_LOGS);

  const accounts = accountsData?.allAdminAccounts || [];
  const logs = logsData?.allAuditLogs || [];

  const [isAdding, setIsAdding] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Search state for logs
  const [logSearch, setLogSearch] = useState("");

  // Create form states
  const [createForm, setCreateForm] = useState({
    username: "",
    password: "",
    email: "",
    role: "VENTAS",
    allowedSections: [] as string[]
  });

  // Edit form states
  const [editForm, setEditForm] = useState({
    id: 0,
    password: "",
    role: "VENTAS",
    allowedSections: [] as string[]
  });

  // GraphQL Mutations
  const [createAccount, { loading: isCreating }] = useMutation(CREATE_ADMIN_ACCOUNT, {
    onCompleted: (res: any) => {
      if (res.createAdminAccount?.success) {
        toast.success("Cuenta administrativa creada ✅");
        setIsAdding(false);
        setCreateForm({ username: "", password: "", email: "", role: "VENTAS", allowedSections: [] });
        refetchAccounts();
        refetchLogs();
      } else {
        toast.error(res.createAdminAccount?.error || "Error al crear la cuenta");
      }
    },
    onError: (err: any) => toast.error(err.message)
  });

  const [updateAccount, { loading: isUpdating }] = useMutation(UPDATE_ADMIN_ACCOUNT, {
    onCompleted: (res: any) => {
      if (res.updateAdminAccount?.success) {
        toast.success("Cuenta actualizada exitosamente ✅");
        setSelectedUser(null);
        refetchAccounts();
        refetchLogs();
      } else {
        toast.error(res.updateAdminAccount?.error || "Error al actualizar la cuenta");
      }
    },
    onError: (err: any) => toast.error(err.message)
  });

  const [deleteAccount, { loading: isDeleting }] = useMutation(DELETE_ADMIN_ACCOUNT, {
    onCompleted: (res: any) => {
      if (res.deleteAdminAccount?.success) {
        toast.success("Cuenta eliminada ✅");
        setSelectedUser(null);
        refetchAccounts();
        refetchLogs();
      } else {
        toast.error(res.deleteAdminAccount?.error || "Error al eliminar la cuenta");
      }
    },
    onError: (err: any) => toast.error(err.message)
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.username || !createForm.password || !createForm.role) {
      toast.error("Por favor completa los campos requeridos.");
      return;
    }
    createAccount({
      variables: {
        username: createForm.username,
        password: createForm.password,
        email: createForm.email || null,
        role: createForm.role,
        allowedSections: createForm.allowedSections
      }
    });
  };

  const handleUpdate = () => {
    if (!editForm.id) return;
    updateAccount({
      variables: {
        id: editForm.id,
        password: editForm.password || null,
        role: editForm.role,
        allowedSections: editForm.allowedSections
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este colaborador? Esta acción no se puede deshacer.")) {
      deleteAccount({ variables: { id } });
    }
  };

  const handleStartEdit = (user: any) => {
    setSelectedUser(user);
    setEditForm({
      id: parseInt(user.id),
      password: "",
      role: user.profile?.role || "VENTAS",
      allowedSections: user.profile?.allowedSections || []
    });
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log: any) => 
      log.username.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(logSearch.toLowerCase()))
    );
  }, [logs, logSearch]);

  const toggleSection = (sectionId: string, isEdit: boolean) => {
    if (isEdit) {
      const current = editForm.allowedSections;
      const updated = current.includes(sectionId)
        ? current.filter(id => id !== sectionId)
        : [...current, sectionId];
      setEditForm({ ...editForm, allowedSections: updated });
    } else {
      const current = createForm.allowedSections;
      const updated = current.includes(sectionId)
        ? current.filter(id => id !== sectionId)
        : [...current, sectionId];
      setCreateForm({ ...createForm, allowedSections: updated });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 md:px-8 text-slate-800">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-slate-900 font-serif tracking-tight flex items-center gap-2">
              <Shield className="h-8 w-8 text-[#70125F]" /> Perfiles y Seguridad
            </h1>
            <p className="text-slate-400 text-xs italic">
              Gestiona cuentas administrativas, controla accesos por sección y audita las actividades del sistema.
            </p>
          </div>
          <Button 
            onClick={() => setIsAdding(true)}
            className="bg-[#70125F] hover:bg-[#590e4b] text-white rounded-2xl h-12 px-6 font-bold uppercase tracking-wider text-xs shadow-lg shadow-[#70125F]/20 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Plus className="h-4 w-4" /> Registrar Colaborador
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: User Accounts List */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <h2 className="text-base font-extrabold tracking-widest text-slate-400 uppercase flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#70125F]" /> Cuentas de Colaboradores
                </h2>
                <Badge variant="outline" className="text-slate-400 text-[10px] font-bold">
                  {accounts.length} Total
                </Badge>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {accounts.map((user: any) => {
                  const roleCfg = ROLE_LABELS[user.profile?.role || 'STAFF'] || ROLE_LABELS.STAFF;
                  return (
                    <div 
                      key={user.id} 
                      className="group p-4 bg-slate-50 hover:bg-slate-100/70 rounded-2xl border border-slate-100 flex items-center justify-between gap-4 transition-all"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-slate-800 text-sm truncate">{user.username}</p>
                          {user.isSuperuser && (
                            <Badge className="bg-[#70125F]/10 text-[#70125F] border-none text-[8px] font-black tracking-widest uppercase">
                              Super Admin
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{user.email || "Sin email"}</p>
                        
                        <div className="flex items-center gap-2 flex-wrap pt-1">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${roleCfg.bg} ${roleCfg.color}`}>
                            {roleCfg.label}
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium">
                            {user.profile?.role === 'ADMIN' ? 'Acceso Total' : `${user.profile?.allowedSections?.length || 0} áreas`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Button 
                          onClick={() => handleStartEdit(user)}
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-500 hover:text-[#70125F] hover:bg-white rounded-xl cursor-pointer"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        {!user.isSuperuser && (
                          <Button 
                            onClick={() => handleDelete(user.id)}
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Audit Logs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                <h2 className="text-base font-extrabold tracking-widest text-slate-400 uppercase flex items-center gap-2">
                  <Database className="h-4 w-4 text-[#70125F]" /> Registro de Actividad (Auditoría)
                </h2>
                <div className="relative w-full sm:w-60">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input 
                    placeholder="Filtrar logs..." 
                    value={logSearch} 
                    onChange={(e) => setLogSearch(e.target.value)}
                    className="pl-9 h-9 bg-slate-50 border-none rounded-xl text-xs" 
                  />
                </div>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {filteredLogs.map((log: any) => (
                  <div key={log.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-2 relative">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700">{log.username}</span>
                        <Badge className="bg-slate-200/60 hover:bg-slate-200/60 text-slate-600 border-none font-mono text-[9px] scale-90 origin-left">
                          {log.action}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(log.timestamp).toLocaleString("es-CL")}
                      </span>
                    </div>

                    <p className="text-slate-500 leading-relaxed font-medium">{log.details}</p>

                    {log.ipAddress && (
                      <p className="text-[9px] text-slate-400 font-mono">Dirección IP: {log.ipAddress}</p>
                    )}
                  </div>
                ))}

                {filteredLogs.length === 0 && (
                  <p className="text-center text-slate-400 text-xs py-8">No se encontraron logs coincidentes.</p>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* MODAL: Add Collaborator */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto border border-slate-100">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-xl font-extrabold text-slate-900 font-serif tracking-tight flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-[#70125F]" /> Registrar Colaborador
              </h2>
              <button 
                onClick={() => setIsAdding(false)} 
                className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="h-6 w-6 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#70125F]">Nombre de Usuario *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      required
                      placeholder="ej: javier.s"
                      value={createForm.username}
                      onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                      className="pl-10 h-11 bg-slate-50 border-none rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#70125F]">Contraseña *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      required
                      type="password"
                      placeholder="••••••••"
                      value={createForm.password}
                      onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                      className="pl-10 h-11 bg-slate-50 border-none rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#70125F]">Correo Electrónico (Opcional)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    type="email"
                    placeholder="colaborador@detache.cl"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="pl-10 h-11 bg-slate-50 border-none rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#70125F]">Rol del Colaborador</label>
                <select 
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  className="w-full h-11 bg-slate-50 border-none rounded-xl px-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="ADMIN">Administrador (Acceso Completo)</option>
                  <option value="VENTAS">Ventas</option>
                  <option value="RECEPCION">Recepción</option>
                </select>
              </div>

              {createForm.role !== 'ADMIN' && (
                <div className="space-y-3 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#70125F]">Secciones Permitidas</label>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {SECTIONS_CONFIG.map(sec => {
                      const active = createForm.allowedSections.includes(sec.id);
                      return (
                        <button
                          key={sec.id}
                          type="button"
                          onClick={() => toggleSection(sec.id, false)}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-left cursor-pointer border transition-all ${
                            active 
                              ? 'bg-[#70125F]/10 border-[#70125F] text-[#70125F]' 
                              : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {sec.label}
                          {active && <Check className="h-3.5 w-3.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={isCreating}
                className="w-full bg-[#70125F] hover:bg-[#590e4b] text-white rounded-2xl h-12 font-bold uppercase tracking-wider text-xs shadow-lg shadow-[#70125F]/20 cursor-pointer"
              >
                {isCreating ? "Registrando..." : "Crear Cuenta"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER / MODAL: Edit Collaborator */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-end animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md h-full p-8 shadow-2xl flex flex-col justify-between border-l border-slate-100 animate-in slide-in-from-right duration-300">
            <div className="space-y-6 overflow-y-auto pr-1">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 font-serif tracking-tight">Editar Colaborador</h2>
                  <p className="text-xs text-slate-400 font-mono mt-1">Usuario: {selectedUser.username}</p>
                </div>
                <button 
                  onClick={() => setSelectedUser(null)} 
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                >
                  <X className="h-6 w-6 text-slate-400" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#70125F]">Cambiar Contraseña (Opcional)</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      type="password"
                      placeholder="Nueva contraseña"
                      value={editForm.password}
                      onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                      className="pl-10 h-11 bg-slate-50 border-none rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#70125F]">Rol del Colaborador</label>
                  <select 
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full h-11 bg-slate-50 border-none rounded-xl px-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="ADMIN">Administrador (Acceso Completo)</option>
                    <option value="VENTAS">Ventas</option>
                    <option value="RECEPCION">Recepción</option>
                  </select>
                </div>

                {editForm.role !== 'ADMIN' && (
                  <div className="space-y-3 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#70125F]">Secciones Permitidas</label>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      {SECTIONS_CONFIG.map(sec => {
                        const active = editForm.allowedSections.includes(sec.id);
                        return (
                          <button
                            key={sec.id}
                            type="button"
                            onClick={() => toggleSection(sec.id, true)}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-left cursor-pointer border transition-all ${
                              active 
                                ? 'bg-[#70125F]/10 border-[#70125F] text-[#70125F]' 
                                : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            {sec.label}
                            {active && <Check className="h-3.5 w-3.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-4 space-y-3 mt-6">
              <Button 
                onClick={handleUpdate} 
                disabled={isUpdating}
                className="w-full bg-[#70125F] hover:bg-[#590e4b] text-white rounded-2xl h-12 font-bold uppercase tracking-wider text-xs shadow-lg shadow-[#70125F]/20 cursor-pointer"
              >
                {isUpdating ? "Guardando..." : "Guardar Cambios"}
              </Button>
              <Button 
                onClick={() => setSelectedUser(null)}
                variant="ghost"
                className="w-full text-slate-400 hover:text-slate-600 rounded-xl h-12 font-bold uppercase tracking-wider text-xs"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
