import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react/index.js";
import { GET_ANNOUNCEMENTS } from "@/graphql/queries/get-announcements";
import { CREATE_ANNOUNCEMENT, UPDATE_ANNOUNCEMENT, DELETE_ANNOUNCEMENT } from "@/graphql/mutations/announcement-mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Plus, X, Megaphone, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const TARGET_MAP: Record<string, string> = {
  ALL: "Todos",
  STUDENTS: "Solo Alumnos",
  TEACHERS: "Solo Profesores",
};

export default function AnnouncementsTab() {
  const { data, loading, refetch } = useQuery<any>(GET_ANNOUNCEMENTS);
  const announcements = data?.allAnnouncements || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    targetAudience: "ALL",
    isActive: true
  });

  const [createAnn, { loading: isCreating }] = useMutation(CREATE_ANNOUNCEMENT, {
    onCompleted: () => {
      toast.success("Aviso creado con éxito ✅");
      closeModal();
      refetch();
    },
    onError: (err) => toast.error(err.message)
  });

  const [updateAnn, { loading: isUpdating }] = useMutation(UPDATE_ANNOUNCEMENT, {
    onCompleted: () => {
      toast.success("Aviso actualizado con éxito ✅");
      closeModal();
      refetch();
    },
    onError: (err) => toast.error(err.message)
  });

  const [deleteAnn, { loading: isDeleting }] = useMutation(DELETE_ANNOUNCEMENT, {
    onCompleted: () => {
      toast.success("Aviso eliminado ✅");
      refetch();
    },
    onError: (err) => toast.error(err.message)
  });

  const openModal = (ann: any = null) => {
    if (ann) {
      setEditingItem(ann);
      setFormData({
        title: ann.title,
        content: ann.content,
        targetAudience: ann.targetAudience,
        isActive: ann.isActive
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: "",
        content: "",
        targetAudience: "ALL",
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;
    
    if (editingItem) {
      updateAnn({ variables: { id: parseInt(editingItem.id), ...formData } });
    } else {
      createAnn({ variables: formData });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Seguro que deseas eliminar este aviso permanentemente?")) {
      deleteAnn({ variables: { id: parseInt(id) } });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 font-serif">Muro de Feriados y Avisos</h2>
          <p className="text-xs text-slate-500 italic mt-1">Estos anuncios se mostrarán en los portales de Alumnos y Profesores.</p>
        </div>
        <Button onClick={() => openModal()} className="bg-[#70125F] hover:bg-[#590e4b] text-white rounded-xl font-bold uppercase tracking-widest text-[10px] h-10 px-6">
          <Plus className="h-4 w-4 mr-2" /> Nuevo Aviso
        </Button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto opacity-50" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
          <Megaphone className="h-10 w-10 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No hay avisos registrados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.map((ann: any) => (
            <Card key={ann.id} className={`border-none shadow-sm rounded-[2rem] p-6 relative overflow-hidden transition-all ${ann.isActive ? 'bg-white' : 'bg-slate-50 opacity-70'}`}>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <Badge className={`border-0 font-black text-[9px] uppercase tracking-widest px-3 py-1 ${ann.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                    {ann.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openModal(ann)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary transition-colors">
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(ann.id)} disabled={isDeleting} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg leading-tight">{ann.title}</h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">
                    {format(parseISO(ann.createdAt), "dd MMM yyyy, HH:mm", { locale: es })}
                  </p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap line-clamp-4">
                  {ann.content}
                </p>

                <div className="pt-4 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Público: </span>
                  <span className="text-xs font-bold text-[#70125F] ml-1">{TARGET_MAP[ann.targetAudience] || "Todos"}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-lg bg-white border-none shadow-2xl rounded-[2.5rem] p-8 space-y-6 relative">
            <button onClick={closeModal} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X className="h-5 w-5 text-slate-400" />
            </button>
            
            <div>
              <h3 className="text-2xl font-bold font-serif text-slate-900">{editingItem ? 'Editar Aviso' : 'Nuevo Aviso'}</h3>
              <p className="text-slate-500 text-xs italic mt-1">Completa la información del anuncio global.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Título del Aviso</label>
                <Input required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="h-11 bg-slate-50 border-none rounded-xl" placeholder="Ej: Feriado Irrenunciable 18 Septiembre" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Contenido / Mensaje</label>
                <Textarea required value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} className="min-h-[120px] bg-slate-50 border-none rounded-xl resize-none" placeholder="Escribe aquí el detalle del aviso..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Público Objetivo</label>
                  <select value={formData.targetAudience} onChange={(e) => setFormData({...formData, targetAudience: e.target.value})} className="w-full h-11 bg-slate-50 border-none rounded-xl px-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="ALL">Todos (Alumnos y Profes)</option>
                    <option value="STUDENTS">Solo Alumnos</option>
                    <option value="TEACHERS">Solo Profesores</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Estado</label>
                  <select value={formData.isActive ? "1" : "0"} onChange={(e) => setFormData({...formData, isActive: e.target.value === "1"})} className="w-full h-11 bg-slate-50 border-none rounded-xl px-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="1">Activo (Visible)</option>
                    <option value="0">Inactivo (Oculto)</option>
                  </select>
                </div>
              </div>

              <div className="pt-6">
                <Button type="submit" disabled={isCreating || isUpdating} className="w-full bg-[#70125F] hover:bg-[#590e4b] text-white rounded-xl h-12 font-bold uppercase tracking-widest text-xs">
                  {isCreating || isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar Aviso'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
