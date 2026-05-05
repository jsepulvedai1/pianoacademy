import { ClassType } from "@/types/domain";

// ============================================================
// DETACHÉ ACADEMY — Mock Data Centralizado
// ============================================================

// ─── TIPOS EXISTENTES ──────────────────────────────────────
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

export const MOCK_TEACHERS: Teacher[] = [
  {
    id: "T1", nombre: "Sofía Martínez", rut: "15.432.123-K", email: "sofia.m@detache.cl", telefono: "56988887777",
    direccion: "Americo Vespucio Sur 1400, Las Condes", fechaNacimiento: "1988-04-12",
    bio: "Pianista con maestría en interpretación clásica. Especialista en técnica rusa y pedagogía inicial.",
    especialidades: ["Piano Clásico", "Teoría", "Iniciación"], modalidades: ["PRESENCIAL", "ONLINE"],
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia", status: "ACTIVE",
    disponibilidad: [
      { dia: "Lunes", bloques: [{ inicio: "10:00", fin: "14:00", sala: "Sala de Piano" }] },
      { dia: "Miércoles", bloques: [{ inicio: "15:00", fin: "19:00", sala: "Sala de Piano" }] },
      { dia: "Viernes", bloques: [{ inicio: "09:00", fin: "13:00", sala: "Sala de Piano" }] }
    ]
  },
  {
    id: "T2", nombre: "Carlos Ruiz", rut: "12.876.543-2", email: "carlos.r@detache.cl", telefono: "56977776666",
    direccion: "Bilbao 2300, Providencia", fechaNacimiento: "1985-11-20",
    bio: "Violinista de la orquesta nacional. Especialista en ensamble y música de cámara.",
    especialidades: ["Violín", "Ensamble", "Guitarra"], modalidades: ["PRESENCIAL"],
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos", status: "ACTIVE",
    disponibilidad: [
      { dia: "Martes", bloques: [{ inicio: "11:00", fin: "15:00", sala: "Sala de Ensayo" }] },
      { dia: "Jueves", bloques: [{ inicio: "16:00", fin: "20:00", sala: "Sala de Ensayo" }] }
    ]
  },
  {
    id: "T3", nombre: "Ana Belén", rut: "17.123.456-7", email: "ana.b@detache.cl", telefono: "56966665555",
    direccion: "Santa Isabel 450, Santiago Centro", fechaNacimiento: "1992-07-05",
    bio: "Cantante lírica y popular. Coach vocal para preparación de concursos y presentaciones en vivo.",
    especialidades: ["Canto", "Guitarra", "Coro"], modalidades: ["ONLINE", "PRESENCIAL"],
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana", status: "ACTIVE",
    disponibilidad: [
      { dia: "Lunes", bloques: [{ inicio: "08:00", fin: "12:00", sala: "Cabina A" }] },
      { dia: "Miércoles", bloques: [{ inicio: "14:00", fin: "18:00", sala: "Cabina A" }] },
      { dia: "Sábado", bloques: [{ inicio: "10:00", fin: "14:00", sala: "Cabina B" }] }
    ]
  }
];

export const CLASS_TYPES: ClassType[] = [
  { id: "c1", name: "Piano Clásico - Nivel Inicial", description: "Aprende las bases del piano.", durationMinutes: 45, price: 25000, currency: "CLP", allowedLevels: ["BEGINNER"], allowedModalities: ["IN_PERSON", "ONLINE"] },
  { id: "c2", name: "Piano Jazz & Improvisación", description: "Escalas, acordes y a improvisar.", durationMinutes: 60, price: 35000, currency: "CLP", allowedLevels: ["INTERMEDIATE", "ADVANCED"], allowedModalities: ["ONLINE"] },
  { id: "c3", name: "Teoría y Solfeo", description: "Lectura rítmica, melódica y armonía.", durationMinutes: 60, price: 20000, currency: "CLP", allowedLevels: ["BEGINNER", "INTERMEDIATE", "ADVANCED"], allowedModalities: ["ONLINE"] },
  { id: "c4", name: "Masterclass de Interpretación", description: "Técnica e interpretación avanzada.", durationMinutes: 90, price: 50000, currency: "CLP", allowedLevels: ["ADVANCED", "MASTER"], allowedModalities: ["IN_PERSON"] }
];

