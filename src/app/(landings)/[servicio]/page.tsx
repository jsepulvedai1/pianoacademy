"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@apollo/client/react/index.js";
import { GET_LANDING_PAGE_BY_SLUG } from "@/graphql/queries/get-landings";
import { GET_TEACHERS } from "@/graphql/queries/get-teachers";
import { GET_ROOMS } from "@/graphql/queries/get-rooms";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getImageUrl, safeArray } from "@/lib/utils";
import {
  Check,
  Star,
  ArrowRight,
  Music2,
  ChevronLeft,
  ChevronRight,
  Building,
  Users,
  CalendarCheck,
  Sparkles,
} from "lucide-react";

const DEFAULT_INSTRUMENT_PAGES: Record<
  string,
  {
    instrumentKey: string;
    instrumentName: string;
    emoji: string;
    minAgeLabel: string;
    title: string;
    subtitle: string;
    problem: string;
    solution: string;
    benefits: string[];
    heroImage: string;
    galleryImages: { url: string; caption: string }[];
    keywords: string[];
  }
> = {
  piano: {
    instrumentKey: "PIANO",
    instrumentName: "Piano",
    emoji: "🎹",
    minAgeLabel: "🎹 Piano: Desde los 4 años (Metodología Infantil, Juvenil y Adultos)",
    title: "Clases de Piano en Academia Détaché",
    subtitle: "Desarrolla técnica orgánica, lectura fluida y sensibilidad musical en pianos acústicos y de cola.",
    problem: "¿Sientes que practicar sin guía te estanca o genera tensión en las manos?",
    solution: "Nuestro método progresivo adapta el repertorio desde los 4 años hasta nivel avanzado, cuidando postura y musicalidad desde el primer día.",
    benefits: [
      "Salas equipadas con pianos acústicos y de cola",
      "Metodología adaptada por edad (desde los 4 años)",
      "Lectura de partituras, armonía e interpretación",
      "Clases individuales personalizadas con profesores especialistas",
    ],
    heroImage: "/images/piano-hero.png",
    galleryImages: [
      { url: "/images/piano-hero.png", caption: "Sala Principal de Piano Acústico y de Cola" },
      { url: "/images/piano-kids.png", caption: "Metodología Infantil de Piano (Desde los 4 años)" },
      { url: "/images/piano-adults.png", caption: "Clases Individuales para Jóvenes y Adultos" },
      { url: "/imagesfooter/1.png", caption: "Instalaciones Acústicamente Acondicionadas" },
    ],
    keywords: ["piano", "teclado"],
  },
  "piano-ninos": {
    instrumentKey: "PIANO",
    instrumentName: "Piano",
    emoji: "🎹",
    minAgeLabel: "🎹 Piano Infantil: Desde los 4 años",
    title: "Clases de Piano para Niños",
    subtitle: "Iniciación musical lúdica y estructurada para niños desde los 4 años.",
    problem: "Muchos niños pierden el interés cuando las clases son rígidas y poco estimulantes.",
    solution: "Combinamos juego musical, motricidad fina, oído rítmico y lectura progresiva en un entorno cálido.",
    benefits: [
      "Desde los 4 años con metodología especializada",
      "Desarrollo cognitivo, concentración y motricidad",
      "Salas climatizadas y sala de espera para apoderados",
      "Profesores con vocación pedagógica infantil",
    ],
    heroImage: "/images/piano-kids.png",
    galleryImages: [
      { url: "/images/piano-kids.png", caption: "Clases de Piano Infantil (Desde los 4 años)" },
      { url: "/images/piano-hero.png", caption: "Instrumentos Acústicos Calibrados" },
      { url: "/imagesfooter/2.png", caption: "Salas de Clases en Sede La Cisterna" },
    ],
    keywords: ["piano", "infantil"],
  },
  "piano-adultos": {
    instrumentKey: "PIANO",
    instrumentName: "Piano",
    emoji: "🎹",
    minAgeLabel: "🎹 Piano Jóvenes y Adultos (Todos los niveles)",
    title: "Clases de Piano para Adultos",
    subtitle: "Nunca es tarde para tocar las obras que siempre soñaste con técnica real.",
    problem: "¿Crees que ya pasó tu momento para aprender piano desde cero o retomar?",
    solution: "Un programa 100% personalizado a tu ritmo, combinando repertorio clásico, moderno, cine o jazz.",
    benefits: [
      "Sin conocimientos previos requeridos",
      "Horarios flexibles de Lunes a Sábado",
      "Práctica en pianos acústicos profesionales",
      "Seguimiento personalizado clase a clase",
    ],
    heroImage: "/images/piano-adults.png",
    galleryImages: [
      { url: "/images/piano-adults.png", caption: "Clases de Piano para Adultos" },
      { url: "/images/piano-hero.png", caption: "Salas de Piano Equipadas" },
      { url: "/imagesfooter/3.png", caption: "Ambiente de Estudio en Academia Détaché" },
    ],
    keywords: ["piano"],
  },
  canto: {
    instrumentKey: "CANTO",
    instrumentName: "Canto",
    emoji: "🎤",
    minAgeLabel: "🎤 Canto: Desde los 6 años",
    title: "Clases de Canto y Técnica Vocal",
    subtitle: "Descubre el potencial de tu voz con respiración consciente, afinación y expresión escénica.",
    problem: "¿Sientes fatiga vocal al cantar o inseguridad para llegar a notas agudas?",
    solution: "Entrenamiento vocal saludable y progresivo (desde los 6 años) adaptado a tu registro y estilo musical favorito.",
    benefits: [
      "Disponible para alumnos desde los 6 años",
      "Respiración costo-diafragmática y colocación vocal",
      "Salas equipadas con amplificación, micrófonos y piano",
      "Interpretación en estilos Pop, Lírico, Jazz y Musical",
    ],
    heroImage: "/images/canto.png",
    galleryImages: [
      { url: "/images/canto.png", caption: "Sala de Canto y Técnica Vocal" },
      { url: "/imagesfooter/1.png", caption: "Equipamiento de Audio y Acompañamiento" },
      { url: "/imagesfooter/4.png", caption: "Entrenamiento Vocal Personalizado" },
    ],
    keywords: ["canto", "voz", "vocal"],
  },
  guitarra: {
    instrumentKey: "GUITARRA",
    instrumentName: "Guitarra",
    emoji: "🎸",
    minAgeLabel: "🎸 Guitarra: Desde los 8 años",
    title: "Clases de Guitarra Acústica y Eléctrica",
    subtitle: "Domina acordes, ritmo, fingerpicking y solos mientras tocas la música que te apasiona.",
    problem: "¿Intentaste aprender por tutoriales de internet sin lograr fluidez ni sonido limpio?",
    solution: "Corregimos postura, pulsación y ritmo paso a paso desde los 8 años con un plan estructurado.",
    benefits: [
      "Disponible para alumnos desde los 8 años",
      "Guitarra clásica, acústica o eléctrica",
      "Salas equipadas con amplificadores y atriles",
      "Repertorio moderno, rock, pop, folclore y clásico",
    ],
    heroImage: "/images/piano-adults.png",
    galleryImages: [
      { url: "/images/piano-adults.png", caption: "Sala de Guitarra y Cuerdas" },
      { url: "/images/method.png", caption: "Práctica Guiada Paso a Paso" },
      { url: "/imagesfooter/2.png", caption: "Salas Acondicionadas en Sede La Cisterna" },
    ],
    keywords: ["guitarra", "cuerdas"],
  },
  bateria: {
    instrumentKey: "BATERIA",
    instrumentName: "Batería",
    emoji: "🥁",
    minAgeLabel: "🥁 Batería: Desde los 6 años",
    title: "Clases de Batería y Percusión",
    subtitle: "Desarrolla coordinación, pulso, lectura rítmica y energía sobre el instrumento.",
    problem: "¿Quieres tocar tus canciones favoritas con precisión rítmica e independencia de extremidades?",
    solution: "Clases prácticas desde los 6 años en salas acústicamente acondicionadas con batería profesional.",
    benefits: [
      "Disponible para alumnos desde los 6 años",
      "Independencia rítmica, rudimentos y groove",
      "Sala insonorizada y equipada con batería profesional",
      "Práctica sobre pistas reales (play-along) y lectura",
    ],
    heroImage: "/images/method.png",
    galleryImages: [
      { url: "/images/method.png", caption: "Sala de Batería y Ritmo" },
      { url: "/imagesfooter/3.png", caption: "Acondicionamiento Acústico Profesional" },
      { url: "/imagesfooter/4.png", caption: "Clases Individuales desde los 6 años" },
    ],
    keywords: ["bateria", "batería", "percusion", "percusión"],
  },
  violin: {
    instrumentKey: "VIOLIN",
    instrumentName: "Violín",
    emoji: "🎻",
    minAgeLabel: "🎻 Violín: Desde los 6 años",
    title: "Clases de Violín en Academia Détaché",
    subtitle: "Postura ergonómica, dominio del arco, afinación precisa y expresividad musical.",
    problem: "El violín requiere una guía técnica experta desde el primer día para lograr un sonido noble.",
    solution: "Metodología personalizada (Suzuki y tradicional) para niños desde los 6 años, jóvenes y adultos.",
    benefits: [
      "Disponible para alumnos desde los 6 años",
      "Técnica de arco (Détaché, Legato, Spiccato) y afinación",
      "Salas amplias con espejos de postura y piano acompañante",
      "Preparación para repertorio solista y de cámara",
    ],
    heroImage: "/images/piano-hero.png",
    galleryImages: [
      { url: "/images/piano-hero.png", caption: "Sala de Violín y Cuerdas Frotadas" },
      { url: "/images/method.png", caption: "Trabajo de Postura y Técnica de Arco" },
      { url: "/imagesfooter/1.png", caption: "Instalaciones Academia Détaché" },
    ],
    keywords: ["violin", "violín", "cuerdas"],
  },
};

