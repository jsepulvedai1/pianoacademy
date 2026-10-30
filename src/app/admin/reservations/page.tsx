"use client";

import { useState, useMemo, useEffect } from "react";
import {
  CalendarCheck, Search, Plus, CheckCircle2, XCircle, Clock,
  AlertTriangle, User, Phone, Music, X, MessageCircle,
  Timer, ShieldCheck, Hourglass, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@apollo/client/react/index.js";
import { GET_RESERVATIONS } from "@/graphql/queries/get-reservations";
import { GET_STUDENT_PACKS } from "@/graphql/queries/get-packs";
import { GET_ACTIVE_HOLIDAYS } from "@/graphql/queries/get-holidays";
import { UPDATE_LESSON_STATUS, CREATE_PRE_RESERVATION } from "@/graphql/mutations/lesson-mutations";
import { toast } from "sonner";
import { normalizePhoneNumber } from "@/lib/utils";
import {
  EVOLUTION_API_CONFIG, WA_TEMPLATES,
  serviceLabel, type Reservation, type ReservationStatus, type LeadService
} from "@/lib/mock-data";

const statusConfig: Record<ReservationStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  PRE_RESERVADA: { label: 'Pre-Reservada', color: 'text-orange-700', bg: 'bg-orange-50',  icon: Hourglass },
  CONFIRMADA:    { label: 'Confirmada',   color: 'text-emerald-700', bg: 'bg-emerald-50', icon: CheckCircle2 },
  VENCIDA:       { label: 'Vencida',      color: 'text-slate-500',   bg: 'bg-slate-100',  icon: XCircle },
  CANCELADA:     { label: 'Cancelada',    color: 'text-rose-700',    bg: 'bg-rose-50',    icon: XCircle },
  COMPLETADA:    { label: 'Completada',   color: 'text-sky-700',     bg: 'bg-sky-50',     icon: CheckCircle2 }
};

