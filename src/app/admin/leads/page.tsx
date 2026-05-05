"use client";

import { useState, useMemo } from "react";
import {
  Users,
  Search,
  Filter,
  Plus,
  MessageCircle,
  Phone,
  Mail,
  ChevronRight,
  Clock,
  Star,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Hourglass,
  MoreVertical,
  Send,
  RefreshCw,
  StickyNote,
  TrendingUp,
  X,
  Loader2,
  ExternalLink,
  Instagram,
  Globe,
  Tag,
  GraduationCap
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MOCK_LEADS,
  EVOLUTION_API_CONFIG,
  WA_TEMPLATES,
  serviceLabel,
  sourceLabel,
  statusLabel,
  type Lead as MockLead,
  type LeadStatus,
  type LeadService,
  type LeadSource
} from "@/lib/mock-data";
import { apiClient } from "@/lib/api-client";
import { useQuery, useMutation } from "@apollo/client/react/index.js";
import { GET_LEADS } from "@/graphql/queries/get-leads";
import { CREATE_LEAD, CONVERT_LEAD_TO_STUDENT, UPDATE_LEAD_STATUS } from "@/graphql/mutations/lead-mutations";

// ─── CONFIG ─────────────────────────────────────────────────
const PIPELINE_COLUMNS: { status: LeadStatus; color: string; bg: string; icon: React.ElementType; dot: string }[] = [
  { status: 'NUEVO',               color: 'text-sky-700',     bg: 'bg-sky-50',      icon: Star,         dot: 'bg-sky-400'    },
  { status: 'CONTACTADO',          color: 'text-violet-700',  bg: 'bg-violet-50',   icon: Phone,        dot: 'bg-violet-400' },
  { status: 'SEGUIMIENTO',         color: 'text-amber-700',   bg: 'bg-amber-50',    icon: RefreshCw,    dot: 'bg-amber-400'  },
  { status: 'PRE_RESERVA',         color: 'text-orange-700',  bg: 'bg-orange-50',   icon: Hourglass,    dot: 'bg-orange-400' },
  { status: 'RESERVA_CONFIRMADA',  color: 'text-emerald-700', bg: 'bg-emerald-50',  icon: CheckCircle2, dot: 'bg-emerald-400'},
  { status: 'CONCRETADO',          color: 'text-green-900',   bg: 'bg-green-100',   icon: TrendingUp,   dot: 'bg-green-500'  },
  { status: 'SIN_RESPUESTA',       color: 'text-slate-500',   bg: 'bg-slate-50',    icon: AlertCircle,  dot: 'bg-slate-300'  },
  { status: 'LISTA_ESPERA',        color: 'text-indigo-700',  bg: 'bg-indigo-50',   icon: Clock,        dot: 'bg-indigo-400' },
  { status: 'NO_CONCRETADO',       color: 'text-rose-700',    bg: 'bg-rose-50',     icon: XCircle,      dot: 'bg-rose-400'   }
];

// Columnas visibles en el kanban principal (las activas)
const KANBAN_COLUMNS: LeadStatus[] = ['NUEVO', 'CONTACTADO', 'SEGUIMIENTO', 'PRE_RESERVA', 'RESERVA_CONFIRMADA'];

const SOURCE_ICONS: Record<LeadSource, React.ElementType> = {
  WEB: Globe,
  WHATSAPP: MessageCircle,
  INSTAGRAM: Instagram,
  REFERIDO: Star,
  GOOGLE: Globe,
  OTRO: Tag
};

// ─── EVOLUTION API ───────────────────────────────────────────
async function sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
  try {
    const { instanceName } = EVOLUTION_API_CONFIG;
    const res = await apiClient.evolution(`/message/sendText/${instanceName}`, 'POST', { number: phone, text: message });
    return !!res.key; // Evolution returns a key on success
  } catch (err) {
    console.error('Evolution API error:', err);
    return false;
  }
}

