import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes phone numbers to Chilean format (e.g., 56912345678)
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  
  if (cleaned.startsWith("56") && cleaned.length === 11) {
    return cleaned;
  }
  
  if (cleaned.length === 9) {
    return `56${cleaned}`;
  }
  
  return cleaned;
}

/**
 * Safely parses array fields that might be returned as JSON-stringified arrays from Django backend.
 */
export function safeArray(v: any): any[] {
  if (Array.isArray(v)) return v;
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Resolves the Django backend base URL consistently across client and server.
 */
export function getBackendUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_DJANGO_URL ||
    process.env.NEXT_PUBLIC_DJANGO_API_URL ||
    (process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT
      ? process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT.replace(/\/graphql\/?$/, "")
      : "") ||
    (process.env.NEXT_PUBLIC_GRAPHQL_URL
      ? process.env.NEXT_PUBLIC_GRAPHQL_URL.replace(/\/graphql\/?$/, "")
      : "");

  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host !== "localhost" && host !== "127.0.0.1") {
      return "https://api.detache.cl";
    }
  }

  return "http://localhost:8000";
}

/**
 * Resolves local assets vs Django media paths.
 */
export function getMediaUrl(path?: string | null): string {
  if (!path) return "";
  if (path.startsWith("data:") || path.startsWith("blob:")) return path;

  const djangoUrl = getBackendUrl();

  // Relative path like "/media/materials/file.pdf"
  if (path.startsWith("/media/")) {
    return `${djangoUrl}${path}`;
  }

  // If it's an absolute URL that contains /media/
  if (path.includes("/media/")) {
    const mediaPart = path.substring(path.indexOf("/media/"));
    if (
      typeof window !== "undefined" &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1" &&
      (path.includes("localhost:8000") || path.includes("127.0.0.1:8000"))
    ) {
      return `${djangoUrl}${mediaPart}`;
    }
    if (path.startsWith("http://localhost:8000") || path.startsWith("http://127.0.0.1:8000")) {
      return `${djangoUrl}${mediaPart}`;
    }
  }

  return path;
}

export function getImageUrl(path?: string): string {
  return getMediaUrl(path);
}

/**
 * Infers material type ('PDF' | 'AUDIO' | 'VIDEO') from file extension.
 */
export function inferMaterialTypeFromFilename(filename: string): string {
  const fileExt = filename.split('.').pop()?.toLowerCase() || '';
  if (['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'].includes(fileExt)) return 'AUDIO';
  if (['mp4', 'mov', 'avi', 'webm', 'mkv'].includes(fileExt)) return 'VIDEO';
  return 'PDF';
}

async function postFormDataWithFallback(path: string, buildFormData: () => FormData): Promise<any> {
  const backendUrl = getBackendUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  let res: Response;
  try {
    res = await fetch(`${backendUrl}${normalizedPath}`, {
      method: 'POST',
      body: buildFormData(),
    });
  } catch {
    res = await fetch(normalizedPath, {
      method: 'POST',
      body: buildFormData(),
    });
  }

  const rawText = await res.text();
  let data: any = null;
  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch {
    throw new Error(
      res.status === 413
        ? 'El archivo supera el tamaño máximo permitido por el servidor.'
        : `Respuesta inesperada del servidor (HTTP ${res.status})`
    );
  }

  if (!res.ok || data?.status !== 'SUCCESS') {
    throw new Error(data?.message || `Error del servidor al subir archivo (HTTP ${res.status})`);
  }

  return data;
}

/**
 * Uploads a media file (PDF, audio, image, etc.) to Django's MediaUploadView.
 */
export async function uploadMediaFile(
  file: File,
  folder = 'materials'
): Promise<{ url: string; relativeUrl: string; filename: string; detectedType: string }> {
  const data = await postFormDataWithFallback('/api/media/upload/', () => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', folder);
    return fd;
  });

  const backendUrl = getBackendUrl();
  const relativeUrl = data.relativeUrl || '';
  const url = data.url || (relativeUrl ? `${backendUrl}${relativeUrl}` : '');
  if (!url) {
    throw new Error('El servidor no devolvió una URL válida para el archivo.');
  }

  return {
    url,
    relativeUrl,
    filename: data.filename || file.name,
    detectedType: inferMaterialTypeFromFilename(file.name),
  };
}

/**
 * Uploads a teacher profile photo to Django's TeacherPhotoUploadView.
 */
export async function uploadTeacherPhoto(
  teacherId: string | number,
  file: File
): Promise<{ photoUrl: string; url: string }> {
  const data = await postFormDataWithFallback('/api/teachers/upload-photo/', () => {
    const fd = new FormData();
    fd.append('teacher_id', String(teacherId));
    fd.append('photo', file);
    return fd;
  });

  const photoUrl = data.relativeUrl || data.photoUrl || data.url || '';
  const url = data.url || (photoUrl ? getMediaUrl(photoUrl) : '');
  return { photoUrl, url };
}

/**
 * Returns today's calendar date (YYYY-MM-DD) in Chile (America/Santiago).
 */
export function getChileTodayIso(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santiago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export interface StudentPackLike {
  isActive?: boolean | null;
  isExpired?: boolean | null;
  expirationDate?: string | null;
  remainingClasses?: number | null;
}

/**
 * Checks whether a student pack is expired by its expirationDate (independent per-pack duration).
 */
export function isPackExpired(pack: StudentPackLike | null | undefined, todayIso = getChileTodayIso()): boolean {
  if (!pack) return false;
  if (pack.isExpired === true) return true;
  if (pack.expirationDate && String(pack.expirationDate) < todayIso) return true;
  return !pack.isActive && (pack.remainingClasses || 0) > 0;
}

/**
 * Checks whether a student pack is active, not expired, and has remaining classes.
 */
export function isPackValid(pack: StudentPackLike | null | undefined, todayIso = getChileTodayIso()): boolean {
  if (!pack) return false;
  if (!pack.isActive || pack.isExpired === true) return false;
  if (pack.expirationDate && String(pack.expirationDate) < todayIso) return false;
  return (pack.remainingClasses || 0) > 0;
}