async function sendWhatsApp(phone: string, message: string) {
  const { baseUrl, apiKey, instanceName } = EVOLUTION_API_CONFIG;
  try {
    const res = await fetch(`${baseUrl}/message/sendText/${instanceName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: apiKey },
      body: JSON.stringify({ number: phone, text: message })
    });
    return res.ok;
  } catch { return false; }
}

// Countdown to 20:00
function useCountdown(expiry?: string) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expiry) return;
    const tick = () => {
      const now = new Date();
      const exp = new Date(expiry);
      const diff = exp.getTime() - now.getTime();
      if (diff <= 0) { setIsExpired(true); setTimeLeft('VENCIDA'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiry]);

  return { timeLeft, isExpired };
}

function CountdownBadge({ expiry }: { expiry?: string }) {
  const { timeLeft, isExpired } = useCountdown(expiry);
  if (!expiry) return null;
  return (
    <Badge className={`text-[9px] font-bold uppercase tracking-widest border-0 font-mono animate-pulse ${isExpired ? 'bg-rose-100 text-rose-700' : 'bg-orange-100 text-orange-700'}`}>
      <Timer className="h-2.5 w-2.5 mr-1" />{isExpired ? 'VENCIDA' : timeLeft}
    </Badge>
  );
}

export default function AdminReservationsPage() {
  const { data, loading, refetch } = useQuery<any>(GET_RESERVATIONS);
  const { data: packsData } = useQuery<any>(GET_STUDENT_PACKS);
  const { data: holidaysData } = useQuery<any>(GET_ACTIVE_HOLIDAYS, { fetchPolicy: "network-only" });
  const [updateStatus] = useMutation(UPDATE_LESSON_STATUS);
  const [activeTab, setActiveTab] = useState<'RESERVATIONS' | 'RENEWALS'>('RESERVATIONS');

  const activeHolidaysMap = useMemo(() => {
    const map = new Map<string, string>();
    (holidaysData?.activeHolidays || []).forEach((h: any) => {
      map.set(h.date, h.name);
    });
    return map;
  }, [holidaysData]);

  const reservations: Reservation[] = useMemo(() => {
    if (!data?.allLessons) return [];
    // Filtramos reservas fantasma sin alumno ni prospecto con nombre válido
    return data.allLessons
      .filter((l: any) => (l.student && l.student.name) || (l.lead && l.lead.nombre))
      .map((l: any) => {
        // Expiration is at 20:00 of the reservation date
        const expiryDate = new Date(`${l.date}T20:00:00`);
        const isPast20 = l.isPreReservation && new Date() > expiryDate;

        const estado: ReservationStatus = 
          l.status === 'COMPLETED' ? 'COMPLETADA' : 
          l.status === 'CANCELLED' ? 'CANCELADA' : 
          l.isPreReservation && isPast20 ? 'VENCIDA' :
          l.isPreReservation ? 'PRE_RESERVADA' : 'CONFIRMADA';

        return {
          id: l.id,
          nombre: l.student?.name || l.lead?.nombre || "Sin Nombre",
          telefono: l.student?.phoneNumber || l.student?.guardianPhone || l.lead?.telefono || "",
          email: l.student?.email || l.lead?.email || "",
          edad: l.lead?.edad,
          apoderadoNombre: l.student?.guardianName || l.lead?.apoderadoNombre || "",
          servicio: (l.lead?.servicio || l.lessonType || 'CLASE_PRUEBA') as LeadService,
          profesorId: l.teacher?.id,
          profesorNombre: l.teacher?.name || "Sin Profesor",
          fecha: l.date,
          hora: l.startTime,
          sala: l.room?.name,
          estado,
          pagoRegistrado: l.status === 'COMPLETED' || (l.status === 'PENDING' && !l.isPreReservation),
          expiraEn: l.isPreReservation ? expiryDate.toISOString() : undefined,
          creadoEn: l.date,
          modalidad: 'PRESENCIAL',
          notas: l.notes,
          aceptoReglamento: true
        } as Reservation;
      });
  }, [data]);

  // Seguimiento de Planes y Packs por renovar (0 o 1 clase restante, o vencimiento próximo)
  const packsForFollowup = useMemo(() => {
    const allPacks = packsData?.allStudentPacks || [];
    const now = new Date();
    return allPacks
      .filter((p: any) => p.student?.name)
      .map((p: any) => {
        const expDate = p.expirationDate ? new Date(p.expirationDate) : null;
        const daysToExpire = expDate ? Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
        const isFinished = (p.remainingClasses ?? 0) <= 0;
        const isLastClass = p.remainingClasses === 1;
        const isExpiringSoon = daysToExpire !== null && daysToExpire <= 7;
        return {
          ...p,
          daysToExpire,
          isFinished,
          isLastClass,
          isExpiringSoon,
          needsFollowup: isFinished || isLastClass || isExpiringSoon
        };
      })
      .filter((p: any) => p.needsFollowup)
      .sort((a: any, b: any) => (a.remainingClasses ?? 0) - (b.remainingClasses ?? 0));
  }, [packsData]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'ALL'>('ALL');
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [waMsg, setWaMsg] = useState<string | null>(null);

  const [newRes, setNewRes] = useState({
    nombre: '', telefono: '', email: '',
    edad: '', apoderadoNombre: '',
    servicio: 'CLASE_PRUEBA' as LeadService,
    profesorNombre: '', fecha: '', hora: '',
    sala: '', modalidad: 'PRESENCIAL' as 'PRESENCIAL' | 'ONLINE',
    aceptoReglamento: false
  });

  const filtered = useMemo(() => reservations.filter(r => {
    const match = r.nombre.toLowerCase().includes(search.toLowerCase()) ||
      r.profesorNombre.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || r.estado === statusFilter;
    return match && matchStatus;
  }), [reservations, search, statusFilter]);

  const stats = useMemo(() => ({
    preReservadas: reservations.filter(r => r.estado === 'PRE_RESERVADA').length,
    confirmadas: reservations.filter(r => r.estado === 'CONFIRMADA').length,
    vencidas: reservations.filter(r => r.estado === 'VENCIDA').length,
    total: reservations.length
  }), [reservations]);

  const handleConfirmar = async (id: string) => {
    try {
      await updateStatus({ variables: { lessonId: parseInt(id), status: 'PENDING' } }); // In backend, confirming pre-res converts it to standard PENDING lesson
      toast.success("Pago registrado y cupo confirmado.");
      refetch();
      setIsDetailOpen(false);
    } catch (e) {
      toast.error("Error al confirmar pago.");
    }
  };

  const handleCancelar = async (id: string) => {
    try {
      await updateStatus({ variables: { lessonId: parseInt(id), status: 'CANCELLED' } });
      toast.success("Cupo liberado.");
      refetch();
      setIsDetailOpen(false);
    } catch (e) {
      toast.error("Error al cancelar.");
    }
  };

  const handleLiberarTodasVencidas = async () => {
    const vencidas = reservations.filter(r => r.estado === 'VENCIDA');
    if (vencidas.length === 0) {
      toast.info("No hay reservas vencidas pendientes de liberación.");
      return;
    }
    if (!confirm(`¿Deseas liberar ${vencidas.length} cupos de reservas vencidas tras las 20:00 hrs?`)) return;
    
    let count = 0;
    for (const r of vencidas) {
      try {
        await updateStatus({ variables: { lessonId: parseInt(r.id), status: 'CANCELLED' } });
        count++;
      } catch (e) {
        console.error(e);
      }
    }
    toast.success(`${count} cupos vencidos liberados correctamente ✅`);
    refetch();
  };

  const handleLiberarManual = async (res: Reservation) => {
    await handleCancelar(res.id);
    if (res.telefono) {
      const msg = WA_TEMPLATES.LIBERACION_CUPO(res.nombre.split(' ')[0]);
      await sendWhatsApp(res.telefono, msg);
    }
  };

  const handleSendConfirmacion = async (res: Reservation) => {
    setIsSending(true);
    const msg = WA_TEMPLATES.CONFIRMACION(res.nombre.split(' ')[0], res.fecha, res.hora);
    const ok = await sendWhatsApp(res.telefono, msg);
    setIsSending(false);
    setWaMsg(ok ? '✅ Confirmación enviada por WhatsApp' : '❌ Error al enviar. Verifica Evolution API.');
    setTimeout(() => setWaMsg(null), 3500);
  };

  const handleSendPreReserva = async (res: Reservation) => {
    setIsSending(true);
    const msg = WA_TEMPLATES.PRE_RESERVA(res.nombre.split(' ')[0], res.fecha, res.hora, res.profesorNombre);
    const ok = await sendWhatsApp(res.telefono, msg);
    setIsSending(false);
    setWaMsg(ok ? '✅ Mensaje de pre-reserva enviado' : '❌ Error al enviar.');
    setTimeout(() => setWaMsg(null), 3500);
  };

  const [createPreReservation, { loading: creatingRes }] = useMutation(CREATE_PRE_RESERVATION, {
    refetchQueries: [{ query: GET_RESERVATIONS }],
    onCompleted: () => {
      toast.success("Pre-reserva creada exitosamente");
      setIsNewOpen(false);
      setNewRes({ nombre: '', telefono: '', email: '', edad: '', apoderadoNombre: '', servicio: 'CLASE_PRUEBA', profesorNombre: '', fecha: '', hora: '', sala: '', modalidad: 'PRESENCIAL', aceptoReglamento: false });
    },
    onError: (e) => toast.error(`Error: ${e.message}`)
  });

  const handleCreateRes = () => {
    if (!newRes.nombre || !newRes.telefono || !newRes.fecha || !newRes.hora) return;
    const holidayName = activeHolidaysMap.get(newRes.fecha);
    if (holidayName) {
      toast.error(`No es posible crear reservas en días feriados (${holidayName}) 🇨🇱`);
      return;
    }
    createPreReservation({
      variables: {
        nombre: newRes.nombre,
        telefono: normalizePhoneNumber(newRes.telefono),
        email: newRes.email || null,
        edad: newRes.edad ? parseInt(newRes.edad) : null,
        apoderadoNombre: newRes.apoderadoNombre || null,
        servicio: newRes.servicio,
        profesorNombre: newRes.profesorNombre,
        fecha: newRes.fecha,
        hora: newRes.hora,
        sala: newRes.sala,
        modalidad: newRes.modalidad
      }
    });
  };

  return (
    <div className="p-8 lg:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
            <CalendarCheck className="h-3 w-3" /> Gestión de Agenda y Seguimiento
          </div>
          <h1 className="text-3xl font-bold font-serif tracking-tight">Reservas y Seguimiento de Planes</h1>
          <p className="text-slate-500 italic text-sm">
            Seguimiento de Clases de Prueba (pre-reservas con vencimiento 20:00 hrs) y recordatorios de renovación de Planes/Packs.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('RESERVATIONS')}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === 'RESERVATIONS' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              📅 Pre-Reservas / CP ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('RENEWALS')}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === 'RENEWALS' ? 'bg-[#70125F] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              🔔 Seguimiento Planes / Packs ({packsForFollowup.length})
            </button>
          </div>
          <Button onClick={() => setIsNewOpen(true)} size="lg" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-12 px-6 font-bold uppercase tracking-[0.1em] group rounded-2xl cursor-pointer">
            <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" /> Nueva Pre-Reserva
          </Button>
        </div>
      </header>

      {activeTab === 'RENEWALS' ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-[#70125F] text-white rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white/15 flex items-center justify-center text-white shrink-0">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-sm">Seguimiento de Renovación de Planes y Packs</p>
                <p className="text-white/80 text-xs mt-1">
                  Aquí aparecen automáticamente los alumnos que ya terminaron su plan (0 clases restantes), están en su última clase (1 clase restante) o su pack vence dentro de los próximos 7 días, para enviarles recordatorio de pago por WhatsApp.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {packsForFollowup.map((pack: any) => {
              const studentName = pack.student?.name || 'Alumno';
              const guardianName = pack.student?.guardianName;
              const phone = pack.student?.phoneNumber || pack.student?.guardianPhone || '';
              const cleanPhone = normalizePhoneNumber(phone);
              const planName = pack.plan?.name || 'Plan Mensual';
              const priceFormatted = pack.plan?.price ? `$${Number(pack.plan.price).toLocaleString('es-CL')}` : '';
              const waText = pack.isFinished
                ? `¡Hola ${guardianName || studentName.split(' ')[0]}! 🎶 Te escribimos de Academia Détaché para comentarte que el plan *${planName}* de *${studentName}* ya completó todas sus clases (0 restantes). Para mantener su cupo y horario reservado, puedes gestionar la renovación de su nuevo pack ${priceFormatted ? `(${priceFormatted}) ` : ''}por este medio. ¡Muchas gracias! 🎹`
                : `¡Hola ${guardianName || studentName.split(' ')[0]}! 🎶 Te escribimos de Academia Détaché para recordarte que al plan *${planName}* de *${studentName}* le queda *${pack.remainingClasses} clase(s)* disponible(s)${pack.expirationDate ? ` (vence el ${pack.expirationDate})` : ''}. Te invitamos a renovar su pack con anticipación para asegurar su horario habitual. ¡Nos vemos en clases! 🎹`;

              return (
                <div key={pack.id} className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <Badge className={`text-[9px] font-bold uppercase tracking-widest border-0 ${
                        pack.isFinished
                          ? 'bg-rose-100 text-rose-700'
                          : pack.isLastClass
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-purple-100 text-purple-800'
                      }`}>
                        {pack.isFinished
                          ? '⚠️ Plan Terminado (0 clases)'
                          : pack.isLastClass
                            ? '⏳ Última Clase (1 restante)'
                            : `📅 Vence pronto (${pack.daysToExpire} días)`}
                      </Badge>
                      <span className="text-[10px] font-mono text-slate-400">
                        Vence: {pack.expirationDate || '—'}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">{studentName}</h3>
                    {guardianName && (
                      <p className="text-xs text-slate-500 mt-0.5">Apoderado: <strong>{guardianName}</strong></p>
                    )}
                    <p className="text-xs font-bold text-[#70125F] uppercase tracking-wider mt-2">
                      {planName} {priceFormatted && `• ${priceFormatted}`}
                    </p>

                    <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Clases Restantes:</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {pack.remainingClasses} / {pack.totalClasses}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                    {cleanPhone ? (
                      <a
                        href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-sm transition-colors"
                      >
                        <MessageCircle className="h-4 w-4" /> Enviar Recordatorio de Pago WA
                      </a>
                    ) : (
                      <div className="text-[11px] text-slate-400 italic text-center py-2">
                        Sin teléfono registrado en la ficha del alumno
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {packsForFollowup.length === 0 && (
              <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-100">
                <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-400 mb-2" />
                <p className="font-bold text-slate-700">¡Todos los planes están al día!</p>
                <p className="text-xs text-slate-400 mt-1">No hay alumnos con 0-1 clases restantes ni packs próximos a vencer.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
      <>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pre-Reservadas', value: stats.preReservadas, color: 'text-orange-700', bg: 'bg-orange-50' },
          { label: 'Confirmadas', value: stats.confirmadas, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Vencidas/Liberadas', value: stats.vencidas, color: 'text-slate-500', bg: 'bg-slate-50' },
          { label: 'Total', value: stats.total, color: 'text-primary', bg: 'bg-primary/5' }
        ].map(s => (
          <div key={s.label} className={`${s.bg} border border-slate-100/80 rounded-3xl p-6 shadow-sm`}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{s.label}</p>
            <p className={`text-3xl font-bold font-serif ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Regla de negocio banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-5">
          <div className="h-12 w-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400 flex-shrink-0">
            <Timer className="h-6 w-6" />
          </div>
          <div>
            <p className="font-bold text-sm">¿Dónde van las pre-reservas cuando vence el plazo de las 20:00 hrs?</p>
            <p className="text-slate-300 text-xs mt-1 leading-relaxed">
              Toda pre-reserva sin pago antes de las 20:00 hrs pasa automáticamente al filtro <strong>&ldquo;Vencida&rdquo;</strong> en esta misma vista para que recepción pueda contactarla o presionar <strong>&ldquo;Liberar Cupos Vencidos&rdquo;</strong> y dejar libre el horario del profesor.
            </p>
          </div>
        </div>
        {stats.vencidas > 0 && (
          <Button 
            onClick={handleLiberarTodasVencidas}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider h-11 px-6 rounded-2xl shadow-lg shrink-0 cursor-pointer"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Liberar {stats.vencidas} Cupo{stats.vencidas > 1 ? 's' : ''} Vencido{stats.vencidas > 1 ? 's' : ''}
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <div className="relative w-full sm:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input type="text" placeholder="Buscar por nombre o profesor..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {(['ALL', 'PRE_RESERVADA', 'CONFIRMADA', 'VENCIDA', 'CANCELADA'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${statusFilter === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}>
              {s === 'ALL' ? 'Todas' : statusConfig[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {/* Reservations Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(res => {
          const cfg = statusConfig[res.estado];
          const Icon = cfg.icon;
          return (
            <div
              key={res.id}
              onClick={() => { setSelectedRes(res); setIsDetailOpen(true); }}
              className={`bg-white border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group ${res.estado === 'PRE_RESERVADA' ? 'border-orange-200 ring-1 ring-orange-100' : res.estado === 'CONFIRMADA' ? 'border-emerald-100' : 'border-slate-100'}`}
            >
              {/* Status + countdown */}
              <div className="flex items-center justify-between mb-4">
                <Badge className={`text-[9px] font-bold uppercase tracking-widest border-0 ${cfg.bg} ${cfg.color}`}>
                  <Icon className="h-2.5 w-2.5 mr-1" />{cfg.label}
                </Badge>
                {res.estado === 'PRE_RESERVADA' && res.expiraEn && (
                  <CountdownBadge expiry={res.expiraEn} />
                )}
                  {res.aceptoReglamento && (
                  <ShieldCheck className="h-4 w-4 text-emerald-500 ml-1" />
                )}
              </div>

              {/* Name + service */}
              <div className="mb-4">
                <p className="font-bold text-slate-900 text-lg leading-tight">{res.nombre}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{serviceLabel[res.servicio]}</p>
              </div>

              {/* Info rows */}
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-2 text-slate-500">
                  <User className="h-3.5 w-3.5 text-slate-300" />
                  <span>{res.profesorNombre}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock className="h-3.5 w-3.5 text-slate-300" />
                  <span>{res.fecha} · {res.hora}</span>
                </div>
                {res.sala && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <Music className="h-3.5 w-3.5 text-slate-300" />
                    <span>{res.sala}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-500">
                  <Phone className="h-3.5 w-3.5 text-slate-300" />
                  <span className="font-mono">+{res.telefono.slice(0, 2)} {res.telefono.slice(2)}</span>
                </div>
              </div>

              {/* Footer badges */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
                <Badge className={`text-[9px] border-0 font-bold uppercase tracking-widest ${res.pagoRegistrado ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                  {res.pagoRegistrado ? '✓ Pagado' : '· Sin pago'}
                </Badge>
                <Badge className="text-[9px] border-0 font-bold uppercase tracking-widest bg-slate-100 text-slate-500">
                  {res.modalidad}
                </Badge>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-3 py-20 flex flex-col items-center gap-4 text-slate-300">
            <CalendarCheck className="h-16 w-16 opacity-20" />
            <p className="text-sm italic font-medium">No hay reservas con ese filtro</p>
          </div>
        )}
      </div>
      </>
      )}

      {/* ── DETAIL DRAWER ── */}
      {isDetailOpen && selectedRes && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right-8 duration-300 flex flex-col">
            <div className={`text-white p-8 relative flex-shrink-0 ${selectedRes.estado === 'PRE_RESERVADA' ? 'bg-orange-600' : selectedRes.estado === 'CONFIRMADA' ? 'bg-emerald-700' : 'bg-slate-900'}`}>
              <button onClick={() => setIsDetailOpen(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors"><X className="h-5 w-5" /></button>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 mb-2">Detalle de Reserva</p>
              <h2 className="text-2xl font-bold font-serif">{selectedRes.nombre}</h2>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className="bg-white/20 text-white text-[9px] font-bold uppercase border-0">{serviceLabel[selectedRes.servicio]}</Badge>
                <Badge className="bg-white/20 text-white text-[9px] font-bold uppercase border-0">{selectedRes.modalidad}</Badge>
                {selectedRes.aceptoReglamento && <Badge className="bg-white/20 text-white text-[9px] font-bold uppercase border-0"><ShieldCheck className="h-2.5 w-2.5 mr-1" />Reglamento OK</Badge>}
              </div>
              {selectedRes.estado === 'PRE_RESERVADA' && selectedRes.expiraEn && (
                <div className="mt-4">
                  <CountdownBadge expiry={selectedRes.expiraEn} />
                </div>
              )}
            </div>

            <div className="flex-1 p-8 space-y-6">
              {/* Info */}
              {[
                { label: 'Profesor', value: selectedRes.profesorNombre },
                { label: 'Fecha', value: selectedRes.fecha },
                { label: 'Hora', value: selectedRes.hora },
                { label: 'Sala', value: selectedRes.sala || 'Sin sala asignada' },
                { label: 'Edad', value: selectedRes.edad ? `${selectedRes.edad} años` : '—' },
                { label: 'Apoderado', value: selectedRes.apoderadoNombre || '—' },
                { label: 'Teléfono', value: `+${selectedRes.telefono.slice(0, 2)} ${selectedRes.telefono.slice(2)}` },
                { label: 'Email', value: selectedRes.email || '—' },
                { label: 'Pago', value: selectedRes.pagoRegistrado ? 'Registrado ✓' : 'Sin pago' },
                { label: 'Vence', value: selectedRes.expiraEn ? new Date(selectedRes.expiraEn).toLocaleString('es-CL') : '—' }
              ].map(row => (
                <div key={row.label} className="flex items-start justify-between py-2 border-b border-slate-50">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{row.label}</span>
                  <span className="font-bold text-slate-700 text-sm text-right">{row.value}</span>
                </div>
              ))}

              {/* Notes if any */}
              {selectedRes.notas && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Notas</p>
                  <p className="text-sm text-slate-600 italic">{selectedRes.notas}</p>
                </div>
              )}

              {/* WhatsApp feedback */}
              {waMsg && <div className={`text-xs font-bold px-4 py-3 rounded-xl ${waMsg.startsWith('❌') ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>{waMsg}</div>}

              {/* Actions */}
              <div className="space-y-3 pt-2">
                {selectedRes.estado === 'PRE_RESERVADA' && (
                  <>
                    <Button onClick={() => handleConfirmar(selectedRes.id)} className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-[10px] tracking-widest shadow-lg cursor-pointer">
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Confirmar + Registrar Pago
                    </Button>
                    <Button onClick={() => handleSendPreReserva(selectedRes)} disabled={isSending} variant="outline" className="w-full h-12 rounded-2xl border-slate-200 font-bold uppercase text-[10px] tracking-widest cursor-pointer">
                      <MessageCircle className="mr-2 h-4 w-4 text-emerald-600" /> Reenviar WA Pre-Reserva
                    </Button>
                    <Button onClick={() => handleLiberarManual(selectedRes)} variant="outline" className="w-full h-12 rounded-2xl border-rose-200 text-rose-700 hover:bg-rose-50 font-bold uppercase text-[10px] tracking-widest cursor-pointer">
                      <XCircle className="mr-2 h-4 w-4" /> Liberar Cupo + Notificar
                    </Button>
                  </>
                )}
                {selectedRes.estado === 'VENCIDA' && (
                  <>
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 space-y-1">
                      <p className="font-bold">⚠️ Pre-reserva Vencida tras las 20:00 hrs</p>
                      <p className="text-[11px] text-rose-700">El plazo límite venció. Puedes liberar el cupo en la agenda y avisar al alumno.</p>
                    </div>
                    <Button onClick={() => handleLiberarManual(selectedRes)} className="w-full h-12 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase text-[10px] tracking-widest shadow-lg cursor-pointer">
                      <XCircle className="mr-2 h-4 w-4" /> Liberar Cupo Vencido + Notificar WA
                    </Button>
                  </>
                )}
                {selectedRes.estado === 'CONFIRMADA' && (
                  <Button onClick={() => handleSendConfirmacion(selectedRes)} disabled={isSending} className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-[10px] tracking-widest cursor-pointer">
                    <MessageCircle className="mr-2 h-4 w-4" /> Enviar Confirmación WA
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── NEW RESERVATION MODAL ── */}
      {isNewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <Card className="w-full max-w-lg bg-white border-none shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 rounded-[2.5rem]">
            <div className="bg-orange-600 p-8 text-white">
              <h3 className="text-2xl font-bold font-serif">Nueva Pre-Reserva</h3>
              <p className="text-white/70 italic text-sm mt-1">Vence automáticamente a las 20:00 si no se confirma el pago.</p>
            </div>
            <CardContent className="p-8 space-y-4 max-h-[65vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nombre completo *</label>
                  <input type="text" placeholder="Nombre del prospecto" className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-400/30" value={newRes.nombre} onChange={e => setNewRes({ ...newRes, nombre: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Teléfono WA *</label>
                  <input type="text" placeholder="56912345678" className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-mono outline-none focus:ring-2 focus:ring-orange-400/30" value={newRes.telefono} onChange={e => setNewRes({ ...newRes, telefono: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email</label>
                  <input type="email" placeholder="correo@ejemplo.com" className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm outline-none focus:ring-2 focus:ring-orange-400/30" value={newRes.email} onChange={e => setNewRes({ ...newRes, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Edad</label>
                  <input type="number" placeholder="Ej. 28" className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm outline-none focus:ring-2 focus:ring-orange-400/30" value={newRes.edad} onChange={e => setNewRes({ ...newRes, edad: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Apoderado (Si es menor)</label>
                  <input type="text" placeholder="Ej. Juan Pérez" className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm outline-none focus:ring-2 focus:ring-orange-400/30" value={newRes.apoderadoNombre} onChange={e => setNewRes({ ...newRes, apoderadoNombre: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Servicio</label>
                  <select className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-xs font-bold uppercase tracking-widest outline-none" value={newRes.servicio} onChange={e => setNewRes({ ...newRes, servicio: e.target.value as LeadService })}>
                    {(['PIANO_NINOS', 'PIANO_ADULTOS', 'CANTO', 'VIOLIN', 'GUITARRA', 'BATERIA', 'CONTRABAJO', 'CLASE_GRUPAL', 'CLASE_PRUEBA'] as LeadService[]).map(s => (
                      <option key={s} value={s}>{serviceLabel[s]}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Modalidad</label>
                  <select className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-xs font-bold uppercase tracking-widest outline-none" value={newRes.modalidad} onChange={e => setNewRes({ ...newRes, modalidad: e.target.value as any })}>
                    <option value="PRESENCIAL">Presencial</option>
                    <option value="ONLINE">Online</option>
                  </select>
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Profesor *</label>
                  <input type="text" placeholder="Nombre del profesor" className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-400/30" value={newRes.profesorNombre} onChange={e => setNewRes({ ...newRes, profesorNombre: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Fecha *</label>
                  <input type="date" className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm outline-none focus:ring-2 focus:ring-orange-400/30" value={newRes.fecha} onChange={e => setNewRes({ ...newRes, fecha: e.target.value })} />
                </div>

                {/* Feriado Alert */}
                {activeHolidaysMap.get(newRes.fecha) && (
                  <div className="col-span-2 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs animate-in fade-in">
                    <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
                    <div>
                      <p className="font-bold text-rose-950">🚫 Día Feriado Oficial: {activeHolidaysMap.get(newRes.fecha)}</p>
                      <p className="text-rose-800/90 text-[11px]">No está permitido crear pre-reservas en días festivos oficiales.</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Hora *</label>
                  <input type="time" className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm outline-none focus:ring-2 focus:ring-orange-400/30" value={newRes.hora} onChange={e => setNewRes({ ...newRes, hora: e.target.value })} />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sala</label>
                  <select className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm outline-none" value={newRes.sala} onChange={e => setNewRes({ ...newRes, sala: e.target.value })}>
                    <option value="">Sin sala</option>
                    {['Sala de Piano', 'Sala de Ensayo', 'Cabina A', 'Cabina B'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${newRes.aceptoReglamento ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 group-hover:border-slate-400'}`}
                      onClick={() => setNewRes({ ...newRes, aceptoReglamento: !newRes.aceptoReglamento })}>
                      {newRes.aceptoReglamento && <CheckCircle2 className="h-3 w-3 text-white" />}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-700">Acepta Términos y Condiciones</span>
                      <p className="text-[10px] text-slate-400">Reglamento interno de alumnos Détaché</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-orange-700 font-medium leading-relaxed">
                    La pre-reserva vencerá automáticamente a las <strong>20:00 del día seleccionado</strong>. Si no se registra el pago, el cupo se liberará y se notificará al prospecto por WhatsApp.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <Button variant="outline" className="flex-1 h-12 rounded-2xl border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-widest" onClick={() => setIsNewOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreateRes} disabled={!newRes.nombre || !newRes.telefono || !newRes.fecha || !newRes.hora || creatingRes || Boolean(activeHolidaysMap.get(newRes.fecha))} className="flex-1 h-12 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold uppercase text-[10px] tracking-widest shadow-lg disabled:opacity-40">
                  {creatingRes ? "Creando..." : "Crear Pre-Reserva"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