// ─── NUEVOS TIPOS ──────────────────────────────────────────
export type LeadStatus =
  | 'NUEVO'
  | 'CONTACTADO'
  | 'SEGUIMIENTO'
  | 'PRE_RESERVA'
  | 'RESERVA_CONFIRMADA'
  | 'CONCRETADO'
  | 'NO_CONCRETADO'
  | 'SIN_RESPUESTA'
  | 'LISTA_ESPERA';

export type LeadSource = 'WEB' | 'WHATSAPP' | 'INSTAGRAM' | 'REFERIDO' | 'GOOGLE' | 'OTRO';
export type LeadService = 'PIANO_NINOS' | 'PIANO_ADULTOS' | 'CANTO' | 'CLASE_GRUPAL' | 'CLASE_PRUEBA';

export interface LeadNote {
  id: string;
  texto: string;
  fecha: string;
  autor: string;
}

export interface Lead {
  id: string;
  nombre: string;
  telefono: string;
  email?: string;
  edad?: number;
  servicio: LeadService;
  fuente: LeadSource;
  estado: LeadStatus;
  notas: LeadNote[];
  historialEstados: { estado: LeadStatus; fecha: string; por: string }[];
  fechaIngreso: string;
  fechaUltimoContacto?: string;
  preReservaExpira?: string;
  asignadoA?: string;
}

export type PackType = 4 | 12 | 24 | 40;
export type PackStatus = 'ACTIVO' | 'COMPLETADO' | 'VENCIDO' | 'PAUSADO';

export interface Pack {
  id: string;
  nombre: string;
  totalClases: PackType;
  clasesUsadas: number;
  clasesRestantes: number;
  precio: number;
  alumnoId: string;
  alumnoNombre: string;
  profesorId: string;
  profesorNombre: string;
  instrumento: string;
  estado: PackStatus;
  fechaInicio: string;
  fechaVencimiento?: string;
}

// ─── PAGOS ───────────────────────────────────────────────
export type PaymentMethod = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'OTRO';
export type PaymentStatus = 'PAGADO' | 'PENDIENTE' | 'VENCIDO';

export type ReservationStatus = 'PRE_RESERVADA' | 'CONFIRMADA' | 'VENCIDA' | 'CANCELADA' | 'COMPLETADA';

export interface Reservation {
  id: string;
  leadId?: string;
  alumnoId?: string;
  nombre: string;
  telefono: string;
  email?: string;
  servicio: LeadService;
  profesorId: string;
  profesorNombre: string;
  fecha: string;
  hora: string;
  sala?: string;
  modalidad: 'PRESENCIAL' | 'ONLINE';
  estado: ReservationStatus;
  aceptoReglamento: boolean;
  pagoRegistrado: boolean;
  expiraEn?: string;
  notas?: string;
  creadoEn: string;
}

export type AttendanceStatus = 'PRESENTE' | 'AUSENTE' | 'RECUPERATIVA' | 'CANCELADA';

export interface AttendanceRecord {
  id: string;
  alumnoId: string;
  alumnoNombre: string;
  profesorId: string;
  profesorNombre: string;
  fecha: string;
  hora: string;
  estado: AttendanceStatus;
  packId: string;
  claseNumero: number;
  instrumento: string;
  observacion?: string;
}

// ─── ESTUDIANTES (EXTENDIDO) ──────────────────────────────
export interface Student {
  id: string;
  nombre: string;
  rut: string;
  email: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: string;
  edad: number;
  esMenor: boolean;
  apoderado?: {
    nombre: string;
    rut: string;
    telefono: string;
    email?: string;
    relacion: string;
  };
  instrumento: string;
  nivel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'MASTER';
  status: 'ACTIVE' | 'INACTIVE' | 'ON_HOLD';
  signedReglamento: boolean;
  contractUrl?: string;
  joinDate: string;
  progresoGeneral: string; // Resumen de progreso
}

