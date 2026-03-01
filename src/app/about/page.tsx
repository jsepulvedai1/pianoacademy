import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Music, Users, Award, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-muted/30">
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary mb-2">
              Nuestra Historia
            </div>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Pasión por el Piano
            </h1>
            <p className="text-xl text-muted-foreground max-w-[700px]">
              Desde 2010, PianoAcademy se ha dedicado a formar músicos de todas las edades, 
              creando un espacio donde la técnica se encuentra con la creatividad.
            </p>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">Nuestra Misión</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Creemos que la música es un lenguaje universal que todos deberían tener la oportunidad de hablar. 
                Nuestra misión es desmitificar el aprendizaje del piano, haciéndolo accesible, divertido y riguroso al mismo tiempo.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                No solo enseñamos a tocar teclas; enseñamos a escuchar, a sentir y a expresarse a través del instrumento.
              </p>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex flex-col gap-2 p-4 bg-card rounded-lg border shadow-sm">
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <span className="font-bold text-2xl">500+</span>
                  <span className="text-sm text-muted-foreground">Alumnos formados</span>
                </div>
                <div className="flex flex-col gap-2 p-4 bg-card rounded-lg border shadow-sm">
                  <Award className="h-8 w-8 text-primary mb-2" />
                  <span className="font-bold text-2xl">15+</span>
                  <span className="text-sm text-muted-foreground">Años de experiencia</span>
                </div>
              </div>
            </div>
            <div className="relative aspect-square md:aspect-auto md:h-[500px] rounded-2xl overflow-hidden shadow-2xl bg-muted">
              {/* Placeholder for an image - using a colored div for now or an external placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center">
                <Music className="h-32 w-32 text-primary opacity-20" />
              </div>
              <img 
                src="https://images.unsplash.com/photo-1552422535-c45813c61732?q=80&w=2070&auto=format&fit=crop" 
                alt="Clase de piano" 
                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Por qué elegirnos</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Nos diferenciamos por un enfoque pedagógico moderno que respeta el ritmo de cada estudiante.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-background border-none shadow-md">
              <CardContent className="pt-6">
                <div className="mb-4 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Metodología Personalizada</h3>
                <p className="text-muted-foreground">
                  Adaptamos el repertorio y los ejercicios a tus gustos y objetivos personales, ya sea clásico, jazz o pop.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-background border-none shadow-md">
              <CardContent className="pt-6">
                <div className="mb-4 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Comunidad Vibrante</h3>
                <p className="text-muted-foreground">
                  Organizamos recitales semestrales y jam sessions para que compartas tu música con otros.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-background border-none shadow-md">
              <CardContent className="pt-6">
                <div className="mb-4 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Heart className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Pasión por Enseñar</h3>
                <p className="text-muted-foreground">
                  Nuestros profesores no solo son grandes músicos, son educadores vocacionales certificados.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container px-4 md:px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              ¿Listo para comenzar tu viaje musical?
            </h2>
            <p className="text-xl text-muted-foreground">
              Agenda tu primera clase hoy y descubre todo lo que puedes lograr.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild className="text-lg px-8">
                <Link href="/book">Reservar Clase</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8">
                <Link href="/teachers">Conocer Profesores</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
