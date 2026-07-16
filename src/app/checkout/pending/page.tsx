"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, HelpCircle, Loader2 } from "lucide-react";
import Link from "next/link";

function PendingContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 md:py-24 text-slate-800 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-xl">
        <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] p-10 md:p-12 text-center flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
          
          {/* Header Icon */}
          <div className="h-20 w-20 bg-amber-50 rounded-full flex items-center justify-center shadow-inner relative">
            <Clock className="h-10 w-10 text-amber-600 animate-pulse" />
            <div className="absolute inset-0 bg-amber-500/10 rounded-full animate-ping" />
          </div>

          {/* Title & Status */}
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 font-serif tracking-tight">Pago en Proceso</h2>
            <p className="text-slate-400 text-xs uppercase tracking-widest font-mono">
              Mercado Pago · Transacción #{paymentId || "Pendiente"}
            </p>
          </div>

          <div className="h-px bg-slate-100 w-full" />

          {/* Description */}
          <p className="text-slate-600 leading-relaxed text-sm">
            Tu transacción está siendo verificada por Mercado Pago. Esto ocurre comúnmente con transferencias electrónicas o pagos en efectivo fuera de línea.
          </p>

          {/* Info Card */}
          <div className="bg-slate-50 rounded-3xl p-6 text-left w-full space-y-4 border border-slate-100">
            <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-amber-600" /> ¿Qué ocurre ahora?
            </h4>
            
            <p className="text-[11px] text-slate-500 leading-relaxed">
              No es necesario que intentes pagar de nuevo. Tan pronto como tu banco o punto de recaudación confirme la recepción de los fondos, tu inscripción se activará automáticamente y te enviaremos una notificación de bienvenida a tu correo.
            </p>
          </div>

          {/* Actions */}
          <div className="w-full space-y-3">
            <Button asChild className="w-full bg-[#70125F] hover:bg-[#590e4b] text-white rounded-xl h-12 font-bold uppercase tracking-wider text-xs shadow-lg cursor-pointer">
              <Link href="/">Volver a la Página Principal</Link>
            </Button>
          </div>

        </Card>
      </div>
    </div>
  );
}

export default function PendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#70125F]" />
      </div>
    }>
      <PendingContent />
    </Suspense>
  );
}
