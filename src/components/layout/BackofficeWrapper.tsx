"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

/**
 * 🎨 Client-side wrapper to conditionally hide public Header/Footer
 * within the Admin backoffice routes.
 */
export function HeaderWrapper() {
  const pathname = usePathname();
  const shouldHide = pathname?.startsWith('/admin') || pathname?.startsWith('/portal-alumno') || pathname?.startsWith('/portal-docente') || pathname === '/login';
  if (shouldHide) return null;
  return <Header />;
}

export function FooterWrapper() {
  const pathname = usePathname();
  const shouldHide = pathname?.startsWith('/admin') || pathname?.startsWith('/portal-alumno') || pathname?.startsWith('/portal-docente') || pathname === '/login';
  if (shouldHide) return null;
  return <Footer />;
}
