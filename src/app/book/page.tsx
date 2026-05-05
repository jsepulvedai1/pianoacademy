"use client";

import { useBookingStore } from '@/lib/store';
import { StepOneClassSelection } from '@/features/booking/components/StepOneClassSelection';
import { StepTwoTimeSelection } from '@/features/booking/components/StepTwoTimeSelection';
import { StepThreeConfirmation } from '@/features/booking/components/StepThreeConfirmation';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function BookingContent() {
  const { step, setUtmParams } = useBookingStore();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Capture UTMs
    const utm_source = searchParams.get('utm_source');
    const utm_medium = searchParams.get('utm_medium');
    const utm_campaign = searchParams.get('utm_campaign');
    
    if (utm_source || utm_medium || utm_campaign) {
      setUtmParams({
        source: utm_source || undefined,
        medium: utm_medium || undefined,
        campaign: utm_campaign || undefined,
      });
    }
  }, [searchParams, setUtmParams]);

  // Scroll to top on step change
  useEffect(() => {
    if (mounted) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [step, mounted]);

  const steps = [
    { number: 1, title: 'Clase y Profesor' },
    { number: 2, title: 'Fecha y Hora' },
    { number: 3, title: 'Confirmación' },
  ];

  if (!mounted) return <div className="min-h-screen"></div>;

  return (
    <div className="container py-10 mx-auto px-4 max-w-5xl">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Reserva tu Clase</h1>
        <p className="text-muted-foreground">Sigue los pasos para agendar tu próxima sesión.</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-12 max-w-3xl mx-auto">
        <div className="relative flex justify-between">
          {/* Background Line */}
          <div className="absolute top-4 left-0 w-full h-0.5 bg-muted -z-10" />
          
          {/* Active Line */}
          <div 
            className="absolute top-4 left-0 h-0.5 bg-primary -z-10 transition-all duration-500 ease-in-out" 
            style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
          />
          
          {steps.map((s) => (
            <div key={s.number} className="flex flex-col items-center bg-background px-2">
              <div 
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 z-10 bg-background",
                  step > s.number ? "bg-primary border-primary text-primary-foreground" :
                  step === s.number ? "border-primary text-primary" : "border-muted text-muted-foreground"
                )}
              >
                {step > s.number ? <Check className="h-4 w-4" /> : s.number}
              </div>
              <span className={cn(
                "text-xs mt-2 font-medium transition-colors duration-300",
                step >= s.number ? "text-foreground" : "text-muted-foreground"
              )}>
                {s.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Steps Content */}
      <div className="min-h-[400px] max-w-4xl mx-auto">
        {step === 1 && <StepOneClassSelection />}
        {step === 2 && <StepTwoTimeSelection />}
        {step === 3 && <StepThreeConfirmation />}
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen"></div>}>
      <BookingContent />
    </Suspense>
  );
}
