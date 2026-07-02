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


