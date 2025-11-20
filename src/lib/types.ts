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
  tutor: Pick<User, 'name' | 'imageUrl'>;
  student: Pick<User, 'name' | 'imageUrl' | 'age'>;
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
  hourlyRate?: number;
  courses?: string[]; // Represents specialties
  bio?: string;
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
