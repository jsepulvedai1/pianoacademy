import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar, Music, UserCheck, Star, Check, MapPin, Award } from 'lucide-react';
import { PlansSection } from '@/components/layout/PlansSection';

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
      {/* Methodology Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                <Award className="h-4 w-4" />
                Nuestro Método Técnico
              </div>
              <h2 className="text-3xl md:text-5xl font-bold font-serif leading-tight">
                No son clases sueltas,<br />
                es un <span className="text-primary">proceso de maestría</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                En Détaché, no creemos en el aprendizaje fragmentado. Hemos diseñado una metodología integral que guía al alumno desde la sensibilización hasta la interpretación avanzada.
              </p>
              <div className="grid gap-4 mt-8">
                {[
                  { title: "Evaluación Personalizada", desc: "Entendemos tus metas antes de tocar la primera nota." },
                  { title: "Técnica Orgánica", desc: "Desarrollo de postura y digitación sin tensiones." },
                  { title: "Repertorio Evolutivo", desc: "Piezas seleccionadas para desafiarte en el punto justo." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm border border-muted ring-offset-background transition-colors hover:border-primary/20">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
                      <Check className="h-5 w-5" />
                    </div>
                    <div className="grid gap-1">
                      <h4 className="font-bold">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="absolute -inset-4 bg-primary/10 rounded-full blur-3xl opacity-30 animate-pulse" />
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src="/images/method.png"
                  alt="Metodología Détaché"
                  className="w-full h-full object-cover aspect-[4/3] hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Pricing / Plans Section */}
      <section id="plans" className="py-20 md:py-32 bg-background relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold font-serif tracking-tight">Nuestros Planes</h2>
            <p className="text-muted-foreground text-lg italic">
              Invierte en tu talento. Elige el programa que mejor se adapte a tus metas musicales.
            </p>
          </div>

          <PlansSection />
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
      {/* Location Section */}
      <section id="location" className="py-20 bg-muted/50 border-y">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold font-serif tracking-tight">Estamos cerca de ti</h2>
              <p className="text-muted-foreground text-lg italic">
                Nuestra academia se encuentra en un punto estratégico para tu comodidad, con espacios acústicamente tratados y el mejor equipamiento.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm border">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold">Dirección Principal</h4>
                    <p className="text-muted-foreground">Av. Música 123, Piso 2, Providencia</p>
                    <p className="text-xs text-primary font-medium mt-1 uppercase tracking-wider">A pasos de Metro Salvador</p>
                  </div>
                </div>
              </div>
              <Button variant="link" className="px-0 text-primary font-bold group" asChild>
                <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">
                  Cómo llegar <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                </a>
              </Button>
            </div>
            <div className="h-[400px] rounded-3xl overflow-hidden shadow-xl border bg-white relative">
              {/* Simplified Premium Map Mockup */}
              <div className="absolute inset-0 bg-[#f8f9fa] flex items-center justify-center">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center animate-ping" />
                  <div className="absolute inset-0 w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <MapPin className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/80 backdrop-blur-md rounded-2xl border shadow-lg">
                  <p className="text-sm font-bold">Reserva tu clase hoy</p>
                  <p className="text-xs text-muted-foreground">Te enviaremos la ubicación exacta al confirmar.</p>
                </div>
              </div>
            </div>
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
