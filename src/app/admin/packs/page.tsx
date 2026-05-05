"use client";

import { useState, useMemo } from "react";
import {
  BookOpen, Search, Plus, MoreVertical, CheckCircle2,
  XCircle, Clock, User, Music, TrendingUp, AlertTriangle,
  ChevronRight, X, Loader2, Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MOCK_PAYMENTS,
  type PackStatus
} from "@/lib/mock-data";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react/index.js";
import { GET_PLANS } from "@/graphql/queries/get-plans";
import { GET_STUDENTS_LIST } from "@/graphql/queries/get-students";
import { GET_TEACHERS } from "@/graphql/queries/get-teachers";
import { GET_INSTRUMENTS } from "@/graphql/queries/get-instruments";
import { GET_STUDENT_PACKS } from "@/graphql/queries/get-packs";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  ACTIVO:     { label: 'Activo',     color: 'text-emerald-700', bg: 'bg-emerald-50',  icon: CheckCircle2 },
  COMPLETADO: { label: 'Completado', color: 'text-slate-500',   bg: 'bg-slate-100',   icon: CheckCircle2 },
  VENCIDO:    { label: 'Vencido',    color: 'text-rose-700',    bg: 'bg-rose-50',     icon: XCircle },
  PAUSADO:    { label: 'Pausado',    color: 'text-amber-700',   bg: 'bg-amber-50',    icon: Clock }
};