export const MOCK_STUDENTS: Student[] = [
  {
    id: 'S001', nombre: 'Lucas Gómez', rut: '23.456.789-0', email: 'lucas.gomez@gmail.com',
    telefono: '56911111111', direccion: 'Av. Las Condes 1234, Depto 402, Las Condes',
    fechaNacimiento: '2016-05-15', edad: 8, esMenor: true,
    apoderado: { nombre: 'Andrés Gómez', rut: '12.345.678-9', telefono: '56911111111', relacion: 'Padre' },
    instrumento: 'Piano', nivel: 'BEGINNER', status: 'ACTIVE', signedReglamento: true,
    joinDate: '2024-01-15', progresoGeneral: 'Iniciando técnica de manos. Muy buen oído.'
  },
  {
    id: 'S002', nombre: 'Elena Pérez', rut: '18.765.432-1', email: 'elena.perez@gmail.com',
    telefono: '56922222222', direccion: 'Calle Nueva 456, Providencia',
    fechaNacimiento: '1995-12-20', edad: 28, esMenor: false,
    instrumento: 'Violín', nivel: 'INTERMEDIATE', status: 'ACTIVE', signedReglamento: true,
    joinDate: '2023-11-20', progresoGeneral: 'Trabajando en vibrato y posición de arco.'
  },
  {
    id: 'S003', nombre: 'Mateo Rodríguez', rut: '15.234.567-8', email: 'mateo.r@outlook.com',
    telefono: '56933333333', direccion: 'Pasaje El Sol 890, Ñuñoa',
    fechaNacimiento: '1985-03-10', edad: 39, esMenor: false,
    instrumento: 'Guitarra', nivel: 'ADVANCED', status: 'ACTIVE', signedReglamento: true,
    joinDate: '2024-02-10', progresoGeneral: 'Dominio de escalas pentatónicas y blues.'
  },
  {
    id: 'S004', nombre: 'Isabel Torres', rut: '21.098.765-4', email: 'isabel.t@gmail.com',
    telefono: '56944444444', direccion: 'Rancagua 321, Santiago',
    fechaNacimiento: '2008-07-22', edad: 16, esMenor: true,
    apoderado: { nombre: 'Patricia Torres', rut: '10.987.654-3', telefono: '56944444444', relacion: 'Madre' },
    instrumento: 'Canto', nivel: 'BEGINNER', status: 'INACTIVE', signedReglamento: false,
    joinDate: '2023-09-05', progresoGeneral: 'Control de respiración básico.'
  }
];

