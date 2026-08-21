"use client";

import Link from "next/link";
import {
  Globe,
  ArrowRight,
  Home,
  Users,
  Phone,
  Sparkles,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminLandingsPage() {
  return (
    <div className="p-8 lg:p-12 space-y-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <header className="space-y-1">
        <div className="flex items-center gap-2 text-[#70125F] font-bold text-xs uppercase tracking-[0.2em] mb-1">
          <Globe className="h-3 w-3" /> Contenido Web
        </div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold font-serif tracking-tight text-slate-900">
              Páginas Web y Contenido
            </h1>
            <p className="text-slate-500 italic mt-1 text-sm">
              Administra todos los textos, imágenes y secciones visibles en tu sitio web público.
            </p>
          </div>
          <a 
            href="/" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button 
              variant="outline"
              className="rounded-2xl h-11 px-6 font-bold gap-2 text-xs uppercase tracking-wider text-slate-700 hover:text-slate-900 border-slate-200 hover:bg-slate-50 cursor-pointer"
            >
              <ExternalLink className="h-4 w-4" /> Ver Sitio en Vivo
            </Button>
          </a>
        </div>
      </header>

      {/* Hero Card: Editor Web Unificado */}
      <Link href="/admin/landings/editor">
        <div className="group relative rounded-[2.5rem] overflow-hidden bg-slate-900 text-white p-10 cursor-pointer hover:scale-[1.01] transition-all duration-300 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-[#70125F]/40 via-[#70125F]/15 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 text-[#DCA060] font-bold text-xs uppercase tracking-[0.2em]">
                <Sparkles className="h-4 w-4" /> Editor Web Centralizado
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif">
                Editor del Sitio Web — detache.cl
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Personaliza en tiempo real los textos del banner principal, la metodología, el equipo de profesores, testimonios, galería fotográfica, ubicación en Google Maps y canales de contacto.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-[#70125F] group-hover:bg-[#8e1779] text-white px-8 py-4 rounded-2xl transition-all font-bold text-sm shadow-xl shadow-[#70125F]/30 shrink-0">
              Abrir Editor <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>

      {/* Quick Sections Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Inicio */}
        <Link href="/admin/landings/editor">
          <Card className="rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer bg-white group h-full flex flex-col">
            <CardContent className="p-8 space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl w-fit mb-4">
                  <Home className="h-6 w-6" />
                </div>
                <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest border-slate-200 text-slate-400 mb-2">
                  Portada Principal
                </Badge>
                <h3 className="text-xl font-bold font-serif text-slate-900 group-hover:text-[#70125F] transition-colors">
                  Inicio (Home)
                </h3>
                <p className="text-xs text-slate-500 italic mt-2 leading-relaxed">
                  Hero banner, metodología Détaché, testimonios de alumnos, galería y llamados a la acción.
                </p>
              </div>
              <div className="flex items-center gap-1 text-[#70125F] text-xs font-bold pt-4 border-t border-slate-50">
                Editar Inicio <ArrowRight className="h-3 w-3" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Nosotros */}
        <Link href="/admin/landings/editor">
          <Card className="rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer bg-white group h-full flex flex-col">
            <CardContent className="p-8 space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl w-fit mb-4">
                  <Users className="h-6 w-6" />
                </div>
                <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest border-slate-200 text-slate-400 mb-2">
                  /about
                </Badge>
                <h3 className="text-xl font-bold font-serif text-slate-900 group-hover:text-[#70125F] transition-colors">
                  Sobre Nosotros
                </h3>
                <p className="text-xs text-slate-500 italic mt-2 leading-relaxed">
                  Historia de la academia, filosofía pedagógica, misión, visión y equipo fundador.
                </p>
              </div>
              <div className="flex items-center gap-1 text-[#70125F] text-xs font-bold pt-4 border-t border-slate-50">
                Editar Nosotros <ArrowRight className="h-3 w-3" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Contacto */}
        <Link href="/admin/landings/editor">
          <Card className="rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer bg-white group h-full flex flex-col">
            <CardContent className="p-8 space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-fit mb-4">
                  <Phone className="h-6 w-6" />
                </div>
                <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest border-slate-200 text-slate-400 mb-2">
                  /contact
                </Badge>
                <h3 className="text-xl font-bold font-serif text-slate-900 group-hover:text-[#70125F] transition-colors">
                  Contacto y Sede
                </h3>
                <p className="text-xs text-slate-500 italic mt-2 leading-relaxed">
                  Dirección física, mapa interactivo, números de WhatsApp, correos y horarios de atención.
                </p>
              </div>
              <div className="flex items-center gap-1 text-[#70125F] text-xs font-bold pt-4 border-t border-slate-50">
                Editar Contacto <ArrowRight className="h-3 w-3" />
              </div>
            </CardContent>
          </Card>
        </Link>

      </div>

      {/* Info Footer */}
      <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 flex items-start gap-4">
        <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 shrink-0">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 mb-1">
            Sincronización en Tiempo Real
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Todos los cambios guardados en el <strong>Editor Web Centralizado</strong> se aplican de forma inmediata en el sitio web de Détaché sin necesidad de recargar o reiniciar servidores.
          </p>
        </div>
      </div>
    </div>
  );
}
