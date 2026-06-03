"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react/index.js";
import { CREATE_LEAD } from "@/graphql/mutations/lead-mutations";
import { X, Loader2, CheckCircle2, Music } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { normalizePhoneNumber } from "@/lib/utils";

interface TrialClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultService?: string;
}

export function TrialClassModal({ isOpen, onClose, defaultService = "Clase de Prueba General" }: TrialClassModalProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "+569",
    email: "",
    servicio: defaultService
  });
  
  const [isSuccess, setIsSuccess] = useState(false);

  const [createLead, { loading }] = useMutation(CREATE_LEAD, {
    onCompleted: () => {
      setIsSuccess(true);
      // Opcional: Cerrar automáticamente después de unos segundos
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setFormData({ nombre: "", telefono: "+569", email: "", servicio: defaultService });
      }, 3000);
    },
    onError: (err) => {
      console.error("Error creando lead:", err);
      alert("Ocurrió un error. Por favor, intenta de nuevo.");
    }
  });

  if (!isOpen) return null;

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
        servicio: formData.servicio,
        fuente: "Landing Page"
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <Card className="w-full max-w-md bg-white border-none shadow-2xl overflow-hidden rounded-[2.5rem] relative animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {isSuccess ? (
           <CardContent className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
             <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
             </div>
             <h3 className="text-2xl font-bold font-serif mb-2 text-slate-900">¡Solicitud Recibida!</h3>
             <p className="text-slate-500 italic">
               Nuestra coordinación académica se pondrá en contacto contigo pronto al número proporcionado para agendar tu clase.
             </p>
           </CardContent>
        ) : (
          <>
            <header className="p-8 pb-4 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                 <Music className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold font-serif mb-2">Solicita tu Clase</h3>
              <p className="text-slate-500 italic text-sm">
                Déjanos tus datos y nos pondremos en contacto para coordinar tu primera experiencia en Détaché.
              </p>
            </header>

            <CardContent className="p-8 pt-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nombre Completo *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej: Ana Martínez" 
                    className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    value={formData.nombre}
                    onChange={e => setFormData({...formData, nombre: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">WhatsApp / Teléfono *</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="+569 XXXXXXXX" 
                    className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    value={formData.telefono}
                    onChange={handlePhoneChange}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Correo Electrónico</label>
                  <input 
                    type="email" 
                    placeholder="ana@ejemplo.com (Opcional)" 
                    className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={loading || !formData.nombre || formData.telefono.length !== 12} 
                  className="w-full h-14 mt-4 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold uppercase text-xs tracking-widest shadow-lg shadow-primary/20"
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Procesando...</>
                  ) : (
                    "Agendar Clase de Prueba"
                  )}
                </Button>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
