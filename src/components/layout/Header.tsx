import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { MobileNav } from '@/components/layout/MobileNav';

export function Header() {
  return (
    <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/icons/logo.svg" alt="Détaché Logo" className="h-24 w-auto" />

        </Link>

        <nav className="hidden md:flex items-center gap-6 text-base font-medium">
          <Link href="/" className="hover:text-primary transition-colors">
            Inicio
          </Link>
          <Link href="/catalog" className="hover:text-primary transition-colors">
            Clases
          </Link>
          <Link href="/teachers" className="hover:text-primary transition-colors">
            Profesores
          </Link>
          <Link href="/#plans" className="hover:text-primary transition-colors">
            Planes
          </Link>
          <Link href="/about" className="hover:text-primary transition-colors">
            Nosotros
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <ModeToggle />
          <Link href="/login" className="text-sm font-medium hover:underline hidden sm:block">
            Ingresar
          </Link>
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/book">Reservar Clase</Link>
          </Button>
          <div className="md:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}
