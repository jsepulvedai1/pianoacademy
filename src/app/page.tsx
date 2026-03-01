import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar, Music, UserCheck, Star } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-12 md:py-32 overflow-hidden bg-gradient-to-b from-primary/5 to-background">
        <div className="container px-4 md:px-6 mx-auto text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter sm:text-5xl">
              Domina el Piano con los <span className="text-primary">Mejores Maestros</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Reserva tu clase personalizada en segundos. Modalidad online o presencial. 
              Empieza tu viaje musical hoy mismo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button size="lg" asChild>
                <Link href="/book">Reservar Clase Ahora</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/catalog">Ver Catálogo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start space-y-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Reserva Flexible</h3>
              <p className="text-muted-foreground">
                Elige el horario que más te acomode. Reprograma fácilmente si surgen imprevistos.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-start space-y-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <UserCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Profesores Expertos</h3>
              <p className="text-muted-foreground">
                Aprende de músicos profesionales activos en la escena. Todos los niveles bienvenidos.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-start space-y-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Music className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Tu Ritmo, Tu Estilo</h3>
              <p className="text-muted-foreground">
                Clásico, Jazz, Pop o teoría musical. Adaptamos el contenido a tus objetivos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial / Social Proof */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6 mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tighter mb-12">Lo que dicen nuestros alumnos</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center space-y-4 p-6 bg-card rounded-xl shadow-sm border">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground italic">
                  "Increíble experiencia. El sistema de reservas es súper fácil y mi profesor es un genio."
                </p>
                <p className="font-semibold text-sm">- Alumno Feliz {i}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6 mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            ¿Listo para empezar?
          </h2>
          <p className="mx-auto max-w-[600px] text-primary-foreground/90 md:text-xl">
            La primera clase tiene un 20% de descuento. ¡Aprovecha ahora!
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/book">Agendar mi clase</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
