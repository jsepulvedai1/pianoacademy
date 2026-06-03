"use client";

import { useState, useMemo } from "react";
import { 
  Warehouse, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Music, 
  Info,
  XCircle,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@apollo/client/react/index.js";
import { gql } from "@apollo/client/core/index.js";
import { GET_ROOMS } from "@/graphql/queries/get-rooms";
import { CREATE_ROOM, UPDATE_ROOM, DELETE_ROOM } from "@/graphql/mutations/room-mutations";
import { toast } from "sonner";

const GET_INSTRUMENTS = gql`
  query GetInstruments {
    allInstruments {
      id
      name
    }
  }
`;

export default function AdminRoomsPage() {
  const { data: roomsData, loading: roomsLoading, refetch } = useQuery<any>(GET_ROOMS, {
    fetchPolicy: "no-cache"
  });
  const { data: instData } = useQuery<any>(GET_INSTRUMENTS);

  const roomsList = roomsData?.allRooms || [];
  const instrumentsList = instData?.allInstruments || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);

  // Form State
  const [form, setForm] = useState({
    name: "",
    capacity: 1,
    status: "AVAILABLE",
    instrumentIds: [] as number[]
  });

  const [createRoom, { loading: isCreating }] = useMutation(CREATE_ROOM, {
    onCompleted: () => {
      toast.success("Sala registrada con éxito ✅");
      setIsModalOpen(false);
      refetch();
    },
    onError: (err) => toast.error(err.message)
  });

  const [updateRoom, { loading: isUpdating }] = useMutation(UPDATE_ROOM, {
    onCompleted: () => {
      toast.success("Sala actualizada con éxito ✅");
      setIsModalOpen(false);
      refetch();
    },
    onError: (err) => toast.error(err.message)
  });

  const [deleteRoom] = useMutation(DELETE_ROOM, {
    onCompleted: () => {
      toast.success("Sala eliminada");
      refetch();
    },
    onError: (err) => toast.error(err.message)
  });

  const filteredRooms = useMemo(() => {
    return roomsList.filter((r: any) => 
      r.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [roomsList, searchTerm]);

  const handleOpenNew = () => {
    setForm({
      name: "",
      capacity: 1,
      status: "AVAILABLE",
      instrumentIds: []
    });
    setEditingRoom(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (room: any) => {
    setForm({
      name: room.name,
      capacity: room.capacity,
      status: room.status || "AVAILABLE",
      instrumentIds: (room.instruments || []).map((ins: any) => parseInt(ins.id, 10))
    });
    setEditingRoom(room);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta sala?")) {
      deleteRoom({ variables: { id: parseInt(id, 10) } });
    }
  };

  const handleSave = () => {
    if (!form.name || form.capacity <= 0) {
      toast.error("Por favor completa los campos requeridos.");
      return;
    }

    const variables = {
      name: form.name,
      capacity: parseInt(form.capacity.toString(), 10),
      status: form.status,
      instrumentIds: form.instrumentIds
    };

    if (editingRoom) {
      updateRoom({
        variables: {
          id: parseInt(editingRoom.id, 10),
          ...variables
        }
      });
    } else {
      createRoom({
        variables
      });
    }
  };

  const toggleInstrument = (instId: number) => {
    if (form.instrumentIds.includes(instId)) {
      setForm({ ...form, instrumentIds: form.instrumentIds.filter(id => id !== instId) });
    } else {
      setForm({ ...form, instrumentIds: [...form.instrumentIds, instId] });
    }
  };

  const statusColors: any = {
    AVAILABLE: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 border-emerald-100",
    OCCUPIED: "bg-amber-50 text-amber-700 ring-amber-600/20 border-amber-100",
    MAINTENANCE: "bg-rose-50 text-rose-700 ring-rose-600/20 border-rose-100",
  };

  const statusLabels: any = {
    AVAILABLE: "Disponible",
    OCCUPIED: "Ocupada",
    MAINTENANCE: "Mantenimiento",
  };

  return (
    <div className="p-8 lg:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
            <Warehouse className="h-3 w-3" /> Infraestructura
          </div>
          <h1 className="text-3xl font-bold font-serif tracking-tight">Gestión de Salas</h1>
          <p className="text-slate-500 italic">Control de espacios físicos e inventario instrumental.</p>
        </div>
        <Button onClick={handleOpenNew} size="lg" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-12 px-8 font-bold uppercase tracking-[0.1em] group rounded-2xl text-white">
          <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" /> Nueva Sala
        </Button>
      </header>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <div className="relative w-full sm:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Buscar por nombre de sala..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm outline-none font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none h-11 border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-widest rounded-xl bg-white">
            <Filter className="mr-2 h-4 w-4" /> Filtros
          </Button>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {roomsLoading ? (
          <div className="col-span-full py-20 flex flex-col items-center gap-4 text-slate-300 font-serif italic text-lg">
             <Loader2 className="animate-spin h-10 w-10 text-primary mb-4" />
             Sincronizando salas...
          </div>
        ) : filteredRooms.map((room: any) => {
          const statusVal = room.status || "AVAILABLE";
          return (
            <Card key={room.id} className="border-none shadow-sm hover:shadow-xl transition-all duration-500 group overflow-hidden bg-white rounded-[2rem] relative">
              <div className={`absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-10 -mr-12 -mt-12 transition-colors ${statusVal === 'AVAILABLE' ? 'bg-emerald-500' : 'bg-primary'}`}></div>
              
              <CardContent className="p-8 space-y-6">
                <header className="flex justify-between items-start">
                  <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-500">
                    <Warehouse className="h-7 w-7" />
                  </div>
                  <div className="flex gap-1">
                    <Button onClick={() => handleOpenEdit(room)} variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => handleDelete(room.id)} variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </header>

                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold font-serif tracking-tight text-slate-800">{room.name}</h3>
                  <Badge variant="outline" className={`font-bold uppercase text-[8px] tracking-[0.1em] px-2.5 py-0.5 border ${statusColors[statusVal]}`}>
                     {statusLabels[statusVal] || statusVal}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                     <Music className="h-3 w-3" /> Inventario de Sala
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {room.instruments && room.instruments.length > 0 ? (
                      room.instruments.map((ins: any) => (
                        <Badge key={ins.id} variant="outline" className="border-slate-100 bg-slate-50/50 text-slate-500 font-bold uppercase text-[9px] tracking-tight px-3 py-1">
                          {ins.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">Sin instrumentos asignados</span>
                    )}
                  </div>
                </div>

                <footer className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Info className="h-3 w-3" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Capacidad: {room.capacity} pers.</span>
                  </div>
                  <Badge className="bg-slate-900 text-white font-mono text-[10px] py-1 px-3 rounded-lg">
                    ID: {room.id}
                  </Badge>
                </footer>
              </CardContent>
            </Card>
          );
        })}

        {filteredRooms.length === 0 && !roomsLoading && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 text-slate-300">
            <Warehouse className="h-16 w-16 opacity-20" />
            <p className="text-sm italic font-medium">No hay salas registradas que coincidan con la búsqueda.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <Card className="w-full max-w-lg bg-white border-none shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 rounded-[2.5rem]">
            <header className="p-10 bg-slate-900 text-white relative">
              <button 
                onClick={() => { setIsModalOpen(false); setEditingRoom(null); }}
                className="absolute top-8 right-8 p-3 rounded-full hover:bg-white/10 transition-colors"
              >
                <XCircle className="h-6 w-6 text-slate-400" />
              </button>
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Configuración de Espacios</p>
                <h3 className="text-3xl font-bold font-serif whitespace-nowrap">{editingRoom ? 'Editar Sala' : 'Registrar Nueva Sala'}</h3>
                <p className="text-white/60 italic text-sm mt-2">Define las características físicas del aula.</p>
              </div>
            </header>
            
            <CardContent className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Nombre de la Sala *</label>
                <input 
                  type="text"
                  placeholder="Ej: Sala de Piano Steinway"
                  className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-700 shadow-sm"
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Capacidad Máxima *</label>
                  <input 
                    type="number"
                    className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-700 shadow-sm"
                    value={form.capacity || ""}
                    onChange={(e) => setForm({...form, capacity: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Estado Inicial</label>
                  <select 
                    className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-700 shadow-sm appearance-none cursor-pointer"
                    value={form.status}
                    onChange={(e) => setForm({...form, status: e.target.value})}
                  >
                    <option value="AVAILABLE">Disponible</option>
                    <option value="OCCUPIED">Ocupada</option>
                    <option value="MAINTENANCE">Mantenimiento</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Instrumentos Proporcionados</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                  {instrumentsList.map((ins: any) => {
                    const insIdInt = parseInt(ins.id, 10);
                    const active = form.instrumentIds.includes(insIdInt);
                    return (
                      <div 
                        key={ins.id} 
                        onClick={() => toggleInstrument(insIdInt)}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                          active ? "bg-white border-primary/30 shadow-sm font-bold text-slate-800" : "bg-white/40 border-slate-100 text-slate-400 hover:border-slate-200"
                        }`}
                      >
                        <div className={`h-4 w-4 rounded flex items-center justify-center border transition-all ${active ? "bg-primary border-primary text-white" : "border-slate-200 bg-white"}`}>
                          {active && <CheckCircle2 className="h-3 w-3" />}
                        </div>
                        <span className="text-xs">{ins.name}</span>
                      </div>
                    );
                  })}
                  {instrumentsList.length === 0 && (
                    <p className="text-xs italic text-slate-400 col-span-full">No hay instrumentos registrados en el sistema.</p>
                  )}
                </div>
              </div>

              <footer className="flex gap-4 pt-6 border-t border-slate-100 mt-10">
                <Button variant="outline" className="flex-1 h-12 rounded-2xl border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-widest bg-white" onClick={() => { setIsModalOpen(false); setEditingRoom(null); }}>Cancelar</Button>
                <Button 
                  disabled={isCreating || isUpdating || !form.name}
                  onClick={handleSave}
                  className="flex-1 h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase text-[10px] tracking-widest shadow-xl"
                >
                  {isCreating || isUpdating ? "Guardando..." : editingRoom ? 'Guardar Cambios' : 'Registrar Sala'}
                </Button>
              </footer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
