"use client";

import { useState, useMemo } from "react";
import {
  CreditCard, Search, Plus, CheckCircle2, XCircle, Clock,
  AlertTriangle, User, Phone, TrendingUp, X, Download,
  MessageCircle, Banknote, Building2, Wallet, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  EVOLUTION_API_CONFIG, WA_TEMPLATES,
  type PaymentStatus, type PaymentMethod
} from "@/lib/mock-data";
import { useQuery, useMutation } from "@apollo/client/react/index.js";
import { GET_PAYMENTS_PAGE_DATA } from "@/graphql/queries/get-payments";
import { REGISTER_PAYMENT } from "@/graphql/mutations/student-mutations";
import { toast } from "sonner";

const statusConfig: Record<PaymentStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  PAGADO:   { label: 'Pagado',   color: 'text-emerald-700', bg: 'bg-emerald-50', icon: CheckCircle2 },
  PENDIENTE:{ label: 'Pendiente',color: 'text-amber-700',   bg: 'bg-amber-50',   icon: Clock },
  VENCIDO:  { label: 'Vencido', color: 'text-rose-700',    bg: 'bg-rose-50',    icon: XCircle }
};

const methodConfig: Record<PaymentMethod, { label: string; icon: React.ElementType }> = {
  EFECTIVO:     { label: 'Efectivo',     icon: Banknote },
  TRANSFERENCIA:{ label: 'Transferencia',icon: Building2 },
  TARJETA:      { label: 'Tarjeta',      icon: CreditCard },
  OTRO:         { label: 'Otro',         icon: Wallet }
};

