"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react/index.js";
import { CREATE_PRE_RESERVATION } from "@/graphql/mutations/lesson-mutations";
import { CREATE_PAYMENT_PREFERENCE } from "@/graphql/mutations/student-mutations";
import { GET_TEACHERS } from "@/graphql/queries/get-teachers";
import { GET_ROOMS } from "@/graphql/queries/get-rooms";
import { GET_RESERVATIONS } from "@/graphql/queries/get-reservations";
import { GET_GLOBAL_SETTINGS } from "@/graphql/queries/get-global-settings";
import { GET_ACTIVE_HOLIDAYS } from "@/graphql/queries/get-holidays";
import { getImageUrl, normalizePhoneNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Calendar as CalendarIcon,
  Clock,
  User,
  Users,
  Building,
  ShieldCheck,
  CalendarCheck,
  Send,
  AlertCircle,
  AlertTriangle,
  CreditCard,
  Landmark,
  FileText,
  Music,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

// --- Instrument catalog & Minimum Age Rules ---
export const INSTRUMENT_RULES = [
  {
    id: "PIANO",
    name: "Piano",
    emoji: "🎹",
    minAge: 4,
    ruleLabel: "Desde los 4 años",
    keywords: ["piano", "teclado"],
    description: "Iniciación musical, técnica clásica y repertorio moderno en pianos acústicos y de cola.",
  },
  {
    id: "CANTO",
    name: "Canto",
    emoji: "🎤",
    minAge: 6,
    ruleLabel: "Desde los 6 años",
    keywords: ["canto", "voz", "vocal"],
    description: "Técnica vocal, respiración, afinación, interpretación y repertorio personalizado.",
  },
  {
    id: "BATERIA",
    name: "Batería",
    emoji: "🥁",
    minAge: 6,
    ruleLabel: "Desde los 6 años",
    keywords: ["bateria", "batería", "percusion", "percusión"],
    description: "Coordinación motriz, lectura rítmica, groove y estilos contemporáneos.",
  },
  {
    id: "GUITARRA",
    name: "Guitarra",
    emoji: "🎸",
    minAge: 8,
    ruleLabel: "Desde los 8 años",
    keywords: ["guitarra", "acústica", "eléctrica", "ukelele"],
    description: "Guitarra acústica, clásica y eléctrica: postura, acordes, técnica y repertorio.",
  },
  {
    id: "VIOLIN",
    name: "Violín",
    emoji: "🎻",
    minAge: 6,
    ruleLabel: "Desde los 6 años",
    keywords: ["violin", "violín", "cuerdas", "viola", "cello"],
    description: "Técnica de arco, postura ergonómica, afinación y repertorio académico y moderno.",
  },
  {
    id: "CONTRABAJO",
    name: "Contrabajo / Bajo",
    emoji: "🎼",
    minAge: 8,
    ruleLabel: "Desde los 8 años",
    keywords: ["contrabajo", "bajo"],
    description: "Fundamentos de pulso, armonía, técnica de mano derecha e izquierda.",
  },
];

// --- Time helpers (30 min Trial Classes) ---
function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(":");
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60).toString().padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function generateSlots(startTimeStr: string, endTimeStr: string, slotDuration = 30): { start: string; end: string }[] {
  const startMins = timeToMinutes(startTimeStr);
  const endMins = timeToMinutes(endTimeStr);
  const slots: { start: string; end: string }[] = [];

  for (let current = startMins; current + slotDuration <= endMins; current += slotDuration) {
    slots.push({
      start: minutesToTime(current),
      end: minutesToTime(current + slotDuration),
    });
  }
  return slots;
}

const DAY_MAP_EN_TO_ES: Record<string, string> = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

const MONTHS_SPANISH = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function getDayNameSpanish(date: Date): string {
  const daysOfWeekSpanish = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  return daysOfWeekSpanish[date.getDay()];
}

function BookPageContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);

  // Selections
  const [selectedInstrumentId, setSelectedInstrumentId] = useState<string>("PIANO");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [selectedModality, setSelectedModality] = useState<"PRESENCIAL" | "ONLINE">("PRESENCIAL");
  const [selectedDateStr, setSelectedDateStr] = useState<string>(""); // YYYY-MM-DD
  const [timeOfDayFilter, setTimeOfDayFilter] = useState<"ALL" | "MORNING" | "AFTERNOON" | "EVENING">("ALL");

  // Student Intake Form
  const [patientType, setPatientType] = useState<"ADULT" | "MINOR">("ADULT");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "TRANSFER">("ONLINE");
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    edad: "",
    tutorNombre: "",
    rut: "",
    email: "",
    telefono: "+569",
    nivel: "Principiante (Desde cero)",
    motivo: "",
  });

  const [bookingFolio, setBookingFolio] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Pre-select instrument from URL ?instrument=
  useEffect(() => {
    const qInst = searchParams.get("instrument") || searchParams.get("servicio");
    if (qInst) {
      const clean = qInst.toLowerCase();
      const found = INSTRUMENT_RULES.find(
        (r) => r.id.toLowerCase() === clean || r.name.toLowerCase().includes(clean) || r.keywords.some((k) => clean.includes(k))
      );
      if (found) {
        setSelectedInstrumentId(found.id);
      }
    }
  }, [searchParams]);

  const currentInstrument = useMemo(
    () => INSTRUMENT_RULES.find((r) => r.id === selectedInstrumentId) || INSTRUMENT_RULES[0],
    [selectedInstrumentId]
  );

  // GraphQL Queries
  const { data: teachersData, loading: loadingTeachers } = useQuery(GET_TEACHERS);
  const { data: roomsData } = useQuery<any>(GET_ROOMS);
  const { data: reservationsData } = useQuery(GET_RESERVATIONS);
  const { data: globalSettingsData } = useQuery<any>(GET_GLOBAL_SETTINGS);
  const { data: holidaysData } = useQuery<any>(GET_ACTIVE_HOLIDAYS, {
    fetchPolicy: "network-only",
  });

  const globalSettings = globalSettingsData?.globalSettings;
  const trialPrice = globalSettings?.trialClassPrice ?? 15000;
  const trialDescription =
    globalSettings?.trialClassDescription ||
    "Sesión individual de 30 minutos donde evaluamos tu nivel o potencial inicial, resolvemos tus dudas metodológicas y trazamos un plan de estudio personalizado en tu instrumento.";
  const sedeSalasInfo =
    globalSettings?.sedeSalasInfo ||
    "Sede La Cisterna — Gran Avenida José Miguel Carrera 8520, Oficina C (A pasos de Metro La Cisterna). Contamos con salas acústicamente acondicionadas y equipadas con instrumentos profesionales para Piano, Canto, Guitarra, Violín y Batería.";
  const bankTransferDetails =
    globalSettings?.bankTransferDetails ||
    "Banco: Banco Estado / Santander\nTipo de Cuenta: Cuenta Corriente / Vista\nNombre: Academia de Música Détaché\nEmail de confirmación: academia@detache.cl\nAsunto: Clase de Prueba + Nombre del Alumno";
  const termsText =
    globalSettings?.termsAndConditions ||
    "1. CLASES DE PRUEBA Y RESERVAS\n• Toda clase de prueba tiene una duración de 30 minutos y requiere pago anticipado para quedar agendada y confirmada.\n• Las reservas web deben realizarse con al menos 24 horas de anticipación (no se agendan horas para el mismo día por internet).\n• Las pre-reservas pendientes de transferencia vencen a las 20:00 hrs del día en que se solicitan.\n\n2. EDADES MÍNIMAS POR INSTRUMENTO\n• Piano: desde los 4 años\n• Canto: desde los 6 años\n• Batería: desde los 6 años\n• Guitarra: desde los 8 años\n\n3. ASISTENCIA, AVISOS Y RECUPERACIÓN DE CLASES\n• Las inasistencias deben ser avisadas con al menos 24 horas de anticipación para poder reprogramar la clase dentro de la vigencia del plan sin descontarla del pack.";

  const teachers = useMemo(() => {
    const all = (teachersData as any)?.allTeachers || [];
    return all.filter((t: any) => t.status !== "INACTIVE");
  }, [teachersData]);

  const rooms = useMemo(() => {
    return (roomsData?.allRooms || []).filter((r: any) => r.status !== "MAINTENANCE");
  }, [roomsData]);

  const lessons = (reservationsData as any)?.allLessons || [];
  const activeHolidays = holidaysData?.activeHolidays || [];

  const activeHolidaysMap = useMemo(() => {
    const map = new Map<string, string>();
    activeHolidays.forEach((h: any) => {
      if (h.isActive) {
        map.set(h.date, h.name);
      }
    });
    return map;
  }, [activeHolidays]);

  // Filter teachers strictly by selected instrument specialties
  const availableTeachers = useMemo(() => {
    const matched = teachers.filter((t: any) => {
      const specs = (t.specialties || []).map((s: any) => (s.name || "").toLowerCase());
      const desc = (t.description || "").toLowerCase();
      return currentInstrument.keywords.some(
        (kw) => specs.some((sp: string) => sp.includes(kw)) || desc.includes(kw)
      );
    });
    return matched.length > 0 ? matched : teachers;
  }, [teachers, currentInstrument]);

  // Ensure selectedTeacherId belongs to availableTeachers
  useEffect(() => {
    if (availableTeachers.length > 0) {
      const stillValid = availableTeachers.some((t: any) => String(t.id) === String(selectedTeacherId));
      if (!stillValid) {
        setSelectedTeacherId(String(availableTeachers[0].id));
      }
    } else {
      setSelectedTeacherId("");
    }
  }, [availableTeachers, selectedTeacherId]);

  const [selectedSlot, setSelectedSlot] = useState<{
    start: string;
    end: string;
    teacherId?: string;
    teacherName?: string;
  } | null>(null);

  // Check if a given date is available for online booking:
  // Internet users CANNOT book on the same day (must be tomorrow onwards).
  const isDateAvailableForBooking = (date: Date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const isPastOrToday = date < tomorrow;
    const isSunday = date.getDay() === 0;
    if (isPastOrToday || isSunday) return false;

    const dateFormatted = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    if (activeHolidaysMap.has(dateFormatted)) {
      return false;
    }

    const dayName = getDayNameSpanish(date);
    const teacher = availableTeachers.find((t: any) => String(t.id) === String(selectedTeacherId));
    if (!teacher) return false;

    const hasAvail = teacher.availabilities && teacher.availabilities.length > 0;
    if (!hasAvail) return false; // Solo mostrar días donde el profesor tenga disponibilidad configurada
    return teacher.availabilities.some((av: any) => {
      const daySpanish = DAY_MAP_EN_TO_ES[av.day.toUpperCase()] || av.day;
      return daySpanish.toLowerCase() === dayName.toLowerCase();
    });
  };

  // Reset selectedDateStr & selectedSlot when changing teacher
  useEffect(() => {
    setSelectedDateStr("");
    setSelectedSlot(null);
  }, [selectedTeacherId]);

  // Slot calculations: 30-minute slots strictly from the selected teacher's availability
  const availableSlots = useMemo(() => {
    if (!selectedDateStr || !selectedTeacherId) return [];

    const dateParts = selectedDateStr.split("-");
    const dateObj = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
    const dayName = getDayNameSpanish(dateObj);

    const teacher = availableTeachers.find((t: any) => String(t.id) === String(selectedTeacherId));
    if (!teacher) return [];

    const slotMap = new Map<string, { start: string; end: string; teacherId?: string; teacherName?: string }>();

    const activeAvailabilities =
      teacher.availabilities?.filter((av: any) => {
        const daySpanish = DAY_MAP_EN_TO_ES[av.day.toUpperCase()] || av.day;
        return daySpanish.toLowerCase() === dayName.toLowerCase();
      }) || [];

    const generated: { start: string; end: string }[] = [];
    activeAvailabilities.forEach((av: any) => {
      generated.push(...generateSlots(av.startTime, av.endTime, 30));
    });

    const occupiedLessons = lessons.filter((l: any) => {
      if (l.date !== selectedDateStr) return false;
      if (l.status === "CANCELLED") return false;
      if (String(l.teacher?.id) !== String(teacher.id)) return false;
      return true;
    });

    generated.forEach((slot) => {
      const slotStartMins = timeToMinutes(slot.start);
      const slotEndMins = timeToMinutes(slot.end);

      const isOccupied = occupiedLessons.some((l: any) => {
        const lStart = timeToMinutes(l.startTime?.slice(0, 5));
        const lEnd = l.endTime ? timeToMinutes(l.endTime.slice(0, 5)) : lStart + 30;
        return slotStartMins < lEnd && slotEndMins > lStart;
      });

      if (!isOccupied && !slotMap.has(slot.start)) {
        slotMap.set(slot.start, {
          start: slot.start,
          end: slot.end,
          teacherId: teacher.id,
          teacherName: teacher.name,
        });
      }
    });

    const sortedSlots = Array.from(slotMap.values()).sort(
      (a, b) => timeToMinutes(a.start) - timeToMinutes(b.start)
    );

    if (timeOfDayFilter === "MORNING") {
      return sortedSlots.filter((s) => parseInt(s.start.split(":")[0]) < 13);
    }
    if (timeOfDayFilter === "AFTERNOON") {
      return sortedSlots.filter((s) => {
        const h = parseInt(s.start.split(":")[0]);
        return h >= 13 && h < 18;
      });
    }
    if (timeOfDayFilter === "EVENING") {
      return sortedSlots.filter((s) => parseInt(s.start.split(":")[0]) >= 18);
    }

    return sortedSlots;
  }, [selectedDateStr, selectedTeacherId, availableTeachers, lessons, timeOfDayFilter]);

  const effectiveAssignedTeacherName = useMemo(() => {
    if (selectedSlot?.teacherName) return selectedSlot.teacherName;
    return availableTeachers.find((t: any) => String(t.id) === String(selectedTeacherId))?.name || "Profesor Especialista";
  }, [selectedSlot, selectedTeacherId, availableTeachers]);

  // Age validation helper
  const parsedAge = formData.edad ? parseInt(formData.edad, 10) : null;
  const isAgeBelowMinimum = parsedAge !== null && !isNaN(parsedAge) && parsedAge < currentInstrument.minAge;

  const methodologyLabel = useMemo(() => {
    if (!parsedAge || isNaN(parsedAge)) return null;
    if (parsedAge < currentInstrument.minAge) return `Edad mínima para ${currentInstrument.name}: ${currentInstrument.minAge} años`;
    if (parsedAge <= 7) return "Metodología Infantil Lúdica (4 a 7 años)";
    if (parsedAge <= 12) return "Metodología Infantil-Juvenil (8 a 12 años)";
    if (parsedAge <= 17) return "Metodología Juvenil Contemporánea (13 a 17 años)";
    return "Metodología Adultos & Repertorio Progresivo (18+ años)";
  }, [parsedAge, currentInstrument]);

  // Mutations
  const [createPaymentPreference, { loading: isCreatingPayment }] = useMutation<any>(CREATE_PAYMENT_PREFERENCE, {
    onCompleted: (res: any) => {
      if (res?.createPaymentPreference?.success && res?.createPaymentPreference?.initPoint) {
        toast.success("Redirigiendo a la pasarela de pago seguro para confirmar tu clase...");
        window.location.href = res.createPaymentPreference.initPoint;
      } else {
        toast.error("No se pudo abrir el link automático. Puedes usar el botón de pago en pantalla.");
        setStep(6);
      }
    },
    onError: (err) => {
      toast.error("Error al conectar con pasarela: " + err.message);
      setStep(6);
    },
  });

  const [createPreReservation, { loading: isSubmitting }] = useMutation(CREATE_PRE_RESERVATION, {
    refetchQueries: [{ query: GET_RESERVATIONS }],
    onCompleted: (res: any) => {
      if (res.createPreReservation?.success) {
        const randomFolio = `DET-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        setBookingFolio(randomFolio);

        if (paymentMethod === "ONLINE") {
          const studentFullName = `${formData.nombre} ${formData.apellido}`.trim();
          createPaymentPreference({
            variables: {
              planId: null,
              isTrialClass: true,
              name: studentFullName,
              email: formData.email,
              phone: normalizePhoneNumber(formData.telefono),
              backUrl: window.location.origin,
              edad: parsedAge,
              apoderadoNombre: patientType === "MINOR" ? formData.tutorNombre : null,
              servicio: currentInstrument.id === "PIANO" && parsedAge && parsedAge < 13 ? "PIANO_NINOS" : currentInstrument.id === "PIANO" ? "PIANO_ADULTOS" : currentInstrument.id,
              profesorNombre: effectiveAssignedTeacherName,
              fecha: selectedDateStr,
              hora: selectedSlot?.start,
            },
          });
        } else {
          setStep(6);
          toast.warning("Pre-reserva registrada como PENDIENTE DE PAGO. Realiza el pago para confirmar tu cupo.");
        }
      } else {
        toast.error("Hubo un problema al registrar la solicitud. Intenta nuevamente.");
      }
    },
    onError: (err) => {
      toast.error("Error al agendar: " + err.message);
    },
  });

  const changeStep = (nextStep: number) => {
    setStep(nextStep);
    setTimeout(() => {
      const container = document.getElementById("booking-wizard");
      if (container) {
        container.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
  };

  // Calendar Helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
    const numDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= numDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith("+569")) {
      value = "+569";
    }
    const suffix = value.slice(4);
    const cleanSuffix = suffix.replace(/\D/g, "");
    const limitedSuffix = cleanSuffix.slice(0, 8);
    setFormData({
      ...formData,
      telefono: "+569" + limitedSuffix,
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.apellido || formData.telefono.length !== 12 || !formData.email || !formData.edad) {
      toast.error("Por favor completa todos los campos obligatorios del alumno (incluyendo edad).");
      return;
    }

    if (isAgeBelowMinimum) {
      toast.error(`La edad mínima para clases de ${currentInstrument.name} es de ${currentInstrument.minAge} años.`);
      return;
    }

    if ((patientType === "MINOR" || (parsedAge && parsedAge < 18)) && !formData.tutorNombre.trim()) {
      toast.error("Por favor ingresa el nombre del Apoderado / Tutor responsable para alumnos menores de edad.");
      return;
    }

    if (!acceptedTerms) {
      toast.error("Debes leer y aceptar el Reglamento Interno y Términos y Condiciones para continuar.");
      return;
    }

    if (!selectedSlot || !selectedDateStr) {
      toast.error("Selecciona una fecha y horario para tu clase.");
      return;
    }

    const teacherToAssign = effectiveAssignedTeacherName;
    const studentFullName = `${formData.nombre} ${formData.apellido}`.trim();
    const mappedService =
      currentInstrument.id === "PIANO" && parsedAge && parsedAge < 13
        ? "PIANO_NINOS"
        : currentInstrument.id === "PIANO"
        ? "PIANO_ADULTOS"
        : currentInstrument.id;

    const combinedNotes = `[Clase de Prueba 30m • ${currentInstrument.name}] Edad: ${parsedAge} años (${methodologyLabel}) | ${
      patientType === "MINOR" || (parsedAge && parsedAge < 18) ? `Apoderado: ${formData.tutorNombre}` : "Alumno Adulto"
    } | Medio de Pago elegido: ${paymentMethod === "ONLINE" ? "Link de Pago Online" : "Transferencia Bancaria"} | Nivel: ${
      formData.nivel
    } | Motivo: ${formData.motivo || "Evaluación inicial"}`;

    createPreReservation({
      variables: {
        nombre: studentFullName,
        telefono: normalizePhoneNumber(formData.telefono),
        email: formData.email,
        edad: parsedAge,
        apoderadoNombre: formData.tutorNombre || null,
        profesorNombre: teacherToAssign,
        fecha: selectedDateStr,
        hora: selectedSlot.start,
        servicio: mappedService,
        notas: combinedNotes,
      },
    });
  };

  const handlePayNowFromStep6 = () => {
    const studentFullName = `${formData.nombre} ${formData.apellido}`.trim();
    createPaymentPreference({
      variables: {
        planId: null,
        isTrialClass: true,
        name: studentFullName,
        email: formData.email,
        phone: normalizePhoneNumber(formData.telefono),
        backUrl: window.location.origin,
        edad: parsedAge,
        apoderadoNombre: formData.tutorNombre || null,
        servicio: currentInstrument.id,
        profesorNombre: effectiveAssignedTeacherName,
        fecha: selectedDateStr,
        hora: selectedSlot?.start,
      },
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 text-slate-800 font-sans">
      {/* ── Top Header Banner ── */}
      <header className="bg-slate-900 text-white pt-28 pb-12 sm:pt-36 sm:pb-14 md:pt-40 md:pb-16 px-4 sm:px-8 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#70125F]/40 via-transparent to-[#DCA060]/20 pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10 space-y-3">
          <div className="flex items-center gap-2 text-[#DCA060] font-bold text-xs uppercase tracking-[0.25em]">
            <CalendarCheck className="h-4 w-4" /> Portal de Inscripción Oficial • Clases de Prueba (30 Minutos)
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif tracking-tight">
            Inscripción para Clase de Prueba
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Selecciona tu instrumento, profesor especialista, horario disponible y realiza el pago anticipado para confirmar tu cupo.
          </p>
        </div>
      </header>

      {/* ── Stepper Navigation ── */}
      <div id="booking-wizard" className="max-w-5xl mx-auto w-full px-4 sm:px-8 pt-8 pb-4">
        <div className="bg-white rounded-3xl p-3 sm:p-5 shadow-sm border border-slate-100 flex items-center justify-between overflow-x-auto gap-2 scrollbar-none">
          {[
            { n: 1, label: "Instrumento" },
            { n: 2, label: "Profesor" },
            { n: 3, label: "Sede y Sala" },
            { n: 4, label: "Fecha y Horario" },
            { n: 5, label: "Ficha y Pago" },
            { n: 6, label: "Confirmación" },
          ].map((s) => {
            const isCompleted = step > s.n;
            const isCurrent = step === s.n;
            return (
              <div
                key={s.n}
                onClick={() => {
                  if (s.n < step && step !== 6) changeStep(s.n);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-2xl transition-all select-none whitespace-nowrap shrink-0 ${
                  isCurrent
                    ? "bg-[#70125F] text-white font-bold shadow-md shadow-[#70125F]/20"
                    : isCompleted
                    ? "text-emerald-700 bg-emerald-50 cursor-pointer hover:bg-emerald-100 font-semibold"
                    : "text-slate-400"
                }`}
              >
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                    isCurrent
                      ? "bg-white text-[#70125F]"
                      : isCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {isCompleted ? "✓" : s.n}
                </div>
                <span className="text-xs tracking-tight">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Main Wizard Container ── */}
      <main className="max-w-5xl mx-auto w-full px-4 sm:px-8 py-6 flex-1">
        {/* PASO 1: INSTRUMENTO Y CLASE DE PRUEBA */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#70125F]">Paso 1 de 5</span>
              <h2 className="text-2xl font-bold font-serif text-slate-900">Elige tu Instrumento para la Clase de Prueba</h2>
              <p className="text-slate-500 text-xs italic">
                Revisa la información oficial de nuestra Clase de Prueba de 30 minutos y la edad mínima requerida por instrumento.
              </p>
            </div>

            {/* Información Editable sobre Clase de Prueba */}
            <Card className="rounded-3xl border-2 border-[#70125F]/20 bg-[#70125F]/5 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-[#70125F] text-white text-[10px] uppercase font-bold">
                      Clase de Prueba • 30 Minutos
                    </Badge>
                    <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-900 text-[10px] font-bold">
                      Requiere Pago Anticipado (${Number(trialPrice).toLocaleString("es-CL")} CLP)
                    </Badge>
                  </div>
                  <h3 className="font-bold text-xl text-slate-900 font-serif">
                    ¿En qué consiste la Clase de Prueba?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {trialDescription}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-[#70125F] font-bold">
                    <span>✓ 30 minutos de duración</span>
                    <span className="text-slate-300">•</span>
                    <span>✓ Profesor especialista según instrumento</span>
                    <span className="text-slate-300">•</span>
                    <span>✓ Reserva con mínimo 24 hrs de anticipación</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-[#70125F]/15 shadow-sm text-center shrink-0 w-full sm:w-auto">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                    Valor Clase de Prueba
                  </span>
                  <span className="text-2xl font-black font-mono text-[#70125F]">
                    ${Number(trialPrice).toLocaleString("es-CL")}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Pago online o transferencia</span>
                </div>
              </div>
            </Card>

            {/* Selección de Instrumento con Regla de Edades */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-widest text-slate-700">
                  Selecciona el Instrumento a Cursar *
                </label>
                <span className="text-[11px] text-slate-500 italic">
                  Cada instrumento define los profesores habilitados y la metodología por edad
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {INSTRUMENT_RULES.map((inst) => {
                  const isSelected = selectedInstrumentId === inst.id;
                  return (
                    <Card
                      key={inst.id}
                      onClick={() => {
                        setSelectedInstrumentId(inst.id);
                        setSelectedSlot(null);
                      }}
                      className={`rounded-3xl border-2 p-5 cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-[#70125F] bg-[#70125F]/5 shadow-lg ring-2 ring-[#70125F]/20"
                          : "border-slate-100 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-3xl">{inst.emoji}</span>
                          <Badge
                            className={`text-[10px] font-bold ${
                              isSelected
                                ? "bg-[#70125F] text-white"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {inst.ruleLabel}
                          </Badge>
                        </div>
                        <h4 className="font-bold text-base text-slate-900">{inst.name}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">{inst.description}</p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                        <span className={isSelected ? "text-[#70125F]" : "text-slate-400"}>
                          {isSelected ? "● Instrumento Seleccionado" : "Elegir instrumento"}
                        </span>
                        <div
                          className={`h-5 w-5 rounded-full border flex items-center justify-center text-[10px] ${
                            isSelected ? "bg-[#70125F] text-white border-[#70125F]" : "border-slate-300"
                          }`}
                        >
                          {isSelected ? "✓" : ""}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={() => changeStep(2)}
                className="bg-[#70125F] hover:bg-[#8e1779] text-white rounded-2xl h-12 px-8 font-bold uppercase tracking-wider text-xs shadow-lg shadow-[#70125F]/20 cursor-pointer gap-2"
              >
                Continuar a Profesores de {currentInstrument.name} <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* PASO 2: PROFESIONAL DOCENTE (FILTRADO POR INSTRUMENTO, SIN "CUALQUIER PROFESIONAL") */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#70125F]">Paso 2 de 5</span>
              <h2 className="text-2xl font-bold font-serif text-slate-900">
                Selecciona tu Profesor de {currentInstrument.name} {currentInstrument.emoji}
              </h2>
              <p className="text-slate-500 text-xs italic">
                Mostrando únicamente los profesores especialistas que imparten {currentInstrument.name} ({currentInstrument.ruleLabel}).
              </p>
            </div>

            {loadingTeachers ? (
              <div className="py-16 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#70125F] mx-auto" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {availableTeachers.map((teacher: any) => {
                  const isSelected = String(selectedTeacherId) === String(teacher.id);
                  return (
                    <Card
                      key={teacher.id}
                      onClick={() => {
                        setSelectedTeacherId(String(teacher.id));
                        setSelectedSlot(null);
                      }}
                      className={`rounded-3xl border-2 transition-all cursor-pointer p-6 flex flex-col justify-between ${
                        isSelected
                          ? "border-[#70125F] bg-[#70125F]/5 shadow-md ring-2 ring-[#70125F]/20"
                          : "border-slate-100 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                          {teacher.photo ? (
                            <img src={getImageUrl(teacher.photo)} alt={teacher.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-serif font-bold text-xl">
                              {teacher.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-base text-slate-900">{teacher.name}</h3>
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {teacher.description || `Docente especialista en ${currentInstrument.name}.`}
                          </p>
                          <div className="flex flex-wrap gap-1 pt-1">
                            {teacher.specialties?.map((s: any) => (
                              <Badge key={s.id || s.name} variant="outline" className="text-[9px] px-1.5 py-0 text-slate-600">
                                {s.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                        <span className={isSelected ? "text-[#70125F]" : "text-slate-400"}>
                          {isSelected ? "● Profesor Seleccionado" : "Elegir este profesor"}
                        </span>
                        <div
                          className={`h-5 w-5 rounded-full border flex items-center justify-center text-[10px] ${
                            isSelected ? "bg-[#70125F] text-white border-[#70125F]" : "border-slate-300"
                          }`}
                        >
                          {isSelected ? "✓" : ""}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => changeStep(1)}
                className="rounded-2xl h-12 px-6 font-bold text-xs uppercase tracking-wider"
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Volver
              </Button>
              <Button
                disabled={!selectedTeacherId}
                onClick={() => changeStep(3)}
                className="bg-[#70125F] hover:bg-[#8e1779] text-white rounded-2xl h-12 px-8 font-bold uppercase tracking-wider text-xs shadow-lg shadow-[#70125F]/20 cursor-pointer gap-2 disabled:opacity-50"
              >
                Continuar a Sede y Salas <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* PASO 3: SEDE Y SALAS */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#70125F]">Paso 3 de 5</span>
              <h2 className="text-2xl font-bold font-serif text-slate-900">Información sobre Sede y Salas</h2>
              <p className="text-slate-500 text-xs italic">
                Conoce nuestra sede presencial y las salas equipadas donde se realizará tu clase de prueba.
              </p>
            </div>

            <Card
              onClick={() => setSelectedModality("PRESENCIAL")}
              className="rounded-3xl border-2 border-[#70125F] bg-[#70125F]/5 shadow-xl ring-2 ring-[#70125F]/20 p-8 flex flex-col justify-between"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="h-16 w-16 rounded-2xl bg-[#70125F] text-white flex items-center justify-center font-bold shadow-md">
                    <Building className="h-8 w-8" />
                  </div>
                  <Badge className="bg-[#70125F] text-white text-[10px] uppercase font-bold px-3 py-1">
                    Sede Oficial • 100% Presencial
                  </Badge>
                </div>

                <div>
                  <h3 className="font-bold text-2xl text-slate-900">Academia de Música Détaché</h3>
                  <p className="text-sm text-slate-700 mt-2 font-medium">
                    📍 {globalSettings?.address || "Gran Avenida José Miguel Carrera 8520, Oficina C, La Cisterna"}
                  </p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
                    {sedeSalasInfo}
                  </p>
                </div>

                {rooms.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#70125F]">
                      Salas Disponibles en Sede
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {rooms.map((room: any) => (
                        <div
                          key={room.id}
                          className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-xs text-slate-700 space-y-1"
                        >
                          <p className="font-bold text-slate-900">🚪 {room.name}</p>
                          <p className="text-[11px] text-slate-500">
                            Capacidad: {room.capacity} {room.capacity === 1 ? "alumno" : "alumnos"}
                          </p>
                          {room.instruments?.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {room.instruments.map((inst: any) => (
                                <Badge key={inst.id} variant="outline" className="text-[9px] py-0 px-1.5">
                                  {inst.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 mt-6 border-t border-[#70125F]/10 flex items-center justify-between text-xs font-bold text-[#70125F]">
                <span className="text-sm">● Sede y Salas Presenciales Confirmadas</span>
                <div className="h-7 w-7 rounded-full bg-[#70125F] text-white flex items-center justify-center font-bold text-xs shadow">
                  ✓
                </div>
              </div>
            </Card>

            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => changeStep(2)}
                className="rounded-2xl h-12 px-6 font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Volver
              </Button>
              <Button
                onClick={() => changeStep(4)}
                className="bg-[#70125F] hover:bg-[#8e1779] text-white rounded-2xl h-12 px-8 font-bold uppercase tracking-wider text-xs shadow-lg shadow-[#70125F]/20 cursor-pointer gap-2"
              >
                Continuar a Fecha y Horario <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* PASO 4: FECHA Y BLOQUE HORARIO (30 MINUTOS, SIN RESERVA MISMO DÍA) */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#70125F]">Paso 4 de 5</span>
              <h2 className="text-2xl font-bold font-serif text-slate-900">Selecciona Fecha y Horario (30 Minutos)</h2>
              <p className="text-slate-500 text-xs italic">
                Las reservas por internet están habilitadas a partir del día siguiente (no se agendan horas para el mismo día por web).
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Calendario Mensual */}
              <Card className="lg:col-span-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-base text-slate-900 font-serif">
                    {MONTHS_SPANISH[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" onClick={handlePrevMonth} className="h-8 w-8 rounded-xl">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleNextMonth} className="h-8 w-8 rounded-xl">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
                    <div key={d}>{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {getDaysInMonth(currentMonth).map((d, index) => {
                    if (!d) return <div key={`empty-${index}`} className="h-10" />;

                    const dateFormatted = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
                    const isSelected = selectedDateStr === dateFormatted;
                    const holidayName = activeHolidaysMap.get(dateFormatted);
                    const isHoliday = Boolean(holidayName);
                    const isAvailable = isDateAvailableForBooking(d);
                    const disabled = !isAvailable;

                    return (
                      <button
                        key={dateFormatted}
                        disabled={disabled}
                        title={
                          isHoliday
                            ? `Feriado: ${holidayName}`
                            : disabled
                            ? "No disponible para reserva web (mínimo 24h de anticipación)"
                            : undefined
                        }
                        onClick={() => {
                          setSelectedDateStr(dateFormatted);
                          setSelectedSlot(null);
                        }}
                        className={`h-11 rounded-2xl flex flex-col items-center justify-center text-xs font-bold transition-all relative ${
                          isSelected
                            ? "bg-[#70125F] text-white shadow-md shadow-[#70125F]/30 scale-105"
                            : isHoliday
                            ? "bg-rose-100 text-rose-700 font-bold border border-rose-300 cursor-not-allowed"
                            : disabled
                            ? "text-slate-300 cursor-not-allowed opacity-40 bg-slate-50/50"
                            : "hover:bg-slate-100 text-slate-800 cursor-pointer"
                        }`}
                      >
                        <span>{d.getDate()}</span>
                        {isHoliday && <span className="h-1.5 w-1.5 rounded-full bg-rose-600 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-[10px] text-slate-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-rose-500" />
                      <span className="font-bold text-rose-700">🇨🇱 Feriados Oficiales (Cerrado)</span>
                    </div>
                    <span>Lun a Sáb (Desde mañana)</span>
                  </div>
                  <p className="text-[10px] text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200 font-medium">
                    ℹ️ Las horas por internet solo pueden tomarse desde el día siguiente.
                  </p>
                </div>
              </Card>

              {/* Bloques de Horarios de 30 Minutos */}
              <div className="lg:col-span-6 space-y-4">
                <Card className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">
                        {selectedDateStr ? `Bloques de 30 min para el ${selectedDateStr}` : "Selecciona un día en el calendario"}
                      </h3>
                      <p className="text-[11px] text-slate-500 italic">
                        Profesor: <strong>{effectiveAssignedTeacherName}</strong> ({currentInstrument.name}) • Duración: <strong>30 minutos</strong>
                      </p>
                    </div>
                  </div>

                  {/* Filtro de Turnos */}
                  <div className="flex gap-1.5 p-1 bg-slate-50 rounded-2xl">
                    {[
                      { id: "ALL", label: "Todos" },
                      { id: "MORNING", label: "Mañana" },
                      { id: "AFTERNOON", label: "Tarde" },
                      { id: "EVENING", label: "Vespertino" },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setTimeOfDayFilter(f.id as any)}
                        className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all ${
                          timeOfDayFilter === f.id ? "bg-white shadow-sm text-[#70125F]" : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Lista de Slots */}
                  {!selectedDateStr ? (
                    <div className="py-12 text-center text-slate-400 text-xs italic space-y-2">
                      <CalendarIcon className="h-8 w-8 mx-auto text-slate-300" />
                      <p>Haz clic en un día disponible del calendario para ver los bloques de 30 minutos.</p>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs italic space-y-2">
                      <AlertCircle className="h-8 w-8 mx-auto text-amber-400" />
                      <p>No hay bloques de 30 min disponibles para el filtro seleccionado en esta fecha.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                      {availableSlots.map((slot) => {
                        const isChosen = selectedSlot?.start === slot.start;
                        return (
                          <button
                            key={slot.start}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-3 px-2 rounded-2xl border text-xs font-mono font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                              isChosen
                                ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105"
                                : "border-slate-100 bg-slate-50 hover:border-slate-300 text-slate-800"
                            }`}
                          >
                            <span>{slot.start}</span>
                            <span className={`text-[9px] font-sans ${isChosen ? "text-emerald-100" : "text-slate-400"}`}>
                              a {slot.end} (30m)
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => changeStep(3)}
                className="rounded-2xl h-12 px-6 font-bold text-xs uppercase tracking-wider"
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Volver
              </Button>
              <Button
                disabled={!selectedDateStr || !selectedSlot}
                onClick={() => changeStep(5)}
                className="bg-[#70125F] hover:bg-[#8e1779] text-white rounded-2xl h-12 px-8 font-bold uppercase tracking-wider text-xs shadow-lg shadow-[#70125F]/20 cursor-pointer gap-2 disabled:opacity-50"
              >
                Continuar a Ficha, Reglamento y Pago <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* PASO 5: FICHA DEL ESTUDIANTE, REGLAMENTO Y PAGO ANTICIPADO */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#70125F]">Paso 5 de 5</span>
              <h2 className="text-2xl font-bold font-serif text-slate-900">
                Ficha del Alumno, Aceptación de Reglamento y Pago
              </h2>
              <p className="text-slate-500 text-xs italic">
                Recuerda: ninguna Clase de Prueba queda registrada ni agendada sin pago previo.
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <Card className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm space-y-6">
                {/* Tipo de Alumno */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#70125F]">
                    ¿Para quién es la clase de {currentInstrument.name}?
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPatientType("ADULT")}
                      className={`p-4 rounded-2xl border-2 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        patientType === "ADULT"
                          ? "border-[#70125F] bg-[#70125F]/5 text-[#70125F]"
                          : "border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200"
                      }`}
                    >
                      <User className="h-4 w-4" /> Para mí (Joven / Adulto)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPatientType("MINOR")}
                      className={`p-4 rounded-2xl border-2 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        patientType === "MINOR"
                          ? "border-[#70125F] bg-[#70125F]/5 text-[#70125F]"
                          : "border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200"
                      }`}
                    >
                      <Users className="h-4 w-4" /> Para mi hijo/a (Menor de edad)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Nombre del Alumno *
                    </label>
                    <Input
                      required
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      placeholder="Ej: Sofía"
                      className="h-12 bg-slate-50 border-none rounded-2xl text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Apellidos del Alumno *
                    </label>
                    <Input
                      required
                      value={formData.apellido}
                      onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                      placeholder="Ej: Sepúlveda Morales"
                      className="h-12 bg-slate-50 border-none rounded-2xl text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#70125F]">
                      Edad del Alumno (Años) *
                    </label>
                    <Input
                      required
                      type="number"
                      min={1}
                      max={99}
                      value={formData.edad}
                      onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
                      placeholder={`Mínimo ${currentInstrument.minAge} años`}
                      className={`h-12 border rounded-2xl text-xs font-bold ${
                        isAgeBelowMinimum
                          ? "bg-rose-50 border-rose-400 text-rose-800"
                          : "bg-slate-50 border-transparent"
                      }`}
                    />
                    {methodologyLabel && (
                      <p
                        className={`text-[10px] font-bold ${
                          isAgeBelowMinimum ? "text-rose-600" : "text-emerald-700"
                        }`}
                      >
                        {isAgeBelowMinimum ? `⚠️ ${methodologyLabel}` : `✓ ${methodologyLabel}`}
                      </p>
                    )}
                  </div>

                  {(patientType === "MINOR" || (parsedAge !== null && parsedAge < 18)) && (
                    <div className="md:col-span-3 space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Nombre del Apoderado / Tutor Responsable *
                      </label>
                      <Input
                        required
                        value={formData.tutorNombre}
                        onChange={(e) => setFormData({ ...formData, tutorNombre: e.target.value })}
                        placeholder="Ej: Carlos Sepúlveda"
                        className="h-12 bg-slate-50 border-none rounded-2xl text-xs font-bold"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Teléfono WhatsApp de Contacto *
                    </label>
                    <Input
                      required
                      value={formData.telefono}
                      onChange={handlePhoneChange}
                      placeholder="+56912345678"
                      className="h-12 bg-slate-50 border-none rounded-2xl text-xs font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Correo Electrónico *
                    </label>
                    <Input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="correo@ejemplo.cl"
                      className="h-12 bg-slate-50 border-none rounded-2xl text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Nivel de Experiencia Musical
                    </label>
                    <select
                      value={formData.nivel}
                      onChange={(e) => setFormData({ ...formData, nivel: e.target.value })}
                      className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-xs font-bold outline-none text-slate-800"
                    >
                      <option value="Principiante (Desde cero)">Principiante (Desde cero)</option>
                      <option value="Básico (Toco algunas canciones)">Básico (Toco algunas canciones)</option>
                      <option value="Intermedio (Lectura de partituras)">Intermedio (Lectura de partituras)</option>
                      <option value="Avanzado / Preparación a Conservatorio">Avanzado / Preparación a Conservatorio</option>
                    </select>
                  </div>

                  <div className="md:col-span-3 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Motivo o Comentarios Adicionales (Opcional)
                    </label>
                    <Textarea
                      value={formData.motivo}
                      onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                      placeholder="Cuéntanos qué estilo te interesa o si el alumno tiene conocimientos previos..."
                      className="min-h-[70px] bg-slate-50 border-none rounded-2xl p-4 text-xs resize-none"
                    />
                  </div>
                </div>

                {/* SECCIÓN DE PAGO OBLIGATORIO (LINK DE PAGO O TRANSFERENCIA) */}
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                    <div className="space-y-1 text-xs text-amber-900">
                      <p className="font-extrabold uppercase tracking-wider">
                        Requisito Indispensable: Pago Anticipado de Clase de Prueba (${Number(trialPrice).toLocaleString("es-CL")} CLP)
                      </p>
                      <p>
                        <strong>Ninguna clase de prueba queda agendada ni reservada sin haber sido pagada con antelación.</strong> Selecciona tu medio de pago a continuación:
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("ONLINE")}
                      className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer space-y-2 ${
                        paymentMethod === "ONLINE"
                          ? "border-emerald-600 bg-emerald-50/50 shadow-md"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-extrabold text-sm text-slate-900">
                          <CreditCard className="h-5 w-5 text-emerald-600" />
                          Link de Pago Online (Webpay / Mercado Pago)
                        </div>
                        <Badge className="bg-emerald-600 text-white text-[9px] uppercase">Confirmación Inmediata</Badge>
                      </div>
                      <p className="text-xs text-slate-600">
                        Paga con tarjeta de débito o crédito (${Number(trialPrice).toLocaleString("es-CL")} CLP) y deja tu clase 100% confirmada de inmediato.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("TRANSFER")}
                      className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer space-y-2 ${
                        paymentMethod === "TRANSFER"
                          ? "border-[#70125F] bg-[#70125F]/5 shadow-md"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-extrabold text-sm text-slate-900">
                          <Landmark className="h-5 w-5 text-[#70125F]" />
                          Transferencia Bancaria
                        </div>
                        <Badge variant="outline" className="border-amber-400 text-amber-800 bg-amber-50 text-[9px] uppercase">
                          Plazo hasta las 20:00 hrs
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600">
                        Realiza la transferencia por ${Number(trialPrice).toLocaleString("es-CL")} CLP y envía el comprobante por WhatsApp antes de las 20:00 hrs para activar tu reserva.
                      </p>
                    </button>
                  </div>

                  {paymentMethod === "TRANSFER" && (
                    <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#DCA060]">
                          Datos Oficiales para Transferencia Bancaria (${Number(trialPrice).toLocaleString("es-CL")} CLP)
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(bankTransferDetails);
                            toast.success("Datos de transferencia copiados al portapapeles");
                          }}
                          className="h-7 text-[10px] bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          <Copy className="h-3 w-3 mr-1" /> Copiar Datos
                        </Button>
                      </div>
                      <pre className="text-xs font-mono whitespace-pre-wrap text-slate-200 leading-relaxed">
                        {bankTransferDetails}
                      </pre>
                    </div>
                  )}
                </div>

                {/* ACEPTACIÓN DE REGLAMENTO Y TÉRMINOS Y CONDICIONES */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-start gap-3">
                    <input
                      id="accept-terms-checkbox"
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-[#70125F] focus:ring-[#70125F] cursor-pointer"
                    />
                    <label htmlFor="accept-terms-checkbox" className="text-xs text-slate-700 leading-relaxed cursor-pointer">
                      He leído y acepto los{" "}
                      <button
                        type="button"
                        onClick={() => setTermsModalOpen(true)}
                        className="font-extrabold text-[#70125F] underline hover:text-[#590e4b]"
                      >
                        Términos, Condiciones y Reglamento Interno de Academia Détaché
                      </button>{" "}
                      (incluyendo la política de 30 minutos de clase de prueba y que ninguna reserva queda agendada sin pago previo). *
                    </label>
                  </div>
                </div>

                {/* Resumen de tu Reserva */}
                <div className="bg-[#70125F]/5 rounded-2xl p-4 border border-[#70125F]/15 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900">
                      Resumen: Clase de Prueba de {currentInstrument.name} (30 minutos)
                    </p>
                    <p className="text-slate-600">
                      Profesor: <strong>{effectiveAssignedTeacherName}</strong> • Fecha: <strong>{selectedDateStr}</strong> de{" "}
                      <strong>{selectedSlot?.start} a {selectedSlot?.end} hrs</strong>
                    </p>
                  </div>
                  <Badge className="bg-[#70125F] text-white font-bold text-xs px-3 py-1">
                    Valor a Pagar: ${Number(trialPrice).toLocaleString("es-CL")} CLP
                  </Badge>
                </div>
              </Card>

              <div className="flex items-center justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => changeStep(4)}
                  className="rounded-2xl h-12 px-6 font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" /> Volver
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || isCreatingPayment || isAgeBelowMinimum || !acceptedTerms}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-12 px-8 font-bold uppercase tracking-wider text-xs shadow-xl shadow-emerald-600/20 cursor-pointer gap-2 disabled:opacity-50"
                >
                  {isSubmitting || isCreatingPayment ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Procesando Solicitud...
                    </span>
                  ) : paymentMethod === "ONLINE" ? (
                    <span className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" /> Ir a Pagar Clase de Prueba (${Number(trialPrice).toLocaleString("es-CL")})
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Landmark className="h-4 w-4" /> Registrar Pre-Reserva y Ver Instrucciones de Pago
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* PASO 6: ESTADO DE PRE-RESERVA PENDIENTE DE PAGO */}
        {step === 6 && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 max-w-2xl mx-auto py-8">
            <Card className="rounded-[2.5rem] border-2 border-amber-300 shadow-2xl bg-white overflow-hidden text-center p-8 sm:p-12 space-y-6 relative">
              <div className="h-20 w-20 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <AlertTriangle className="h-10 w-10" />
              </div>

              <div className="space-y-2">
                <Badge className="bg-amber-100 text-amber-900 border border-amber-300 font-mono text-xs px-3 py-1 font-bold">
                  SOLICITUD PRE-RESERVA: {bookingFolio} • PENDIENTE DE PAGO
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-slate-900">
                  ⚠️ Falta tu Pago para Confirmar la Clase
                </h2>
                <p className="text-amber-900 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs sm:text-sm font-semibold leading-relaxed">
                  IMPORTANTE: Tu clase de prueba aún NO está agendada definitivamente. Ninguna hora queda confirmada sin pago previo (${Number(trialPrice).toLocaleString("es-CL")} CLP) antes de las 20:00 hrs.
                </p>
              </div>

              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 text-left space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Alumno / Edad:</span>
                  <span className="font-bold text-slate-900">
                    {formData.nombre} {formData.apellido} ({formData.edad} años)
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Instrumento (30 min):</span>
                  <span className="font-bold text-[#70125F]">
                    {currentInstrument.emoji} {currentInstrument.name}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Profesor Especialista:</span>
                  <span className="font-bold text-slate-900">{effectiveAssignedTeacherName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Fecha & Bloque (30m):</span>
                  <span className="font-bold text-amber-700">
                    {selectedDateStr} ({selectedSlot?.start} a {selectedSlot?.end} hrs)
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Monto a Pagar:</span>
                  <span className="font-mono font-black text-base text-[#70125F]">
                    ${Number(trialPrice).toLocaleString("es-CL")} CLP
                  </span>
                </div>
              </div>

              {/* Datos de Transferencia en Paso 6 */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#DCA060]">
                    Datos para Transferencia Bancaria
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(bankTransferDetails);
                      toast.success("Datos copiados");
                    }}
                    className="h-7 text-[10px] bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <Copy className="h-3 w-3 mr-1" /> Copiar
                  </Button>
                </div>
                <pre className="text-xs font-mono whitespace-pre-wrap text-slate-200 leading-relaxed">
                  {bankTransferDetails}
                </pre>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Button
                  type="button"
                  onClick={handlePayNowFromStep6}
                  disabled={isCreatingPayment}
                  className="w-full bg-[#70125F] hover:bg-[#590e4b] text-white rounded-2xl h-12 font-bold text-xs uppercase tracking-wider gap-2 shadow-lg cursor-pointer"
                >
                  <CreditCard className="h-4 w-4" /> Pagar Ahora con Link de Pago Online (${Number(trialPrice).toLocaleString("es-CL")})
                </Button>

                <a
                  href={`https://wa.me/${(globalSettings?.whatsappNumber || "+56964279239").replace(/\D/g, "")}?text=${encodeURIComponent(
                    `Hola Academia Détaché 🎻, acabo de solicitar una Pre-Reserva de Clase de Prueba de ${currentInstrument.name} (30 min) con ${effectiveAssignedTeacherName} para el ${selectedDateStr} a las ${selectedSlot?.start} hrs (Folio: ${bookingFolio}). Alumno: ${formData.nombre} ${formData.apellido} (${formData.edad} años). Adjunto mi comprobante de pago para confirmar mi cupo.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-12 font-bold text-xs uppercase tracking-wider gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer">
                    <Send className="h-4 w-4" /> Enviar Comprobante de Pago por WhatsApp
                  </Button>
                </a>
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* Modal Reglamento Interno y Términos y Condiciones */}
      <Dialog open={termsModalOpen} onOpenChange={setTermsModalOpen}>
        <DialogContent className="sm:max-w-2xl rounded-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl flex items-center gap-2 text-[#70125F]">
              <FileText className="h-5 w-5" /> Reglamento Interno y Términos y Condiciones
            </DialogTitle>
            <DialogDescription>
              Normativa oficial de Academia de Música Détaché para Clases de Prueba y Planes Regulares.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="bg-[#70125F]/5 border border-[#70125F]/15 rounded-2xl p-4 text-xs space-y-2">
              <p className="font-bold text-[#70125F] uppercase tracking-wider">Regla de Edades por Instrumento:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-semibold text-slate-700">
                <span>🎹 Piano: 4+ años</span>
                <span>🎤 Canto: 6+ años</span>
                <span>🥁 Batería: 6+ años</span>
                <span>🎸 Guitarra: 8+ años</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {termsText}
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link href="/terms" target="_blank" className="text-xs font-bold text-[#70125F] underline">
                Ver en página completa (/terms) ↗
              </Link>
              <Button
                type="button"
                onClick={() => {
                  setAcceptedTerms(true);
                  setTermsModalOpen(false);
                }}
                className="bg-[#70125F] hover:bg-[#590e4b] text-white rounded-xl text-xs font-bold"
              >
                Aceptar Reglamento y Continuar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#70125F]" />
        </div>
      }
    >
      <BookPageContent />
    </Suspense>
  );
}
