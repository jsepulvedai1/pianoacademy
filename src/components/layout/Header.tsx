"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/MobileNav";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  
  // Header transparent style for the main homepage and public service landings
  const isPublicLanding = 
    pathname === "/" || 
    (!pathname?.startsWith("/admin") && 
     !pathname?.startsWith("/portal") && 
     !pathname?.startsWith("/login") && 
     pathname !== "/catalog" && 
     pathname !== "/teachers");

  return (
    <header 
      className={cn(
        "z-50 transition-all duration-300 w-full",
        isPublicLanding 
          ? "absolute top-0 left-0 right-0 bg-transparent border-none" 
          : "sticky top-0 bg-background/95 backdrop-blur border-b border-border/40"
      )}
    >
      <div className="container mx-auto px-4 md:px-6 h-24 flex items-center justify-between">
        
        {/* Left Side: Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img 
            src="/icons/logo.svg" 
            alt="Détaché Academia" 
            className={cn(
              "h-20 md:h-26 w-auto transition-all",
              isPublicLanding && "brightness-0 invert"
            )} 
          />
        </Link>

        {/* Right Side: Navigation and Actions aligned to the right */}
        <div className="flex items-center gap-8 md:gap-12">
          {/* Desktop Navigation */}
          <nav className={cn(
            "hidden md:flex items-center gap-8 text-[13px] uppercase tracking-[0.2em] font-semibold",
            isPublicLanding ? "text-white/80" : "text-foreground/80"
          )}>
            <Link href="/" className={cn("hover:text-white transition-colors", !isPublicLanding && "hover:text-primary")}>
              Inicio
            </Link>
            <Link href="/about" className={cn("hover:text-white transition-colors", !isPublicLanding && "hover:text-primary")}>
              Nosotros
            </Link>
            <Link href="/contact" className={cn("hover:text-white transition-colors", !isPublicLanding && "hover:text-primary")}>
              Contacto
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button 
              asChild 
              className={cn(
                "hidden md:inline-flex font-bold uppercase text-[10px] tracking-[0.25em] px-8 h-12 rounded-full transition-all border",
                isPublicLanding 
                  ? "bg-transparent hover:bg-white hover:text-black border-white text-white" 
                  : "bg-primary hover:bg-primary/95 text-white border-primary"
              )}
            >
              <Link href="/contact">Clase Inicial</Link>
            </Button>

            <div className="md:hidden">
              <MobileNav isTransparent={isPublicLanding} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
