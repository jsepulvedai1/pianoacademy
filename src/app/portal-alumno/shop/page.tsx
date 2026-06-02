"use client";

import React from "react";
import { GraduationCap, Check, ArrowRight, Music, Heart, BookOpen, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@apollo/client/react/index.js";
import { GET_PLANS } from "@/graphql/queries/get-plans";
import { GetPlansData, Plan } from "@/types/graphql";

export default function StudentShopPage() {
  const { data, loading, error } = useQuery<GetPlansData>(GET_PLANS);

  const formatCLP = (n: number) => `$${Math.round(n).toLocaleString('es-CL')}`;

  const getBenefits = (count: number) => {
    if (count <= 4) return ["4 Clases individuales", "Material de estudio digital", "Seguimiento semanal"];
    if (count <= 8) return ["8 Clases individuales", "Acceso a Masterclasses", "Prioridad en agenda", "Grabación de avances"];
    return ["12 Clases individuales", "Enfoque profesional", "Certificación de nivel", "Soporte académico 24/7", "Masterclasses ilimitadas"];
  };

  const getSubtitle = (count: number) => {
    if (count <= 4) return "Continuidad básica";
    if (count <= 8) return "Progreso acelerado";
    return "Enfoque profesional";
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm font-medium text-slate-400 italic">Cargando planes académicos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4 text-center p-8">
        <div className="h-16 w-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
           <Heart className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold font-serif text-slate-900">Algo no salió bien</h2>
        <p className="text-slate-500 max-w-xs mx-auto text-sm italic">No pudimos cargar los planes en este momento. Por favor, intenta de nuevo más tarde.</p>
      </div>
    );
  }

  const plans = data?.allPlans || [];

  return (
    <div className="p-8 lg:p-12 space-y-12 animate-in fade-in duration-700 max-w-7xl mx-auto">
      <header className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-500 font-bold text-[10px] uppercase tracking-widest mb-2">
          <BookOpen className="h-3 w-3" /> Continuidad Académica
        </div>
        <h1 className="text-4xl font-bold font-serif tracking-tight text-slate-900">Tu Próximo Paso</h1>
        <p className="text-slate-500 italic">Mantén el ritmo de tu aprendizaje. Elige el plan que mejor se adapte a tu disponibilidad para seguir creciendo en la música.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
        {plans.map((plan: Plan) => (
          <Card key={plan.id} className={`rounded-[3rem] border-none shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-1 flex flex-col relative overflow-hidden ${
            plan.isFeatured ? 'bg-white ring-2 ring-primary/20 scale-105 z-10 shadow-lg' : 'bg-white border border-slate-100'
          }`}>
            
            <CardContent className="p-10 flex-1 flex flex-col">
              <div className="mb-8">
                {plan.isFeatured && (
                  <Badge className="mb-4 px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-widest border-none bg-primary text-white">
                    Sugerido para ti
                  </Badge>
                )}
                {!plan.isFeatured && (
                   <Badge className="mb-4 px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-widest border-none bg-slate-100 text-slate-500">
                     {plan.classesCount} Clases
                   </Badge>
                )}
                <h3 className="text-2xl font-bold font-serif mb-1">{plan.name}</h3>
                <p className="text-xs text-slate-400 font-medium mb-4 italic">{getSubtitle(plan.classesCount)}</p>
                <div className="flex items-baseline gap-1">
                   <span className="text-3xl font-black font-serif text-slate-900">{formatCLP(parseFloat(plan.price))}</span>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">/ {plan.duration === 1 ? 'mes' : `${plan.duration} meses`}</span>
                </div>
              </div>

              <div className="space-y-4 mb-10 flex-1">
                {getBenefits(plan.classesCount).map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </div>
                    <span className="text-xs font-medium text-slate-600">{benefit}</span>
                  </div>
                ))}
              </div>

              <Button className={`w-full rounded-2xl py-6 font-bold uppercase text-[10px] tracking-[0.15em] transition-all ${
                plan.isFeatured 
                  ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20' 
                  : 'bg-slate-900 hover:bg-slate-800 text-white shadow-none'
              }`}>
                Seleccionar Plan <ArrowRight className="h-3 w-3 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Philosophy section */}
      <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
            <Music className="h-64 w-64" />
         </div>
         <div className="relative z-10 max-w-2xl">
            <h3 className="text-2xl font-bold font-serif mb-4 flex items-center gap-3">
               <Heart className="h-6 w-6 text-primary" /> El valor de la constancia
            </h3>
            <p className="text-slate-400 leading-relaxed italic text-sm">
               "En Détaché, creemos que el aprendizaje musical es un viaje de largo aliento. Nuestros planes de continuidad están diseñados para asegurar que cada nota que toques hoy se convierta en la base de tu maestría de mañana."
            </p>
         </div>
      </div>
    </div>
  );
}
