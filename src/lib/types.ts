export interface Course {
  id: string;
  name: string; // Now represents a psychological specialty
}

export interface Session {
  id: string;
  tutor: Pick<User, 'name' | 'imageUrl'>; // Represents the psychologist
  course: string; // The specialty for the session
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  studentId?: string; // Represents the anonymous user
  tutorId?: string; // Represents the psychologist
}

export interface User {
  id: string;
  uid: string;
  name: string; // Can be "Usuario Anónimo"
  email: string;
  imageUrl: string; // Can be a generic avatar
  isTutor: boolean; // True if the user is a psychologist
  // Psychologist-specific fields (optional)
  rating?: number;
  reviews?: number;
  hourlyRate?: number;
  courses?: string[]; // Represents specialties
  bio?: string;
}
