"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client/react/index.js";
import { gql } from "@apollo/client/core/index.js";
import {
  Plus, Search, Trash2, Edit2, Clock, DollarSign, CheckCircle2,
  X, Loader2, BookOpen, Users, Award, Monitor, Layers, Eye, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const GET_CATALOG_AND_TEACHERS = gql`
  query GetCatalogAndTeachers {
    allClassTypes {
      id
      name
      description
      durationMinutes
      price
      currency
      allowedLevels
      allowedModalities
      whatYouWillLearn
      teachers {
        id
        name
      }
    }
    allTeachers {
      id
      name
    }
  }
`;

const CREATE_CLASS_TYPE = gql`
  mutation CreateClassType(
    $name: String!
    $description: String
    $durationMinutes: Int
    $price: Int
    $currency: String
    $allowedLevels: [String]
    $allowedModalities: [String]
    $whatYouWillLearn: [String]
    $teacherIds: [Int]
  ) {
    createClassType(
      name: $name
      description: $description
      durationMinutes: $durationMinutes
      price: $price
      currency: $currency
      allowedLevels: $allowedLevels
      allowedModalities: $allowedModalities
      whatYouWillLearn: $whatYouWillLearn
      teacherIds: $teacherIds
    ) {
      classType {
        id
      }
    }
  }
`;

const UPDATE_CLASS_TYPE = gql`
  mutation UpdateClassType(
    $id: Int!
    $name: String
    $description: String
    $durationMinutes: Int
    $price: Int
    $currency: String
    $allowedLevels: [String]
    $allowedModalities: [String]
    $whatYouWillLearn: [String]
    $teacherIds: [Int]
  ) {
    updateClassType(
      id: $id
      name: $name
      description: $description
      durationMinutes: $durationMinutes
      price: $price
      currency: $currency
      allowedLevels: $allowedLevels
      allowedModalities: $allowedModalities
      whatYouWillLearn: $whatYouWillLearn
      teacherIds: $teacherIds
    ) {
      success
    }
  }
`;

const DELETE_CLASS_TYPE = gql`
  mutation DeleteClassType($id: Int!) {
    deleteClassType(id: $id) {
      success
    }
  }
`;

const safeParseArray = (val: any): any[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

export default function AdminCatalogPage() {
  const { data, loading, refetch } = useQuery<any>(GET_CATALOG_AND_TEACHERS);
  
  const [createClass, { loading: isCreating }] = useMutation(CREATE_CLASS_TYPE, {
    onCompleted: () => {
      toast.success("Clase creada con éxito ✅");
      setIsNewOpen(false);
      refetch();
    },
    onError: (err) => toast.error(err.message)
  });

  const [updateClass, { loading: isUpdating }] = useMutation(UPDATE_CLASS_TYPE, {
    onCompleted: () => {
      toast.success("Clase actualizada con éxito ✅");
      setIsNewOpen(false);
      refetch();
    },
    onError: (err) => toast.error(err.message)
  });

  const [deleteClass] = useMutation(DELETE_CLASS_TYPE, {
    onCompleted: () => {
      toast.success("Clase eliminada");
      refetch();
    },
    onError: (err) => toast.error(err.message)
  });

  const [search, setSearch] = useState("");
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isEditingId, setIsEditingId] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    name: "",
    description: "",
    durationMinutes: 45,
    price: 25000,
    currency: "CLP",
    allowedLevels: [] as string[],
    allowedModalities: [] as string[],
    whatYouWillLearn: [] as string[],
    teacherIds: [] as number[]
  });

  const [newLearningItem, setNewLearningItem] = useState("");

  const classTypes = data?.allClassTypes || [];
  const teachersList = data?.allTeachers || [];

  const filtered = useMemo(() => {
    return classTypes.filter((c: any) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
    );
  }, [classTypes, search]);

  const handleOpenNew = () => {
    setForm({
      name: "",
      description: "",
      durationMinutes: 45,
      price: 25000,
      currency: "CLP",
      allowedLevels: ["BEGINNER"],
      allowedModalities: ["IN_PERSON", "ONLINE"],
      whatYouWillLearn: [
        "Técnica y postura correcta",
        "Lectura musical y teoría aplicada",
        "Repertorio adaptado a tu nivel",
        "Expresión e interpretación musical"
      ],
      teacherIds: []
    });
    setNewLearningItem("");
    setIsEditingId(null);
    setIsNewOpen(true);
  };

  const handleOpenEdit = (ct: any) => {
    setForm({
      name: ct.name,
      description: ct.description || "",
      durationMinutes: ct.durationMinutes,
      price: ct.price,
      currency: ct.currency,
      allowedLevels: safeParseArray(ct.allowedLevels),
      allowedModalities: safeParseArray(ct.allowedModalities),
      whatYouWillLearn: safeParseArray(ct.whatYouWillLearn),
      teacherIds: (ct.teachers || []).map((t: any) => parseInt(t.id, 10))
    });
    setNewLearningItem("");
    setIsEditingId(ct.id);
    setIsNewOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta clase del catálogo?")) {
      deleteClass({ variables: { id: parseInt(id, 10) } });
    }
  };

  const handleSave = () => {
    if (!form.name || form.price < 0 || form.durationMinutes <= 0) {
      toast.error("Por favor completa los campos requeridos.");
      return;
    }

    const variables = {
      name: form.name,
      description: form.description,
      durationMinutes: parseInt(form.durationMinutes.toString(), 10),
      price: parseInt(form.price.toString(), 10),
      currency: form.currency,
      allowedLevels: form.allowedLevels,
      allowedModalities: form.allowedModalities,
      whatYouWillLearn: form.whatYouWillLearn,
      teacherIds: form.teacherIds
    };

    if (isEditingId) {
      updateClass({
        variables: {
          id: parseInt(isEditingId, 10),
          ...variables
        }
      });
    } else {
      createClass({
        variables
      });
    }
  };

  const toggleLevel = (lvl: string) => {
    if (form.allowedLevels.includes(lvl)) {
      setForm({ ...form, allowedLevels: form.allowedLevels.filter(x => x !== lvl) });
    } else {
      setForm({ ...form, allowedLevels: [...form.allowedLevels, lvl] });
    }
  };

  const toggleModality = (mod: string) => {
    if (form.allowedModalities.includes(mod)) {
      setForm({ ...form, allowedModalities: form.allowedModalities.filter(x => x !== mod) });
    } else {
      setForm({ ...form, allowedModalities: [...form.allowedModalities, mod] });
    }
  };

  const toggleTeacher = (teacherId: number) => {
    if (form.teacherIds.includes(teacherId)) {
      setForm({ ...form, teacherIds: form.teacherIds.filter(id => id !== teacherId) });
    } else {
      setForm({ ...form, teacherIds: [...form.teacherIds, teacherId] });
    }
  };

  const addLearningItem = () => {
    if (!newLearningItem.trim()) return;
    setForm({ ...form, whatYouWillLearn: [...form.whatYouWillLearn, newLearningItem.trim()] });
    setNewLearningItem("");
  };

  const removeLearningItem = (index: number) => {
    setForm({ ...form, whatYouWillLearn: form.whatYouWillLearn.filter((_, idx) => idx !== index) });
  };

  const formatCLP = (n: number) => `$${n.toLocaleString("es-CL")}`;

  return (
    <div className="p-8 lg:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
            <Layers className="h-3 w-3" /> Gestión Académica
          </div>
          <h1 className="text-3xl font-bold font-serif tracking-tight">Catálogo de Clases</h1>
          <p className="text-slate-500 italic text-sm">Define las clases que se muestran en el catálogo público y su información detallada.</p>
        </div>
        <div className="flex gap-3">
          <a href="/catalog" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="h-12 px-6 rounded-2xl font-bold gap-2">
              <Eye className="h-4 w-4" /> Ver Catálogo <ExternalLink className="h-3 w-3 opacity-50" />
            </Button>
          </a>
          <Button onClick={handleOpenNew} size="lg" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-12 px-8 font-bold uppercase tracking-[0.1em] group rounded-2xl">
            <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" /> Crear Clase
          </Button>
        </div>
      </header>

      {/* Search */}
      <div className="max-w-md relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
        <input 
          type="text" 
          placeholder="Buscar clase..." 
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center gap-4 text-slate-300 font-serif italic text-lg">
             <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-4" />
             Cargando catálogo...
          </div>
        ) : filtered.map((ct: any) => (
          <Card 
            key={ct.id} 
            className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold font-serif leading-tight group-hover:text-primary transition-colors">{ct.name}</h3>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleOpenEdit(ct)}
                    className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-primary transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(ct.id)}
                    className="p-2 rounded-full hover:bg-rose-500/10 text-rose-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-slate-500 mb-6 line-clamp-2">{ct.description || "Sin descripción disponible"}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {safeParseArray(ct.allowedLevels).map((lvl: string) => (
                  <Badge key={lvl} className="bg-slate-100 text-slate-700 border-none font-bold text-[9px] uppercase tracking-wider">{lvl}</Badge>
                ))}
                {safeParseArray(ct.allowedModalities).map((mod: string) => (
                  <Badge key={mod} className="bg-primary/5 text-primary border-none font-bold text-[9px] uppercase tracking-wider">{mod}</Badge>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-50 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span>{ct.durationMinutes} minutos</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <DollarSign className="h-4 w-4 text-slate-400" />
                  <span>{formatCLP(ct.price)} {ct.currency}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-400" />
                  <span>{(ct.teachers || []).length} profesores asignados</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span>{safeParseArray(ct.whatYouWillLearn).length} aprendizajes clave</span>
              <LinkIcon className="h-3.5 w-3.5 text-slate-300" />
            </div>
          </Card>
        ))}

        {filtered.length === 0 && !loading && (
          <div className="col-span-full py-20 flex flex-col items-center gap-4 text-slate-300">
            <BookOpen className="h-16 w-16 opacity-20" />
            <p className="text-sm italic font-medium">No hay clases en el catálogo que coincidan con la búsqueda.</p>
          </div>
        )}
      </div>

      {/* Modal Crear/Editar */}
      {isNewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl bg-white border-none shadow-2xl overflow-hidden rounded-[2.5rem] animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <header className="p-8 bg-primary text-white shrink-0">
              <h3 className="text-2xl font-bold font-serif">{isEditingId ? 'Editar Clase' : 'Crear Nueva Clase'}</h3>
              <p className="text-white/70 italic text-sm mt-1">Define el contenido de la tarjeta del catálogo y su detalle correspondiente.</p>
            </header>
            
            <CardContent className="p-8 space-y-6 overflow-y-auto flex-1">
              <div className="space-y-4">
                
                {/* Nombre de la clase */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nombre de la Clase *</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Piano Clásico - Nivel Inicial" 
                    className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                  />
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Descripción / Resumen *</label>
                  <textarea 
                    rows={2}
                    placeholder="Resumen corto de la clase..." 
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                    value={form.description}
                    onChange={e => setForm({...form, description: e.target.value})}
                  />
                </div>

                {/* Duración y Precio */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Duración (Minutos) *</label>
                    <input 
                      type="number" 
                      placeholder="45" 
                      className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-mono outline-none focus:ring-2 focus:ring-primary/20"
                      value={form.durationMinutes || ""}
                      onChange={e => setForm({...form, durationMinutes: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Precio (CLP) *</label>
                    <input 
                      type="number" 
                      placeholder="25000" 
                      className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-mono outline-none focus:ring-2 focus:ring-primary/20"
                      value={form.price || ""}
                      onChange={e => setForm({...form, price: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>

                {/* Niveles (Tags) */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Niveles Permitidos</label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {["BEGINNER", "INTERMEDIATE", "ADVANCED", "MASTER"].map(lvl => {
                      const active = form.allowedLevels.includes(lvl);
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => toggleLevel(lvl)}
                          className={`h-9 px-4 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                            active ? "bg-primary text-white border-primary" : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                          }`}
                        >
                          {lvl === 'BEGINNER' ? 'Principiante' : lvl === 'INTERMEDIATE' ? 'Intermedio' : lvl === 'ADVANCED' ? 'Avanzado' : 'Maestría'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Modalidades */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Modalidades Permitidas</label>
                  <div className="flex gap-3 pt-1">
                    {["ONLINE", "IN_PERSON"].map(mod => {
                      const active = form.allowedModalities.includes(mod);
                      return (
                        <button
                          key={mod}
                          type="button"
                          onClick={() => toggleModality(mod)}
                          className={`h-9 px-5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                            active ? "bg-primary/10 text-primary border-primary/20 font-bold" : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                          }`}
                        >
                          {mod === 'ONLINE' ? 'En Línea (Online)' : 'Presencial'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Profesores Disponibles */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Profesores Habilitados</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-1 max-h-40 overflow-y-auto border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                    {teachersList.map((t: any) => {
                      const teacherIdInt = parseInt(t.id, 10);
                      const active = form.teacherIds.includes(teacherIdInt);
                      return (
                        <div
                          key={t.id}
                          onClick={() => toggleTeacher(teacherIdInt)}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                            active ? "bg-white border-primary/30 shadow-sm font-bold text-slate-800" : "bg-white/40 border-slate-100 text-slate-400 hover:border-slate-200"
                          }`}
                        >
                          <div className={`h-4 w-4 rounded flex items-center justify-center border transition-all ${active ? "bg-primary border-primary text-white" : "border-slate-200"}`}>
                            {active && <CheckCircle2 className="h-3 w-3" />}
                          </div>
                          <span className="text-xs">{t.name}</span>
                        </div>
                      );
                    })}
                    {teachersList.length === 0 && (
                      <p className="text-xs italic text-slate-400 col-span-full py-2">No hay profesores creados.</p>
                    )}
                  </div>
                </div>

                {/* Lo que aprenderás (Lista dinámica) */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Lo que aprenderás</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Ej: Técnica y postura correcta" 
                      className="flex-1 h-11 bg-slate-50 border-none rounded-xl px-4 text-xs font-medium outline-none"
                      value={newLearningItem}
                      onChange={e => setNewLearningItem(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLearningItem(); } }}
                    />
                    <Button type="button" onClick={addLearningItem} className="h-11 bg-slate-900 text-white rounded-xl px-4 text-xs font-bold uppercase tracking-wider shrink-0">
                      Añadir
                    </Button>
                  </div>

                  <div className="space-y-2 pt-2">
                    {form.whatYouWillLearn.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                        <span className="text-xs font-medium text-slate-700">{item}</span>
                        <button 
                          type="button" 
                          onClick={() => removeLearningItem(idx)}
                          className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    {form.whatYouWillLearn.length === 0 && (
                      <p className="text-xs italic text-slate-400 py-2">Añade ítems que los alumnos aprenderán en este curso.</p>
                    )}
                  </div>
                </div>

              </div>
            </CardContent>

            <footer className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4 shrink-0">
              <Button variant="outline" className="flex-1 h-12 rounded-2xl" onClick={() => setIsNewOpen(false)}>Cancelar</Button>
              <Button 
                onClick={handleSave} 
                disabled={isCreating || isUpdating || !form.name} 
                className="flex-1 h-12 rounded-2xl bg-slate-900 text-white font-bold uppercase text-[10px] tracking-widest shadow-lg"
              >
                {(isCreating || isUpdating) ? "Guardando..." : isEditingId ? "Actualizar Clase" : "Crear Clase"}
              </Button>
            </footer>
          </Card>
        </div>
      )}
    </div>
  );
}

function LinkIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="m14 11-4 4" />
      <path d="M15 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}
