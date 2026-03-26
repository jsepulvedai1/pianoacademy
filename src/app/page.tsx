import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar, Music, UserCheck, Star } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[420px] md:min-h-[600px] flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/piano-hero.png"
            alt="Piano Background"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/90 via-black/60 to-primary/20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_black_90%)] opacity-40" />
        </div>

        <div className="container relative z-10 px-4 md:px-6 mx-auto">
          <div className="max-w-4xl space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/80 text-xs font-bold uppercase tracking-widest animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              Inscripciones abiertas 2026
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl md:text-8xl font-bold tracking-tight text-white font-serif leading-[1.1] drop-shadow-2xl">
                Detaché: <span className="text-secondary italic">El Arte</span> <br />
                <span className="text-white/95">de Dominar la música</span>
              </h1>
              <p className="max-w-[700px] text-white/80 md:text-2xl leading-relaxed italic drop-shadow-lg font-light">
                Eleva tu técnica y sensibilidad artística con formación de primer nivel.
                Clases personalizadas diseñadas para transformar tu talento en maestría, estés donde estés.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 mt-12">
              <Button size="lg" className="h-16 px-10 text-base font-bold uppercase tracking-wider shadow-2xl shadow-primary/40 bg-primary hover:bg-primary/90 hover:scale-105 transition-all text-white border-none" asChild>
                <Link href="/book">Reservar mi Clase</Link>
              </Button>
              <Button variant="outline" size="lg" className="h-16 px-10 text-base font-bold uppercase tracking-wider border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white hover:border-white/60 backdrop-blur-sm transition-all shadow-lg" asChild>
                <Link href="/teachers">Nuestros Maestros</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="pt-8 pb-16 md:pt-12 md:pb-24 bg-muted/50">
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
