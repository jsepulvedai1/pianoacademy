"use client";

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

// Fallback for Annual or other values
const DEFAULT_ANNUAL_BENEFITS = [
  "Clases individuales",
  "Acceso a material digital",
  "Comunidad Detaché",
  "Incluye 3 libros pedagógicos"
];

export function PlansSection() {
  const { data, loading } = useQuery<GetPlansData>(GET_PLANS);

  const plans = data?.allPlans || [];

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-[1320px] mx-auto">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[420px] bg-white/40 animate-pulse rounded-3xl" />
        ))}
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

  // Sort plans by price or classes count so they appear in order
  const sortedPlans = [...plans].sort((a, b) => parseInt(a.price) - parseInt(b.price));

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-[1320px] mx-auto items-stretch">
      {sortedPlans.map((plan: Plan) => {
        const isFeatured = plan.isFeatured;

        // Get benefits (either from DB or matching fallback)
        const dbBenefits = safeArray(plan.benefits);
        const benefits = dbBenefits.length > 0
          ? dbBenefits
          : (DEFAULT_BENEFITS[plan.classesCount] || DEFAULT_ANNUAL_BENEFITS);

        return (
          <div
            key={plan.id}
            className={`flex flex-col bg-white text-slate-900 rounded-[2.5rem] p-8 md:p-10 transition-all duration-300 relative group shadow-[0_15px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] hover:scale-[1.02] ${isFeatured ? "border-[3.5px] border-[#9B51E0]" : "border border-slate-100"
              }`}
          >
            {isFeatured && (
              <>
                {/* Hand-drawn rays/strokes above top-right border */}
                <svg className="absolute -top-4 -right-2 w-10 h-10 text-[#9B51E0] rotate-[15deg]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="6" y1="18" x2="2" y2="8" />
                  <line x1="12" y1="16" x2="16" y2="4" />
                  <line x1="16" y1="18" x2="24" y2="12" />
                </svg>
              </>
            )}

            <div className="mb-6">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                  {plan.name}
                </h3>
                {isFeatured && (
                  <span className="bg-[#DFB012] text-slate-900 text-[10px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider shrink-0">
                    Recomendado
                  </span>
                )}
              </div>

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
                  {/* Pink Circle Checkmark SVG */}
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
              className="self-start h-10 px-5 font-bold uppercase tracking-wider text-[10px] rounded-full border-[#E25CBB] text-[#E25CBB] hover:bg-[#E25CBB] hover:text-white transition-all shadow-sm flex items-center gap-2"
            >
              <Link href={`/contact?service=${plan.name.toUpperCase().replace(/ /g, "_")}`}>
                Empezar Hoy
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="8" r="7" />
                  <path d="M6 8h4M8 6l2 2-2 2" />
                </svg>
              </Link>
            </Button>
          </div>
        );
      })}
    </div>
  );
}

