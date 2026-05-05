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

export interface Payment {
  id: string;
  alumnoId: string;
  alumnoNombre: string;
  packId: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'FAILED';
  dueDate: string;
  paymentDate?: string;
  method?: string;
}

export interface Teacher {
  id: string;
  nombre: string;
  rut: string;
  email: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: string;
  bio: string;
  especialidades: string[];
  modalidades: ('PRESENCIAL' | 'ONLINE' | 'HIBRIDO')[];
  avatarUrl?: string;
  status: 'ACTIVE' | 'INACTIVE';
  disponibilidad: {
    dia: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado';
    bloques: { inicio: string; fin: string; sala?: string }[];
  }[];
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
