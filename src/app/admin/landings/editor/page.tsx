"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react/index.js";
import { gql } from "@apollo/client/core/index.js";
import Link from "next/link";
import {
  ArrowLeft, Globe, Save, Loader2, CheckCircle2, Plus, Trash2,
  Image as ImageIcon, Type, Quote, MapPin, Zap, Award, Eye, ExternalLink,
  Sparkles, Info, Settings, BookOpen, Upload, Home, Users, Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

// Queries
const GET_ALL_CONTENT = gql`
  query GetAllWebContent {
    homepageContent {
      id heroImage heroTitle1 heroTitleHighlight heroTitle2 heroSubtitle
      heroCta1Text heroCta1Link heroCta2Text heroCta2Link
      features methodBadge methodTitle methodDescription methodItems methodImage
      testimonials
      locationTitle locationDescription locationAddress locationAddressDetail locationMapUrl
      finalCtaTitle finalCtaDescription finalCtaButtonText
    }
    aboutContent {
      id heroImage heroTitleHighlight1 heroTitleText1 heroTitleHighlight2
      historyImage historyTitle historySubtitle historyDescription
      movingTitle movingDescription movingCards
      teamTitle teamDescription teamImages
      finalTitle1 finalTitle2 finalTitle3 finalImage
    }
    contactContent {
      id bannerTitle1 bannerTitle2 bannerTitle3 bannerTitle4
      locationTitle locationDescription locationAddressTitle locationAddress locationMapIframeUrl
    }
  }
`;

// Mutations
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

const UPDATE_ABOUT = gql`
  mutation UpdateAboutContent(
    $heroImage: String $heroTitleHighlight1: String $heroTitleText1: String $heroTitleHighlight2: String
    $historyImage: String $historyTitle: String $historySubtitle: String $historyDescription: String
    $movingTitle: String $movingDescription: String $movingCards: String
    $teamTitle: String $teamDescription: String $teamImages: String
    $finalTitle1: String $finalTitle2: String $finalTitle3: String $finalImage: String
  ) {
    updateAboutContent(
      heroImage: $heroImage heroTitleHighlight1: $heroTitleHighlight1 heroTitleText1: $heroTitleText1 heroTitleHighlight2: $heroTitleHighlight2
      historyImage: $historyImage historyTitle: $historyTitle historySubtitle: $historySubtitle historyDescription: $historyDescription
      movingTitle: $movingTitle movingDescription: $movingDescription movingCards: $movingCards
      teamTitle: $teamTitle teamDescription: $teamDescription teamImages: $teamImages
      finalTitle1: $finalTitle1 finalTitle2: $finalTitle2 finalTitle3: $finalTitle3 finalImage: $finalImage
    ) { success }
  }
`;

const UPDATE_CONTACT = gql`
  mutation UpdateContactContent(
    $bannerTitle1: String $bannerTitle2: String $bannerTitle3: String $bannerTitle4: String
    $locationTitle: String $locationDescription: String $locationAddressTitle: String $locationAddress: String $locationMapIframeUrl: String
  ) {
    updateContactContent(
      bannerTitle1: $bannerTitle1 bannerTitle2: $bannerTitle2 bannerTitle3: $bannerTitle3 bannerTitle4: $bannerTitle4
      locationTitle: $locationTitle locationDescription: $locationDescription locationAddressTitle: $locationAddressTitle
      locationAddress: $locationAddress locationMapIframeUrl: $locationMapIframeUrl
    ) { success }
  }
`;

interface Feature { icon: string; title: string; description: string; }
interface MethodItem { title: string; desc: string; }
interface Testimonial { quote: string; author: string; }
interface MovingCard { title: string; description: string; }

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="rounded-[2.5rem] border border-slate-100 shadow-sm bg-white overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardContent className="p-8 space-y-6">
        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-[#70125F] border-b border-slate-100 pb-4">
          <div className="p-2 rounded-xl bg-[#70125F]/5 text-[#70125F]">{icon}</div>
          {title}
        </div>
        <div className="space-y-4">{children}</div>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[#70125F]/20 focus:bg-white transition-all";
const textareaCls = "w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#70125F]/20 focus:bg-white transition-all resize-none leading-relaxed";

export default function UnifiedWebEditor() {
  const { data, loading, refetch } = useQuery<any>(GET_ALL_CONTENT);
  const [activeTab, setActiveTab] = useState<"inicio" | "nosotros" | "contacto">("inicio");

  // --- Inicio States ---
  const [hp_hero, setHp_hero] = useState<any>({});
  const [hp_features, setHp_features] = useState<Feature[]>([]);
  const [hp_method, setHp_method] = useState<any>({});
  const [hp_methodItems, setHp_methodItems] = useState<MethodItem[]>([]);
  const [hp_testimonials, setHp_testimonials] = useState<Testimonial[]>([]);
  const [hp_location, setHp_location] = useState<any>({});
  const [hp_finalCta, setHp_finalCta] = useState<any>({});

  // --- Nosotros States ---
  const [about_hero, setAbout_hero] = useState<any>({});
  const [about_history, setAbout_history] = useState<any>({});
  const [about_moving, setAbout_moving] = useState<any>({});
  const [about_movingCards, setAbout_movingCards] = useState<MovingCard[]>([]);
  const [about_team, setAbout_team] = useState<any>({});
  const [about_teamImages, setAbout_teamImages] = useState<string[]>([]);
  const [about_final, setAbout_final] = useState<any>({});

  // --- Contacto States ---
  const [contact_banner, setContact_banner] = useState<any>({});
  const [contact_location, setContact_location] = useState<any>({});

  // Parse utils
  const parseJSON = (v: any) => {
    if (Array.isArray(v)) return v;
    if (typeof v === 'string') { try { return JSON.parse(v); } catch { return []; } }
    return [];
  };

  useEffect(() => {
    if (!data) return;

    // Homepage
    const hp = data.homepageContent;
    if (hp) {
      setHp_hero({ image: hp.heroImage, title1: hp.heroTitle1, highlight: hp.heroTitleHighlight, title2: hp.heroTitle2, subtitle: hp.heroSubtitle, cta1Text: hp.heroCta1Text, cta1Link: hp.heroCta1Link, cta2Text: hp.heroCta2Text, cta2Link: hp.heroCta2Link });
      setHp_features(parseJSON(hp.features));
      setHp_method({ badge: hp.methodBadge, title: hp.methodTitle, description: hp.methodDescription, image: hp.methodImage });
      setHp_methodItems(parseJSON(hp.methodItems));
      setHp_testimonials(parseJSON(hp.testimonials));
      setHp_location({ title: hp.locationTitle, description: hp.locationDescription, address: hp.locationAddress, addressDetail: hp.locationAddressDetail, mapUrl: hp.locationMapUrl });
      setHp_finalCta({ title: hp.finalCtaTitle, description: hp.finalCtaDescription, buttonText: hp.finalCtaButtonText });
    }

    // Nosotros
    const about = data.aboutContent;
    if (about) {
      setAbout_hero({ image: about.heroImage, highlight1: about.heroTitleHighlight1, text1: about.heroTitleText1, highlight2: about.heroTitleHighlight2 });
      setAbout_history({ image: about.historyImage, title: about.historyTitle, subtitle: about.historySubtitle, description: about.historyDescription });
      setAbout_moving({ title: about.movingTitle, description: about.movingDescription });
      setAbout_movingCards(parseJSON(about.movingCards));
      setAbout_team({ title: about.teamTitle, description: about.teamDescription });
      setAbout_teamImages(parseJSON(about.teamImages));
      setAbout_final({ title1: about.finalTitle1, title2: about.finalTitle2, title3: about.finalTitle3, image: about.finalImage });
    }

    // Contacto
    const contact = data.contactContent;
    if (contact) {
      setContact_banner({ title1: contact.bannerTitle1, title2: contact.bannerTitle2, title3: contact.bannerTitle3, title4: contact.bannerTitle4 });
      setContact_location({ title: contact.locationTitle, description: contact.locationDescription, addressTitle: contact.locationAddressTitle, address: contact.locationAddress, mapUrl: contact.locationMapIframeUrl });
    }
  }, [data]);

  // Mutations Hook
  const [mutateHomepage, { loading: savingHomepage }] = useMutation(UPDATE_HOMEPAGE);
  const [mutateAbout, { loading: savingAbout }] = useMutation(UPDATE_ABOUT);
  const [mutateContact, { loading: savingContact }] = useMutation(UPDATE_CONTACT);

  const isSaving = savingHomepage || savingAbout || savingContact;

  const handleSave = async () => {
    try {
      if (activeTab === "inicio") {
        await mutateHomepage({
          variables: {
            heroImage: hp_hero.image, heroTitle1: hp_hero.title1, heroTitleHighlight: hp_hero.highlight, heroTitle2: hp_hero.title2, heroSubtitle: hp_hero.subtitle,
            heroCta1Text: hp_hero.cta1Text, heroCta1Link: hp_hero.cta1Link, heroCta2Text: hp_hero.cta2Text, heroCta2Link: hp_hero.cta2Link,
            features: JSON.stringify(hp_features),
            methodBadge: hp_method.badge, methodTitle: hp_method.title, methodDescription: hp_method.description, methodImage: hp_method.image,
            methodItems: JSON.stringify(hp_methodItems), testimonials: JSON.stringify(hp_testimonials),
            locationTitle: hp_location.title, locationDescription: hp_location.description, locationAddress: hp_location.address, locationAddressDetail: hp_location.addressDetail, locationMapUrl: hp_location.mapUrl,
            finalCtaTitle: hp_finalCta.title, finalCtaDescription: hp_finalCta.description, finalCtaButtonText: hp_finalCta.buttonText,
          }
        });
        toast.success("¡Página de Inicio guardada con éxito!");
      } else if (activeTab === "nosotros") {
        await mutateAbout({
          variables: {
            heroImage: about_hero.image, heroTitleHighlight1: about_hero.highlight1, heroTitleText1: about_hero.text1, heroTitleHighlight2: about_hero.highlight2,
            historyImage: about_history.image, historyTitle: about_history.title, historySubtitle: about_history.subtitle, historyDescription: about_history.description,
            movingTitle: about_moving.title, movingDescription: about_moving.description, movingCards: JSON.stringify(about_movingCards),
            teamTitle: about_team.title, teamDescription: about_team.description, teamImages: JSON.stringify(about_teamImages),
            finalTitle1: about_final.title1, finalTitle2: about_final.title2, finalTitle3: about_final.title3, finalImage: about_final.image
          }
        });
        toast.success("¡Página de Nosotros guardada con éxito!");
      } else if (activeTab === "contacto") {
        await mutateContact({
          variables: {
            bannerTitle1: contact_banner.title1, bannerTitle2: contact_banner.title2, bannerTitle3: contact_banner.title3, bannerTitle4: contact_banner.title4,
            locationTitle: contact_location.title, locationDescription: contact_location.description, locationAddressTitle: contact_location.addressTitle, locationAddress: contact_location.address, locationMapIframeUrl: contact_location.mapUrl
          }
        });
        toast.success("¡Página de Contacto guardada con éxito!");
      }
      refetch();
    } catch (e: any) {
      toast.error("Error al guardar: " + e.message);
    }
  };

  // Image Upload handler
  const handleImageUpload = async (file: File, onUploadSuccess: (url: string) => void) => {
    const formData = new FormData();
    formData.append("file", file);

    const djangoUrl = process.env.NEXT_PUBLIC_DJANGO_URL || 'http://localhost:8000';
    toast.promise(
      fetch(`${djangoUrl}/api/media/upload/`, {
        method: "POST",
        body: formData,
      }).then(async (res) => {
        if (!res.ok) throw new Error("Error en la subida");
        const data = await res.json();
        if (data.status === "ERROR") throw new Error(data.message);
        onUploadSuccess(data.url);
        return data;
      }),
      {
        loading: "Subiendo imagen...",
        success: "¡Imagen subida con éxito!",
        error: "Error al subir la imagen",
      }
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-[#70125F]/30" />
    </div>
  );

  return (
    <div className="p-8 lg:p-12 space-y-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <header className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-6">
        <div className="space-y-1">
          <Link href="/admin/landings" className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-[#70125F] transition-colors uppercase tracking-widest mb-3">
            <ArrowLeft className="h-3 w-3" /> Páginas Web
          </Link>
          <h1 className="text-3xl font-bold font-serif tracking-tight text-slate-900 flex items-center gap-3">
            <Sparkles className="h-7 w-7 text-[#70125F] animate-pulse" />
            Editor Web Unificado
          </h1>
          <p className="text-slate-500 italic text-sm">
            Edita visualmente el contenido de las tres páginas principales de tu sitio.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-2xl h-12 px-8 bg-[#70125F] hover:bg-[#590e4b] text-white font-bold shadow-lg shadow-[#70125F]/15 gap-2 text-xs uppercase tracking-wider transition-all hover:scale-105"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSaving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </header>

      {/* Tabs Navigation */}
      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-3xl max-w-md">
        {[
          { id: "inicio", label: "Inicio", icon: Home },
          { id: "nosotros", label: "Nosotros", icon: Users },
          { id: "contacto", label: "Contacto", icon: Phone }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                isActive 
                  ? "bg-white text-[#70125F] shadow-sm font-extrabold" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-[#70125F]' : ''}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Dynamic Content Editor Tabs */}
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* --- INICIO TAB --- */}
        {activeTab === "inicio" && (
          <div className="space-y-8">
            
            {/* HERO SECTION */}
            <SectionCard title="Hero (Cabecera Principal)" icon={<Type className="h-4 w-4" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Imagen de Fondo">
                  <div className="space-y-3">
                    {hp_hero.image && (
                      <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 relative group">
                        <img src={hp_hero.image} alt="Hero Background" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={hp_hero.image || ""}
                        onChange={(e) => setHp_hero({ ...hp_hero, image: e.target.value })}
                        placeholder="/images/background1.jpg"
                        className={inputCls}
                      />
                      <label className="flex items-center gap-2 px-4 h-12 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-2xl cursor-pointer text-xs font-bold shrink-0">
                        <Upload className="h-4 w-4" /> Subir
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleImageUpload(e.target.files[0], (url) => setHp_hero({ ...hp_hero, image: url }));
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </Field>

                <div className="space-y-4">
                  <Field label="Título Parte 1">
                    <input type="text" value={hp_hero.title1 || ""} onChange={(e) => setHp_hero({ ...hp_hero, title1: e.target.value })} className={inputCls} />
                  </Field>
                  <Field label="Palabra Destacada (Amarillo)">
                    <input type="text" value={hp_hero.highlight || ""} onChange={(e) => setHp_hero({ ...hp_hero, highlight: e.target.value })} className={inputCls} />
                  </Field>
                  <Field label="Título Parte 2">
                    <input type="text" value={hp_hero.title2 || ""} onChange={(e) => setHp_hero({ ...hp_hero, title2: e.target.value })} className={inputCls} />
                  </Field>
                </div>
              </div>

              <Field label="Subtítulo">
                <textarea rows={3} value={hp_hero.subtitle || ""} onChange={(e) => setHp_hero({ ...hp_hero, subtitle: e.target.value })} className={textareaCls} />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <Field label="Botón Principal (Texto)">
                  <input type="text" value={hp_hero.cta1Text || ""} onChange={(e) => setHp_hero({ ...hp_hero, cta1Text: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Botón Secundario (Texto)">
                  <input type="text" value={hp_hero.cta2Text || ""} onChange={(e) => setHp_hero({ ...hp_hero, cta2Text: e.target.value })} className={inputCls} />
                </Field>
              </div>
            </SectionCard>

            {/* METHODOLOGY SECTION */}
            <SectionCard title="Metodología (Siguiendo el Compás)" icon={<Award className="h-4 w-4" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Imagen Polaroid">
                  <div className="space-y-3">
                    {hp_method.image && (
                      <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 relative">
                        <img src={hp_method.image} alt="Methodology" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={hp_method.image || ""}
                        onChange={(e) => setHp_method({ ...hp_method, image: e.target.value })}
                        placeholder="/images/method.png"
                        className={inputCls}
                      />
                      <label className="flex items-center gap-2 px-4 h-12 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-2xl cursor-pointer text-xs font-bold shrink-0">
                        <Upload className="h-4 w-4" /> Subir
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleImageUpload(e.target.files[0], (url) => setHp_method({ ...hp_method, image: url }));
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </Field>

                <div className="space-y-4">
                  <Field label="Etiqueta Superior (Badge)">
                    <input type="text" value={hp_method.badge || ""} onChange={(e) => setHp_method({ ...hp_method, badge: e.target.value })} className={inputCls} />
                  </Field>
                  <Field label="Título Metodología">
                    <input type="text" value={hp_method.title || ""} onChange={(e) => setHp_method({ ...hp_method, title: e.target.value })} className={inputCls} />
                  </Field>
                  <Field label="Descripción Larga">
                    <textarea rows={4} value={hp_method.description || ""} onChange={(e) => setHp_method({ ...hp_method, description: e.target.value })} className={textareaCls} />
                  </Field>
                </div>
              </div>
            </SectionCard>

            {/* TESTIMONIALS SECTION */}
            <SectionCard title="Testimonios de Alumnos" icon={<Quote className="h-4 w-4" />}>
              <div className="space-y-4">
                {hp_testimonials.map((t, idx) => (
                  <div key={idx} className="flex gap-4 items-start p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <Field label="Cita/Quote">
                          <input
                            type="text"
                            value={t.quote}
                            onChange={(e) => {
                              const updated = [...hp_testimonials];
                              updated[idx].quote = e.target.value;
                              setHp_testimonials(updated);
                            }}
                            className={inputCls}
                          />
                        </Field>
                      </div>
                      <div>
                        <Field label="Autor">
                          <input
                            type="text"
                            value={t.author}
                            onChange={(e) => {
                              const updated = [...hp_testimonials];
                              updated[idx].author = e.target.value;
                              setHp_testimonials(updated);
                            }}
                            className={inputCls}
                          />
                        </Field>
                      </div>
                    </div>
                    <button
                      onClick={() => setHp_testimonials(hp_testimonials.filter((_, i) => i !== idx))}
                      className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-6"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <Button
                  onClick={() => setHp_testimonials([...hp_testimonials, { quote: "Excelente academia...", author: "Nuevo Alumno" }])}
                  variant="outline"
                  className="rounded-xl border-dashed w-full py-6 text-xs uppercase font-bold tracking-wider"
                >
                  <Plus className="h-4 w-4 mr-2" /> Agregar Testimonio
                </Button>
              </div>
            </SectionCard>

            {/* LOCATION SECTION */}
            <SectionCard title="Ubicación y Sede" icon={<MapPin className="h-4 w-4" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Field label="Título Sección">
                    <input type="text" value={hp_location.title || ""} onChange={(e) => setHp_location({ ...hp_location, title: e.target.value })} className={inputCls} />
                  </Field>
                  <Field label="Descripción de la Academia">
                    <textarea rows={3} value={hp_location.description || ""} onChange={(e) => setHp_location({ ...hp_location, description: e.target.value })} className={textareaCls} />
                  </Field>
                </div>
                <div className="space-y-4">
                  <Field label="Dirección Sede">
                    <input type="text" value={hp_location.address || ""} onChange={(e) => setHp_location({ ...hp_location, address: e.target.value })} className={inputCls} />
                  </Field>
                  <Field label="Detalle de Dirección (ej: Metro)">
                    <input type="text" value={hp_location.addressDetail || ""} onChange={(e) => setHp_location({ ...hp_location, addressDetail: e.target.value })} className={inputCls} />
                  </Field>
                  <Field label="URL Google Maps">
                    <input type="text" value={hp_location.mapUrl || ""} onChange={(e) => setHp_location({ ...hp_location, mapUrl: e.target.value })} className={inputCls} />
                  </Field>
                </div>
              </div>
            </SectionCard>

            {/* FINAL CTA SECTION */}
            <SectionCard title="CTA de Cierre (¿Listo para Empezar?)" icon={<Zap className="h-4 w-4" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Título de Llamado">
                  <input type="text" value={hp_finalCta.title || ""} onChange={(e) => setHp_finalCta({ ...hp_finalCta, title: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Texto del Botón">
                  <input type="text" value={hp_finalCta.buttonText || ""} onChange={(e) => setHp_finalCta({ ...hp_finalCta, buttonText: e.target.value })} className={inputCls} />
                </Field>
              </div>
              <Field label="Descripción Corta">
                <textarea rows={2} value={hp_finalCta.description || ""} onChange={(e) => setHp_finalCta({ ...hp_finalCta, description: e.target.value })} className={textareaCls} />
              </Field>
            </SectionCard>

          </div>
        )}

        {/* --- NOSOTROS TAB --- */}
        {activeTab === "nosotros" && (
          <div className="space-y-8">
            
            {/* HERO SECTION */}
            <SectionCard title="Hero (Nosotros)" icon={<Type className="h-4 w-4" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Imagen de Fondo Grayscale">
                  <div className="space-y-3">
                    {about_hero.image && (
                      <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 relative">
                        <img src={about_hero.image} alt="Hero About" className="w-full h-full object-cover grayscale" />
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={about_hero.image || ""}
                        onChange={(e) => setAbout_hero({ ...about_hero, image: e.target.value })}
                        placeholder="/imagesfooter/4.png"
                        className={inputCls}
                      />
                      <label className="flex items-center gap-2 px-4 h-12 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-2xl cursor-pointer text-xs font-bold shrink-0">
                        <Upload className="h-4 w-4" /> Subir
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleImageUpload(e.target.files[0], (url) => setAbout_hero({ ...about_hero, image: url }));
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </Field>

                <div className="space-y-4">
                  <Field label="Título Resaltado 1">
                    <input type="text" value={about_hero.highlight1 || ""} onChange={(e) => setAbout_hero({ ...about_hero, highlight1: e.target.value })} className={inputCls} />
                  </Field>
                  <Field label="Cuerpo de Título">
                    <input type="text" value={about_hero.text1 || ""} onChange={(e) => setAbout_hero({ ...about_hero, text1: e.target.value })} className={inputCls} />
                  </Field>
                  <Field label="Título Resaltado 2">
                    <input type="text" value={about_hero.highlight2 || ""} onChange={(e) => setAbout_hero({ ...about_hero, highlight2: e.target.value })} className={inputCls} />
                  </Field>
                </div>
              </div>
            </SectionCard>

            {/* HISTORIA SECTION */}
            <SectionCard title="Nuestra Historia" icon={<BookOpen className="h-4 w-4" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Imagen Polaroid Historia">
                  <div className="space-y-3">
                    {about_history.image && (
                      <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 relative">
                        <img src={about_history.image} alt="History About" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={about_history.image || ""}
                        onChange={(e) => setAbout_history({ ...about_history, image: e.target.value })}
                        placeholder="/imagesfooter/2.png"
                        className={inputCls}
                      />
                      <label className="flex items-center gap-2 px-4 h-12 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-2xl cursor-pointer text-xs font-bold shrink-0">
                        <Upload className="h-4 w-4" /> Subir
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleImageUpload(e.target.files[0], (url) => setAbout_history({ ...about_history, image: url }));
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </Field>

                <div className="space-y-4">
                  <Field label="Título Historia">
                    <input type="text" value={about_history.title || ""} onChange={(e) => setAbout_history({ ...about_history, title: e.target.value })} className={inputCls} />
                  </Field>
                  <Field label="Subtítulo Resumen">
                    <textarea rows={2} value={about_history.subtitle || ""} onChange={(e) => setAbout_history({ ...about_history, subtitle: e.target.value })} className={textareaCls} />
                  </Field>
                  <Field label="Descripción de la Historia">
                    <textarea rows={4} value={about_history.description || ""} onChange={(e) => setAbout_history({ ...about_history, description: e.target.value })} className={textareaCls} />
                  </Field>
                </div>
              </div>
            </SectionCard>

            {/* LO QUE NOS MUEVE CARDS */}
            <SectionCard title="Lo Que Nos Mueve (Tarjetas)" icon={<Sparkles className="h-4 w-4" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                <Field label="Título General">
                  <input type="text" value={about_moving.title || ""} onChange={(e) => setAbout_moving({ ...about_moving, title: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Descripción General">
                  <input type="text" value={about_moving.description || ""} onChange={(e) => setAbout_moving({ ...about_moving, description: e.target.value })} className={inputCls} />
                </Field>
              </div>

              <div className="space-y-4 border-t border-slate-100 pt-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#70125F]">Edición de las 4 Tarjetas:</p>
                {about_movingCards.map((card, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label={`Título Tarjeta ${idx + 1}`}>
                      <input
                        type="text"
                        value={card.title}
                        onChange={(e) => {
                          const updated = [...about_movingCards];
                          updated[idx].title = e.target.value;
                          setAbout_movingCards(updated);
                        }}
                        className={inputCls}
                      />
                    </Field>
                    <Field label={`Descripción Tarjeta ${idx + 1}`}>
                      <input
                        type="text"
                        value={card.description}
                        onChange={(e) => {
                          const updated = [...about_movingCards];
                          updated[idx].description = e.target.value;
                          setAbout_movingCards(updated);
                        }}
                        className={inputCls}
                      />
                    </Field>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* TEAM IMAGES ROW */}
            <SectionCard title="Nuestro Equipo (Fotos)" icon={<Users className="h-4 w-4" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                <Field label="Título Sección">
                  <input type="text" value={about_team.title || ""} onChange={(e) => setAbout_team({ ...about_team, title: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Descripción Sección">
                  <input type="text" value={about_team.description || ""} onChange={(e) => setAbout_team({ ...about_team, description: e.target.value })} className={inputCls} />
                </Field>
              </div>

              <div className="space-y-4 border-t border-slate-100 pt-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#70125F]">Fotos de Profesores / Miembros:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {about_teamImages.map((imgUrl, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3 relative">
                      <div className="aspect-[3/4] rounded-xl overflow-hidden border">
                        <img src={imgUrl} alt={`Docente ${idx}`} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={imgUrl}
                          onChange={(e) => {
                            const updated = [...about_teamImages];
                            updated[idx] = e.target.value;
                            setAbout_teamImages(updated);
                          }}
                          className={`${inputCls} text-xs h-9`}
                        />
                        <label className="flex items-center justify-center p-2 bg-white border rounded-xl cursor-pointer hover:bg-slate-50">
                          <Upload className="h-3 w-3 text-slate-500" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleImageUpload(e.target.files[0], (url) => {
                                  const updated = [...about_teamImages];
                                  updated[idx] = url;
                                  setAbout_teamImages(updated);
                                });
                              }
                            }}
                          />
                        </label>
                        <button
                          onClick={() => setAbout_teamImages(about_teamImages.filter((_, i) => i !== idx))}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {about_teamImages.length < 6 && (
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 gap-3 min-h-[220px]">
                      <label className="flex flex-col items-center gap-2 cursor-pointer text-slate-400 hover:text-[#70125F] transition-colors">
                        <Plus className="h-8 w-8 stroke-[1.5]" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Añadir Foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleImageUpload(e.target.files[0], (url) => {
                                setAbout_teamImages([...about_teamImages, url]);
                              });
                            }
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* FINAL SECTION */}
            <SectionCard title="Sección Final Nosotros" icon={<Zap className="h-4 w-4" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Imagen Sede o Clases (Derecha)">
                  <div className="space-y-3">
                    {about_final.image && (
                      <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 relative">
                        <img src={about_final.image} alt="Final Section About" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={about_final.image || ""}
                        onChange={(e) => setAbout_final({ ...about_final, image: e.target.value })}
                        placeholder="/nosotros/4.png"
                        className={inputCls}
                      />
                      <label className="flex items-center gap-2 px-4 h-12 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-2xl cursor-pointer text-xs font-bold shrink-0">
                        <Upload className="h-4 w-4" /> Subir
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleImageUpload(e.target.files[0], (url) => setAbout_final({ ...about_final, image: url }));
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </Field>

                <div className="space-y-4">
                  <Field label="Título Final - Línea 1">
                    <input type="text" value={about_final.title1 || ""} onChange={(e) => setAbout_final({ ...about_final, title1: e.target.value })} className={inputCls} />
                  </Field>
                  <Field label="Título Final - Línea 2">
                    <input type="text" value={about_final.title2 || ""} onChange={(e) => setAbout_final({ ...about_final, title2: e.target.value })} className={inputCls} />
                  </Field>
                  <Field label="Título Final - Línea 3">
                    <input type="text" value={about_final.title3 || ""} onChange={(e) => setAbout_final({ ...about_final, title3: e.target.value })} className={inputCls} />
                  </Field>
                </div>
              </div>
            </SectionCard>

          </div>
        )}

        {/* --- CONTACTO TAB --- */}
        {activeTab === "contacto" && (
          <div className="space-y-8">
            
            {/* MID BANNER SECTION */}
            <SectionCard title="Banner Intermedio" icon={<Type className="h-4 w-4" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Texto Parte 1">
                  <input type="text" value={contact_banner.title1 || ""} onChange={(e) => setContact_banner({ ...contact_banner, title1: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Texto Parte 2 (Amarillo)">
                  <input type="text" value={contact_banner.title2 || ""} onChange={(e) => setContact_banner({ ...contact_banner, title2: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Texto Parte 3">
                  <input type="text" value={contact_banner.title3 || ""} onChange={(e) => setContact_banner({ ...contact_banner, title3: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Texto Parte 4 (Amarillo)">
                  <input type="text" value={contact_banner.title4 || ""} onChange={(e) => setContact_banner({ ...contact_banner, title4: e.target.value })} className={inputCls} />
                </Field>
              </div>
            </SectionCard>

            {/* LOCATION INFO SECTION */}
            <SectionCard title="Ubicación y Dirección Sede" icon={<MapPin className="h-4 w-4" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Field label="Título de Ubicación">
                    <input type="text" value={contact_location.title || ""} onChange={(e) => setContact_location({ ...contact_location, title: e.target.value })} className={inputCls} />
                  </Field>
                  <Field label="Descripción de Ubicación">
                    <textarea rows={3} value={contact_location.description || ""} onChange={(e) => setContact_location({ ...contact_location, description: e.target.value })} className={textareaCls} />
                  </Field>
                </div>
                <div className="space-y-4">
                  <Field label="Título de Dirección (ej: Dirección Sede)">
                    <input type="text" value={contact_location.addressTitle || ""} onChange={(e) => setContact_location({ ...contact_location, addressTitle: e.target.value })} className={inputCls} />
                  </Field>
                  <Field label="Dirección Completa">
                    <input type="text" value={contact_location.address || ""} onChange={(e) => setContact_location({ ...contact_location, address: e.target.value })} className={inputCls} />
                  </Field>
                  <Field label="Google Map Iframe URL (Dirección src)">
                    <input type="text" value={contact_location.mapUrl || ""} onChange={(e) => setContact_location({ ...contact_location, mapUrl: e.target.value })} className={inputCls} />
                  </Field>
                </div>
              </div>
            </SectionCard>

          </div>
        )}

      </div>
    </div>
  );
}
