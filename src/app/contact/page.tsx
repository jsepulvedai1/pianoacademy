"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client/react/index.js";
import { CREATE_LEAD } from "@/graphql/mutations/lead-mutations";
import { CREATE_PRE_RESERVATION } from "@/graphql/mutations/lesson-mutations";
import { GET_TEACHERS } from "@/graphql/queries/get-teachers";
import { GET_INSTRUMENTS } from "@/graphql/queries/get-instruments";
import { GET_RESERVATIONS } from "@/graphql/queries/get-reservations";
import { GET_CONTACT_CONTENT } from "@/graphql/queries/get-contact";
import { GET_GLOBAL_SETTINGS } from "@/graphql/queries/get-global-settings";
import { getImageUrl, normalizePhoneNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Phone,
  Mail,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Calendar as CalendarIcon,
  Clock,
  User,
  Music,
  Users,
  Sparkles,
  Building,
  Video,
  ShieldCheck,
  CalendarCheck,
  Send,
  MessageSquare,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

// --- Time helpers ---
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

function generateSlots(startTimeStr: string, endTimeStr: string, slotDuration = 45): { start: string; end: string }[] {
  const startMins = timeToMinutes(startTimeStr);
  const endMins = timeToMinutes(endTimeStr);
  const slots: { start: string; end: string }[] = [];

  for (let current = startMins; current + slotDuration <= endMins; current += 45) {
    slots.push({
      start: minutesToTime(current),
      end: minutesToTime(current + slotDuration)
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
  SUNDAY: "Domingo"
};

const MONTHS_SPANISH = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

function getDayNameSpanish(date: Date): string {
  const daysOfWeekSpanish = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  return daysOfWeekSpanish[date.getDay()];
}

export default function ContactPage() {
  const [activeTab, setActiveTab] = useState<"BOOKING" | "GENERAL_INQUIRY">("BOOKING");

  // Clinical Booking State
  const [step, setStep] = useState(1);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("Clase de Prueba");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("ANY");
  const [selectedModality, setSelectedModality] = useState<"PRESENCIAL" | "ONLINE">("PRESENCIAL");
  const [selectedDateStr, setSelectedDateStr] = useState<string>("");
  const [timeOfDayFilter, setTimeOfDayFilter] = useState<"ALL" | "MORNING" | "AFTERNOON" | "EVENING">("ALL");

  // Patient / Student Form
  const [patientType, setPatientType] = useState<"ADULT" | "MINOR">("ADULT");
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    tutorNombre: "",
    rut: "",
    email: "",
    telefono: "+569",
    nivel: "Principiante (Desde cero)",
    motivo: ""
  });

  const [bookingFolio, setBookingFolio] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // General Inquiry State
  const [inquiryData, setInquiryData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "+569",
    mensaje: ""
  });
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Queries
  const { data: contactData } = useQuery<any>(GET_CONTACT_CONTENT);
  const { data: globalSettingsData } = useQuery<any>(GET_GLOBAL_SETTINGS);
  const { data: teachersData } = useQuery<any>(GET_TEACHERS);
  const { data: reservationsData } = useQuery<any>(GET_RESERVATIONS);

  const contact = contactData?.contactContent;
  const globalSettings = globalSettingsData?.globalSettings;
  const teachers = teachersData?.allTeachers || [];
  const lessons = reservationsData?.allLessons || [];

  const bannerTitle1 = contact?.bannerTitle1 || "Sigamos";
  const bannerTitle2 = contact?.bannerTitle2 || "compartiendo";
  const bannerTitle3 = contact?.bannerTitle3 || "el lenguaje de";
  const bannerTitle4 = contact?.bannerTitle4 || "la música";

  const locationTitle = contact?.locationTitle || "Estamos cerca de ti";
  const locationDescription = contact?.locationDescription || "Nuestra academia se encuentra en una ubicación estratégica y de fácil acceso, para que llegar a tus clases sea cómodo y sencillo.";
  const locationAddressTitle = contact?.locationAddressTitle || "Dirección Sede";
  const locationAddress = contact?.locationAddress || "Gran Avenida José Miguel Carrera 8520, Oficina C, La Cisterna.";
  const locationMapIframeUrl = contact?.locationMapIframeUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3326.2307849187313!2d-70.6622543!3d-33.5217965!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662dae3cbf5df1f%3A0xe54fb7a71fbd4fdf!2sGran%20Av.%20Jos%C3%A9%20Miguel%20Carrera%208520%2C%20La%20Cisterna%2C%20Regi%C3%B3n%20Metropolitana!5e0!3m2!1ses-419!2scl!4v1700000000000!5m2!1ses-419!2scl";

  // Teachers available for Clase de Prueba
  const availableTeachers = useMemo(() => {
    return teachers;
  }, [teachers]);

  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string; teacherId?: string; teacherName?: string } | null>(null);

  // Check if a given date has active availability for the selected teacher or candidate teachers
  const isDateAvailableForBooking = (date: Date) => {
    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
    const isSunday = date.getDay() === 0;
    if (isPast || isSunday) return false;

    const dayName = getDayNameSpanish(date);

    if (selectedTeacherId !== "ANY") {
      const teacher = teachers.find((t: any) => t.id === selectedTeacherId);
      if (!teacher) return false;
      const hasAvail = teacher.availabilities && teacher.availabilities.length > 0;
      if (!hasAvail) return true; // Default active on Mon-Sat if not customized
      return teacher.availabilities.some((av: any) => {
        const daySpanish = DAY_MAP_EN_TO_ES[av.day.toUpperCase()] || av.day;
        return daySpanish.toLowerCase() === dayName.toLowerCase();
      });
    } else {
      const candidates = availableTeachers.length > 0 ? availableTeachers : teachers;
      if (candidates.length === 0) return true;
      return candidates.some((t: any) => {
        const hasAvail = t.availabilities && t.availabilities.length > 0;
        if (!hasAvail) return true;
        return t.availabilities.some((av: any) => {
          const daySpanish = DAY_MAP_EN_TO_ES[av.day.toUpperCase()] || av.day;
          return daySpanish.toLowerCase() === dayName.toLowerCase();
        });
      });
    }
  };

  // Slot calculations: strictly based on teacher availabilities minus booked lessons
  const availableSlots = useMemo(() => {
    if (!selectedDateStr) return [];

    const dateParts = selectedDateStr.split("-");
    const dateObj = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
    const dayName = getDayNameSpanish(dateObj);

    const candidateTeachers = selectedTeacherId === "ANY"
      ? (availableTeachers.length > 0 ? availableTeachers : teachers)
      : teachers.filter((t: any) => t.id === selectedTeacherId);

    const slotMap = new Map<string, { start: string; end: string; teacherId?: string; teacherName?: string }>();

    candidateTeachers.forEach((teacher: any) => {
      const activeAvailabilities = teacher.availabilities?.filter((av: any) => {
        const daySpanish = DAY_MAP_EN_TO_ES[av.day.toUpperCase()] || av.day;
        return daySpanish.toLowerCase() === dayName.toLowerCase();
      }) || [];

      let generated: { start: string; end: string }[] = [];
      if (activeAvailabilities.length > 0) {
        activeAvailabilities.forEach((av: any) => {
          generated.push(...generateSlots(av.startTime, av.endTime, 45));
        });
      } else {
        // Default availability: 09:00 - 20:00
        generated = generateSlots("09:00", "20:00", 45);
      }

      // Filter out existing occupied lessons for this teacher on this day
      const occupiedLessons = lessons.filter((l: any) => {
        if (l.date !== selectedDateStr) return false;
        if (l.status === "CANCELLED") return false;
        if (l.teacher?.id !== teacher.id) return false;
        return true;
      });

      generated.forEach((slot) => {
        const isOccupied = occupiedLessons.some((l: any) => {
          const lessonStart = l.startTime?.slice(0, 5);
          return lessonStart === slot.start;
        });

        if (!isOccupied && !slotMap.has(slot.start)) {
          slotMap.set(slot.start, {
            start: slot.start,
            end: slot.end,
            teacherId: teacher.id,
            teacherName: teacher.name
          });
        }
      });
    });

    const sortedSlots = Array.from(slotMap.values()).sort(
      (a, b) => timeToMinutes(a.start) - timeToMinutes(b.start)
    );

    if (timeOfDayFilter === "MORNING") {
      return sortedSlots.filter(s => parseInt(s.start.split(":")[0]) < 13);
    }
    if (timeOfDayFilter === "AFTERNOON") {
      return sortedSlots.filter(s => {
        const h = parseInt(s.start.split(":")[0]);
        return h >= 13 && h < 18;
      });
    }
    if (timeOfDayFilter === "EVENING") {
      return sortedSlots.filter(s => parseInt(s.start.split(":")[0]) >= 18);
    }

    return sortedSlots;
  }, [selectedDateStr, selectedTeacherId, availableTeachers, teachers, lessons, timeOfDayFilter]);

  const effectiveAssignedTeacherName = useMemo(() => {
    if (selectedSlot?.teacherName) return selectedSlot.teacherName;
    if (selectedTeacherId !== "ANY") {
      return teachers.find((t: any) => t.id === selectedTeacherId)?.name || "Profesor Asignado";
    }
    return availableTeachers.length > 0 ? availableTeachers[0].name : "Profesor Asignado";
  }, [selectedSlot, selectedTeacherId, teachers, availableTeachers]);

  // Mutations
  const [createPreReservation, { loading: isSubmittingBooking }] = useMutation(CREATE_PRE_RESERVATION, {
    refetchQueries: [{ query: GET_RESERVATIONS }],
    onCompleted: (res: any) => {
      if (res.createPreReservation?.success) {
        const randomFolio = `DET-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        setBookingFolio(randomFolio);
        setStep(6);
        toast.success("¡Clase inicial pre-reservada con éxito! 🎉");
      } else {
        toast.error("Hubo un problema al registrar la reserva. Intenta nuevamente.");
      }
    },
    onError: (err) => {
      toast.error("Error al agendar: " + err.message);
    }
  });

  const [createLead, { loading: isSubmittingInquiry }] = useMutation(CREATE_LEAD, {
    onCompleted: () => {
      setInquirySuccess(true);
      toast.success("¡Mensaje enviado con éxito! Te contactaremos a la brevedad.");
    },
    onError: (err) => {
      toast.error("Hubo un error al enviar tu mensaje: " + err.message);
    }
  });

  const changeStep = (nextStep: number) => {
    setStep(nextStep);
    setTimeout(() => {
      const container = document.getElementById("contact-wizard");
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, isBooking = true) => {
    let value = e.target.value;
    if (!value.startsWith("+569")) {
      value = "+569";
    }
    const suffix = value.slice(4);
    const cleanSuffix = suffix.replace(/\D/g, "");
    const limitedSuffix = cleanSuffix.slice(0, 8);
    if (isBooking) {
      setFormData({ ...formData, telefono: "+569" + limitedSuffix });
    } else {
      setInquiryData({ ...inquiryData, telefono: "+569" + limitedSuffix });
    }
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.apellido || formData.telefono.length !== 12 || !formData.email) {
      toast.error("Por favor completa los campos obligatorios del paciente/alumno.");
      return;
    }

    if (!selectedSlot || !selectedDateStr) {
      toast.error("Selecciona una fecha y horario para tu cita.");
      return;
    }

    const teacherToAssign = effectiveAssignedTeacherName;
    const studentFullName = `${formData.nombre} ${formData.apellido}`.trim();
    const combinedNotes = `[${selectedModality}] Paciente: ${patientType === "MINOR" ? `Menor (Tutor: ${formData.tutorNombre || "No indicado"})` : "Titular"} | RUT: ${formData.rut || "No indicado"} | Nivel: ${formData.nivel} | Motivo: ${formData.motivo || "Clase Inicial"}`;

    createPreReservation({
      variables: {
        nombre: studentFullName,
        telefono: normalizePhoneNumber(formData.telefono),
        email: formData.email,
        profesorNombre: teacherToAssign,
        fecha: selectedDateStr,
        hora: selectedSlot.start,
        servicio: selectedSpecialty,
        notas: combinedNotes
      }
    });
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryData.nombre || inquiryData.telefono.length !== 12 || !inquiryData.email) {
      toast.error("Por favor completa los campos requeridos.");
      return;
    }

    const detailedEmail = `${inquiryData.email} | Consulta: ${inquiryData.mensaje || "Sin mensaje"}`;

    createLead({
      variables: {
        nombre: `${inquiryData.nombre} ${inquiryData.apellido}`.trim(),
        telefono: normalizePhoneNumber(inquiryData.telefono),
        email: detailedEmail,
        servicio: "CONSULTA_GENERAL",
        fuente: "Contacto Web"
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 text-slate-800 font-sans">
      
      {/* ── 1. Hero Header Banner ── */}
      <header className="relative min-h-[35vh] flex items-center justify-start overflow-hidden bg-slate-900 text-white py-16 px-4 sm:px-8 border-b border-slate-800">
        <div className="absolute inset-0 z-0">
          <img
            src="/imagesfooter/4.png"
            alt="Contacto Détaché"
            className="w-full h-full object-cover filter grayscale contrast-125 opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-[#70125F]/30" />
        </div>

        <div className="max-w-5xl mx-auto w-full relative z-10 space-y-4">
          <span className="text-[10px] uppercase tracking-[0.3em] font-extrabold text-[#DCA060] bg-white/10 px-3 py-1 rounded-full border border-white/10">
            Atención Oficial Détaché
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif tracking-tight leading-tight">
            Agenda tu Clase Inicial <br />
            <span className="text-[#DCA060]">& Canales de Contacto</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Reserva tu evaluación inicial guiada estilo clínica médica con confirmación en vivo, o envíanos una consulta directa a nuestro equipo.
          </p>

          {/* Mode Switcher Tabs */}
          <div className="pt-2 flex gap-3">
            <button
              onClick={() => setActiveTab("BOOKING")}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "BOOKING"
                  ? "bg-[#70125F] text-white shadow-lg shadow-[#70125F]/30 ring-2 ring-white/20"
                  : "bg-white/10 hover:bg-white/20 text-slate-200"
              }`}
            >
              <CalendarCheck className="h-4 w-4" /> Agendar Clase Inicial (Estilo Clínica)
            </button>
            <button
              onClick={() => setActiveTab("GENERAL_INQUIRY")}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "GENERAL_INQUIRY"
                  ? "bg-[#70125F] text-white shadow-lg shadow-[#70125F]/30 ring-2 ring-white/20"
                  : "bg-white/10 hover:bg-white/20 text-slate-200"
              }`}
            >
              <MessageSquare className="h-4 w-4" /> Mensaje / Consulta General
            </button>
          </div>
        </div>
      </header>

      {/* ── 2. Main Section ── */}
      <section id="contact-wizard" className="py-8 md:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 space-y-8">
          
          {/* ──────── TAB 1: CLINICAL BOOKING WIZARD ──────── */}
          {activeTab === "BOOKING" && (
            <div className="space-y-6">
              
              {/* Stepper Navigation */}
              <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-100 flex items-center justify-between overflow-x-auto gap-2">
                {[
                  { n: 1, label: "Clase de Prueba" },
                  { n: 2, label: "Profesional" },
                  { n: 3, label: "Sede Presencial" },
                  { n: 4, label: "Fecha y Hora" },
                  { n: 5, label: "Ficha Alumno" },
                  { n: 6, label: "Comprobante" },
                ].map((s) => {
                  const isCompleted = step > s.n;
                  const isCurrent = step === s.n;
                  return (
                    <div 
                      key={s.n} 
                      onClick={() => {
                        if (s.n < step && step !== 6) changeStep(s.n);
                      }}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl transition-all select-none whitespace-nowrap ${
                        isCurrent 
                          ? "bg-[#70125F] text-white font-bold shadow-md shadow-[#70125F]/20" 
                          : isCompleted 
                          ? "text-emerald-700 bg-emerald-50 cursor-pointer hover:bg-emerald-100 font-semibold" 
                          : "text-slate-400"
                      }`}
                    >
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-black ${
                        isCurrent 
                          ? "bg-white text-[#70125F]" 
                          : isCompleted 
                          ? "bg-emerald-600 text-white" 
                          : "bg-slate-100 text-slate-400"
                      }`}>
                        {isCompleted ? "✓" : s.n}
                      </div>
                      <span className="text-xs tracking-tight">{s.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* PASO 1: CLASE DE PRUEBA */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#70125F]">Paso 1 de 5</span>
                    <h2 className="text-2xl font-bold font-serif text-slate-900">Servicio de Clase de Prueba</h2>
                    <p className="text-slate-500 text-xs italic">
                      Sesión individual de diagnóstico y evaluación inicial con un docente especialista.
                    </p>
                  </div>

                  <Card
                    onClick={() => setSelectedSpecialty("Clase de Prueba")}
                    className="rounded-3xl border-2 border-[#70125F] bg-[#70125F]/5 shadow-xl shadow-[#70125F]/10 ring-2 ring-[#70125F]/20 p-8 cursor-pointer relative overflow-hidden transition-all"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                      <div className="flex items-start sm:items-center gap-5">
                        <div className="h-16 w-16 rounded-2xl bg-[#70125F] text-white flex items-center justify-center text-3xl shrink-0 shadow-md">
                          🎓
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-xl text-slate-900">Clase de Prueba (Evaluación Inicial)</h3>
                            <Badge className="bg-emerald-600 text-white text-[9px] uppercase font-bold">Servicio Oficial</Badge>
                          </div>
                          <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                            Sesión diagnóstica personalizada de 45 minutos. Evaluación de nivel técnico, musical y postural, resolución de dudas y planificación de objetivos formativos con un profesor de la academia.
                          </p>
                          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-[#70125F] font-semibold">
                            <span>✓ 45 minutos de duración</span>
                            <span className="text-slate-300">•</span>
                            <span>✓ Modalidad Presencial u Online</span>
                            <span className="text-slate-300">•</span>
                            <span>✓ Asignación docente personalizada</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex sm:flex-col items-center gap-1.5 self-end sm:self-center">
                        <div className="h-8 w-8 rounded-full bg-[#70125F] text-white flex items-center justify-center font-bold text-sm shadow">
                          ✓
                        </div>
                        <span className="text-[10px] uppercase font-bold text-[#70125F]">Seleccionado</span>
                      </div>
                    </div>
                  </Card>

                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={() => changeStep(2)}
                      className="bg-[#70125F] hover:bg-[#8e1779] text-white rounded-2xl h-12 px-8 font-bold uppercase tracking-wider text-xs shadow-lg shadow-[#70125F]/20 cursor-pointer gap-2"
                    >
                      Continuar a Profesional <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* PASO 2: PROFESIONAL */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#70125F]">Paso 2 de 5</span>
                    <h2 className="text-2xl font-bold font-serif text-slate-900">Selecciona al Profesional Docente</h2>
                    <p className="text-slate-500 text-xs italic">Elige al profesor especialista o permite que el sistema asigne el primer horario disponible.</p>
                  </div>

                  {/* Any Teacher */}
                  <Card
                    onClick={() => setSelectedTeacherId("ANY")}
                    className={`rounded-3xl border-2 transition-all cursor-pointer p-6 ${
                      selectedTeacherId === "ANY"
                        ? "border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-600/20"
                        : "border-slate-100 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                          <Sparkles className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-slate-900">Cualquier Profesional Disponible</h3>
                            <Badge className="bg-emerald-600 text-white text-[9px] uppercase font-bold">Recomendado</Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">Mayor disponibilidad horaria y asignación inmediata según tu horario de preferencia.</p>
                        </div>
                      </div>
                      <div className="h-6 w-6 rounded-full border-2 flex items-center justify-center font-bold text-xs border-emerald-600 bg-emerald-600 text-white">
                        {selectedTeacherId === "ANY" ? "✓" : ""}
                      </div>
                    </div>
                  </Card>

                  {/* Individual Teachers Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {availableTeachers.map((teacher: any) => {
                      const isSelected = selectedTeacherId === teacher.id;
                      return (
                        <Card
                          key={teacher.id}
                          onClick={() => setSelectedTeacherId(teacher.id)}
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
                              <p className="text-xs text-slate-500 line-clamp-2">{teacher.description || "Docente certificado en formación académica."}</p>
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
                              {isSelected ? "● Seleccionado" : "Elegir este docente"}
                            </span>
                            <div className={`h-5 w-5 rounded-full border flex items-center justify-center text-[10px] ${
                              isSelected ? "bg-[#70125F] text-white border-[#70125F]" : "border-slate-300"
                            }`}>
                              {isSelected ? "✓" : ""}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() => changeStep(1)}
                      className="rounded-2xl h-12 px-6 font-bold text-xs uppercase tracking-wider cursor-pointer"
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" /> Volver
                    </Button>
                    <Button
                      onClick={() => changeStep(3)}
                      className="bg-[#70125F] hover:bg-[#8e1779] text-white rounded-2xl h-12 px-8 font-bold uppercase tracking-wider text-xs shadow-lg shadow-[#70125F]/20 cursor-pointer gap-2"
                    >
                      Continuar a Sede <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* PASO 3: SEDE PRESENCIAL */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#70125F]">Paso 3 de 5</span>
                    <h2 className="text-2xl font-bold font-serif text-slate-900">Sede Presencial de Atención</h2>
                    <p className="text-slate-500 text-xs italic">Nuestras clases se imparten 100% de manera presencial en nuestra sede oficial.</p>
                  </div>

                  <Card
                    onClick={() => setSelectedModality("PRESENCIAL")}
                    className="rounded-3xl border-2 border-[#70125F] bg-[#70125F]/5 shadow-xl ring-2 ring-[#70125F]/20 p-8 flex flex-col justify-between cursor-pointer"
                  >
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <div className="h-16 w-16 rounded-2xl bg-[#70125F] text-white flex items-center justify-center font-bold shadow-md">
                          <Building className="h-8 w-8" />
                        </div>
                        <Badge className="bg-[#70125F] text-white text-[10px] uppercase font-bold px-3 py-1">Sede Oficial • 100% Presencial</Badge>
                      </div>

                      <div>
                        <h3 className="font-bold text-2xl text-slate-900">Sede La Cisterna (Santiago)</h3>
                        <p className="text-sm text-slate-600 mt-2 font-medium">
                          📍 {globalSettings?.address || "Gran Avenida José Miguel Carrera 8520, Oficina C, La Cisterna."}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-xs text-slate-700 space-y-1">
                          <p className="font-bold text-slate-900">🎹 Instrumentos de Alta Gama</p>
                          <p className="text-[11px] text-slate-500">Pianos acústicos y de cola afinados y calibrados periódicamente.</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-xs text-slate-700 space-y-1">
                          <p className="font-bold text-slate-900">🎧 Salas Climatizadas</p>
                          <p className="text-[11px] text-slate-500">Acondicionamiento acústico profesional y ambiente óptimo.</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-xs text-slate-700 space-y-1">
                          <p className="font-bold text-slate-900">☕ Sala de Espera</p>
                          <p className="text-[11px] text-slate-500">Espacio cómodo para acompañantes, apoderados y alumnos.</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-[#70125F]/10 flex items-center justify-between text-xs font-bold text-[#70125F]">
                      <span className="text-sm">● Sede y Modalidad Presencial Confirmada</span>
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
                      Continuar a Fecha y Hora <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* PASO 4: FECHA Y HORARIO */}
              {step === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#70125F]">Paso 4 de 5</span>
                    <h2 className="text-2xl font-bold font-serif text-slate-900">Selecciona Fecha y Horario</h2>
                    <p className="text-slate-500 text-xs italic">Escoge el día en el calendario y haz clic en el bloque de hora que más te acomode.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Calendario */}
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
                          const isAvailable = isDateAvailableForBooking(d);
                          const disabled = !isAvailable;

                          return (
                            <button
                              key={dateFormatted}
                              disabled={disabled}
                              onClick={() => {
                                setSelectedDateStr(dateFormatted);
                                setSelectedSlot(null);
                              }}
                              className={`h-11 rounded-2xl flex items-center justify-center text-xs font-bold transition-all ${
                                isSelected
                                  ? "bg-[#70125F] text-white shadow-md shadow-[#70125F]/30 scale-105"
                                  : disabled
                                  ? "text-slate-300 cursor-not-allowed opacity-40 bg-slate-50/50"
                                  : "hover:bg-slate-100 text-slate-800 cursor-pointer"
                              }`}
                            >
                              {d.getDate()}
                            </button>
                          );
                        })}
                      </div>
                    </Card>

                    {/* Bloques */}
                    <div className="lg:col-span-6 space-y-4">
                      <Card className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-sm text-slate-900">
                              {selectedDateStr ? `Horarios para el ${selectedDateStr}` : "Selecciona un día en el calendario"}
                            </h3>
                            <p className="text-[11px] text-slate-400 italic">Sesiones de 45 minutos de evaluación personalizada.</p>
                          </div>
                        </div>

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

                        {!selectedDateStr ? (
                          <div className="py-12 text-center text-slate-400 text-xs italic space-y-2">
                            <CalendarIcon className="h-8 w-8 mx-auto text-slate-300" />
                            <p>Haz clic en un día del calendario para ver los horarios disponibles.</p>
                          </div>
                        ) : availableSlots.length === 0 ? (
                          <div className="py-12 text-center text-slate-400 text-xs italic space-y-2">
                            <AlertCircle className="h-8 w-8 mx-auto text-amber-400" />
                            <p>No hay bloques disponibles para el filtro seleccionado en esta fecha.</p>
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
                                    hasta {slot.end}
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
                      Continuar a Ficha del Alumno <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* PASO 5: FICHA DEL ALUMNO */}
              {step === 5 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#70125F]">Paso 5 de 5</span>
                    <h2 className="text-2xl font-bold font-serif text-slate-900">Ficha del Alumno e Información de Contacto</h2>
                    <p className="text-slate-500 text-xs italic">Ingresa tus datos para registrar la reserva y enviarte el comprobante de cita médica/musical.</p>
                  </div>

                  <form onSubmit={handleBookingSubmit} className="space-y-6">
                    <Card className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm space-y-6">
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#70125F]">¿Para quién es la clase?</label>
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
                            <User className="h-4 w-4" /> Para mí (Adulto / Jóven)
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Nombre del Alumno *
                          </label>
                          <Input
                            required
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            placeholder="Ej: Sofia"
                            className="h-12 bg-slate-50 border-none rounded-2xl text-xs"
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
                            className="h-12 bg-slate-50 border-none rounded-2xl text-xs"
                          />
                        </div>

                        {patientType === "MINOR" && (
                          <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                              Nombre del Apoderado / Tutor Responsable *
                            </label>
                            <Input
                              required
                              value={formData.tutorNombre}
                              onChange={(e) => setFormData({ ...formData, tutorNombre: e.target.value })}
                              placeholder="Ej: Carlos Sepúlveda"
                              className="h-12 bg-slate-50 border-none rounded-2xl text-xs"
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
                            onChange={(e) => handlePhoneChange(e, true)}
                            placeholder="+56912345678"
                            className="h-12 bg-slate-50 border-none rounded-2xl text-xs font-mono"
                          />
                          <p className="text-[10px] text-slate-400 italic">Te enviaremos el comprobante y recordatorio por WhatsApp.</p>
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
                            className="h-12 bg-slate-50 border-none rounded-2xl text-xs"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            RUT o Identificación (Opcional)
                          </label>
                          <Input
                            value={formData.rut}
                            onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                            placeholder="12.345.678-9"
                            className="h-12 bg-slate-50 border-none rounded-2xl text-xs"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Nivel de Experiencia Musical
                          </label>
                          <select
                            value={formData.nivel}
                            onChange={(e) => setFormData({ ...formData, nivel: e.target.value })}
                            className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-xs outline-none text-slate-800"
                          >
                            <option value="Principiante (Desde cero)">Principiante (Desde cero)</option>
                            <option value="Básico (Toco algunas canciones)">Básico (Toco algunas canciones)</option>
                            <option value="Intermedio (Lectura de partituras)">Intermedio (Lectura de partituras)</option>
                            <option value="Avanzado / Preparación a Conservatorio">Avanzado / Preparación a Conservatorio</option>
                          </select>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Motivo o Metas de la Consulta (Opcional)
                          </label>
                          <Textarea
                            value={formData.motivo}
                            onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                            placeholder="Cuéntanos tus expectativas, qué estilo de música te gusta o si tienes alguna meta en particular..."
                            className="min-h-[90px] bg-slate-50 border-none rounded-2xl p-4 text-xs resize-none"
                          />
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900">Resumen de la Cita:</p>
                          <p className="text-slate-500">
                            {selectedSpecialty} • {selectedModality === "PRESENCIAL" ? "Presencial La Cisterna" : "Online HD"} • {selectedDateStr} a las {selectedSlot?.start} hrs.
                          </p>
                        </div>
                        <Badge className="bg-emerald-600 text-white font-bold text-[10px]">
                          {effectiveAssignedTeacherName}
                        </Badge>
                      </div>
                    </Card>

                    <div className="flex items-center justify-between pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => changeStep(4)}
                        className="rounded-2xl h-12 px-6 font-bold text-xs uppercase tracking-wider"
                      >
                        <ChevronLeft className="mr-1 h-4 w-4" /> Volver
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmittingBooking}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-12 px-10 font-bold uppercase tracking-wider text-xs shadow-xl shadow-emerald-600/20 cursor-pointer gap-2"
                      >
                        {isSubmittingBooking ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" /> Registrando Cita...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" /> Confirmar Pre-Reserva
                          </span>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* PASO 6: COMPROBANTE */}
              {step === 6 && (
                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 max-w-2xl mx-auto py-8">
                  <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white overflow-hidden text-center p-8 sm:p-12 space-y-6 relative">
                    <div className="h-20 w-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                      <CheckCircle2 className="h-10 w-10" />
                    </div>

                    <div className="space-y-2">
                      <Badge className="bg-emerald-100 text-emerald-800 border-0 font-mono text-xs px-3 py-1 font-bold">
                        FOLIO: {bookingFolio}
                      </Badge>
                      <h2 className="text-3xl font-extrabold font-serif text-slate-900">
                        ¡Cita Pre-Reservada con Éxito!
                      </h2>
                      <p className="text-slate-500 text-xs sm:text-sm italic">
                        Hemos registrado tus datos en nuestro sistema. El equipo de recepción coordinará tu confirmación final.
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 text-left space-y-3 text-xs">
                      <div className="flex justify-between border-b border-slate-200/60 pb-2">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">Alumno / Paciente:</span>
                        <span className="font-bold text-slate-900">{formData.nombre} {formData.apellido}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200/60 pb-2">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">Especialidad:</span>
                        <span className="font-bold text-[#70125F]">{selectedSpecialty}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200/60 pb-2">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">Profesional Docente:</span>
                        <span className="font-bold text-slate-900">{effectiveAssignedTeacherName}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200/60 pb-2">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">Modalidad & Sede:</span>
                        <span className="font-bold text-slate-900">
                          {selectedModality === "PRESENCIAL" ? "Presencial (La Cisterna)" : "Online HD"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200/60 pb-2">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">Fecha & Horario:</span>
                        <span className="font-bold text-emerald-700">{selectedDateStr} a las {selectedSlot?.start} hrs</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">Teléfono Registrado:</span>
                        <span className="font-mono font-bold text-slate-900">{formData.telefono}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <a
                        href={`https://wa.me/${(globalSettings?.whatsappNumber || "+56964279239").replace(/\D/g, "")}?text=${encodeURIComponent(
                          `Hola Academia Détaché 🎻, acabo de registrar mi cita para ${selectedSpecialty} el ${selectedDateStr} a las ${selectedSlot?.start} hrs (Folio: ${bookingFolio}). Mi nombre es ${formData.nombre} ${formData.apellido}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-12 font-bold text-xs uppercase tracking-wider gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer">
                          <Send className="h-4 w-4" /> Hablar por WhatsApp
                        </Button>
                      </a>

                      <Link href="/" className="flex-1">
                        <Button variant="outline" className="w-full rounded-2xl h-12 font-bold text-xs uppercase tracking-wider">
                          Volver al Inicio
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </div>
              )}

            </div>
          )}

          {/* ──────── TAB 2: GENERAL INQUIRY ──────── */}
          {activeTab === "GENERAL_INQUIRY" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-500">
              <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                {inquirySuccess ? (
                  <div className="text-center py-16 space-y-6 flex flex-col items-center justify-center my-auto">
                    <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center shadow-sm">
                      <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-slate-800">¡Consulta Recibida!</h3>
                    <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed">
                      Hemos recibido tu mensaje. Un coordinador de Academia Détaché se comunicará contigo vía WhatsApp a la brevedad.
                    </p>
                    <Button
                      onClick={() => {
                        setInquirySuccess(false);
                        setInquiryData({ nombre: "", apellido: "", email: "", telefono: "+569", mensaje: "" });
                      }}
                      className="bg-[#70125F] hover:bg-[#590e4b] text-white rounded-xl px-8 h-11 font-bold text-xs"
                    >
                      Enviar otra consulta
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-6 text-left">
                    <div>
                      <h2 className="text-xl font-bold text-[#70125F] font-serif">Envíanos un Mensaje</h2>
                      <p className="text-slate-500 text-xs italic mt-1">Completa los campos para procesar tu consulta directa.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#70125F]">Nombre *</label>
                        <Input
                          required
                          placeholder="Ej: Juan"
                          value={inquiryData.nombre}
                          onChange={(e) => setInquiryData({ ...inquiryData, nombre: e.target.value })}
                          className="h-12 bg-slate-50 border-none text-slate-800 rounded-2xl text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#70125F]">Apellido</label>
                        <Input
                          placeholder="Ej: Pérez"
                          value={inquiryData.apellido}
                          onChange={(e) => setInquiryData({ ...inquiryData, apellido: e.target.value })}
                          className="h-12 bg-slate-50 border-none text-slate-800 rounded-2xl text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#70125F]">Email *</label>
                      <Input
                        required
                        type="email"
                        placeholder="juan@ejemplo.com"
                        value={inquiryData.email}
                        onChange={(e) => setInquiryData({ ...inquiryData, email: e.target.value })}
                        className="h-12 bg-slate-50 border-none text-slate-800 rounded-2xl text-xs"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#70125F]">Teléfono WhatsApp *</label>
                      <Input
                        required
                        placeholder="+56 9 1234 5678"
                        value={inquiryData.telefono}
                        onChange={(e) => handlePhoneChange(e, false)}
                        className="h-12 bg-slate-50 border-none text-slate-800 rounded-2xl font-mono text-xs"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#70125F]">Mensaje *</label>
                      <Textarea
                        required
                        placeholder="Cuéntanos en qué podemos ayudarte..."
                        value={inquiryData.mensaje}
                        onChange={(e) => setInquiryData({ ...inquiryData, mensaje: e.target.value })}
                        className="min-h-[120px] bg-slate-50 border-none text-slate-800 rounded-2xl p-3 resize-none text-xs"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmittingInquiry}
                      className="w-full bg-[#70125F] hover:bg-[#590e4b] text-white rounded-2xl h-12 uppercase text-xs tracking-wider font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmittingInquiry ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      <span>Enviar Mensaje</span>
                    </Button>
                  </form>
                )}
              </div>

              {/* Info Details */}
              <div className="lg:col-span-5 space-y-6">
                <Card className="rounded-3xl border border-slate-100 bg-white p-8 space-y-6 shadow-sm">
                  <h3 className="font-bold text-base text-slate-900 font-serif">Canales de Contacto Directo</h3>
                  
                  <div className="space-y-4 text-xs">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 shrink-0">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div>
                        <strong className="block text-slate-800">WhatsApp & Teléfono</strong>
                        <span className="text-slate-500 font-mono">{globalSettings?.whatsappNumber || "+56 9 6427 9239"}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 shrink-0">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>
                        <strong className="block text-slate-800">Correo Electrónico</strong>
                        <span className="text-slate-500">{globalSettings?.emailContact || "academia@detache.cl"}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-2xl bg-violet-50 text-[#70125F] shrink-0">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <strong className="block text-slate-800">Sede Central</strong>
                        <span className="text-slate-500">{locationAddress}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ── 3. Mid-page Banner ── */}
      <section className="py-16 bg-[#F8F7F4] text-center border-t border-b border-slate-200">
        <div className="container px-4 md:px-6 mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight uppercase font-sans">
            <span className="text-[#70125F]">{bannerTitle1}</span>{" "}
            <span className="text-[#DFB012]">{bannerTitle2}</span> <br />
            <span className="text-[#70125F]">{bannerTitle3}</span>{" "}
            <span className="text-[#DFB012]">{bannerTitle4}</span>
          </h2>
        </div>
      </section>

      {/* ── 4. Bottom Location & Map Section ── */}
      <section className="py-20 bg-white">
        <div className="container px-4 md:px-6 mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Location Info */}
            <div className="space-y-8 text-left">
              <h2 className="text-4xl font-extrabold text-[#70125F] tracking-tight">
                {locationTitle}
              </h2>
              <p className="text-slate-500 text-base leading-relaxed max-w-md">
                {locationDescription}
              </p>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#70125F]/5 rounded-xl border border-[#70125F]/10 text-[#70125F]">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{locationAddressTitle}</h4>
                  <p className="text-slate-500">{locationAddress}</p>
                </div>
              </div>
            </div>

            {/* Right Interactive Google Map */}
            <div className="h-[360px] md:h-[420px] rounded-[2.5rem] overflow-hidden shadow-md border border-slate-200 relative bg-slate-50">
              <iframe
                src={locationMapIframeUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full object-cover"
              />
            </div>

          </div>
        </div>
      </section>

      {/* Solid bottom purple bar */}
      <div className="w-full h-4 bg-[#70125F]" />
    </div>
  );
}

