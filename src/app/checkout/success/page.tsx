"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ChevronRight, MessageSquare, Mail, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const status = searchParams.get("status");

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 md:py-24 text-slate-800 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-xl">
        <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] p-10 md:p-12 text-center flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
          
          {/* Header Icon */}
          <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center shadow-inner relative">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 animate-pulse" />
            <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-ping" />
          </div>

          {/* Title & Status */}
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 font-serif tracking-tight">¡Pago Aprobado con Éxito!</h2>
            <p className="text-slate-400 text-xs uppercase tracking-widest font-mono">
              Mercado Pago · Transacción #{paymentId || "Simulada"}
            </p>
          </div>

          <div className="h-px bg-slate-100 w-full" />

          {/* Description */}
          <p className="text-slate-600 leading-relaxed text-sm">
            Muchas gracias por tu registro. El pago de tu matrícula ha sido procesado de forma segura y validado en nuestro sistema de administración.
          </p>

          {/* Next Steps Card */}
          <div className="bg-slate-50 rounded-3xl p-6 text-left w-full space-y-4 border border-slate-100">
            <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-[#70125F]" /> Próximos pasos
            </h4>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 text-[#70125F]">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">Confirmación por correo</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">Recibirás un comprobante de pago digital en tu bandeja de entrada en unos instantes.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 text-emerald-600">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">Contacto de Coordinación</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">Un coordinador de la academia te contactará vía WhatsApp para agendar tus horarios de clase.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="w-full space-y-3">
            <Button asChild className="w-full bg-[#70125F] hover:bg-[#590e4b] text-white rounded-xl h-12 font-bold uppercase tracking-wider text-xs shadow-lg shadow-[#70125F]/20 cursor-pointer">
              <Link href="/">Ir al Sitio Principal</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full text-slate-400 hover:text-slate-600 rounded-xl h-12 font-bold uppercase tracking-wider text-xs">
              <Link href="/book">Reservar Clase de Prueba</Link>
            </Button>
          </div>

        </Card>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#70125F]" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
