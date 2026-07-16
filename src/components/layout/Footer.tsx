import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@apollo/client/react/index.js";
import { GET_GLOBAL_SETTINGS } from "@/graphql/queries/get-global-settings";

export function Footer() {
  const { data } = useQuery<any>(GET_GLOBAL_SETTINGS);
  const settings = data?.globalSettings || {
    phoneNumber: "+56 9 6427 9239",
    emailContact: "academia@detache.cl",
    address: "Gran Avenida José Miguel Carrera 8520, Oficina C, La Cisterna",
    openingHoursWeekdays: "9:00 - 20:00",
    openingHoursSaturdays: "10:00 - 14:00",
    facebookUrl: "https://facebook.com",
    instagramUrl: "https://instagram.com/academia.detache"
  };

  return (
    <footer className="bg-[#70125F] text-white py-16 relative overflow-hidden">
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-sm">
          {/* Logo & Description */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <img 
                src="/icons/logo.svg" 
                alt="Détaché Academia" 
                className="h-20 w-auto brightness-0 invert" 
              />
            </Link>
            <p className="text-white/70 leading-relaxed max-w-xs text-xs">
              Acompañamos a personas de todas las edades en su camino musical, respetando el ritmo y los objetivos de cada estudiante.
            </p>
            <div className="flex gap-4">
              <a 
                href={settings.instagramUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a 
                href={settings.facebookUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>
          
          {/* Conócenos */}
          <div>
            <h4 className="font-bold mb-6 text-xs uppercase tracking-[0.2em] text-white/90">Conócenos</h4>
            <ul className="space-y-3 text-xs text-white/75">
              <li><Link href="/about" className="hover:text-white transition-all">Sobre Nosotros</Link></li>
              <li><Link href="/teachers" className="hover:text-white transition-all">Nuestros Equipos</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-all">Contáctanos</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-all">Términos de Servicio</Link></li>
              <li className="pt-2 border-t border-white/10"><Link href="/login" className="hover:text-white/80 transition-all italic text-white/50">Portal Staff</Link></li>
            </ul>
          </div>

          {/* Horarios */}
          <div>
            <h4 className="font-bold mb-6 text-xs uppercase tracking-[0.2em] text-white/90">Horarios</h4>
            <ul className="space-y-3 text-xs text-white/75">
              <li className="flex flex-col">
                <span className="font-bold text-white/90">Lunes a Viernes</span>
                <span>{settings.openingHoursWeekdays}</span>
              </li>
              <li className="flex flex-col pt-1">
                <span className="font-bold text-white/90">Sábados</span>
                <span>{settings.openingHoursSaturdays}</span>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="font-bold mb-6 text-xs uppercase tracking-[0.2em] text-white/90">Contacto</h4>
            <ul className="space-y-4 text-xs text-white/75">
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-white/70 shrink-0" />
                <a href={`mailto:${settings.emailContact}`} className="hover:text-white transition-colors">{settings.emailContact}</a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-white/70 shrink-0" />
                <a href={`tel:${settings.phoneNumber.replace(/\s+/g, '')}`} className="hover:text-white transition-colors">{settings.phoneNumber}</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-white/70 mt-0.5 shrink-0" />
                <span>
                  {settings.address}
                </span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-white/10 text-center text-xs text-white/50">
          © {new Date().getFullYear()}, Detaché. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
