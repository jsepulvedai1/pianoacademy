import { Instagram, Facebook, Mail, Phone, MapPin, Clock, Lock, ArrowUpRight, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@apollo/client/react/index.js";
import { GET_GLOBAL_SETTINGS } from "@/graphql/queries/get-global-settings";
import { normalizePhoneNumber } from "@/lib/utils";

export function Footer() {
  const { data } = useQuery<any>(GET_GLOBAL_SETTINGS);
  const settings = data?.globalSettings || {
    phoneNumber: "+56 9 9799 9726",
    whatsappNumber: "+569979997269",
    emailContact: "academia@detache.cl",
    address: "Gran Avenida José Miguel Carrera 8520, Oficina C, La Cisterna",
    openingHoursWeekdays: "09:00 - 20:30",
    openingHoursSaturdays: "09:00 - 15:00",
    facebookUrl: "https://facebook.com",
    instagramUrl: "https://instagram.com/academia.detache"
  };

  const rawPhone = settings.whatsappNumber || settings.phoneNumber || "+569979997269";
  const displayPhone = settings.phoneNumber || (rawPhone.startsWith("+569") ? `+56 9 ${rawPhone.substring(4, 8)} ${rawPhone.substring(8)}` : rawPhone);

  return (
    <footer className="relative bg-gradient-to-b from-[#70125F] via-[#651056] to-[#4e0c42] text-white overflow-hidden">
      
      {/* Top subtle decorative gold accent line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#DCA060]/40 to-transparent" />

      {/* Subtle ambient lighting effect */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#DCA060]/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 text-sm">
          
          {/* Column 1: Logo, Bio & Socials (Span 4) */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="inline-block group">
              <img 
                src="/icons/logo.svg" 
                alt="Détaché Academia de Música" 
                className="h-16 sm:h-20 w-auto brightness-0 invert transition-transform group-hover:scale-[1.02] duration-300" 
              />
            </Link>
            <p className="text-white/80 leading-relaxed max-w-sm text-xs sm:text-[13px] font-normal">
              Acompañamos a personas de todas las edades en su camino musical, respetando el ritmo y los objetivos de cada estudiante.
            </p>
            
            {/* Social Network Buttons */}
            <div className="flex items-center gap-3 pt-1">
              <a 
                href={settings.instagramUrl || "https://instagram.com/academia.detache"} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Instagram Détaché"
                className="h-10 w-10 rounded-2xl bg-white/10 hover:bg-[#DCA060] hover:text-slate-950 border border-white/10 flex items-center justify-center transition-all duration-300 shadow-sm group cursor-pointer"
              >
                <Instagram className="h-4 w-4 transition-transform group-hover:scale-110" />
              </a>
              <a 
                href={settings.facebookUrl || "https://facebook.com"} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Facebook Détaché"
                className="h-10 w-10 rounded-2xl bg-white/10 hover:bg-[#DCA060] hover:text-slate-950 border border-white/10 flex items-center justify-center transition-all duration-300 shadow-sm group cursor-pointer"
              >
                <Facebook className="h-4 w-4 transition-transform group-hover:scale-110" />
              </a>
              <a 
                href={`https://wa.me/${normalizePhoneNumber(rawPhone)}`}
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="WhatsApp Détaché"
                className="h-10 w-10 rounded-2xl bg-white/10 hover:bg-emerald-500 hover:text-white border border-white/10 flex items-center justify-center transition-all duration-300 shadow-sm group cursor-pointer"
              >
                <MessageCircle className="h-4 w-4 transition-transform group-hover:scale-110" />
              </a>
            </div>
          </div>
          
          {/* Column 2: Conócenos (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-extrabold text-xs uppercase tracking-[0.25em] text-[#DCA060]">
              Conócenos
            </h4>
            <ul className="space-y-2.5 text-xs text-white/75 font-medium">
              <li>
                <Link href="/about" className="hover:text-white transition-colors inline-flex items-center gap-1 group">
                  <span className="group-hover:translate-x-0.5 transition-transform">Sobre Nosotros</span>
                </Link>
              </li>
              <li>
                <Link href="/teachers" className="hover:text-white transition-colors inline-flex items-center gap-1 group">
                  <span className="group-hover:translate-x-0.5 transition-transform">Nuestros Equipos</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors inline-flex items-center gap-1 group">
                  <span className="group-hover:translate-x-0.5 transition-transform">Contáctanos</span>
                </Link>
              </li>
              <li>
                <Link href="/book" className="hover:text-white transition-colors inline-flex items-center gap-1 group">
                  <span className="group-hover:translate-x-0.5 transition-transform">Agendar Clase Inicial</span>
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors inline-flex items-center gap-1 group">
                  <span className="group-hover:translate-x-0.5 transition-transform">Términos de Servicio</span>
                </Link>
              </li>
              <li className="pt-3">
                <Link 
                  href="/login" 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-[11px] text-white/60 hover:text-white transition-all group"
                >
                  <Lock className="h-3 w-3 text-[#DCA060]" />
                  <span>Portal Staff</span>
                  <ArrowUpRight className="h-3 w-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Horarios (Span 3) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-extrabold text-xs uppercase tracking-[0.25em] text-[#DCA060] flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-[#DCA060]" />
              <span>Horarios</span>
            </h4>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-white/[0.06] border border-white/10 space-y-1">
                <span className="text-[11px] font-bold text-[#DCA060] uppercase tracking-wider block">
                  Lunes a Viernes
                </span>
                <span className="text-white font-medium block text-xs">
                  {settings.openingHoursWeekdays || "09:00 - 20:30 hrs"}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.06] border border-white/10 space-y-1">
                <span className="text-[11px] font-bold text-[#DCA060] uppercase tracking-wider block">
                  Sábados
                </span>
                <span className="text-white font-medium block text-xs">
                  {settings.openingHoursSaturdays || "09:00 - 15:00 hrs"}
                </span>
              </div>
            </div>
          </div>

          {/* Column 4: Contacto Directo (Span 3) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-extrabold text-xs uppercase tracking-[0.25em] text-[#DCA060]">
              Contacto
            </h4>
            <ul className="space-y-3 text-xs text-white/80">
              <li>
                <a 
                  href={`mailto:${settings.emailContact}`} 
                  className="group flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="h-8 w-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-[#DCA060] shrink-0 group-hover:scale-105 transition-transform">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span className="font-medium group-hover:text-white transition-colors break-all">
                    {settings.emailContact}
                  </span>
                </a>
              </li>
              <li>
                <a 
                  href={`https://wa.me/${normalizePhoneNumber(rawPhone)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="h-8 w-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                    <Phone className="h-4 w-4" />
                  </div>
                  <span className="font-mono font-medium group-hover:text-white transition-colors">
                    {displayPhone}
                  </span>
                </a>
              </li>
              <li className="flex items-start gap-3 p-2 -mx-2">
                <div className="h-8 w-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-[#DCA060] shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="space-y-0.5 text-white/75 leading-relaxed text-xs">
                  <span className="font-medium text-white/90 block">{settings.address}</span>
                  <span className="text-[10px] text-white/50 block">La Cisterna, Santiago de Chile</span>
                </div>
              </li>
            </ul>
          </div>

        </div>
        
        {/* Bottom Copyright & Fine Print */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs text-white/50 font-normal">
          <p>© {new Date().getFullYear()} Détaché Academia de Música. Todos los derechos reservados.</p>
          <p className="text-[11px] text-white/40 flex items-center justify-center gap-1.5">
            <span>Santiago de Chile</span>
            <span>•</span>
            <span className="text-white/60">Pasión por la música</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
