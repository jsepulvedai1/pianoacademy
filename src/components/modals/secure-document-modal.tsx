"use client";

import { useEffect } from "react";
import { X, ShieldCheck, Lock, AlertCircle, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMediaUrl } from "@/lib/utils";

interface SecureDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  type?: string;
}

function getYouTubeEmbedUrl(rawUrl: string): string | null {
  try {
    const u = new URL(rawUrl);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/embed/")) return rawUrl;
      if (u.pathname.startsWith("/shorts/")) {
        const id = u.pathname.split("/shorts/")[1]?.split("/")[0];
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      const v = u.searchParams.get("v");
      return v ? `https://www.youtube.com/embed/${v}` : null;
    }
  } catch {
    return null;
  }
  return null;
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

  const resolvedUrl = getMediaUrl(url);
  const cleanPath = resolvedUrl.split("?")[0].split("#")[0].toLowerCase();
  const youtubeEmbed = getYouTubeEmbedUrl(resolvedUrl);

  const isAudio = type === "AUDIO" || /\.(mp3|wav|ogg|aac|flac|m4a)$/.test(cleanPath);
  const isVideoFile = /\.(mp4|mov|webm|mkv|avi)$/.test(cleanPath);
  const isImage = /\.(png|jpe?g|webp|gif|svg)$/.test(cleanPath);
  const isPdf = /\.pdf$/.test(cleanPath) || (type === "PDF" && !/\.(docx?|xlsx?|pptx?|txt)$/.test(cleanPath));
  const isOfficeOrExternal = !isAudio && !isVideoFile && !isImage && !youtubeEmbed && !isPdf;

  // Append PDF params to hide toolbar and navpanes when viewing PDFs
  const protectedPdfUrl = resolvedUrl.includes("#")
    ? `${resolvedUrl}&toolbar=0&navpanes=0`
    : `${resolvedUrl}#toolbar=0&navpanes=0`;

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
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
              <Lock className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide truncate max-w-md">
                  {title}
                </h3>
                <span className="text-[9px] bg-purple-500/20 text-purple-300 font-black px-2 py-0.5 rounded-full uppercase tracking-wider border border-purple-500/30 shrink-0">
                  {type}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Visor Protegido Détaché · Descarga e Impresión Restringidas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
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
        <div className="relative flex-1 bg-slate-950 overflow-hidden flex items-center justify-center">
          {/* Subtle anti-screenshot / copyright watermark */}
          <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-around items-center opacity-[0.035] rotate-[-25deg] select-none text-slate-100 font-black text-2xl tracking-widest text-center">
            <div>DÉTACHÉ ACADEMIA DE MÚSICA — USO EXCLUSIVO EN PLATAFORMA</div>
            <div>MATERIAL PEDAGÓGICO PROTEGIDO — PROHIBIDA SU DISTRIBUCIÓN</div>
            <div>DÉTACHÉ ACADEMIA DE MÚSICA — USO EXCLUSIVO EN PLATAFORMA</div>
          </div>

          {youtubeEmbed ? (
            <iframe
              src={youtubeEmbed}
              className="w-full h-full border-none relative z-0"
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : isAudio ? (
            <div className="p-8 bg-slate-900/90 border border-slate-800 rounded-3xl max-w-md w-full text-center space-y-4 relative z-20">
              <p className="text-sm font-bold text-white">{title}</p>
              <audio controls controlsList="nodownload" src={resolvedUrl} className="w-full" />
            </div>
          ) : isVideoFile ? (
            <video
              controls
              controlsList="nodownload"
              src={resolvedUrl}
              className="max-w-full max-h-full relative z-20"
            />
          ) : isImage ? (
            <img
              src={resolvedUrl}
              alt={title}
              className="max-w-full max-h-full object-contain relative z-20"
            />
          ) : isOfficeOrExternal ? (
            <div className="p-8 bg-slate-900/90 border border-slate-800 rounded-3xl max-w-md w-full text-center space-y-5 relative z-20">
              <div className="h-14 w-14 rounded-2xl bg-purple-500/15 text-purple-300 flex items-center justify-center mx-auto">
                <FileText className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <p className="text-base font-bold text-white">{title}</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Este formato o enlace externo no admite vista previa incrustada directamente en el navegador.
                </p>
              </div>
              <Button asChild className="w-full bg-[#70125F] hover:bg-[#590e4b] text-white rounded-2xl h-11 font-bold text-xs uppercase tracking-wider">
                <a href={resolvedUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" /> Abrir Archivo / Enlace
                </a>
              </Button>
            </div>
          ) : (
            <iframe
              src={protectedPdfUrl}
              className="w-full h-full border-none bg-white"
              title={title}
            />
          )}
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
