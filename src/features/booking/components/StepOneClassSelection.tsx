"use client";

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useBookingStore } from '@/lib/store';
import { CLASS_TYPES, TEACHERS } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StepOneClassSelection() {
  const searchParams = useSearchParams();
  const { selectedClass, selectedTeacher, setSelectedClass, setSelectedTeacher, setStep } = useBookingStore();
  const teacherSectionRef = useRef<HTMLDivElement>(null);
  const continueButtonRef = useRef<HTMLDivElement>(null);
  
  // Pre-fill from URL if available
  useEffect(() => {
    const classId = searchParams.get('classId');
    const teacherId = searchParams.get('teacherId');

    if (classId && !selectedClass) {
      const foundClass = CLASS_TYPES.find(c => c.id === classId);
      if (foundClass) setSelectedClass(foundClass);
    }

    if (teacherId && !selectedTeacher) {
      const foundTeacher = TEACHERS.find(t => t.id === teacherId);
      if (foundTeacher) {
        setSelectedTeacher(foundTeacher);
        // Opcional: Si seleccionamos profesor, podríamos hacer scroll a la sección de continuar o clases
      }
    }
  }, [searchParams, selectedClass, setSelectedClass, selectedTeacher, setSelectedTeacher]);

  // Lógica simple de filtrado de profesores
  const availableTeachers = TEACHERS; // Aquí podrías filtrar según la clase seleccionada

  const handleClassSelect = (classType: any) => {
    setSelectedClass(classType);
    setSelectedTeacher(null); // Reset teacher when changing class
    
    // Scroll to teacher section on mobile
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        teacherSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleTeacherSelect = (teacher: any) => {
    setSelectedTeacher(teacher);
    
    // Scroll to continue button on mobile
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        continueButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  const handleContinue = () => {
    if (selectedClass && selectedTeacher) {
      setStep(2);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section>
        <h2 className="text-2xl font-semibold mb-4">1. Elige tu clase</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {CLASS_TYPES.map((classType) => (
            <div
              key={classType.id}
              onClick={() => handleClassSelect(classType)}
              className={cn(
                "cursor-pointer border rounded-lg p-4 transition-all hover:border-primary",
                selectedClass?.id === classType.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-card"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{classType.name}</h3>
                {selectedClass?.id === classType.id && <Check className="h-4 w-4 text-primary" />}
              </div>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{classType.description}</p>
              <div className="flex items-center justify-between text-sm">
                 <span className="font-bold">
                   {new Intl.NumberFormat('es-CL', { style: 'currency', currency: classType.currency }).format(classType.price)}
                 </span>
                 <span className="text-muted-foreground">{classType.durationMinutes} min</span>
              </div>
            </div>
            ))}
          </div>
        </section>

      {selectedClass && (
        <section 
          ref={teacherSectionRef}
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">2. Elige tu profesor</h2>
            <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded-md">
              {availableTeachers.length} disponibles
            </span>
          </div>
          
          <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-2">
              {availableTeachers.map((teacher) => (
                 <div
                 key={teacher.id}
               onClick={() => handleTeacherSelect(teacher)}
               className={cn(
                 "cursor-pointer border rounded-lg p-4 transition-all hover:border-primary flex flex-col items-center text-center gap-3",
                 selectedTeacher?.id === teacher.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-card"
               )}
             >
               <div className="h-16 w-16 rounded-full bg-muted overflow-hidden relative">
                 {teacher.avatarUrl ? (
                    <img src={teacher.avatarUrl} alt={teacher.firstName} className="object-cover h-full w-full" />
                 ) : (
                    <User className="h-8 w-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
                 )}
               </div>
               <div>
                 <h3 className="font-medium">{teacher.firstName} {teacher.lastName}</h3>
                 <div className="flex flex-wrap justify-center gap-1 mt-1">
                   {teacher.specialties.slice(0, 2).map(s => (
                     <span key={s} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded-full text-secondary-foreground">
                       {s}
                     </span>
                   ))}
                 </div>
               </div>
               {selectedTeacher?.id === teacher.id && (
                  <div className="absolute top-2 right-2">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
               )}
             </div>
            ))}
          </div>
          </div>
        </section>
      )}

      <div className="flex justify-end pt-4" ref={continueButtonRef}>
        <button
          onClick={handleContinue}
          disabled={!selectedClass || !selectedTeacher}
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 rounded-md px-8",
            "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
