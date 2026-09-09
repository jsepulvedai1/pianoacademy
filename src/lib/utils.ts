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
 * Resolves local assets vs Django media paths.
 */
export function getMediaUrl(path?: string | null): string {
  if (!path) return "";
  if (path.startsWith("data:") || path.startsWith("blob:")) return path;

  const djangoUrl = process.env.NEXT_PUBLIC_DJANGO_URL || (typeof window !== "undefined" && window.location.hostname === "localhost" ? "http://localhost:8000" : "https://api.detache.cl");

  // Relative path like "/media/materials/file.pdf"
  if (path.startsWith("/media/")) {
    return `${djangoUrl}${path}`;
  }

  // If it's an absolute URL that contains /media/
  if (path.includes("/media/")) {
    const mediaPart = path.substring(path.indexOf("/media/"));
    // If the frontend is NOT running on localhost, or if we need to ensure the correct djangoUrl
    if (typeof window !== "undefined" && window.location.hostname !== "localhost" && path.includes("localhost:8000")) {
      return `${djangoUrl}${mediaPart}`;
    }
    // If frontend is on localhost and accessing localhost:8000, keep or ensure djangoUrl
    if (path.startsWith("http://localhost:8000") || path.startsWith("http://127.0.0.1:8000")) {
      return `${djangoUrl}${mediaPart}`;
    }
  }

  return path;
}

export function getImageUrl(path?: string): string {
  return getMediaUrl(path);
}



