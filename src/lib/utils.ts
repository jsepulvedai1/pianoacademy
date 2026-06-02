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

