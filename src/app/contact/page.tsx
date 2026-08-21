"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client/react/index.js";
import { CREATE_LEAD } from "@/graphql/mutations/lead-mutations";
import { GET_CONTACT_CONTENT } from "@/graphql/queries/get-contact";
import { GET_GLOBAL_SETTINGS } from "@/graphql/queries/get-global-settings";
import { normalizePhoneNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  CalendarCheck,
  Send,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  ArrowRight,
  MessageCircle
} from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "+569",
    asunto: "",
    mensaje: ""
  });
  const [isSuccess, setIsSuccess] = useState(false);

  // Queries
  const { data: contactData } = useQuery<any>(GET_CONTACT_CONTENT);
  const { data: globalSettingsData } = useQuery<any>(GET_GLOBAL_SETTINGS);

  const contact = contactData?.contactContent;
  const globalSettings = globalSettingsData?.globalSettings;

  const bannerTitle1 = contact?.bannerTitle1 || "Sigamos";
  const bannerTitle2 = contact?.bannerTitle2 || "compartiendo";
  const bannerTitle3 = contact?.bannerTitle3 || "el lenguaje de";
  const bannerTitle4 = contact?.bannerTitle4 || "la música";

  const locationTitle = contact?.locationTitle || "Estamos cerca de ti";
  const locationDescription =
    contact?.locationDescription ||
    "Nuestra academia se encuentra en una ubicación estratégica y de fácil acceso, para que llegar a tus clases sea cómodo y sencillo.";
  const locationAddressTitle = contact?.locationAddressTitle || "Dirección Sede";
  const locationAddress =
    contact?.locationAddress ||
    "Gran Avenida José Miguel Carrera 8520, Oficina C, La Cisterna.";
  const locationMapIframeUrl =
    contact?.locationMapIframeUrl ||
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3326.2307849187313!2d-70.6622543!3d-33.5217965!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662dae3cbf5df1f%3A0xe54fb7a71fbd4fdf!2sGran%20Av.%20Jos%C3%A9%20Miguel%20Carrera%208520%2C%20La%20Cisterna%2C%20Regi%C3%B3n%20Metropolitana!5e0!3m2!1ses-419!2scl!4v1700000000000!5m2!1ses-419!2scl";

  const rawPhone = globalSettings?.whatsappNumber || "+569979997269";
  const displayEmail = globalSettings?.emailContact || "academia@detache.cl";

  const [createLead, { loading: isSubmitting }] = useMutation(CREATE_LEAD, {
    onCompleted: () => {
      setIsSuccess(true);
      toast.success("¡Mensaje enviado con éxito! Te contactaremos a la brevedad.");
    },
    onError: (err) => {
      toast.error("Hubo un error al enviar tu mensaje: " + err.message);
    }
  });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith("+569")) {
      value = "+569";
    }
    const suffix = value.slice(4);
    const cleanSuffix = suffix.replace(/\D/g, "").slice(0, 8);
    setFormData({ ...formData, telefono: "+569" + cleanSuffix });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim() || formData.telefono.length !== 12 || !formData.email.trim()) {
      toast.error("Por favor completa tu nombre, teléfono WhatsApp y correo electrónico.");
      return;
    }

    const detailedEmail = `${formData.email} | Asunto: ${formData.asunto || "Consulta General"} | Mensaje: ${formData.mensaje || "Sin mensaje"}`;

    createLead({
      variables: {
        nombre: `${formData.nombre} ${formData.apellido}`.trim(),
        telefono: normalizePhoneNumber(formData.telefono),
        email: detailedEmail,
        servicio: formData.asunto ? `CONTACTO_${formData.asunto.toUpperCase().replace(/\s+/g, '_')}` : "CONSULTA_GENERAL",
        fuente: "Contacto Web"
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/60 text-slate-800 font-sans">
      
      {/* ── 1. Hero Header Banner ── */}
      <header className="relative min-h-[40vh] flex items-center justify-start overflow-hidden bg-slate-950 text-white py-20 px-4 sm:px-8 border-b border-slate-800">
        <div className="absolute inset-0 z-0">
          <img
            src="/imagesfooter/4.png"
            alt="Contacto Détaché"
            className="w-full h-full object-cover filter grayscale contrast-125 opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/95 to-[#70125F]/40" />
        </div>

        <div className="max-w-6xl mx-auto w-full relative z-10 space-y-4 pt-12 md:pt-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm text-[10px] uppercase tracking-[0.25em] font-extrabold text-[#DCA060]">
            <Sparkles className="h-3 w-3" /> Atención Oficial Détaché
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-serif tracking-tight leading-tight">
            Canales de Contacto <br />
            <span className="text-[#DCA060]">& Atención Personalizada</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Estamos disponibles para responder todas tus dudas sobre planes, instrumentos y horarios, o para orientarte en el inicio de tus clases.
          </p>
        </div>
      </header>

      {/* ── 2. Main Contact Grid (Spacious & Clean View) ── */}
      <section className="py-16 md:py-24 px-4 sm:px-6 md:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Direct Contact Channels Card & Booking Callout */}
            <div className="lg:col-span-5 space-y-8">
              
              {/* Main Channels Card */}
              <Card className="rounded-[2.5rem] border border-slate-200/80 bg-white p-8 sm:p-10 space-y-8 shadow-xl shadow-slate-200/50">
                <div className="space-y-1.5 border-b border-slate-100 pb-5">
                  <h3 className="font-bold text-xl sm:text-2xl text-slate-900 font-serif">
                    Canales de Contacto Directo
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Comunícate con nuestro equipo por el medio que te resulte más cómodo.
                  </p>
                </div>
                
                <div className="space-y-6">
                  
                  {/* WhatsApp & Teléfono */}
                  <a 
                    href={`https://wa.me/${normalizePhoneNumber(rawPhone)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-4 p-3 -mx-3 rounded-2xl hover:bg-emerald-50/50 transition-all cursor-pointer"
                  >
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <strong className="block text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        WhatsApp & Teléfono
                      </strong>
                      <span className="text-xs sm:text-sm text-slate-600 font-mono font-medium block">
                        {rawPhone.startsWith('+569') ? `+56 9 ${rawPhone.substring(4, 8)} ${rawPhone.substring(8)}` : rawPhone}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-wider mt-1">
                        <MessageCircle className="h-3 w-3" /> Escribir por WhatsApp <ExternalLink className="h-2.5 w-2.5" />
                      </span>
                    </div>
                  </a>

                  {/* Correo Electrónico */}
                  <a 
                    href={`mailto:${displayEmail}`}
                    className="group flex items-start gap-4 p-3 -mx-3 rounded-2xl hover:bg-indigo-50/50 transition-all cursor-pointer"
                  >
                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <strong className="block text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                        Correo Electrónico
                      </strong>
                      <span className="text-xs sm:text-sm text-slate-600 font-medium block break-all">
                        {displayEmail}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 uppercase tracking-wider mt-1">
                        Enviar correo electrónico <ExternalLink className="h-2.5 w-2.5" />
                      </span>
                    </div>
                  </a>

                  {/* Sede Central */}
                  <div className="flex items-start gap-4 p-3 -mx-3 rounded-2xl">
                    <div className="h-12 w-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#70125F] shrink-0 shadow-xs">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                      <strong className="block text-sm font-bold text-slate-900">
                        Sede Central
                      </strong>
                      <span className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed block">
                        {locationAddress}
                      </span>
                      <span className="text-[11px] text-slate-400 block pt-0.5 font-medium">
                        A pasos de Estación Intermodal La Cisterna (L2 y L4A)
                      </span>
                    </div>
                  </div>

                  {/* Horario de Atención */}
                  <div className="flex items-start gap-4 p-3 -mx-3 rounded-2xl border-t border-slate-100 pt-5">
                    <div className="h-12 w-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0 shadow-xs">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                      <strong className="block text-sm font-bold text-slate-900">
                        Horarios de Atención
                      </strong>
                      <p className="text-xs text-slate-600 font-medium">
                        Lunes a Viernes: <span className="font-bold text-slate-800">09:00 - 20:30 hrs</span>
                      </p>
                      <p className="text-xs text-slate-600 font-medium">
                        Sábados: <span className="font-bold text-slate-800">09:00 - 15:00 hrs</span>
                      </p>
                    </div>
                  </div>

                </div>
              </Card>

              {/* Callout to Booking / Clase Inicial */}
              <div className="rounded-[2.5rem] bg-gradient-to-br from-[#70125F] to-slate-900 text-white p-8 sm:p-10 space-y-5 shadow-xl relative overflow-hidden">
                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center text-[#DCA060] shrink-0 border border-white/10">
                    <CalendarCheck className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#DCA060]">
                    ¿Quieres agendar tu primera clase?
                  </span>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl sm:text-2xl font-bold font-serif leading-tight">
                    Agendamiento en Vivo de Clase Inicial
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    Accede a nuestro sistema de reservas para elegir instrumento, profesor, fecha y hora con confirmación al instante.
                  </p>
                </div>
                <Button
                  asChild
                  className="w-full h-12 rounded-2xl bg-[#DCA060] hover:bg-[#c68e50] text-slate-950 font-bold uppercase text-xs tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Link href="/book">
                    <span>Ir a Agendar Clase Inicial</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

            </div>

            {/* Right Column: General Inquiry Form */}
            <div className="lg:col-span-7">
              <Card className="rounded-[2.5rem] border border-slate-200/80 bg-white p-8 sm:p-12 shadow-xl shadow-slate-200/50 space-y-8">
                
                <div className="space-y-2 border-b border-slate-100 pb-6">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#70125F] bg-[#70125F]/5 px-3 py-1 rounded-full border border-[#70125F]/10">
                    Formulario Web
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
                    Envíanos un Mensaje
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Déjanos tus consultas o requerimientos especiales y un asesor académico se pondrá en contacto contigo a la brevedad.
                  </p>
                </div>

                {isSuccess ? (
                  <div className="py-12 px-6 bg-emerald-50/60 rounded-3xl border border-emerald-200/80 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                    <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xl font-bold text-slate-900 font-serif">
                        ¡Mensaje Enviado con Éxito!
                      </h4>
                      <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                        Hemos recibido tu solicitud. Nuestro equipo de coordinación te responderá a la brevedad a través de WhatsApp o correo electrónico.
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        setIsSuccess(false);
                        setFormData({
                          nombre: "",
                          apellido: "",
                          email: "",
                          telefono: "+569",
                          asunto: "",
                          mensaje: ""
                        });
                      }}
                      variant="outline"
                      className="rounded-2xl text-xs font-bold uppercase tracking-wider h-11 px-6 border-emerald-300 text-emerald-800 hover:bg-emerald-100/50 cursor-pointer"
                    >
                      Enviar otra consulta
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Nombre & Apellido */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          Nombre *
                        </label>
                        <Input
                          placeholder="Ej: Claudio"
                          value={formData.nombre}
                          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                          required
                          className="rounded-2xl h-12 bg-slate-50/70 border-slate-200 text-xs font-medium focus:bg-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          Apellido
                        </label>
                        <Input
                          placeholder="Ej: Arrau"
                          value={formData.apellido}
                          onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                          className="rounded-2xl h-12 bg-slate-50/70 border-slate-200 text-xs font-medium focus:bg-white"
                        />
                      </div>
                    </div>

                    {/* Teléfono & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          WhatsApp / Teléfono *
                        </label>
                        <Input
                          type="tel"
                          value={formData.telefono}
                          onChange={handlePhoneChange}
                          required
                          className="rounded-2xl h-12 bg-slate-50/70 border-slate-200 text-xs font-mono font-bold focus:bg-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          Correo Electrónico *
                        </label>
                        <Input
                          type="email"
                          placeholder="ejemplo@correo.cl"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="rounded-2xl h-12 bg-slate-50/70 border-slate-200 text-xs font-medium focus:bg-white"
                        />
                      </div>
                    </div>

                    {/* Asunto / Motivo de Consulta */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Motivo de Consulta / Instrumento de Interés
                      </label>
                      <Input
                        placeholder="Ej: Consulta sobre clases de Piano para niños / Horarios disponibles"
                        value={formData.asunto}
                        onChange={(e) => setFormData({ ...formData, asunto: e.target.value })}
                        className="rounded-2xl h-12 bg-slate-50/70 border-slate-200 text-xs font-medium focus:bg-white"
                      />
                    </div>

                    {/* Mensaje */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Mensaje o Detalle *
                      </label>
                      <Textarea
                        placeholder="Escribe tu mensaje aquí..."
                        rows={5}
                        value={formData.mensaje}
                        onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                        required
                        className="rounded-2xl bg-slate-50/70 border-slate-200 text-xs font-medium focus:bg-white p-4"
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#70125F] hover:bg-[#590e4b] text-white rounded-2xl h-14 uppercase text-xs tracking-widest font-bold shadow-lg shadow-[#70125F]/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Enviando mensaje...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>Enviar Mensaje a Coordinación</span>
                        </>
                      )}
                    </Button>

                  </form>
                )}

              </Card>
            </div>

          </div>

        </div>
      </section>

      {/* ── 3. Mid-page Slogan Banner ── */}
      <section className="py-16 bg-[#F8F7F4] text-center border-t border-b border-slate-200">
        <div className="container px-4 md:px-6 mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight uppercase font-sans">
            <span className="text-[#70125F]">{bannerTitle1}</span>{" "}
            <span className="text-[#DFB012]">{bannerTitle2}</span> <br />
            <span className="text-[#70125F]">{bannerTitle3}</span>{" "}
            <span className="text-[#DFB012]">{bannerTitle4}</span>
          </h2>
        </div>
      </section>

      {/* ── 4. Bottom Location & Interactive Map Section ── */}
      <section className="py-20 bg-white">
        <div className="container px-4 md:px-6 mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Location Info */}
            <div className="space-y-8 text-left">
              <div className="space-y-3">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#70125F] bg-[#70125F]/5 px-3 py-1 rounded-full border border-[#70125F]/10">
                  Nuestra Ubicación
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#70125F] tracking-tight font-serif">
                  {locationTitle}
                </h2>
              </div>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-md">
                {locationDescription}
              </p>
              
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#70125F]/10 rounded-2xl text-[#70125F] shrink-0">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base">{locationAddressTitle}</h4>
                    <p className="text-slate-600 text-xs sm:text-sm mt-0.5">{locationAddress}</p>
                    <p className="text-xs text-slate-400 mt-1">Región Metropolitana, Santiago de Chile</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Interactive Google Map */}
            <div className="h-[360px] md:h-[420px] rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-200 relative bg-slate-50">
              <iframe
                src={locationMapIframeUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full object-cover"
              />
            </div>

          </div>
        </div>
      </section>

      {/* Solid bottom purple bar */}
      <div className="w-full h-4 bg-[#70125F]" />
    </div>
  );
}
