"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@apollo/client/react/index.js";
import { GET_PLANS } from "@/graphql/queries/get-plans";
import { Button } from "@/components/ui/button";
import { GetPlansData, Plan } from "@/types/graphql";
import { safeArray } from "@/lib/utils";

// Fallback benefits if none are set in the database yet
const DEFAULT_BENEFITS: Record<number, string[]> = {
  4: [
    "Clases Individuales",
    "Acceso a material digital",
    "Comunidad Detaché",
    "Introducción a la lectoescritura musical"
  ],
  8: [
    "Clases Individuales",
    "Acceso a material digital",
    "Comunidad Detaché",
    "Seguimiento de repertorio"
  ],
  12: [
    "Clases individuales",
    "Acceso a material digital",
    "Comunidad Detaché",
    "Incluye 1 libro pedagógico"
  ],
  24: [
    "Clases individuales",
    "Acceso a material digital",
    "Comunidad Detaché",
    "Incluye 2 libros pedagógicos"
  ]
};

const DEFAULT_ANNUAL_BENEFITS = [
  "Clases individuales",
  "Acceso a material digital",
  "Comunidad Detaché",
  "Incluye 3 libros pedagógicos"
];

interface CategoryMeta {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  tagline: string;
  badgeBg: string;
}

const CATEGORIES: Record<string, CategoryMeta> = {
  INDIVIDUAL_REGULAR: {
    id: "INDIVIDUAL_REGULAR",
    title: "Planes Individuales Regulares",
    subtitle: "Clases 1 a 1 totalmente personalizadas y adaptadas a tu nivel, objetivos y estilo musical.",
    icon: "🎻",
    tagline: "Formación Personalizada",
    badgeBg: "bg-purple-100 text-[#8E44AD]"
  },
  INDIVIDUAL_PREFERENTIAL: {
    id: "INDIVIDUAL_PREFERENTIAL",
    title: "Horario Preferencial (10:00 a 13:00 hrs)",
    subtitle: "Tarifas preferenciales especiales para clases individuales dictadas en jornada de mañana entre 10:00 y 13:00 hrs.",
    icon: "☀️",
    tagline: "Tarifa Preferencial Matutina",
    badgeBg: "bg-amber-100 text-amber-800"
  },
  GROUP: {
    id: "GROUP",
    title: "Planes de Clases Grupales",
    subtitle: "Aprende en grupos reducidos, interactúa con compañeros y disfruta de la música en ensamble.",
    icon: "👥",
    tagline: "Ensamble y Comunidad",
    badgeBg: "bg-emerald-100 text-emerald-800"
  }
};

