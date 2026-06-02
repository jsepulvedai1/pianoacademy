"use client";

import { useState, use } from "react";
import { User, Lock, MessageCircle, FileText, Send, Calendar, Clock, GraduationCap, ChevronLeft, Link as LinkIcon, Video, Music as MusicIcon, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQuery, useMutation } from "@apollo/client/react/index.js";
import { GET_STUDENT_PORTAL_DATA } from "@/graphql/queries/student-portal";
import { CREATE_MATERIAL, CREATE_STUDENT_PRIVATE_NOTE, CREATE_STUDENT_WALL_MESSAGE } from "@/graphql/mutations/student-portal";

export default function TeacherStudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const studentId = parseInt(id, 10);
  
  const { data, loading, error, refetch } = useQuery(GET_STUDENT_PORTAL_DATA, {
    variables: { id: studentId },
    skip: isNaN(studentId)
  });

  const [createPrivateNote] = useMutation(CREATE_STUDENT_PRIVATE_NOTE);
  const [createWallMessage] = useMutation(CREATE_STUDENT_WALL_MESSAGE);
  const [createMaterial] = useMutation(CREATE_MATERIAL);

  const [privateNote, setPrivateNote] = useState("");
  const [publicNote, setPublicNote] = useState("");
  
  // Attach Material State
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [attachTab, setAttachTab] = useState<'EXISTING' | 'NEW'>('EXISTING');
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [newMaterial, setNewMaterial] = useState({ title: "", type: "PDF", url: "" });
  
  // We'll store the attached material temporarily before publishing
  const [pendingAttachment, setPendingAttachment] = useState<any | null>(null);

  const student = data?.studentById;
  const availableMaterials = data?.allMaterials || [];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PDF": return <FileText className="h-4 w-4 text-rose-500" />;
      case "VIDEO": return <Video className="h-4 w-4 text-indigo-500" />;
      case "AUDIO": return <MusicIcon className="h-4 w-4 text-emerald-500" />;
      default: return <LinkIcon className="h-4 w-4 text-blue-500" />;
    }
  };

  const handleAddPrivateNote = async () => {
    if (!privateNote) return;
    try {
      await createPrivateNote({
        variables: { studentId, text: privateNote, author: "Staff" }
      });
      toast.success("Nota privada guardada. Solo visible para Staff.");
      setPrivateNote("");
      refetch();
    } catch (e) {
      toast.error("Error al guardar la nota privada.");
    }
  };

  const handleAddPublicNote = async () => {
    if (!publicNote && !pendingAttachment) return;
    
    try {
      let materialId = null;

      // If it's a NEW material, create it first
      if (pendingAttachment && pendingAttachment.isNew) {
        const { data: matData } = await createMaterial({
          variables: { title: pendingAttachment.title, type: pendingAttachment.type, url: pendingAttachment.url }
        });
        materialId = matData.createMaterial.material.id;
      } else if (pendingAttachment) {
        materialId = pendingAttachment.id;
      }

      await createWallMessage({
        variables: { 
          studentId, 
          text: publicNote, 
          author: "Profesor", 
          attachedMaterialId: materialId ? parseInt(materialId, 10) : null 
        }
      });

      toast.success("Mensaje publicado. El alumno recibirá una notificación.");
      setPublicNote("");
      setPendingAttachment(null);
      refetch();
    } catch (e) {
      toast.error("Error al publicar el mensaje.");
    }
  };

  const handleConfirmAttachment = () => {
    if (attachTab === 'EXISTING') {
      const mat = availableMaterials.find((m: any) => m.id === selectedMaterialId);
      if (mat) {
        setPendingAttachment(mat);
        toast.success("Material adjuntado al mensaje.");
      }
    } else {
      if (!newMaterial.title || !newMaterial.url) {
        toast.error("Por favor completa el título y URL del material.");
        return;
      }
      setPendingAttachment({ ...newMaterial, isNew: true });
      toast.success("Nuevo material adjuntado al mensaje.");
    }
    setIsAttachModalOpen(false);
  };

  const removeAttachment = () => {
    setPendingAttachment(null);
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Cargando perfil del alumno...</div>;
  }

  if (!student) {
    return <div className="p-12 text-center text-slate-400">No se encontró el alumno.</div>;
  }

  return (
    <div className="p-8 lg:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
      <Link href="/portal-docente/students" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">
        <ChevronLeft className="h-4 w-4 mr-1" /> Volver a mis alumnos
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Info */}
        <div className="space-y-6">
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden text-center relative">
             <div className="h-32 bg-slate-900 w-full absolute top-0 left-0" />
             <CardContent className="pt-16 pb-8 px-8 relative z-10">
                <div className="w-32 h-32 mx-auto rounded-full border-8 border-white shadow-xl bg-indigo-50 mb-6 flex items-center justify-center overflow-hidden">
                   {student.avatar ? (
                     <img src={student.avatar} alt="Avatar" className="w-full h-full object-cover" />
                   ) : (
                     <User className="h-12 w-12 text-indigo-300" />
                   )}
                </div>
                <h1 className="text-2xl font-bold font-serif text-slate-900">{student.name}</h1>
                <Badge variant="outline" className="mt-2 border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-widest">{student.pack || "Sin Plan"}</Badge>
                
                <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-100">
                   <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nacimiento</p>
                      <p className="text-sm font-bold text-slate-900 mt-1">{student.age || "--"}</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Contacto</p>
                      <p className="text-sm font-bold text-slate-900 mt-1">{student.phone_number || "--"}</p>
                   </div>
                </div>
             </CardContent>
          </Card>

          <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 flex items-start gap-4">
             <Lock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
             <p className="text-[10px] font-bold uppercase tracking-widest text-amber-800 leading-relaxed">
                Modo Privacidad: Información de contacto y facturación oculta por seguridad.
             </p>
          </div>
        </div>

        {/* Right Column: Notes System */}
        <div className="lg:col-span-2 space-y-6">
           {/* Public Notes / Wall */}
           <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
              <header className="bg-indigo-50 p-6 flex items-center gap-3 border-b border-indigo-100">
                 <MessageCircle className="h-5 w-5 text-indigo-500" />
                 <div>
                    <h2 className="font-bold text-indigo-900">Muro del Alumno</h2>
                    <p className="text-xs text-indigo-600/70 italic">Mensajes, tareas y felicitaciones visibles para {student.name}.</p>
                 </div>
              </header>
              <CardContent className="p-8 space-y-6">
                 {/* Input Area */}
                 <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-slate-100 shrink-0" />
                    <div className="flex-1 space-y-3">
                       <textarea 
                          rows={2} 
                          value={publicNote}
                          onChange={e => setPublicNote(e.target.value)}
                          placeholder={`Escribe un mensaje o tarea para ${student.name}...`}
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium resize-none"
                       />
                       
                       {pendingAttachment && (
                         <div className="flex items-center justify-between bg-indigo-50/50 border border-indigo-100 rounded-xl p-3">
                           <div className="flex items-center gap-2">
                             {getTypeIcon(pendingAttachment.type)}
                             <span className="text-xs font-bold text-indigo-900">{pendingAttachment.title}</span>
                           </div>
                           <button onClick={removeAttachment} className="text-slate-400 hover:text-rose-500 transition-colors">
                             <X className="h-4 w-4" />
                           </button>
                         </div>
                       )}

                       <div className="flex items-center justify-between">
                          <Button onClick={() => setIsAttachModalOpen(true)} variant="outline" size="sm" className="h-8 rounded-xl text-xs font-bold text-slate-500 border-slate-200">
                             <FileText className="h-3 w-3 mr-1.5" /> {pendingAttachment ? "Cambiar Material" : "Adjuntar Material"}
                          </Button>
                          <Button onClick={handleAddPublicNote} size="sm" className="h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase text-[9px] tracking-widest px-4">
                             Publicar <Send className="h-3 w-3 ml-2" />
                          </Button>
                       </div>
                    </div>
                 </div>

                 {/* Timeline */}
                 <div className="space-y-6 pt-6 mt-6 border-t border-slate-50">
                    {student.wallMessages?.map((note: any) => (
                       <div key={note.id} className="flex gap-4">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center shrink-0">
                            <User className="h-5 w-5" />
                          </div>
                          <div className="flex-1 bg-slate-50 rounded-2xl rounded-tl-none p-4 relative">
                             <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-slate-900">{note.author}</span>
                                <span className="text-[10px] font-bold text-slate-400">
                                  {new Date(note.createdAt).toLocaleDateString()}
                                </span>
                             </div>
                             {note.text && <p className="text-sm text-slate-600 mb-3">{note.text}</p>}
                             
                             {note.attachedMaterial && (
                               <a href={note.attachedMaterial.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3 hover:border-indigo-300 transition-colors group">
                                 <div className="flex items-center gap-3">
                                   <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                     {getTypeIcon(note.attachedMaterial.type)}
                                   </div>
                                   <div>
                                     <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{note.attachedMaterial.title}</p>
                                     <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">{note.attachedMaterial.type}</p>
                                   </div>
                                 </div>
                                 <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                               </a>
                             )}
                          </div>
                       </div>
                    ))}
                    {!student.wallMessages?.length && (
                      <p className="text-center text-sm text-slate-400 italic py-4">No hay mensajes en el muro todavía.</p>
                    )}
                 </div>
              </CardContent>
           </Card>

           {/* Private Notes */}
           <Card className="border-none shadow-sm rounded-[2.5rem] bg-slate-900 text-white overflow-hidden">
              <header className="p-6 flex items-center gap-3 border-b border-white/10">
                 <Lock className="h-5 w-5 text-rose-400" />
                 <div>
                    <h2 className="font-bold">Notas Privadas (Staff)</h2>
                    <p className="text-xs text-slate-400 italic">Solo visible para profesores de reemplazo y administración.</p>
                 </div>
              </header>
              <CardContent className="p-8 space-y-6">
                 <div className="flex gap-4">
                    <input 
                       type="text" 
                       value={privateNote}
                       onChange={e => setPrivateNote(e.target.value)}
                       placeholder="Añadir observación confidencial..."
                       className="flex-1 h-12 bg-white/5 border border-white/10 rounded-2xl px-4 outline-none focus:ring-2 focus:ring-rose-500/50 text-sm font-medium text-white placeholder:text-slate-500"
                    />
                    <Button onClick={handleAddPrivateNote} className="h-12 px-6 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold uppercase text-[10px] tracking-widest shrink-0">
                       Guardar Nota
                    </Button>
                 </div>

                 <div className="space-y-3 pt-4">
                    {student.privateNotes?.map((note: any) => (
                       <div key={note.id} className="bg-white/5 border border-white/5 rounded-2xl p-4">
                          <p className="text-sm text-slate-300 leading-relaxed">{note.text}</p>
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5 opacity-50">
                             <User className="h-3 w-3" />
                             <span className="text-[10px] font-bold uppercase tracking-widest">{note.author}</span>
                             <span className="text-[10px]">•</span>
                             <span className="text-[10px] font-bold uppercase tracking-widest">
                                {new Date(note.createdAt).toLocaleDateString()}
                             </span>
                          </div>
                       </div>
                    ))}
                    {!student.privateNotes?.length && (
                      <p className="text-center text-sm text-slate-500 italic py-4">No hay notas privadas.</p>
                    )}
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>

      {/* Attach Material Modal */}
      {isAttachModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-lg bg-white border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
             <header className="bg-slate-900 p-8 text-white relative">
                <button onClick={() => setIsAttachModalOpen(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors">
                  <X className="h-5 w-5" />
                </button>
                <h3 className="text-2xl font-bold font-serif">Adjuntar Material</h3>
                <p className="text-slate-400 text-sm italic mt-1">Comparte un recurso con el alumno.</p>
                
                <div className="flex gap-4 mt-8 border-b border-white/10">
                  <button 
                    onClick={() => setAttachTab('EXISTING')} 
                    className={cn(
                      "pb-3 text-[10px] font-bold uppercase tracking-widest relative transition-colors",
                      attachTab === 'EXISTING' ? "text-primary" : "text-slate-400 hover:text-white"
                    )}
                  >
                    De mi Biblioteca
                    {attachTab === 'EXISTING' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                  </button>
                  <button 
                    onClick={() => setAttachTab('NEW')} 
                    className={cn(
                      "pb-3 text-[10px] font-bold uppercase tracking-widest relative transition-colors",
                      attachTab === 'NEW' ? "text-primary" : "text-slate-400 hover:text-white"
                    )}
                  >
                    Subir Nuevo
                    {attachTab === 'NEW' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                  </button>
                </div>
             </header>
             
             <CardContent className="p-8">
                {attachTab === 'EXISTING' ? (
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Selecciona un material</p>
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                      {availableMaterials.map((m: any) => (
                        <div 
                          key={m.id}
                          onClick={() => setSelectedMaterialId(m.id)}
                          className={cn(
                            "p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-3",
                            selectedMaterialId === m.id ? "bg-indigo-50 border-indigo-200 shadow-sm" : "bg-white border-slate-100 hover:border-indigo-100 hover:bg-slate-50"
                          )}
                        >
                          <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0">
                            {getTypeIcon(m.type)}
                          </div>
                          <div>
                            <p className={cn("text-sm font-bold", selectedMaterialId === m.id ? "text-indigo-900" : "text-slate-700")}>{m.title}</p>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">{m.type}</p>
                          </div>
                        </div>
                      ))}
                      {availableMaterials.length === 0 && (
                        <p className="text-sm text-slate-400 italic text-center py-4">Tu biblioteca está vacía.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Título</label>
                       <input type="text" value={newMaterial.title} onChange={e => setNewMaterial({...newMaterial, title: e.target.value})} className="w-full h-12 bg-slate-50 rounded-2xl px-4 outline-none font-medium focus:ring-2 focus:ring-primary/20" placeholder="Ej: Pauta de estudio" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tipo</label>
                          <select value={newMaterial.type} onChange={e => setNewMaterial({...newMaterial, type: e.target.value})} className="w-full h-12 bg-slate-50 rounded-2xl px-4 outline-none font-bold">
                             <option value="PDF">PDF / Documento</option>
                             <option value="VIDEO">Video YouTube</option>
                             <option value="AUDIO">Audio</option>
                             <option value="LINK">Enlace Web</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Enlace (URL)</label>
                          <input type="url" value={newMaterial.url} onChange={e => setNewMaterial({...newMaterial, url: e.target.value})} className="w-full h-12 bg-slate-50 rounded-2xl px-4 outline-none font-medium focus:ring-2 focus:ring-primary/20" placeholder="https://..." />
                       </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-8">
                  <Button 
                    onClick={handleConfirmAttachment} 
                    disabled={attachTab === 'EXISTING' && !selectedMaterialId}
                    className="w-full h-12 rounded-2xl font-bold uppercase text-[10px] tracking-widest bg-slate-900 hover:bg-slate-800 text-white shadow-lg"
                  >
                    Confirmar Selección
                  </Button>
                </div>
             </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
