"use client";

import { useState, Suspense } from "react";
import { useMutation } from "@apollo/client/react/index.js";
import { CREATE_LEAD } from "@/graphql/mutations/lead-mutations";
import { 
  CheckCircle2, 
  Loader2, 
  Music, 
  Star, 
  Calendar, 
  Award, 
  Zap, 
  ChevronRight,
  Headphones,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "next/navigation";
import { normalizePhoneNumber } from "@/lib/utils";

function TrialBookingContent() {
  const searchParams = useSearchParams();
  const initialService = searchParams.get("service") || "CLASE_PRUEBA";

  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "+569",
    email: "",
    servicio: "CLASE_PRUEBA"
  });

  const [isSuccess, setIsSuccess] = useState(false);

  const [createLead, { loading }] = useMutation(CREATE_LEAD, {
    onCompleted: () => {
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onError: (err) => {
      console.error("Error creating lead:", err);
      alert("Hubo un error al procesar tu solicitud. Por favor intenta nuevamente.");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || formData.telefono.length !== 12) return;

    createLead({
      variables: {
        nombre: formData.nombre,
        telefono: normalizePhoneNumber(formData.telefono),
        email: formData.email,
        servicio: "CLASE_PRUEBA",
        fuente: "WEB"
      }
    });
  };

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-25" />
            <div className="relative flex items-center justify-center w-full h-full bg-emerald-500 text-white rounded-full shadow-xl shadow-emerald-200">
              <CheckCircle2 className="h-12 w-12" />
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold font-serif text-slate-900 tracking-tight">¡Solicitud Enviada!</h1>
            <p className="text-slate-500 italic">
              Gracias, <span className="font-bold text-slate-900">{formData.nombre}</span>. Hemos recibido tu interés para una <span className="text-primary font-bold">clase de prueba</span> en Détaché.
            </p>
          </div>
          <Card className="border-none bg-slate-50 p-6 rounded-3xl">
            <p className="text-sm text-slate-600 leading-relaxed">
              Nuestra coordinación académica revisará tu solicitud y te contactará vía <span className="font-bold">WhatsApp o llamada</span> al número <span className="font-mono">{formData.telefono}</span> en las próximas 24 horas hábiles para agendar tu primera clase.
            </p>
          </Card>
          <Button variant="outline" className="rounded-2xl px-8" asChild>
            <a href="/">Volver al inicio</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="container mx-auto px-4 py-12 md:py-20 lg:py-32">
        <div className="flex flex-col lg:flex-row items-center gap-16 xl:gap-24">
          
          {/* Content Column */}
          <div className="flex-1 space-y-10 order-2 lg:order-1 max-w-2xl">
            <div className="space-y-6">
              <Badge className="bg-primary/10 text-primary border-none px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                Tu viaje musical comienza aquí
              </Badge>
              <h1 className="text-4xl md:text-6xl font-black font-serif text-slate-900 leading-[1.1] tracking-tight">
                Vive la Experiencia <span className="text-primary italic">Détaché</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-500 leading-relaxed italic font-light">
                No es solo una clase, es el primer paso hacia la maestría. Descubre por qué cientos de alumnos han transformado su relación con la música con nosotros.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: Award, title: "Nivelación Gratuita", desc: "Evaluamos tus conocimientos técnicos y teóricos." },
                { icon: Zap, title: "Técnica Profesional", desc: "Aprende desde la primera nota con postura y digitación correcta." },
                { icon: Calendar, title: "Agenda Flexible", desc: "Coordinamos un horario que se adapte 100% a tu rutina." },
                { icon: Headphones, title: "Soporte Digital", desc: "Acceso inmediato a nuestra plataforma de materiales." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="h-10 w-10 shrink-0 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Card className="bg-slate-900 text-white border-none rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Music className="h-32 w-32" />
              </div>
              <div className="relative z-10 space-y-6">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />)}
                </div>
                <p className="text-lg font-medium italic leading-relaxed">
                  "Buscaba algo más que tutoriales de YouTube. En Détaché encontré una guía real que me ayudó a entender la música, no solo a repetir notas."
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <div className="h-12 w-12 rounded-full bg-slate-800 border border-slate-700" />
                  <div>
                    <p className="font-bold text-sm">Carolina Rivas</p>
                    <p className="text-xs text-slate-400 italic">Alumna de Piano Avanzado</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Form Column */}
          <div className="w-full lg:w-[480px] order-1 lg:order-2">
            <Card className="border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[3rem] bg-white overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
              <div className="p-8 md:p-12 space-y-8">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold font-serif text-slate-900">Solicitar Clase de Prueba</h3>
                  <p className="text-sm text-slate-400 italic">Completa tus datos y coordinaremos tu primera sesión gratuita.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Nombre Completo *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ej: Sebastián Bach" 
                      className="w-full h-14 bg-slate-50 border-slate-100 rounded-2xl px-5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                      value={formData.nombre}
                      onChange={e => setFormData({...formData, nombre: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Teléfono / WhatsApp *</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="+569 XXXXXXXX" 
                      className="w-full h-14 bg-slate-50 border-slate-100 rounded-2xl px-5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                      value={formData.telefono}
                      onChange={handlePhoneChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Correo Electrónico</label>
                    <input 
                      type="email" 
                      placeholder="musica@ejemplo.com" 
                      className="w-full h-14 bg-slate-50 border-slate-100 rounded-2xl px-5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>



                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      disabled={loading || !formData.nombre || formData.telefono.length !== 12}
                      className="w-full h-16 rounded-2xl bg-slate-900 hover:bg-primary text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl transition-all group"
                    >
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <span className="flex items-center gap-2">
                          Agendar Clase de Prueba <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </Button>
                  </div>
                  
                  <p className="text-[10px] text-center text-slate-400 leading-relaxed px-4 italic">
                    Al solicitar tu clase, aceptas que nos contactemos contigo para fines académicos y de coordinación.
                  </p>
                </form>
              </div>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-serif italic text-slate-400">Preparando tu experiencia...</div>}>
      <TrialBookingContent />
    </Suspense>
  );
}