// ─── MOCK LEADS ────────────────────────────────────────────
export const MOCK_LEADS: Lead[] = [
  {
    id: 'L001', nombre: 'Valentina Soto', telefono: '56912345678', email: 'valentina@gmail.com', edad: 8,
    servicio: 'PIANO_NINOS', fuente: 'INSTAGRAM', estado: 'NUEVO',
    notas: [{ id: 'N1', texto: 'La mamá mandó mensaje vía Instagram preguntando por piano para su hija de 8 años.', fecha: '2026-04-10T09:00:00', autor: 'Recepción' }],
    historialEstados: [{ estado: 'NUEVO', fecha: '2026-04-10T09:00:00', por: 'Sistema' }],
    fechaIngreso: '2026-04-10T09:00:00', asignadoA: 'Recepción'
  },
  {
    id: 'L002', nombre: 'Diego Morales', telefono: '56987654321', email: 'diego.morales@outlook.com', edad: 34,
    servicio: 'PIANO_ADULTOS', fuente: 'WEB', estado: 'CONTACTADO',
    notas: [{ id: 'N2', texto: 'Le enviamos info por WhatsApp. Quiere empezar en mayo.', fecha: '2026-04-09T14:30:00', autor: 'Recepción' }],
    historialEstados: [
      { estado: 'NUEVO', fecha: '2026-04-08T10:00:00', por: 'Sistema' },
      { estado: 'CONTACTADO', fecha: '2026-04-09T14:30:00', por: 'Recepción' }
    ],
    fechaIngreso: '2026-04-08T10:00:00', fechaUltimoContacto: '2026-04-09T14:30:00', asignadoA: 'Recepción'
  },
  {
    id: 'L003', nombre: 'Camila Reyes', telefono: '56956781234', email: 'camila.r@gmail.com', edad: 22,
    servicio: 'CANTO', fuente: 'REFERIDO', estado: 'SEGUIMIENTO',
    notas: [
      { id: 'N3', texto: 'La refirió la alumna Ana Torres. Muy interesada en canto lírico.', fecha: '2026-04-07T11:00:00', autor: 'Dirección' },
      { id: 'N4', texto: 'Segunda llamada realizada. Quedó en confirmar esta semana.', fecha: '2026-04-09T16:00:00', autor: 'Recepción' }
    ],
    historialEstados: [
      { estado: 'NUEVO', fecha: '2026-04-06T10:00:00', por: 'Sistema' },
      { estado: 'CONTACTADO', fecha: '2026-04-07T11:00:00', por: 'Dirección' },
      { estado: 'SEGUIMIENTO', fecha: '2026-04-09T16:00:00', por: 'Recepción' }
    ],
    fechaIngreso: '2026-04-06T10:00:00', fechaUltimoContacto: '2026-04-09T16:00:00', asignadoA: 'Recepción'
  },
  {
    id: 'L004', nombre: 'Sebastián López', telefono: '56923456789', edad: 12,
    servicio: 'CLASE_PRUEBA', fuente: 'GOOGLE', estado: 'PRE_RESERVA',
    notas: [{ id: 'N5', texto: 'Agendó clase de prueba. Pago pendiente antes de las 20:00.', fecha: '2026-04-10T08:00:00', autor: 'Sistema' }],
    historialEstados: [
      { estado: 'NUEVO', fecha: '2026-04-09T20:00:00', por: 'Sistema' },
      { estado: 'CONTACTADO', fecha: '2026-04-10T08:00:00', por: 'Recepción' },
      { estado: 'PRE_RESERVA', fecha: '2026-04-10T08:30:00', por: 'Recepción' }
    ],
    fechaIngreso: '2026-04-09T20:00:00', fechaUltimoContacto: '2026-04-10T08:30:00',
    preReservaExpira: '2026-04-10T20:00:00', asignadoA: 'Recepción'
  },
  {
    id: 'L005', nombre: 'Isabella Fuentes', telefono: '56934567890', email: 'isa.fuentes@gmail.com', edad: 16,
    servicio: 'PIANO_NINOS', fuente: 'WHATSAPP', estado: 'RESERVA_CONFIRMADA',
    notas: [{ id: 'N6', texto: 'Confirmó y pagó. Pasa a alumno activo.', fecha: '2026-04-08T12:00:00', autor: 'Recepción' }],
    historialEstados: [
      { estado: 'NUEVO', fecha: '2026-04-05T09:00:00', por: 'Sistema' },
      { estado: 'CONTACTADO', fecha: '2026-04-05T10:00:00', por: 'Recepción' },
      { estado: 'PRE_RESERVA', fecha: '2026-04-06T09:00:00', por: 'Recepción' },
      { estado: 'RESERVA_CONFIRMADA', fecha: '2026-04-08T12:00:00', por: 'Recepción' }
    ],
    fechaIngreso: '2026-04-05T09:00:00', fechaUltimoContacto: '2026-04-08T12:00:00', asignadoA: 'Recepción'
  },
  {
    id: 'L006', nombre: 'Tomás Vargas', telefono: '56945678901', edad: 45,
    servicio: 'PIANO_ADULTOS', fuente: 'OTRO', estado: 'SIN_RESPUESTA',
    notas: [{ id: 'N7', texto: 'Intentamos contactar 3 veces sin respuesta.', fecha: '2026-04-09T17:00:00', autor: 'Recepción' }],
    historialEstados: [
      { estado: 'NUEVO', fecha: '2026-04-04T10:00:00', por: 'Sistema' },
      { estado: 'SIN_RESPUESTA', fecha: '2026-04-09T17:00:00', por: 'Recepción' }
    ],
    fechaIngreso: '2026-04-04T10:00:00', asignadoA: 'Recepción'
  },
  {
    id: 'L007', nombre: 'Fernanda Castro', telefono: '56956789012', email: 'fer.castro@hotmail.com', edad: 28,
    servicio: 'CANTO', fuente: 'INSTAGRAM', estado: 'CONCRETADO',
    notas: [{ id: 'N8', texto: 'Firmó contrato. Pack 12 clases. Inicio: 15 abril.', fecha: '2026-04-09T11:00:00', autor: 'Dirección' }],
    historialEstados: [
      { estado: 'NUEVO', fecha: '2026-04-01T09:00:00', por: 'Sistema' },
      { estado: 'CONTACTADO', fecha: '2026-04-02T10:00:00', por: 'Recepción' },
      { estado: 'SEGUIMIENTO', fecha: '2026-04-04T12:00:00', por: 'Recepción' },
      { estado: 'PRE_RESERVA', fecha: '2026-04-07T09:00:00', por: 'Recepción' },
      { estado: 'RESERVA_CONFIRMADA', fecha: '2026-04-08T10:00:00', por: 'Recepción' },
      { estado: 'CONCRETADO', fecha: '2026-04-09T11:00:00', por: 'Dirección' }
    ],
    fechaIngreso: '2026-04-01T09:00:00', fechaUltimoContacto: '2026-04-09T11:00:00', asignadoA: 'Dirección'
  },
  {
    id: 'L008', nombre: 'Rodrigo Muñoz', telefono: '56967890123', edad: 10,
    servicio: 'CLASE_GRUPAL', fuente: 'WEB', estado: 'LISTA_ESPERA',
    notas: [{ id: 'N9', texto: 'Interesado en clase grupal. Cupo lleno, en lista de espera.', fecha: '2026-04-10T10:00:00', autor: 'Recepción' }],
    historialEstados: [
      { estado: 'NUEVO', fecha: '2026-04-10T09:30:00', por: 'Sistema' },
      { estado: 'CONTACTADO', fecha: '2026-04-10T10:00:00', por: 'Recepción' },
      { estado: 'LISTA_ESPERA', fecha: '2026-04-10T10:00:00', por: 'Recepción' }
    ],
    fechaIngreso: '2026-04-10T09:30:00', fechaUltimoContacto: '2026-04-10T10:00:00', asignadoA: 'Recepción'
  }
];

