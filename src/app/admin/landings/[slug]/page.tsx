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
  ExternalLink,
  Loader2,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
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
  }>({
    title: "",
    subtitle: "",
    problem: "",
    solution: "",
    imageUrl: "",
    cta: "",
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
      toast.success("¡Página de instrumento actualizada con éxito!");
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

          {/* Carrusel de Fotos de las Salas e Instrumento */}
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

          {/* Problem / Solution */}
          <Card className="rounded-[2rem] border border-slate-100 shadow-sm">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-rose-500 mb-2">
                El Desafío y Nuestra Metodología
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

        {/* Benefits Sidebar */}
        <div className="space-y-6">
          <Card className="rounded-[2rem] border border-slate-100 shadow-sm">
            <CardContent className="p-8 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-widest text-primary">
                  Beneficios del Programa
                </div>
                <Button
                  type="button"
                  onClick={addBenefit}
                  variant="outline"
                  size="sm"
                  className="rounded-xl h-8 px-3 text-[10px] font-bold uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/5 cursor-pointer"
                >
                  <Plus className="h-3 w-3 mr-1" /> Añadir
                </Button>
              </div>
              <p className="text-[10px] text-slate-400 italic">
                Estos puntos aparecen en la sección de beneficios de la página del instrumento.
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
                        type="button"
                        onClick={() => removeBenefit(index)}
                        className="h-9 w-9 flex items-center justify-center rounded-xl text-slate-300 hover:text-rose-400 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border border-slate-100 shadow-sm bg-slate-900 text-white overflow-hidden relative">
            <CardContent className="p-7 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#DFB012]">
                Sincronización Automática
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                Además de estos textos y fotos, la página pública de <strong>/{slug}</strong> muestra automáticamente las <strong>Salas activas</strong> (desde <em>Admin → Salas</em>) y los <strong>Profesores de este instrumento</strong> (desde <em>Admin → Profesores</em>).
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
