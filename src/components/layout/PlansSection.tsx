"use client";

import { useQuery } from "@apollo/client/react/index.js";
import { GET_PLANS } from "@/graphql/queries/get-plans";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PlansSection() {
  const { data, loading } = useQuery(GET_PLANS);

  const plans = data?.allPlans || [];

  if (loading) {
    return (
      <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[400px] bg-slate-100 animate-pulse rounded-3xl" />
        ))}
      </div>
    );
  }

  // Si no hay planes en el backend, podrías mostrar un mensaje o planes por defecto
  if (plans.length === 0) {
    return (
      <div className="text-center py-10 text-slate-500 italic">
        Nuevos planes próximamente...
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto items-stretch">
      {plans.map((plan: any) => {
        const isFeatured = plan.isFeatured;
        return (
          <div 
            key={plan.id} 
            className={`flex flex-col p-8 rounded-3xl border transition-all duration-500 group shadow-sm hover:shadow-xl relative ${
              isFeatured 
                ? 'bg-primary text-white scale-105 z-10 border-primary shadow-2xl shadow-primary/30' 
                : 'bg-white text-slate-900 border-muted/60'
            }`}
          >
            {isFeatured && (
              <div className="absolute top-4 right-4 bg-secondary text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                Recomendado
              </div>
            )}
            
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold font-serif">${parseInt(plan.price).toLocaleString('es-CL')}</span>
                <span className={`${isFeatured ? 'text-white/80' : 'text-muted-foreground'} text-sm`}>/total</span>
              </div>
              <p className={`${isFeatured ? 'text-white/70' : 'text-muted-foreground'} text-sm mt-4 italic`}>
                {plan.classesCount} clases para usar en {plan.duration} meses.
              </p>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-sm">
                <Check className={`w-5 h-5 ${isFeatured ? 'text-secondary' : 'text-primary'}`} /> 
                {plan.classesCount} Clases individuales
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className={`w-5 h-5 ${isFeatured ? 'text-secondary' : 'text-primary'}`} /> 
                Acceso a material digital
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className={`w-5 h-5 ${isFeatured ? 'text-secondary' : 'text-primary'}`} /> 
                Comunidad Détaché
              </li>
              {isFeatured && (
                <li className="flex items-center gap-3 text-sm">
                  <Check className="w-5 h-5 text-secondary" /> Mentoría personalizada
                </li>
              )}
            </ul>

            <Button 
              variant={isFeatured ? "secondary" : "outline"}
              className={`w-full h-12 font-bold uppercase tracking-wider ${
                !isFeatured && 'border-primary text-primary hover:bg-primary/5'
              }`}
            >
              Empezar hoy
            </Button>
          </div>
        );
      })}
    </div>
  );
}
