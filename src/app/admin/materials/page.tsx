"use client";

import { useState, useMemo } from "react";
import { 
  BookOpen, Plus, FileText, Link as LinkIcon, Video, Trash2, 
  Search, ExternalLink, Music, Loader2, X, Sparkles, Copy, 
  Check, Filter, ShieldCheck, UserCheck, Edit2, Layers,
  GraduationCap, Download, Share2, ArrowUpRight, UploadCloud, Paperclip, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useQuery, useMutation } from "@apollo/client/react/index.js";
import { GET_ALL_MATERIALS } from "@/graphql/queries/get-materials";
import { GET_TEACHERS } from "@/graphql/queries/get-teachers";
import { GET_INSTRUMENTS } from "@/graphql/queries/get-instruments";
import { CREATE_MATERIAL, UPDATE_MATERIAL, DELETE_MATERIAL } from "@/graphql/mutations/material-mutations";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

type ScopeFilter = "ALL" | "DETACHE" | "TEACHER";

export default function AdminMaterialsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeScope, setActiveScope] = useState<ScopeFilter>("ALL");
  const [teacherFilter, setTeacherFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [instrumentFilter, setInstrumentFilter] = useState("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    type: "PDF",
    url: "",
    description: "",
    scope: "DETACHE",
    teacherId: "",
    instrumentId: "",
    level: "Todos los niveles"
  });

  // Queries
  const { data: materialsData, loading: materialsLoading, refetch } = useQuery<any>(GET_ALL_MATERIALS, {
    fetchPolicy: "network-only"
  });
  const { data: teachersData } = useQuery<any>(GET_TEACHERS);
  const { data: instrumentsData } = useQuery<any>(GET_INSTRUMENTS);

  const materials = materialsData?.allMaterials || [];
  const teachers = teachersData?.allTeachers || [];
  const instruments = instrumentsData?.allInstruments || [];

  // Mutations
  const [createMaterial, { loading: isCreating }] = useMutation<any>(CREATE_MATERIAL, {
    onCompleted: (res) => {
      if (res?.createMaterial?.success) {
        toast.success("Material guardado correctamente en la biblioteca ✅");
        closeModal();
        refetch();
      } else {
        toast.error(res?.createMaterial?.error || "Error al crear material");
      }
    },
    onError: (err) => toast.error(err.message)
  });

  const [updateMaterial, { loading: isUpdating }] = useMutation<any>(UPDATE_MATERIAL, {
    onCompleted: (res) => {
      if (res?.updateMaterial?.success) {
        toast.success("Material actualizado exitosamente ✅");
        closeModal();
        refetch();
      } else {
        toast.error(res?.updateMaterial?.error || "Error al actualizar");
      }
    },
    onError: (err) => toast.error(err.message)
  });

  const [deleteMaterial, { loading: isDeleting }] = useMutation<any>(DELETE_MATERIAL, {
    onCompleted: (res) => {
      if (res?.deleteMaterial?.success) {
        toast.success("Material eliminado correctamente");
        refetch();
      } else {
        toast.error(res?.deleteMaterial?.error || "Error al eliminar");
      }
    },
    onError: (err) => toast.error(err.message)
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("folder", "materials");

      const endpoint = process.env.NEXT_PUBLIC_DJANGO_API_URL 
        ? `${process.env.NEXT_PUBLIC_DJANGO_API_URL}/api/media/upload/`
        : "http://localhost:8000/api/media/upload/";

      const res = await fetch(endpoint, {
        method: "POST",
        body: uploadData,
      });

      const data = await res.json();
      if (data.status === "SUCCESS" && data.url) {
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        let detectedType = "PDF";
        if (["mp3", "wav", "ogg", "aac", "flac"].includes(fileExt || "")) detectedType = "AUDIO";
        else if (["mp4", "mov", "avi", "webm", "mkv"].includes(fileExt || "")) detectedType = "VIDEO";
        else if (["pdf", "doc", "docx", "xls", "xlsx"].includes(fileExt || "")) detectedType = "PDF";

        setFormData(prev => ({
          ...prev,
          url: data.url,
          title: prev.title || file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
          type: detectedType
        }));
        setUploadedFileName(file.name);
        toast.success(`Archivo "${file.name}" subido y guardado en el servidor ✅`);
      } else {
        toast.error(data.message || "Error al subir archivo");
      }
    } catch (err: any) {
      toast.error("Error de conexión al subir archivo: " + err.message);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const openNewModal = (defaultScope: "DETACHE" | "TEACHER" = "DETACHE") => {
    setEditingMaterial(null);
    setUploadedFileName(null);
    setFormData({
      title: "",
      type: "PDF",
      url: "",
      description: "",
      scope: defaultScope,
      teacherId: "",
      instrumentId: "",
      level: "Todos los niveles"
    });
    setIsModalOpen(true);
  };

  const openEditModal = (material: any) => {
    setEditingMaterial(material);
    setUploadedFileName(null);
    setFormData({
      title: material.title || "",
      type: material.type || "PDF",
      url: material.url || "",
      description: material.description || "",
      scope: material.scope || "DETACHE",
      teacherId: material.teacher?.id ? String(material.teacher.id) : "",
      instrumentId: material.instrument?.id ? String(material.instrument.id) : "",
      level: material.level || "Todos los niveles"
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMaterial(null);
    setUploadedFileName(null);
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.url.trim()) {
      toast.error("Por favor completa el título y el enlace / URL del recurso.");
      return;
    }

    if (editingMaterial) {
      updateMaterial({
        variables: {
          id: parseInt(editingMaterial.id),
          title: formData.title.trim(),
          type: formData.type,
          url: formData.url.trim(),
          description: formData.description.trim(),
          scope: formData.scope,
          teacherId: formData.scope === "TEACHER" && formData.teacherId ? parseInt(formData.teacherId) : null,
          instrumentId: formData.instrumentId ? parseInt(formData.instrumentId) : null,
          level: formData.level
        }
      });
    } else {
      createMaterial({
        variables: {
          title: formData.title.trim(),
          type: formData.type,
          url: formData.url.trim(),
          description: formData.description.trim(),
          scope: formData.scope,
          teacherId: formData.scope === "TEACHER" && formData.teacherId ? parseInt(formData.teacherId) : null,
          instrumentId: formData.instrumentId ? parseInt(formData.instrumentId) : null,
          level: formData.level
        }
      });
    }
  };

  const handleDelete = (material: any) => {
    if (confirm(`¿Estás seguro de que deseas eliminar permanentemente el material "${material.title}"?`)) {
      deleteMaterial({ variables: { id: parseInt(material.id) } });
    }
  };

  const handleConvertToDetache = (material: any) => {
    if (confirm(`¿Deseas convertir "${material.title}" en Material Oficial Détaché? Pasará a ser parte de la biblioteca central para toda la academia.`)) {
      updateMaterial({
        variables: {
          id: parseInt(material.id),
          scope: "DETACHE"
        }
      });
    }
  };

  const handleCopyLink = (material: any) => {
    if (!material.url) return;
    navigator.clipboard.writeText(material.url);
    setCopiedId(material.id);
    toast.success("Enlace copiado al portapapeles 📋");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PDF": return <FileText className="h-5 w-5 text-rose-500" />;
      case "VIDEO": return <Video className="h-5 w-5 text-indigo-500" />;
      case "AUDIO": return <Music className="h-5 w-5 text-emerald-500" />;
      default: return <LinkIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  // KPIs
  const stats = useMemo(() => {
    const total = materials.length;
    const detache = materials.filter((m: any) => m.scope === "DETACHE").length;
    const teachersCount = materials.filter((m: any) => m.scope === "TEACHER").length;
    const pdfs = materials.filter((m: any) => m.type === "PDF").length;
    const videos = materials.filter((m: any) => m.type === "VIDEO").length;
    return { total, detache, teachersCount, pdfs, videos };
  }, [materials]);

  const filteredMaterials = useMemo(() => {
    return materials.filter((m: any) => {
      // Scope Filter
      if (activeScope !== "ALL" && m.scope !== activeScope) return false;

      // Specific Teacher Filter
      if (teacherFilter !== "ALL" && String(m.teacher?.id) !== String(teacherFilter)) return false;

      // Type Filter
      if (typeFilter !== "ALL" && m.type !== typeFilter) return false;

      // Instrument Filter
      if (instrumentFilter !== "ALL" && String(m.instrument?.id) !== String(instrumentFilter)) return false;

      // Search Query
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchTitle = (m.title || "").toLowerCase().includes(query);
        const matchDesc = (m.description || "").toLowerCase().includes(query);
        const matchTeacher = (m.teacher?.name || "").toLowerCase().includes(query);
        const matchInstrument = (m.instrument?.name || "").toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchTeacher && !matchInstrument) return false;
      }

      return true;
    });
  }, [materials, activeScope, teacherFilter, typeFilter, instrumentFilter, searchTerm]);

  return (
    <div className="p-8 lg:p-12 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
            <BookOpen className="h-3.5 w-3.5" /> Repositorio Académico
          </div>
          <h1 className="text-3xl font-bold font-serif tracking-tight text-slate-900">Gestión de Materiales</h1>
          <p className="text-slate-500 italic text-sm">
            Administra la biblioteca oficial Détaché y visualiza los recursos subidos por los docentes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => openNewModal("DETACHE")}
            className="bg-primary hover:bg-primary/90 text-white shadow-lg h-12 px-6 font-bold uppercase tracking-[0.1em] rounded-2xl cursor-pointer gap-2"
          >
            <ShieldCheck className="h-4 w-4" /> Subir Oficial Détaché
          </Button>
          <Button 
            onClick={() => openNewModal("TEACHER")}
            variant="outline"
            className="border-slate-200 hover:bg-slate-50 text-slate-700 h-12 px-6 font-bold uppercase tracking-[0.1em] rounded-2xl cursor-pointer gap-2"
          >
            <UserCheck className="h-4 w-4 text-indigo-600" /> Asignar a Profesor
          </Button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-[2rem] border-slate-100 p-6 bg-white shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Materiales</p>
          <p className="text-3xl font-black font-serif text-slate-900 mt-2">{stats.total}</p>
          <p className="text-xs text-slate-400 mt-1">Biblioteca global activa</p>
        </Card>

        <Card className="rounded-[2rem] border-emerald-100 p-6 bg-emerald-50/40 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-800">Oficiales Détaché</p>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black font-serif text-emerald-950 mt-2">{stats.detache}</p>
          <p className="text-xs text-emerald-700/80 mt-1">Disponibles para toda la academia</p>
        </Card>

        <Card className="rounded-[2rem] border-indigo-100 p-6 bg-indigo-50/40 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-800">Material de Docentes</p>
            <UserCheck className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-3xl font-black font-serif text-indigo-950 mt-2">{stats.teachersCount}</p>
          <p className="text-xs text-indigo-700/80 mt-1">Subidos por profesores</p>
        </Card>

        <Card className="rounded-[2rem] border-slate-100 p-6 bg-white shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Formatos Principales</p>
          <p className="text-xl font-bold font-serif text-slate-900 mt-2">
            📄 {stats.pdfs} PDFs <span className="text-slate-300 font-sans text-sm">•</span> 🎥 {stats.videos} Videos
          </p>
          <p className="text-xs text-slate-400 mt-1">Archivos y tutoriales</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-4">
        {/* Scope Tabs */}
        <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-100">
          {[
            { id: "ALL", label: "Todos los Materiales", icon: Layers, count: stats.total },
            { id: "DETACHE", label: "🏛️ Oficial Détaché", icon: ShieldCheck, count: stats.detache },
            { id: "TEACHER", label: "🎻 Material de Profesores", icon: UserCheck, count: stats.teachersCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveScope(tab.id as ScopeFilter)}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeScope === tab.id
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${activeScope === tab.id ? "bg-white/20 text-white" : "bg-white text-slate-500 border border-slate-200"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Secondary Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por título, descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 h-11 bg-slate-50 rounded-2xl text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-slate-200/50"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={teacherFilter}
              onChange={(e) => setTeacherFilter(e.target.value)}
              className="w-full h-11 bg-slate-50 rounded-2xl px-3 text-xs font-bold text-slate-700 outline-none border border-slate-200/50 cursor-pointer"
            >
              <option value="ALL">👤 Todos los Docentes</option>
              {teachers.map((t: any) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={instrumentFilter}
              onChange={(e) => setInstrumentFilter(e.target.value)}
              className="w-full h-11 bg-slate-50 rounded-2xl px-3 text-xs font-bold text-slate-700 outline-none border border-slate-200/50 cursor-pointer"
            >
              <option value="ALL">🎹 Todos los Instrumentos</option>
              {instruments.map((inst: any) => (
                <option key={inst.id} value={inst.id}>{inst.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full h-11 bg-slate-50 rounded-2xl px-3 text-xs font-bold text-slate-700 outline-none border border-slate-200/50 cursor-pointer"
            >
              <option value="ALL">📁 Formatos</option>
              <option value="PDF">📄 PDF</option>
              <option value="VIDEO">🎥 Video</option>
              <option value="AUDIO">🎧 Audio</option>
              <option value="LINK">🔗 Link</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Materials */}
      {materialsLoading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-slate-400 text-xs italic">Cargando biblioteca de materiales...</p>
        </div>
      ) : filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((m: any) => {
            const isDetacheOfficial = m.scope === "DETACHE";

            return (
              <Card 
                key={m.id} 
                className="bg-white border-slate-100 shadow-sm hover:shadow-md transition-all rounded-[2rem] overflow-hidden flex flex-col justify-between group"
              >
                <CardContent className="p-6 space-y-4">
                  {/* Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                      {getTypeIcon(m.type)}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {isDetacheOfficial ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200/60 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-xl flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" /> Oficial Détaché
                        </Badge>
                      ) : (
                        <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200/60 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-xl flex items-center gap-1">
                          <UserCheck className="h-3 w-3" /> Docente: {m.teacher?.name?.split(' ')[0]}
                        </Badge>
                      )}
                      {m.instrument && (
                        <span className="text-[10px] font-bold text-slate-400">
                          {m.instrument.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-primary transition-colors leading-snug">
                      {m.title}
                    </h3>
                    {m.description ? (
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                        {m.description}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Sin descripción adicional.</p>
                    )}
                  </div>

                  {/* Meta Tags */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-50 text-[11px] text-slate-400">
                    <span>{m.level || "Todos los niveles"}</span>
                    <span>{isDetacheOfficial ? "🏛️ Academia Détaché" : `👤 ${m.teacher?.name || "Profesor"}`}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2">
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Abrir
                      </a>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopyLink(m)}
                        className="h-10 w-10 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer shrink-0"
                        title="Copiar enlace"
                      >
                        {copiedId === m.id ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                      </Button>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEditModal(m)}
                        className="h-10 w-10 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer shrink-0"
                        title="Editar"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        variant="outline"
                        size="icon"
                        disabled={isDeleting}
                        onClick={() => handleDelete(m)}
                        className="h-10 w-10 rounded-xl border-rose-100 hover:bg-rose-50 text-rose-500 hover:text-rose-700 cursor-pointer shrink-0"
                        title="Eliminar"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {!isDetacheOfficial && (
                      <Button
                        variant="ghost"
                        onClick={() => handleConvertToDetache(m)}
                        className="w-full h-8 text-[10px] font-bold uppercase tracking-wider text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 border border-dashed border-emerald-200"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Convertir a Oficial Détaché
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200 text-center space-y-4 max-w-xl mx-auto">
          <BookOpen className="h-12 w-12 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <h4 className="font-bold text-slate-700 text-base">No se encontraron materiales</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No hay materiales registrados que coincidan con los filtros seleccionados.
            </p>
          </div>
          <Button onClick={() => openNewModal("DETACHE")} className="bg-primary text-white rounded-xl text-xs font-bold uppercase h-10 px-6">
            Crear Primer Material
          </Button>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <Card className="w-full max-w-xl bg-white border-none shadow-2xl rounded-[2.5rem] my-auto max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-8 pt-7 pb-5 flex justify-between items-center border-b border-slate-100 shrink-0 bg-white">
              <div>
                <h3 className="text-2xl font-bold font-serif text-slate-900">
                  {editingMaterial ? "Editar Material" : "Nuevo Recurso de Estudio"}
                </h3>
                <p className="text-slate-400 text-xs italic">
                  Configura los detalles del recurso pedagógico.
                </p>
              </div>
              <button 
                onClick={closeModal} 
                className="p-2.5 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-5 overflow-y-auto flex-1">
              {/* Scope Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tipo de Ámbito / Visibilidad *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, scope: "DETACHE", teacherId: "" })}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      formData.scope === "DETACHE"
                        ? "bg-emerald-50/70 border-emerald-400 text-emerald-950 ring-1 ring-emerald-400"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <p className="text-xs font-bold flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" /> Oficial Détaché
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">Disponible para todos los profesores y alumnos.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, scope: "TEACHER" })}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      formData.scope === "TEACHER"
                        ? "bg-indigo-50/70 border-indigo-400 text-indigo-950 ring-1 ring-indigo-400"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <p className="text-xs font-bold flex items-center gap-1.5">
                      <UserCheck className="h-4 w-4 text-indigo-600" /> Material de Profesor
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">Propio del docente seleccionado.</p>
                  </button>
                </div>
              </div>

              {formData.scope === "TEACHER" && (
                <div className="space-y-2 animate-in fade-in duration-200">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Profesor Asignado *</label>
                  <select
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    className="w-full h-12 bg-slate-50 rounded-2xl px-4 text-xs font-bold text-slate-700 outline-none border border-slate-200/60 cursor-pointer"
                  >
                    <option value="">Selecciona un profesor...</option>
                    {teachers.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Título del Material *</label>
                <input
                  type="text"
                  placeholder="Ej: Escalas Mayores y Menores con Digitación"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full h-12 bg-slate-50 rounded-2xl px-4 outline-none focus:ring-2 focus:ring-primary/20 text-xs font-medium border border-slate-200/60"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tipo de Formato *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full h-12 bg-slate-50 rounded-2xl px-4 text-xs font-bold text-slate-700 outline-none border border-slate-200/60 cursor-pointer"
                  >
                    <option value="PDF">📄 PDF / Documento</option>
                    <option value="VIDEO">🎥 Video YouTube / Tutorial</option>
                    <option value="AUDIO">🎧 Audio / Pista</option>
                    <option value="LINK">🔗 Enlace Web</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Instrumento</label>
                  <select
                    value={formData.instrumentId}
                    onChange={(e) => setFormData({ ...formData, instrumentId: e.target.value })}
                    className="w-full h-12 bg-slate-50 rounded-2xl px-4 text-xs font-bold text-slate-700 outline-none border border-slate-200/60 cursor-pointer"
                  >
                    <option value="">General / Todos</option>
                    {instruments.map((inst: any) => (
                      <option key={inst.id} value={inst.id}>{inst.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subir Archivo Local al Servidor */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border-2 border-dashed border-slate-200 hover:border-primary/40 transition-colors text-center space-y-2.5">
                <div className="flex flex-col items-center justify-center gap-1">
                  <UploadCloud className="h-6 w-6 text-slate-400" />
                  <p className="text-xs font-bold text-slate-800">Subir Archivo desde tu Dispositivo (PDF, Audio, etc.)</p>
                  <p className="text-[10px] text-slate-400">El archivo se guardará de forma segura en el servidor de la academia</p>
                </div>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer shadow-xs transition-all">
                  {isUploadingFile ? <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> : <Paperclip className="h-3.5 w-3.5 text-slate-500" />}
                  <span>{isUploadingFile ? "Subiendo archivo al servidor..." : "📁 Seleccionar Archivo PDF o Audio"}</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.mp3,.wav,.ogg,.mp4,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    disabled={isUploadingFile}
                    className="hidden"
                  />
                </label>
                {uploadedFileName && (
                  <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 py-1.5 px-3 rounded-xl w-fit mx-auto border border-emerald-200/50">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Archivo subido: {uploadedFileName}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Enlace / URL del Recurso *</label>
                  <span className="text-[10px] text-slate-400 italic">O pega un enlace externo (Drive, YouTube...)</span>
                </div>
                <input
                  type="url"
                  placeholder="https://drive.google.com/... o se autocompletará al subir un archivo"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full h-12 bg-slate-50 rounded-2xl px-4 outline-none focus:ring-2 focus:ring-primary/20 text-xs font-mono font-medium border border-slate-200/60"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nivel</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full h-12 bg-slate-50 rounded-2xl px-4 text-xs font-bold text-slate-700 outline-none border border-slate-200/60 cursor-pointer"
                >
                  <option value="Todos los niveles">Todos los niveles</option>
                  <option value="Iniciación / Infantil">Iniciación / Infantil</option>
                  <option value="Principiante">Principiante</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Avanzado">Avanzado</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Descripción / Indicaciones</label>
                <textarea
                  rows={3}
                  placeholder="Describe el contenido del recurso..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-primary/20 text-xs font-medium border border-slate-200/60"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/80 flex gap-4 shrink-0">
              <Button variant="ghost" className="flex-1 h-12 rounded-2xl font-bold uppercase text-[10px] tracking-widest cursor-pointer" onClick={closeModal}>
                Cancelar
              </Button>
              <Button 
                disabled={!formData.title.trim() || !formData.url.trim() || isCreating || isUpdating} 
                className="flex-1 h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest shadow-xl shadow-slate-900/20 cursor-pointer" 
                onClick={handleSubmit}
              >
                {isCreating || isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingMaterial ? "Guardar Cambios" : "Guardar Recurso")}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
