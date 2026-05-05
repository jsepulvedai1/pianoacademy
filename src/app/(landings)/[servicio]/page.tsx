import { LANDING_DATA } from '@/lib/landing-data';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Check, Star, ArrowRight, PlayCircle } from 'lucide-react';

export default async function ServiceLandingPage({ params }: { params: { servicio: string } }) {
  const data = LANDING_DATA[params.servicio];

  if (!data) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-10 pb-20 md:pt-20 md:pb-32 overflow-hidden bg-background">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 space-y-8 z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-widest">
                <Music2 className="h-4 w-4" />
                Academia Détaché
              </div>
              <h1 className="text-5xl md:text-7xl font-bold font-serif leading-tight tracking-tight">
                {data.title}
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed italic">
                "{data.subtitle}"
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="h-16 px-8 text-lg font-bold shadow-xl shadow-primary/20" asChild>
                  <Link href="/book">{data.cta}</Link>
                </Button>
                <Button variant="outline" size="lg" className="h-16 px-8 text-lg font-bold group">
                  Ver Video <PlayCircle className="ml-2 h-5 w-5 transition-transform group-hover:scale-110" />
                </Button>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`} alt="User" />
                    </div>
                  ))}
                </div>
                <span>+500 alumnos han transformado su música con nosotros</span>
              </div>
            </div>
            
            <div className="lg:w-1/2 relative">
              <div className="absolute -inset-10 bg-primary/10 rounded-full blur-3xl opacity-50" />
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white aspect-[4/5] md:aspect-square">
                <img 
                  src={data.image} 
                  alt={data.title} 
                  className="w-full h-full object-cover transition-transform duration-1000 hover:scale-110"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-24 bg-muted/50 border-y relative overflow-hidden">
        <div className="container px-4 md:px-6 mx-auto relative z-10 text-center max-w-4xl">
          <div className="space-y-12">
            <div className="space-y-4">
              <span className="text-red-500 font-bold uppercase tracking-widest text-sm">El Desafío</span>
              <h2 className="text-3xl md:text-4xl font-bold font-serif">{data.problem}</h2>
            </div>
            
            <div className="flex justify-center">
              <ArrowRight className="h-12 w-12 text-primary/30 rotate-90 lg:rotate-0" />
            </div>

            <div className="space-y-4">
              <span className="text-primary font-bold uppercase tracking-widest text-sm">Nuestra Propuesta</span>
              <h2 className="text-3xl md:text-4xl font-bold font-serif text-primary italic">
                {data.solution}
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-24 bg-background">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold font-serif">¿Por qué elegirnos?</h2>
            <p className="text-muted-foreground">Beneficios reales para tu crecimiento artístico.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {data.benefits.map((benefit, i) => (
              <div key={i} className="p-8 bg-white rounded-3xl border border-muted shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 group">
                <div className="h-12 w-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Check className="h-6 w-6" />
                </div>
                <p className="font-bold text-lg leading-snug">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-20 bg-primary text-primary-foreground overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white opacity-5 skew-x-12 translate-x-1/2" />
        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <p className="text-4xl md:text-5xl font-bold font-serif tracking-tighter">14+</p>
              <p className="text-primary-foreground/70 text-sm uppercase font-bold tracking-widest">Años de experiencia</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl md:text-5xl font-bold font-serif tracking-tighter">10k+</p>
              <p className="text-primary-foreground/70 text-sm uppercase font-bold tracking-widest">Horas de clase</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl md:text-5xl font-bold font-serif tracking-tighter">100%</p>
              <p className="text-primary-foreground/70 text-sm uppercase font-bold tracking-widest">Profesores Pro</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl md:text-5xl font-bold font-serif tracking-tighter">4.9/5</p>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-3 w-3 fill-secondary text-secondary" />)}
              </div>
              <p className="text-primary-foreground/70 text-sm uppercase font-bold tracking-widest">Reviews Google</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-background">
        <div className="container px-4 md:px-6 mx-auto text-center max-w-4xl space-y-10">
          <h2 className="text-4xl md:text-6xl font-bold font-serif leading-tight">
            Comienza hoy y descubre tu <span className="text-primary italic">verdadero potencial</span>
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Button size="lg" className="h-16 px-12 text-lg font-bold shadow-2xl shadow-primary/30" asChild>
              <Link href="/book">{data.cta}</Link>
            </Button>
            <Button variant="outline" size="lg" className="h-16 px-12 text-lg font-bold bg-white" asChild>
              <Link href="/catalog">Ver Otros Programas</Link>
            </Button>
          </div>
          <p className="text-muted-foreground text-sm italic">
            Garantía de satisfacción: Si no sientes conexión con tu profesor en la primera clase, te asignamos otro sin costo.
          </p>
        </div>
      </section>
    </div>
  );
}

const Music2 = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="8" cy="18" r="4" />
    <path d="M12 18V2l7 2" />
  </svg>
);
