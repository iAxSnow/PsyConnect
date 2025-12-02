// @/lib/types.ts
import type { Timestamp } from "firebase/firestore";

export interface Course {
  id: string;
  name: string; // Now represents a psychological specialty
}

export interface Session {
  id: string;
  tutorId: string; // Psychologist's UID
  studentId: string; // User's UID
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  course: string; // The specialty for the session
  createdAt: Timestamp;
  sessionDate?: Timestamp; // The scheduled date/time for the session, to be agreed upon in chat
  // Denormalized data for easier access
  tutor: Pick<User, 'name' | 'imageUrl' | 'email'>;
  student: Pick<User, 'name' | 'imageUrl' | 'age'>;
}

export interface SpecialtyRate {
    name: string;
    price: number;
}

export interface User {
  id: string; // Document ID from Firestore
  uid: string; // UID from Firebase Auth
  name: string;
  age: number;
  email: string;
  imageUrl: string; // Can be a generic avatar
  isTutor: boolean; // True if the user is a psychologist
  isDisabled?: boolean; // For banning users
  validationStatus?: 'pending' | 'approved' | 'rejected'; // For psychologist validation
  // Psychologist-specific fields (optional)
  rating?: number;
  reviews?: number;
  hourlyRate?: number; // Base rate or deprecated in favor of specialtyRates
  specialtyRates?: SpecialtyRate[]; // Array of specialties with their specific prices
  courses?: string[]; // Represents specialties (legacy, kept for compatibility but should map to specialtyRates names)
  bio?: string;
  professionalLink?: string;
}

export interface Report {
    id: string;
    reportedUserId: string;
    reportedUserName: string;
    reportedByUserId: string;
    reportedByUserName: string;
    reason: string;
    status: 'Pendiente' | 'En Revisión' | 'Resuelto' | 'Descartado';
    createdAt: Timestamp;
}

export interface Review {
  id: string;
  authorId: string;
  authorName: string;
  authorImageUrl: string;
  rating: number;
  comment: string;
  createdAt: Timestamp;
}
