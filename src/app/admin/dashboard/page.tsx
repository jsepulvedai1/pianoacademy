"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  UserCheck, 
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  DollarSign,
  Activity,
  ChevronRight,
  MessageSquare,
  Plus,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@apollo/client/react/index.js";
import { GET_DASHBOARD_STATS } from "@/graphql/queries/get-dashboard-stats";
import { GET_DASHBOARD_NOTES, CREATE_NOTE, TOGGLE_NOTE, DELETE_NOTE } from "@/graphql/mutations/dashboard-notes";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [noteText, setNoteText] = useState("");
  const { data, loading } = useQuery<any>(GET_DASHBOARD_STATS);
  const { data: notesData, refetch: refetchNotes } = useQuery(GET_DASHBOARD_NOTES);

  const [createNote] = useMutation(CREATE_NOTE, {
    onCompleted: () => {
      setNoteText("");
      refetchNotes();
    }
  });

  const [toggleNote] = useMutation(TOGGLE_NOTE, { onCompleted: () => refetchNotes() });
  const [deleteNote] = useMutation(DELETE_NOTE, { onCompleted: () => refetchNotes() });

  // ─── KPI CALCULATIONS ──────────────────────────────────────
  const kpis = useMemo(() => {
    if (!data) return {
      totalTeachers: 0,
      monthlyRevenue: 0,
      pendingRevenue: 0,
      conversionRate: 0,
      activeStudents: 0,
      totalLeads: 0
    };

    const totalTeachers = data.totalTeachers?.length || 0;
    const totalLeads = data.totalLeads?.length || 0;
    const activeStudents = data.totalStudents?.length || 0;
    
    const currentMonth = new Date().getMonth();
    const monthlyRevenue = (data.totalPayments || [])
      .filter((p: any) => new Date(p.paymentDate).getMonth() === currentMonth)
      .reduce((sum: number, p: any) => sum + p.amount, 0);

    const closedLeads = (data.totalLeads || []).filter((l: any) => l.estado === 'CONCRETADO' || l.estado === 'RESERVA_CONFIRMADA').length;
    const conversionRate = totalLeads > 0 ? Math.round((closedLeads / totalLeads) * 100) : 0;

    return {
      totalTeachers,
      monthlyRevenue,
      pendingRevenue: 0, // Backend pending revenue query needed for real data
      conversionRate,
      activeStudents,
      totalLeads
    };
  }, [data]);

  const recentActivity = useMemo(() => {
    if (!data) return [];
    
    const payments = (data.totalPayments || []).slice(-3).map((p: any) => ({
      id: p.id,
      type: 'PAYMENT',
      text: `Pago de ${p.student?.name || 'Alumno'}`,
      amount: p.amount,
      date: p.paymentDate,
      status: 'PAID'
    }));
    
    const lessons = (data.totalLessons || []).slice(-3).map((l: any) => ({
      id: l.id,
      type: 'LESSON',
      text: `${l.student?.name} con ${l.teacher?.name}`,
      date: l.date,
      status: l.status
    }));

    return [...payments, ...lessons].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [data]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    createNote({ variables: { text: noteText, author: "Admin" } });
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val);

  if (loading) return <div className="p-12 text-center italic text-slate-400">Cargando métricas de la academia...</div>;

  return (
    <div className="p-8 lg:p-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
             <Activity className="h-3 w-3" /> Dashboard Analytics
          </div>
          <h1 className="text-4xl font-bold font-serif tracking-tight text-slate-900">Vista Global del Negocio</h1>
          <p className="text-slate-500 italic text-sm"> Datos en tiempo real del backend Détaché.</p>
        </div>
      </header>

      {/* Primary Stats Grid */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { title: "Ingresos (Mes)", value: formatCurrency(kpis.monthlyRevenue), sub: "Recaudado", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+12.5%", trendUp: true },
          { title: "Tasa de Conversión", value: `${kpis.conversionRate}%`, sub: "Leads a Alumnos", icon: UserCheck, color: "text-primary", bg: "bg-primary/5", trend: "Meta: 15%", trendUp: true },
          { title: "Alumnos Activos", value: kpis.activeStudents, sub: "Matrícula total", icon: Users, color: "text-blue-600", bg: "bg-blue-50", trend: "En crecimiento", trendUp: true },
          { title: "Leads Totales", value: kpis.totalLeads, sub: "Prospectos", icon: MessageSquare, color: "text-amber-600", bg: "bg-amber-50", trend: "Nuevos registros", trendUp: true },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden bg-white rounded-[2.5rem]">
            <CardContent className="p-8 relative">
              <div className="flex items-start justify-between relative z-10 mb-6">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} ring-1 ring-inset ring-black/5 group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
              <div className="space-y-1 relative z-10">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{stat.title}</p>
                <p className="text-3xl font-black font-serif italic text-slate-900">{stat.value}</p>
                <p className="text-[10px] text-slate-400 font-medium italic">{stat.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm bg-white rounded-[2.5rem] p-10 space-y-10">
          <div className="flex items-center justify-between border-b border-slate-50 pb-8">
            <h2 className="text-2xl font-bold font-serif text-slate-900 italic">Actividad Reciente</h2>
          </div>
          
          <div className="space-y-6">
             {recentActivity.map((act, i) => (
                <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-slate-50/50 hover:bg-white transition-all cursor-pointer border border-transparent hover:border-slate-100">
                   <div className="flex items-center gap-6">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                        act.type === 'PAYMENT' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'
                      }`}>
                         {act.type === 'PAYMENT' ? <DollarSign className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
                      </div>
                      <div className="space-y-0.5">
                         <p className="text-sm font-bold text-slate-800">{act.text}</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{act.date}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-8">
                      {'amount' in act && <p className="text-sm font-bold text-emerald-600 font-mono">+{formatCurrency(act.amount || 0)}</p>}
                      <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-widest px-2 py-0 border-0 bg-slate-100">{act.status}</Badge>
                      <ChevronRight className="h-5 w-5 text-slate-200" />
                   </div>
                </div>
             ))}
          </div>
        </Card>

        {/* Reminders / Notes Section */}
        <Card className="border-none shadow-sm bg-white rounded-[2.5rem] p-10 space-y-8 flex flex-col h-full">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold font-serif text-slate-900 italic">Recordatorios</h2>
            <Badge className="bg-primary/10 text-primary border-none">{notesData?.allDashboardNotes?.length || 0}</Badge>
          </div>

          <form onSubmit={handleAddNote} className="relative group">
            <input 
              type="text" 
              placeholder="Nueva nota rápida..." 
              className="w-full pl-4 pr-12 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
              <Plus className="h-4 w-4" />
            </button>
          </form>

          <div className="flex-1 space-y-4 overflow-y-auto max-h-[400px] pr-2">
            {notesData?.allDashboardNotes?.map((note: any) => (
              <div key={note.id} className="group flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-50 hover:border-slate-100 hover:shadow-sm transition-all">
                <button 
                  onClick={() => toggleNote({ variables: { id: parseInt(note.id) } })}
                  className={`mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    note.isCompleted ? 'bg-primary border-primary text-white' : 'border-slate-200 hover:border-primary'
                  }`}
                >
                  {note.isCompleted && <CheckCircle2 className="h-3 w-3" />}
                </button>
                <div className="flex-1">
                  <p className={`text-sm font-medium transition-all ${note.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                    {note.text}
                  </p>
                </div>
                <button 
                  onClick={() => deleteNote({ variables: { id: parseInt(note.id) } })}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 transition-all"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            ))}

            {(!notesData?.allDashboardNotes || notesData?.allDashboardNotes.length === 0) && (
              <div className="flex flex-col items-center justify-center py-10 text-slate-300 space-y-3">
                <Clock className="h-8 w-8 opacity-20" />
                <p className="text-xs italic font-medium">No hay tareas pendientes</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
