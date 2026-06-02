"use client";

import { useState } from "react";
import { User, Camera, Upload, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function TeacherProfilePage() {
  const [isUploading, setIsUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // Simulated teacher data
  const teacher = {
    name: "Profesor Ejemplo",
    email: "profesor@detache.cl",
    phone: "+56 9 1234 5678",
    specialties: ["Piano Básico", "Piano Avanzado"],
    bio: "Pianista profesional con 10 años de experiencia..."
  };

  const handleSimulateUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setPhotoUrl("https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80");
      setIsUploading(false);
      toast.success("Foto de perfil actualizada. Esta imagen será visible en el portal de alumnos.");
    }, 1500);
  };

  return (
    <div className="p-8 lg:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto">
      <header className="space-y-1">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
          <User className="h-3 w-3" /> Mi Cuenta
        </div>
        <h1 className="text-3xl font-bold font-serif tracking-tight text-slate-900">Perfil Público</h1>
        <p className="text-slate-500 italic">Administra cómo te ven los alumnos en la plataforma.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Photo Upload Section */}
        <div className="md:col-span-1 space-y-6">
          <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-xl bg-white text-center p-8 relative group">
             <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
             <div className="w-40 h-40 mx-auto rounded-full border-8 border-white shadow-lg overflow-hidden relative bg-slate-100 flex items-center justify-center mb-6">
                {photoUrl ? (
                   <img src={photoUrl} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                   <User className="h-16 w-16 text-slate-300" />
                )}
                
                {/* Overlay Hover */}
                <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={handleSimulateUpload}>
                   <Camera className="h-8 w-8 text-white" />
                </div>
             </div>
             
             <h2 className="text-xl font-bold font-serif text-slate-900">{teacher.name}</h2>
             <p className="text-xs font-bold uppercase tracking-widest text-primary mt-1">Docente Détaché</p>
             
             <Button 
                onClick={handleSimulateUpload} 
                disabled={isUploading}
                className="w-full mt-6 rounded-2xl h-12 font-bold uppercase text-[10px] tracking-widest bg-slate-900 text-white shadow-lg"
             >
                {isUploading ? "Subiendo..." : "Cambiar Foto"}
             </Button>
          </Card>
          
          <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 flex items-start gap-4">
             <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
             <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                La foto que subas aquí será la que los alumnos verán al momento de buscar y agendar clases contigo.
             </p>
          </div>
        </div>

        {/* Read-only Data Section */}
        <div className="md:col-span-2 space-y-6">
           <Card className="border-none shadow-sm rounded-[2.5rem] bg-white">
              <CardContent className="p-8 space-y-8">
                 <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Datos Personales (Sólo Lectura)</h3>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email</p>
                          <p className="font-medium text-slate-900">{teacher.email}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Teléfono</p>
                          <p className="font-medium text-slate-900">{teacher.phone}</p>
                       </div>
                    </div>
                 </div>
                 
                 <div className="pt-6 border-t border-slate-50">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Perfil Académico</h3>
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Especialidades Asignadas</p>
                          <div className="flex gap-2">
                             {teacher.specialties.map(s => (
                                <Badge key={s} className="bg-indigo-50 text-indigo-700 border-0 font-bold px-3 py-1.5">{s}</Badge>
                             ))}
                          </div>
                       </div>
                       <div className="space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Biografía</p>
                          <p className="text-sm text-slate-600 italic bg-slate-50 p-4 rounded-2xl">{teacher.bio}</p>
                       </div>
                    </div>
                 </div>
                 
                 <div className="pt-4 text-center">
                    <p className="text-[10px] text-slate-400 italic">Si deseas modificar estos datos, por favor contacta a administración.</p>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