export default function ServiceLandingPage({ params }: { params: Promise<{ servicio: string }> }) {
  const { servicio } = use(params);
  const slugLower = (servicio || "").toLowerCase();

  const { data: queryData } = useQuery<any>(GET_LANDING_PAGE_BY_SLUG, {
    variables: { slug: servicio },
  });
  const { data: teachersData } = useQuery<any>(GET_TEACHERS);
  const { data: roomsData } = useQuery<any>(GET_ROOMS);

  const cmsData = queryData?.landingPageBySlug;
  const fallback =
    DEFAULT_INSTRUMENT_PAGES[slugLower] ||
    DEFAULT_INSTRUMENT_PAGES[
      Object.keys(DEFAULT_INSTRUMENT_PAGES).find((k) => slugLower.includes(k)) || "piano"
    ];

  const title = cmsData?.title || fallback.title;
  const subtitle = cmsData?.subtitle || fallback.subtitle;
  const problem = cmsData?.problem || fallback.problem;
  const solution = cmsData?.solution || fallback.solution;
  const benefits = safeArray(cmsData?.benefits).length > 0 ? safeArray(cmsData?.benefits) : fallback.benefits;
  const heroImage = cmsData?.imageUrl || fallback.heroImage;
  const gallery = fallback.galleryImages;

  const [carouselIdx, setCarouselIdx] = useState(0);

  // Filter teachers for this instrument
  const instrumentTeachers = useMemo(() => {
    const allTeachers = (teachersData?.allTeachers || []).filter((t: any) => t.status !== "INACTIVE");
    const matched = allTeachers.filter((t: any) => {
      const specs = (t.specialties || []).map((s: any) => (s.name || "").toLowerCase());
      const desc = (t.description || "").toLowerCase();
      return fallback.keywords.some(
        (kw) => specs.some((sp: string) => sp.includes(kw)) || desc.includes(kw)
      );
    });
    return matched.length > 0 ? matched : allTeachers;
  }, [teachersData, fallback]);

  // Filter rooms that have this instrument or show all available rooms
  const instrumentRooms = useMemo(() => {
    const allRooms = (roomsData?.allRooms || []).filter((r: any) => r.status !== "MAINTENANCE");
    const matched = allRooms.filter((r: any) =>
      (r.instruments || []).some((inst: any) =>
        fallback.keywords.some((kw) => (inst.name || "").toLowerCase().includes(kw))
      )
    );
    return matched.length > 0 ? matched : allRooms;
  }, [roomsData, fallback]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-background">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="lg:w-1/2 space-y-6 z-10">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                  <Music2 className="h-4 w-4" />
                  Academia Détaché
                </div>
                <Badge className="bg-[#DFB012] text-slate-900 font-extrabold text-xs px-3.5 py-1.5 rounded-full">
                  {fallback.minAgeLabel}
                </Badge>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold font-serif leading-tight tracking-tight text-slate-900">
                {title}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed italic">
                &ldquo;{subtitle}&rdquo;
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button size="lg" className="h-14 px-8 text-base font-bold rounded-full shadow-xl shadow-primary/20" asChild>
                  <Link href={`/book?instrument=${fallback.instrumentKey}`}>
                    <CalendarCheck className="mr-2 h-5 w-5" />
                    Inscribir Clase de Prueba (30 min)
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="h-14 px-8 text-base font-bold rounded-full" asChild>
                  <Link href="#profesores-instrumento">Ver Profesores y Salas</Link>
                </Button>
              </div>
            </div>

            <div className="lg:w-1/2 relative w-full">
              <div className="absolute -inset-10 bg-primary/10 rounded-full blur-3xl opacity-50" />
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white aspect-[4/3]">
                <img
                  src={heroImage}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CARRUSEL DE IMÁGENES Y SALAS DEL INSTRUMENTO */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container px-4 md:px-6 mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#DFB012]">
                Nuestras Instalaciones • Sede La Cisterna
              </span>
              <h2 className="text-3xl md:text-4xl font-bold font-serif">
                Salas de {fallback.instrumentName} y Galería
              </h2>
              <p className="text-slate-300 text-sm max-w-2xl">
                Espacios acústicamente acondicionados con instrumentos profesionales para que vivas cada clase al máximo nivel.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setCarouselIdx((prev) => (prev - 1 + gallery.length) % gallery.length)}
                className="rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setCarouselIdx((prev) => (prev + 1) % gallery.length)}
                className="rounded-full bg-[#DFB012] border-[#DFB012] text-slate-900 hover:bg-[#DFB012]/90"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Carrusel Interactivo + Salas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 relative rounded-[2rem] overflow-hidden border-4 border-white/10 aspect-[16/10] bg-slate-800">
              <img
                src={gallery[carouselIdx]?.url || heroImage}
                alt={gallery[carouselIdx]?.caption || title}
                className="w-full h-full object-cover transition-all duration-500"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 flex items-end justify-between">
                <div>
                  <Badge className="bg-[#DFB012] text-slate-900 font-bold text-[10px] mb-1">
                    Foto {carouselIdx + 1} de {gallery.length}
                  </Badge>
                  <p className="font-bold text-lg text-white">{gallery[carouselIdx]?.caption}</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-xl font-bold font-serif text-[#DFB012] flex items-center gap-2">
                <Building className="h-5 w-5" /> Salas Habilitadas en Academia
              </h3>
              <div className="space-y-3">
                {instrumentRooms.slice(0, 4).map((room: any) => (
                  <div
                    key={room.id}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="font-bold text-white text-sm">🚪 {room.name}</p>
                      <p className="text-xs text-slate-300">
                        Capacidad: {room.capacity} {room.capacity === 1 ? "alumno (Individual)" : "alumnos"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {room.instruments?.map((inst: any) => (
                        <Badge key={inst.id} className="bg-white/15 text-white text-[10px]">
                          {inst.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCarouselIdx(i)}
                    className={`rounded-xl overflow-hidden h-16 border-2 transition-all ${
                      carouselIdx === i ? "border-[#DFB012] scale-105" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img.url} alt={img.caption} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROFESORES QUE IMPARTEN ESTE INSTRUMENTO */}
      <section id="profesores-instrumento" className="py-20 bg-slate-50 border-b">
        <div className="container px-4 md:px-6 mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#70125F]/10 text-[#70125F] text-xs font-bold uppercase tracking-widest">
              <Users className="h-3.5 w-3.5" /> Cuerpo Docente Especialista
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-slate-900">
              Profesores que Imparten {fallback.instrumentName} {fallback.emoji}
            </h2>
            <p className="text-slate-500 text-sm">
              Conoce a los maestros de {fallback.instrumentName} de Academia Détaché y agenda tu Clase de Prueba de 30 minutos directamente con ellos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {instrumentTeachers.map((teacher: any) => (
              <Card
                key={teacher.id}
                className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between gap-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                      {teacher.photo ? (
                        <img
                          src={getImageUrl(teacher.photo)}
                          alt={teacher.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl font-serif font-bold text-[#70125F]">
                          {teacher.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 font-serif">{teacher.name}</h3>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {teacher.specialties?.map((s: any) => (
                          <Badge key={s.id || s.name} variant="outline" className="text-[10px] text-[#70125F] border-[#70125F]/20 bg-[#70125F]/5">
                            {s.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {teacher.description || `Profesor especialista en ${fallback.instrumentName} y formación musical personalizada.`}
                  </p>
                </div>

                <Button className="w-full bg-[#70125F] hover:bg-[#590e4b] text-white rounded-2xl h-11 text-xs font-bold uppercase tracking-wider" asChild>
                  <Link href={`/book?instrument=${fallback.instrumentKey}`}>
                    Agendar Clase de Prueba con {teacher.name.split(" ")[0]}
                  </Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 bg-white border-b relative overflow-hidden">
        <div className="container px-4 md:px-6 mx-auto relative z-10 text-center max-w-4xl">
          <div className="space-y-10">
            <div className="space-y-3">
              <span className="text-red-500 font-bold uppercase tracking-widest text-xs">El Desafío</span>
              <h2 className="text-2xl md:text-3xl font-bold font-serif">{problem}</h2>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="h-10 w-10 text-primary/30 rotate-90" />
            </div>

            <div className="space-y-3">
              <span className="text-primary font-bold uppercase tracking-widest text-xs">Nuestra Metodología</span>
              <h2 className="text-2xl md:text-3xl font-bold font-serif text-primary italic">
                {solution}
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 bg-background">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold font-serif">¿Por qué aprender {fallback.instrumentName} en Détaché?</h2>
            <p className="text-muted-foreground text-sm">{fallback.minAgeLabel}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit: string, i: number) => (
              <div
                key={i}
                className="p-6 bg-white rounded-3xl border border-muted shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 group"
              >
                <div className="h-11 w-11 rounded-2xl bg-primary/5 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Check className="h-5 w-5" />
                </div>
                <p className="font-bold text-base leading-snug">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6 mx-auto text-center max-w-3xl space-y-6">
          <h2 className="text-3xl md:text-5xl font-bold font-serif leading-tight">
            Reserva tu Clase de Prueba de {fallback.instrumentName} (30 min)
          </h2>
          <p className="text-primary-foreground/80 text-sm md:text-base">
            Elige a tu profesor especialista y horario en línea. Recuerda que las reservas web se agendan desde el día siguiente con pago anticipado.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <Button size="lg" className="h-14 px-10 text-base font-bold bg-[#DFB012] text-slate-900 hover:bg-[#DFB012]/90 rounded-full" asChild>
              <Link href={`/book?instrument=${fallback.instrumentKey}`}>
                Agendar Clase de Prueba Ahora
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-14 px-10 text-base font-bold bg-transparent border-white text-white hover:bg-white/10 rounded-full" asChild>
              <Link href="/">Volver a Inicio</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