function ProgressBar({ used, total }: { used: number; total: number }) {
  const pct = Math.round((used / total) * 100);
  const color = pct >= 90 ? 'bg-rose-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{used}/{total} clases</span>
        <span className={`text-[10px] font-bold ${pct >= 90 ? 'text-rose-600' : pct >= 70 ? 'text-amber-600' : 'text-emerald-600'}`}>{pct}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function AdminPacksPage() {
  const { data: plansData } = useQuery(GET_PLANS);
  const { data: studentsData } = useQuery(GET_STUDENTS_LIST);
  const { data: teachersData } = useQuery(GET_TEACHERS);
  const { data: instrumentsData } = useQuery(GET_INSTRUMENTS);
  const { data: packsData, loading: packsLoading, refetch: refetchPacks } = useQuery(GET_STUDENT_PACKS);

  const plans = plansData?.allPlans || [];
  const students = studentsData?.allStudents || [];
  const teachers = teachersData?.allTeachers || [];
  const instruments = instrumentsData?.allInstruments || [];
  const packs = useMemo(() => (packsData?.allStudentPacks || []).map((p: any) => ({
    id: p.id,
    nombre: p.plan.name,
    totalClases: p.totalClasses,
    clasesUsadas: p.totalClasses - p.remainingClasses,
    clasesRestantes: p.remainingClasses,
    precio: parseFloat(p.plan.price),
    alumnoId: p.student.id,
    alumnoNombre: p.student.name,
    profesorNombre: "Por asignar", // Se podría enriquecer en el modelo
    instrumento: "General",
    estado: p.isActive ? (p.remainingClasses > 0 ? 'ACTIVO' : 'COMPLETADO') : 'PAUSADO',
    fechaInicio: p.purchaseDate
  })), [packsData]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | 'ALL'>('ALL');
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [newPack, setNewPack] = useState({
    alumnoId: '',
    profesorId: '',
    instrumento: '', 
    planId: '',
    fechaInicio: new Date().toISOString().split('T')[0]
  });

  const selectedPlan = useMemo(() => 
    plans.find((p: any) => p.id === newPack.planId),
    [plans, newPack.planId]
  );

  const filtered = useMemo(() => packs.filter((p: any) => {
    const matchSearch = p.alumnoNombre.toLowerCase().includes(search.toLowerCase()) ||
      p.nombre.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || p.estado === statusFilter;
    return matchSearch && matchStatus;
  }), [packs, search, statusFilter]);

  const stats = useMemo(() => ({
    activos: packs.filter((p: any) => p.estado === 'ACTIVO').length,
    porVencer: packs.filter((p: any) => p.estado === 'ACTIVO' && (p.clasesRestantes / p.totalClases) <= 0.2).length,
    completados: packs.filter((p: any) => p.estado === 'COMPLETADO').length,
    ingresos: packs.reduce((sum: number, p: any) => sum + p.precio, 0)
  }), [packs]);

  const [createPack, { loading: creating }] = useMutation(gql`
    mutation CreateStudentPack($studentId: Int!, $planId: Int!) {
      createStudentPack(studentId: $studentId, planId: $planId) {
        pack { id }
      }
    }
  `, {
    onCompleted: () => {
      toast.success("Pack creado ✅");
      setIsNewOpen(false);
      refetchPacks();
    },
    onError: (err) => toast.error(err.message)
  });

  const handleCreatePack = () => {
    if (!newPack.alumnoId || !newPack.planId) return;
    createPack({ 
      variables: { 
        studentId: parseInt(newPack.alumnoId), 
        planId: parseInt(newPack.planId) 
      } 
    });
  };

  const [deductClass] = useMutation(gql`
    mutation ManualDeductClass($packId: Int!) {
      manualDeductClass(packId: $packId) {
        success
        pack {
          id
          remainingClasses
        }
      }
    }
  `, {
    onCompleted: () => {
      toast.success("Clase descontada con éxito");
      refetchPacks();
    },
    onError: (err) => toast.error(err.message)
  });

  const handleDescuentoClase = (packId: string) => {
    if (confirm("¿Seguro que quieres descontar una clase manualmente de este pack?")) {
      deductClass({ variables: { packId: parseInt(packId) } });
    }
  };

  const formatCLP = (n: number) => `$${n.toLocaleString('es-CL')}`;

  return (
    <div className="p-8 lg:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
            <Package className="h-3 w-3" /> Control Académico
          </div>
          <h1 className="text-3xl font-bold font-serif tracking-tight">Packs de Clases</h1>
          <p className="text-slate-500 italic text-sm">Gestión de packs, avance y descuento automático por sesión.</p>
        </div>
        <Button onClick={() => setIsNewOpen(true)} size="lg" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-12 px-8 font-bold uppercase tracking-[0.1em] group rounded-2xl">
          <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" /> Nuevo Pack
        </Button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Packs Activos', value: stats.activos, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Por vencer (≤20%)', value: stats.porVencer, color: 'text-rose-700', bg: 'bg-rose-50' },
          { label: 'Completados', value: stats.completados, color: 'text-slate-500', bg: 'bg-slate-50' },
          { label: 'Ingresos totales', value: formatCLP(stats.ingresos), color: 'text-primary', bg: 'bg-primary/5' }
        ].map(s => (
          <div key={s.label} className={`${s.bg} border border-slate-100/80 rounded-3xl p-6 shadow-sm`}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{s.label}</p>
            <p className={`text-2xl font-bold font-serif ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <div className="relative w-full sm:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input type="text" placeholder="Buscar alumno, profesor, instrumento..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(['ALL', 'ACTIVO', 'COMPLETADO', 'VENCIDO', 'PAUSADO'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${statusFilter === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}>
              {s === 'ALL' ? 'Todos' : statusConfig[s]?.label || s}
            </button>
          ))}
        </div>
        <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-slate-400">{filtered.length} packs</span>
      </div>

      {/* Pack Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(pack => {
          const cfg = statusConfig[pack.estado];
          const Icon = cfg.icon;
          const isAlmostDone = pack.clasesRestantes <= Math.ceil(pack.totalClases * 0.2) && pack.estado === 'ACTIVO';
          return (
            <div
              key={pack.id}
              onClick={() => { setSelectedPack(pack); setIsDetailOpen(true); }}
              className={`bg-white border rounded-3xl p-7 shadow-sm hover:shadow-md transition-all cursor-pointer group ${isAlmostDone ? 'border-rose-200 ring-1 ring-rose-100' : 'border-slate-100 hover:border-primary/20'}`}
            >
              {/* Top Row */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className={`h-11 w-11 rounded-2xl flex items-center justify-center text-lg font-black font-serif shadow-sm ${pack.totalClases === 4 ? 'bg-sky-100 text-sky-700' : pack.totalClases === 12 ? 'bg-violet-100 text-violet-700' : pack.totalClases === 24 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {pack.totalClases}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm leading-none">{pack.instrumento}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Pack {pack.totalClases} clases</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isAlmostDone && <AlertTriangle className="h-4 w-4 text-rose-500 animate-pulse" />}
                  <Badge className={`text-[9px] font-bold uppercase tracking-widest border-0 px-2.5 py-1 ${cfg.bg} ${cfg.color}`}>
                    <Icon className="h-2.5 w-2.5 mr-1" />{cfg.label}
                  </Badge>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-5">
                <ProgressBar used={pack.clasesUsadas} total={pack.totalClases} />
              </div>

              {/* Info */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-3.5 w-3.5 text-slate-300" />
                  <span className="font-bold text-slate-700">{pack.alumnoNombre}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Music className="h-3.5 w-3.5 text-slate-300" />
                  <span className="text-slate-500">{pack.profesorNombre}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-5 pt-5 border-t border-slate-50">
                <span className="font-bold text-slate-900 font-serif">{formatCLP(pack.precio)}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{pack.clasesRestantes} restantes</span>
                  <button
                    onClick={e => { e.stopPropagation(); handleDescuentoClase(pack.id); }}
                    disabled={pack.clasesRestantes === 0 || pack.estado !== 'ACTIVO'}
                    className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    − Clase
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="col-span-3 py-20 flex flex-col items-center gap-4 text-slate-300">
            <Package className="h-16 w-16 opacity-20" />
            <p className="text-sm italic font-medium">No hay packs con ese filtro</p>
          </div>
        )}
      </div>

      {/* ── PACK DETAIL DRAWER ── */}
      {isDetailOpen && selectedPack && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right-8 duration-300 flex flex-col">
            <div className="bg-slate-900 text-white p-8 relative flex-shrink-0">
              <button onClick={() => setIsDetailOpen(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors">
                <X className="h-5 w-5" />
              </button>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2">Detalle del Pack</p>
              <h2 className="text-2xl font-bold font-serif">{selectedPack.nombre}</h2>
              <div className="mt-2 flex gap-2">
                <Badge className={`text-[9px] font-bold uppercase border-0 ${statusConfig[selectedPack.estado].bg} ${statusConfig[selectedPack.estado].color}`}>
                  {statusConfig[selectedPack.estado].label}
                </Badge>
              </div>
            </div>

            <div className="flex-1 p-8 space-y-8">
              {/* Progress grande */}
              <div className={`p-6 rounded-3xl border ${selectedPack.estado === 'ACTIVO' && selectedPack.clasesRestantes <= Math.ceil(selectedPack.totalClases * 0.2) ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-5xl font-black font-serif text-slate-900">{selectedPack.clasesRestantes}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Clases Restantes</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold font-serif text-slate-700">{selectedPack.clasesUsadas}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tomadas</p>
                  </div>
                </div>
                <ProgressBar used={selectedPack.clasesUsadas} total={selectedPack.totalClases} />
              </div>

              {/* Info */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Información</p>
                {[
                  { label: 'Alumno', value: selectedPack.alumnoNombre, icon: User },
                  { label: 'Profesor', value: selectedPack.profesorNombre, icon: Music },
                  { label: 'Instrumento', value: selectedPack.instrumento, icon: Music },
                  { label: 'Inicio', value: selectedPack.fechaInicio, icon: Clock },
                  { label: 'Vencimiento', value: selectedPack.fechaVencimiento || 'Sin vencimiento', icon: Clock },
                  { label: 'Precio', value: formatCLP(selectedPack.precio), icon: TrendingUp },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between py-2 border-b border-slate-50">
                    <div className="flex items-center gap-2 text-slate-400">
                      <row.icon className="h-4 w-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{row.label}</span>
                    </div>
                    <span className="font-bold text-slate-700 text-sm">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              {selectedPack.estado === 'ACTIVO' && (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Acciones</p>
                  <Button
                    onClick={() => handleDescuentoClase(selectedPack.id)}
                    disabled={selectedPack.clasesRestantes === 0}
                    className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 disabled:opacity-40"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Registrar Clase Realizada
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      toast.info("Función de pausa en desarrollo");
                    }}
                    className="w-full h-12 rounded-2xl border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-widest"
                  >
                    <Clock className="mr-2 h-4 w-4" /> Pausar Pack
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── NEW PACK MODAL ── */}
      {isNewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <Card className="w-full max-w-lg bg-white border-none shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 rounded-[2.5rem]">
            <div className="bg-slate-900 p-8 text-white">
              <h3 className="text-2xl font-bold font-serif">Nuevo Pack</h3>
              <p className="text-slate-400 italic text-sm mt-1">Asigna un pack de clases a un alumno.</p>
            </div>
            <CardContent className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Alumno *</label>
                  <select 
                    className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-bold outline-none" 
                    value={newPack.alumnoId} 
                    onChange={e => setNewPack({ ...newPack, alumnoId: e.target.value })}
                  >
                    <option value="">Seleccionar alumno...</option>
                    {students.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Profesor *</label>
                  <select 
                    className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-bold outline-none" 
                    value={newPack.profesorId} 
                    onChange={e => setNewPack({ ...newPack, profesorId: e.target.value })}
                  >
                    <option value="">Seleccionar profesor...</option>
                    {teachers.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Instrumento *</label>
                  <select className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-bold outline-none" value={newPack.instrumento} onChange={e => setNewPack({ ...newPack, instrumento: e.target.value })}>
                    <option value="">Seleccionar...</option>
                    {instruments.map((i: any) => <option key={i.id} value={i.name}>{i.name}</option>)}
                  </select>
                </div>
                 <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Plan Académico</label>
                  <select 
                    className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-bold outline-none" 
                    value={newPack.planId} 
                    onChange={e => setNewPack({ ...newPack, planId: e.target.value })}
                  >
                    <option value="">Seleccionar plan...</option>
                    {plans.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.classesCount} clases — {formatCLP(parseFloat(p.price))})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Fecha de Inicio</label>
                  <input type="date" className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20" value={newPack.fechaInicio} onChange={e => setNewPack({ ...newPack, fechaInicio: e.target.value })} />
                </div>
              </div>

              {/* Price Preview */}
              <div className="bg-primary/5 rounded-2xl p-5 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Precio del pack</span>
                <span className="text-2xl font-black font-serif text-primary">
                  {selectedPlan ? formatCLP(parseFloat(selectedPlan.price)) : '$0'}
                </span>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" className="flex-1 h-12 rounded-2xl border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-widest" onClick={() => setIsNewOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreatePack} disabled={!newPack.alumnoId || !newPack.profesorId || !newPack.instrumento || !selectedPlan} className="flex-1 h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 disabled:opacity-40">Crear Pack</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
