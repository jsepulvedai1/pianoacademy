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

export interface Plan {
  id: string;
  name: string;
  price: string;
  duration: number;
  classesCount: number;
  isFeatured: boolean;
}

export interface GetPlansData {
  allPlans: Plan[];
}

export interface Material {
  id: string;
  title: string;
  type: string;
  url: string;
  createdAt: string;
}

export interface StudentPrivateNote {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

export interface StudentWallMessage {
  id: string;
  text: string;
  author: string;
  attachedMaterial: Material | null;
  createdAt: string;
}

export interface LandingPage {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  problem: string;
  solution: string;
  benefits: string[];
  imageUrl: string | null;
  cta: string;
}

export interface GetAllLandingPagesData {
  allLandingPages: LandingPage[];
}

export interface GetLandingPageBySlugData {
  landingPageBySlug: LandingPage | null;
}
