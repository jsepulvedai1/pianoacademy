"use client"

import * as React from "react"
import Link from "next/link"
import { createPortal } from "react-dom"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent scrolling when menu is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [open])

  return (
    <div className="md:hidden">
      <Button variant="outline" size="icon" onClick={() => setOpen(true)} className="md:hidden">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Abrir menú</span>
      </Button>

      {mounted && open && createPortal(
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-all duration-100" 
            onClick={() => setOpen(false)}
          />
          
          {/* Drawer */}
          <div className="relative z-[100] h-full w-[300px] bg-background border-l shadow-xl p-6 flex flex-col gap-6 animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xl">Menú</span>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-6 w-6" />
                <span className="sr-only">Cerrar menú</span>
              </Button>
            </div>

            <nav className="flex flex-col gap-4">
              <Link 
                href="/" 
                className="text-lg font-medium hover:text-primary transition-colors py-2 border-b"
                onClick={() => setOpen(false)}
              >
                Inicio
              </Link>
              <Link 
                href="/catalog" 
                className="text-lg font-medium hover:text-primary transition-colors py-2 border-b"
                onClick={() => setOpen(false)}
              >
                Clases
              </Link>
              <Link 
                href="/teachers" 
                className="text-lg font-medium hover:text-primary transition-colors py-2 border-b"
                onClick={() => setOpen(false)}
              >
                Profesores
              </Link>
              <Link 
                href="/about" 
                className="text-lg font-medium hover:text-primary transition-colors py-2 border-b"
                onClick={() => setOpen(false)}
              >
                Nosotros
              </Link>
              <Link 
                href="/login" 
                className="text-lg font-medium hover:text-primary transition-colors py-2 border-b"
                onClick={() => setOpen(false)}
              >
                Ingresar
              </Link>
            </nav>

            <div className="mt-auto">
              <Button asChild className="w-full" size="lg">
                <Link href="/book" onClick={() => setOpen(false)}>
                  Reservar Clase
                </Link>
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
