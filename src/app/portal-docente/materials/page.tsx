"use client";

import { useState } from "react";
import { BookOpen, Plus, FileText, Link as LinkIcon, Image as ImageIcon, Video, Trash2, Search, ExternalLink, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function TeacherMaterialsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newMaterial, setNewMaterial] = useState({
    title: "",
    type: "PDF",
    url: "",
    description: ""
  });

  // Simulated data for now
  const [materials, setMaterials] = useState([
    { id: 1, title: "Ejercicios de Hanon 1-10", type: "PDF", url: "#", description: "Técnica de independencia de dedos.", date: "2024-05-01" },
    { id: 2, title: "Claro de Luna - Tutorial", type: "VIDEO", url: "https://youtube.com/...", description: "Análisis del primer movimiento.", date: "2024-05-03" },
    { id: 3, title: "Partitura: River Flows in You", type: "PDF", url: "#", description: "Arreglo fácil para principiantes.", date: "2024-05-04" },
  ]);

  const handleAddMaterial = () => {
    if (!newMaterial.title || !newMaterial.url) {
      toast.error("Por favor completa el título y el enlace.");
      return;
    }
    
    setMaterials([{
      id: Date.now(),
      ...newMaterial,
      date: new Date().toISOString().split('T')[0]
    }, ...materials]);
    
    toast.success("Material guardado correctamente.");
    setIsModalOpen(false);
    setNewMaterial({ title: "", type: "PDF", url: "", description: "" });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PDF": return <FileText className="h-5 w-5 text-rose-500" />;
      case "VIDEO": return <Video className="h-5 w-5 text-indigo-500" />;
      case "AUDIO": return <Music className="h-5 w-5 text-emerald-500" />;
      default: return <LinkIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const filteredMaterials = materials.filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-8 lg:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
            <BookOpen className="h-3 w-3" /> Biblioteca
          </div>
          <h1 className="text-3xl font-bold font-serif tracking-tight text-slate-900">Mis Materiales</h1>
          <p className="text-slate-500 italic">Sube ejercicios y enlaces para compartirlos con tus alumnos.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg h-12 px-8 font-bold uppercase tracking-[0.1em] rounded-2xl">
          <Plus className="mr-2 h-5 w-5" /> Subir Material
        </Button>
      </header>

      <div className="flex bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar por título..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm outline-none" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map(m => (
          <Card key={m.id} className="border-slate-100 shadow-sm hover:shadow-md transition-shadow rounded-[2rem] overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                 <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    {getTypeIcon(m.type)}
                 </div>
                 <button className="text-slate-300 hover:text-rose-500 transition-colors p-2">
                    <Trash2 className="h-4 w-4" />
                 </button>
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-1 group-hover:text-primary transition-colors">{m.title}</h3>
              <p className="text-sm text-slate-500 italic mb-4 line-clamp-2">{m.description}</p>
              
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.date}</span>
                 <a href={m.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">
                    Abrir <ExternalLink className="h-3 w-3" />
                 </a>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredMaterials.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
             <FileText className="h-12 w-12 mx-auto text-slate-200 mb-4" />
             <h3 className="text-lg font-bold text-slate-400">No tienes materiales</h3>
             <p className="text-slate-400 text-sm italic mt-1">Sube tu primer ejercicio para empezar.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <Card className="w-full max-w-lg bg-white border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
             <header className="bg-slate-900 p-8 text-white">
                <h3 className="text-2xl font-bold font-serif">Subir Nuevo Material</h3>
                <p className="text-slate-400 text-sm italic mt-1">PDFs, videos o enlaces de apoyo.</p>
             </header>
             <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Título</label>
                   <input type="text" value={newMaterial.title} onChange={e => setNewMaterial({...newMaterial, title: e.target.value})} className="w-full h-12 bg-slate-50 rounded-2xl px-4 outline-none font-medium focus:ring-2 focus:ring-primary/20" placeholder="Ej: Ejercicios de velocidad" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tipo de Archivo</label>
                      <select value={newMaterial.type} onChange={e => setNewMaterial({...newMaterial, type: e.target.value})} className="w-full h-12 bg-slate-50 rounded-2xl px-4 outline-none font-bold">
                         <option value="PDF">Documento / PDF</option>
                         <option value="VIDEO">Video YouTube</option>
                         <option value="LINK">Enlace Web</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Enlace (URL)</label>
                      <input type="url" value={newMaterial.url} onChange={e => setNewMaterial({...newMaterial, url: e.target.value})} className="w-full h-12 bg-slate-50 rounded-2xl px-4 outline-none font-medium focus:ring-2 focus:ring-primary/20" placeholder="https://..." />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Descripción Breve</label>
                   <textarea rows={3} value={newMaterial.description} onChange={e => setNewMaterial({...newMaterial, description: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 outline-none font-medium focus:ring-2 focus:ring-primary/20" placeholder="¿Para qué sirve este material?" />
                </div>
                <div className="flex gap-4 pt-4">
                   <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1 h-12 rounded-2xl font-bold uppercase text-[10px] tracking-widest">Cancelar</Button>
                   <Button onClick={handleAddMaterial} className="flex-1 h-12 rounded-2xl font-bold uppercase text-[10px] tracking-widest bg-primary text-white shadow-lg">Guardar Material</Button>
                </div>
             </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
