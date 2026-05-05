"use client";

import { useState, useMemo } from "react";
import { 
  Music, Search, Plus, MoreVertical, Edit2, Trash2, 
  Settings, X, Loader2, Sliders
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@apollo/client/react/index.js";
import { GET_INSTRUMENTS } from "@/graphql/queries/get-instruments";
import { CREATE_INSTRUMENT, UPDATE_INSTRUMENT, DELETE_INSTRUMENT } from "@/graphql/mutations/instrument-mutations";
import { toast } from "sonner";

export default function AdminInstrumentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [editingInstrument, setEditingInstrument] = useState<any | null>(null);
  const [newName, setNewName] = useState("");

  const { data, loading, refetch } = useQuery(GET_INSTRUMENTS);
  const instruments = data?.allInstruments || [];

  const [createInstrument] = useMutation(CREATE_INSTRUMENT, {
    onCompleted: () => {
      toast.success("Instrumento añadido ✅");
      setIsNewOpen(false);
      setNewName("");
      refetch();
    },
    onError: (err) => toast.error(err.message)
  });

  const [updateInstrument] = useMutation(UPDATE_INSTRUMENT, {
    onCompleted: () => {
      toast.success("Instrumento actualizado ✅");
      setEditingInstrument(null);
      setNewName("");
      refetch();
    },
    onError: (err) => toast.error(err.message)
  });

  const [deleteInstrument] = useMutation(DELETE_INSTRUMENT, {
    onCompleted: () => {
      toast.success("Instrumento eliminado");
      refetch();
    },
    onError: (err) => toast.error(err.message)
  });

  const filtered = useMemo(() => 
    instruments.filter((i: any) => i.name.toLowerCase().includes(searchTerm.toLowerCase())),
  [instruments, searchTerm]);

  const handleCreate = () => {
    if (!newName.trim()) return;
    createInstrument({ variables: { name: newName } });
  };

  const handleUpdate = () => {
    if (!newName.trim() || !editingInstrument) return;
    updateInstrument({ variables: { id: parseInt(editingInstrument.id), name: newName } });
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este instrumento?")) {
      deleteInstrument({ variables: { id: parseInt(id) } });
    }
  };

  return (
    <div className="p-8 lg:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
             <Sliders className="h-3 w-3" /> Configuración Académica
          </div>
          <h1 className="text-3xl font-bold font-serif tracking-tight text-slate-900">Catálogo de Instrumentos</h1>
          <p className="text-slate-500 italic text-sm">Gestiona los instrumentos disponibles en la academia.</p>
        </div>
        <Button onClick={() => setIsNewOpen(true)} size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-lg h-12 px-8 font-bold uppercase tracking-[0.1em] rounded-2xl">
          <Plus className="mr-2 h-5 w-5" /> Añadir Instrumento
        </Button>
      </header>

      <Card className="border-none shadow-sm overflow-hidden bg-white rounded-3xl">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
           <div className="relative w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input type="text" placeholder="Buscar instrumento..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
           </div>
           <Badge variant="outline" className="border-slate-100 text-slate-400 text-[10px] px-3 py-1 font-bold">{filtered.length} Instrumentos</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-8">
           {loading ? (
             <div className="col-span-full py-20 text-center italic text-slate-400">Cargando catálogo...</div>
           ) : filtered.map((inst: any) => (
             <div key={inst.id} className="group bg-slate-50 p-6 rounded-[2rem] border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-xl transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                   <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Music className="h-6 w-6" />
                   </div>
                   <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingInstrument(inst); setNewName(inst.name); }} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-primary transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(inst.id)} className="p-2 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                   </div>
                </div>
                <h3 className="text-xl font-bold font-serif text-slate-900 mb-1">{inst.name}</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Cátedra Activa</p>
             </div>
           ))}
        </div>
      </Card>

      {(isNewOpen || editingInstrument) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
           <Card className="w-full max-w-sm bg-white rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-bold font-serif">{editingInstrument ? 'Editar' : 'Nuevo'} Instrumento</h3>
                  <p className="text-slate-400 text-xs italic">Define el nombre de la cátedra.</p>
                </div>
                <button onClick={() => { setIsNewOpen(false); setEditingInstrument(null); setNewName(""); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="h-6 w-6 text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nombre del Instrumento</label>
                    <input type="text" placeholder="Ej: Piano" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                 </div>
              </div>

              <div className="flex gap-4 mt-10">
                 <Button variant="ghost" className="flex-1 h-12 rounded-2xl font-bold uppercase text-[10px] tracking-widest" onClick={() => { setIsNewOpen(false); setEditingInstrument(null); setNewName(""); }}>Cancelar</Button>
                 <Button disabled={!newName.trim()} className="flex-1 h-12 bg-slate-900 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest shadow-xl shadow-slate-900/20" onClick={editingInstrument ? handleUpdate : handleCreate}>
                   {editingInstrument ? 'Guardar Cambios' : 'Registrar'}
                 </Button>
              </div>
           </Card>
        </div>
      )}
    </div>
  );
}
