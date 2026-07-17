"use client";

import { useState } from "react";
import { User, Camera, Upload, CheckCircle2, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useQuery, useMutation } from "@apollo/client/react/index.js";
import { MY_TEACHER_PROFILE } from "@/graphql/queries/portal-queries";
import { CHANGE_MY_PASSWORD } from "@/graphql/mutations/student-mutations";

export default function TeacherProfilePage() {
  const [isUploading, setIsUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPass, setIsChangingPass] = useState(false);

  const { data: profileData, loading } = useQuery<any>(MY_TEACHER_PROFILE);
  const teacher = profileData?.myTeacherProfile;

  const [changePassword] = useMutation(CHANGE_MY_PASSWORD, {
    onCompleted: (res: any) => {
      setIsChangingPass(false);
      if (res.changeMyPassword?.success) {
        toast.success("¡Tu contraseña ha sido cambiada con éxito! 🔑");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        toast.error(res.changeMyPassword?.error || "Error al cambiar la contraseña");
      }
    },
    onError: (err: any) => {
      setIsChangingPass(false);
      toast.error(err.message || "Error al conectar con el servidor.");
    }
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setIsChangingPass(true);
    changePassword({
      variables: { currentPassword, newPassword }
    });
  };

  const handleSimulateUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setPhotoUrl("https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80");
      setIsUploading(false);
      toast.success("Foto de perfil actualizada. Esta imagen será visible en el portal de alumnos.");
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 text-[#70125F] animate-spin" />
        <p className="text-slate-400 text-xs italic">Cargando tu perfil...</p>
      </div>
    );
  }

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
                {photoUrl || teacher?.photo ? (
                   <img src={photoUrl || teacher?.photo} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                   <User className="h-16 w-16 text-slate-300" />
                )}
                
                {/* Overlay Hover */}
                <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={handleSimulateUpload}>
                   <Camera className="h-8 w-8 text-white" />
                </div>
             </div>
             
             <h2 className="text-xl font-bold font-serif text-slate-900">{teacher?.name}</h2>
             <p className="text-xs font-bold uppercase tracking-widest text-primary mt-1">Docente Détaché</p>
             
             <Button 
                onClick={handleSimulateUpload} 
                disabled={isUploading}
                className="w-full mt-6 rounded-2xl h-12 font-bold uppercase text-[10px] tracking-widest bg-slate-900 text-white shadow-lg shadow-slate-900/20"
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

        {/* Read-only Data Section & Change Password Form */}
        <div className="md:col-span-2 space-y-6">
           <Card className="border-none shadow-sm rounded-[2.5rem] bg-white">
              <CardContent className="p-8 space-y-8">
                 <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Datos Personales (Sólo Lectura)</h3>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email</p>
                          <p className="font-medium text-slate-900">{teacher?.email || "—"}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Teléfono</p>
                          <p className="font-medium text-slate-900">{teacher?.phoneNumber || "—"}</p>
                       </div>
                    </div>
                 </div>
                 
                 <div className="pt-6 border-t border-slate-50">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Perfil Académico</h3>
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Especialidades Asignadas</p>
                          <div className="flex flex-wrap gap-2">
                             {teacher?.specialties?.map((s: any) => (
                                <Badge key={s.id} className="bg-indigo-50 text-indigo-700 border-0 font-bold px-3 py-1.5">{s.name}</Badge>
                             ))}
                             {teacher?.specialties?.length === 0 && <p className="text-xs text-slate-400">Ninguna especialidad asignada.</p>}
                          </div>
                       </div>
                       <div className="space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Biografía / Descripción</p>
                          <p className="text-sm text-slate-600 italic bg-slate-50 p-4 rounded-2xl">{teacher?.description || "Sin descripción."}</p>
                       </div>
                    </div>
                 </div>

                 {/* CHANGE PASSWORD */}
                 <form onSubmit={handlePasswordSubmit} className="pt-6 border-t border-slate-50 space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Seguridad: Cambiar Contraseña</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-pass" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Contraseña Actual</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <Input 
                            id="current-pass"
                            type="password"
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="••••••••"
                            className="pl-9 h-10 bg-slate-50 border-none rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="new-pass" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nueva Contraseña</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <Input 
                            id="new-pass"
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="pl-9 h-10 bg-slate-50 border-none rounded-xl"
                          />
                        </div>
                      </div>
                    </div>

                    <Button 
                      type="submit"
                      disabled={isChangingPass}
                      className="bg-[#70125F] hover:bg-[#590e4b] text-white rounded-xl h-10 px-6 font-bold uppercase text-[10px] tracking-widest shadow-md shadow-[#70125F]/20 cursor-pointer transition-all"
                    >
                      {isChangingPass ? "Cambiando..." : "Actualizar Contraseña"}
                    </Button>
                 </form>
                 
                 <div className="pt-4 text-center">
                    <p className="text-[10px] text-slate-400 italic">Si deseas modificar tus datos personales, por favor contacta a administración.</p>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
