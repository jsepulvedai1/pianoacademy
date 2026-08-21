"use client";

import { useState } from "react";
import { User, Camera, Lock, Loader2, Calendar, Clock, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useQuery, useMutation } from "@apollo/client/react/index.js";
import { MY_TEACHER_PROFILE } from "@/graphql/queries/portal-queries";
import { CHANGE_MY_PASSWORD } from "@/graphql/mutations/student-mutations";
import { CREATE_AVAILABILITY, DELETE_AVAILABILITY } from "@/graphql/mutations/availability-mutations";

const DAY_MAP_EN_TO_ES: Record<string, string> = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo"
};

const DAY_MAP_ES_TO_EN: Record<string, string> = {
  "Lunes": "MONDAY",
  "Martes": "TUESDAY",
  "Miércoles": "WEDNESDAY",
  "Jueves": "THURSDAY",
  "Viernes": "FRIDAY",
  "Sábado": "SATURDAY",
  "Domingo": "SUNDAY"
};

const DAYS_ORDER = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default function TeacherProfilePage() {
  const [isUploading, setIsUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPass, setIsChangingPass] = useState(false);

  const [isAddingAvail, setIsAddingAvail] = useState(false);
  const [availDay, setAvailDay] = useState("Lunes");
  const [availStartTime, setAvailStartTime] = useState("09:00");
  const [availEndTime, setAvailEndTime] = useState("13:00");

  const { data: profileData, loading, refetch } = useQuery<any>(MY_TEACHER_PROFILE);
  const teacher = profileData?.myTeacherProfile;

  const [createAvailability, { loading: isCreatingAvail }] = useMutation(CREATE_AVAILABILITY, {
    onCompleted: () => {
      toast.success("¡Horario de disponibilidad agregado! ✅");
      setIsAddingAvail(false);
      refetch();
    },
    onError: (err) => {
      toast.error("Error al guardar horario: " + err.message);
    }
  });

  const [deleteAvailability, { loading: isDeletingAvail }] = useMutation(DELETE_AVAILABILITY, {
    onCompleted: () => {
      toast.success("Horario eliminado");
      refetch();
    },
    onError: (err) => {
      toast.error("Error al eliminar horario: " + err.message);
    }
  });

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

  const handleAddAvailability = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher?.id) return;
    createAvailability({
      variables: {
        teacherId: parseInt(teacher.id),
        day: DAY_MAP_ES_TO_EN[availDay] || "MONDAY",
        startTime: availStartTime,
        endTime: availEndTime
      }
    });
  };

  const handleDeleteAvailability = (id: string | number) => {
    deleteAvailability({
      variables: { id: parseInt(id.toString()) }
    });
  };

  const handleSimulateUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setPhotoUrl("https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80");
      setIsUploading(false);
      toast.success("Foto de perfil actualizada.");
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

  const availabilities = teacher?.availabilities || [];
  const groupedAvailabilities = DAYS_ORDER.map((dayName) => {
    const items = availabilities.filter((av: any) => {
      const dEs = DAY_MAP_EN_TO_ES[av.day?.toUpperCase()] || av.day;
      return dEs?.toLowerCase() === dayName.toLowerCase();
    });
    return { dayName, items };
  });

  return (
    <div className="p-4 sm:p-8 lg:p-12 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
      <header className="space-y-1">
        <div className="flex items-center gap-2 text-[#70125F] font-bold text-xs uppercase tracking-[0.2em] mb-1">
          <User className="h-3.5 w-3.5" /> Mi Cuenta
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-slate-900">Perfil y Disponibilidad</h1>
        <p className="text-xs sm:text-sm text-slate-500 italic">Administra tu información, horarios de atención y cómo te ven los alumnos.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-xl bg-white text-center p-8 relative group">
             <div className="absolute inset-0 bg-gradient-to-br from-[#70125F]/5 to-transparent pointer-events-none" />
             <div className="w-40 h-40 mx-auto rounded-full border-8 border-white shadow-lg overflow-hidden relative bg-slate-100 flex items-center justify-center mb-6">
                {photoUrl || teacher?.photo ? (
                   <img src={photoUrl || teacher?.photo} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                   <User className="h-16 w-16 text-slate-300" />
                )}
                <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={handleSimulateUpload}>
                   <Camera className="h-8 w-8 text-white" />
                </div>
             </div>
             <h2 className="text-xl font-bold font-serif text-slate-900">{teacher?.name}</h2>
             <p className="text-xs font-bold uppercase tracking-widest text-[#70125F] mt-1">Docente Détaché</p>
             <Button 
                onClick={handleSimulateUpload} 
                disabled={isUploading}
                className="w-full mt-6 rounded-2xl h-12 font-bold uppercase text-[10px] tracking-widest bg-slate-900 text-white shadow-lg shadow-slate-900/20 cursor-pointer"
             >
                {isUploading ? "Subiendo..." : "Cambiar Foto"}
             </Button>
          </Card>
          <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 flex items-start gap-4">
             <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
             <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                La foto y los horarios que configures aquí serán los que los alumnos verán al agendar clases contigo.
             </p>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
           <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
              <CardContent className="p-8 space-y-6">
                 <div className="flex items-center justify-between">
                    <div>
                       <div className="flex items-center gap-2 text-[#70125F]">
                          <Calendar className="h-4 w-4" />
                          <h3 className="text-sm font-bold uppercase tracking-widest">Mi Disponibilidad Horaria</h3>
                       </div>
                       <p className="text-xs text-slate-500 mt-1">Bloques en los que estás disponible para dictar clases.</p>
                    </div>
                    <Button
                       onClick={() => setIsAddingAvail(!isAddingAvail)}
                       size="sm"
                       className="bg-[#70125F] hover:bg-[#590e4b] text-white rounded-xl text-xs font-bold gap-1.5 cursor-pointer shadow-md shadow-[#70125F]/20"
                    >
                       <Plus className="h-3.5 w-3.5" /> {isAddingAvail ? "Cancelar" : "Agregar Horario"}
                    </Button>
                 </div>

                 {isAddingAvail && (
                    <form onSubmit={handleAddAvailability} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4 animate-in fade-in">
                       <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Nuevo Bloque de Atención</h4>
                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                             <Label className="text-[10px] font-bold uppercase text-slate-400">Día de la Semana</Label>
                             <select
                                value={availDay}
                                onChange={(e) => setAvailDay(e.target.value)}
                                className="w-full h-10 bg-white border border-slate-200 rounded-xl text-xs px-3 outline-none"
                             >
                                {DAYS_ORDER.map((d) => (
                                   <option key={d} value={d}>{d}</option>
                                ))}
                             </select>
                          </div>
                          <div className="space-y-1">
                             <Label className="text-[10px] font-bold uppercase text-slate-400">Hora Inicio</Label>
                             <Input
                                type="time"
                                required
                                value={availStartTime}
                                onChange={(e) => setAvailStartTime(e.target.value)}
                                className="h-10 bg-white border-slate-200 rounded-xl text-xs"
                             />
                          </div>
                          <div className="space-y-1">
                             <Label className="text-[10px] font-bold uppercase text-slate-400">Hora Término</Label>
                             <Input
                                type="time"
                                required
                                value={availEndTime}
                                onChange={(e) => setAvailEndTime(e.target.value)}
                                className="h-10 bg-white border-slate-200 rounded-xl text-xs"
                             />
                          </div>
                       </div>
                       <div className="flex justify-end gap-2 pt-1">
                          <Button
                             type="button"
                             variant="outline"
                             size="sm"
                             onClick={() => setIsAddingAvail(false)}
                             className="rounded-xl text-xs"
                          >
                             Cancelar
                          </Button>
                          <Button
                             type="submit"
                             size="sm"
                             disabled={isCreatingAvail}
                             className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold gap-1.5"
                          >
                             {isCreatingAvail ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} Guardar Bloque
                          </Button>
                       </div>
                    </form>
                 )}

                 <div className="space-y-2.5">
                    {availabilities.length === 0 ? (
                       <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs italic">
                          No tienes horarios registrados.
                       </div>
                    ) : (
                       groupedAvailabilities.map(({ dayName, items }) => (
                          <div key={dayName} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                             <div className="flex items-center gap-3">
                                <span className="font-bold w-24 text-slate-900">{dayName}</span>
                                <div className="flex flex-wrap gap-1.5">
                                   {items.length === 0 ? (
                                      <span className="text-[11px] text-slate-400 italic">Sin disponibilidad</span>
                                   ) : (
                                      items.map((av: any) => (
                                         <div key={av.id} className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-sm">
                                            <Clock className="h-3 w-3 text-[#70125F]" />
                                            <span className="font-mono font-bold text-slate-800 text-[11px]">
                                               {av.startTime?.slice(0, 5)} - {av.endTime?.slice(0, 5)}
                                            </span>
                                            <button
                                               onClick={() => handleDeleteAvailability(av.id)}
                                               disabled={isDeletingAvail}
                                               className="ml-1 text-slate-300 hover:text-red-600 transition-colors cursor-pointer"
                                            >
                                               <Trash2 className="h-3 w-3" />
                                            </button>
                                         </div>
                                      ))
                                   )}
                                </div>
                             </div>
                          </div>
                       ))
                    )}
                 </div>
              </CardContent>
           </Card>

           <Card className="border-none shadow-sm rounded-[2.5rem] bg-white">
              <CardContent className="p-8 space-y-8">
                 <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Datos de Cuenta</h3>
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
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Especialidades</p>
                          <div className="flex flex-wrap gap-2">
                             {teacher?.specialties?.map((s: any) => (
                                <Badge key={s.id} className="bg-[#70125F]/10 text-[#70125F] border-0 font-bold px-3 py-1.5">{s.name}</Badge>
                             ))}
                          </div>
                       </div>
                       <div className="space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Biografía</p>
                          <p className="text-sm text-slate-600 italic bg-slate-50 p-4 rounded-2xl">{teacher?.description || "Sin descripción."}</p>
                       </div>
                    </div>
                 </div>

                 <form onSubmit={handlePasswordSubmit} className="pt-6 border-t border-slate-50 space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Seguridad: Cambiar Contraseña</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-pass" className="text-[10px] font-bold uppercase text-slate-400">Contraseña Actual</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <Input id="current-pass" type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="pl-9 h-10 bg-slate-50 border-none rounded-xl" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-pass" className="text-[10px] font-bold uppercase text-slate-400">Nueva Contraseña</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <Input id="new-pass" type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="pl-9 h-10 bg-slate-50 border-none rounded-xl" />
                        </div>
                      </div>
                    </div>
                    <Button type="submit" disabled={isChangingPass} className="bg-[#70125F] hover:bg-[#590e4b] text-white rounded-xl h-10 px-6 font-bold uppercase text-[10px] tracking-widest shadow-md shadow-[#70125F]/20 cursor-pointer">
                      {isChangingPass ? "Cambiando..." : "Actualizar Contraseña"}
                    </Button>
                 </form>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
