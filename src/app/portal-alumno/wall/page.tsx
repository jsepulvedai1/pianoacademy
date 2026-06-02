"use client";

import { useState } from "react";
import { MessageCircle, FileText, Video, Music as MusicIcon, Link as LinkIcon, ExternalLink, CheckCircle2, User, Clock, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function StudentWallPage() {
  // Simulated data: This should match the "public notes" that the teacher creates
  const [notes, setNotes] = useState([
    { 
      id: 1, 
      text: "¡Excelente clase hoy Ana! Recuerda practicar la escala de Do Mayor con manos juntas.", 
      author: "Profesor Roberto", 
      date: "2024-05-04", 
      attachedMaterial: null,
      isRead: false
    },
    { 
      id: 2, 
      text: "Te dejo un video de Youtube que te ayudará con la postura y la relajación de las muñecas.", 
      author: "Profesor Roberto", 
      date: "2024-04-28", 
      attachedMaterial: { title: "Postura correcta al piano", type: "VIDEO", url: "#" },
      isRead: true
    },
    { 
      id: 3, 
      text: "Adjunto la partitura que revisaremos la próxima semana. Por favor imprímela.", 
      author: "Administración", 
      date: "2024-04-20", 
      attachedMaterial: { title: "Partitura: River Flows in You", type: "PDF", url: "#" },
      isRead: true
    }
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PDF": return <FileText className="h-5 w-5 text-rose-500" />;
      case "VIDEO": return <Video className="h-5 w-5 text-indigo-500" />;
      case "AUDIO": return <MusicIcon className="h-5 w-5 text-emerald-500" />;
      default: return <LinkIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const handleMarkAsRead = (id: number) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    toast.success("Mensaje marcado como visto.");
  };

  return (
    <div className="p-8 lg:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto">
      <header className="space-y-1">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
          <MessageCircle className="h-3 w-3" /> Muro Académico
        </div>
        <h1 className="text-3xl font-bold font-serif tracking-tight text-slate-900">Tus Mensajes y Tareas</h1>
        <p className="text-slate-500 italic">Revisa el material de estudio y comentarios de tus profesores.</p>
      </header>

      <div className="space-y-8 pt-4">
        {notes.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-[2.5rem] shadow-sm border border-slate-100">
             <MessageCircle className="h-12 w-12 text-slate-200 mx-auto mb-4" />
             <p className="text-slate-400 italic">Aún no tienes mensajes en tu muro.</p>
           </div>
        ) : (
          notes.map(note => (
            <Card key={note.id} className={cn(
              "rounded-[2.5rem] border-none shadow-sm overflow-hidden transition-all duration-500",
              note.isRead ? "bg-white" : "bg-indigo-50/50 ring-1 ring-indigo-100 shadow-md scale-[1.01]"
            )}>
               <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                     {/* Avatar placeholder based on author */}
                     <div className={cn(
                        "h-12 w-12 rounded-full flex items-center justify-center shrink-0 border-2 border-white shadow-sm",
                        note.author === "Administración" ? "bg-amber-100 text-amber-600" : "bg-indigo-100 text-indigo-600"
                     )}>
                        {note.author === "Administración" ? <Clock className="h-5 w-5" /> : <User className="h-5 w-5" />}
                     </div>

                     <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between">
                           <div>
                             <p className="text-sm font-bold text-slate-900">{note.author}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{note.date}</p>
                           </div>
                           {!note.isRead && (
                             <Badge className="bg-indigo-500 text-white border-0 font-bold uppercase text-[9px] tracking-widest animate-pulse">
                               Nuevo
                             </Badge>
                           )}
                        </div>

                        <p className={cn(
                          "text-sm leading-relaxed",
                          note.isRead ? "text-slate-600" : "text-slate-800 font-medium"
                        )}>
                          {note.text}
                        </p>

                        {note.attachedMaterial && (
                          <div className="mt-4">
                            <a href={note.attachedMaterial.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-4 hover:border-primary/50 hover:shadow-md transition-all group">
                              <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-primary/5 transition-colors">
                                  {getTypeIcon(note.attachedMaterial.type)}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{note.attachedMaterial.title}</p>
                                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">{note.attachedMaterial.type}</p>
                                </div>
                              </div>
                              <ExternalLink className="h-5 w-5 text-slate-300 group-hover:text-primary transition-colors" />
                            </a>
                          </div>
                        )}

                        {!note.isRead && (
                           <div className="pt-4 flex justify-end">
                              <Button 
                                onClick={() => handleMarkAsRead(note.id)}
                                variant="outline" 
                                size="sm" 
                                className="h-8 rounded-xl text-[10px] font-bold uppercase tracking-widest border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                              >
                                <Check className="h-3 w-3 mr-1.5" /> Marcar como visto
                              </Button>
                           </div>
                        )}
                     </div>
                  </div>
               </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
