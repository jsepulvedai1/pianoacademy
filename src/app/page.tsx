import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Music, UserCheck, Star, Check, MapPin, Award, Mic, Drum, ArrowRight, Heart } from "lucide-react";
import { PlansSection } from "@/components/layout/PlansSection";
import { InstrumentsCarousel } from "@/components/layout/InstrumentsCarousel";
import { getClient } from "@/lib/apollo-client";
import { GET_HOMEPAGE_CONTENT } from "@/graphql/queries/get-homepage";
import { cn, safeArray } from "@/lib/utils";

export const dynamic = "force-dynamic";


export default async function Home() {
  let hp: any = null;
  try {
    const { data } = await getClient().query<any>({
      query: GET_HOMEPAGE_CONTENT,
      fetchPolicy: "no-cache",
    });
    hp = data?.homepageContent;
  } catch (e) {
    console.error("Could not load homepage content:", e);
  }

  // Fallbacks in case DB is empty
  const heroImage = hp?.heroImage || "/images/background1.jpg";
  const heroTitle1 = hp?.heroTitle1 || "Aprende";
  const heroHighlight = hp?.heroTitleHighlight || "música";
  const heroTitle2 = hp?.heroTitle2 || "con un método claro, cercano y sin frustraciones.";
  const heroSubtitle = hp?.heroSubtitle || "Acompañamos a personas de todas las edades en su camino musical, respetando el ritmo y los objetivos de cada estudiante.";
  const cta1Text = hp?.heroCta1Text || "Ver Planes";
  const cta1Link = hp?.heroCta1Link || "#plans";

  const methodTitle = hp?.methodTitle || "Siguiendo el Compás";
  const methodDescription = hp?.methodDescription ||
    "En Academia Détaché creemos que aprender música es un proceso que debe disfrutarse. Por eso, nuestra metodología combina una enseñanza estructurada con un acompañamiento cercano y personalizado, adaptándose al ritmo, los intereses y los objetivos de cada estudiante.\n\nA través de clases didácticas y un aprendizaje progresivo, buscamos desarrollar habilidades musicales sólidas mientras fomentamos la creatividad, la confianza y el gusto por la música.";
  const methodImage = hp?.methodImage || "/imagesfooter/4.png";

  const testimonials = safeArray(hp?.testimonials).length > 0
    ? safeArray(hp.testimonials)
    : [
      { quote: "Increíble experiencia. El sistema de reservas es súper fácil y mi profesor es un genio.", author: "Carolina R." },
      { quote: "Nunca creí que aprendería tan rápido. La metodología es completamente diferente.", author: "Matías V." },
      { quote: "Lo mejor de Santiago para aprender piano. Instalaciones de primer nivel.", author: "Sofía M." },
    ];

  const locationTitle = hp?.locationTitle || "Estamos cerca de ti";
  const locationDescription = hp?.locationDescription || "Nuestra academia se encuentra en un punto estratégico para tu comodidad, con espacios acústicamente tratados y el mejor equipamiento.";
  const locationAddress = hp?.locationAddress || "Gran Avenida José Miguel Carrera 8520, Of. C, La Cisterna";
  const locationAddressDetail = hp?.locationAddressDetail || "A pasos de Metro La Cisterna";
  const locationMapUrl = hp?.locationMapUrl || "https://maps.google.com";

  // Planes Section editables
  const planesTitle = hp?.planesTitle || "Nuestros Planes";
  const planesDescription = hp?.planesDescription || "Haz espacio para la música en tu vida y encuentra el programa perfecto para ti.";

  // Instruments Section editables
  const instrumentsTitle = hp?.instrumentsTitle || "Aprende con Nosotros";
  const instrumentsDescription = hp?.instrumentsDescription || "La música comienza con una primera nota. Nosotros te acompañamos en el resto del camino.";

  // Gallery Section editables
  const galleryTitle = hp?.galleryTitle || "LA MÚSICA COMO NUNCA TE LA HABÍAN EXPLICADO";
  let galleryImages = [
    "/imagesfooter/1.png",
    "/imagesfooter/2.png",
    "/imagesfooter/3.png",
    "/imagesfooter/4.png",
  ];
  if (hp?.galleryImages) {
    try {
      galleryImages = typeof hp.galleryImages === 'string' ? JSON.parse(hp.galleryImages) : hp.galleryImages;
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── 1. Hero Section ── */}
      <section className="relative min-h-screen flex items-end pb-24 md:pb-0 md:items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Piano Background"
            className="w-full h-full object-cover filter grayscale contrast-[1.10]"
          />
          <div className="absolute inset-0 bg-black/60 md:bg-black/55 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
        </div>

        <div className="container relative z-10 px-4 md:px-6 mx-auto text-center md:text-left mt-0 md:mt-24">
          <div className="max-w-4xl space-y-6">
            <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.15] font-sans">
              {heroTitle1} <span className="text-secondary">{heroHighlight}</span><br />
              <span className="text-white/95">{heroTitle2}</span>
            </h1>
            <p className="max-w-2xl text-white/80 text-sm md:text-lg leading-relaxed font-normal">
              {heroSubtitle}
            </p>

            <div className="pt-4 flex justify-center md:justify-start">
              <Button
                size="lg"
                className="h-14 px-10 text-xs font-bold uppercase tracking-[0.2em] shadow-xl shadow-primary/20 bg-primary hover:bg-primary/95 text-white border-none rounded-full transition-transform hover:scale-105"
                asChild
              >
                <Link href="#plans">{cta1Text}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Polaroid / Methodology Section ("Siguiendo el Compás") ── */}
      <section className="py-20 md:py-32 bg-[#F8F7F4] text-slate-800 overflow-hidden">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Texts */}
            <div className="lg:w-1/2 space-y-6">
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-primary font-sans">
                {methodTitle}
              </h2>
              <div className="text-sm md:text-base text-slate-600 leading-loose space-y-4 font-normal">
                {methodDescription.split("\n\n").map((para: string, idx: number) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
              <div className="pt-2">
                <Button
                  asChild
                  className="bg-primary hover:bg-primary/90 text-white font-bold px-10 h-12 rounded-full border-none shadow-md uppercase tracking-wider text-[14px] transition-transform hover:scale-105"
                >
                  <Link href="/about">Conoce más</Link>
                </Button>
              </div>
            </div>

            {/* Polaroid Graphic */}
            <div className="lg:w-1/2 relative flex justify-center py-10">
              <div className="relative w-full max-w-[494px]">
                {/* Hand-drawn purple rays at the top-right */}
                <svg className="absolute -top-6 -right-6 w-16 h-16 text-primary rotate-[15deg] select-none z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="6" y1="18" x2="2" y2="8" />
                  <line x1="12" y1="16" x2="16" y2="4" />
                  <line x1="16" y1="18" x2="24" y2="12" />
                </svg>

                {/* Hand-drawn yellow star/sparkle at the bottom-left */}
                <svg className="absolute -bottom-8 -left-8 w-26 h-26 text-[#DFB012] fill-current select-none z-10" viewBox="0 0 100 100">
                  <path d="M50 0 L54 35 L85 15 L62 42 L100 50 L62 58 L85 85 L54 65 L50 100 L46 65 L15 85 L38 58 L0 50 L38 42 L15 15 L46 35 Z" />
                </svg>

                <div className="relative bg-white p-5 pb-16 shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-slate-100 rounded-lg w-full rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-md bg-slate-50 relative">
                    <img
                      src={methodImage}
                      alt="Metodología Détaché"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute bottom-5 left-8 text-slate-400 font-sans italic text-sm">
                    Academia Détaché
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Nuestros Planes (Yellow Container) ── */}
      <section id="plans" className="py-20 md:py-32 bg-[#E2B612] text-slate-900 relative overflow-hidden">
        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold font-sans text-slate-900">
              {planesTitle}
            </h2>
            <p className="text-slate-800 text-sm md:text-base font-medium leading-relaxed max-w-xl mx-auto">
              {planesDescription}
            </p>
          </div>

          <PlansSection />
        </div>

        {/* SVG Wave Divider at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-0 transform translate-y-[1px] pointer-events-none">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="w-full h-[60px] md:h-[100px] text-white fill-current">
            <path d="M0,120 L0,60 C100,0 250,0 350,70 C450,140 650,90 850,90 C1050,90 1250,50 1440,90 L1440,120 Z" />
          </svg>
        </div>
      </section>

      {/* ── 4. Aprende con Nosotros (Instruments Carousel) ── */}
      <section className="py-20 md:py-32 bg-white text-slate-900 overflow-hidden">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#8E44AD]">
              {instrumentsTitle}
            </h2>
            <p className="text-slate-500 text-sm md:text-base">
              {instrumentsDescription}
            </p>
          </div>

          <InstrumentsCarousel />
        </div>
      </section>

      {/* ── 5. Photo Strips and Typographic Section ── */}
      <section className="py-20 md:py-32 bg-amber-50/30 overflow-hidden border-t">
        <div className="container px-4 md:px-6 mx-auto text-center max-w-5xl space-y-16">
          <h2 className="text-4xl md:text-7xl font-extrabold leading-none tracking-tighter text-primary uppercase max-w-4xl mx-auto" dangerouslySetInnerHTML={{ __html: galleryTitle }} />

          {/* Horizontal Gallery */}
          <div className="flex flex-col md:flex-row gap-6 md:overflow-x-auto pb-6 md:scrollbar-none md:snap-x md:snap-mandatory">
            {galleryImages.map((img, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-full md:w-[468px] aspect-[4/3] rounded-3xl overflow-hidden shadow-lg md:snap-center relative group"
              >
                <img
                  src={img}
                  alt="Galería Academia"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Testimonials (Premium layout) ── */}


      {/* ── 7. Location Section ── */}
      {/* <section id="location" className="py-20 bg-slate-50 border-y">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800">{locationTitle}</h2>
              <p className="text-slate-500 text-sm md:text-base leading-relaxed">{locationDescription}</p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm border">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">Dirección Principal</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{locationAddress}</p>
                    <p className="text-[10px] text-primary font-bold mt-1.5 uppercase tracking-wider">{locationAddressDetail}</p>
                  </div>
                </div>
              </div>
              <Button variant="link" className="px-0 text-primary font-bold group text-xs uppercase tracking-widest" asChild>
                <a href={locationMapUrl && locationMapUrl !== "https://maps.google.com" ? locationMapUrl : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationAddress)}`} target="_blank" rel="noopener noreferrer">
                  Cómo llegar <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                </a>
              </Button>
            </div>

            <a
              href={locationMapUrl && locationMapUrl !== "https://maps.google.com" ? locationMapUrl : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-[360px] rounded-[2rem] overflow-hidden shadow-lg border bg-white relative block group cursor-pointer"
            >
              <iframe
                title="Google Maps"
                width="100%"
                height="100%"
                className="border-0 pointer-events-none filter grayscale opacity-90 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-300"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(locationAddress)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                allowFullScreen
                loading="lazy"
              ></iframe>

              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300 pointer-events-none" />

              <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/90 backdrop-blur-md rounded-2xl border shadow-md group-hover:bg-white transition-colors duration-300">
                <p className="text-xs font-bold text-slate-800">{locationAddress}</p>
                <p className="text-[10px] text-primary font-semibold mt-0.5 uppercase tracking-wider">{locationAddressDetail}</p>
                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-2 group-hover:text-primary transition-colors">
                  Haga clic para abrir en Google Maps ↗
                </p>
              </div>
            </a>
          </div>
        </div>
      </section> */}
    </div>
  );
}
