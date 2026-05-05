import { Instagram, Facebook, Youtube, Music2, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-muted py-16 border-t relative overflow-hidden">
      <div className="container mx-auto px-4 grid md:grid-cols-4 gap-12 relative z-10">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Music2 className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold font-serif tracking-tighter">Détaché</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Formando músicos con pasión y excelencia desde 2010. Tu camino hacia la maestría comienza aquí.
          </p>
          <div className="flex gap-4">
            <a href="#" className="p-2 bg-white rounded-lg border shadow-sm hover:text-primary transition-colors">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="p-2 bg-white rounded-lg border shadow-sm hover:text-primary transition-colors">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="p-2 bg-white rounded-lg border shadow-sm hover:text-primary transition-colors">
              <Youtube className="h-5 w-5" />
            </a>
          </div>
        </div>
        
        <div>
          <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-primary">Academia</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-primary transition-all hover:pl-1">Sobre Nosotros</a></li>
            <li><a href="#" className="hover:text-primary transition-all hover:pl-1">Profesores</a></li>
            <li><a href="#" className="hover:text-primary transition-all hover:pl-1">Clases</a></li>
            <li><a href="#" className="hover:text-primary transition-all hover:pl-1">Galería de Alumnos</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-primary">Legal</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li><a href="/terms" className="hover:text-primary transition-all hover:pl-1">Términos y Condiciones</a></li>
            <li><a href="#" className="hover:text-primary transition-all hover:pl-1">Política de Privacidad</a></li>
            <li><a href="#" className="hover:text-primary transition-all hover:pl-1">Reglamento Interno</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-primary">Contacto</h4>
          <ul className="space-y-4 text-sm text-muted-foreground">
            <li className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-primary" />
              <span>contacto@detache.cl</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-primary" />
              <span>+56 9 1234 5678</span>
            </li>
            <li className="flex items-center gap-3 font-semibold">
              <MapPin className="h-4 w-4 text-primary" />
              <span>Av. Música 123, Providencia</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-16 pt-8 border-t border-muted-foreground/10 text-center text-xs text-muted-foreground/60">
        © {new Date().getFullYear()} Détaché Academy. El arte de dominar la música.
      </div>
    </footer>
  );
}
