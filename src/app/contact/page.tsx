"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client/react/index.js";
import { CREATE_LEAD, UPDATE_LEAD_STATUS } from "@/graphql/mutations/lead-mutations";
import { GET_TEACHERS } from "@/graphql/queries/get-teachers";
import { GET_RESERVATIONS } from "@/graphql/queries/get-reservations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { normalizePhoneNumber } from "@/lib/utils";
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
  User
} from "lucide-react";

// Helpers for time conversion and slots calculation
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

function generateSlots(startTimeStr: string, endTimeStr: string, slotDuration = 55): { start: string; end: string }[] {
  const startMins = timeToMinutes(startTimeStr);
  const endMins = timeToMinutes(endTimeStr);
  const slots: { start: string; end: string }[] = [];

  for (let current = startMins; current + slotDuration <= endMins; current += 60) {
    slots.push({
      start: minutesToTime(current),
      end: minutesToTime(current + slotDuration)
    });
  }
  return slots;
}

const DAY_MAP_EN_TO_ES: Record<string, string> = {
  "MONDAY": "Lunes",
  "TUESDAY": "Martes",
  "WEDNESDAY": "Miércoles",
  "THURSDAY": "Jueves",
  "FRIDAY": "Viernes",
  "SATURDAY": "Sábado",
  "SUNDAY": "Domingo"
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
  const [step, setStep] = useState(1); // 1: Profesor, 2: Fecha y Hora, 3: Confirmación

  // Selections
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedDateStr, setSelectedDateStr] = useState(""); // YYYY-MM-DD
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "+569",
    mensaje: ""
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Queries & Mutations
  const { data: teachersData } = useQuery(GET_TEACHERS);
  const { data: reservationsData } = useQuery(GET_RESERVATIONS);

  const teachers = (teachersData as any)?.allTeachers || [];
  const lessons = (reservationsData as any)?.allLessons || [];

  const [updateStatus] = useMutation(UPDATE_LEAD_STATUS);

  const [createLead, { loading }] = useMutation(CREATE_LEAD, {
    onCompleted: (res: any) => {
      const leadId = res.createLead?.lead?.id;
      if (leadId) {
        updateStatus({
          variables: {
            leadId: leadId,
            status: "PRE_RESERVA"
          }
        }).catch((err) => console.error("Error setting lead status to PRE_RESERVA:", err));
      }
      setIsSuccess(true);
    },
    onError: (err) => {
      console.error("Error creating reservation lead:", err);
      alert("Hubo un error al enviar tu reserva. Intenta nuevamente.");
    }
  });

  const selectedTeacher = teachers.find((t: any) => t.id === selectedTeacherId);

  // Calendar Helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1; // Start from Monday
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

  // Availability & occupied slots calculations
  const getAvailableSlots = () => {
    if (!selectedDateStr || !selectedTeacherId || !selectedTeacher) return [];

    const dateParts = selectedDateStr.split("-");
    const dateObj = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
    const dayName = getDayNameSpanish(dateObj);

    const activeAvailabilities = selectedTeacher.availabilities?.filter(
      (av: any) => {
        const daySpanish = DAY_MAP_EN_TO_ES[av.day.toUpperCase()] || av.day;
        return daySpanish.toLowerCase() === dayName.toLowerCase();
      }
    ) || [];

    if (activeAvailabilities.length === 0) return [];

    // Generate slots (55 min duration)
    let allBaseSlots: { start: string; end: string }[] = [];
    activeAvailabilities.forEach((av: any) => {
      const slots = generateSlots(av.startTime, av.endTime, 55);
      allBaseSlots = [...allBaseSlots, ...slots];
    });

    // Check overlaps with booked lessons
    const bookedLessons = lessons.filter((lesson: any) => {
      return (
        lesson.teacher?.id === selectedTeacher.id &&
        lesson.date === selectedDateStr &&
        lesson.status !== "CANCELLED"
      );
    });

    const freeSlots = allBaseSlots.filter((slot) => {
      const slotStart = timeToMinutes(slot.start);
      const slotEnd = timeToMinutes(slot.end);

      const isOverlapped = bookedLessons.some((lesson: any) => {
        const lessonStart = timeToMinutes(lesson.startTime);
        const lessonEnd = timeToMinutes(lesson.endTime);
        return slotStart < lessonEnd && slotEnd > lessonStart;
      });

      return !isOverlapped;
    });

    return freeSlots;
  };

  const freeSlots = getAvailableSlots();
  const morningSlots = freeSlots.filter((s) => timeToMinutes(s.start) < 720); // Before 12:00
  const afternoonSlots = freeSlots.filter((s) => timeToMinutes(s.start) >= 720); // 12:00 or later

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
      telefono: "+569" + limitedSuffix
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || formData.telefono.length !== 12) {
      alert("Por favor ingresa tu Nombre y un número de celular de 8 dígitos (+569XXXXXXXX).");
      return;
    }

    const detailedEmail = `${formData.email || "sin-correo@detache.cl"} | Alumno: ${formData.nombre} ${formData.apellido} | Profesor: ${selectedTeacher?.name} | Fecha: ${selectedDateStr} | Horario: ${selectedSlot?.start}-${selectedSlot?.end} | Notas: ${formData.mensaje || "Sin notas"}`;

    createLead({
      variables: {
        nombre: `${formData.nombre} ${formData.apellido}`.trim(),
        telefono: normalizePhoneNumber(formData.telefono),
        email: detailedEmail,
        servicio: "CLASE_PRUEBA",
        fuente: "Reserva Clinica Web"
      }
    });
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-800 font-sans">
      
      {/* 1. Hero Section (CON LA FOTO DE ARRIBA) */}
      <section className="relative min-h-[50vh] flex items-center justify-start overflow-hidden bg-black text-white py-20">
        <div className="absolute inset-0 z-0">
          <img
            src="/imagesfooter/4.png"
            alt="Clase de música Détaché"
            className="w-full h-full object-cover filter grayscale contrast-125 opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-transparent" />
        </div>

        <div className="container relative z-10 px-4 md:px-6 mx-auto">
          <div className="max-w-4xl text-left space-y-6">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15] font-sans">
              <span className="text-[#DFB012]">Estamos aquí</span> para <br />
              ayudarte a <span className="text-[#DFB012]">comenzar</span>
            </h1>
            <p className="text-slate-300 text-lg md:text-xl max-w-2xl leading-relaxed font-sans font-light">
              Si tienes dudas sobre nuestras clases, programas o metodología, estaremos encantados de orientarte.
            </p>
          </div>
        </div>
      </section>

      {/* Stepper Progress Bar (Light Mode theme) */}
      <section className="bg-[#F8F7F4] py-8 border-b border-slate-200">
        <div className="container px-4 mx-auto max-w-xl">
          <div className="flex items-center justify-center relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                step >= 1 ? "bg-[#70125F] text-white shadow-md shadow-[#70125F]/20" : "bg-slate-200 text-slate-500"
              }`}>
                {step > 1 ? <CheckCircle2 className="h-5 w-5" /> : "1"}
              </div>
              <span className="text-[10px] md:text-xs font-bold mt-2 text-slate-600">Elige Profesor</span>
            </div>

            {/* Line 1 */}
            <div className="flex-1 h-[2px] bg-slate-200 mx-2 relative -translate-y-3">
              <div className="absolute inset-0 bg-[#70125F] transition-all duration-500" style={{ width: step > 1 ? "100%" : "0%" }} />
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                step >= 2 ? "bg-[#70125F] text-white shadow-md shadow-[#70125F]/20" : "bg-slate-200 text-slate-500"
              }`}>
                {step > 2 ? <CheckCircle2 className="h-5 w-5" /> : "2"}
              </div>
              <span className="text-[10px] md:text-xs font-bold mt-2 text-slate-600">Fecha y Hora</span>
            </div>

            {/* Line 2 */}
            <div className="flex-1 h-[2px] bg-slate-200 mx-2 relative -translate-y-3">
              <div className="absolute inset-0 bg-[#70125F] transition-all duration-500" style={{ width: step > 2 ? "100%" : "0%" }} />
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                step >= 3 ? "bg-[#70125F] text-white shadow-md shadow-[#70125F]/20" : "bg-slate-200 text-slate-500"
              }`}>
                3
              </div>
              <span className="text-[10px] md:text-xs font-bold mt-2 text-slate-600">Confirmación</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Wizard Body (Consistente con la estética de las demás páginas) */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container px-4 mx-auto max-w-5xl">
          
          {isSuccess ? (
            <div className="bg-[#F8F7F4] border border-slate-100 p-12 rounded-[2.5rem] text-center max-w-xl mx-auto flex flex-col items-center justify-center space-y-6 shadow-md">
              <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center shadow-sm">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 animate-bounce" />
              </div>
              <h3 className="text-3xl font-extrabold text-slate-800">¡Cita Solicitada!</h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                Hemos recibido tu solicitud para una <span className="text-[#70125F] font-bold">Clase de Prueba</span> con {selectedTeacher?.name} el día <span className="font-bold text-slate-800">{selectedDateStr}</span> a las <span className="font-bold text-slate-800">{selectedSlot?.start} hrs</span>.
              </p>
              <div className="p-4 bg-white border border-slate-200 rounded-2xl w-full text-xs text-slate-500 leading-relaxed">
                Nuestra coordinación académica validará tu solicitud y se pondrá en contacto contigo a la brevedad vía WhatsApp para confirmar los detalles.
              </div>
              <Button 
                onClick={() => {
                  setIsSuccess(false);
                  setStep(1);
                  setSelectedTeacherId("");
                  setSelectedDateStr("");
                  setSelectedSlot(null);
                  setFormData({ nombre: "", apellido: "", email: "", telefono: "+569", mensaje: "" });
                }}
                className="bg-[#70125F] hover:bg-[#590e4b] text-white rounded-xl px-8 h-12 font-bold uppercase tracking-wider text-xs"
              >
                Volver a agendar
              </Button>
            </div>
          ) : (
            <div className="bg-[#F8F7F4] border border-slate-200/50 rounded-[3.5rem] p-6 md:p-12 shadow-sm relative overflow-hidden">
              
              {/* STEP 1: Profesor */}
              {step === 1 && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                    <h2 className="text-2xl font-extrabold text-[#70125F] flex items-center gap-2">
                      <User className="h-6 w-6" />
                      Elige tu profesor (Clase de Prueba)
                    </h2>
                    {teachers.length > 0 && (
                      <span className="text-xs font-bold bg-[#70125F]/10 text-[#70125F] px-3 py-1 rounded-full">
                        {teachers.length} profesores disponibles
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teachers.map((t: any) => {
                      const isSelected = selectedTeacherId === t.id;
                      const specialties = t.specialties?.map((s: any) => s.name) || [];
                      return (
                        <div
                          key={t.id}
                          onClick={() => setSelectedTeacherId(t.id)}
                          className={`p-6 rounded-[2.5rem] border text-center cursor-pointer transition-all flex flex-col justify-between min-h-[220px] bg-white ${
                            isSelected 
                              ? "border-[#70125F] bg-[#70125F]/5 ring-1 ring-[#70125F]/30 shadow-md" 
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex flex-col items-center space-y-4">
                            {/* Avatar */}
                            <div className="w-20 h-20 rounded-full overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center">
                              <img
                                src={t.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.name}`}
                                alt={t.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <h3 className="font-extrabold text-base text-slate-800">{t.name}</h3>
                          </div>
                          
                          {/* Specialty tags */}
                          <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                            {specialties.slice(0, 2).map((sp: string, idx: number) => (
                              <span key={idx} className="text-[10px] font-extrabold tracking-wide uppercase px-2.5 py-0.5 bg-yellow-400/10 text-yellow-600 rounded-md">
                                {sp}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Navigation footer */}
                  <div className="flex justify-end pt-6 border-t border-slate-200">
                    <button
                      onClick={() => setStep(2)}
                      disabled={!selectedTeacherId}
                      className="border-2 border-[#70125F] hover:bg-[#70125F]/5 disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-transparent text-[#70125F] font-bold rounded-2xl px-10 h-14 bg-white transition-all text-xs uppercase tracking-widest cursor-pointer disabled:opacity-50 flex items-center gap-2"
                    >
                      <span>Continuar</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Fecha y Hora */}
              {step === 2 && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left: Datepicker Calendar */}
                    <div className="lg:col-span-7 bg-white p-6 rounded-[2.5rem] border border-slate-200 space-y-6">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-[#70125F]" />
                          Selecciona fecha
                        </h3>
                        <span className="text-[10px] font-bold tracking-wide uppercase bg-yellow-400/10 text-yellow-600 px-3 py-1 rounded-md">
                          {MONTHS_SPANISH[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </span>
                      </div>

                      {/* Calendar Navigation */}
                      <div className="flex justify-between items-center text-xs pb-1">
                        <button onClick={handlePrevMonth} className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800">
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="font-extrabold text-slate-700">
                          {MONTHS_SPANISH[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </span>
                        <button onClick={handleNextMonth} className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800">
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Day Name Headers */}
                      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Lu</span><span>Ma</span><span>Mi</span><span>Ju</span><span>Vi</span><span>Sa</span><span>Do</span>
                      </div>

                      {/* Calendar Days Grid */}
                      <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
                        {getDaysInMonth(currentMonth).map((day, idx) => {
                          if (!day) return <div key={idx} />;

                          const dateStr = day.toISOString().split("T")[0];
                          const isSelected = selectedDateStr === dateStr;
                          const isPast = day < today;
                          const isToday = day.getTime() === today.getTime();

                          return (
                            <button
                              key={idx}
                              disabled={isPast}
                              onClick={() => {
                                setSelectedDateStr(dateStr);
                                setSelectedSlot(null); // Reset slot
                              }}
                              className={`aspect-square rounded-full font-bold transition-all relative flex items-center justify-center ${
                                isSelected 
                                  ? "bg-[#70125F] text-white shadow-md shadow-[#70125F]/20 scale-105" 
                                  : isPast 
                                    ? "text-slate-300 cursor-not-allowed opacity-30" 
                                    : isToday
                                      ? "bg-[#F8F7F4] border border-[#70125F]/30 text-[#70125F] hover:bg-slate-100"
                                      : "text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              {day.getDate()}
                              {isSelected && <span className="absolute bottom-1 w-1.5 h-1.5 bg-white rounded-full" />}
                            </button>
                          );
                        })}
                      </div>

                      <div className="p-4 bg-[#F8F7F4] rounded-2xl border border-slate-100 flex items-start gap-3 text-left">
                        <Clock className="h-4 w-4 text-[#70125F] mt-0.5" />
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          Las clases tienen una duración de 55 minutos. Selecciona una fecha para ver la disponibilidad en tiempo real de {selectedTeacher?.name}.
                        </p>
                      </div>
                    </div>

                    {/* Right: Slot Selection list */}
                    <div className="lg:col-span-5 bg-white p-6 rounded-[2.5rem] border border-slate-200 min-h-[300px] flex flex-col justify-between space-y-6">
                      
                      <div className="space-y-4">
                        <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3 text-left">
                          <Clock className="h-4 w-4 text-[#70125F]" />
                          Horarios
                          {selectedDateStr && (
                            <span className="text-[10px] font-normal text-slate-400 normal-case ml-2">
                              {selectedDateStr.split("-")[2]} de {MONTHS_SPANISH[parseInt(selectedDateStr.split("-")[1]) - 1]}
                            </span>
                          )}
                        </h3>

                        {!selectedDateStr ? (
                          <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
                            <CalendarIcon className="h-10 w-10 text-slate-200" />
                            <span className="text-xs font-semibold">Elige un día en el calendario</span>
                          </div>
                        ) : freeSlots.length > 0 ? (
                          <div className="space-y-6 max-h-[300px] overflow-y-auto pr-1">
                            
                            {/* Morning Slots */}
                            {morningSlots.length > 0 && (
                              <div className="space-y-2 text-left">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                  ☀️ Mañana
                                </span>
                                <div className="grid grid-cols-2 gap-2">
                                  {morningSlots.map((slot, idx) => {
                                    const isSlotSelected = selectedSlot?.start === slot.start;
                                    return (
                                      <button
                                        key={idx}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all border ${
                                          isSlotSelected
                                            ? "bg-[#70125F] border-[#70125F] text-white shadow-sm"
                                            : "border-slate-200 bg-[#F8F7F4] text-slate-700 hover:border-[#70125F]"
                                        }`}
                                      >
                                        {slot.start}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Afternoon Slots */}
                            {afternoonSlots.length > 0 && (
                              <div className="space-y-2 text-left">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                  🌙 Tarde
                                </span>
                                <div className="grid grid-cols-2 gap-2">
                                  {afternoonSlots.map((slot, idx) => {
                                    const isSlotSelected = selectedSlot?.start === slot.start;
                                    return (
                                      <button
                                        key={idx}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all border ${
                                          isSlotSelected
                                            ? "bg-[#70125F] border-[#70125F] text-white shadow-sm"
                                            : "border-slate-200 bg-[#F8F7F4] text-slate-700 hover:border-[#70125F]"
                                        }`}
                                      >
                                        {slot.start}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-16 text-rose-500 space-y-3">
                            <Clock className="h-10 w-10 text-rose-200/50" />
                            <span className="text-xs font-bold text-center px-4">
                              No hay horarios libres. Intenta con otro día.
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Navigation buttons */}
                      <div className="flex gap-3 pt-4 border-t border-slate-200">
                        <button
                          onClick={() => setStep(1)}
                          className="flex-1 bg-white hover:bg-slate-100 text-slate-600 font-bold rounded-xl h-12 uppercase text-xs tracking-wider border border-slate-200"
                        >
                          Atrás
                        </button>
                        <button
                          onClick={() => setStep(3)}
                          disabled={!selectedSlot || !selectedDateStr}
                          className="flex-1 bg-[#70125F] hover:bg-[#590e4b] disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl h-12 uppercase text-xs tracking-wider cursor-pointer"
                        >
                          Continuar
                        </button>
                      </div>

                    </div>

                  </div>
                </div>
              )}

              {/* STEP 3: Confirmación / Completa tus datos */}
              {step === 3 && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left: Input Form */}
                    <form onSubmit={handleConfirmReservation} className="lg:col-span-7 space-y-6 text-left">
                      <h3 className="font-extrabold text-xl text-[#70125F] pb-3 border-b border-slate-200">
                        Completa tus datos
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-[#70125F]">
                            Nombre
                          </label>
                          <Input
                            placeholder="Ej: Juan"
                            required
                            value={formData.nombre}
                            onChange={(e) => handleInputChange("nombre", e.target.value)}
                            className="h-12 bg-white border border-[#70125F]/20 text-slate-800 rounded-xl placeholder:text-slate-400 focus:border-[#70125F] focus:ring-[#70125F]"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-[#70125F]">
                            Apellido
                          </label>
                          <Input
                            placeholder="Ej: Pérez"
                            value={formData.apellido}
                            onChange={(e) => handleInputChange("apellido", e.target.value)}
                            className="h-12 bg-white border border-[#70125F]/20 text-slate-800 rounded-xl placeholder:text-slate-400 focus:border-[#70125F] focus:ring-[#70125F]"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#70125F]">
                          Email
                        </label>
                        <Input
                          placeholder="juan@ejemplo.com"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="h-12 bg-white border border-[#70125F]/20 text-slate-800 rounded-xl placeholder:text-slate-400 focus:border-[#70125F] focus:ring-[#70125F]"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#70125F]">
                          Teléfono
                        </label>
                        <Input
                          placeholder="+56 9 1234 5678"
                          required
                          value={formData.telefono}
                          onChange={handlePhoneChange}
                          className="h-12 bg-white border border-[#70125F]/20 text-slate-800 rounded-xl placeholder:text-slate-400 focus:border-[#70125F] focus:ring-[#70125F] font-mono"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#70125F]">
                          Notas adicionales (Opcional)
                        </label>
                        <Textarea
                          placeholder="Tengo experiencia previa en..."
                          value={formData.mensaje}
                          onChange={(e) => handleInputChange("mensaje", e.target.value)}
                          className="min-h-[100px] bg-white border border-[#70125F]/20 text-slate-800 rounded-xl placeholder:text-slate-400 focus:border-[#70125F] focus:ring-[#70125F] p-3 resize-none"
                        />
                      </div>
                    </form>

                    {/* Right: Resumen box */}
                    <div className="lg:col-span-5 bg-white p-6 rounded-[2.5rem] border border-slate-200 space-y-6 text-left shadow-sm">
                      <h3 className="font-extrabold text-sm text-[#70125F] border-b border-slate-100 pb-3">
                        Resumen
                      </h3>

                      {/* Class Info */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Clase Seleccionada
                        </span>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-extrabold text-slate-800">Clase de Prueba</span>
                          <span className="text-xs font-bold text-[#70125F]">Gratis</span>
                        </div>
                      </div>

                      {/* Teacher Info */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Profesor
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-50 border">
                            <img
                              src={selectedTeacher?.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedTeacher?.name}`}
                              alt={selectedTeacher?.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-xs font-extrabold text-slate-800">{selectedTeacher?.name}</span>
                        </div>
                      </div>

                      {/* Date & Slot Info */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Fecha y Hora
                        </span>
                        <div className="flex items-center gap-2.5 text-slate-700">
                          <CalendarIcon className="h-4 w-4 text-[#70125F]" />
                          <span className="text-xs font-extrabold text-slate-800">
                            {selectedDateStr} a las {selectedSlot?.start} hrs
                          </span>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-3 pt-6 border-t border-slate-100">
                        <button
                          onClick={() => setStep(2)}
                          className="flex-1 bg-white hover:bg-slate-100 text-slate-600 font-bold rounded-xl h-12 uppercase text-xs tracking-wider border border-slate-200"
                        >
                          Atrás
                        </button>
                        <button
                          onClick={handleConfirmReservation}
                          disabled={loading}
                          className="flex-1 bg-[#70125F] hover:bg-[#590e4b] text-white font-bold rounded-xl h-12 uppercase text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                          <span>Confirmar</span>
                        </button>
                      </div>

                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </section>

      {/* 3. Mid-page Banner */}
      <section className="py-16 bg-[#F8F7F4] text-center border-t border-b border-slate-200">
        <div className="container px-4 md:px-6 mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight uppercase font-sans">
            <span className="text-[#70125F]">Sigamos</span>{" "}
            <span className="text-[#DFB012]">compartiendo</span> <br />
            <span className="text-[#70125F]">el lenguaje de</span>{" "}
            <span className="text-[#DFB012]">la música</span>
          </h2>
        </div>
      </section>

      {/* 4. Bottom Location & Map Section */}
      <section className="py-20 bg-white">
        <div className="container px-4 md:px-6 mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Location Info */}
            <div className="space-y-8 text-left">
              <h2 className="text-4xl font-extrabold text-[#70125F] tracking-tight">
                Estamos cerca de ti
              </h2>
              <p className="text-slate-500 text-base leading-relaxed max-w-md">
                Nuestra academia se encuentra en una ubicación estratégica y de fácil acceso, para que llegar a tus clases sea cómodo y sencillo.
              </p>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#70125F]/5 rounded-xl border border-[#70125F]/10 text-[#70125F]">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Dirección Sede</h4>
                  <p className="text-slate-500">Gran Avenida José Miguel Carrera 8520, Oficina C, La Cisterna.</p>
                </div>
              </div>
            </div>

            {/* Right Interactive Google Map */}
            <div className="h-[360px] md:h-[420px] rounded-[2.5rem] overflow-hidden shadow-md border border-slate-200 relative bg-slate-50">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3326.2307849187313!2d-70.6622543!3d-33.5217965!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662dae3cbf5df1f%3A0xe54fb7a71fbd4fdf!2sGran%20Av.%20Jos%C3%A9%20Miguel%20Carrera%208520%2C%20La%20Cisterna%2C%20Regi%C3%B3n%20Metropolitana!5e0!3m2!1ses-419!2scl!4v1700000000000!5m2!1ses-419!2scl"
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