// ─── MOCK PACKS ────────────────────────────────────────────
export const MOCK_PACKS: Pack[] = [
  { id: 'PK001', nombre: 'Pack 4 clases — Piano', totalClases: 4, clasesUsadas: 2, clasesRestantes: 2, precio: 60000, alumnoId: 'S1', alumnoNombre: 'Lucas Gómez', profesorId: 'T1', profesorNombre: 'Sofía Martínez', instrumento: 'Piano', estado: 'ACTIVO', fechaInicio: '2026-04-01', fechaVencimiento: '2026-04-30' },
  { id: 'PK002', nombre: 'Pack 12 clases — Canto', totalClases: 12, clasesUsadas: 5, clasesRestantes: 7, precio: 160000, alumnoId: 'S2', alumnoNombre: 'Elena Pérez', profesorId: 'T3', profesorNombre: 'Ana Belén', instrumento: 'Canto', estado: 'ACTIVO', fechaInicio: '2026-03-15', fechaVencimiento: '2026-06-15' },
  { id: 'PK003', nombre: 'Pack 24 clases — Violín', totalClases: 24, clasesUsadas: 24, clasesRestantes: 0, precio: 290000, alumnoId: 'S3', alumnoNombre: 'Mateo Rodríguez', profesorId: 'T2', profesorNombre: 'Carlos Ruiz', instrumento: 'Violín', estado: 'COMPLETADO', fechaInicio: '2026-01-05', fechaVencimiento: '2026-04-05' },
  { id: 'PK004', nombre: 'Pack 40 clases — Piano', totalClases: 40, clasesUsadas: 10, clasesRestantes: 30, precio: 450000, alumnoId: 'S4', alumnoNombre: 'Isabel Torres', profesorId: 'T1', profesorNombre: 'Sofía Martínez', instrumento: 'Piano', estado: 'ACTIVO', fechaInicio: '2026-03-01' }
];

// ─── MOCK PAGOS ────────────────────────────────────────────
export interface Payment {
  id: string;
  alumnoId: string;
  alumnoNombre: string;
  alumnoTelefono: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  concept: string;
  packId?: string;
  paymentDate?: string;
  dueDate: string;
  internalNote?: string;
}

