"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@apollo/client/react/index.js";
import { GET_REPORTS_DATA } from "@/graphql/queries/get-reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  ArrowUpRight, 
  Filter,
  Download,
  Loader2,
  CheckCircle2,
  Share2,
  Target,
  Sparkles
} from "lucide-react";
import { format, parseISO, isSameMonth, isSameWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";

const SERVICE_LABELS: Record<string, string> = {
  PIANO_NINOS: "Piano Niños",
  PIANO_ADULTOS: "Piano Adultos",
  CANTO: "Canto",
  CLASE_GRUPAL: "Clase Grupal",
  CLASE_PRUEBA: "Clase de Prueba",
};

const SOURCE_LABELS: Record<string, string> = {
  WEB: "Sitio Web",
  WHATSAPP: "WhatsApp",
  INSTAGRAM: "Instagram",
  REFERIDO: "Referido / Recomendación",
  GOOGLE: "Google Search",
  OTRO: "Otro",
};

export default function AdminReportsPage() {
  const [period, setPeriod] = useState<'ALL' | 'MONTH' | 'WEEK'>('ALL');
  const { data, loading, refetch } = useQuery<any>(GET_REPORTS_DATA);

  const rawLeads = data?.allLeads || [];
  const rawPayments = data?.allPayments || [];
  const rawLessons = data?.allLessons || [];
  const rawStudents = data?.allStudents || [];

  const now = new Date();

  // Filter data by period
  const filteredData = useMemo(() => {
    let leads = rawLeads;
    let payments = rawPayments;
    let lessons = rawLessons;

    if (period === 'MONTH') {
      leads = leads.filter((l: any) => l.fechaIngreso && isSameMonth(parseISO(l.fechaIngreso), now));
      payments = payments.filter((p: any) => p.paymentDate && isSameMonth(parseISO(p.paymentDate), now));
      lessons = lessons.filter((l: any) => l.date && isSameMonth(parseISO(l.date), now));
    } else if (period === 'WEEK') {
      leads = leads.filter((l: any) => l.fechaIngreso && isSameWeek(parseISO(l.fechaIngreso), now, { weekStartsOn: 1 }));
      payments = payments.filter((p: any) => p.paymentDate && isSameWeek(parseISO(p.paymentDate), now, { weekStartsOn: 1 }));
      lessons = lessons.filter((l: any) => l.date && isSameWeek(parseISO(l.date), now, { weekStartsOn: 1 }));
    }

    return { leads, payments, lessons };
  }, [rawLeads, rawPayments, rawLessons, period]);

  const { leads, payments, lessons } = filteredData;

  // Key Metrics Calculations
  const metrics = useMemo(() => {
    const totalLeads = leads.length;
    const concretedLeads = leads.filter((l: any) => l.estado === 'CONCRETADO').length;
    const conversionRate = totalLeads > 0 ? Math.round((concretedLeads / totalLeads) * 100) : 0;

    const completedLessons = lessons.filter((l: any) => l.status === 'COMPLETED').length;
    const totalRevenue = payments.reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0);
    const activeStudents = rawStudents.filter((s: any) => s.status === 'ACTIVE').length;

    return {
      totalLeads,
      concretedLeads,
      conversionRate,
      completedLessons,
      totalRevenue,
      activeStudents
    };
  }, [leads, lessons, payments, rawStudents]);

  // Distribution by Service
  const serviceDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l: any) => {
      const s = l.servicio || 'OTRO';
      counts[s] = (counts[s] || 0) + 1;
    });

    const total = leads.length || 1;
    const palette = ["bg-[#70125F]", "bg-[#DFB012]", "bg-indigo-600", "bg-emerald-500", "bg-sky-500"];

    return Object.entries(counts)
      .map(([key, count], idx) => ({
        name: SERVICE_LABELS[key] || key,
        count,
        percentage: Math.round((count / total) * 100),
        color: palette[idx % palette.length]
      }))
      .sort((a, b) => b.count - a.count);
  }, [leads]);

  // Distribution by Source (Channels)
  const sourceDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l: any) => {
      const s = l.fuente || 'OTRO';
      counts[s] = (counts[s] || 0) + 1;
    });

    const total = leads.length || 1;
    return Object.entries(counts)
      .map(([key, count]) => ({
        name: SOURCE_LABELS[key] || key,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [leads]);

  // Activity by Day of Week (Lun-Dom)
  const daysActivity = useMemo(() => {
    const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    // Order from Mon to Sun
    const orderedIndices = [1, 2, 3, 4, 5, 6, 0];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    const lessonCounts = [0, 0, 0, 0, 0, 0, 0];

    leads.forEach((l: any) => {
      if (l.fechaIngreso) {
        const d = getDay(parseISO(l.fechaIngreso));
        dayCounts[d] += 1;
      }
    });

    lessons.forEach((l: any) => {
      if (l.date) {
        const d = getDay(parseISO(l.date));
        lessonCounts[d] += 1;
      }
    });

    return orderedIndices.map(idx => ({
      label: dayNames[idx],
      leads: dayCounts[idx],
      lessons: lessonCounts[idx]
    }));
  }, [leads, lessons]);

  const maxActivity = Math.max(1, ...daysActivity.map(d => Math.max(d.leads, d.lessons)));

  const formatCLP = (n: number) => `$${Math.round(n).toLocaleString('es-CL')}`;

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "REPORTE GENERAL DETACHE ACADEMY\n";
    csvContent += `Periodo: ${period === 'ALL' ? 'Histórico Completo' : period === 'MONTH' ? 'Este Mes' : 'Esta Semana'}\n\n`;

    csvContent += "METRICAS CLAVE\n";
    csvContent += `Leads Totales,${metrics.totalLeads}\n`;
    csvContent += `Leads Concretados,${metrics.concretedLeads}\n`;
    csvContent += `Tasa de Conversion,${metrics.conversionRate}%\n`;
    csvContent += `Clases Realizadas,${metrics.completedLessons}\n`;
    csvContent += `Recaudacion Total,${metrics.totalRevenue}\n`;
    csvContent += `Alumnos Activos,${metrics.activeStudents}\n\n`;

    csvContent += "LISTADO DE LEADS\n";
    csvContent += "ID,Nombre,Servicio,Fuente,Estado,Fecha Ingreso\n";
    leads.forEach((l: any) => {
      csvContent += `${l.id},"${l.nombre}","${l.servicio || ''}","${l.fuente || ''}","${l.estado}","${l.fechaIngreso || ''}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_detache_${format(new Date(), "yyyyMMdd_HHmm")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 text-[#70125F] animate-spin" />
        <p className="text-slate-400 text-xs italic">Generando métricas en tiempo real...</p>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto text-slate-800">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#70125F] font-bold text-xs uppercase tracking-[0.2em] mb-1">
            <TrendingUp className="h-3 w-3" /> Panel de Analítica
          </div>
          <h1 className="text-3xl font-bold font-serif tracking-tight text-slate-900">Métricas y Rendimiento CRM</h1>
          <p className="text-slate-500 italic text-sm">Estadísticas calculadas en tiempo real desde la base de datos de la academia.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Period selector */}
          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
            <button
              onClick={() => setPeriod('WEEK')}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${
                period === 'WEEK' ? 'bg-[#70125F] text-white shadow-sm' : 'text-slate-400 hover:text-slate-900'
              }`}
            >
              Esta Semana
            </button>
            <button
              onClick={() => setPeriod('MONTH')}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${
                period === 'MONTH' ? 'bg-[#70125F] text-white shadow-sm' : 'text-slate-400 hover:text-slate-900'
              }`}
            >
              Este Mes
            </button>
            <button
              onClick={() => setPeriod('ALL')}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${
                period === 'ALL' ? 'bg-[#70125F] text-white shadow-sm' : 'text-slate-400 hover:text-slate-900'
              }`}
            >
              Histórico
            </button>
          </div>

          <Button 
            onClick={handleExportCSV}
            variant="outline" 
            className="rounded-2xl border-slate-200 text-slate-700 hover:bg-slate-50 font-bold uppercase text-[10px] tracking-widest h-11 px-5 flex items-center gap-2"
          >
            <Download className="h-4 w-4 text-[#70125F]" /> Exportar CSV
          </Button>
        </div>
      </header>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Leads */}
        <Card className="border-none shadow-sm bg-white rounded-[2rem] p-6 space-y-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Users className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">
              {metrics.concretedLeads} Alumnos
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Leads Totales</p>
            <p className="text-3xl font-black font-serif text-slate-900 mt-1">{metrics.totalLeads}</p>
          </div>
        </Card>

        {/* Total Revenue */}
        <Card className="border-none shadow-sm bg-slate-900 text-white rounded-[2rem] p-6 space-y-4 relative overflow-hidden group">
          <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4 pointer-events-none">
            <DollarSign className="h-32 w-32" />
          </div>
          <div className="flex justify-between items-start relative z-10">
            <div className="p-3 bg-white/10 text-[#DFB012] rounded-2xl border border-white/10">
              <DollarSign className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#DFB012] bg-[#DFB012]/10 px-2.5 py-1 rounded-lg">
              {payments.length} Pagos
            </span>
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Recaudación Real</p>
            <p className="text-3xl font-black font-serif text-[#DFB012] mt-1">{formatCLP(metrics.totalRevenue)}</p>
          </div>
        </Card>

        {/* Conversion Rate */}
        <Card className="border-none shadow-sm bg-white rounded-[2rem] p-6 space-y-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Target className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" /> CRM
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tasa de Conversión</p>
            <p className="text-3xl font-black font-serif text-slate-900 mt-1">{metrics.conversionRate}%</p>
          </div>
        </Card>

        {/* Classes Completed */}
        <Card className="border-none shadow-sm bg-white rounded-[2rem] p-6 space-y-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <Calendar className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">
              {lessons.length} Agendadas
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Clases Realizadas</p>
            <p className="text-3xl font-black font-serif text-slate-900 mt-1">{metrics.completedLessons}</p>
          </div>
        </Card>

      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Activity Chart */}
        <Card className="lg:col-span-8 border-none shadow-sm bg-white rounded-[2.5rem] p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xl font-bold font-serif text-slate-900">Distribución Semanal de Actividad</h3>
              <p className="text-xs text-slate-400 italic mt-0.5">Volumen de nuevos leads y clases agendadas por día.</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#70125F]" />
                <span className="font-bold text-slate-600 text-[11px]">Leads</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#DFB012]" />
                <span className="font-bold text-slate-600 text-[11px]">Clases</span>
              </div>
            </div>
          </div>

          <div className="h-[280px] w-full flex items-end justify-between gap-3 pt-6">
            {daysActivity.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-1.5 h-[200px]">
                  {/* Leads Bar */}
                  <div 
                    className="w-full max-w-[28px] bg-[#70125F] rounded-t-xl transition-all duration-500 group-hover:opacity-80 relative flex justify-center"
                    style={{ height: `${Math.max(8, (day.leads / maxActivity) * 180)}px` }}
                  >
                    <span className="absolute -top-6 text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      {day.leads}
                    </span>
                  </div>
                  {/* Lessons Bar */}
                  <div 
                    className="w-full max-w-[28px] bg-[#DFB012] rounded-t-xl transition-all duration-500 group-hover:opacity-80 relative flex justify-center"
                    style={{ height: `${Math.max(8, (day.lessons / maxActivity) * 180)}px` }}
                  >
                    <span className="absolute -top-6 text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      {day.lessons}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{day.label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Right: Top Services & Channels */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Services Card */}
          <Card className="border-none shadow-sm bg-white rounded-[2.5rem] p-8 space-y-6">
            <h3 className="text-lg font-bold font-serif text-slate-900 border-b border-slate-100 pb-3">
              Demanda por Servicio
            </h3>

            {serviceDistribution.length === 0 ? (
              <p className="text-xs italic text-slate-400 text-center py-6">Sin registros para el periodo.</p>
            ) : (
              <div className="space-y-4">
                {serviceDistribution.map((service, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-800">{service.name}</span>
                      <span className="text-slate-400">{service.count} ({service.percentage}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${service.color} rounded-full`} style={{ width: `${service.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Sources Card */}
          <Card className="border-none shadow-sm bg-white rounded-[2.5rem] p-8 space-y-6">
            <h3 className="text-lg font-bold font-serif text-slate-900 border-b border-slate-100 pb-3">
              Canales de Captación
            </h3>

            {sourceDistribution.length === 0 ? (
              <p className="text-xs italic text-slate-400 text-center py-6">Sin registros para el periodo.</p>
            ) : (
              <div className="space-y-3">
                {sourceDistribution.map((src, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl text-xs">
                    <div className="flex items-center gap-2">
                      <Share2 className="h-3.5 w-3.5 text-[#70125F]" />
                      <span className="font-bold text-slate-700">{src.name}</span>
                    </div>
                    <span className="font-black font-mono text-[#70125F]">{src.count} leads ({src.percentage}%)</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

        </div>

      </div>

    </div>
  );
}
