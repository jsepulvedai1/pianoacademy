"use client";

import { useState } from "react";
import { 
  Warehouse, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Music, 
  Info,
  XCircle,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MOCK_ROOMS = [
  {
    id: "R1",
    name: "Sala de Piano",
    instruments: ["Piano de Cola Steinway", "Metrónomo"],
    status: "AVAILABLE",
    capacity: 2
  },
  {
    id: "R2",
    name: "Cabina de Ensayo A",
    instruments: ["Teclado Eléctrico", "Amplificador"],
    status: "OCCUPIED",
    capacity: 3
  },
  {
    id: "R3",
    name: "Estudio de Ensamble",
    instruments: ["Batería", "Contrabajo", "Atriles"],
    status: "AVAILABLE",
    capacity: 8
  },
  {
    id: "R4",
    name: "Cabina de Canto",
    instruments: ["Micrófono Condensador", "Aislamiento Pro"],
    status: "MAINTENANCE",
    capacity: 1
  }
];

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState(MOCK_ROOMS);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);

  const filteredRooms = rooms.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta sala?")) {
      setRooms(rooms.filter(r => r.id !== id));
    }
  };

  const statusColors: any = {
    AVAILABLE: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    OCCUPIED: "bg-amber-50 text-amber-700 ring-amber-600/20",
    MAINTENANCE: "bg-rose-50 text-rose-700 ring-rose-600/20",
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
        <Button onClick={() => setIsModalOpen(true)} size="lg" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-12 px-8 font-bold uppercase tracking-[0.1em] group rounded-2xl">
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
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none h-11 border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-widest rounded-xl">
            <Filter className="mr-2 h-4 w-4" /> Filtros
          </Button>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredRooms.map((room) => (
          <Card key={room.id} className="border-none shadow-sm hover:shadow-xl transition-all duration-500 group overflow-hidden bg-white rounded-[2rem] relative">
            <div className={`absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-10 -mr-12 -mt-12 transition-colors ${room.status === 'AVAILABLE' ? 'bg-emerald-500' : 'bg-primary'}`}></div>
            
            <CardContent className="p-8 space-y-6">
              <header className="flex justify-between items-start">
                <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-500">
                  <Warehouse className="h-7 w-7" />
                </div>
                <div className="flex gap-1">
                  <Button onClick={() => { setEditingRoom(room); setIsModalOpen(true); }} variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => handleDelete(room.id)} variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </header>

              <div className="space-y-1">
                <h3 className="text-xl font-bold font-serif tracking-tight">{room.name}</h3>
                <Badge variant="secondary" className={`font-bold uppercase text-[8px] tracking-[0.1em] px-2 py-0.5 ring-1 ring-inset ${statusColors[room.status]}`}>
                   {statusLabels[room.status]}
                </Badge>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                   <Music className="h-3 w-3" /> Inventario de Sala
                </p>
                <div className="flex flex-wrap gap-2">
                  {room.instruments.map((ins) => (
                    <Badge key={ins} variant="outline" className="border-slate-100 bg-white text-slate-500 font-bold uppercase text-[9px] tracking-tight px-3 py-1">
                      {ins}
                    </Badge>
                  ))}
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
        ))}
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
                <XCircle className="h-6 w-6" />
              </button>
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Configuración de Espacios</p>
                <h3 className="text-3xl font-bold font-serif whitespace-nowrap">{editingRoom ? 'Editar Sala' : 'Registrar Nueva Sala'}</h3>
                <p className="text-white/60 italic text-sm mt-2">Define las características físicas del aula.</p>
              </div>
            </header>
            
            <CardContent className="p-10 space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Nombre de la Sala</label>
                <input 
                  type="text"
                  placeholder="Ej: Sala de Piano Steinway"
                  className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-700 shadow-sm"
                  defaultValue={editingRoom?.name || ""}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Capacidad Máxima</label>
                  <input 
                    type="number"
                    className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-700 shadow-sm"
                    defaultValue={editingRoom?.capacity || 1}
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Estado Inicial</label>
                  <select className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-700 shadow-sm appearance-none cursor-pointer">
                    <option value="AVAILABLE">Disponible</option>
                    <option value="MAINTENANCE">Mantenimiento</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Instrumentos Proporcionados</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Piano", "Batería", "Atriles", "Amplificador", "Consola", "Mezcladora"].map(ins => (
                    <div key={ins} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                      <div className="h-5 w-5 rounded border border-slate-200 bg-white shadow-sm flex items-center justify-center">
                        <CheckCircle2 className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100" />
                      </div>
                      <span className="text-xs font-bold text-slate-600">{ins}</span>
                    </div>
                  ))}
                </div>
              </div>

              <footer className="flex gap-4 pt-6 border-t border-slate-100 mt-10">
                <Button variant="outline" className="flex-1 h-14 rounded-2xl border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-widest" onClick={() => { setIsModalOpen(false); setEditingRoom(null); }}>Cancelar</Button>
                <Button className="flex-1 h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase text-[10px] tracking-widest shadow-xl shadow-slate-200">
                  {editingRoom ? 'Guardar Cambios' : 'Registrar Sala'}
                </Button>
              </footer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-primary border border-primary/20 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-10 shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-[100px] -ml-32 -mt-32"></div>
         <div className="h-20 w-20 rounded-3xl bg-white shadow-2xl flex items-center justify-center text-primary group-hover:rotate-12 transition-transform duration-500 shrink-0">
          <Info className="h-10 w-10" />
        </div>
        <div className="space-y-2 flex-1 text-center md:text-left text-white">
          <h4 className="font-bold text-xl font-serif">Planificación de Recursos</h4>
          <p className="text-white/80 text-sm italic leading-relaxed max-w-2xl">
            Cada sala registrada se convierte en un nodo de agendamiento. El sistema valida automáticamente la capacidad y el inventario instrumental al momento de asignar una clase en el calendario.
          </p>
        </div>
        <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-widest text-[10px] h-14 px-10 rounded-2xl shadow-xl transition-all hover:-translate-y-1">
          Ver Inventario Total
        </Button>
      </div>
    </div>
  );
}
