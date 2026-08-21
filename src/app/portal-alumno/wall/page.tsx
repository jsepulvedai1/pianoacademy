"use client";

import { useState, useMemo } from "react";
import { MessageCircle, FileText, Video, Music as MusicIcon, Link as LinkIcon, ExternalLink, CheckCircle2, User, Clock, Check, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQuery } from "@apollo/client/react/index.js";
import { MY_WALL_MESSAGES } from "@/graphql/queries/portal-queries";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export default function StudentWallPage() {
  const { data, loading } = useQuery<any>(MY_WALL_MESSAGES, {
    fetchPolicy: "network-only"
  });

  const wallMessages = data?.myWallMessages || [];

  const notes = useMemo(() => {
    return wallMessages.map((msg: any) => ({
      id: msg.id,
      text: msg.text,
      author: msg.author,
      date: msg.createdAt ? format(parseISO(msg.createdAt), "dd 'de' MMMM, yyyy - HH:mm", { locale: es }) : "Reciente",
      attachedMaterial: msg.attachedMaterial ? {
        title: msg.attachedMaterial.title,
        type: msg.attachedMaterial.type,
        url: msg.attachedMaterial.url
      } : null,
      isRead: true
    }));
  }, [wallMessages]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-slate-400 text-xs italic">Cargando mensajes del muro...</p>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PDF": return <FileText className="h-5 w-5 text-rose-500" />;
      case "VIDEO": return <Video className="h-5 w-5 text-indigo-500" />;
      case "AUDIO": return <MusicIcon className="h-5 w-5 text-emerald-500" />;
      default: return <LinkIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const handleMarkAsRead = (id: number) => {
    toast.success("Mensaje marcado como visto.");
  };

  return (
    <div className="p-4 sm:p-8 lg:p-12 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto">
      <header className="space-y-1">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
          <MessageCircle className="h-3.5 w-3.5" /> Muro Académico
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-slate-900">Tus Mensajes y Tareas</h1>
        <p className="text-xs sm:text-sm text-slate-500 italic">Revisa el material de estudio y comentarios de tus profesores.</p>
      </header>

      <div className="space-y-5 sm:space-y-8 pt-2 sm:pt-4">
        {notes.length === 0 ? (
           <div className="text-center py-16 sm:py-20 bg-white rounded-3xl sm:rounded-[2.5rem] shadow-sm border border-slate-100">
             <MessageCircle className="h-10 sm:h-12 w-10 sm:w-12 text-slate-200 mx-auto mb-4" />
             <p className="text-slate-400 text-sm italic">Aún no tienes mensajes en tu muro.</p>
           </div>
        ) : (
          notes.map((note: any) => (
            <Card key={note.id} className={cn(
              "rounded-3xl sm:rounded-[2.5rem] border-none shadow-sm overflow-hidden transition-all duration-500",
              note.isRead ? "bg-white" : "bg-indigo-50/50 ring-1 ring-indigo-100 shadow-md scale-[1.01]"
            )}>
               <CardContent className="p-5 sm:p-8">
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
