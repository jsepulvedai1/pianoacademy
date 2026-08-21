"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client/react/index.js";
import { GET_ALL_HOLIDAYS } from "@/graphql/queries/get-holidays";
import { 
  CREATE_HOLIDAY, 
  UPDATE_HOLIDAY, 
  TOGGLE_HOLIDAY, 
  DELETE_HOLIDAY, 
  SEED_DEFAULT_HOLIDAYS 
} from "@/graphql/mutations/holiday-mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Calendar as CalendarIcon, Plus, Search, CheckCircle2, XCircle, 
  Trash2, RefreshCw, Sparkles, Loader2, Edit3, ShieldAlert,
  CalendarDays, ToggleLeft, ToggleRight, Sun, Moon
} from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export default function HolidaysTab() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "ACTIVE" | "INACTIVE" | "CUSTOM">("ALL");

  // Modal States
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<any | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newName, setNewName] = useState("");
  const [newIsActive, setNewIsActive] = useState(true);

  // Queries
  const { data, loading, refetch } = useQuery<any>(GET_ALL_HOLIDAYS, {
    variables: { year: selectedYear },
    fetchPolicy: "network-only"
  });

  // Mutations
  const [createHoliday, { loading: isCreating }] = useMutation<any>(CREATE_HOLIDAY, {
    onCompleted: (res: any) => {
      if (res?.createHoliday?.success) {
        toast.success("Día no laborable guardado ✅");
        setIsNewModalOpen(false);
        setNewDate("");
        setNewName("");
        refetch();
      } else {
        toast.error(res?.createHoliday?.error || "Error al crear feriado");
      }
    },
    onError: (err) => toast.error(err.message)
  });

  const [updateHoliday, { loading: isUpdating }] = useMutation<any>(UPDATE_HOLIDAY, {
    onCompleted: (res: any) => {
      if (res?.updateHoliday?.success) {
        toast.success("Feriado actualizado ✅");
        setEditingHoliday(null);
        refetch();
      } else {
        toast.error(res?.updateHoliday?.error || "Error al actualizar");
      }
    },
    onError: (err) => toast.error(err.message)
  });

  const [toggleHoliday] = useMutation<any>(TOGGLE_HOLIDAY, {
    onCompleted: () => {
      refetch();
    },
    onError: (err) => toast.error(err.message)
  });

  const [deleteHoliday] = useMutation<any>(DELETE_HOLIDAY, {
    onCompleted: () => {
      toast.success("Feriado eliminado");
      refetch();
    },
    onError: (err) => toast.error(err.message)
  });

  const [seedHolidays, { loading: isSeeding }] = useMutation<any>(SEED_DEFAULT_HOLIDAYS, {
    onCompleted: (res: any) => {
      toast.success(`¡Se restauraron los feriados oficiales de Chile! (${res?.seedDefaultHolidays?.count || 0} nuevos) 🇨🇱`);
      refetch();
    },
    onError: (err) => toast.error(err.message)
  });

  const holidays = useMemo(() => data?.allHolidays || [], [data]);

  const stats = useMemo(() => {
    return {
      total: holidays.length,
      active: holidays.filter((h: any) => h.isActive).length,
      inactive: holidays.filter((h: any) => !h.isActive).length,
      custom: holidays.filter((h: any) => h.isCustom).length,
    };
  }, [holidays]);

  const filteredHolidays = useMemo(() => {
    return holidays.filter((h: any) => {
      const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase()) || h.date.includes(searchTerm);
      if (!matchesSearch) return false;

      if (filterType === "ACTIVE") return h.isActive;
      if (filterType === "INACTIVE") return !h.isActive;
      if (filterType === "CUSTOM") return h.isCustom;
      return true;
    });
  }, [holidays, searchTerm, filterType]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newName.trim()) {
      toast.error("Por favor completa la fecha y el nombre del día festivo.");
      return;
    }
    createHoliday({
      variables: {
        date: newDate,
        name: newName.trim(),
        isActive: newIsActive
      }
    });
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHoliday) return;
    updateHoliday({
      variables: {
        id: parseInt(editingHoliday.id),
        name: editingHoliday.name,
        date: editingHoliday.date,
        isActive: editingHoliday.isActive
      }
    });
  };

  const formatDateSpanish = (dateStr: string) => {
    try {
      const parsed = parseISO(dateStr);
      return format(parsed, "EEEE d 'de' MMMM, yyyy", { locale: es });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Top Banner Info */}
      <div className="bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 border border-sky-100 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">🇨🇱</span>
            <h3 className="font-bold font-serif text-slate-900 text-lg">Control de Feriados y Días No Laborables</h3>
          </div>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
            Los feriados con estado <strong className="text-emerald-700 font-semibold">"Activo"</strong> bloquearán automáticamente el agendamiento público en <span className="font-mono text-primary">/book</span> y se resaltarán en el calendario de clases. Si la academia abrirá en un feriado, puedes simplemente <strong className="text-rose-700 font-semibold">desactivarlo</strong> con el interruptor.
          </p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => seedHolidays({ variables: { years: [selectedYear] } })}
            disabled={isSeeding}
            className="rounded-2xl border-sky-200 text-sky-800 hover:bg-sky-100/50 text-xs font-semibold gap-2"
          >
            {isSeeding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Restaurar Feriados 🇨🇱
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setNewDate(`${selectedYear}-01-01`);
              setIsNewModalOpen(true);
            }}
            className="rounded-2xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold gap-2 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Agregar Día Festivo
          </Button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Año Seleccionado</p>
          <div className="flex items-center gap-2">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="font-serif text-2xl font-bold text-slate-900 bg-transparent border-none outline-none cursor-pointer focus:ring-0 p-0"
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </div>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-100/60 rounded-3xl p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-1">Cerrados (Activos)</p>
          <p className="font-serif text-2xl font-bold text-emerald-700">{stats.active}</p>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Abiertos (Inactivos)</p>
          <p className="font-serif text-2xl font-bold text-slate-600">{stats.inactive}</p>
        </div>

        <div className="bg-purple-50/60 border border-purple-100/60 rounded-3xl p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-purple-600 mb-1">Personalizados</p>
          <p className="font-serif text-2xl font-bold text-purple-700">{stats.custom}</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Buscar por nombre o mes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 bg-slate-50 border-none rounded-2xl text-xs h-11"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['ALL', 'ACTIVE', 'INACTIVE', 'CUSTOM'] as const).map((type) => {
            const labels = {
              ALL: `Todos (${holidays.length})`,
              ACTIVE: `Activos (${stats.active})`,
              INACTIVE: `Inactivos (${stats.inactive})`,
              CUSTOM: `Personalizados (${stats.custom})`
            };
            const isSelected = filterType === type;
            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all whitespace-nowrap ${
                  isSelected 
                    ? 'bg-slate-900 text-white shadow-sm' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {labels[type]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Holidays List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs">Cargando feriados de {selectedYear}...</p>
        </div>
      ) : filteredHolidays.length === 0 ? (
        <Card className="border-none shadow-sm rounded-3xl p-12 text-center bg-white">
          <CalendarIcon className="h-12 w-12 text-slate-200 mx-auto mb-3" />
          <h4 className="font-serif font-bold text-slate-700 text-lg">No hay feriados para mostrar</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            No se encontraron días festivos con los filtros actuales en el año {selectedYear}.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button 
              size="sm"
              onClick={() => seedHolidays({ variables: { years: [selectedYear] } })}
              className="rounded-2xl bg-sky-600 hover:bg-sky-700 text-white text-xs"
            >
              Restaurar Feriados Chilenos 🇨🇱
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredHolidays.map((holiday: any) => {
            const isActive = holiday.isActive;
            return (
              <div 
                key={holiday.id}
                className={`flex items-center justify-between p-5 rounded-3xl border transition-all duration-300 ${
                  isActive 
                    ? 'bg-white border-slate-100 shadow-sm hover:shadow-md' 
                    : 'bg-slate-50/60 border-slate-200/60 opacity-60'
                }`}
              >
                <div className="flex items-start gap-4 flex-1 mr-4">
                  <div className={`h-12 w-12 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 font-mono ${
                    isActive ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-500'
                  }`}>
                    <span className="text-[10px] font-bold uppercase leading-none">
                      {parseISO(holiday.date).toLocaleDateString('es-CL', { month: 'short' })}
                    </span>
                    <span className="text-lg font-bold leading-none mt-0.5">
                      {holiday.date.split('-')[2]}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`font-bold text-sm ${isActive ? 'text-slate-900' : 'text-slate-500 line-through'}`}>
                        {holiday.name}
                      </h4>
                      {holiday.isCustom ? (
                        <Badge variant="outline" className="text-[9px] px-2 py-0 border-purple-200 bg-purple-50 text-purple-700 font-bold">
                          Personalizado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] px-2 py-0 border-sky-200 bg-sky-50 text-sky-700 font-bold">
                          Oficial 🇨🇱
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 capitalize">
                      {formatDateSpanish(holiday.date)}
                    </p>
                  </div>
                </div>

                {/* Right action controls */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={() => toggleHoliday({ variables: { id: parseInt(holiday.id), isActive: !isActive } })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all ${
                      isActive 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
                        : 'bg-slate-200/80 text-slate-600 border border-slate-300 hover:bg-slate-300'
                    }`}
                    title={isActive ? "Haga clic para habilitar clases este día" : "Haga clic para cerrar la academia este día"}
                  >
                    {isActive ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Cerrado</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3.5 w-3.5 text-slate-500" />
                        <span>Abierto</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setEditingHoliday(holiday)}
                    className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
                    title="Editar"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>

                  {holiday.isCustom && (
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar el día festivo "${holiday.name}"?`)) {
                          deleteHoliday({ variables: { id: parseInt(holiday.id) } });
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Crear Nuevo Feriado */}
      <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
        <DialogContent className="sm:max-w-[480px] bg-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-bold text-slate-900 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Agregar Día No Laborable
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Registra una fecha especial donde la academia no tendrá clases regulares o agendamientos.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Fecha</label>
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
                className="bg-slate-50 rounded-2xl text-xs h-11"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Nombre / Motivo</label>
              <Input
                placeholder="Ej. Vacaciones de Invierno, Semana Dieciochera, Aniversario..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="bg-slate-50 rounded-2xl text-xs h-11"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-800">Bloquear Agendamiento</p>
                <p className="text-[10px] text-slate-400">Si está activo, nadie podrá agendar clases en este día.</p>
              </div>
              <button
                type="button"
                onClick={() => setNewIsActive(!newIsActive)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  newIsActive ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {newIsActive ? 'Activo (Cerrado)' : 'Inactivo (Abierto)'}
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewModalOpen(false)}
                className="rounded-2xl text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="rounded-2xl bg-primary text-white text-xs font-semibold"
              >
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar Feriado"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Editar Feriado */}
      <Dialog open={Boolean(editingHoliday)} onOpenChange={(open) => !open && setEditingHoliday(null)}>
        <DialogContent className="sm:max-w-[480px] bg-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-bold text-slate-900 flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-primary" />
              Editar Feriado
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Modifica la fecha, nombre o estado de disponibilidad.
            </DialogDescription>
          </DialogHeader>

          {editingHoliday && (
            <form onSubmit={handleUpdateSubmit} className="space-y-4 mt-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Fecha</label>
                <Input
                  type="date"
                  value={editingHoliday.date}
                  onChange={(e) => setEditingHoliday({ ...editingHoliday, date: e.target.value })}
                  required
                  className="bg-slate-50 rounded-2xl text-xs h-11"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nombre / Motivo</label>
                <Input
                  value={editingHoliday.name}
                  onChange={(e) => setEditingHoliday({ ...editingHoliday, name: e.target.value })}
                  required
                  className="bg-slate-50 rounded-2xl text-xs h-11"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-800">Bloquear Agendamiento</p>
                  <p className="text-[10px] text-slate-400">Si está activo, se bloquean las clases este día.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingHoliday({ ...editingHoliday, isActive: !editingHoliday.isActive })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    editingHoliday.isActive ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {editingHoliday.isActive ? 'Activo (Cerrado)' : 'Inactivo (Abierto)'}
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingHoliday(null)}
                  className="rounded-2xl text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="rounded-2xl bg-primary text-white text-xs font-semibold"
                >
                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar Cambios"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
