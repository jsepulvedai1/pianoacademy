"use client";

import { useState, useEffect, use } from "react";
import { useQuery, useMutation } from "@apollo/client/react/index.js";
import { GET_ALL_LANDING_PAGES, GET_LANDING_PAGE_BY_SLUG } from "@/graphql/queries/get-landings";
import { UPDATE_LANDING_PAGE } from "@/graphql/mutations/landing-mutations";
import { DEFAULT_INSTRUMENT_PAGES } from "@/app/(landings)/[servicio]/page";
import Link from "next/link";
import {
  ArrowLeft,
  Globe,
  Save,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  Sliders,
  Sparkles,
  Users,
  Building,
  HelpCircle,
  Check,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { safeArray } from "@/lib/utils";

interface GalleryItem {
  url: string;
  caption: string;
}

export default function EditLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const slugLower = (slug || "").toLowerCase();

  const { data, loading } = useQuery<any>(GET_ALL_LANDING_PAGES);
  const landing = data?.allLandingPages?.find((p: any) => p.slug === slug);

  const fallback =
    DEFAULT_INSTRUMENT_PAGES[slugLower] ||
    DEFAULT_INSTRUMENT_PAGES[
      Object.keys(DEFAULT_INSTRUMENT_PAGES).find((k) => slugLower.includes(k)) || "piano"
    ];

  const [form, setForm] = useState<{
    title: string;
    subtitle: string;
    problem: string;
    solution: string;
    imageUrl: string;
    cta: string;
    whyLearnTitle: string;
    whyLearnSubtitle: string;
  }>({
    title: "",
    subtitle: "",
    problem: "",
    solution: "",
    imageUrl: "",
    cta: "",
    whyLearnTitle: "",
    whyLearnSubtitle: "",
  });

  const [sectionsVisibility, setSectionsVisibility] = useState({
    showHero: true,
    showGallery: true,
    showTeachers: true,
    showMethodology: true,
    showWhyLearn: true,
    showCta: true,
  });

  const [benefits, setBenefits] = useState<string[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryItem[]>([]);
  const [saved, setSaved] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (landing) {
      setForm({
        title: landing.title || fallback.title,
        subtitle: landing.subtitle || fallback.subtitle,
        problem: landing.problem || fallback.problem,
        solution: landing.solution || fallback.solution,
        imageUrl: landing.imageUrl || fallback.heroImage,
        cta: landing.cta || "Inscribir Clase de Prueba (30 min)",
        whyLearnTitle: landing.whyLearnTitle || `¿Por qué aprender ${fallback.instrumentName} en Détaché?`,
        whyLearnSubtitle: landing.whyLearnSubtitle || fallback.minAgeLabel,
      });

      setSectionsVisibility({
        showHero: landing.showHero !== false,
        showGallery: landing.showGallery !== false,
        showTeachers: landing.showTeachers !== false,
        showMethodology: landing.showMethodology !== false,
        showWhyLearn: landing.showWhyLearn !== false,
        showCta: landing.showCta !== false,
      });

      const b = safeArray(landing.benefits);
      setBenefits(b.length > 0 ? b : fallback.benefits);
      const rawGallery = safeArray(landing.galleryImages);
      if (rawGallery.length > 0) {
        setGalleryImages(
          rawGallery.map((item: any) =>
            typeof item === "string"
              ? { url: item, caption: landing.title || fallback.title }
              : { url: item.url || "", caption: item.caption || "" }
          )
        );
      } else {
        setGalleryImages(fallback.galleryImages);
      }
    } else if (!loading && fallback) {
      setForm({
        title: fallback.title,
        subtitle: fallback.subtitle,
        problem: fallback.problem,
        solution: fallback.solution,
        imageUrl: fallback.heroImage,
        cta: "Inscribir Clase de Prueba (30 min)",
        whyLearnTitle: `¿Por qué aprender ${fallback.instrumentName} en Détaché?`,
        whyLearnSubtitle: fallback.minAgeLabel,
      });
      setSectionsVisibility({
        showHero: true,
        showGallery: true,
        showTeachers: true,
        showMethodology: true,
        showWhyLearn: true,
        showCta: true,
      });
      setBenefits(fallback.benefits);
      setGalleryImages(fallback.galleryImages);
    }
  }, [landing, loading, fallback]);

  const [updateLanding, { loading: saving }] = useMutation(UPDATE_LANDING_PAGE, {
    refetchQueries: [
      { query: GET_ALL_LANDING_PAGES },
      { query: GET_LANDING_PAGE_BY_SLUG, variables: { slug } },
    ],
    onCompleted: () => {
      setSaved(true);
      toast.success("¡Página y visibilidad de secciones guardadas con éxito!");
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
        galleryImages: JSON.stringify(galleryImages),
        cta: form.cta,
        whyLearnTitle: form.whyLearnTitle,
        whyLearnSubtitle: form.whyLearnSubtitle,
        showHero: sectionsVisibility.showHero,
        showGallery: sectionsVisibility.showGallery,
        showTeachers: sectionsVisibility.showTeachers,
        showMethodology: sectionsVisibility.showMethodology,
        showWhyLearn: sectionsVisibility.showWhyLearn,
        showCta: sectionsVisibility.showCta,
      },
    });
  };

  const uploadMediaFile = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    try {
      const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:8000/graphql/";
      const backendBase = graphqlUrl.replace(/\/graphql\/?$/, "");
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "instruments");
      const res = await fetch(`${backendBase}/api/media/upload/`, {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (json.status === "SUCCESS" && json.url) {
        toast.success("Imagen subida correctamente 📸");
        return json.url;
      }
      toast.error("Error al subir imagen");
      return null;
    } catch {
      toast.error("No se pudo subir la imagen");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const addBenefit = () => setBenefits((prev) => [...prev, ""]);
  const updateBenefit = (index: number, value: string) =>
    setBenefits((prev) => prev.map((b, i) => (i === index ? value : b)));
  const removeBenefit = (index: number) =>
    setBenefits((prev) => prev.filter((_, i) => i !== index));

  const addGallerySlide = () =>
    setGalleryImages((prev) => [...prev, { url: "/images/piano-hero.png", caption: "Foto de la Sala" }]);
  const updateGallerySlide = (index: number, field: "url" | "caption", value: string) =>
    setGalleryImages((prev) => prev.map((g, i) => (i === index ? { ...g, [field]: value } : g)));
  const removeGallerySlide = (index: number) =>
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
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
          <ArrowLeft className="h-3 w-3" /> Volver a Contenido Web
        </Link>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
              <Globe className="h-3 w-3" /> Editando Página de Instrumento
            </div>
            <h1 className="text-3xl font-bold font-serif tracking-tight text-slate-900">
              {form.title || fallback.title}
            </h1>
            <Badge
              variant="outline"
              className="mt-2 text-[9px] font-bold uppercase tracking-widest border-slate-200 text-slate-500"
            >
              /{slug}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <a href={`/${slug}`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="rounded-2xl h-12 px-6 font-bold gap-2 cursor-pointer">
                <Eye className="h-4 w-4" /> Ver Página Pública
                <ExternalLink className="h-3 w-3 opacity-50" />
              </Button>
            </a>
            <Button
              onClick={handleSave}
              disabled={saving || saved}
              className="rounded-2xl h-12 px-8 font-bold shadow-lg shadow-primary/20 gap-2 cursor-pointer"
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

      {/* ── PANEL DE VISIBILIDAD DE SECCIONES (ACTIVAR / DESACTIVAR) ── */}
      <Card className="rounded-[2.5rem] border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <CardContent className="p-8 space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#70125F]">
                <Sliders className="h-4 w-4" /> Visibilidad de Secciones en la Web
              </div>
              <p className="text-xs text-slate-500 italic mt-1">
                Haz clic en cada sección para activarla o desactivarla en la página pública de este instrumento.
              </p>
            </div>
            <Badge className="bg-[#70125F]/10 text-[#70125F] border-0 text-[10px] font-bold uppercase">
              {Object.values(sectionsVisibility).filter(Boolean).length} de 6 visibles
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {
                key: "showHero" as const,
                label: "1. Banner Principal (Hero)",
                desc: "Título, subtítulo, botón CTA y foto hero",
                icon: Sparkles,
              },
              {
                key: "showGallery" as const,
                label: "2. Carrusel e Instalaciones",
                desc: "Fotos de las salas y salas habilitadas",
                icon: Building,
              },
              {
                key: "showTeachers" as const,
                label: "3. Profesores del Instrumento",
                desc: "Cuerpo docente especialista con botón de reserva",
                icon: Users,
              },
              {
                key: "showMethodology" as const,
                label: "4. Desafío y Metodología",
                desc: "El desafío frecuente vs Nuestra propuesta",
                icon: HelpCircle,
              },
              {
                key: "showWhyLearn" as const,
                label: "5. ¿Por qué aprender?",
                desc: "Título, bajada y tarjetas de beneficios",
                icon: Check,
              },
              {
                key: "showCta" as const,
                label: "6. Llamado a la Acción (CTA)",
                desc: "Sección final para agendar Clase de Prueba",
                icon: Send,
              },
            ].map((sec) => {
              const active = sectionsVisibility[sec.key];
              const Icon = sec.icon;
              return (
                <button
                  key={sec.key}
                  type="button"
                  onClick={() =>
                    setSectionsVisibility((prev) => ({
                      ...prev,
                      [sec.key]: !prev[sec.key],
                    }))
                  }
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    active
                      ? "border-emerald-600 bg-emerald-50/50 shadow-sm"
                      : "border-slate-200 bg-slate-50/60 opacity-60 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-1.5 rounded-lg ${
                          active
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 leading-tight">
                        {sec.label}
                      </span>
                    </div>
                    {active ? (
                      <Badge className="bg-emerald-600 text-white border-0 text-[9px] px-2 py-0.5">
                        <Eye className="h-2.5 w-2.5 mr-1" /> Activa
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-slate-400 border-slate-300 text-[9px] px-2 py-0.5">
                        <EyeOff className="h-2.5 w-2.5 mr-1" /> Oculta
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {sec.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Hero Section */}
          <Card className="rounded-[2rem] border border-slate-100 shadow-sm">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                  <Globe className="h-3 w-3" /> Sección Principal (Hero)
                </div>
                {!sectionsVisibility.showHero && (
                  <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200 text-[10px]">
                    ⚠️ Oculta en la web
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Título Principal
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                  placeholder="Ej: Clases de Piano en Academia Détaché"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Subtítulo / Bajada
                </label>
                <textarea
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Texto del Botón Principal (CTA)
                </label>
                <input
                  type="text"
                  value={form.cta}
                  onChange={(e) => setForm({ ...form, cta: e.target.value })}
                  className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                  placeholder="Ej: Inscribir Clase de Prueba (30 min)"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Imagen Principal del Instrumento
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#70125F] bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl cursor-pointer transition-colors">
                    <Upload className="h-3 w-3" />
                    {isUploading ? "Subiendo..." : "Subir Foto desde PC"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const uploadedUrl = await uploadMediaFile(file);
                        if (uploadedUrl) setForm({ ...form, imageUrl: uploadedUrl });
                      }}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-xs font-mono outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                  placeholder="/images/piano-hero.png o https://..."
                />
                {form.imageUrl && (
                  <div className="mt-3 relative rounded-2xl overflow-hidden border border-slate-100 aspect-video bg-slate-50">
                    <img
                      src={form.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 2. Carrusel de Fotos de las Salas e Instrumento */}
          <Card className="rounded-[2rem] border border-slate-100 shadow-sm">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#70125F]">
                    <ImageIcon className="h-3.5 w-3.5" /> Carrusel de Imágenes y Fotos de la Sala
                  </div>
                  <p className="text-xs text-slate-400 italic mt-1">
                    Sube fotos de la sala, los instrumentos y el ambiente de clases para este instrumento.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!sectionsVisibility.showGallery && (
                    <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200 text-[10px]">
                      ⚠️ Oculta
                    </Badge>
                  )}
                  <Button
                    type="button"
                    onClick={addGallerySlide}
                    variant="outline"
                    size="sm"
                    className="rounded-xl h-9 px-3 text-[10px] font-bold uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/5 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Añadir Foto al Carrusel
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {galleryImages.map((slide, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row gap-4 items-start"
                  >
                    <div className="w-full sm:w-32 h-24 rounded-xl overflow-hidden bg-slate-200 shrink-0 relative">
                      <img
                        src={slide.url}
                        alt={slide.caption}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-2 w-full">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          Foto #{idx + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] font-bold text-[#70125F] bg-white border border-purple-200 hover:bg-purple-50 px-2.5 py-1 rounded-lg cursor-pointer flex items-center gap-1">
                            <Upload className="h-3 w-3" /> Subir Foto
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const uploadedUrl = await uploadMediaFile(file);
                                if (uploadedUrl) updateGallerySlide(idx, "url", uploadedUrl);
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => removeGallerySlide(idx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={slide.caption}
                        onChange={(e) => updateGallerySlide(idx, "caption", e.target.value)}
                        placeholder="Descripción / Pie de foto (Ej: Sala Principal de Piano Acústico)"
                        className="w-full h-9 bg-white border border-slate-200 rounded-xl px-3 text-xs font-bold text-slate-800 outline-none"
                      />
                      <input
                        type="text"
                        value={slide.url}
                        onChange={(e) => updateGallerySlide(idx, "url", e.target.value)}
                        placeholder="URL de la foto"
                        className="w-full h-8 bg-white border border-slate-200 rounded-xl px-3 text-[11px] font-mono text-slate-500 outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 3. Problem / Solution */}
          <Card className="rounded-[2rem] border border-slate-100 shadow-sm">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-rose-500">
                  <HelpCircle className="h-3.5 w-3.5" /> El Desafío y Nuestra Metodología
                </div>
                {!sectionsVisibility.showMethodology && (
                  <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200 text-[10px]">
                    ⚠️ Oculta en la web
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  El Desafío Frecuente
                </label>
                <textarea
                  value={form.problem}
                  onChange={(e) => setForm({ ...form, problem: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Nuestra Propuesta en Détaché
                </label>
                <textarea
                  value={form.solution}
                  onChange={(e) => setForm({ ...form, solution: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all resize-none leading-relaxed"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: ¿Por qué aprender instrumento? + Beneficios */}
        <div className="space-y-6">
          {/* 4. SECCIÓN ¿POR QUÉ APRENDER INSTRUMENTO? */}
          <Card className="rounded-[2rem] border-2 border-[#70125F]/20 shadow-sm bg-white overflow-hidden">
            <div className="p-6 bg-[#70125F] text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#DFB012]">
                  <Check className="h-4 w-4" /> ¿Por qué aprender {fallback.instrumentName}?
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSectionsVisibility((prev) => ({
                      ...prev,
                      showWhyLearn: !prev.showWhyLearn,
                    }))
                  }
                  className={`text-[9px] font-bold uppercase px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                    sectionsVisibility.showWhyLearn
                      ? "bg-emerald-500 text-white"
                      : "bg-white/20 text-white/70"
                  }`}
                >
                  {sectionsVisibility.showWhyLearn ? "Activa" : "Oculta"}
                </button>
              </div>
              <p className="text-xs text-white/80 mt-1 italic">
                Personaliza el título, subtítulo y los beneficios de esta sección.
              </p>
            </div>

            <CardContent className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Título de la Sección
                </label>
                <input
                  type="text"
                  value={form.whyLearnTitle}
                  onChange={(e) => setForm({ ...form, whyLearnTitle: e.target.value })}
                  placeholder={`Ej: ¿Por qué aprender ${fallback.instrumentName} en Détaché?`}
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3.5 text-xs font-bold text-slate-900 outline-none focus:border-[#70125F]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Subtítulo / Bajada Explicativa
                </label>
                <input
                  type="text"
                  value={form.whyLearnSubtitle}
                  onChange={(e) => setForm({ ...form, whyLearnSubtitle: e.target.value })}
                  placeholder="Ej: Desde los 4 años con metodología adaptada"
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3.5 text-xs text-slate-700 outline-none focus:border-[#70125F]"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Tarjetas de Beneficios ({benefits.length})
                  </span>
                  <Button
                    type="button"
                    onClick={addBenefit}
                    variant="outline"
                    size="sm"
                    className="rounded-xl h-8 px-2.5 text-[9px] font-bold uppercase tracking-widest border-[#70125F]/30 text-[#70125F] hover:bg-[#70125F]/5 cursor-pointer"
                  >
                    <Plus className="h-3 w-3 mr-1" /> Añadir
                  </Button>
                </div>

                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="h-6 w-6 rounded-lg bg-[#70125F]/10 text-[#70125F] flex items-center justify-center shrink-0 text-[10px] font-black mt-1">
                        {index + 1}
                      </div>
                      <div className="flex-1 flex gap-1">
                        <textarea
                          rows={2}
                          value={benefit}
                          onChange={(e) => updateBenefit(index, e.target.value)}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-medium outline-none focus:border-[#70125F] resize-none"
                          placeholder={`Beneficio ${index + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => removeBenefit(index)}
                          className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer self-center"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Informativa */}
          <Card className="rounded-[2rem] border border-slate-100 shadow-sm bg-slate-900 text-white overflow-hidden relative">
            <CardContent className="p-7 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#DFB012]">
                Sincronización Automática
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                Las secciones de <strong>Profesores</strong> y <strong>Salas</strong> se cargan automáticamente desde sus respectivos módulos en el menú lateral. Si desactivas una sección con los interruptores de arriba, desaparecerá instantáneamente de la web para los visitantes.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Save Bar */}
      <div className="sticky bottom-6 flex justify-end z-30">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-3 flex items-center gap-4">
          <p className="text-xs text-slate-600 font-medium pl-2 hidden sm:block">
            {saved ? "✅ Cambios guardados en vivo." : "⚡ Presiona guardar para publicar."}
          </p>
          <Button
            onClick={handleSave}
            disabled={saving || saved}
            className="rounded-xl h-11 px-8 font-bold bg-[#70125F] hover:bg-[#590e4b] text-white shadow-lg shadow-[#70125F]/20 gap-2 cursor-pointer"
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
    </div>
  );
}
