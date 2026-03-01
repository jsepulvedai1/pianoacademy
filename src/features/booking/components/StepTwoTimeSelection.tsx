"use client";

import { useState, useRef } from 'react';
import { useBookingStore } from '@/lib/store';
import { CalendarCustom } from '@/components/ui/calendar-custom';
import { addDays, format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Check, Clock, User, Calendar as CalendarIcon, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function StepTwoTimeSelection() {
  const { selectedDate, setSelectedDate, selectedTimeSlot, setSelectedTimeSlot, setStep } = useBookingStore();
  const timeSlotsRef = useRef<HTMLDivElement>(null);

  // Mock de horarios disponibles
  const availableTimes = ["10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

  // Agrupar horarios por jornada
  const morningSlots = availableTimes.filter(time => parseInt(time.split(':')[0]) < 12);
  const afternoonSlots = availableTimes.filter(time => parseInt(time.split(':')[0]) >= 12);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date || null);
    setSelectedTimeSlot(null); // Resetear hora al cambiar fecha
    
    // Scroll automático a horarios en móvil (lg breakpoint is 1024px)
    if (date && window.innerWidth < 1024) {
      setTimeout(() => {
        timeSlotsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTimeSlot(time);
  };

  const handleContinue = () => {
    if (selectedDate && selectedTimeSlot) {
      setStep(3);
    }
  };

  const renderTimeSlots = (slots: string[], label: string) => {
    if (slots.length === 0) return null;
    return (
      <div className="mb-6 last:mb-0">
        <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          {label === "Mañana" ? (
            <Sun className="w-4 h-4 text-orange-500" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500" />
          )}
          {label}
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {slots.map((time) => (
            <button
              key={time}
              onClick={() => handleTimeSelect(time)}
              className={cn(
                "flex items-center justify-center px-2 py-3 text-sm font-medium rounded-xl border transition-all duration-200",
                selectedTimeSlot === time
                  ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105 ring-2 ring-primary/20"
                  : "bg-background hover:bg-accent hover:border-primary/50"
              )}
            >
              {time}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left Column: Calendar */}
        <div className="lg:col-span-7 space-y-4">
            <div className="bg-card rounded-2xl border shadow-sm p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                             <CalendarIcon className="w-5 h-5" />
                        </div>
                        Selecciona fecha
                    </h3>
                    {selectedDate && (
                        <span className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                            {format(selectedDate, "MMMM yyyy", { locale: es })}
                        </span>
                    )}
                </div>

                <div className="flex justify-center">
                    <CalendarCustom
                        selected={selectedDate || undefined}
                        onSelect={(date) => handleDateSelect(date)}
                        disabled={(date: Date) => {
                            const today = new Date();
                            today.setHours(0,0,0,0);
                            return date < today || date.getDay() === 0;
                        }}
                        className="rounded-xl border-none shadow-none p-0 w-full max-w-[400px]"
                    />
                </div>
            </div>
            
            <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-xl p-4 flex gap-3 text-sm text-blue-700 dark:text-blue-300">
                <div className="shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                </div>
                <p>
                    Las clases tienen una duración de 55 minutos. Selecciona una fecha para ver la disponibilidad en tiempo real.
                </p>
            </div>
        </div>

        {/* Right Column: Time Slots */}
        <div className="lg:col-span-5" ref={timeSlotsRef}>
            <div className="bg-card rounded-2xl border shadow-sm p-6 h-full flex flex-col">
                <div className="mb-6 pb-6 border-b">
                    <h3 className="text-xl font-semibold flex items-center gap-2 mb-1">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                             <Clock className="w-5 h-5" />
                        </div>
                        Horarios
                    </h3>
                    <p className="text-sm text-muted-foreground ml-11">
                        {selectedDate 
                            ? `Disponibilidad para el ${format(selectedDate, "d 'de' MMMM", { locale: es })}`
                            : "Selecciona una fecha primero"
                        }
                    </p>
                </div>
                
                <div className="flex-1 min-h-[300px]">
                    {!selectedDate ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 p-8 border-2 border-dashed rounded-xl bg-muted/20">
                            <div className="p-4 bg-background rounded-full shadow-sm">
                                <CalendarIcon className="h-8 w-8 opacity-20" />
                            </div>
                            <p className="text-center font-medium">Elige un día en el calendario</p>
                        </div>
                    ) : (
                        <div className="animate-in fade-in zoom-in-95 duration-300 space-y-2 custom-scrollbar pr-2">
                            {renderTimeSlots(morningSlots, "Mañana")}
                            {renderTimeSlots(afternoonSlots, "Tarde")}
                        </div>
                    )}
                </div>

                {/* Mobile/Desktop Action Bar integrated */}
                <div className="mt-6 pt-6 border-t flex items-center justify-between gap-4">
                     <Button variant="outline" onClick={() => setStep(1)} className="w-full">
                        Atrás
                     </Button>
                     <Button 
                        onClick={handleContinue} 
                        disabled={!selectedDate || !selectedTimeSlot}
                        className="w-full bg-primary hover:bg-primary/90 shadow-md"
                     >
                        Continuar
                     </Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