// ─── COMPONENT ──────────────────────────────────────────────
export default function AdminLeadsPage() {
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<LeadSource | 'ALL'>('ALL');
  const [serviceFilter, setServiceFilter] = useState<LeadService | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'KANBAN' | 'LIST'>('KANBAN');
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [isSendingWA, setIsSendingWA] = useState(false);
  const [waSuccess, setWaSuccess] = useState<string | null>(null);
  const [activeTemplate, setActiveTemplate] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState<'GESTION' | 'CHAT'>('GESTION');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  const [newLead, setNewLead] = useState({ 
    nombre: '', 
    telefono: '', 
    email: '', 
    edad: '', 
    servicio: 'CLASE_PRUEBA' as LeadService, 
    fuente: 'WEB' as LeadSource 
  });

  // ── GraphQL Hooks ───────────────────────────────────────────
  const { data, loading, refetch } = useQuery(GET_LEADS);
  const [createLeadMutation, { loading: isCreating }] = useMutation(CREATE_LEAD, {
    onCompleted: () => {
      toast.success("Lead creado exitosamente 🎻");
      setIsNewLeadOpen(false);
      setNewLead({ nombre: '', telefono: '', email: '', edad: '', servicio: 'CLASE_PRUEBA', fuente: 'WEB' });
      refetch();
    }
  });

  const [updateStatusMutation] = useMutation(UPDATE_LEAD_STATUS, {
    onCompleted: () => {
      toast.success("Estado actualizado");
      refetch();
    }
  });

  const [convertMutation, { loading: isConverting }] = useMutation(CONVERT_LEAD_TO_STUDENT, {
    onCompleted: () => {
      toast.success("¡Alumno creado! Ya puedes asignarle un Pack.");
      setIsDetailOpen(false);
      refetch();
    }
  });

  const leads = data?.allLeads || [];

  // ─── CHAT FETCHING ─────────────────────────────────────────
  const fetchChatHistory = async (phone: string) => {
    setIsLoadingChat(true);
    try {
      const { instanceName } = EVOLUTION_API_CONFIG;
      const data = await apiClient.evolution(`/chat/findMessages/${instanceName}`, 'POST', {
        where: {
          key: {
            remoteJid: `${phone}@s.whatsapp.net`
          }
        },
        limit: 30
      });
      const messages = Array.isArray(data) ? data : (data.records || []);
      const sorted = messages.sort((a: any, b: any) => 
        (a.messageTimestamp || 0) - (b.messageTimestamp || 0)
      );
      setChatMessages(sorted);
    } catch (err) {
      console.error('Error fetching chat:', err);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const filtered = useMemo(() => {
    return leads.filter((l: any) => {
      const matchSearch = l.nombre.toLowerCase().includes(search.toLowerCase()) ||
        l.telefono.includes(search);
      const matchSource = sourceFilter === 'ALL' || l.fuente === sourceFilter;
      const matchService = serviceFilter === 'ALL' || l.servicio === serviceFilter;
      return matchSearch && matchSource && matchService;
    });
  }, [leads, search, sourceFilter, serviceFilter]);

  const leadsByStatus = useMemo(() => {
    const map: Record<LeadStatus, any[]> = {} as any;
    PIPELINE_COLUMNS.forEach(col => {
      map[col.status] = filtered.filter((l: any) => l.estado === col.status);
    });
    return map;
  }, [filtered]);

  const stats = useMemo(() => ({
    total: leads.length,
    nuevos: leads.filter((l: any) => l.estado === 'NUEVO').length,
    preReservas: leads.filter((l: any) => l.estado === 'PRE_RESERVA').length,
    concretados: leads.filter((l: any) => l.estado === 'CONCRETADO').length,
    conversion: leads.length > 0 ? Math.round((leads.filter((l: any) => l.estado === 'CONCRETADO').length / leads.length) * 100) : 0
  }), [leads]);

  // ─── HANDLERS ────────────────────────────────────────────

  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    updateStatusMutation({ variables: { leadId, status: newStatus } });
  };

  const handleAddNote = () => {
    toast.info("Función de notas reales próximamente");
  };

  const handleSendWA = async () => {
    if (!selectedLead || !customMessage.trim()) return;
    setIsSendingWA(true);
    const ok = await sendWhatsAppMessage(selectedLead.telefono, customMessage);
    setIsSendingWA(false);
    if (ok) {
      setWaSuccess('Mensaje enviado correctamente ✅');
      // Auto-advance status if NUEVO → CONTACTADO
      if (selectedLead.estado === 'NUEVO') {
        handleStatusChange(selectedLead.id, 'CONTACTADO');
      }
      refetch();
      setTimeout(() => {
        setWaSuccess(null);
        setCustomMessage('');
        setActiveTemplate('');
      }, 3000);
    } else {
      setWaSuccess('❌ Error al enviar. Verifica que Evolution API esté corriendo en localhost:8080');
      setTimeout(() => setWaSuccess(null), 4000);
    }
  };

  const applyTemplate = (key: string) => {
    if (!selectedLead) return;
    setActiveTemplate(key);
    const svc = serviceLabel[selectedLead.servicio as LeadService] || "Clase";
    const templates: Record<string, string> = {
      RESPUESTA_INICIAL: WA_TEMPLATES.RESPUESTA_INICIAL(selectedLead.nombre.split(' ')[0], svc),
      INFO_PACKS: WA_TEMPLATES.INFO_PACKS(selectedLead.nombre.split(' ')[0]),
      PRE_RESERVA: WA_TEMPLATES.PRE_RESERVA(selectedLead.nombre.split(' ')[0], 'la fecha acordada', 'el horario acordado', 'la profesora'),
      RECORDATORIO_PAGO: WA_TEMPLATES.RECORDATORIO_PAGO(selectedLead.nombre.split(' ')[0], '$60.000'),
      SEGUIMIENTO: WA_TEMPLATES.SEGUIMIENTO(selectedLead.nombre.split(' ')[0]),
      LIBERACION_CUPO: WA_TEMPLATES.LIBERACION_CUPO(selectedLead.nombre.split(' ')[0])
    };
    setCustomMessage(templates[key] || '');
  };

  const handleConvertToStudent = async () => {
    if (!selectedLead) return;
    convertMutation({ variables: { leadId: selectedLead.id } });
  };

  const handleCreateLead = () => {
    if (!newLead.nombre || !newLead.telefono) return;
    createLeadMutation({
      variables: {
        nombre: newLead.nombre,
        telefono: newLead.telefono,
        email: newLead.email,
        servicio: newLead.servicio,
        fuente: newLead.fuente
      }
    });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const getColConfig = (status: LeadStatus) =>
    PIPELINE_COLUMNS.find(c => c.status === status)!;

  // ─── RENDER ──────────────────────────────────────────────
  return (
    <div className="p-8 lg:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
            <TrendingUp className="h-3 w-3" /> CRM Comercial
          </div>
          <h1 className="text-3xl font-bold font-serif tracking-tight">Prospectos & Leads</h1>
          <p className="text-slate-500 italic text-sm">Pipeline de ventas con integración WhatsApp vía Evolution API.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex gap-1 bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
            <Button variant={viewMode === 'KANBAN' ? 'default' : 'ghost'} onClick={() => setViewMode('KANBAN')} className={`h-9 px-4 font-bold uppercase text-[10px] tracking-widest transition-all rounded-xl ${viewMode === 'KANBAN' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>Kanban</Button>
            <Button variant={viewMode === 'LIST' ? 'default' : 'ghost'} onClick={() => setViewMode('LIST')} className={`h-9 px-4 font-bold uppercase text-[10px] tracking-widest transition-all rounded-xl ${viewMode === 'LIST' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>Lista</Button>
          </div>
          <Button
            onClick={() => setIsNewLeadOpen(true)}
            size="lg"
            className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-12 px-8 font-bold uppercase tracking-[0.1em] group rounded-2xl"
          >
            <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" /> Nuevo Lead
          </Button>
        </div>
      </header>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Leads', value: stats.total, color: 'text-slate-900', bg: 'bg-white' },
          { label: 'Nuevos Hoy', value: stats.nuevos, color: 'text-sky-700', bg: 'bg-sky-50' },
          { label: 'Pre-Reservas', value: stats.preReservas, color: 'text-orange-700', bg: 'bg-orange-50' },
          { label: 'Concretados', value: stats.concretados, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Conversión', value: `${stats.conversion}%`, color: 'text-primary', bg: 'bg-primary/5' }
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} border border-slate-100/80 rounded-3xl p-6 shadow-sm`}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{stat.label}</p>
            <p className={`text-3xl font-bold font-serif ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <div className="relative w-full sm:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text" placeholder="Buscar por nombre o teléfono..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-11 px-4 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600 outline-none cursor-pointer"
          value={sourceFilter} onChange={e => setSourceFilter(e.target.value as any)}
        >
          <option value="ALL">Todas las fuentes</option>
          {(['WEB', 'WHATSAPP', 'INSTAGRAM', 'REFERIDO', 'GOOGLE', 'OTRO'] as LeadSource[]).map(s => (
            <option key={s} value={s}>{sourceLabel[s]}</option>
          ))}
        </select>
        <select
          className="h-11 px-4 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600 outline-none cursor-pointer"
          value={serviceFilter} onChange={e => setServiceFilter(e.target.value as any)}
        >
          <option value="ALL">Todos los servicios</option>
          {(['PIANO_NINOS', 'PIANO_ADULTOS', 'CANTO', 'CLASE_GRUPAL', 'CLASE_PRUEBA'] as LeadService[]).map(s => (
            <option key={s} value={s}>{serviceLabel[s]}</option>
          ))}
        </select>
        <div className="ml-auto text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {filtered.length} resultados
        </div>
      </div>

      {/* ── KANBAN VIEW ── */}
      {viewMode === 'KANBAN' && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {KANBAN_COLUMNS.map(status => {
              const config = getColConfig(status);
              const Icon = config.icon;
              const colLeads = leadsByStatus[status] || [];
              return (
                <div key={status} className="w-72 flex-shrink-0">
                  <div className={`flex items-center justify-between px-4 py-3 ${config.bg} rounded-2xl mb-3 border border-black/5`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${config.dot}`} />
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${config.color}`}>
                        {statusLabel[status]}
                      </span>
                    </div>
                    <Badge variant="secondary" className={`text-[10px] font-bold ${config.bg} ${config.color} border-0`}>
                      {colLeads.length}
                    </Badge>
                  </div>

                  <div className="space-y-3 min-h-[200px]">
                    {loading ? (
                       <div className="py-10 text-center text-slate-300 italic text-xs">Cargando leads...</div>
                    ) : colLeads.map((lead: any) => {
                      const SrcIcon = SOURCE_ICONS[lead.fuente as LeadSource] || Tag;
                      return (
                        <div
                          key={lead.id}
                          onClick={() => { setSelectedLead(lead); setIsDetailOpen(true); setCustomMessage(''); setActiveTemplate(''); }}
                          className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-bold text-slate-900 text-sm leading-tight">{lead.nombre}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{serviceLabel[lead.servicio]}</p>
                            </div>
                            <div className="flex items-center gap-1 text-slate-300">
                              <SrcIcon className="h-3.5 w-3.5" />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <Phone className="h-3 w-3" />
                              <span className="text-[11px] font-mono">+{lead.telefono.slice(0, 2)} {lead.telefono.slice(2)}</span>
                            </div>
                            {lead.preReservaExpira && lead.estado === 'PRE_RESERVA' && (
                              <Badge className="bg-orange-50 text-orange-700 text-[8px] font-bold uppercase tracking-widest border-0 px-2 py-1 animate-pulse">
                                ⏰ Vence 20:00
                              </Badge>
                            )}
                          </div>

                          {lead.notas.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-50">
                              <p className="text-[10px] text-slate-400 italic line-clamp-2">{lead.notas[lead.notas.length - 1].texto}</p>
                            </div>
                          )}

                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">
                              {formatDate(lead.fechaIngreso)}
                            </span>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setSelectedLead(lead);
                                setIsDetailOpen(true);
                                applyTemplate('RESPUESTA_INICIAL');
                              }}
                              className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-emerald-600 hover:text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-50 px-2 py-1 rounded-lg"
                            >
                              <MessageCircle className="h-3 w-3" /> WA
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Columnas colapsadas (Concretado, Sin Respuesta, etc.) */}
            <div className="w-48 flex-shrink-0 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 px-2 mb-4">Otros estados</p>
              {(['CONCRETADO', 'SIN_RESPUESTA', 'NO_CONCRETADO', 'LISTA_ESPERA'] as LeadStatus[]).map(status => {
                const config = getColConfig(status);
                const count = (leadsByStatus[status] || []).length;
                if (count === 0) return null;
                return (
                  <div key={status} className={`flex items-center justify-between px-4 py-3 ${config.bg} rounded-2xl border border-black/5`}>
                    <span className={`text-[10px] font-bold uppercase tracking-tighter ${config.color}`}>{statusLabel[status]}</span>
                    <Badge className={`text-[10px] font-bold ${config.color} ${config.bg} border-0`}>{count}</Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {viewMode === 'LIST' && (
        <Card className="border-none shadow-sm overflow-hidden bg-white rounded-3xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Prospecto</th>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Servicio</th>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Fuente</th>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Estado</th>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Ingresó</th>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                   <tr><td colSpan={6} className="py-20 text-center text-slate-300 italic">Cargando base de datos...</td></tr>
                ) : filtered.map((lead: any) => {
                  const config = getColConfig(lead.estado as LeadStatus);
                  const SrcIcon = SOURCE_ICONS[lead.fuente as LeadSource] || Tag;
                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => { setSelectedLead(lead); setIsDetailOpen(true); }}>
                      <td className="px-8 py-5">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{lead.nombre}</p>
                          <p className="text-[11px] text-slate-400 font-mono">+{lead.telefono.slice(0, 2)} {lead.telefono.slice(2)}</p>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <Badge variant="outline" className="border-slate-100 text-slate-500 font-bold text-[9px] uppercase tracking-widest">
                          {serviceLabel[lead.servicio]}
                        </Badge>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-slate-400">
                          <SrcIcon className="h-4 w-4" />
                          <span className="text-xs font-bold uppercase tracking-widest">{sourceLabel[lead.fuente]}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <Badge className={`font-bold uppercase text-[9px] tracking-widest px-3 py-1 border-0 ${config.bg} ${config.color}`}>
                          {statusLabel[lead.estado]}
                        </Badge>
                      </td>
                      <td className="px-8 py-5 text-xs text-slate-400 italic">{formatDate(lead.fechaIngreso)}</td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={e => { e.stopPropagation(); setSelectedLead(lead); setIsDetailOpen(true); applyTemplate('RESPUESTA_INICIAL'); }}
                            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-xl transition-colors"
                          >
                            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── LEAD DETAIL DRAWER ── */}
      {isDetailOpen && selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right-8 duration-400 flex flex-col">

            {/* Drawer Header */}
            <div className="bg-slate-900 text-white p-8 relative flex-shrink-0">
              <button onClick={() => setIsDetailOpen(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors">
                <X className="h-5 w-5" />
              </button>
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Ficha de Prospecto</p>
                <h2 className="text-2xl font-bold font-serif">{selectedLead.nombre}</h2>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge className={`text-[9px] font-bold uppercase tracking-widest border-0 ${getColConfig(selectedLead.estado).bg} ${getColConfig(selectedLead.estado).color}`}>
                    {statusLabel[selectedLead.estado]}
                  </Badge>
                  <Badge className="bg-white/10 text-white/70 text-[9px] font-bold uppercase tracking-widest border-0">
                    {serviceLabel[selectedLead.servicio]}
                  </Badge>
                  <Badge className="bg-white/10 text-white/70 text-[9px] font-bold uppercase tracking-widest border-0">
                    {sourceLabel[selectedLead.fuente]}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
              
              {/* Tabs Navbar */}
              <div className="flex bg-slate-50 border-b border-slate-100 p-1 shrink-0">
                <button 
                  onClick={() => setActiveDrawerTab('GESTION')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${
                    activeDrawerTab === 'GESTION' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                   <StickyNote className="h-3.5 w-3.5" /> Gestión
                </button>
                <button 
                  onClick={() => {
                    setActiveDrawerTab('CHAT');
                    if (selectedLead) fetchChatHistory(selectedLead.telefono);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${
                    activeDrawerTab === 'CHAT' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                   <MessageCircle className="h-3.5 w-3.5" /> Chat WhatsApp
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/30">

                {/* ── TAB: GESTION ── */}
                {activeDrawerTab === 'GESTION' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    {/* Contact Info */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Contacto</p>
                      <div className="flex items-center gap-3 text-sm text-slate-700">
                        <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                          <Phone className="h-4 w-4" />
                        </div>
                        <span className="font-mono font-bold">+{selectedLead.telefono.slice(0, 2)} {selectedLead.telefono.slice(2)}</span>
                        <a
                          href={`https://wa.me/${selectedLead.telefono}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-auto text-[9px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" /> Abrir WA Web
                        </a>
                      </div>
                      {selectedLead.email && (
                        <div className="flex items-center gap-3 text-sm text-slate-700">
                          <div className="h-8 w-8 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                            <Mail className="h-4 w-4" />
                          </div>
                          <span>{selectedLead.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Change Status */}
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Acciones de Pipeline</p>
                      <div className="grid grid-cols-3 gap-2">
                        {PIPELINE_COLUMNS.map(col => (
                          <button
                            key={col.status}
                            onClick={() => handleStatusChange(selectedLead.id, col.status)}
                            className={`px-3 py-2.5 rounded-xl text-[8px] font-bold uppercase tracking-widest transition-all border ${
                              selectedLead.estado === col.status
                                ? `${col.bg} ${col.color} border-current ring-1 ring-offset-0 ring-current`
                                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200 shadow-sm'
                            }`}
                          >
                            {statusLabel[col.status]}
                          </button>
                        ))}
                      </div>
                      
                      {selectedLead.estado === 'RESERVA_CONFIRMADA' && (
                        <Button 
                          onClick={handleConvertToStudent}
                          disabled={isConverting}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase text-[10px] tracking-widest h-12 rounded-2xl shadow-xl shadow-slate-200"
                        >
                          {isConverting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registrando...</> : <><GraduationCap className="mr-2 h-4 w-4" /> Concretar Venta (Pasar a Alumno)</>}
                        </Button>
                      )}
                    </div>

                    {/* WhatsApp Fast Panel */}
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <MessageCircle className="h-3 w-3 text-emerald-500" /> Respuestas Rápidas (WA)
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {[
                          { key: 'RESPUESTA_INICIAL', label: 'Respuesta inicial' },
                          { key: 'INFO_PACKS', label: 'Info Packs' },
                          { key: 'PRE_RESERVA', label: 'Pre-Reserva' },
                          { key: 'RECORDATORIO_PAGO', label: 'Recordatorio pago' },
                        ].map(t => (
                          <button
                            key={t.key}
                            onClick={() => applyTemplate(t.key)}
                            className={`text-[8px] font-bold uppercase tracking-widest px-3 py-2 rounded-xl border transition-all ${
                              activeTemplate === t.key
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20'
                                : 'border-slate-100 text-slate-500 hover:border-emerald-300 hover:text-emerald-700 bg-white shadow-sm'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>

                      <div className="relative">
                        <textarea
                          rows={4}
                          placeholder="Escribe o selecciona una plantilla..."
                          className="w-full text-sm text-slate-700 bg-white rounded-2xl border border-slate-200 p-4 resize-none focus:ring-2 focus:ring-emerald-400/30 outline-none font-medium leading-relaxed shadow-inner"
                          value={customMessage}
                          onChange={e => setCustomMessage(e.target.value)}
                        />
                      </div>

                      {waSuccess && (
                        <div className={`text-xs font-bold px-4 py-3 rounded-xl border ${waSuccess.startsWith('❌') ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                          {waSuccess}
                        </div>
                      )}

                      <Button
                        onClick={handleSendWA}
                        disabled={!customMessage.trim() || isSendingWA}
                        className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-500/10 disabled:opacity-40"
                      >
                        {isSendingWA ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</>
                        ) : (
                          <><Send className="mr-2 h-4 w-4" /> Enviar Mensaje</>
                        )}
                      </Button>
                    </div>

                    {/* Notes Section moved down */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Auditoría & Notas ({selectedLead.notas.length})</p>
                        {!isAddingNote && (
                          <button onClick={() => setIsAddingNote(true)} className="text-[9px] font-bold uppercase text-primary tracking-widest">Añadir Nota</button>
                        )}
                      </div>
                      
                      {isAddingNote && (
                        <div className="space-y-2 animate-in slide-in-from-top-2 duration-300 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                           <textarea
                            rows={3}
                            placeholder="Añada información importante aquí..."
                            autoFocus
                            className="w-full text-xs text-slate-700 bg-slate-50 rounded-xl border-none p-4 resize-none focus:ring-0 outline-none"
                            value={newNote}
                            onChange={e => setNewNote(e.target.value)}
                          />
                          <div className="flex gap-2">
                             <Button variant="ghost" size="sm" className="flex-1 text-[9px] font-bold uppercase" onClick={() => setIsAddingNote(false)}>Cancelar</Button>
                             <Button size="sm" className="flex-1 bg-slate-900 text-white text-[9px] font-bold uppercase rounded-xl" onClick={handleAddNote}>Guardar</Button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-3">
                         {[...selectedLead.notas].reverse().slice(0, 3).map(n => (
                           <div key={n.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                              <p className="text-xs text-slate-600 leading-relaxed">{n.texto}</p>
                              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                                 <span className="text-[8px] font-bold uppercase tracking-widest text-slate-300">{n.autor}</span>
                                 <span className="text-[8px] text-slate-300 italic">{formatDate(n.fecha)}</span>
                              </div>
                           </div>
                         ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB: CHAT ── */}
                {activeDrawerTab === 'CHAT' && (
                   <div className="flex flex-col h-full animate-in fade-in slide-in-from-left-4 duration-300">
                      <header className="flex items-center justify-between mb-6 px-2">
                         <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 italic">Conectado a Evolution API</span>
                         </div>
                         <Button 
                           variant="ghost" 
                           size="sm" 
                           onClick={() => fetchChatHistory(selectedLead.telefono)}
                           disabled={isLoadingChat}
                           className="h-8 text-[9px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5"
                         >
                            {isLoadingChat ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <RefreshCw className="h-3 w-3 mr-2" />}
                            Refrescar Chat
                         </Button>
                      </header>

                      {isLoadingChat && chatMessages.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-20">
                           <Loader2 className="h-8 w-8 text-primary animate-spin" />
                           <p className="text-sm text-slate-400 italic">Recuperando conversación...</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                           {chatMessages.length === 0 ? (
                             <div className="text-center py-20 bg-slate-100/50 rounded-3xl border-2 border-dashed border-slate-200">
                                <MessageCircle className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                                <p className="text-sm text-slate-400 italic">No hay historial previo registrado en la API.</p>
                                <Button variant="link" className="text-xs text-primary mt-2" onClick={() => applyTemplate('RESPUESTA_INICIAL')}>Enviar primer mensaje</Button>
                             </div>
                           ) : (
                             chatMessages.map((msg: any, i: number) => {
                               const fromMe = msg.key?.fromMe;
                               const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "[Archivo/Imagen]";
                               const timestamp = msg.messageTimestamp ? new Date(msg.messageTimestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";
                               
                               return (
                                 <div key={msg.key?.id || i} className={`flex ${fromMe ? 'justify-end' : 'justify-start'} group animate-in slide-in-from-bottom-2 duration-300`}>
                                    <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm shadow-sm relative ${
                                      fromMe 
                                        ? 'bg-emerald-600 text-white rounded-tr-none' 
                                        : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                                    }`}>
                                       <p className="leading-relaxed font-medium">{text}</p>
                                       <span className={`text-[8px] mt-1 block text-right font-bold ${fromMe ? 'text-emerald-100/70' : 'text-slate-300'}`}>
                                          {timestamp}
                                       </span>
                                    </div>
                                 </div>
                               );
                             })
                           )}
                        </div>
                      )}

                      {/* Floating composer if on chat tab */}
                      <div className="mt-8 bg-white p-4 rounded-3xl border border-slate-200 shadow-xl space-y-3">
                         <div className="flex gap-2">
                           <input 
                             type="text" 
                             placeholder="Respuesta rápida..."
                             className="flex-1 bg-slate-50 border-none rounded-xl px-4 text-sm outline-none focus:ring-1 focus:ring-emerald-400"
                             value={customMessage}
                             onChange={e => setCustomMessage(e.target.value)}
                             onKeyDown={e => e.key === 'Enter' && handleSendWA()}
                           />
                           <Button 
                             onClick={handleSendWA} 
                             disabled={!customMessage.trim() || isSendingWA}
                             size="icon" 
                             className="bg-emerald-600 rounded-xl h-10 w-10 shadow-lg shadow-emerald-500/20"
                           >
                              {isSendingWA ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                           </Button>
                         </div>
                         <div className="flex gap-1">
                            {['INFO_PACKS', 'RECORDATORIO_PAGO'].map(k => (
                              <button key={k} onClick={() => applyTemplate(k)} className="text-[8px] font-bold uppercase tracking-widest text-slate-400 hover:text-emerald-600 px-2 py-1">{k.replace('_', ' ')}</button>
                            ))}
                         </div>
                      </div>
                   </div>
                )}

              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── NEW LEAD MODAL ── */}
      {isNewLeadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <Card className="w-full max-w-lg bg-white border-none shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-400 rounded-[2.5rem]">
            <div className="bg-slate-900 p-8 text-white">
              <h3 className="text-2xl font-bold font-serif">Nuevo Prospecto</h3>
              <p className="text-slate-400 italic text-sm mt-1">Registra manualmente un nuevo lead.</p>
            </div>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nombre Completo *</label>
                  <input type="text" placeholder="Ej. María González" className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20" value={newLead.nombre} onChange={e => setNewLead({...newLead, nombre: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Teléfono WA * (sin +)</label>
                  <input type="text" placeholder="56912345678" className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-mono outline-none focus:ring-2 focus:ring-primary/20" value={newLead.telefono} onChange={e => setNewLead({...newLead, telefono: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Edad</label>
                  <input type="number" placeholder="Ej. 28" className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20" value={newLead.edad} onChange={e => setNewLead({...newLead, edad: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email</label>
                  <input type="email" placeholder="correo@ejemplo.com" className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20" value={newLead.email} onChange={e => setNewLead({...newLead, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Servicio</label>
                  <select className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-xs font-bold uppercase tracking-widest outline-none" value={newLead.servicio} onChange={e => setNewLead({...newLead, servicio: e.target.value as LeadService})}>
                    {(['PIANO_NINOS', 'PIANO_ADULTOS', 'CANTO', 'CLASE_GRUPAL', 'CLASE_PRUEBA'] as LeadService[]).map(s => <option key={s} value={s}>{serviceLabel[s]}</option>)}
                  </select>
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Fuente</label>
                  <select className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-xs font-bold uppercase tracking-widest outline-none" value={newLead.fuente} onChange={e => setNewLead({...newLead, fuente: e.target.value as LeadSource})}>
                    {(['WEB', 'WHATSAPP', 'INSTAGRAM', 'REFERIDO', 'GOOGLE', 'OTRO'] as LeadSource[]).map(s => <option key={s} value={s}>{sourceLabel[s]}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-2">
                <Button variant="outline" className="flex-1 h-12 rounded-2xl text-slate-600 border-slate-200 font-bold uppercase text-[10px] tracking-widest" onClick={() => setIsNewLeadOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreateLead} disabled={!newLead.nombre || !newLead.telefono} className="flex-1 h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 disabled:opacity-40">
                  Crear Lead
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
