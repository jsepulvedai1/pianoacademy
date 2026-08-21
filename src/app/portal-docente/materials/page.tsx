"use client";

import { useState, useMemo } from "react";
import { BookOpen, Plus, FileText, Link as LinkIcon, Image as ImageIcon, Video, Trash2, Search, ExternalLink, Music, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useQuery, useMutation } from "@apollo/client/react/index.js";
import { gql } from "@apollo/client/core/index.js";
import { MY_TEACHER_PROFILE } from "@/graphql/queries/portal-queries";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const GET_ALL_MATERIALS = gql`
  query GetAllMaterials {
    allMaterials {
      id
      title
      type
      url
      createdAt
      teacher {
        id
        name
      }
    }
  }
`;

const CREATE_MATERIAL = gql`
  mutation CreateMaterial($title: String!, $type: String!, $url: String!, $teacherId: Int) {
    createMaterial(title: $title, type: $type, url: $url, teacherId: $teacherId) {
      material {
        id
        title
        type
        url
        createdAt
      }
    }
  }
`;

export default function TeacherMaterialsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newMaterial, setNewMaterial] = useState({
    title: "",
    type: "PDF",
    url: "",
  });

  const { data: profileData } = useQuery<any>(MY_TEACHER_PROFILE);
  const { data: materialsData, loading, refetch } = useQuery<any>(GET_ALL_MATERIALS);

  const [addMaterial, { loading: isAdding }] = useMutation(CREATE_MATERIAL, {
    onCompleted: () => {
      toast.success("Material guardado correctamente.");
      setIsModalOpen(false);
      setNewMaterial({ title: "", type: "PDF", url: "" });
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.message || "Error al subir el material.");
    }
  });

  const teacher = profileData?.myTeacherProfile;
  const materials = materialsData?.allMaterials || [];

  const handleAddMaterial = () => {
    if (!newMaterial.title || !newMaterial.url) {
      toast.error("Por favor completa el título y el enlace.");
      return;
    }
    
    addMaterial({
      variables: {
        title: newMaterial.title,
        type: newMaterial.type,
        url: newMaterial.url,
        teacherId: teacher ? parseInt(teacher.id) : null
      }
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PDF": return <FileText className="h-5 w-5 text-rose-500" />;
      case "VIDEO": return <Video className="h-5 w-5 text-indigo-500" />;
      case "AUDIO": return <Music className="h-5 w-5 text-emerald-500" />;
      default: return <LinkIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const filteredMaterials = useMemo(() => {
    return materials.filter((m: any) => m.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [materials, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 text-[#70125F] animate-spin" />
        <p className="text-slate-400 text-xs italic">Cargando biblioteca de materiales...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 lg:p-12 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
            <BookOpen className="h-3.5 w-3.5" /> Biblioteca
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-slate-900">Mis Materiales</h1>
          <p className="text-xs sm:text-sm text-slate-500 italic">Sube ejercicios y enlaces para compartirlos con tus alumnos.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg h-11 sm:h-12 px-6 sm:px-8 font-bold uppercase tracking-[0.1em] rounded-2xl cursor-pointer w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Subir Material
        </Button>
      </header>

      <div className="flex bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar por título..." 
            className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-slate-50 border-none rounded-xl text-sm outline-none" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredMaterials.map((m: any) => (
          <Card key={m.id} className="border-slate-100 shadow-sm hover:shadow-md transition-shadow rounded-3xl sm:rounded-[2rem] overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                 <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    {getTypeIcon(m.type)}
                 </div>
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-1 group-hover:text-primary transition-colors">{m.title}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Subido por: {m.teacher?.name || "Administración"}</p>
              
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                   {m.createdAt ? format(parseISO(m.createdAt), "dd 'de' MMM, yyyy", { locale: es }) : "—"}
                 </span>
                 <a href={m.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#70125F] hover:underline">
                    Abrir enlace <ExternalLink className="h-3 w-3" />
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
             <header className="bg-slate-900 p-8 text-white flex justify-between items-center">
                <div>
                   <h3 className="text-2xl font-bold font-serif">Subir Nuevo Material</h3>
                   <p className="text-slate-400 text-sm italic mt-1">PDFs, videos o enlaces de apoyo.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-white/60 hover:text-white p-2 cursor-pointer">
                  <X className="h-6 w-6" />
                </button>
             </header>
             <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Título</label>
                   <input type="text" value={newMaterial.title} onChange={e => setNewMaterial({...newMaterial, title: e.target.value})} className="w-full h-12 bg-slate-50 rounded-2xl px-4 outline-none font-medium focus:ring-2 focus:ring-primary/20 text-sm" placeholder="Ej: Ejercicios de velocidad" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tipo de Archivo</label>
                      <select value={newMaterial.type} onChange={e => setNewMaterial({...newMaterial, type: e.target.value})} className="w-full h-12 bg-slate-50 rounded-2xl px-4 outline-none font-bold text-sm">
                         <option value="PDF">Documento / PDF</option>
                         <option value="VIDEO">Video YouTube</option>
                         <option value="LINK">Enlace Web</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Enlace (URL)</label>
                      <input type="url" value={newMaterial.url} onChange={e => setNewMaterial({...newMaterial, url: e.target.value})} className="w-full h-12 bg-slate-50 rounded-2xl px-4 outline-none font-medium focus:ring-2 focus:ring-primary/20 text-sm" placeholder="https://..." />
                   </div>
                </div>
                <div className="flex gap-4 pt-4">
                   <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1 h-12 rounded-2xl font-bold uppercase text-[10px] tracking-widest cursor-pointer">Cancelar</Button>
                   <Button onClick={handleAddMaterial} disabled={isAdding} className="flex-1 h-12 rounded-2xl font-bold uppercase text-[10px] tracking-widest bg-slate-900 text-white shadow-lg cursor-pointer">
                     {isAdding ? "Guardando..." : "Guardar Material"}
                   </Button>
                </div>
             </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
