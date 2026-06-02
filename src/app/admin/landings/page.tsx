"use client";

import { useQuery } from "@apollo/client/react/index.js";
import { GET_ALL_LANDING_PAGES } from "@/graphql/queries/get-landings";
import { GetAllLandingPagesData, LandingPage } from "@/types/graphql";
import Link from "next/link";
import {
  Globe,
  ArrowRight,
  LayoutDashboard,
  Music2,
  Users,
  Mic2,
  Guitar,
  Music,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const SLUG_META: Record<
  string,
  { color: string; icon: React.ReactNode; label: string }
> = {
  "piano-ninos": {
    color: "bg-violet-50 border-violet-100",
    icon: <Music2 className="h-8 w-8 text-violet-400" />,
    label: "Piano Niños",
  },
  "piano-adultos": {
    color: "bg-indigo-50 border-indigo-100",
    icon: <Music className="h-8 w-8 text-indigo-400" />,
    label: "Piano Adultos",
  },
  canto: {
    color: "bg-rose-50 border-rose-100",
    icon: <Mic2 className="h-8 w-8 text-rose-400" />,
    label: "Canto",
  },
  "clases-grupales": {
    color: "bg-amber-50 border-amber-100",
    icon: <Users className="h-8 w-8 text-amber-400" />,
    label: "Clases Grupales",
  },
  "clase-prueba": {
    color: "bg-emerald-50 border-emerald-100",
    icon: <Guitar className="h-8 w-8 text-emerald-400" />,
    label: "Clase de Prueba",
  },
};

export default function AdminLandingsPage() {
  const { data, loading } = useQuery<GetAllLandingPagesData>(GET_ALL_LANDING_PAGES);
  const pages = data?.allLandingPages || [];

  return (
    <div className="p-8 lg:p-12 space-y-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <header className="space-y-1">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
          <Globe className="h-3 w-3" /> Contenido Web
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold font-serif tracking-tight text-slate-900">
              Páginas Web
            </h1>
            <p className="text-slate-500 italic mt-1">
              Edita todo el contenido visible en tu sitio web.
            </p>
          </div>
        </div>
      </header>

      {/* Homepage Hero Card */}
      <Link href="/admin/landings/homepage">
        <div className="group relative rounded-[2.5rem] overflow-hidden bg-slate-900 text-white p-10 cursor-pointer hover:scale-[1.01] transition-all duration-300 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
                <Globe className="h-3 w-3" /> Página Principal
              </div>
              <h2 className="text-2xl font-bold font-serif">Editar Homepage — detache.cl/</h2>
              <p className="text-slate-400 text-sm italic">
                Hero, características, metodología, testimonios, ubicación y CTA final.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-primary/20 group-hover:bg-primary px-6 py-3 rounded-2xl transition-colors font-bold text-sm">
              Editar <ArrowRight className="h-4 w-4 ml-1" />
            </div>
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-4">
        <div className="flex-1 h-[1px] bg-slate-100" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Páginas de Servicios</p>
        <div className="flex-1 h-[1px] bg-slate-100" />
      </div>

      {/* Landing Pages Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-48 bg-slate-100 rounded-[2rem] animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page: LandingPage) => {
            const meta = SLUG_META[page.slug] || {
              color: "bg-slate-50 border-slate-100",
              icon: <LayoutDashboard className="h-8 w-8 text-slate-400" />,
              label: page.slug,
            };
            return (
              <Link href={`/admin/landings/${page.slug}`} key={page.slug}>
                <Card
                  className={`rounded-[2rem] border shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer overflow-hidden ${meta.color}`}
                >
                  <CardContent className="p-8 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="p-3 bg-white rounded-2xl shadow-sm border border-white/80">
                        {meta.icon}
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[9px] font-bold uppercase tracking-widest border-slate-200 text-slate-500"
                      >
                        /{page.slug}
                      </Badge>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold font-serif text-slate-900 leading-tight">
                        {page.title}
                      </h2>
                      <p className="text-xs text-slate-500 italic mt-1 line-clamp-2">
                        {page.subtitle}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {page.benefits.length} beneficios
                      </span>
                      <div className="flex items-center gap-1 text-primary text-xs font-bold">
                        Editar <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Info Footer */}
      <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 flex items-start gap-4">
        <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 shrink-0">
          <Globe className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 mb-1">
            ¿Cómo funcionan las Páginas Web?
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Los cambios que realices aquí se reflejan{" "}
            <strong>inmediatamente</strong> en las páginas públicas de tu sitio
            web. Puedes editar el título, descripción, el listado de
            beneficios y el texto del botón principal de cada sección.
          </p>
        </div>
      </div>
    </div>
  );
}
