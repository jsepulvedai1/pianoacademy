import { Teacher, ClassType, ClassLevel, ClassModalality } from "@/types/domain";

export const TEACHERS: Teacher[] = [
  {
    id: "t1",
    firstName: "Alejandro",
    lastName: "García",
    bio: "Pianista clásico con más de 15 años de experiencia. Egresado del Conservatorio Nacional.",
    specialties: ["Piano Clásico", "Teoría Musical", "Lectura a primera vista"],
    availableModalities: ["IN_PERSON", "ONLINE"],
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alejandro"
  },
  {
    id: "t2",
    firstName: "Sofia",
    lastName: "Martínez",
    bio: "Especialista en Jazz y música contemporánea. Enfocada en la improvisación y creatividad.",
    specialties: ["Piano Jazz", "Improvisación", "Armonía Moderna"],
    availableModalities: ["ONLINE", "HYBRID"],
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia"
  },
  {
    id: "t3",
    firstName: "Carlos",
    lastName: "Ruiz",
    bio: "Profesor dedicado a la iniciación musical y niños. Método Suzuki certificado.",
    specialties: ["Iniciación Musical", "Método Suzuki", "Piano Pop"],
    availableModalities: ["IN_PERSON"],
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos"
  },
  {
    id: "t4",
    firstName: "Valentina",
    lastName: "Rojas",
    bio: "Pianista y compositora. Enfoque en creación de canciones y acompañamiento.",
    specialties: ["Composición", "Piano Pop", "Canto y Piano"],
    availableModalities: ["ONLINE", "IN_PERSON"],
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Valentina"
  },
  {
    id: "t5",
    firstName: "Gabriel",
    lastName: "Soto",
    bio: "Experto en música latina y ritmos afro-caribeños. Sabor y técnica.",
    specialties: ["Salsa", "Latin Jazz", "Montunos"],
    availableModalities: ["IN_PERSON"],
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Gabriel"
  },
  {
    id: "t6",
    firstName: "Isabella",
    lastName: "Fuentes",
    bio: "Especialista en preparación para exámenes y concursos internacionales.",
    specialties: ["Piano Clásico Avanzado", "Técnica Rusa", "Repertorio"],
    availableModalities: ["ONLINE", "HYBRID"],
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Isabella"
  },
  {
    id: "t7",
    firstName: "Matías",
    lastName: "Correa",
    bio: "Teclados y sintetizadores. Producción musical y diseño sonoro.",
    specialties: ["Sintetizadores", "Producción", "Teclados"],
    availableModalities: ["ONLINE"],
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Matias"
  }
];

export const CLASS_TYPES: ClassType[] = [
  {
    id: "c1",
    name: "Piano Clásico - Nivel Inicial",
    description: "Aprende las bases del piano clásico, postura, lectura y tus primeras obras.",
    durationMinutes: 45,
    price: 25000,
    currency: "CLP",
    allowedLevels: ["BEGINNER"],
    allowedModalities: ["IN_PERSON", "ONLINE"]
  },
  {
    id: "c2",
    name: "Piano Jazz & Improvisación",
    description: "Explora el mundo del Jazz, aprende escalas, acordes y a improvisar sobre estándares.",
    durationMinutes: 60,
    price: 35000,
    currency: "CLP",
    allowedLevels: ["INTERMEDIATE", "ADVANCED"],
    allowedModalities: ["ONLINE"]
  },
  {
    id: "c3",
    name: "Teoría y Solfeo",
    description: "Refuerza tus conocimientos musicales. Lectura rítmica, melódica y armonía básica.",
    durationMinutes: 60,
    price: 20000,
    currency: "CLP",
    allowedLevels: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
    allowedModalities: ["ONLINE"]
  },
  {
    id: "c4",
    name: "Masterclass de Interpretación",
    description: "Clase avanzada para perfeccionar técnica e interpretación de obras complejas.",
    durationMinutes: 90,
    price: 50000,
    currency: "CLP",
    allowedLevels: ["ADVANCED", "MASTER"],
    allowedModalities: ["IN_PERSON"]
  }
];