export default function AdminPaymentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'ALL'>('ALL');
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // ── GraphQL Hooks ───────────────────────────────────────────
  const { data, loading, refetch } = useQuery<any>(GET_PAYMENTS_PAGE_DATA);
  const [registerPayment, { loading: isRegistering }] = useMutation(REGISTER_PAYMENT, {
    onCompleted: () => {
      toast.success("Pago registrado y crédito activado ✅");
      setIsNewOpen(false);
      refetch();
    },
    onError: (err) => toast.error(err.message)
  });

  const [newPayment, setNewPayment] = useState({
    studentId: '',
    planId: '',
    amount: '',
    description: '',
    method: 'TRANSFERENCIA' as PaymentMethod
  });

  const payments = data?.allPayments || [];
  const students = data?.allStudents || [];
  const plans = data?.allPlans || [];

  const filtered = useMemo(() => payments.filter((p: any) => {
    const studentName = p.student?.name || "";
    const description = p.description || "";
    const match = studentName.toLowerCase().includes(search.toLowerCase()) ||
      description.toLowerCase().includes(search.toLowerCase());
    return match;
  }), [payments, search]);

  const stats = useMemo(() => ({
    totalRecaudado: payments.reduce((s: number, p: any) => s + (p.amount || 0), 0),
    count: payments.length
  }), [payments]);

  const handleCreatePayment = () => {
    if (!newPayment.studentId || !newPayment.amount) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }
    registerPayment({
      variables: {
        studentId: parseInt(newPayment.studentId),
        amount: parseFloat(newPayment.amount),
        method: newPayment.method,
        description: newPayment.description,
        planId: newPayment.planId ? parseInt(newPayment.planId) : null
      }
    });
  };

  const formatCLP = (n: number) => `$${n.toLocaleString('es-CL')}`;

  return (
    <div className="p-8 lg:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
            <CreditCard className="h-3 w-3" /> Finanzas
          </div>
          <h1 className="text-3xl font-bold font-serif tracking-tight">Pagos y Cobranza</h1>
          <p className="text-slate-500 italic text-sm">Control de ingresos y transacciones reales.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setIsNewOpen(true)} size="lg" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-12 px-8 font-bold uppercase tracking-[0.1em] group rounded-2xl text-white">
            <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" /> Registrar Pago
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Recaudado Total', value: formatCLP(stats.totalRecaudado), color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Transacciones', value: stats.count, color: 'text-slate-700', bg: 'bg-slate-50' }
        ].map(s => (
          <div key={s.label} className={`${s.bg} border border-slate-100/80 rounded-3xl p-6 shadow-sm`}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{s.label}</p>
            <p className={`text-2xl font-bold font-serif ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <div className="relative w-full sm:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input type="text" placeholder="Buscar alumno..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm outline-none" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-white rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Alumno</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Concepto</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Monto</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Medio</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Estado</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Fecha</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                 <tr><td colSpan={7} className="py-20 text-center italic text-slate-400">Sincronizando finanzas...</td></tr>
              ) : filtered.map((pay: any) => {
                const methCfg: any = methodConfig[pay.method as PaymentMethod] || methodConfig.OTRO;
                const MIcon = methCfg.icon;
                return (
                  <tr key={pay.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => { setSelectedPayment(pay); setIsDetailOpen(true); }}>
                    <td className="px-8 py-5">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{pay.student?.name}</p>
                        {pay.student?.phoneNumber && <p className="text-[11px] text-slate-400 font-mono">{pay.student.phoneNumber}</p>}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm text-slate-700 font-medium">{pay.description || "Pago Mensualidad"}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-bold text-slate-900 font-serif text-sm">{formatCLP(pay.amount)}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-slate-500">
                        <MIcon className="h-4 w-4" />
                        <span className="text-[11px] font-bold uppercase tracking-widest">{methCfg.label}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <Badge className={`text-[9px] font-bold uppercase tracking-widest border-0 px-3 py-1 bg-emerald-50 text-emerald-700`}>
                        <CheckCircle2 className="h-2.5 w-2.5 mr-1" />PAGADO
                      </Badge>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-500 italic">{pay.paymentDate}</td>
                    <td className="px-8 py-5 text-right">
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 group-hover:text-primary transition-colors">
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {isDetailOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right-8 duration-300 flex flex-col">
            <div className="bg-slate-900 text-white p-8 relative flex-shrink-0">
              <button onClick={() => setIsDetailOpen(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors"><X className="h-5 w-5" /></button>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2">Detalle de Pago</p>
              <h2 className="text-2xl font-bold font-serif">{selectedPayment.student?.name}</h2>
              <p className="text-3xl font-black font-serif mt-3">{formatCLP(selectedPayment.amount)}</p>
            </div>
            <div className="flex-1 p-8 space-y-6">
              {[
                { label: 'Concepto', value: selectedPayment.description || "Pago Mensualidad" },
                { label: 'Método de pago', value: selectedPayment.method },
                { label: 'Fecha de pago', value: selectedPayment.paymentDate || '—' },
                { label: 'Alumno ID', value: selectedPayment.student?.id }
              ].map(row => (
                <div key={row.label} className="flex items-start justify-between py-2 border-b border-slate-50">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{row.label}</span>
                  <span className="font-bold text-slate-700 text-sm text-right max-w-[60%]">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isNewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <Card className="w-full max-w-lg bg-white border-none shadow-2xl overflow-hidden rounded-[2.5rem]">
            <div className="bg-slate-900 p-8 text-white">
              <h3 className="text-2xl font-bold font-serif">Registrar Pago</h3>
              <p className="text-slate-400 italic text-sm mt-1">Registra un pago manual de alumno.</p>
            </div>
            <CardContent className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Alumno *</label>
                  <select className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-medium outline-none" value={newPayment.studentId} onChange={e => setNewPayment({ ...newPayment, studentId: e.target.value })}>
                    <option value="">Seleccionar alumno...</option>
                    {students.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Plan / Pack (opcional - activa créditos)</label>
                  <select className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-medium outline-none" value={newPayment.planId} onChange={e => setNewPayment({ ...newPayment, planId: e.target.value })}>
                    <option value="">Solo registrar pago (sin pack)...</option>
                    {plans.map((p: any) => <option key={p.id} value={p.id}>{p.name} (${p.price})</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Monto (CLP) *</label>
                  <input type="number" placeholder="60000" className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm outline-none" value={newPayment.amount} onChange={e => setNewPayment({ ...newPayment, amount: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Medio de Pago</label>
                  <select className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-bold outline-none" value={newPayment.method} onChange={e => setNewPayment({ ...newPayment, method: e.target.value as PaymentMethod })}>
                    {(['TRANSFERENCIA', 'EFECTIVO', 'TARJETA', 'OTRO'] as PaymentMethod[]).map(m => <option key={m} value={m}>{methodConfig[m].label}</option>)}
                  </select>
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Concepto / Nota</label>
                  <input type="text" placeholder="Ej. Pago Marzo 2024" className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm outline-none" value={newPayment.description} onChange={e => setNewPayment({ ...newPayment, description: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1 h-12 rounded-2xl" onClick={() => setIsNewOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreatePayment} disabled={isRegistering || !newPayment.studentId || !newPayment.amount} className="flex-1 h-12 rounded-2xl bg-primary text-white font-bold uppercase text-[10px] tracking-widest shadow-lg">
                  {isRegistering ? "Registrando..." : "Confirmar Pago"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
