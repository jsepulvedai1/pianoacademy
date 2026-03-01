export type ClassModalality = 'ONLINE' | 'IN_PERSON' | 'HYBRID';
export type ClassLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'MASTER';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  level?: ClassLevel;
  // Campos futuros: avatarUrl, createdAt, etc.
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  bio?: string;
  specialties: string[]; // e.g. ["Piano Jazz", "Piano Clasico"]
  availableModalities: ClassModalality[];
  avatarUrl?: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  equipment: string[]; // e.g. ["Grand Piano", "Upright Piano"]
  isAvailable: boolean;
}

export interface ClassType {
  id: string;
  name: string; // e.g. "Clase de Piano Individual"
  description?: string;
  durationMinutes: number; // e.g. 30, 45, 60
  price: number;
  currency: string;
  allowedLevels: ClassLevel[];
  allowedModalities: ClassModalality[];
}

export interface TimeSlot {
  id: string;
  teacherId: string;
  roomId?: string; // Opcional si es online
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  isBooked: boolean;
}

export interface Booking {
  id: string;
  studentId: string; // O guest si permitimos sin login
  studentName?: string; // Para bookings sin cuenta completa
  studentEmail?: string;
  
  teacherId: string;
  classTypeId: string;
  roomId?: string;
  
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  
  status: BookingStatus;
  modality: ClassModalality;
  notes?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface CancellationPolicy {
  id: string;
  minHoursBefore: number; // e.g. 24 horas antes
  refundPercentage: number; // 0 a 100
  description: string;
}
