"use client";

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Clock, AlertTriangle, CreditCard, UserX, ShieldCheck, Music } from 'lucide-react';
import { useQuery } from "@apollo/client/react/index.js";
import { GET_GLOBAL_SETTINGS } from "@/graphql/queries/get-global-settings";

export default function TermsPage() {
  const { data } = useQuery<any>(GET_GLOBAL_SETTINGS);
  const customTerms = data?.globalSettings?.termsAndConditions?.trim();

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <section className="pt-20 pb-12 bg-white border-b">
        <div className="container px-4 md:px-6 mx-auto">
          <Button variant="ghost" className="mb-6 group" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Volver al inicio
            </Link>
          </Button>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-tight">Reglamento Interno y Términos</h1>
            <p className="text-muted-foreground">Normativa oficial de inscripción, asistencia y convivencia de Academia de Música Détaché.</p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container px-4 md:px-6 mx-auto max-w-4xl space-y-8">
          {/* Regla de edades destacada */}
          <div className="bg-[#70125F]/5 border border-[#70125F]/15 rounded-[2rem] p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-2.5 text-[#70125F]">
              <Music className="h-5 w-5" />
              <h2 className="text-lg font-bold font-serif">Edades Mínimas por Instrumento y Metodología</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl p-3.5 border border-[#70125F]/10 shadow-sm">
                <span className="text-lg block">🎹 Piano</span>
                <span className="text-xs font-bold text-[#70125F]">Desde los 4 años</span>
              </div>
              <div className="bg-white rounded-xl p-3.5 border border-[#70125F]/10 shadow-sm">
                <span className="text-lg block">🎤 Canto</span>
                <span className="text-xs font-bold text-[#70125F]">Desde los 6 años</span>
              </div>
              <div className="bg-white rounded-xl p-3.5 border border-[#70125F]/10 shadow-sm">
                <span className="text-lg block">🥁 Batería</span>
                <span className="text-xs font-bold text-[#70125F]">Desde los 6 años</span>
              </div>
              <div className="bg-white rounded-xl p-3.5 border border-[#70125F]/10 shadow-sm">
                <span className="text-lg block">🎸 Guitarra</span>
                <span className="text-xs font-bold text-[#70125F]">Desde los 8 años</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border shadow-sm p-8 md:p-16 space-y-12">
            {customTerms ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-primary">
                  <ShieldCheck className="h-6 w-6" />
                  <h2 className="text-2xl font-bold font-serif">Reglamento Oficial Academia Détaché</h2>
                </div>
                <div className="text-slate-700 leading-relaxed whitespace-pre-line text-sm md:text-base">
                  {customTerms}
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-primary">
                    <BookOpen className="h-6 w-6" />
                    <h2 className="text-2xl font-bold font-serif">1. Sobre las Clases y Clase de Prueba</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Las clases de prueba tienen una duración de <strong>30 minutos</strong> y requieren pago anticipado para quedar agendadas definitivamente. Las clases regulares tienen una duración de 45 o 60 minutos según el programa seleccionado. Se solicita puntualidad, ya que el tiempo de retraso no será recuperado para no afectar el horario del siguiente alumno.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-primary">
                    <Clock className="h-6 w-6" />
                    <h2 className="text-2xl font-bold font-serif">2. Cancelaciones, Avisos y Reprogramaciones</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Para reprogramar una clase sin descontarla del plan, el alumno o apoderado debe avisar con un mínimo de <strong>24 horas de antelación</strong>. Las cancelaciones realizadas fuera de este plazo se considerarán como clase realizada.
                  </p>
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex gap-3 text-amber-800 text-sm italic">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <span>Las reservas online deben realizarse con al menos 24 horas de anticipación (no se agendan horas para el mismo día vía web).</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-primary">
                    <CreditCard className="h-6 w-6" />
                    <h2 className="text-2xl font-bold font-serif">3. Pagos y Vigencia</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Ninguna clase de prueba ni plan queda agendado sin su pago previo correspondiente. Las solicitudes por transferencia bancaria tienen plazo hasta las 20:00 hrs del mismo día para enviar el comprobante.
                  </p>
                  <ul className="grid sm:grid-cols-2 gap-4">
                    <li className="p-4 bg-muted/50 rounded-xl border flex justify-between items-center text-sm">
                      <span>Pack 4 clases</span>
                      <span className="font-bold">30 días</span>
                    </li>
                    <li className="p-4 bg-muted/50 rounded-xl border flex justify-between items-center text-sm">
                      <span>Pack 12 clases</span>
                      <span className="font-bold">90 días</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-primary">
                    <UserX className="h-6 w-6" />
                    <h2 className="text-2xl font-serif font-bold">4. Congelamiento y Abandono</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    En caso de congelar un plan, debe dejarse estipulada la fecha de retorno con administración. El no asistir a clases por más de 15 días sin previo aviso se considerará como abandono del curso, liberando el cupo del horario fijo.
                  </p>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-bold font-serif">5. Uso de las Instalaciones</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Los alumnos deben cuidar los instrumentos y equipos de la academia. Cualquier daño deliberado a la propiedad será responsabilidad del alumno (o su apoderado legal en caso de menores).
                  </p>
                </div>
              </>
            )}

            <div className="pt-8 border-t">
              <p className="text-sm text-center text-muted-foreground italic">
                Al inscribirse o agendar una clase en Academia Détaché, usted declara conocer y aceptar íntegramente este reglamento.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center space-y-6">
            <h3 className="text-xl font-bold">¿Tienes dudas sobre el reglamento?</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="rounded-full px-8" asChild>
                <Link href="/contact">Hablar con coordinación</Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8" asChild>
                <Link href="/book">Ir a Inscripción de Clase de Prueba</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