export function PlansSection() {
  const { data, loading } = useQuery<GetPlansData>(GET_PLANS);
  const [activeTab, setActiveTab] = useState<string>("INDIVIDUAL_REGULAR");

  const plans = data?.allPlans || [];

  // Group plans by category
  const groupedPlans = useMemo(() => {
    const groups: Record<string, Plan[]> = {
      INDIVIDUAL_REGULAR: [],
      INDIVIDUAL_PREFERENTIAL: [],
      GROUP: []
    };

    plans.forEach((plan: Plan) => {
      const cat = plan.category || "INDIVIDUAL_REGULAR";
      if (groups[cat]) {
        groups[cat].push(plan);
      } else {
        // Fallback for any unknown category
        groups.INDIVIDUAL_REGULAR.push(plan);
      }
    });

    // Sort plans by price inside each group
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => parseInt(a.price) - parseInt(b.price));
    });

    return groups;
  }, [plans]);

  if (loading) {
    return (
      <div className="space-y-8 max-w-[1320px] mx-auto">
        <div className="flex justify-center gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 w-44 bg-white/40 animate-pulse rounded-full" />
          ))}
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[420px] bg-white/40 animate-pulse rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-10 text-slate-800 italic font-medium">
        Nuevos planes próximamente...
      </div>
    );
  }

  const renderPlanCard = (plan: Plan) => {
    const isFeatured = plan.isFeatured;
    const dbBenefits = safeArray(plan.benefits);
    const benefits = dbBenefits.length > 0
      ? dbBenefits
      : (DEFAULT_BENEFITS[plan.classesCount] || DEFAULT_ANNUAL_BENEFITS);

    const isPreferential = plan.category === "INDIVIDUAL_PREFERENTIAL";

    return (
      <div
        key={plan.id}
        className={`flex flex-col bg-white text-slate-900 rounded-[2.5rem] p-8 md:p-10 transition-all duration-300 relative group shadow-[0_15px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] hover:scale-[1.02] ${
          isFeatured ? "border-[3.5px] border-[#9B51E0]" : "border border-slate-100"
        }`}
      >
        {isFeatured && (
          <svg className="absolute -top-4 -right-2 w-10 h-10 text-[#9B51E0] rotate-[15deg]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="6" y1="18" x2="2" y2="8" />
            <line x1="12" y1="16" x2="16" y2="4" />
            <line x1="16" y1="18" x2="24" y2="12" />
          </svg>
        )}

        <div className="mb-6">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">
              {plan.name}
            </h3>
            {isFeatured && (
              <span className="bg-[#DFB012] text-slate-900 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shrink-0">
                Recomendado
              </span>
            )}
          </div>

          {isPreferential && (
            <div className="mb-3">
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200/60">
                ☀️ 10:00 a 13:00 hrs
              </span>
            </div>
          )}

          <div className="flex items-baseline gap-1 mt-3">
            <span className="text-2xl md:text-5xl font-extrabold text-slate-900 font-sans tracking-tight">
              ${parseInt(plan.price).toLocaleString("es-CL")}
            </span>
            <span className="text-slate-500 text-xs font-semibold">/ total</span>
          </div>

          <p className="text-slate-500 text-xs mt-3 font-medium leading-relaxed">
            {plan.classesCount} clases para usar en {plan.duration} {plan.duration === 1 ? "mes" : "meses"}.
          </p>
        </div>

        <ul className="space-y-4 mb-8 flex-1 text-sm">
          {benefits.map((benefit, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-slate-700 leading-snug">
              <svg className="w-5 h-5 text-[#E25CBB] shrink-0 mt-0.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="10" cy="10" r="8" />
                <path d="M7 10l2 2 4-4" />
              </svg>
              <span className="font-medium text-slate-600">{benefit}</span>
            </li>
          ))}
        </ul>

        <Button
          asChild
          variant="outline"
          className="self-start h-10 px-5 font-bold uppercase tracking-wider text-[10px] rounded-full border-[#E25CBB] text-[#E25CBB] hover:bg-[#E25CBB] hover:text-white transition-all shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <Link href={`/checkout?plan=${plan.id}`}>
            Empezar Hoy
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="8" r="7" />
              <path d="M6 8h4M8 6l2 2-2 2" />
            </svg>
          </Link>
        </Button>
      </div>
    );
  };

  const currentCategory = CATEGORIES[activeTab] || CATEGORIES.INDIVIDUAL_REGULAR;
  const currentPlans = activeTab === "ALL" ? plans : (groupedPlans[activeTab] || []);

  return (
    <div className="space-y-10 max-w-[1320px] mx-auto">
      {/* Category Tabs Switcher */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        <button
          onClick={() => setActiveTab("INDIVIDUAL_REGULAR")}
          className={`px-5 py-3 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "INDIVIDUAL_REGULAR"
              ? "bg-[#9B51E0] text-white shadow-lg shadow-[#9B51E0]/25 scale-105"
              : "bg-white/80 hover:bg-white text-slate-700 border border-slate-200/80 shadow-sm"
          }`}
        >
          <span>🎻</span>
          <span>Individuales Regulares</span>
          <span className="text-[10px] opacity-75 font-mono">({groupedPlans.INDIVIDUAL_REGULAR.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("INDIVIDUAL_PREFERENTIAL")}
          className={`px-5 py-3 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "INDIVIDUAL_PREFERENTIAL"
              ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25 scale-105"
              : "bg-white/80 hover:bg-white text-slate-700 border border-slate-200/80 shadow-sm"
          }`}
        >
          <span>☀️</span>
          <span>Horario Preferencial (10:00 - 13:00)</span>
          <span className="text-[10px] opacity-75 font-mono">({groupedPlans.INDIVIDUAL_PREFERENTIAL.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("GROUP")}
          className={`px-5 py-3 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "GROUP"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 scale-105"
              : "bg-white/80 hover:bg-white text-slate-700 border border-slate-200/80 shadow-sm"
          }`}
        >
          <span>👥</span>
          <span>Clases Grupales</span>
          <span className="text-[10px] opacity-75 font-mono">({groupedPlans.GROUP.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("ALL")}
          className={`px-4 py-3 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "ALL"
              ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105"
              : "bg-white/60 hover:bg-white text-slate-600 border border-slate-200/80 shadow-sm"
          }`}
        >
          Ver Todas las Secciones
        </button>
      </div>

      {/* When a single category is active */}
      {activeTab !== "ALL" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="text-center max-w-2xl mx-auto space-y-2 px-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase shadow-xs">
              <span className={`px-2.5 py-0.5 rounded-full ${currentCategory.badgeBg}`}>
                {currentCategory.icon} {currentCategory.tagline}
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold font-sans text-slate-900">
              {currentCategory.title}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {currentCategory.subtitle}
            </p>
          </div>

          {currentPlans.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-[1320px] mx-auto items-stretch">
              {currentPlans.map((plan) => renderPlanCard(plan))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-slate-200">
              <p className="text-slate-500 font-medium text-sm">
                No hay planes registrados en esta sección en este momento.
              </p>
            </div>
          )}
        </div>
      )}

      {/* When ALL categories are displayed together */}
      {activeTab === "ALL" && (
        <div className="space-y-14 animate-in fade-in duration-300">
          {Object.entries(CATEGORIES).map(([catKey, meta]) => {
            const list = groupedPlans[catKey] || [];
            if (list.length === 0) return null;

            return (
              <div key={catKey} className="space-y-6 pt-2">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-slate-200/60 pb-4">
                  <div>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md inline-block mb-1.5 ${meta.badgeBg}`}>
                      {meta.icon} {meta.tagline}
                    </span>
                    <h3 className="text-2xl font-bold font-sans text-slate-900">
                      {meta.title}
                    </h3>
                    <p className="text-slate-600 text-xs md:text-sm mt-1 max-w-xl">
                      {meta.subtitle}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-400 font-mono self-start md:self-auto">
                    {list.length} opciones disponibles
                  </span>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
                  {list.map((plan) => renderPlanCard(plan))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
