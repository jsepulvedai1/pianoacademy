"use client";

import { useState, useMemo } from "react";
import {
  Plus, Search, MoreVertical, CheckCircle2,
  XCircle, Clock, Trash2, Edit2, Package, Tag,
  Zap, Shield, GraduationCap, X, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useQuery, useMutation } from "@apollo/client/react/index.js";
import { GET_PLANS } from "@/graphql/queries/get-plans";
import { CREATE_PLAN, DELETE_PLAN, UPDATE_PLAN } from "@/graphql/mutations/plan-mutations";

export default function AdminPlansMasterPage() {
  const { data, loading, refetch } = useQuery(GET_PLANS);
  const [createPlan, { loading: isCreating }] = useMutation(CREATE_PLAN, {
    onCompleted: () => {
      toast.success("Programa creado con éxito ✅");
      setIsNewOpen(false);
      refetch();
    },
    onError: (err) => toast.error(err.message)
  });

  const [deletePlan] = useMutation(DELETE_PLAN, {
    onCompleted: () => {
      toast.success("Programa eliminado");
      refetch();
    }
  });

  const [updatePlan, { loading: isUpdating }] = useMutation(UPDATE_PLAN, {
    onCompleted: () => {
      toast.success("Programa actualizado ✅");
      setIsNewOpen(false);
      setIsEditing(null);
      refetch();
    },
    onError: (err) => toast.error(err.message)
  });

  const [search, setSearch] = useState('');
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '',
    price: 0,
    duration: 1,
    classesCount: 4,
    isFeatured: false
  });
  const [isEditing, setIsEditing] = useState<string | null>(null);

  const plans = data?.allPlans || [];

  const filtered = useMemo(() => plans.filter((p: any) => 
    p.name.toLowerCase().includes(search.toLowerCase())
  ), [plans, search]);

  const handleCreateOrUpdate = () => {
    if (!newPlan.name || newPlan.price <= 0) return;
    
    if (isEditing) {
      updatePlan({
        variables: {
          id: parseInt(isEditing),
          name: newPlan.name,
          price: parseFloat(newPlan.price.toString()),
          duration: parseInt(newPlan.duration.toString()),
          classesCount: parseInt(newPlan.classesCount.toString()),
          isFeatured: newPlan.isFeatured
        }
      });
    } else {
      createPlan({
        variables: {
          name: newPlan.name,
          price: parseFloat(newPlan.price.toString()),
          duration: parseInt(newPlan.duration.toString()),
          classesCount: parseInt(newPlan.classesCount.toString()),
          isFeatured: newPlan.isFeatured
        }
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este programa?")) {
      deletePlan({ variables: { id: parseInt(id) } });
    }
  };

  const openEdit = (plan: any) => {
    setNewPlan({
      name: plan.name,
      price: parseFloat(plan.price),
      duration: plan.duration,
      classesCount: plan.classesCount,
      isFeatured: plan.isFeatured
    });
    setIsEditing(plan.id);
    setIsNewOpen(true);
  };

  const openNew = () => {
    setNewPlan({
      name: '',
      price: 0,
      duration: 1,
      classesCount: 4,
      isFeatured: false
    });
    setIsEditing(null);
    setIsNewOpen(true);
  };

  const formatCLP = (n: number) => `$${n.toLocaleString('es-CL')}`;

  return (
    <div className="p-8 lg:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
            <Tag className="h-3 w-3" /> Configuración Comercial
          </div>
          <h1 className="text-3xl font-bold font-serif tracking-tight">Programas y Planes</h1>
          <p className="text-slate-500 italic text-sm">Define los packs de clases que se ofrecen a los alumnos.</p>
        </div>
        <Button onClick={openNew} size="lg" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-12 px-8 font-bold uppercase tracking-[0.1em] group rounded-2xl">
          <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" /> Crear Programa
        </Button>
      </header>

      {/* Search */}
      <div className="max-w-md relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
        <input 
          type="text" 
          placeholder="Buscar programa..." 
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center gap-4 text-slate-300 font-serif italic text-lg">
             <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-4" />
             Cargando planes...
          </div>
        ) : filtered.map((plan: any) => (
          <Card 
            key={plan.id} 
            className={`bg-white border rounded-3xl p-8 shadow-sm hover:shadow-md transition-all group ${plan.isFeatured ? 'border-primary ring-1 ring-primary/20' : 'border-slate-100 hover:border-primary/20'}`}
          >
            <div className="relative">
              <div className="flex justify-between items-start mb-6">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${plan.isFeatured ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                  <Zap className="h-6 w-6" />
                </div>
                {plan.isFeatured && (
                  <Badge className="bg-secondary text-black text-[9px] font-black uppercase tracking-widest px-3 py-1 border-none">Recomendado</Badge>
                )}
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => openEdit(plan)}
                    className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-primary transition-colors"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(plan.id)}
                    className="p-2 rounded-full hover:bg-rose-500/20 text-rose-500 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-xl font-bold font-serif mb-1">{plan.name}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {plan.classesCount} Clases · {plan.duration} Meses
              </p>

              <div className="mt-8 flex items-baseline gap-1">
                <span className="text-4xl font-bold font-serif">{formatCLP(parseFloat(plan.price))}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total</span>
              </div>
            </div>
            
            <div className="mt-6 pt-6 flex justify-between items-center border-t border-slate-50">
               <div className="flex items-center gap-2">
                 <Shield className="h-4 w-4 text-primary" />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Validez: {plan.duration} meses</span>
               </div>
               <Badge className="bg-primary/20 text-primary border-none text-[9px] font-bold uppercase tracking-widest px-3 py-1">
                 {Math.round(parseFloat(plan.price) / plan.classesCount).toLocaleString('es-CL')}/clase
               </Badge>
            </div>
          </Card>
        ))}

        {filtered.length === 0 && !loading && (
          <div className="col-span-full py-20 flex flex-col items-center gap-4 text-slate-300">
            <Package className="h-16 w-16 opacity-20" />
            <p className="text-sm italic font-medium">No hay programas creados</p>
          </div>
        )}
      </div>

      {/* Modal Nueva */}
      {isNewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <Card className="w-full max-w-lg bg-white border-none shadow-2xl overflow-hidden rounded-[2.5rem] animate-in zoom-in-95 duration-300">
            <header className="p-8 bg-primary text-white">
              <h3 className="text-2xl font-bold font-serif">{isEditing ? 'Editar Programa' : 'Nuevo Programa'}</h3>
              <p className="text-white/70 italic text-sm mt-1">
                {isEditing ? 'Modifica los detalles del plan seleccionado.' : 'Define un nuevo pack de clases para la academia.'}
              </p>
            </header>
            <CardContent className="p-8 space-y-5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nombre del Programa *</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Pack 12 Clases Piano" 
                    className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                    value={newPlan.name}
                    onChange={e => setNewPlan({...newPlan, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Precio (CLP) *</label>
                    <input 
                      type="number" 
                      placeholder="160000" 
                      className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-mono outline-none focus:ring-2 focus:ring-primary/20"
                      value={newPlan.price || ''}
                      onChange={e => setNewPlan({...newPlan, price: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">N° de Clases *</label>
                    <input 
                      type="number" 
                      placeholder="12" 
                      className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-mono outline-none focus:ring-2 focus:ring-primary/20"
                      value={newPlan.classesCount || ''}
                      onChange={e => setNewPlan({...newPlan, classesCount: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Duración (Meses de validez) *</label>
                    <input 
                      type="number" 
                      placeholder="3" 
                      className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-mono outline-none focus:ring-2 focus:ring-primary/20"
                      value={newPlan.duration || ''}
                      onChange={e => setNewPlan({...newPlan, duration: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                  <input 
                    type="checkbox" 
                    id="isFeatured"
                    className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary"
                    checked={newPlan.isFeatured}
                    onChange={e => setNewPlan({...newPlan, isFeatured: e.target.checked})}
                  />
                  <label htmlFor="isFeatured" className="text-xs font-bold text-slate-600 cursor-pointer">Marcar como plan RECOMENDADO</label>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button variant="outline" className="flex-1 h-12 rounded-2xl" onClick={() => setIsNewOpen(false)}>Cancelar</Button>
                <Button 
                  onClick={handleCreateOrUpdate} 
                  disabled={isCreating || isUpdating || !newPlan.name || newPlan.price <= 0} 
                  className="flex-1 h-12 rounded-2xl bg-slate-900 text-white font-bold uppercase text-[10px] tracking-widest shadow-lg"
                >
                  {(isCreating || isUpdating) ? "Guardando..." : isEditing ? "Actualizar Programa" : "Crear Programa"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
