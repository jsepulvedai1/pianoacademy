"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react/index.js";
import { GET_PLANS } from "@/graphql/queries/get-plans";
import { CREATE_PAYMENT_PREFERENCE } from "@/graphql/mutations/student-mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Music, CreditCard, Lock, CheckCircle2, ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams.get("plan");

  const { data, loading } = useQuery<any>(GET_PLANS);
  const plans = data?.allPlans || [];
  const plan = plans.find((p: any) => p.id === planId) || plans[0];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "+569",
  });
  
  const [createPreference, { loading: isCreatingPref }] = useMutation(CREATE_PAYMENT_PREFERENCE, {
    onCompleted: (res: any) => {
      if (res.createPaymentPreference?.success && res.createPaymentPreference?.initPoint) {
        // Redirect the user to Mercado Pago checkout
        window.location.href = res.createPaymentPreference.initPoint;
      } else {
        toast.error("No se pudo generar la orden de pago. Por favor intenta de nuevo.");
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Error al conectar con la pasarela de pago.");
    }
  });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith("+569")) value = "+569";
    const suffix = value.slice(4).replace(/\D/g, "").slice(0, 8);
    setFormData({ ...formData, phone: "+569" + suffix });
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.phone.length !== 12 || !formData.email) {
      toast.error("Por favor completa todos los campos obligatorios.");
      return;
    }
    
    createPreference({
      variables: {
        planId: parseInt(plan.id),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        backUrl: window.location.origin
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#70125F] mx-auto" />
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Cargando detalles de compra...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-rose-500 font-bold">Plan no encontrado o no disponible.</p>
          <Button asChild className="bg-primary text-white"><Link href="/">Volver a Inicio</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 md:py-24 text-slate-800">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#70125F] transition-colors font-medium">
            <ChevronLeft className="h-4 w-4" /> Volver a planes
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left: Checkout Form */}
            <div className="md:col-span-7 space-y-6">
              <Card className="border-none shadow-md bg-white rounded-[2rem] p-8">
                <form onSubmit={handlePay} className="space-y-6">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 mb-1">Completa tu Registro</h2>
                    <p className="text-slate-400 text-xs italic">Ingresa los datos del estudiante que tomará las clases.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#70125F]">Nombre Completo</label>
                      <Input
                        required
                        placeholder="Ej: Juan Pérez"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="h-12 bg-slate-50 border-none rounded-xl text-slate-800 focus:ring-2 focus:ring-[#70125F]/20 font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#70125F]">Email de Contacto</label>
                      <Input
                        required
                        type="email"
                        placeholder="ejemplo@correo.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="h-12 bg-slate-50 border-none rounded-xl text-slate-800 focus:ring-2 focus:ring-[#70125F]/20 font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#70125F]">Teléfono Celular</label>
                      <Input
                        required
                        placeholder="+56 9 1234 5678"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        className="h-12 bg-slate-50 border-none rounded-xl text-slate-800 focus:ring-2 focus:ring-[#70125F]/20 font-mono font-medium"
                      />
                    </div>
                  </div>

                  {/* Mercado Pago Section */}
                  <div className="border-t border-slate-100 pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                        <CreditCard className="h-4 w-4 text-[#00A1E4]" /> Pasarela Segura
                      </span>
                      {/* Mercado Pago logo placeholder */}
                      <span className="text-[10px] font-black tracking-widest text-[#00A1E4] uppercase bg-[#00A1E4]/10 px-2 py-0.5 rounded">
                        Mercado Pago
                      </span>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-xs text-slate-500 leading-relaxed flex items-start gap-3">
                      <Lock className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <p>
                        Tu pago será procesado de forma 100% segura mediante la pasarela encriptada de <strong>Mercado Pago</strong>. Aceptamos tarjetas de crédito, débito y transferencias.
                      </p>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isCreatingPref}
                    className="w-full bg-[#70125F] hover:bg-[#590e4b] text-white rounded-2xl h-14 font-bold uppercase tracking-wider shadow-lg shadow-[#70125F]/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isCreatingPref ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Generando orden de pago...</span>
                      </>
                    ) : (
                      <span>Pagar con Mercado Pago</span>
                    )}
                  </Button>
                </form>
              </Card>
            </div>

            {/* Right: Plan Summary */}
            <div className="md:col-span-5">
              <Card className="border-none shadow-md bg-white rounded-[2rem] p-8 space-y-6">
                <h3 className="font-extrabold text-sm text-[#70125F] border-b border-slate-100 pb-3">
                  Resumen de tu Compra
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-[#70125F]/10 rounded-xl flex items-center justify-center text-[#70125F]">
                      <Music className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-slate-800">{plan.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Plan de Clases</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 space-y-2 text-xs border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Clases Incluidas:</span>
                      <span className="font-bold text-slate-700">{plan.classesCount} clases</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Vigencia del Pack:</span>
                      <span className="font-bold text-slate-700">{plan.duration} {plan.duration === 1 ? "mes" : "meses"}</span>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100 w-full pt-2" />

                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total a pagar:</span>
                    <span className="text-3xl font-extrabold text-[#70125F] font-sans font-black">
                      ${parseInt(plan.price).toLocaleString("es-CL")}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#70125F]" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
