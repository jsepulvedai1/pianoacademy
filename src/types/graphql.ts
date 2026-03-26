/**
 * 🎻 Détaché - GraphQL Type Definitions
 * Matches the schema from the Django backend.
 */

export interface Specialty {
  id: string;
  name: string;
}

export interface Availability {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
}

export interface Teacher {
  id: string;
  name: string;
  description: string;
  photo: string | null;
  status: string;
  specialties: Specialty[];
  availabilities: Availability[];
}

export interface GetTeachersData {
  allTeachers: Teacher[];
}
