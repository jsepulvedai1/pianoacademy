"use client";

import { useEffect } from "react";
import { X, ShieldCheck, Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SecureDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  type?: string;
}

export function SecureDocumentModal({
  isOpen,
  onClose,
  title,
  url,
  type = "PDF"
}: SecureDocumentModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    // Prevent Ctrl+P, Cmd+P, Ctrl+S, Cmd+S
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "p" || e.key === "s")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  // Append PDF params to hide toolbar and navpanes
  const protectedUrl = url.includes("#")
    ? `${url}&toolbar=0&navpanes=0`
    : `${url}#toolbar=0&navpanes=0`;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-6 animate-in fade-in duration-200 select-none"
      onContextMenu={(e) => {
        e.preventDefault();
        return false;
      }}
    >
      <style jsx global>{`
        @media print {
          body, * {
            display: none !important;
            visibility: hidden !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-5xl h-[92vh] bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide truncate max-w-md">
                  {title}
                </h3>
                <span className="text-[9px] bg-purple-500/20 text-purple-300 font-black px-2 py-0.5 rounded-full uppercase tracking-wider border border-purple-500/30">
                  {type}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Visor Protegido Détaché · Descarga e Impresión Restringidas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-medium text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              <AlertCircle className="h-3 w-3" /> Solo Lectura
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-9 w-9 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl cursor-pointer"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Document Viewer Body */}
        <div className="relative flex-1 bg-slate-950 overflow-hidden">
          {/* Subtle anti-screenshot / copyright watermark */}
          <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-around items-center opacity-[0.035] rotate-[-25deg] select-none text-slate-100 font-black text-2xl tracking-widest text-center">
            <div>DÉTACHÉ ACADEMIA DE MÚSICA — USO EXCLUSIVO EN PLATAFORMA</div>
            <div>MATERIAL PEDAGÓGICO PROTEGIDO — PROHIBIDA SU DISTRIBUCIÓN</div>
            <div>DÉTACHÉ ACADEMIA DE MÚSICA — USO EXCLUSIVO EN PLATAFORMA</div>
          </div>

          <iframe
            src={protectedUrl}
            className="w-full h-full border-none"
            title={title}
            sandbox="allow-scripts allow-same-origin"
          />
        </div>

        {/* Bottom Safety Notice */}
        <div className="px-6 py-2.5 bg-slate-900 border-t border-slate-800/80 text-center shrink-0">
          <p className="text-[10px] text-slate-400 italic">
            Este documento es propiedad pedagógica de Academia Détaché. Queda prohibida su reproducción, descarga no autorizada o impresión comercial según reglamento interno.
          </p>
        </div>
      </div>
    </div>
  );
}
