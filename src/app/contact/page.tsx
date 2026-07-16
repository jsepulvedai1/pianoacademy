"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react/index.js";
import { CREATE_LEAD } from "@/graphql/mutations/lead-mutations";
import { GET_CONTACT_CONTENT } from "@/graphql/queries/get-contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { normalizePhoneNumber } from "@/lib/utils";
import { Phone, Mail, MapPin, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  const { data: contactData } = useQuery<any>(GET_CONTACT_CONTENT);
  const contact = contactData?.contactContent;

  const bannerTitle1 = contact?.bannerTitle1 || "Sigamos";
  const bannerTitle2 = contact?.bannerTitle2 || "compartiendo";
  const bannerTitle3 = contact?.bannerTitle3 || "el lenguaje de";
  const bannerTitle4 = contact?.bannerTitle4 || "la música";

  const locationTitle = contact?.locationTitle || "Estamos cerca de ti";
  const locationDescription = contact?.locationDescription || "Nuestra academia se encuentra en una ubicación estratégica y de fácil acceso, para que llegar a tus clases sea cómodo y sencillo.";
  const locationAddressTitle = contact?.locationAddressTitle || "Dirección Sede";
  const locationAddress = contact?.locationAddress || "Gran Avenida José Miguel Carrera 8520, Oficina C, La Cisterna.";
  const locationMapIframeUrl = contact?.locationMapIframeUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3326.2307849187313!2d-70.6622543!3d-33.5217965!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662dae3cbf5df1f%3A0xe54fb7a71fbd4fdf!2sGran%20Av.%20Jos%C3%A9%20Miguel%20Carrera%208520%2C%20La%20Cisterna%2C%20Regi%C3%B3n%20Metropolitana!5e0!3m2!1ses-419!2scl!4v1700000000000!5m2!1ses-419!2scl";

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "+569",
    mensaje: ""
  });

  const [isSuccess, setIsSuccess] = useState(false);

  const [createLead, { loading }] = useMutation(CREATE_LEAD, {
    onCompleted: () => {
      setIsSuccess(true);
    },
    onError: (err) => {
      console.error("Error creating contact lead:", err);
      alert("Hubo un error al enviar tu mensaje. Intenta nuevamente.");
    }
  });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith("+569")) {
      value = "+569";
    }
    const suffix = value.slice(4);
    const cleanSuffix = suffix.replace(/\D/g, "");
    const limitedSuffix = cleanSuffix.slice(0, 8);
    setFormData({
      ...formData,
      telefono: "+569" + limitedSuffix
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || formData.telefono.length !== 12 || !formData.email) {
      alert("Por favor completa los campos obligatorios.");
      return;
    }

    const detailedEmail = `${formData.email} | Mensaje: ${formData.mensaje || "Sin mensaje"}`;

    createLead({
      variables: {
        nombre: `${formData.nombre} ${formData.apellido}`.trim(),
        telefono: normalizePhoneNumber(formData.telefono),
        email: detailedEmail,
        servicio: "CLASE_PRUEBA", // Default to trial class category
        fuente: "Contacto Web"
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-800 font-sans">
      
      {/* 1. Hero Section */}
      <section className="relative min-h-[40vh] flex items-center justify-start overflow-hidden bg-black text-white py-16">
        <div className="absolute inset-0 z-0">
          <img
            src="/imagesfooter/4.png"
            alt="Contacto Détaché"
            className="w-full h-full object-cover filter grayscale contrast-125 opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-transparent" />
        </div>

        <div className="container relative z-10 px-4 md:px-6 mx-auto">
          <div className="max-w-4xl text-left space-y-6">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15] font-sans">
              Contáctanos
            </h1>
            <p className="text-slate-300 text-lg md:text-xl max-w-2xl leading-relaxed font-sans font-light">
              ¿Tienes preguntas? Envíanos un mensaje y te responderemos a la brevedad.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Contact Form & Info Section */}
      <section className="py-20 bg-white">
        <div className="container px-4 mx-auto max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            
            {/* Left Form */}
            <div className="lg:col-span-7 bg-[#F8F7F4] rounded-[2.5rem] p-8 md:p-12 border border-slate-200/50 shadow-sm flex flex-col justify-between">
              {isSuccess ? (
                <div className="text-center py-16 space-y-6 flex flex-col items-center justify-center my-auto">
                  <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center shadow-sm">
                    <CheckCircle2 className="h-10 w-10 text-emerald-600 animate-bounce" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-800">¡Mensaje Enviado!</h3>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
                    Hemos recibido tu mensaje de contacto. Un coordinador de Academia Détaché se comunicará contigo vía WhatsApp o email a la brevedad.
                  </p>
                  <Button
                    onClick={() => {
                      setIsSuccess(false);
                      setFormData({ nombre: "", apellido: "", email: "", telefono: "+569", mensaje: "" });
                    }}
                    className="bg-[#70125F] hover:bg-[#590e4b] text-white rounded-xl px-8 h-12 font-bold uppercase tracking-wider text-xs"
                  >
                    Enviar otro mensaje
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                  <div>
                    <h2 className="text-2xl font-extrabold text-[#70125F]">Escríbenos</h2>
                    <p className="text-slate-500 text-xs italic mt-1">Completa los campos para procesar tu solicitud.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#70125F]">Nombre *</label>
                      <Input
                        required
                        placeholder="Ej: Juan"
                        value={formData.nombre}
                        onChange={(e) => handleInputChange("nombre", e.target.value)}
                        className="h-12 bg-white border border-[#70125F]/20 text-slate-800 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#70125F]">Apellido</label>
                      <Input
                        placeholder="Ej: Pérez"
                        value={formData.apellido}
                        onChange={(e) => handleInputChange("apellido", e.target.value)}
                        className="h-12 bg-white border border-[#70125F]/20 text-slate-800 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#70125F]">Email *</label>
                    <Input
                      required
                      type="email"
                      placeholder="juan@ejemplo.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="h-12 bg-white border border-[#70125F]/20 text-slate-800 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#70125F]">Teléfono *</label>
                    <Input
                      required
                      placeholder="+56 9 1234 5678"
                      value={formData.telefono}
                      onChange={handlePhoneChange}
                      className="h-12 bg-white border border-[#70125F]/20 text-slate-800 rounded-xl font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#70125F]">Mensaje *</label>
                    <Textarea
                      required
                      placeholder="Cuéntanos en qué podemos ayudarte..."
                      value={formData.mensaje}
                      onChange={(e) => handleInputChange("mensaje", e.target.value)}
                      className="min-h-[120px] bg-white border border-[#70125F]/20 text-slate-800 rounded-xl p-3 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#70125F] hover:bg-[#590e4b] text-white rounded-xl h-12 uppercase text-xs tracking-wider font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>Enviar Mensaje</span>
                  </Button>
                </form>
              )}
            </div>

            {/* Right Info Details */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-8 text-left lg:pl-6">
              <div className="space-y-4">
                <h2 className="text-3xl font-extrabold text-[#70125F] tracking-tight">Información de Contacto</h2>
                <p className="text-slate-500 leading-relaxed text-sm">
                  Estamos disponibles para atenderte en nuestra sede o responder tus dudas a través de nuestros canales de atención oficiales.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#70125F]/5 rounded-xl border border-[#70125F]/10 text-[#70125F] shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Correo Electrónico</h4>
                    <p className="text-slate-500 text-sm">academia@detache.cl</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#70125F]/5 rounded-xl border border-[#70125F]/10 text-[#70125F] shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Teléfono & WhatsApp</h4>
                    <p className="text-slate-500 text-sm">+56 9 6427 9239</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#70125F]/5 rounded-xl border border-[#70125F]/10 text-[#70125F] shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Dirección Sede</h4>
                    <p className="text-slate-500 text-sm">Gran Avenida José Miguel Carrera 8520, Oficina C, La Cisterna.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Mid-page Banner */}
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

      {/* 4. Bottom Location & Map Section */}
      <section className="py-20 bg-white">
        <div className="container px-4 md:px-6 mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Location Info */}
            <div className="space-y-8 text-left">
              <h2 className="text-4xl font-extrabold text-[#70125F] tracking-tight">
                {locationTitle}
              </h2>
              <p className="text-slate-500 text-base leading-relaxed max-w-md">
                {locationDescription}
              </p>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#70125F]/5 rounded-xl border border-[#70125F]/10 text-[#70125F]">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{locationAddressTitle}</h4>
                  <p className="text-slate-500">{locationAddress}</p>
                </div>
              </div>
            </div>

            {/* Right Interactive Google Map */}
            <div className="h-[360px] md:h-[420px] rounded-[2.5rem] overflow-hidden shadow-md border border-slate-200 relative bg-slate-50">
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
