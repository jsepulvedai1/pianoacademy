import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Clock, AlertTriangle, CreditCard, UserX } from 'lucide-react';

export default function TermsPage() {
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
            <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-tight">Reglamento Interno</h1>
            <p className="text-muted-foreground">Última actualización: 15 de Abril, 2026</p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container px-4 md:px-6 mx-auto max-w-4xl">
          <div className="bg-white rounded-[2rem] border shadow-sm p-8 md:p-16 space-y-12">
            
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-primary">
                <BookOpen className="h-6 w-6" />
                <h2 className="text-2xl font-bold font-serif">1. Sobre las Clases</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Las clases tienen una duración de 45 o 60 minutos según el programa seleccionado. Se solicita puntualidad, ya que el tiempo de retraso no será recuperado para no afectar el horario del siguiente alumno.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 text-primary">
                <Clock className="h-6 w-6" />
                <h2 className="text-2xl font-bold font-serif">2. Cancelaciones y Reprogramaciones</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Para reprogramar una clase, el alumno debe avisar con un mínimo de **24 horas de antelación**. Las cancelaciones realizadas fuera de este plazo se considerarán como clase realizada y no podrán ser recuperadas.
              </p>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex gap-3 text-amber-800 text-sm italic">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <span>Solo se permite un máximo de 2 reprogramaciones por mes dentro de un pack.</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 text-primary">
                <CreditCard className="h-6 w-6" />
                <h2 className="text-2xl font-bold font-serif">3. Pagos y Vigencia</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Los packs de clases deben ser cancelados en su totalidad antes del inicio de la primera sesión. Cada pack tiene una vigencia específica:
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
                <h2 className="text-2xl font-bold font-serif">4. Abandono</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                El no asistir a clases por más de 15 días sin previo aviso se considerará como abandono del curso, perdiendo el derecho a las clases restantes del pack y liberando el cupo del horario fijo.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold font-serif">5. Uso de las Instalaciones</h2>
              <p className="text-muted-foreground leading-relaxed">
                Los alumnos deben cuidar los instrumentos y equipos de la academia. Cualquier daño deliberado a la propiedad será responsabilidad del alumno (o su apoderado legal en caso de menores).
              </p>
            </div>

            <div className="pt-8 border-t">
              <p className="text-sm text-center text-muted-foreground italic">
                Al inscribirse en la academia Détaché, usted acepta íntegramente este reglamento.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center space-y-6">
            <h3 className="text-xl font-bold">¿Tienes dudas sobre el reglamento?</h3>
            <Button size="lg" className="rounded-full px-8" asChild>
              <Link href="/contact">Hablar con coordinación</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
