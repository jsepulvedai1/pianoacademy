"use client";

import { useBookingStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Clock, User, CheckCircle2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

const bookingSchema = z.object({
  firstName: z.string().min(2, "El nombre es requerido"),
  lastName: z.string().min(2, "El apellido es requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(8, "Teléfono inválido"),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export function StepThreeConfirmation() {
  const { selectedClass, selectedTeacher, selectedDate, selectedTimeSlot, setStep, reset } = useBookingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
  });

  const onSubmit = async (data: BookingFormValues) => {
    setIsSubmitting(true);
    
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log("Reserva creada:", {
      ...data,
      classId: selectedClass?.id,
      teacherId: selectedTeacher?.id,
      date: selectedDate,
      time: selectedTimeSlot
    });
    
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-6 py-10 animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center mb-6">
          <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
        </div>
        <h2 className="text-3xl font-bold">¡Reserva Confirmada!</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Hemos enviado un correo a tu dirección con los detalles de la clase.
          ¡Nos vemos pronto!
        </p>
        
        <Card className="max-w-md mx-auto text-left mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Resumen de tu clase</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex justify-between">
               <span className="text-muted-foreground">Clase:</span>
               <span className="font-medium">{selectedClass?.name}</span>
             </div>
             <div className="flex justify-between">
               <span className="text-muted-foreground">Profesor:</span>
               <span className="font-medium">{selectedTeacher?.firstName} {selectedTeacher?.lastName}</span>
             </div>
             <div className="flex justify-between">
               <span className="text-muted-foreground">Fecha:</span>
               <span className="font-medium">
                 {selectedDate && format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
               </span>
             </div>
             <div className="flex justify-between">
               <span className="text-muted-foreground">Hora:</span>
               <span className="font-medium">{selectedTimeSlot} hrs</span>
             </div>
          </CardContent>
        </Card>

        <div className="pt-8">
          <Button asChild onClick={reset}>
            <Link href="/">Volver al Inicio</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="md:col-span-2 space-y-8">
        <h2 className="text-2xl font-semibold">3. Completa tus datos</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre</Label>
              <Input id="firstName" placeholder="Juan" {...register("firstName")} />
              {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido</Label>
              <Input id="lastName" placeholder="Pérez" {...register("lastName")} />
              {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
            </div>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="juan@ejemplo.com" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" placeholder="+56 9 1234 5678" {...register("phone")} />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas adicionales (Opcional)</Label>
            <Input id="notes" placeholder="Tengo experiencia previa en..." {...register("notes")} />
          </div>

          <div className="flex justify-between pt-6 border-t">
            <Button type="button" variant="ghost" onClick={() => setStep(2)} disabled={isSubmitting}>
              Atrás
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirmando...
                </>
              ) : (
                "Confirmar Reserva"
              )}
            </Button>
          </div>
        </form>
      </div>

      <div className="md:col-span-1">
        <Card className="sticky top-24 bg-muted/30">
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
               <p className="text-sm font-medium text-muted-foreground">Clase Seleccionada</p>
               <div className="flex items-center gap-3">
                 <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <CheckCircle2 className="h-5 w-5" />
                 </div>
                 <div>
                   <p className="font-medium text-sm">{selectedClass?.name}</p>
                   <p className="text-xs text-muted-foreground">
                     {new Intl.NumberFormat('es-CL', { style: 'currency', currency: selectedClass?.currency || 'CLP' }).format(selectedClass?.price || 0)}
                   </p>
                 </div>
               </div>
            </div>

            <div className="space-y-2">
               <p className="text-sm font-medium text-muted-foreground">Profesor</p>
               <div className="flex items-center gap-3">
                 <div className="h-10 w-10 bg-muted rounded-full overflow-hidden">
                    {selectedTeacher?.avatarUrl ? (
                      <img src={selectedTeacher.avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-full w-full p-2 text-muted-foreground" />
                    )}
                 </div>
                 <div>
                   <p className="font-medium text-sm">{selectedTeacher?.firstName} {selectedTeacher?.lastName}</p>
                 </div>
               </div>
            </div>

            <div className="space-y-2">
               <p className="text-sm font-medium text-muted-foreground">Fecha y Hora</p>
               <div className="flex items-center gap-3">
                 <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <Calendar className="h-5 w-5" />
                 </div>
                 <div>
                   <p className="font-medium text-sm capitalize">
                     {selectedDate && format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                   </p>
                   <p className="text-xs text-muted-foreground">
                     {selectedTimeSlot} hrs
                   </p>
                 </div>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
