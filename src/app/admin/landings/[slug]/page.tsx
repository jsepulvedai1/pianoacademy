"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react/index.js";
import { GET_ALL_LANDING_PAGES } from "@/graphql/queries/get-landings";
import { UPDATE_LANDING_PAGE } from "@/graphql/mutations/landing-mutations";
import { GetAllLandingPagesData, LandingPage } from "@/types/graphql";
import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Globe,
  Save,
  Plus,
  Trash2,
  Eye,
  ExternalLink,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { safeArray } from "@/lib/utils";

export default function EditLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const { data, loading } = useQuery<GetAllLandingPagesData>(GET_ALL_LANDING_PAGES);
  const landing = data?.allLandingPages?.find((p) => p.slug === slug);

  const [form, setForm] = useState<Partial<LandingPage>>({});
  const [benefits, setBenefits] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (landing) {
      setForm(landing);
      setBenefits(safeArray(landing.benefits));
    }
  }, [landing]);

  const [updateLanding, { loading: saving }] = useMutation(UPDATE_LANDING_PAGE, {
    refetchQueries: [{ query: GET_ALL_LANDING_PAGES }],
    onCompleted: () => {
      setSaved(true);
      toast.success("¡Página actualizada con éxito!");
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (err) => {
      toast.error("Error al guardar: " + err.message);
    },
  });

  const handleSave = () => {
    updateLanding({
      variables: {
        slug,
        title: form.title,
        subtitle: form.subtitle,
        problem: form.problem,
        solution: form.solution,
        benefits,
        imageUrl: form.imageUrl,
        cta: form.cta,
      },
    });
  };

  const addBenefit = () => {
    setBenefits((prev) => [...prev, ""]);
  };

  const updateBenefit = (index: number, value: string) => {
    setBenefits((prev) => prev.map((b, i) => (i === index ? value : b)));
  };

  const removeBenefit = (index: number) => {
    setBenefits((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
      </div>
    );
  }

  if (!landing) {
    return (
      <div className="p-12 text-center">
        <p className="text-slate-500 italic">Página no encontrada: /{slug}</p>
        <Link href="/admin/landings">
          <Button variant="outline" className="mt-4">
            Volver
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 space-y-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <header>
        <Link
          href="/admin/landings"
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-widest mb-6"
        >
          <ArrowLeft className="h-3 w-3" /> Todas las Páginas
        </Link>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
              <Globe className="h-3 w-3" /> Editando Página
            </div>
            <h1 className="text-3xl font-bold font-serif tracking-tight text-slate-900">
              {landing.title}
            </h1>
            <Badge
              variant="outline"
              className="mt-2 text-[9px] font-bold uppercase tracking-widest border-slate-200 text-slate-500"
            >
              /{slug}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                className="rounded-2xl h-12 px-6 font-bold gap-2"
              >
                <Eye className="h-4 w-4" /> Ver Página
                <ExternalLink className="h-3 w-3 opacity-50" />
              </Button>
            </a>
            <Button
              onClick={handleSave}
              disabled={saving || saved}
              className="rounded-2xl h-12 px-8 font-bold shadow-lg shadow-primary/20 gap-2"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : saved ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saved ? "¡Guardado!" : "Guardar Cambios"}
            </Button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Section */}
          <Card className="rounded-[2rem] border border-slate-100 shadow-sm">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary mb-2">
                <Globe className="h-3 w-3" /> Sección Principal (Hero)
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Título Principal
                </label>
                <input
                  type="text"
                  value={form.title || ""}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                  placeholder="Ej: Piano para Niños"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Subtítulo / Tagline
                </label>
                <textarea
                  value={form.subtitle || ""}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all resize-none leading-relaxed"
                  placeholder="Una frase que inspire y capture la esencia del servicio"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Texto del Botón (CTA)
                </label>
                <input
                  type="text"
                  value={form.cta || ""}
                  onChange={(e) => setForm({ ...form, cta: e.target.value })}
                  className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                  placeholder="Ej: Agendar Clase de Prueba"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  URL de Imagen Principal
                </label>
                <input
                  type="text"
                  value={form.imageUrl || ""}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all font-mono"
                  placeholder="/images/piano-kids.png o https://..."
                />
                {form.imageUrl && (
                  <div className="mt-3 relative rounded-2xl overflow-hidden border border-slate-100 aspect-video bg-slate-50">
                    <img
                      src={form.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Problem / Solution */}
          <Card className="rounded-[2rem] border border-slate-100 shadow-sm">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-rose-500 mb-2">
                El Desafío y Nuestra Propuesta
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  El Problema (Desafío)
                </label>
                <textarea
                  value={form.problem || ""}
                  onChange={(e) => setForm({ ...form, problem: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all resize-none leading-relaxed"
                  placeholder="Describe el dolor o desafío que enfrentan tus alumnos potenciales..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  La Solución (Propuesta de valor)
                </label>
                <textarea
                  value={form.solution || ""}
                  onChange={(e) => setForm({ ...form, solution: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all resize-none leading-relaxed"
                  placeholder="¿Cómo Détaché resuelve ese problema de manera única?..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Sidebar */}
        <div className="space-y-6">
          <Card className="rounded-[2rem] border border-slate-100 shadow-sm">
            <CardContent className="p-8 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-widest text-primary">
                  Beneficios
                </div>
                <Button
                  onClick={addBenefit}
                  variant="outline"
                  size="sm"
                  className="rounded-xl h-8 px-3 text-[10px] font-bold uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/5"
                >
                  <Plus className="h-3 w-3 mr-1" /> Añadir
                </Button>
              </div>
              <p className="text-[10px] text-slate-400 italic">
                Estos aparecen en la sección "¿Por qué elegirnos?" de la página.
              </p>

              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-[10px] font-black mt-1.5">
                      {index + 1}
                    </div>
                    <div className="flex-1 flex gap-1">
                      <input
                        type="text"
                        value={benefit}
                        onChange={(e) => updateBenefit(index, e.target.value)}
                        className="flex-1 h-9 bg-slate-50 border border-slate-100 rounded-xl px-3 text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                        placeholder={`Beneficio ${index + 1}`}
                      />
                      <button
                        onClick={() => removeBenefit(index)}
                        className="h-9 w-9 flex items-center justify-center rounded-xl text-slate-300 hover:text-rose-400 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {benefits.length === 0 && (
                  <div className="text-center py-8 text-slate-300">
                    <p className="text-xs italic">
                      No hay beneficios. Añade el primero.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Preview */}
          <Card className="rounded-[2rem] border border-slate-100 shadow-sm bg-slate-900 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none" />
            <CardContent className="p-8 relative z-10 space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Vista Rápida
              </p>
              <div>
                <h3 className="text-lg font-bold font-serif leading-tight">
                  {form.title || landing.title}
                </h3>
                <p className="text-xs text-slate-400 italic mt-2 leading-relaxed">
                  "{form.subtitle || landing.subtitle}"
                </p>
              </div>
              <div className="pt-4 border-t border-white/10">
                <div className="h-8 bg-primary rounded-xl flex items-center justify-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">
                    {form.cta || landing.cta}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="sticky bottom-4 flex justify-end">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 flex items-center gap-4">
          <p className="text-xs text-slate-500 font-medium pl-2">
            {saved ? "✅ Todos los cambios han sido guardados." : "⚡ Recuerda guardar al terminar."}
          </p>
          <Button
            onClick={handleSave}
            disabled={saving || saved}
            className="rounded-xl h-10 px-6 font-bold shadow-lg shadow-primary/20 gap-2"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : saved ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {saved ? "¡Guardado!" : "Guardar Cambios"}
          </Button>
        </div>
      </div>
    </div>
  );
}