export const MOCK_PAYMENTS: Payment[] = [
  { id: 'PAY001', alumnoId: 'S1', alumnoNombre: 'Lucas Gómez', alumnoTelefono: '56911111111', amount: 60000, currency: 'CLP', method: 'TRANSFERENCIA', status: 'PAGADO', concept: 'Pack 4 clases — Piano', packId: 'PK001', paymentDate: '2026-04-01', dueDate: '2026-04-01' },
  { id: 'PAY002', alumnoId: 'S2', alumnoNombre: 'Elena Pérez', alumnoTelefono: '56922222222', amount: 160000, currency: 'CLP', method: 'TARJETA', status: 'PAGADO', concept: 'Pack 12 clases — Canto', packId: 'PK002', paymentDate: '2026-03-15', dueDate: '2026-03-15' },
  { id: 'PAY003', alumnoId: 'S3', alumnoNombre: 'Mateo Rodríguez', alumnoTelefono: '56933333333', amount: 290000, currency: 'CLP', method: 'EFECTIVO', status: 'PAGADO', concept: 'Pack 24 clases — Violín', packId: 'PK003', paymentDate: '2026-01-05', dueDate: '2026-01-05' },
  { id: 'PAY004', alumnoId: 'S4', alumnoNombre: 'Isabel Torres', alumnoTelefono: '56944444444', amount: 450000, currency: 'CLP', method: 'TRANSFERENCIA', status: 'PENDIENTE', concept: 'Pack 40 clases — Piano', packId: 'PK004', dueDate: '2026-04-15', internalNote: 'Prometió pagar esta semana.' },
  { id: 'PAY005', alumnoId: 'S5', alumnoNombre: 'Pedro Páramo', alumnoTelefono: '56955555555', amount: 60000, currency: 'CLP', method: 'TRANSFERENCIA', status: 'VENCIDO', concept: 'Clase de prueba + inscripción', dueDate: '2026-03-27', internalNote: 'No respondió mensajes.' }
];

// ─── MOCK RESERVAS ─────────────────────────────────────────
export const MOCK_RESERVATIONS: Reservation[] = [
  { id: 'RES001', leadId: 'L004', nombre: 'Sebastián López', telefono: '56923456789', servicio: 'CLASE_PRUEBA', profesorId: 'T1', profesorNombre: 'Sofía Martínez', fecha: '2026-04-11', hora: '10:00', sala: 'Sala de Piano', modalidad: 'PRESENCIAL', estado: 'PRE_RESERVADA', aceptoReglamento: true, pagoRegistrado: false, expiraEn: '2026-04-11T20:00:00', creadoEn: '2026-04-10T08:30:00' },
  { id: 'RES002', leadId: 'L005', alumnoId: 'S5', nombre: 'Isabella Fuentes', telefono: '56934567890', email: 'isa.fuentes@gmail.com', servicio: 'PIANO_NINOS', profesorId: 'T1', profesorNombre: 'Sofía Martínez', fecha: '2026-04-12', hora: '11:00', sala: 'Sala de Piano', modalidad: 'PRESENCIAL', estado: 'CONFIRMADA', aceptoReglamento: true, pagoRegistrado: true, creadoEn: '2026-04-08T12:00:00' },
  { id: 'RES003', nombre: 'Juan Pérez', telefono: '56978901234', servicio: 'CLASE_PRUEBA', profesorId: 'T3', profesorNombre: 'Ana Belén', fecha: '2026-04-09', hora: '15:00', modalidad: 'PRESENCIAL', estado: 'VENCIDA', aceptoReglamento: true, pagoRegistrado: false, expiraEn: '2026-04-09T20:00:00', creadoEn: '2026-04-09T10:00:00', notas: 'Liberado automáticamente.' }
];

// ─── MOCK ASISTENCIA ───────────────────────────────────────
export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: 'ATT001', alumnoId: 'S1', alumnoNombre: 'Lucas Gómez', profesorId: 'T1', profesorNombre: 'Sofía Martínez', fecha: '2026-04-07', hora: '10:00', estado: 'PRESENTE', packId: 'PK001', claseNumero: 1, instrumento: 'Piano' },
  { id: 'ATT002', alumnoId: 'S1', alumnoNombre: 'Lucas Gómez', profesorId: 'T1', profesorNombre: 'Sofía Martínez', fecha: '2026-04-09', hora: '10:00', estado: 'PRESENTE', packId: 'PK001', claseNumero: 2, instrumento: 'Piano' },
  { id: 'ATT003', alumnoId: 'S2', alumnoNombre: 'Elena Pérez', profesorId: 'T3', profesorNombre: 'Ana Belén', fecha: '2026-04-07', hora: '14:00', estado: 'AUSENTE', packId: 'PK002', claseNumero: 4, instrumento: 'Canto', observacion: 'Avisó con 2h de anticipación.' },
  { id: 'ATT004', alumnoId: 'S2', alumnoNombre: 'Elena Pérez', profesorId: 'T3', profesorNombre: 'Ana Belén', fecha: '2026-04-08', hora: '14:00', estado: 'RECUPERATIVA', packId: 'PK002', claseNumero: 5, instrumento: 'Canto', observacion: 'Recuperó clase del lunes.' }
];

