"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { XCircle, RefreshCw, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";

function FailureContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 md:py-24 text-slate-800 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-xl">
        <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] p-10 md:p-12 text-center flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
          
          {/* Header Icon */}
          <div className="h-20 w-20 bg-rose-50 rounded-full flex items-center justify-center shadow-inner relative">
            <XCircle className="h-10 w-10 text-rose-600 animate-bounce" />
            <div className="absolute inset-0 bg-rose-500/10 rounded-full animate-ping" />
          </div>

          {/* Title & Status */}
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 font-serif tracking-tight">Pago Rechazado</h2>
            <p className="text-slate-400 text-xs uppercase tracking-widest font-mono">
              Mercado Pago · Intento de Transacción #{paymentId || "Fallida"}
            </p>
          </div>

          <div className="h-px bg-slate-100 w-full" />

          {/* Description */}
          <p className="text-slate-600 leading-relaxed text-sm">
            Lamentablemente, la pasarela de pago no pudo procesar tu transacción. Esto puede ocurrir por fondos insuficientes, límites de tarjeta o rechazo directo del emisor bancario.
          </p>

          {/* Trouble Checklist */}
          <div className="bg-slate-50 rounded-3xl p-6 text-left w-full space-y-4 border border-slate-100">
            <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-600" /> ¿Cómo solucionarlo?
            </h4>
            
            <ul className="list-disc pl-5 text-[11px] text-slate-500 space-y-2 leading-relaxed">
              <li>Verifica que los datos ingresados de tu tarjeta sean correctos.</li>
              <li>Asegúrate de contar con cupo o saldo suficiente para completar el pago.</li>
              <li>Prueba seleccionando otro método de pago (Webpay, Tarjeta de Débito, Transferencia).</li>
              <li>Contacta a tu institución bancaria para verificar si existe un bloqueo de seguridad.</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="w-full space-y-3">
            <Button asChild className="w-full bg-slate-950 hover:bg-slate-800 text-white rounded-xl h-12 font-bold uppercase tracking-wider text-xs shadow-lg cursor-pointer">
              <Link href="/">
                <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" /> Reintentar Pago
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full text-slate-400 hover:text-slate-600 rounded-xl h-12 font-bold uppercase tracking-wider text-xs">
              <Link href="/">Volver a Inicio</Link>
            </Button>
          </div>

        </Card>
      </div>
    </div>
  );
}

export default function FailurePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#70125F]" />
      </div>
    }>
      <FailureContent />
    </Suspense>
  );
}
