"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react/index.js";
import { gql } from "@apollo/client/core/index.js";
import Link from "next/link";
import {
  ArrowLeft, Globe, Save, Loader2, CheckCircle2, Plus, Trash2,
  Image as ImageIcon, Type, Quote, MapPin, Zap, Award, Eye, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const GET_HOMEPAGE = gql`
  query { homepageContent {
    id heroImage heroTitle1 heroTitleHighlight heroTitle2 heroSubtitle
    heroCta1Text heroCta1Link heroCta2Text heroCta2Link
    features methodBadge methodTitle methodDescription methodItems methodImage
    testimonials
    locationTitle locationDescription locationAddress locationAddressDetail locationMapUrl
    finalCtaTitle finalCtaDescription finalCtaButtonText
  }}
`;

const UPDATE_HOMEPAGE = gql`
  mutation UpdateHomepageContent(
    $heroImage: String $heroTitle1: String $heroTitleHighlight: String $heroTitle2: String
    $heroSubtitle: String $heroCta1Text: String $heroCta1Link: String
    $heroCta2Text: String $heroCta2Link: String
    $features: String $methodBadge: String $methodTitle: String
    $methodDescription: String $methodItems: String $methodImage: String
    $testimonials: String $locationTitle: String $locationDescription: String
    $locationAddress: String $locationAddressDetail: String $locationMapUrl: String
    $finalCtaTitle: String $finalCtaDescription: String $finalCtaButtonText: String
  ) {
    updateHomepageContent(
      heroImage: $heroImage heroTitle1: $heroTitle1 heroTitleHighlight: $heroTitleHighlight
      heroTitle2: $heroTitle2 heroSubtitle: $heroSubtitle
      heroCta1Text: $heroCta1Text heroCta1Link: $heroCta1Link
      heroCta2Text: $heroCta2Text heroCta2Link: $heroCta2Link
      features: $features methodBadge: $methodBadge methodTitle: $methodTitle
      methodDescription: $methodDescription methodItems: $methodItems methodImage: $methodImage
      testimonials: $testimonials locationTitle: $locationTitle
      locationDescription: $locationDescription locationAddress: $locationAddress
      locationAddressDetail: $locationAddressDetail locationMapUrl: $locationMapUrl
      finalCtaTitle: $finalCtaTitle finalCtaDescription: $finalCtaDescription
      finalCtaButtonText: $finalCtaButtonText
    ) { success }
  }
`;

// ─── Field Types ───
interface Feature { icon: string; title: string; description: string; }
interface MethodItem { title: string; desc: string; }
interface Testimonial { quote: string; author: string; }

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="rounded-[2rem] border border-slate-100 shadow-sm">
      <CardContent className="p-8 space-y-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary border-b border-slate-100 pb-4">
          {icon} {title}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all";
const textareaCls = "w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all resize-none leading-relaxed";

export default function HomepageEditorPage() {
  const { data, loading } = useQuery<any>(GET_HOMEPAGE);
  const hp = data?.homepageContent;

  const [hero, setHero] = useState<any>({});
  const [features, setFeatures] = useState<Feature[]>([]);
  const [method, setMethod] = useState<any>({});
  const [methodItems, setMethodItems] = useState<MethodItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [location, setLocation] = useState<any>({});
  const [finalCta, setFinalCta] = useState<any>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!hp) return;
    const parse = (v: any) => {
      if (Array.isArray(v)) return v;
      if (typeof v === 'string') { try { return JSON.parse(v); } catch { return []; } }
      return [];
    };
    setHero({ image: hp.heroImage, title1: hp.heroTitle1, highlight: hp.heroTitleHighlight, title2: hp.heroTitle2, subtitle: hp.heroSubtitle, cta1Text: hp.heroCta1Text, cta1Link: hp.heroCta1Link, cta2Text: hp.heroCta2Text, cta2Link: hp.heroCta2Link });
    setFeatures(parse(hp.features));
    setMethod({ badge: hp.methodBadge, title: hp.methodTitle, description: hp.methodDescription, image: hp.methodImage });
    setMethodItems(parse(hp.methodItems));
    setTestimonials(parse(hp.testimonials));
    setLocation({ title: hp.locationTitle, description: hp.locationDescription, address: hp.locationAddress, addressDetail: hp.locationAddressDetail, mapUrl: hp.locationMapUrl });
    setFinalCta({ title: hp.finalCtaTitle, description: hp.finalCtaDescription, buttonText: hp.finalCtaButtonText });
  }, [hp]);

  const [updateHomepage, { loading: saving }] = useMutation(UPDATE_HOMEPAGE, {
    refetchQueries: [{ query: GET_HOMEPAGE }],
    onCompleted: () => { setSaved(true); toast.success("¡Homepage actualizada!"); setTimeout(() => setSaved(false), 3000); },
    onError: (e) => toast.error("Error: " + e.message),
  });

  const handleSave = () => {
    updateHomepage({
      variables: {
        heroImage: hero.image, heroTitle1: hero.title1, heroTitleHighlight: hero.highlight,
        heroTitle2: hero.title2, heroSubtitle: hero.subtitle,
        heroCta1Text: hero.cta1Text, heroCta1Link: hero.cta1Link,
        heroCta2Text: hero.cta2Text, heroCta2Link: hero.cta2Link,
        features: JSON.stringify(features),
        methodBadge: method.badge, methodTitle: method.title,
        methodDescription: method.description, methodImage: method.image,
        methodItems: JSON.stringify(methodItems),
        testimonials: JSON.stringify(testimonials),
        locationTitle: location.title, locationDescription: location.description,
        locationAddress: location.address, locationAddressDetail: location.addressDetail,
        locationMapUrl: location.mapUrl,
        finalCtaTitle: finalCta.title, finalCtaDescription: finalCta.description,
        finalCtaButtonText: finalCta.buttonText,
      },
    });
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary/30" />
    </div>
  );

  return (
    <div className="p-8 lg:p-12 space-y-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <header>
        <Link href="/admin/landings" className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-widest mb-6">
          <ArrowLeft className="h-3 w-3" /> Páginas Web
        </Link>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
              <Globe className="h-3 w-3" /> Editar Página Principal
            </div>
            <h1 className="text-3xl font-bold font-serif tracking-tight text-slate-900">Homepage — detache.cl</h1>
            <p className="text-slate-500 italic mt-1 text-sm">Los cambios se aplican en tiempo real en el sitio web.</p>
          </div>
          <div className="flex gap-3">
            <a href="/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="rounded-2xl h-12 px-6 font-bold gap-2">
                <Eye className="h-4 w-4" /> Ver Sitio <ExternalLink className="h-3 w-3 opacity-50" />
              </Button>
            </a>
            <Button onClick={handleSave} disabled={saving || saved} className="rounded-2xl h-12 px-8 font-bold shadow-lg shadow-primary/20 gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <Save className="h-4 w-4" />}
              {saved ? "¡Guardado!" : "Guardar Todo"}
            </Button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <SectionCard title="Sección Hero (Portada)" icon={<ImageIcon className="h-3 w-3" />}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Título línea 1">
            <input className={inputCls} value={hero.title1 || ""} onChange={e => setHero({ ...hero, title1: e.target.value })} placeholder="Detaché:" />
          </Field>
          <Field label="Texto resaltado (cursiva)">
            <input className={inputCls} value={hero.highlight || ""} onChange={e => setHero({ ...hero, highlight: e.target.value })} placeholder="El Arte" />
          </Field>
          <Field label="Título línea 2">
            <input className={inputCls} value={hero.title2 || ""} onChange={e => setHero({ ...hero, title2: e.target.value })} placeholder="de Dominar la música" />
          </Field>
        </div>
        <Field label="Subtítulo / Descripción">
          <textarea className={textareaCls} rows={2} value={hero.subtitle || ""} onChange={e => setHero({ ...hero, subtitle: e.target.value })} />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Botón 1 — Texto">
            <input className={inputCls} value={hero.cta1Text || ""} onChange={e => setHero({ ...hero, cta1Text: e.target.value })} />
          </Field>
          <Field label="Botón 1 — Link">
            <input className={`${inputCls} font-mono`} value={hero.cta1Link || ""} onChange={e => setHero({ ...hero, cta1Link: e.target.value })} />
          </Field>
          <Field label="Botón 2 — Texto">
            <input className={inputCls} value={hero.cta2Text || ""} onChange={e => setHero({ ...hero, cta2Text: e.target.value })} />
          </Field>
          <Field label="Botón 2 — Link">
            <input className={`${inputCls} font-mono`} value={hero.cta2Link || ""} onChange={e => setHero({ ...hero, cta2Link: e.target.value })} />
          </Field>
        </div>
        <Field label="URL Imagen de Fondo">
          <input className={`${inputCls} font-mono`} value={hero.image || ""} onChange={e => setHero({ ...hero, image: e.target.value })} placeholder="/images/piano-hero.png" />
        </Field>
        {hero.image && (
          <div className="rounded-2xl overflow-hidden border border-slate-100 h-40 bg-slate-50">
            <img src={hero.image} className="w-full h-full object-cover" alt="preview" onError={e => (e.target as HTMLImageElement).style.display = 'none'} />
          </div>
        )}
      </SectionCard>

      {/* ── FEATURES ── */}
      <SectionCard title="Sección Características (3 tarjetas)" icon={<Zap className="h-3 w-3" />}>
        <div className="space-y-4">
          {features.map((f, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
              <Field label={`Tarjeta ${i + 1} — Título`}>
                <input className={inputCls} value={f.title} onChange={e => { const n = [...features]; n[i] = { ...n[i], title: e.target.value }; setFeatures(n); }} />
              </Field>
              <div className="md:col-span-2">
                <Field label="Descripción">
                  <input className={inputCls} value={f.description} onChange={e => { const n = [...features]; n[i] = { ...n[i], description: e.target.value }; setFeatures(n); }} />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── METHODOLOGY ── */}
      <SectionCard title="Sección Metodología" icon={<Award className="h-3 w-3" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Texto de insignia">
            <input className={inputCls} value={method.badge || ""} onChange={e => setMethod({ ...method, badge: e.target.value })} />
          </Field>
          <Field label="URL Imagen de Metodología">
            <input className={`${inputCls} font-mono`} value={method.image || ""} onChange={e => setMethod({ ...method, image: e.target.value })} />
          </Field>
        </div>
        <Field label="Título principal">
          <textarea className={textareaCls} rows={2} value={method.title || ""} onChange={e => setMethod({ ...method, title: e.target.value })} />
        </Field>
        <Field label="Párrafo descriptivo">
          <textarea className={textareaCls} rows={2} value={method.description || ""} onChange={e => setMethod({ ...method, description: e.target.value })} />
        </Field>
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Lista de ítems (checkmarks)</p>
          {methodItems.map((item, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
              <Field label={`Ítem ${i + 1} — Título`}>
                <input className={inputCls} value={item.title} onChange={e => { const n = [...methodItems]; n[i] = { ...n[i], title: e.target.value }; setMethodItems(n); }} />
              </Field>
              <Field label="Descripción">
                <input className={inputCls} value={item.desc} onChange={e => { const n = [...methodItems]; n[i] = { ...n[i], desc: e.target.value }; setMethodItems(n); }} />
              </Field>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── TESTIMONIALS ── */}
      <SectionCard title="Testimonios de Alumnos" icon={<Quote className="h-3 w-3" />}>
        <div className="space-y-3">
          {testimonials.map((t, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
              <div className="md:col-span-3">
                <Field label={`Testimonio ${i + 1} — Cita`}>
                  <input className={inputCls} value={t.quote} onChange={e => { const n = [...testimonials]; n[i] = { ...n[i], quote: e.target.value }; setTestimonials(n); }} />
                </Field>
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Field label="Autor">
                    <input className={inputCls} value={t.author} onChange={e => { const n = [...testimonials]; n[i] = { ...n[i], author: e.target.value }; setTestimonials(n); }} />
                  </Field>
                </div>
                <button onClick={() => setTestimonials(p => p.filter((_, idx) => idx !== i))} className="h-12 w-10 mb-0.5 flex items-center justify-center rounded-xl text-slate-300 hover:text-rose-400 hover:bg-rose-50 transition-colors shrink-0">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
          <Button onClick={() => setTestimonials(p => [...p, { quote: "", author: "" }])} variant="outline" size="sm" className="rounded-xl h-8 px-3 text-[10px] font-bold uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/5">
            <Plus className="h-3 w-3 mr-1" /> Añadir Testimonio
          </Button>
        </div>
      </SectionCard>

      {/* ── LOCATION ── */}
      <SectionCard title="Sección Ubicación" icon={<MapPin className="h-3 w-3" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Título">
            <input className={inputCls} value={location.title || ""} onChange={e => setLocation({ ...location, title: e.target.value })} />
          </Field>
          <Field label="Dirección">
            <input className={inputCls} value={location.address || ""} onChange={e => setLocation({ ...location, address: e.target.value })} />
          </Field>
          <Field label="Detalle adicional (metro, etc)">
            <input className={inputCls} value={location.addressDetail || ""} onChange={e => setLocation({ ...location, addressDetail: e.target.value })} />
          </Field>
          <Field label="URL de Google Maps">
            <input className={`${inputCls} font-mono`} value={location.mapUrl || ""} onChange={e => setLocation({ ...location, mapUrl: e.target.value })} />
          </Field>
        </div>
        <Field label="Descripción">
          <textarea className={textareaCls} rows={2} value={location.description || ""} onChange={e => setLocation({ ...location, description: e.target.value })} />
        </Field>
      </SectionCard>

      {/* ── FINAL CTA ── */}
      <SectionCard title="Sección Final (CTA de cierre)" icon={<Type className="h-3 w-3" />}>
        <Field label="Título">
          <input className={inputCls} value={finalCta.title || ""} onChange={e => setFinalCta({ ...finalCta, title: e.target.value })} />
        </Field>
        <Field label="Descripción">
          <textarea className={textareaCls} rows={2} value={finalCta.description || ""} onChange={e => setFinalCta({ ...finalCta, description: e.target.value })} />
        </Field>
        <Field label="Texto del Botón">
          <input className={inputCls} value={finalCta.buttonText || ""} onChange={e => setFinalCta({ ...finalCta, buttonText: e.target.value })} />
        </Field>
      </SectionCard>

      {/* Sticky save bar */}
      <div className="sticky bottom-4 flex justify-end pb-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 flex items-center gap-4">
          <p className="text-xs text-slate-500 font-medium pl-2">
            {saved ? "✅ Todo guardado." : "⚡ Guarda tus cambios cuando termines."}
          </p>
          <Button onClick={handleSave} disabled={saving || saved} className="rounded-xl h-10 px-6 font-bold shadow-lg shadow-primary/20 gap-2">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> : <Save className="h-3.5 w-3.5" />}
            {saved ? "¡Guardado!" : "Guardar Todo"}
          </Button>
        </div>
      </div>
    </div>
  );
}