// ─── EVOLUTION API CONFIG ──────────────────────────────────
export const EVOLUTION_API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_EVOLUTION_URL || 'http://localhost:8080',
  apiKey: process.env.NEXT_PUBLIC_EVOLUTION_API_KEY || 'admin_apikey_123',
  instanceName: process.env.NEXT_PUBLIC_EVOLUTION_INSTANCE || 'detache'
};

// ─── PLANTILLAS WHATSAPP ───────────────────────────────────
export const WA_TEMPLATES = {
  RESPUESTA_INICIAL: (nombre: string, servicio: string) =>
    `¡Hola ${nombre}! 👋 Soy de *Academia Détaché*.\n\nGracias por tu interés en *${servicio}*. ¿Para quién sería la clase y qué días/horarios te vienen mejor? 🎹`,
  INFO_PACKS: (nombre: string) =>
    `Hola ${nombre}! 🎵 Nuestros packs:\n\n🎵 *Pack 4 clases* — $60.000\n🎵 *Pack 12 clases* — $160.000\n🎵 *Pack 24 clases* — $290.000\n🎵 *Pack 40 clases* — $450.000\n\n¿Cuál te interesa? 😊`,
  PRE_RESERVA: (nombre: string, fecha: string, hora: string, profesor: string) =>
    `¡Hola ${nombre}! 🎉 Tu clase de prueba ha sido *pre-reservada*:\n\n📅 *Fecha:* ${fecha}\n⏰ *Hora:* ${hora}\n👩‍🏫 *Profesor/a:* ${profesor}\n\n*Tienes hasta las 20:00 de hoy para confirmar con el pago.* Después de eso, el cupo se libera automáticamente.\n\n¿Cómo prefieres pagar? 💳`,
  RECORDATORIO_PAGO: (nombre: string, monto: string) =>
    `Hola ${nombre} 👋 Tienes un pago pendiente de *${monto}* en Détaché. ¿Lo coordinamos? 😊`,
  CONFIRMACION: (nombre: string, fecha: string, hora: string) =>
    `¡Hola ${nombre}! ✅ Tu reserva está *confirmada*.\n📅 ${fecha} ⏰ ${hora}\n📍 *Dirección:* [Dirección academia]\n\n¡Te esperamos! 🎹`,
  LIBERACION_CUPO: (nombre: string) =>
    `Hola ${nombre}, lamentablemente tu cupo fue *liberado* al no registrarse el pago antes de las 20:00. 😕\n\nSi quieres reagendar, aquí estamos. 🙌`,
  SEGUIMIENTO: (nombre: string) =>
    `Hola ${nombre}! 👋 ¿Sigues interesado/a en clases en *Academia Détaché*? Seguimos con cupos disponibles. 😊`
};

// ─── LABELS / HELPERS ──────────────────────────────────────
export const serviceLabel: Record<LeadService, string> = {
  PIANO_NINOS: 'Piano Niños',
  PIANO_ADULTOS: 'Piano Adultos',
  CANTO: 'Canto',
  CLASE_GRUPAL: 'Clase Grupal',
  CLASE_PRUEBA: 'Clase de Prueba'
};

export const sourceLabel: Record<LeadSource, string> = {
  WEB: 'Web',
  WHATSAPP: 'WhatsApp',
  INSTAGRAM: 'Instagram',
  REFERIDO: 'Referido',
  GOOGLE: 'Google',
  OTRO: 'Otro'
};

export const statusLabel: Record<LeadStatus, string> = {
  NUEVO: 'Nuevo Lead',
  CONTACTADO: 'Contactado',
  SEGUIMIENTO: 'Seguimiento',
  PRE_RESERVA: 'Pre-Reserva',
  RESERVA_CONFIRMADA: 'Reserva Confirmada',
  CONCRETADO: 'Concretado',
  NO_CONCRETADO: 'No Concretado',
  SIN_RESPUESTA: 'Sin Respuesta',
  LISTA_ESPERA: 'Lista de Espera'
};
