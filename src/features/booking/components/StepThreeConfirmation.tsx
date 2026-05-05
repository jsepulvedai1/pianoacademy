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
import { Calendar, Clock, User, CheckCircle2, Loader2, MapPin } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { whatsappService } from '@/lib/whatsapp-service';

const bookingSchema = z.object({
  firstName: z.string().min(2, "El nombre es requerido"),
  lastName: z.string().min(2, "El apellido es requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(8, "Teléfono inválido"),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export function StepThreeConfirmation() {
  const { utmParams, acceptedTerms, setAcceptedTerms, selectedClass, selectedTeacher, selectedDate, selectedTimeSlot, setStep, reset } = useBookingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
  });

  const onSubmit = async (data: BookingFormValues) => {
    if (!acceptedTerms) return;
    
    setIsSubmitting(true);
    
    // Simular llamada a API (Luego conectar con Django)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log("Reserva creada con éxito:", {
      ...data,
      classId: selectedClass?.id,
      teacherId: selectedTeacher?.id,
      date: selectedDate,
      time: selectedTimeSlot,
      utm: utmParams,
      termsAccepted: acceptedTerms
    });

    // 📱 Automatización WhatsApp - Fase 3
    if (data.phone && selectedDate && selectedTimeSlot) {
      const formattedDate = format(selectedDate, "EEEE d 'de' MMMM", { locale: es });
      await whatsappService.sendBookingConfirmation(
        data.phone.replace(/\D/g, ''), // Limpiar formato
        data.firstName,
        formattedDate,
        selectedTimeSlot
      );
    }
    
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-6 py-10 animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center mb-6">
          <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h2 className="text-3xl font-bold font-serif">¡Reserva Confirmada!</h2>
        <p className="text-muted-foreground max-w-md mx-auto italic">
          Hemos enviado un correo con los detalles.
          Te esperamos en nuestra sede.
        </p>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mt-8">
          <Card className="text-left border-primary/20 shadow-lg shadow-primary/5">
            <CardHeader className="bg-primary/5 border-b py-4">
              <CardTitle className="text-sm uppercase tracking-widest text-primary">Detalle de la Clase</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
               <div className="flex justify-between text-sm">
                 <span className="text-muted-foreground">Clase:</span>
                 <span className="font-bold">{selectedClass?.name}</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-muted-foreground">Profesor:</span>
                 <span className="font-bold">{selectedTeacher?.nombre}</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-muted-foreground">Fecha:</span>
                 <span className="font-bold">
                   {selectedDate && format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                 </span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-muted-foreground">Hora:</span>
                 <span className="font-bold">{selectedTimeSlot} hrs</span>
               </div>
            </CardContent>
          </Card>

          <Card className="text-left border-muted shadow-sm">
            <CardHeader className="bg-muted/50 border-b py-4">
              <CardTitle className="text-sm uppercase tracking-widest">Ubicación de la Sede</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
               <div className="flex gap-3">
                 <div className="p-2 bg-primary/5 rounded-lg border h-fit">
                    <MapPin className="h-4 w-4 text-primary" />
                 </div>
                 <div>
                    <p className="font-bold text-sm">Sede Providencia</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">Av. Música 123, Piso 2, Providencia, Santiago.</p>
                    <p className="text-[10px] text-primary font-bold mt-1">A PASOS DE METRO SALVADOR</p>
                 </div>
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="pt-12">
          <Button size="lg" className="rounded-full px-12" asChild onClick={reset}>
            <Link href="/">Finalizar y Volver</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="md:col-span-2 space-y-8">
        <h2 className="text-2xl font-bold font-serif tracking-tight">3. Completa tus datos</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre</Label>
              <Input id="firstName" placeholder="Juan" {...register("firstName")} className="h-12 rounded-xl" />
              {errors.firstName && <p className="text-xs text-destructive mt-1 font-medium">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido</Label>
              <Input id="lastName" placeholder="Pérez" {...register("lastName")} className="h-12 rounded-xl" />
              {errors.lastName && <p className="text-xs text-destructive mt-1 font-medium">{errors.lastName.message}</p>}
            </div>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="juan@ejemplo.com" {...register("email")} className="h-12 rounded-xl" />
              {errors.email && <p className="text-xs text-destructive mt-1 font-medium">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">WhatsApp</Label>
              <Input id="phone" placeholder="+56 9 1234 5678" {...register("phone")} className="h-12 rounded-xl" />
              {errors.phone && <p className="text-xs text-destructive mt-1 font-medium">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">¿Tienes experiencia previa? (Opcional)</Label>
            <Input id="notes" placeholder="Cuéntanos un poco sobre ti..." {...register("notes")} className="h-12 rounded-xl" />
          </div>

          <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-2xl border border-muted ring-offset-background has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/50">
            <input 
              type="checkbox" 
              id="terms" 
              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary cursor-pointer"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              required
            />
            <div className="grid gap-1.5 leading-none">
              <label htmlFor="terms" className="text-sm font-medium leading-normal cursor-pointer">
                Acepto el <Link href="/terms" target="_blank" className="text-primary underline underline-offset-4 hover:text-primary/80">Reglamento Interno</Link> de la academia y las políticas de cancelación.
              </label>
              <p className="text-xs text-muted-foreground">Requerido para confirmar tu pre-reserva.</p>
            </div>
          </div>

          <div className="flex justify-between pt-6 border-t">
            <Button type="button" variant="ghost" onClick={() => setStep(2)} disabled={isSubmitting} className="rounded-xl h-12">
              Atrás
            </Button>
            <Button type="submit" disabled={isSubmitting || !acceptedTerms} className="rounded-xl h-12 px-8 font-bold">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirmando...
                </>
              ) : (
                "Confirmar mi Clase"
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
                   <p className="font-medium text-sm">{selectedTeacher?.nombre}</p>
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
